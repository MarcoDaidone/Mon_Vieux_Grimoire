
const userShema = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.creatUser = (req, res, next) => {
//on hash le mp
bcrypt.hash(req.body.password, 10)
.then(hash => {
  const user = new userShema({
    email: req.body.email,
    password: hash
  });
  user.save()
  .then(() => {
    console.log('User created successfully');
    res.status(201).json({ message: 'Utilisateur créé !' });
  })
  .catch(error => {
    console.error('Error saving user:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: "Adresse mail incorrecte" });
    } else {
      res.status(500).json({ error: error.message });
    }
  });
})
.catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    userShema.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.RANDOM_TOKEN,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
 };