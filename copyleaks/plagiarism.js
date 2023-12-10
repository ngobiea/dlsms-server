import {
  Copyleaks,
  CopyleaksURLSubmissionModel,
  CopyleaksFileSubmissionModel,
} from 'plagiarism-checker';
import fs from 'fs';
export class CopyLeaksPlagiarismChecker {
  constructor() {
    this.apiKey = process.env.COPY_LEAKS_API_KEY;
    this.userEmail = process.env.COPY_LEAKS_EMAIL;
    this.copyleaks = new Copyleaks();
  }

  async login() {
    try {
      return await this.copyleaks.loginAsync(this.userEmail, this.apiKey);
    } catch (error) {
      throw new Error(`Failed to login to CopyLeaks: ${error}`);
    }
  }

  async submitUrlForPlagiarismCheck(url) {
    console.log(url);
    try {
      const loginResult = await this.login();
      const submission = new CopyleaksURLSubmissionModel(url);
      return await this.copyleaks.submitUrlAsync(
        loginResult,
        Date.now() + 1,
        submission
      );
    } catch (error) {
      throw new Error(`Failed to submit URL for plagiarism check: ${error}`);
    }
  }

  async getPlagiarismReport(scanId) {
    try {
      const loginResult = await this.login();
      return await this.copyleaks.getResultAsync(loginResult, scanId);
    } catch (error) {
      throw new Error(`Failed to retrieve plagiarism report: ${error}`);
    }
  }
  async submitFileForPlagiarismCheck(
    filePath,
    submissionId,
    fileName,
    webhook
  ) {
    try {
      const fileContent = fs.readFileSync(filePath, { encoding: 'base64' });
      const loginResult = await this.login();
      console.log(loginResult);
      const submission = new CopyleaksFileSubmissionModel(
        fileContent,
        fileName,
        {
          sandbox: true,
          webhooks: {
            status: webhook,
          },
        }
      );

      return await this.copyleaks.submitFileAsync(
        loginResult,
        submissionId,
        submission,
        {}
      );
    } catch (error) {
      if (error.response && error.response.data) {
        console.error(
          'Error response from CopyLeaks API:',
          error.response.data
        );
      }
      throw new Error(`Failed to submit file for plagiarism check: ${error}`);
    }
  }
}

const plagiarism = async () => {
  const copyLeaksPlagiarismChecker = new CopyLeaksPlagiarismChecker();
  const login = await copyLeaksPlagiarismChecker.login();
  cop;
};
