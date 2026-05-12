/**
 * IRP Master Automação — License Routes
 * Public routes — no JWT required (licenseKey + deviceId are the auth).
 */

const express = require('express');
const router = express.Router();
const { activate, validate, heartbeat, logout } = require('../controllers/licenseController');

router.post('/activate',  activate);
router.post('/validate',  validate);
router.post('/heartbeat', heartbeat);
router.post('/logout',    logout);

module.exports = router;
