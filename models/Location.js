var mongoose = require('mongoose');

var LocationSchema = new mongoose.Schema({
  name: String,
  lat: Number,
  lng: Number
});

module.exports = mongoose.model('Location', LocationSchema);
