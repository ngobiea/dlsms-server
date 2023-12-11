import {
  Copyleaks,
  CopyleaksExportModel,
  CopyleaksFileSubmissionModel,
} from 'plagiarism-checker';
import fs from 'fs';
import path from 'path';
const __dirname = path.resolve();

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
  async submitFileForPlagiarismCheck({
    filePath,
    submissionId,
    fileName,
    webhookUrl,
    name,
    title,
  }) {
    try {
      const fileContent = fs.readFileSync(filePath, { encoding: 'base64' });
      const logoImagePath = path.join(__dirname, 'logo', 'dlsms2.png');
      const logoImageContent = fs.readFileSync(logoImagePath, {
        encoding: 'base64',
      });
      const loginResult = await this.login();

      const submission = new CopyleaksFileSubmissionModel(
        fileContent,
        fileName,
        {
          webhooks: {
            status: webhookUrl,
          },
          pdf: {
            create: true,
            title: `Plagiarism Report for ${name} - ${title}`,
            largeLogo: logoImageContent,
          },
        }
      );

      return await this.copyleaks.submitFileAsync(
        loginResult,
        submissionId,
        submission
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

  async exportPlagiarismReport(scanId) {
    try {
      const loginResult = await this.login();
      const model = new CopyleaksExportModel(
        `${WEBHOOK_URL}/export/scanId/${scanId}/completion`,
        [
          {
            id: scanId,
            endpoint: `${WEBHOOK_URL}/result/${scanId}`,
            verb: 'POST',
          },
        ],
        {
          endpoint: `${WEBHOOK_URL}/crawled-version/${scanId}`,
          verb: 'POST',
          
        }

      );
      return await this.copyleaks.exportAsync(
        loginResult,
        scanId,
        scanId,
        model
      );
    } catch (error) {
      throw new Error(`Failed to retrieve plagiarism report: ${error}`);
    }
  }
}

const plagiarism = async () => {
  const copyLeaksPlagiarismChecker = new CopyLeaksPlagiarismChecker();
  const login = await copyLeaksPlagiarismChecker.login();
  cop;
};
