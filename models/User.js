var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  address: String,
  lat: Number,
  lng: Number,
  admin: Boolean,
  attend:[String]
})

module.exports = mongoose.model('User', UserSchema);