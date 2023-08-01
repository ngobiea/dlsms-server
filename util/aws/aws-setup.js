const { S3Client } = require('@aws-sdk/client-s3');
const { SESClient } = require('@aws-sdk/client-ses');

exports.sesClient = new SESClient({
  region: process.env.AWS_REGION,
});
exports.s3 = new S3Client({
  region: process.env.AWS_REGION_1,
});
