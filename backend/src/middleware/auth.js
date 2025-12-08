const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');

/**
 * Verify JWT token and authenticate user
 */
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'Conta suspensa' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(403).json({ error: 'Token inválido' });
  }
}

/**
 * Check if user has required role
 */
function authorizeRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Acesso negado. Permissão insuficiente.'
      });
    }

    next();
  };
}

/**
 * Check if user is approved (for producers)
 */
function requireApproved(req, res, next) {
  if (req.user.role === 'PRODUCER' && req.user.status !== 'APPROVED') {
    return res.status(403).json({
      error: 'Sua conta de produtor ainda não foi aprovada'
    });
  }
  next();
}

module.exports = {
  authenticateToken,
  authorizeRole,
  requireApproved,
};
