var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  address: String
})

module.exports = mongoose.model('User', UserSchema);