import {
  S3Client,
  ListObjectsCommand,
  DeleteObjectsCommand,
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  ListPartsCommand,
} from '@aws-sdk/client-s3';
import { SESClient } from '@aws-sdk/client-ses';

export const sesClient = new SESClient({
  region: process.env.AWS_REGION,
});

export const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

export {
  ListObjectsCommand,
  DeleteObjectsCommand,
  DeleteObjectCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  ListPartsCommand,
};
