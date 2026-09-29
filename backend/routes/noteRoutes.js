const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const noteController = require('../controllers/noteController');

const router = express.Router();

router.use(authMiddleware);
router.get('/', noteController.listNotes);
router.post('/', noteController.createNote);
router.get('/:id', noteController.getNote);
router.put('/:id', noteController.updateNote);
router.patch('/:id', noteController.updateNote);
router.delete('/:id', noteController.deleteNote);

module.exports = router;
