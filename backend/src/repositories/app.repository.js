const { prisma } = require('../config/database');
const logger = require('../utils/logger');

const createApp = async (appData) => {
  try {
    return await prisma.app.create({
      data: appData,
    });
  } catch (error) {
    logger.error('Error creating app:', error);
    throw error;
  }
};

const findAppById = async (appId) => {
  try {
    return await prisma.app.findUnique({
      where: { id: appId },
      include: {
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  } catch (error) {
    logger.error('Error finding app by ID:', error);
    throw error;
  }
};

const findAppBySlug = async (slug) => {
  try {
    return await prisma.app.findUnique({
      where: { slug },
      include: {
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  } catch (error) {
    logger.error('Error finding app by slug:', error);
    throw error;
  }
};

const findAllApps = async (filters = {}, pagination = {}) => {
  try {
    const {
      search,
      category,
      status,
      featured,
      minRating,
    } = filters;

    const {
      page = 1,
      limit = 20,
      sortBy = 'downloads',
      order = 'desc',
    } = pagination;

    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { developer: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (featured !== undefined) {
      where.featured = featured;
    }

    if (minRating !== undefined) {
      where.rating = { gte: parseFloat(minRating) };
    }

    const [apps, total] = await Promise.all([
      prisma.app.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: {
          _count: {
            select: { reviews: true },
          },
        },
      }),
      prisma.app.count({ where }),
    ]);

    return {
      items: apps,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error finding apps:', error);
    throw error;
  }
};

const updateApp = async (appId, updateData) => {
  try {
    return await prisma.app.update({
      where: { id: appId },
      data: updateData,
    });
  } catch (error) {
    logger.error('Error updating app:', error);
    throw error;
  }
};

const deleteApp = async (appId) => {
  try {
    return await prisma.app.delete({
      where: { id: appId },
    });
  } catch (error) {
    logger.error('Error deleting app:', error);
    throw error;
  }
};

const incrementDownloads = async (appId) => {
  try {
    return await prisma.app.update({
      where: { id: appId },
      data: {
        downloads: { increment: 1 },
      },
    });
  } catch (error) {
    logger.error('Error incrementing downloads:', error);
    throw error;
  }
};

const createAppReview = async (reviewData) => {
  try {
    const review = await prisma.appReview.create({
      data: reviewData,
    });

    // Update app rating
    const reviews = await prisma.appReview.findMany({
      where: { appId: reviewData.appId },
      select: { rating: true },
    });

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.app.update({
      where: { id: reviewData.appId },
      data: {
        rating: avgRating,
        totalRatings: reviews.length,
      },
    });

    return review;
  } catch (error) {
    logger.error('Error creating app review:', error);
    throw error;
  }
};

const recordDownload = async (downloadData) => {
  try {
    return await prisma.appDownload.create({
      data: downloadData,
    });
  } catch (error) {
    logger.error('Error recording download:', error);
    throw error;
  }
};

module.exports = {
  createApp,
  findAppById,
  findAppBySlug,
  findAllApps,
  updateApp,
  deleteApp,
  incrementDownloads,
  createAppReview,
  recordDownload,
};
