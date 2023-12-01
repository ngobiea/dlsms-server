export class SocketSever {
  constructor(io) {
    this.io = io;
    this.socket = null;
  }
  setSocket(socket) {
    this.socket = socket;
  }
  setIO(io) {
    this.io = io;
    console.log('io set');
    this.io.emit('hello', 'world');
  }
}
