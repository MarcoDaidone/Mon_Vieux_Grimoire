
const bookSchema = require('../models/bookShema');
const fs = require('fs');

// middleware sharpe 
exports.createBooks = async (req, res, next) => {
  try {
    // Utiliser req.body.book car les données du livre sont envoyées sous cette forme
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;

    const book = new bookSchema({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: req.imageUrl || '', // Utilisez l'image URL définie par le middleware
      averageRating: bookObject.ratings[0].grade, 
    });

    book.save()
      .then(() => {
        res.status(201).json({ message: 'Objet enregistré !' });
      })
      .catch(error => {
        console.error('Error saving book:', error);
        res.status(400).json({ error });
      });
  } catch (error) {
    console.error('Error in createBooks controller:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getBooks = (req, res, next) => {
  bookSchema.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

exports.getBookById = (req, res, next) => {
  const { id } = req.params;
  bookSchema.findById(id)
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }
      res.status(200).json(book);
    })
    .catch(error => res.status(400).json({ error }));
};

exports.updateBookById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let imageUrl = req.imageUrl;
   
    const bookObject = req.body.book ? JSON.parse(req.body.book) : {};
    if (imageUrl) {
      bookObject.imageUrl = imageUrl;
    }

    bookSchema.findByIdAndUpdate(id, { ...bookObject, _id: id }, { new: true })
      .then(updatedBook => {
        if (!updatedBook) {
          return res.status(404).json({ message: 'Livre non trouvé' });
        }
        res.status(200).json(updatedBook);
      })
      .catch(error => res.status(400).json({ error }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBookById = (req, res, next) => {
  const { id } = req.params;

  bookSchema.findById(id)
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }

      const imagePath = `.${decodeURI(new URL(book.imageUrl).pathname)}`;
      bookSchema.deleteOne({ _id: id })
        .then(() => {
          fs.unlink(imagePath, (err) => {
            if (err) {
              console.error('Failed to delete image:', err);
              return res.status(500).json({ message: 'Livre supprimé, mais l\'image n\'a pas pu être supprimée', error: err });
            }
            res.status(200).json({ message: 'Livre et image supprimés avec succès' });
          });
        })
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(400).json({ error }));
};
exports.addRating = (req, res, next) => {
  const { id } = req.params;
  const { userId, rating } = req.body;

  bookSchema.findById(id)
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }

      const existingRating = book.ratings.find(r => r.userId === userId);
      if (existingRating) {
        return res.status(400).json({ message: 'L\'utilisateur a déjà noté ce livre.' });
      }
      book.ratings.push({ userId, grade: rating });

      const totalRating = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
      book.averageRating = totalRating / book.ratings.length;

      book.save()
        .then(updatedBook => {
          res.status(200).json(updatedBook);
        })
        .catch(error => {
          console.error('Error saving book:', error);
          res.status(400).json({ error });
        });
    })
    .catch(error => {
      console.error('Error finding book:', error);
      res.status(400).json({ error });
    });
};
exports.getBestRatedBooks = (req, res, next) => {
  bookSchema.find().sort({ averageRating: -1 }).limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};
