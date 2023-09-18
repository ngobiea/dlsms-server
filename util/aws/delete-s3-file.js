import { s3, DeleteObjectsCommand } from './aws-setup.js';

export const deleteS3Objects = async (bucket, keys) => {
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
};
