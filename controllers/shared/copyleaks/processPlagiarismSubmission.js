import { CopyLeaksPlagiarismChecker } from '../../../copyleaks/plagiarism.js';

export const processPlagiarismSubmission = async (req, res, next) => {
  // Handle the incoming webhook payload here
  const status = req.body.status; // Extract the status from the request
  console.log(req);
  // Perform actions based on the status received
  if (status === 'completed') {
    // Handle completed status
    console.log('Plagiarism scan completed');

    // Add further processing or actions as needed
  } else if (status === 'error') {
    // Handle error status
    console.log('Error occurred during plagiarism scan');
    // Add error handling or notifications
  } else {
    // Handle other statuses if needed
    console.log('Received status:', status);
  }

  res.sendStatus(200);
};
