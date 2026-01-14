const express = require('express');
const router = express.Router();
const orderBumpController = require('../controllers/orderBumpController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Rotas públicas (para checkout)
router.get('/suggestions', orderBumpController.getSuggestions);
router.post('/:id/track', orderBumpController.trackEvent);

// Rotas protegidas (PRODUCER e ADMIN)
router.post('/', authMiddleware, roleMiddleware(['PRODUCER', 'ADMIN']), orderBumpController.create);
router.get('/my-bumps', authMiddleware, roleMiddleware(['PRODUCER', 'ADMIN']), orderBumpController.getMyBumps);
router.get('/:id', authMiddleware, roleMiddleware(['PRODUCER', 'ADMIN']), orderBumpController.getById);
router.put('/:id', authMiddleware, roleMiddleware(['PRODUCER', 'ADMIN']), orderBumpController.update);
router.delete('/:id', authMiddleware, roleMiddleware(['PRODUCER', 'ADMIN']), orderBumpController.delete);

module.exports = router;
