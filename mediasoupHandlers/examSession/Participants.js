export class Participants {
  constructor(user) {
    this.user = user;
    this.transports = new Map();
    this.producers = new Map();
    this.consumers = new Map();
  }
  addTransport(transportId, transport) {
    this.transports.set(transportId, transport);
  }
}
