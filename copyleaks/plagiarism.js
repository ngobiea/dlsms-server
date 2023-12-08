import { Copyleaks, CopyleaksURLSubmissionModel } from 'plagiarism-checker';

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
}
