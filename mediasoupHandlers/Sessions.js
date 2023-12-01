import { ExamStore } from './examSession/ExamStore.js';
import { ClassSessions } from './classSession/ClassStore.js';

export class Sessions {
  constructor() {
    this.examSessions = new ExamStore();
    this.classSessions = new ClassSessions();
    this.socket = null;
    this.worker = null;
  }
  setWorker(worker) {
    this.worker = worker;
  }
  setSocket(socket) {
    this.socket = socket;
    this.socket.on('newExamSession', ({ examSessionId }, callback) => {
      this.examSessions.joinExamSession(
        { examSessionId },
        callback,
        this.socket,
        this.worker
      );
    });
    this.socket.on('newClassSession', ({ classSessionId }, callback) => {
      this.classSessions.joinClassSession(
        { classSessionId },
        callback,
        this.socket,
        this.worker
      );
    });
  }
}
