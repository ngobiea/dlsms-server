const { createClassroom } = require('./classrooms/postClassroom');
const { getClassrooms } = require('../shared/classrooms/getClassrooms');
const { getClassroom } = require('../shared/classrooms/getClassroom');
const {
  scheduleClassSession
} = require('../tutor/classrooms/postScheduleClassSession');
module.exports = {
  createClassroom,
  getClassroom,
  getClassrooms,
  scheduleClassSession
};
