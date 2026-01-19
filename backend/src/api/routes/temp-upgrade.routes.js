/**
 * TEMPORARY Route - Remove after deployment
 * This is a temporary route to allow users to upgrade to PRODUCER
 */

const express = require('express');
const router = express.Router();
const { prisma } = require('../../config/database');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * @route   POST /api/v1/temp-upgrade
 * @desc    Temporary endpoint to upgrade user to PRODUCER by email
 * @access  Public (TEMPORARY - REMOVE AFTER USE)
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { email, role } = req.body;

    if (!email) {
      return ApiResponse.error(res, 400, 'Email is required');
    }

    // Determine target role (default to PRODUCER, allow ADMIN)
    const targetRole = role === 'ADMIN' ? 'ADMIN' : 'PRODUCER';

    // Find user
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return ApiResponse.error(res, 404, 'User not found');
    }

    if (user.role === targetRole) {
      return ApiResponse.success(res, 200, user, `User is already a ${targetRole}`);
    }

    // Update user to target role
    const updatedUser = await prisma.users.update({
      where: { email },
      data: { role: targetRole },
    });

    // Remove password from response
    delete updatedUser.password;

    return ApiResponse.success(
      res,
      200,
      updatedUser,
      `User upgraded to ${targetRole} successfully`
    );
  })
);

/**
 * @route   POST /api/v1/temp-upgrade/admin
 * @desc    Temporary endpoint to upgrade user to ADMIN by email
 * @access  Public (TEMPORARY - REMOVE AFTER USE)
 */
router.post(
  '/admin',
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return ApiResponse.error(res, 400, 'Email is required');
    }

    // Find user
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return ApiResponse.error(res, 404, 'User not found');
    }

    if (user.role === 'ADMIN') {
      return ApiResponse.success(res, 200, user, 'User is already an ADMIN');
    }

    // Update user to ADMIN
    const updatedUser = await prisma.users.update({
      where: { email },
      data: { role: 'ADMIN' },
    });

    // Remove password from response
    delete updatedUser.password;

    return ApiResponse.success(
      res,
      200,
      updatedUser,
      'User upgraded to ADMIN successfully'
    );
  })
);

module.exports = router;
