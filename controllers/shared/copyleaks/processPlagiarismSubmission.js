import { statusCode } from '../../../util/statusCodes.js';
export const processPlagiarismSubmission = async (req, res, _next) => {
  const { status } = req.body;

  if (status === 0) {
    console.log('Plagiarism scan completed');
  } else if (status === 1) {
    console.log('Error occurred during plagiarism scan');
  } else {
    console.log('Received status:', status);
  }
  res.sendStatus(statusCode.OK);
};
