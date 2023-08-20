const Classroom = require('../../model/classroom');
const Messages = require('../../model/message');

exports.handleGetClassroom = async (classroomId, socket) => {
  const classroom = await Classroom.findById(
    classroomId,
    '-name -code -description -tutor'
  ).populate(
    'students',
    '-password -verified -institution -studentId -role -machineLearningImages -email'
  );
  const messages = await Messages.find({ classroomId }, '-classroomId -__v')
    .populate(
      'sender',
      '-password -verified -email -institution -studentId -role'
    )
    .populate('classSession', '-tutor -classroomId -students -endDate')
    .populate('examSession', '-tutor -classroomId -students')
    .populate('poll', '-tutor -classroomId -students')
    .sort({ timestamp: -1 });

  socket.emit('send-classroom', { students: classroom.students, messages });
};
