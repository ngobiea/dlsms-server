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
    host,
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
          developerPayload: host,
        }
      );

      return await this.copyleaks.submitFileAsync(
        loginResult,
        submissionId,
        submission
      );
    } catch (error) {
      if (error?.response && error.response?.data) {
        console.error(
          'Error response from CopyLeaks API:',
          error.response.data
        );
      }
      throw new Error(`Failed to submit file for plagiarism check: ${error}`);
    }
  }

  async exportPlagiarismReport(scanId, webhookUrl) {
    try {
      const loginResult = await this.login();
      const model = new CopyleaksExportModel(
        `${webhookUrl}/export/scanId/${scanId}/completion`,
        [
          {
            id: scanId,
            endpoint: `${webhookUrl}/result/${scanId}`,
            verb: 'POST',
          },
        ],
        {
          endpoint: `${webhookUrl}/crawled-version/${scanId}`,
          verb: 'POST',
        },
        null,

        {
          endpoint: `${webhookUrl}/export/${scanId}/pdf-report`,
          verb: 'POST',
          headers: [
            ['key', 'value'],
            ['key2', 'value2'],
          ],
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
