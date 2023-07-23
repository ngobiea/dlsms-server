const { PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { s3 } = require('./s3-setup');

exports.crateFolderInBucket = async (bucketName, folderName) => {
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
      } catch (error) {
        console.error('Error creating folder:', err);
      }
    } else {
      console.error('Error checking folder:', err);
    }
  }
};
