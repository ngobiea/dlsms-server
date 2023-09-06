import { SendEmailCommand } from '@aws-sdk/client-ses';
import { sesClient } from './aws-setup.js';

export const sendEmail = async (to, subject, body) => {
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
