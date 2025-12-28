const express = require('express');
const router = express.Router();
const appController = require('../controllers/app.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');
const { USER_ROLES } = require('../../utils/constants');

// Public routes
router.get('/', appController.listApps);
router.get('/:id', appController.getApp);
router.get('/:id/download', appController.downloadApp);

// Authenticated routes
router.post('/:id/review', authenticate, appController.addReview);
router.post('/:id/purchase', authenticate, appController.purchaseApp);

// Admin routes
router.get('/admin/all', authenticate, authorize(USER_ROLES.ADMIN), appController.listAllApps);
router.post('/', authenticate, authorize(USER_ROLES.ADMIN), appController.createApp);
router.put('/:id', authenticate, authorize(USER_ROLES.ADMIN), appController.updateApp);
router.delete('/:id', authenticate, authorize(USER_ROLES.ADMIN), appController.deleteApp);
router.post('/:id/publish', authenticate, authorize(USER_ROLES.ADMIN), appController.publishApp);
router.post('/:id/archive', authenticate, authorize(USER_ROLES.ADMIN), appController.archiveApp);

module.exports = router;
