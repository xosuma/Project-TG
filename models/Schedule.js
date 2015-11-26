var mongoose = require('mongoose');

var ScheduleSchema = new mongoose.Schema({
  name: String,
  completed: Boolean,
  note: String
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
