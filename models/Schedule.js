var mongoose = require('mongoose');

var ScheduleSchema = new mongoose.Schema({
  name: String,
  join: []
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
