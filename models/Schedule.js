var mongoose = require('mongoose');

var ScheduleSchema = new mongoose.Schema({
  name: String,
  completed: Boolean
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
