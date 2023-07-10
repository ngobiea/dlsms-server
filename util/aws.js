const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
require('@aws-sdk/credential-provider-ini');

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
});
exports.sendEmail = async (to, subject, body) => {
  const sendEmailParams = {
    Source: process.env.SENDER_EMAIL,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
      },
      Body: {
        Html: {
          Data: body,
        },
      },
    },
  };
  const command = new SendEmailCommand(sendEmailParams);
  await sesClient.send(command);
};
