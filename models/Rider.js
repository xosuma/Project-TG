var mongoose = require('mongoose');

var RiderSchema = new mongoose.Schema({
  name: String,
  lat: Number,
  lng: Number
});

module.exports = mongoose.model('Rider', RiderSchema);
