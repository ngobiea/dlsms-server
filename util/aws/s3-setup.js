const { S3Client } = require("@aws-sdk/client-s3");


exports.s3 = new S3Client({
  region: process.env.AWS_REGION_1,
});