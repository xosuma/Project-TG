var mongoose = require('mongoose');

var RiderSchema = new mongoose.Schema({
  name: String,
  capacity: Number,
  lat: Number,
  lng: Number
});

module.exports = mongoose.model('Rider', RiderSchema);
