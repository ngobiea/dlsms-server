import User from '../../model/User.js';

export class Student {
  static async getImages(callback, socket) {
    const student = await User.findById(socket.userId);
    if (student) {
      callback({ images: student.machineLearningImages });
    } else {
      callback({ images: [] });
    }
  }
}
