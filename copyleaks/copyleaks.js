import {
  Copyleaks,
  CopyleaksFileSubmissionModel,
  CopyleaksExportModel,
} from '../dist';



// change this with your own copyleaks email.
const DEMO_EMAIL = 'isatubah60@gmail.com';
// change this with your own copyleaks API key.
const DEMO_KEY = '019b687d-2413-4544-8f6e-c504cc054263';
//exe https://glacial-refuge-96501.herokuapp.com/10b0z2w1
const WEBHOOK_URL = '<WEBHOOK_URL>';
const copyleaks = new Copyleaks();

let testingInProgress = false;

const server = http.createServer((_req, res) => {
  res.statusCode = 200;

  testCopyleaks();

  res.setHeader('Content-Type', 'text/plain');
  res.end('started testing - check logs');
});

const testCopyleaks = () => {
  if (testingInProgress) {
    return;
  }
  testingInProgress = true;

  // Login
  copyleaks.loginAsync(DEMO_EMAIL, DEMO_KEY).then(
    (loginResult) => {
      logSuccess('loginAsync', loginResult);

      testSubmitFileAsync(loginResult);

      testDeleteScanAsync(['1653575562405', '1653575774429'], loginResult);

      testExportAsync(loginResult);
    },
    (err) => logError('loginAsync', err)
  );
};

const testSubmitFileAsync = (loginResult) => {
  const submission = new CopyleaksFileSubmissionModel(
    'aGVsbG8gd29ybGQ=',
    'nodejs-sdk-demo.txt',
    {
      sandbox: true,
      webhooks: {
        status: `${WEBHOOK_URL}/submit-file-webhook/{STATUS}`,
      },
    }
  );

  copyleaks.submitFileAsync(loginResult, Date.now() + 1, submission).then(
    (res) => logSuccess('submitFileAsync', res),
    (err) => {
      logError('submitFileAsync', err);
    }
  );
};


const testExportAsync = (loginResult) => {
  // change this with your own scanId
  const scanId = '1610625417127';

  const model = new CopyleaksExportModel(
    `${WEBHOOK_URL}/export/scanId/${scanId}/completion`,
    [
      // results
      {
        // change this with your own result Id
        id: '2a1b402420',
        endpoint: `${WEBHOOK_URL}/export/${scanId}/result/2a1b402420`,
        verb: 'POST',
        headers: [
          ['key', 'value'],
          ['key2', 'value2'],
        ],
      },
    ],
    {
      // crawled version
      endpoint: `${WEBHOOK_URL}/export/${scanId}/crawled-version`,
      verb: 'POST',
      headers: [
        ['key', 'value'],
        ['key2', 'value2'],
      ],
    }
  );

  copyleaks.exportAsync(loginResult, scanId, scanId, model).then(
    (res) => logSuccess('exportAsync', res),
    (err) => {
      logError('exportAsync', err);
    }
  );
};

const logError = (title, err) => {
  console.error('----------ERROR----------');
  console.error(`${title}:`);
  console.error(err);
  console.error('-------------------------');
};

const logSuccess = (title, result) => {
  console.log('----------SUCCESS----------');
  console.log(`${title}`);
  if (result) {
    console.log(`result:`);
    console.log(result);
  }
  console.log('-------------------------');
};
