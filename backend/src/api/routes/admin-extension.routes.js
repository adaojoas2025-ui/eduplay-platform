/**
 * Admin extension routes
 * Central admin area for extension products such as BaixaTudo.
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');
const { USER_ROLES } = require('../../utils/constants');
const licenseService = require('../../services/license.service');
const emailService = require('../../services/email.service');
const logger = require('../../utils/logger');

const EXTENSIONS = {
  baixatudo: {
    id: 'baixatudo',
    name: 'BaixaTudo',
    licensePrefix: 'BT',
    product: 'baixatudo',
    publicPage: 'https://educaplayja.com.br/baixatudo',
    plans: [
      { id: 'monthly', label: 'Mensal', price: 9.99, days: 30 },
      { id: 'annual', label: 'Anual', price: 39.9, days: 365 },
    ],
  },
};

const DURATION_UNITS = {
  hours: { singular: 'hora', plural: 'horas', daysMultiplier: 1 / 24 },
  days: { singular: 'dia', plural: 'dias', daysMultiplier: 1 },
  months: { singular: 'mes', plural: 'meses', daysMultiplier: 30 },
  years: { singular: 'ano', plural: 'anos', daysMultiplier: 365 },
};

router.use(authenticate);
router.use(authorize(USER_ROLES.ADMIN));

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function resolveDuration(body) {
  const value = Number(body.durationValue ?? body.value ?? body.days ?? 30);
  const unit = String(body.durationUnit || body.unit || 'days').toLowerCase();
  const unitConfig = DURATION_UNITS[unit];

  if (!unitConfig) {
    const supportedUnits = Object.keys(DURATION_UNITS).join(', ');
    const error = new Error(`Unidade de prazo invalida. Use: ${supportedUnits}.`);
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isFinite(value) || value <= 0) {
    const error = new Error('Informe um prazo maior que zero.');
    error.statusCode = 400;
    throw error;
  }

  const days = Number((value * unitConfig.daysMultiplier).toFixed(4));
  if (days < 1 / 24) {
    const error = new Error('O prazo minimo para cortesia e de 1 hora.');
    error.statusCode = 400;
    throw error;
  }

  if (days > 3650) {
    const error = new Error('O prazo maximo para cortesia e de 10 anos.');
    error.statusCode = 400;
    throw error;
  }

  const label = `${value} ${value === 1 ? unitConfig.singular : unitConfig.plural}`;
  return { value, unit, days, label };
}

function getExtension(req, res) {
  const extension = EXTENSIONS[req.params.extensionId];
  if (!extension) {
    res.status(404).json({
      success: false,
      message: 'Extensao nao encontrada',
    });
    return null;
  }
  return extension;
}

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: Object.values(EXTENSIONS),
  });
});

router.get('/:extensionId', (req, res) => {
  const extension = getExtension(req, res);
  if (!extension) return;

  res.json({
    success: true,
    data: extension,
  });
});

router.post('/:extensionId/courtesy-licenses', async (req, res, next) => {
  try {
    const extension = getExtension(req, res);
    if (!extension) return;

    const email = normalizeEmail(req.body.email);
    const reason = String(req.body.reason || '').trim();
    const sendEmail = req.body.sendEmail !== false;
    const duration = resolveDuration(req.body);

    if (!isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Informe um email valido para receber a licenca.',
      });
    }

    if (reason.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Informe um motivo com pelo menos 5 caracteres.',
      });
    }

    const adminEmail = req.user?.email || 'admin';
    const adminId = req.user?.id || 'unknown';
    const notes = [
      'source:courtesy',
      `product:${extension.product}`,
      `admin:${adminEmail}`,
      `admin_id:${adminId}`,
      `duration:${duration.label}`,
      `reason:${reason}`,
    ].join(' | ');

    const license = await licenseService.renewLicense(email, duration.days, {
      prefix: extension.licensePrefix,
      notes,
    });

    let emailSent = false;
    let emailError = null;
    if (sendEmail) {
      try {
        await emailService.sendBaixaTudoLicenseEmail(
          email,
          license.licenseKey,
          license.expiresAt,
          `${extension.name} Pro Cortesia`
        );
        emailSent = true;
      } catch (mailError) {
        emailError = 'Licenca criada, mas o email automatico nao foi enviado agora.';
        logger.warn('Courtesy license email failed', {
          email,
          extension: extension.id,
          error: mailError.message,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: license.renewed
        ? 'Licenca cortesia renovada com sucesso.'
        : 'Licenca cortesia criada com sucesso.',
      data: {
        source: 'courtesy',
        extension: extension.id,
        product: extension.product,
        email,
        licenseKey: license.licenseKey,
        expiresAt: license.expiresAt,
        status: license.status || 'active',
        renewed: Boolean(license.renewed),
        emailSent,
        emailError,
        duration,
      },
    });
  } catch (error) {
    logger.error('Courtesy license generation failed', {
      extensionId: req.params.extensionId,
      adminEmail: req.user?.email,
      targetEmail: normalizeEmail(req.body?.email),
      durationValue: req.body?.durationValue ?? req.body?.value ?? req.body?.days,
      durationUnit: req.body?.durationUnit || req.body?.unit,
      error: error.message,
      stack: error.stack,
    });

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: `Erro ao gerar cortesia: ${error.message}`,
    });
  }
});

module.exports = router;
