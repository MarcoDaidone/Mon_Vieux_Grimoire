const multer = require('multer');

const storage = multer.memoryStorage(); // Stocke les fichiers en mémoire temporairement


module.exports = multer({storage: storage}).single('image');