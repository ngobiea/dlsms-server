const { createClassroom } = require('./classrooms/postClassroom');
const { getClassrooms } = require('../shared/classrooms/getClassrooms');
const { getClassroom } = require('../shared/classrooms/getClassroom');

module.exports = {
  createClassroom,
  getClassroom,
  getClassrooms,
};
