const sharp = require("sharp");
const fs = require('fs');

const resizeImages = async (req, res, next) => {
  try {
    console.log('Middleware resizeImages started');

    // Vérifier si le dossier 'images' existe, sinon le créer
    if (!fs.existsSync('./images')) {
      console.log('Directory ./images does not exist, creating it');
      fs.mkdirSync('./images');
    }

    if (req.file) {
      const { buffer, originalname } = req.file;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const ref = `${timestamp}-${originalname.split('.')[0]}.webp`;

      await sharp(buffer)
        .webp({ quality: 20 })
        .toFile(`./images/${ref}`);

      // Définir l'URL de l'image dans req.imageUrl
      req.imageUrl = `${req.protocol}://${req.get('host')}/images/${encodeURI(ref)}`;
    } else {
      console.log('req.file does not exist');
    }
    
    next();
  } catch (err) {
    console.error('Error in resizeImages middleware:', err);
    res.status(500).json({ err });
  }
};
  
  module.exports = resizeImages;