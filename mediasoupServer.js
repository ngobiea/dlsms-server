const { createWorker } = require('mediasoup');

let worker;
const createNewWorker = async () => {
  worker = await createWorker({
    rtcMaxPort: 2100,
    rtcMinPort: 2000,
  });
  console.log(`worker pid ${worker.pid}`);

  worker.on('died', (error) => {
    // This implies something serious happened, so kill the application
    console.error('mediasoup worker has died');
    setTimeout(() => process.exit(1), 2000); // exit in 2 seconds
  });

  return worker;
};

worker = createNewWorker();

const mediaCodecs = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000,
    parameters: {
      'x-google-start-bitrate': 1000,
    },
  },
];
