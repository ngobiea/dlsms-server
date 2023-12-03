import Classroom from '../../model/Classroom.js';
import Message from '../../model/Message.js';

export const handleGetClassroom = async (classroomId, callback) => {
  const classroom = await Classroom.findById(
    classroomId,
    '-name -code -description -tutor'
  ).populate(
    'students',
    '-password -verified -institution -role -machineLearningImages -email'
  );
  const messages = await Message.find({ classroomId }, '-classroomId -__v')
    .populate(
      'sender',
      '-password -verified -email -institution -studentId -role -machineLearningImages'
    )
    .populate('classSession', '-tutor -classroomId -students -endDate')
    .populate('examSession', '-tutor -classroomId -students')
    .populate('assignment', '-submissions -files');

  callback({ students: classroom.students, messages });
};
