const mediasoup = require('mediasoup');



exports.createWorker = async () => {
  const worker = await mediasoup.createWorker({
    rtcMaxPort: 2100,
    rtcMinPort: 2000,
  });
  console.log(`worker pid ${worker.pid}`);

  worker.on('died', (error) => {
    // This implies something serious happened, so kill the application
    console.error('mediasoup worker has died',error);
    setTimeout(() => process.exit(1), 2000); // exit in 2 seconds
  });

  return worker;
};


exports.createWebRtcTransport = async (router) => {
  return new Promise(async (resolve, reject) => {
    try {
      // https://mediasoup.org/documentation/v3/mediasoup/api/#WebRtcTransportOptions
      const webRtcTransport_options = {
        listenIps: [
          {
            ip: '0.0.0.0', // replace with relevant IP address
            // announcedIp: ' 192.168.18.64',
          },
        ],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
      };

      // https://mediasoup.org/documentation/v3/mediasoup/api/#router-createWebRtcTransport
      let transport = await router.createWebRtcTransport(
        webRtcTransport_options
      );
      console.log(`transport id: ${transport.id}`);

      transport.on('dtlsstatechange', (dtlsState) => {
        if (dtlsState === 'closed') {
          transport.close();
        }
      });

      transport.on('close', () => {
        console.log('transport closed');
      });

      resolve(transport);
    } catch (error) {
      reject(error);
    }
  });
};


exports.mediaCodecs = [
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
