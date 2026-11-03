const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const noteController = require('../controllers/noteController');
const importController = require('../controllers/importController');
const shareController = require('../controllers/shareController');

const router = express.Router();

router.use(authMiddleware);
router.get('/', noteController.listNotes);
router.post('/', noteController.createNote);
router.post('/import', importController.importFile);
router.get('/:id/shares', shareController.listShares);
router.post('/:id/shares', shareController.createShare);
router.patch('/:id/shares/:shareId', shareController.updateShare);
router.delete('/:id/shares/:shareId', shareController.deleteShare);
router.get('/:id', noteController.getNote);
router.put('/:id', noteController.updateNote);
router.patch('/:id', noteController.updateNote);
router.delete('/:id', noteController.deleteNote);

module.exports = router;
