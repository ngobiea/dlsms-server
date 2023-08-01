const {SendEmailCommand } = require('@aws-sdk/client-ses');
const {sesClient}= require('./aws-setup')


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
