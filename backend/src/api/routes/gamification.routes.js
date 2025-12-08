const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamification.controller');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

/**
 * Gamification Routes
 * All routes require authentication
 */

// ========================================
// PUBLIC/USER ROUTES
// ========================================

/**
 * @route   GET /api/gamification/profile
 * @desc    Get user's gamification profile
 * @access  Private
 */
router.get('/profile', authenticate, gamificationController.getProfile);

/**
 * @route   GET /api/gamification/points-history
 * @desc    Get user's points history
 * @access  Private
 */
router.get('/points-history', authenticate, gamificationController.getPointsHistory);

/**
 * @route   POST /api/gamification/streak
 * @desc    Update daily streak
 * @access  Private
 */
router.post('/streak', authenticate, gamificationController.updateStreak);

/**
 * @route   GET /api/gamification/leaderboard
 * @desc    Get leaderboard
 * @access  Public (shows user position if authenticated)
 */
router.get('/leaderboard', gamificationController.getLeaderboard);

/**
 * @route   GET /api/gamification/badges
 * @desc    Get all available badges
 * @access  Public
 */
router.get('/badges', gamificationController.getAllBadges);

/**
 * @route   GET /api/gamification/my-badges
 * @desc    Get user's earned badges
 * @access  Private
 */
router.get('/my-badges', authenticate, gamificationController.getUserBadges);

/**
 * @route   GET /api/gamification/missions
 * @desc    Get all active missions
 * @access  Public
 */
router.get('/missions', gamificationController.getAllMissions);

/**
 * @route   GET /api/gamification/my-missions
 * @desc    Get user's missions
 * @access  Private
 */
router.get('/my-missions', authenticate, gamificationController.getUserMissions);

/**
 * @route   POST /api/gamification/missions/:missionId/claim
 * @desc    Claim mission reward
 * @access  Private
 */
router.post('/missions/:missionId/claim', authenticate, gamificationController.claimMissionReward);

// ========================================
// ADMIN ROUTES
// ========================================

/**
 * @route   POST /api/gamification/admin/badges
 * @desc    Create a new badge
 * @access  Admin
 */
router.post('/admin/badges', authenticate, isAdmin, gamificationController.createBadge);

/**
 * @route   POST /api/gamification/admin/missions
 * @desc    Create a new mission
 * @access  Admin
 */
router.post('/admin/missions', authenticate, isAdmin, gamificationController.createMission);

/**
 * @route   PUT /api/gamification/admin/missions/:missionId
 * @desc    Update a mission
 * @access  Admin
 */
router.put('/admin/missions/:missionId', authenticate, isAdmin, gamificationController.updateMission);

/**
 * @route   DELETE /api/gamification/admin/missions/:missionId
 * @desc    Delete a mission
 * @access  Admin
 */
router.delete('/admin/missions/:missionId', authenticate, isAdmin, gamificationController.deleteMission);

/**
 * @route   GET /api/gamification/admin/stats
 * @desc    Get gamification statistics
 * @access  Admin
 */
router.get('/admin/stats', authenticate, isAdmin, gamificationController.getStats);

module.exports = router;
