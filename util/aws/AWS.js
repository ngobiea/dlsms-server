import {
  S3Client,
  ListObjectsCommand,
  DeleteObjectsCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  ListPartsCommand,
  HeadObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});
const sesClient = new SESClient({
  region: process.env.AWS_REGION,
});

export class AWS {
  static async sendEmail(to, subject, body) {
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
  }
  static async createFolderInBucket(bucketName, folderName) {
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: bucketName,
        Key: folderName + '/',
      });
      await s3.send(headCommand);
      console.log(
        `Folder '${folderName}' already exists in bucket '${bucketName}'.`
      );
    } catch (error) {
      if (error.name === 'NotFound') {
        try {
          const putCommand = new PutObjectCommand({
            Bucket: bucketName,
            Key: folderName + '/',
            Body: '',
          });
          await s3.send(putCommand);
          console.log(
            `Folder '${folderName}' created successfully in bucket '${bucketName}'.`
          );
        } catch (err) {
          console.error('Error creating folder:', err);
        }
      } else {
        console.error('Error checking folder:', error);
      }
    }
  }

  static async deleteFolderInBucket(bucket, folderKey) {
    const params = {
      Bucket: bucket,
      Prefix: folderKey,
    };

    try {
      await s3.send(new ListObjectsCommand(params));
    } catch (err) {
      if (err.name === 'NoSuchKey') {
        // Folder does not exist
        return;
      }
      throw err;
    }

    let continuationToken = undefined;

    do {
      const listedObjects = await s3.send(
        new ListObjectsCommand({
          Bucket: bucket,
          Prefix: folderKey,
          ContinuationToken: continuationToken,
        })
      );

      if (listedObjects.Contents) {
        const deleteParams = {
          Bucket: bucket,
          Delete: { Objects: [] },
        };

        listedObjects.Contents.forEach((object) => {
          deleteParams.Delete.Objects.push({ Key: object.Key });
        });

        if (deleteParams.Delete.Objects.length > 0) {
          await s3.send(new DeleteObjectsCommand(deleteParams));
        }
      }

      continuationToken = listedObjects.NextContinuationToken;
    } while (continuationToken);
  }
  static async deleteS3Objects(bucket, keys) {
    const params = {
      Bucket: bucket,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
      },
    };
    try {
      await s3.send(new DeleteObjectsCommand(params));
      console.log('Objects deleted successfully');
    } catch (err) {
      console.log('Error deleting objects', err);
    }
  }
  static async deleteS3Object(bucket, key) {
    const params = {
      Bucket: bucket,
      Key: key,
    };
    try {
      await s3.send(new DeleteObjectCommand(params));
      console.log('Object deleted successfully');
    } catch (err) {
      console.log('Error deleting object', err);
    }
  }

  static async createMultipartUpload(Bucket, Key) {
    try {
      const data = await s3.send(
        new CreateMultipartUploadCommand({ Bucket, Key })
      );
      return data.UploadId;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  static async uploadPart(Bucket, Key, UploadId, PartNumber, Body) {
    try {
      await s3.send(
        new UploadPartCommand({
          Bucket,
          Key,
          UploadId,
          Body,
          PartNumber: Number(PartNumber) + 1,
        })
      );
    } catch (error) {
      console.log(error);
    }
  }

  static async completeMultipartUpload(Bucket, Key, UploadId) {
    try {
      const data = await s3.send(
        new ListPartsCommand({ Bucket, Key, UploadId })
      );
      if (!data.Parts) {
        return null;
      }
      const parts = data.Parts.map((part) => ({
        ETag: part.ETag,
        PartNumber: part.PartNumber,
      }));
      return await s3.send(
        new CompleteMultipartUploadCommand({
          Bucket,
          Key,
          UploadId,
          MultipartUpload: { Parts: parts },
        })
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
