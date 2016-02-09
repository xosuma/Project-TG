var mongoose = require('mongoose');

var ScheduleSchema = new mongoose.Schema({
  name: String,
  date: Date,
  month: String,
  day: String,
  year: String,
  note: String,
  join: [],
  ride: String,
  complete: Boolean,
  rider: [],
  timeComplete: Date
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
