const express = require('express');
const router = express.Router();
const booksCtrl = require('../controllers/books')
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config');
const resizeImages = require('../middleware/resizeImages');

router.post('/', auth, multer, resizeImages, booksCtrl.createBooks); 
router.get('/', booksCtrl.getBooks );
router.get('/bestrating', booksCtrl.getBestRatedBooks);
router.get('/:id', booksCtrl.getBookById);
router.put('/:id', auth, multer, resizeImages, booksCtrl.updateBookById);
router.delete('/:id', auth, booksCtrl.deleteBookById); 
router.post('/:id/rating', auth, booksCtrl.addRating);

module.exports = router;