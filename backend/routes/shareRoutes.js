const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const shareController = require('../controllers/shareController');

const router = express.Router();

router.use(authMiddleware);
router.get('/', shareController.listSharedNotes);
router.get('/:id', shareController.getSharedNote);
router.patch('/:id', shareController.updateSharedNote);

module.exports = router;
