var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  address: String,
  admin: Boolean
})

module.exports = mongoose.model('User', UserSchema);