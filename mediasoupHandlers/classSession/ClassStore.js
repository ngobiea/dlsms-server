export class ClassSessions {
  constructor() {
    this.classSessions = new Map();
  }
  joinClassSession(classSessionId) {}

  addClassSession(classSessionId, classSession) {
    this.classSessions.set(classSessionId, classSession);
  }
  getClassSession(classSessionId) {
    return this.classSessions.get(classSessionId);
  }
  deleteClassSession(classSessionId) {
    this.classSessions.delete(classSessionId);
  }
  printAllClassSession() {
    console.log(this.classSessions.size);
    this.classSessions.forEach((value) => {
      console.log(value);
    });
  }
}
