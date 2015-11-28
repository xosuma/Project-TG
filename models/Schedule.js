var mongoose = require('mongoose');

var ScheduleSchema = new mongoose.Schema({
  name: String,
  join: [],
  ride: String
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
