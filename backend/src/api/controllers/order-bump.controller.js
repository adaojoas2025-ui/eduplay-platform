const orderBumpService = require('../services/order-bump.service');
const logger = require('../../utils/logger');

class OrderBumpController {
  // GET /order-bumps/suggestions
  async getSuggestions(req, res) {
    try {
      const { productIds, category } = req.query;

      const suggestions = await orderBumpService.getSuggestions({
        productIds: productIds ? productIds.split(',') : [],
        category,
        limit: 3
      });

      return res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      logger.error('Error getting bump suggestions:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar sugestões'
      });
    }
  }

  // POST /order-bumps/:id/track
  async trackEvent(req, res) {
    try {
      const { id } = req.params;
      const { event } = req.body; // 'impression', 'click', 'conversion'

      await orderBumpService.trackEvent(id, event);

      return res.json({ success: true });
    } catch (error) {
      logger.error('Error tracking bump event:', error);
      return res.status(500).json({ success: false });
    }
  }

  // CRUD para produtores gerenciarem seus bumps

  // POST /order-bumps (PRODUCER only)
  async create(req, res) {
    try {
      const producerId = req.user.id;
      const bumpData = { ...req.body, producerId };

      const bump = await orderBumpService.create(bumpData);

      return res.status(201).json({
        success: true,
        data: bump
      });
    } catch (error) {
      logger.error('Error creating order bump:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /order-bumps/my-bumps (PRODUCER)
  async getMyBumps(req, res) {
    try {
      const producerId = req.user.id;
      const bumps = await orderBumpService.findByProducer(producerId);

      return res.json({
        success: true,
        data: bumps
      });
    } catch (error) {
      logger.error('Error fetching producer bumps:', error);
      return res.status(500).json({ success: false });
    }
  }

  // PUT /order-bumps/:id (PRODUCER)
  async update(req, res) {
    try {
      const { id } = req.params;
      const producerId = req.user.id;

      const bump = await orderBumpService.update(id, producerId, req.body);

      return res.json({
        success: true,
        data: bump
      });
    } catch (error) {
      logger.error('Error updating order bump:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // DELETE /order-bumps/:id (PRODUCER)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const producerId = req.user.id;

      await orderBumpService.delete(id, producerId);

      return res.json({ success: true });
    } catch (error) {
      logger.error('Error deleting order bump:', error);
      return res.status(500).json({ success: false });
    }
  }

  // GET /order-bumps/:id (PRODUCER)
  async getById(req, res) {
    try {
      const { id } = req.params;
      const producerId = req.user.id;

      const bump = await orderBumpService.findById(id, producerId);

      if (!bump) {
        return res.status(404).json({
          success: false,
          message: 'Order bump não encontrado'
        });
      }

      return res.json({
        success: true,
        data: bump
      });
    } catch (error) {
      logger.error('Error fetching order bump:', error);
      return res.status(500).json({ success: false });
    }
  }
}

module.exports = new OrderBumpController();
