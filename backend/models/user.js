const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')


const validateEmail = function(email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email)
};


const userShema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique : true,
    validate: {
      validator: validateEmail,
      message: props => `${props.value} is not a valid email address!`
    }
  },
  password: {
    type: String,
    required: true,
  },
});

userShema.plugin(uniqueValidator);

const Book = mongoose.model('User', userShema);

module.exports = Book;
