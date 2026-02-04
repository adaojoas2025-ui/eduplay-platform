const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');
const mercadopago = require('../config/mercadopago');
const asaas = require('../config/asaas');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

// PIX key types
const PIX_KEY_TYPES = {
  CPF: 'CPF',
  CNPJ: 'CNPJ',
  EMAIL: 'EMAIL',
  PHONE: 'PHONE',
  RANDOM: 'RANDOM'
};

// Validate PIX key format
function validatePixKey(pixKey, pixKeyType) {
  switch (pixKeyType) {
    case PIX_KEY_TYPES.CPF:
      // CPF: 11 digits
      return /^\d{11}$/.test(pixKey.replace(/\D/g, ''));
    case PIX_KEY_TYPES.CNPJ:
      // CNPJ: 14 digits
      return /^\d{14}$/.test(pixKey.replace(/\D/g, ''));
    case PIX_KEY_TYPES.EMAIL:
      // Email format
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pixKey);
    case PIX_KEY_TYPES.PHONE:
      // Phone: +55 + DDD + number (11-12 digits total)
      const phoneDigits = pixKey.replace(/\D/g, '');
      return phoneDigits.length >= 10 && phoneDigits.length <= 13;
    case PIX_KEY_TYPES.RANDOM:
      // Random key: UUID format (32 hex chars with or without dashes)
      return /^[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}$/i.test(pixKey);
    default:
      return false;
  }
}

// Format PIX key for API
function formatPixKey(pixKey, pixKeyType) {
  switch (pixKeyType) {
    case PIX_KEY_TYPES.CPF:
    case PIX_KEY_TYPES.CNPJ:
      return pixKey.replace(/\D/g, '');
    case PIX_KEY_TYPES.PHONE:
      const digits = pixKey.replace(/\D/g, '');
      // Add +55 if not present
      return digits.startsWith('55') ? `+${digits}` : `+55${digits}`;
    default:
      return pixKey;
  }
}

// Save PIX key for a producer
async function savePixKey(userId, pixKey, pixKeyType, pixAccountHolder, pixBankName = null) {
  // Validate PIX key
  if (!validatePixKey(pixKey, pixKeyType)) {
    throw new Error(`Chave PIX inválida para o tipo ${pixKeyType}`);
  }

  // Format the key
  const formattedKey = formatPixKey(pixKey, pixKeyType);

  // Update user with PIX info
  const user = await prisma.users.update({
    where: { id: userId },
    data: {
      pixKey: formattedKey,
      pixKeyType,
      pixAccountHolder,
      pixBankName,
      pixAutoPaymentEnabled: true,
      pixVerifiedAt: new Date()
    }
  });

  return {
    pixKey: formattedKey,
    pixKeyType,
    pixAccountHolder,
    pixBankName,
    pixAutoPaymentEnabled: true
  };
}

// Get PIX configuration for a producer
async function getPixConfig(userId) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      pixKey: true,
      pixKeyType: true,
      pixAccountHolder: true,
      pixBankName: true,
      pixAutoPaymentEnabled: true,
      pixVerifiedAt: true
    }
  });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  return {
    pixKey: user.pixKey,
    pixKeyType: user.pixKeyType,
    pixAccountHolder: user.pixAccountHolder,
    pixBankName: user.pixBankName,
    pixAutoPaymentEnabled: user.pixAutoPaymentEnabled,
    pixVerifiedAt: user.pixVerifiedAt,
    isConfigured: !!(user.pixKey && user.pixKeyType && user.pixAccountHolder)
  };
}

// Disable automatic PIX payment
async function disablePixAutoPayment(userId) {
  await prisma.users.update({
    where: { id: userId },
    data: {
      pixAutoPaymentEnabled: false
    }
  });

  return { pixAutoPaymentEnabled: false };
}

// Enable automatic PIX payment
async function enablePixAutoPayment(userId) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { pixKey: true, pixKeyType: true, pixAccountHolder: true }
  });

  if (!user?.pixKey || !user?.pixKeyType || !user?.pixAccountHolder) {
    throw new Error('Configure sua chave PIX antes de habilitar o pagamento automático');
  }

  await prisma.users.update({
    where: { id: userId },
    data: {
      pixAutoPaymentEnabled: true
    }
  });

  return { pixAutoPaymentEnabled: true };
}

// Remove PIX configuration
async function removePixConfig(userId) {
  await prisma.users.update({
    where: { id: userId },
    data: {
      pixKey: null,
      pixKeyType: null,
      pixAccountHolder: null,
      pixBankName: null,
      pixAutoPaymentEnabled: false,
      pixVerifiedAt: null
    }
  });

  return { removed: true };
}

// Create a PIX transfer record
async function createPixTransferRecord(orderId, producerId, amount, pixKey, pixKeyType) {
  const transfer = await prisma.pix_transfers.create({
    data: {
      id: uuidv4(),
      orderId,
      producerId,
      amount,
      pixKey,
      pixKeyType,
      status: 'PENDING'
    }
  });

  return transfer;
}

// Execute PIX transfer via Mercado Pago
async function executePixTransfer(orderId) {
  // Get the transfer record
  const transfer = await prisma.pix_transfers.findFirst({
    where: { orderId, status: 'PENDING' },
    include: {
      producer: true,
      orders: true
    }
  });

  if (!transfer) {
    throw new Error('Registro de transferência não encontrado');
  }

  if (transfer.status !== 'PENDING') {
    throw new Error(`Transferência já está em status: ${transfer.status}`);
  }

  // Update status to processing
  await prisma.pix_transfers.update({
    where: { id: transfer.id },
    data: { status: 'PROCESSING' }
  });

  try {
    // Make the PIX transfer via Mercado Pago API
    const response = await fetch('https://api.mercadopago.com/v1/transaction_intents/process', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': transfer.id
      },
      body: JSON.stringify({
        external_reference: transfer.id,
        point_of_interaction: 'openplatform',
        seller_configuration: {
          notification_info: {
            notification_url: `${env.BASE_URL}/api/webhooks/pix-transfer`
          }
        },
        transaction: {
          from: {
            accounts: [{
              type: 'current'
            }]
          },
          to: {
            accounts: [{
              type: 'current',
              owner: {
                identification: {
                  type: transfer.pixKeyType === 'CPF' ? 'CPF' :
                        transfer.pixKeyType === 'CNPJ' ? 'CNPJ' : 'OTHER'
                }
              },
              pix: {
                key: {
                  type: transfer.pixKeyType.toLowerCase(),
                  id: transfer.pixKey
                }
              }
            }]
          },
          total_amount: transfer.amount,
          currency_id: 'BRL'
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao processar transferência PIX');
    }

    // Update transfer with Mercado Pago ID
    await prisma.pix_transfers.update({
      where: { id: transfer.id },
      data: {
        mercadopagoId: data.id,
        status: 'COMPLETED',
        processedAt: new Date()
      }
    });

    console.log(`PIX transfer completed for order ${orderId}: R$ ${transfer.amount}`);

    return {
      success: true,
      transferId: data.id,
      amount: transfer.amount
    };
  } catch (error) {
    console.error(`PIX transfer failed for order ${orderId}:`, error);

    // Update transfer with error
    await prisma.pix_transfers.update({
      where: { id: transfer.id },
      data: {
        status: 'FAILED',
        errorMessage: error.message
      }
    });

    throw error;
  }
}

// Process automatic PIX payment for an approved order
async function processAutomaticPixPayment(orderId) {
  const order = await prisma.orders.findUnique({
    where: { id: orderId },
    include: {
      product: {
        include: {
          producer: true
        }
      },
      pix_transfers: true
 }
  });

  if (!order) {
    console.log(`Order ${orderId} not found`);
    return null;
  }

  // Check if already has a completed transfer covering the full amount
  if (order.pix_transfers && order.pix_transfers.length > 0) {
    const totalTransferred = order.pix_transfers
      .filter(t => t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.amount, 0);
    if (totalTransferred >= order.producerAmount) {
      console.log(`Order ${orderId} already has PIX transfers covering full amount`);
      return order.pix_transfers[0];
    }
  }

  // Check if order is approved
  if (order.status !== 'APPROVED' && order.status !== 'COMPLETED') {
    console.log(`Order ${orderId} is not approved yet (status: ${order.status})`);
    return null;
  }

  // Check if product exists
  if (!order.product) {
    console.log(`Order ${orderId} has no product`);
    return null;
  }

  const producer = order.product.producer;

  // Check if producer has PIX configured and enabled
  if (!producer.pixKey || !producer.pixKeyType || !producer.pixAutoPaymentEnabled) {
    console.log(`Producer ${producer.id} does not have PIX auto-payment enabled`);
    return null;
  }

  // Calculate producer amount (already stored in order)
  const amount = order.producerAmount;

  if (amount <= 0) {
    console.log(`Order ${orderId} has no producer amount`);
    return null;
  }

  // Create transfer record
  const transfer = await createPixTransferRecord(
    orderId,
    producer.id,
    amount,
    producer.pixKey,
    producer.pixKeyType
  );

  console.log(`Created PIX transfer record for order ${orderId}: R$ ${amount}`);

  // Execute the transfer
  try {
    await executePixTransfer(orderId);
    return transfer;
  } catch (error) {
    console.error(`Failed to execute PIX transfer for order ${orderId}:`, error);
    return transfer;
  }
}

// Get transfer history for a producer
async function getTransferHistory(producerId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [transfers, total] = await Promise.all([
    prisma.pix_transfers.findMany({
      where: { producerId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        orders: {
          select: {
            id: true,
            amount: true,
            createdAt: true,
            product: {
              select: {
                title: true
              }
            }
          }
        }
      }
    }),
    prisma.pix_transfers.count({ where: { producerId } })
  ]);

  return {
    transfers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

// Get available balance for withdrawal (supports partial order consumption)
async function getAvailableBalance(producerId) {
  try {
    // Get all COMPLETED/APPROVED orders from this producer, including their transfers
    const allOrders = await prisma.orders.findMany({
      where: {
        product: {
          producerId: producerId
        },
        status: {
          in: ['COMPLETED', 'APPROVED']
        }
      },
      select: {
        id: true,
        producerAmount: true,
        createdAt: true,
        product: {
          select: {
            title: true
          }
        },
        pix_transfers: {
          where: {
            status: 'COMPLETED'
          },
          select: {
            amount: true
          }
        }
      }
    });

    // Calculate remaining balance per order
    const ordersWithBalance = [];
    let availableBalance = 0;

    for (const order of allOrders) {
      const totalWithdrawn = order.pix_transfers.reduce((sum, t) => sum + t.amount, 0);
      const remaining = (order.producerAmount || 0) - totalWithdrawn;

      if (remaining > 0.001) { // Small epsilon to avoid floating point issues
        const roundedRemaining = Math.round(remaining * 100) / 100;
        ordersWithBalance.push({
          id: order.id,
          producerAmount: roundedRemaining, // This is now the REMAINING amount
          originalAmount: order.producerAmount,
          createdAt: order.createdAt,
          product: order.product
        });
        availableBalance += roundedRemaining;
      }
    }

    availableBalance = Math.round(availableBalance * 100) / 100;

    return {
      availableBalance,
      pendingOrders: ordersWithBalance.length,
      orders: ordersWithBalance
    };
  } catch (error) {
    console.error('Error getting available balance:', error);
    return {
      availableBalance: 0,
      pendingOrders: 0,
      orders: []
    };
  }
}

// Request withdrawal - creates PIX transfers for pending orders
// If amount is specified, withdraw that exact amount (with partial order consumption)
async function requestWithdrawal(producerId, requestedAmount = null) {
  logger.info('=== WITHDRAWAL REQUEST v4 - Exact amount withdrawal ===', { producerId, requestedAmount });

  // Get user's PIX config
  const user = await prisma.users.findUnique({
    where: { id: producerId },
    select: {
      pixKey: true,
      pixKeyType: true,
      pixAccountHolder: true,
      pixBankName: true
    }
  });

  if (!user?.pixKey || !user?.pixKeyType || !user?.pixAccountHolder) {
    throw new Error('Configure sua chave PIX antes de solicitar saque');
  }

  // Get available balance (orders now have remaining amounts after partial withdrawals)
  const { availableBalance, orders } = await getAvailableBalance(producerId);

  if (availableBalance <= 0) {
    throw new Error('Não há saldo disponível para saque');
  }

  // Determine withdrawal amount
  let withdrawalAmount = requestedAmount || availableBalance;

  // Validate requested amount
  if (requestedAmount) {
    if (requestedAmount <= 0) {
      throw new Error('Valor de saque deve ser maior que zero');
    }
    if (requestedAmount > availableBalance + 0.01) { // Small epsilon for floating point
      throw new Error(`Valor solicitado (R$ ${requestedAmount.toFixed(2)}) é maior que o saldo disponível (R$ ${availableBalance.toFixed(2)})`);
    }
    if (requestedAmount < 1) {
      throw new Error('Valor mínimo para saque é R$ 1,00');
    }
  }

  // Round to avoid floating point issues
  withdrawalAmount = Math.round(withdrawalAmount * 100) / 100;

  // Select orders for withdrawal with partial consumption support
  // orders[].producerAmount here is the REMAINING balance of each order
  const sortedOrders = [...orders].sort((a, b) => a.producerAmount - b.producerAmount);

  let remaining = withdrawalAmount;
  const orderConsumptions = []; // { order, consumeAmount }

  for (const order of sortedOrders) {
    if (remaining <= 0.001) break;

    const consumeAmount = Math.min(order.producerAmount, remaining);
    const roundedConsume = Math.round(consumeAmount * 100) / 100;

    if (roundedConsume > 0) {
      orderConsumptions.push({ order, consumeAmount: roundedConsume });
      remaining = Math.round((remaining - roundedConsume) * 100) / 100;
    }
  }

  if (orderConsumptions.length === 0) {
    throw new Error('Não há vendas disponíveis para saque');
  }

  const selectedAmount = orderConsumptions.reduce((sum, oc) => sum + oc.consumeAmount, 0);
  const roundedSelectedAmount = Math.round(selectedAmount * 100) / 100;

  logger.info(`Selected ${orderConsumptions.length} orders for withdrawal: R$ ${roundedSelectedAmount.toFixed(2)}`, {
    producerId,
    details: orderConsumptions.map(oc => ({ orderId: oc.order.id, amount: oc.consumeAmount }))
  });

  // Create PIX transfer records (one per consumed order, with exact consumed amount)
  const transfers = [];
  for (const { order, consumeAmount } of orderConsumptions) {
    const transfer = await prisma.pix_transfers.create({
      data: {
        id: uuidv4(),
        orderId: order.id,
        producerId,
        amount: consumeAmount,
        pixKey: user.pixKey,
        pixKeyType: user.pixKeyType,
        status: 'PENDING'
      }
    });
    transfers.push(transfer);
  }

  logger.info(`Created ${transfers.length} PIX transfer records for producer ${producerId}, total: R$ ${roundedSelectedAmount.toFixed(2)}`);

  // Try to execute actual PIX transfer via Asaas
  let pixPayoutResult = null;
  let simulatedTransfer = false;

  // Check if Asaas is configured
  if (!asaas.isConfigured()) {
    logger.warn('Asaas not configured, marking transfer as pending manual processing', { producerId });
    simulatedTransfer = true;

    // Mark all transfers as COMPLETED (admin will need to manually transfer)
    for (const transfer of transfers) {
      await prisma.pix_transfers.update({
        where: { id: transfer.id },
        data: {
          status: 'COMPLETED',
          errorMessage: 'Asaas não configurado - transferência manual necessária',
          processedAt: new Date()
        }
      });
    }
  } else {
    try {
      // Create PIX transfer via Asaas - sends the EXACT requested amount
      const externalReference = `withdrawal-${producerId}-${Date.now()}`;

      pixPayoutResult = await asaas.createPixTransfer({
        amount: roundedSelectedAmount,
        pixKey: user.pixKey,
        pixKeyType: user.pixKeyType,
        description: `Saque EducaplayJA - ${transfers.length} venda(s)`,
        externalReference
      });

      logger.info('Asaas PIX transfer executed successfully', {
        producerId,
        amount: roundedSelectedAmount,
        asaasId: pixPayoutResult?.id,
        status: pixPayoutResult?.status
      });

      // Mark all transfers as COMPLETED with Asaas ID
      for (const transfer of transfers) {
        await prisma.pix_transfers.update({
          where: { id: transfer.id },
          data: {
            status: 'COMPLETED',
            mercadopagoId: pixPayoutResult?.id, // Reusing field for Asaas ID
            processedAt: new Date()
          }
        });
      }
    } catch (error) {
      logger.error('Asaas PIX transfer failed', {
        producerId,
        amount: roundedSelectedAmount,
        error: error.message
      });

      // Mark all transfers as FAILED
      for (const transfer of transfers) {
        await prisma.pix_transfers.update({
          where: { id: transfer.id },
          data: {
            status: 'FAILED',
            errorMessage: error.message || 'Erro ao processar transferência PIX'
          }
        });
      }

      // Throw the error to show user-friendly message
      throw error;
    }
  }

  return {
    success: true,
    totalAmount: roundedSelectedAmount,
    transferCount: transfers.length,
    remainingBalance: Math.round((availableBalance - roundedSelectedAmount) * 100) / 100,
    pixKey: user.pixKey,
    pixKeyType: user.pixKeyType,
    pixAccountHolder: user.pixAccountHolder,
    asaasId: pixPayoutResult?.id,
    simulatedTransfer,
    message: simulatedTransfer
      ? 'Saque registrado! A transferência será processada manualmente pelo administrador.'
      : 'Saque realizado com sucesso via PIX!'
  };
}

// Get transfer statistics for a producer
async function getTransferStats(producerId) {
  const stats = await prisma.pix_transfers.groupBy({
    by: ['status'],
    where: { producerId },
    _sum: { amount: true },
    _count: true
  });

  const result = {
    total: 0,
    totalAmount: 0,
    completed: 0,
    completedAmount: 0,
    pending: 0,
    pendingAmount: 0,
    failed: 0,
    failedAmount: 0
  };

  stats.forEach(stat => {
    result.total += stat._count;
    result.totalAmount += stat._sum.amount || 0;

    switch (stat.status) {
      case 'COMPLETED':
        result.completed = stat._count;
        result.completedAmount = stat._sum.amount || 0;
        break;
      case 'PENDING':
      case 'PROCESSING':
        result.pending += stat._count;
        result.pendingAmount += stat._sum.amount || 0;
        break;
      case 'FAILED':
        result.failed = stat._count;
        result.failedAmount = stat._sum.amount || 0;
        break;
    }
  });

  return result;
}

// Restore balance by deleting recent PIX transfers (for testing)
async function restoreBalance(producerId) {
  // Find recent transfers for this producer
  const transfers = await prisma.pix_transfers.findMany({
    where: { producerId },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  if (transfers.length === 0) {
    return {
      deletedCount: 0,
      restoredAmount: 0,
      message: 'Nenhuma transferência encontrada'
    };
  }

  // Delete all recent transfers to restore balance
  let restoredAmount = 0;
  let deletedCount = 0;

  for (const transfer of transfers) {
    await prisma.pix_transfers.delete({
      where: { id: transfer.id }
    });
    restoredAmount += transfer.amount;
    deletedCount++;
  }

  logger.info('Balance restored', {
    producerId,
    deletedCount,
    restoredAmount
  });

  return {
    deletedCount,
    restoredAmount,
    message: `${deletedCount} transferência(s) deletada(s), R$ ${restoredAmount.toFixed(2)} restaurado`
  };
}

module.exports = {
  PIX_KEY_TYPES,
  validatePixKey,
  formatPixKey,
  savePixKey,
  getPixConfig,
  disablePixAutoPayment,
  enablePixAutoPayment,
  removePixConfig,
  createPixTransferRecord,
  executePixTransfer,
  processAutomaticPixPayment,
  getTransferHistory,
  getTransferStats,
  getAvailableBalance,
  requestWithdrawal,
  restoreBalance
};
