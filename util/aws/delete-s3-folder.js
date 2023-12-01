import { s3, DeleteObjectsCommand, ListObjectsCommand } from './aws-setup.js';

export const deleteS3Folder = async (bucket, folderKey) => {
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
};
