const appRepository = require('../repositories/app.repository');
const { APP_STATUS } = require('../constants/app.constants');
const logger = require('../utils/logger');

const createApp = async (appData) => {
  try {
    // Generate slug from title
    const slug = appData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const app = await appRepository.createApp({
      ...appData,
      slug,
      status: 'PUBLISHED', // Auto-publish apps created by admin
    });

    logger.info('App created', { appId: app.id, title: app.title });
    return app;
  } catch (error) {
    logger.error('Error in createApp service:', error);
    throw error;
  }
};

const getAppById = async (appId) => {
  try {
    const app = await appRepository.findAppById(appId);
    if (!app) {
      throw new Error('App not found');
    }
    return app;
  } catch (error) {
    logger.error('Error in getAppById service:', error);
    throw error;
  }
};

const getAppBySlug = async (slug) => {
  try {
    const app = await appRepository.findAppBySlug(slug);
    if (!app) {
      throw new Error('App not found');
    }
    return app;
  } catch (error) {
    logger.error('Error in getAppBySlug service:', error);
    throw error;
  }
};

const listApps = async (filters, pagination) => {
  try {
    // Public listing should only show published apps
    if (!filters.includeAll) {
      filters.status = APP_STATUS.PUBLISHED;
    }

    const result = await appRepository.findAllApps(filters, pagination);
    logger.info('Apps listed', { count: result.items.length, total: result.pagination.total });
    return result;
  } catch (error) {
    logger.error('Error in listApps service:', error);
    throw error;
  }
};

const updateApp = async (appId, updateData) => {
  try {
    const app = await appRepository.findAppById(appId);
    if (!app) {
      throw new Error('App not found');
    }

    // Update slug if title changed
    if (updateData.title && updateData.title !== app.title) {
      updateData.slug = updateData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const updatedApp = await appRepository.updateApp(appId, updateData);
    logger.info('App updated', { appId });
    return updatedApp;
  } catch (error) {
    logger.error('Error in updateApp service:', error);
    throw error;
  }
};

const deleteApp = async (appId) => {
  try {
    const app = await appRepository.findAppById(appId);
    if (!app) {
      throw new Error('App not found');
    }

    await appRepository.deleteApp(appId);
    logger.info('App deleted', { appId });
  } catch (error) {
    logger.error('Error in deleteApp service:', error);
    throw error;
  }
};

const publishApp = async (appId) => {
  try {
    const app = await appRepository.findAppById(appId);
    if (!app) {
      throw new Error('App not found');
    }

    const updatedApp = await appRepository.updateApp(appId, {
      status: APP_STATUS.PUBLISHED,
    });

    logger.info('App published', { appId });
    return updatedApp;
  } catch (error) {
    logger.error('Error in publishApp service:', error);
    throw error;
  }
};

const archiveApp = async (appId) => {
  try {
    const app = await appRepository.findAppById(appId);
    if (!app) {
      throw new Error('App not found');
    }

    const updatedApp = await appRepository.updateApp(appId, {
      status: APP_STATUS.ARCHIVED,
    });

    logger.info('App archived', { appId });
    return updatedApp;
  } catch (error) {
    logger.error('Error in archiveApp service:', error);
    throw error;
  }
};

const downloadApp = async (appId, version, userId = null) => {
  try {
    const app = await appRepository.findAppById(appId);
    if (!app) {
      throw new Error('App not found');
    }

    if (app.status !== APP_STATUS.PUBLISHED) {
      throw new Error('App is not available for download');
    }

    // Record download
    await appRepository.recordDownload({
      appId,
      version,
      userId,
    });

    // Increment downloads counter
    await appRepository.incrementDownloads(appId);

    // Return download URL based on version
    const downloadUrl = version === 'FREE_WITH_ADS' ? app.freeWithAdsUrl : app.paidNoAdsUrl;

    logger.info('App download initiated', { appId, version, userId });
    return { downloadUrl, app };
  } catch (error) {
    logger.error('Error in downloadApp service:', error);
    throw error;
  }
};

const addReview = async (appId, userId, userName, rating, comment, userAvatar = null) => {
  try {
    const app = await appRepository.findAppById(appId);
    if (!app) {
      throw new Error('App not found');
    }

    const review = await appRepository.createAppReview({
      appId,
      userId,
      userName,
      userAvatar,
      rating,
      comment,
    });

    logger.info('App review added', { appId, userId, rating });
    return review;
  } catch (error) {
    logger.error('Error in addReview service:', error);
    throw error;
  }
};

const purchaseApp = async (appId, userId, version, price) => {
  try {
    const orderRepository = require('../repositories/order.repository');
    const userRepository = require('../repositories/user.repository');

    // Get app details
    const app = await appRepository.findAppById(appId);
    if (!app) {
      throw new Error('App not found');
    }

    // Validate if paid version is active
    if (!app.paidNoAdsActive) {
      throw new Error('Paid version not available for this app');
    }

    // Validate price
    if (price !== app.paidNoAdsPrice) {
      throw new Error('Invalid price');
    }

    // Get user details
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Create order for app purchase (same as products - payment will be done via test payment)
    // NOTE: App purchases don't have commissions - 100% revenue goes to administrator
    const order = await orderRepository.createOrder({
      buyerId: userId,
      productId: null, // App purchases don't use productId
      amount: price,
      platformFee: 0, // No fee - full amount goes to platform/admin
      producerAmount: 0, // No producer for app sales
      status: 'PENDING',
      paymentMethod: 'INSTANT_TEST', // Use test payment like products
      metadata: {
        appId: app.id,
        appTitle: app.title,
        appSlug: app.slug,
        version: version,
        type: 'APP_PURCHASE', // Critical: identifies this as app purchase (no commissions)
      },
    });

    logger.info('App purchase order created (test payment mode)', {
      appId: app.id,
      orderId: order.id,
      userId: user.id,
      price,
    });

    return {
      order,
      // No initPoint - will use test payment approval like products
    };
  } catch (error) {
    logger.error('Error in purchaseApp service:', error);
    throw error;
  }
};

module.exports = {
  createApp,
  getAppById,
  getAppBySlug,
  listApps,
  updateApp,
  deleteApp,
  publishApp,
  archiveApp,
  downloadApp,
  addReview,
  purchaseApp,
};



