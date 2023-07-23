const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.AWS_REGION_1,
});

exports.crateFolderInBucket = async (bucketName, folderName) => {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: folderName + '/',
      Body: '',
    });
    await s3.send(command);
    console.log(
      `Folder '${folderName}' created successfully in bucket '${bucketName}'.`
    );
  } catch (error) {
    console.error('Error creating folder:', err);
  }
};
