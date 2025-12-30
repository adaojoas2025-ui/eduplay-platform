const appService = require('../../services/app.service');
const asyncHandler = require('../../utils/asyncHandler');
const { APP_VERSION } = require('../../constants/app.constants');

// Public: List all published apps
const listApps = asyncHandler(async (req, res) => {
  const {
    page,
    limit,
    search,
    category,
    minRating,
    sortBy,
    order,
  } = req.query;

  const filters = {
    search,
    category,
    minRating,
  };

  const pagination = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    sortBy: sortBy || 'downloads',
    order: order || 'desc',
  };

  const result = await appService.listApps(filters, pagination);

  res.json({
    success: true,
    data: result,
  });
});

// Admin: List all apps (including drafts)
const listAllApps = asyncHandler(async (req, res) => {
  const {
    page,
    limit,
    search,
    category,
    status,
    sortBy,
    order,
  } = req.query;

  const filters = {
    search,
    category,
    status,
    includeAll: true,
  };

  const pagination = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 50,
    sortBy: sortBy || 'createdAt',
    order: order || 'desc',
  };

  const result = await appService.listApps(filters, pagination);

  res.json({
    success: true,
    data: result,
  });
});

// Public: Get app by ID or slug
const getApp = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let app;
  // Check if ID is a UUID or slug
  if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    app = await appService.getAppById(id);
  } else {
    app = await appService.getAppBySlug(id);
  }

  res.json({
    success: true,
    data: app,
  });
});

// Admin: Create new app
const createApp = asyncHandler(async (req, res) => {
  const appData = req.body;

  const app = await appService.createApp(appData);

  res.status(201).json({
    success: true,
    message: 'App created successfully',
    data: app,
  });
});

// Admin: Update app
const updateApp = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Remover campos de relação e campos gerados automaticamente que não podem ser atualizados
  const {
    id: appId,
    reviews,
    createdAt,
    updatedAt,
    downloads,
    rating,
    totalRatings,
    lastUpdate,
    slug,
    ...cleanUpdateData
  } = updateData;

  const app = await appService.updateApp(id, cleanUpdateData);

  res.json({
    success: true,
    message: 'App updated successfully',
    data: app,
  });
});

// Admin: Delete app
const deleteApp = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await appService.deleteApp(id);

  res.json({
    success: true,
    message: 'App deleted successfully',
  });
});

// Admin: Publish app
const publishApp = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const app = await appService.publishApp(id);

  res.json({
    success: true,
    message: 'App published successfully',
    data: app,
  });
});

// Admin: Archive app
const archiveApp = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const app = await appService.archiveApp(id);

  res.json({
    success: true,
    message: 'App archived successfully',
    data: app,
  });
});

// Public: Download app
const downloadApp = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { version } = req.query; // FREE_WITH_ADS or PAID_NO_ADS
  const userId = req.user?.id || null;

  if (!version || !Object.values(APP_VERSION).includes(version)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid version. Must be FREE_WITH_ADS or PAID_NO_ADS',
    });
  }

  const result = await appService.downloadApp(id, version, userId);

  res.json({
    success: true,
    message: 'Download link generated',
    data: {
      downloadUrl: result.downloadUrl,
      app: {
        id: result.app.id,
        title: result.app.title,
        version: result.app.version,
        fileSize: result.app.fileSize,
      },
    },
  });
});

// Public: Add review
const addReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'You must be logged in to leave a review',
    });
  }

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be between 1 and 5',
    });
  }

  const review = await appService.addReview(
    id,
    user.id,
    user.name,
    rating,
    comment,
    user.avatar
  );

  res.status(201).json({
    success: true,
    message: 'Review added successfully',
    data: review,
  });
});

// User: Purchase paid app version
const purchaseApp = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { version, price } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'You must be logged in to purchase an app',
    });
  }

  if (version !== 'PAID_NO_ADS') {
    return res.status(400).json({
      success: false,
      message: 'Invalid version for purchase',
    });
  }

  const result = await appService.purchaseApp(id, user.id, version, price);

  res.status(201).json({
    success: true,
    message: 'Purchase order created successfully',
    data: {
      orderId: result.order.id,
      initPoint: result.initPoint,
      status: result.order.status,
    },
  });
});

module.exports = {
  listApps,
  listAllApps,
  getApp,
  createApp,
  updateApp,
  deleteApp,
  publishApp,
  archiveApp,
  downloadApp,
  addReview,
  purchaseApp,
};
