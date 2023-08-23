import { S3Client } from '@aws-sdk/client-s3';
import { SESClient } from '@aws-sdk/client-ses';

export const sesClient = new SESClient({
  region: process.env.AWS_REGION_1,
});
export const s3 = new S3Client({
  region: process.env.AWS_REGION_1,
});

