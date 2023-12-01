import {
  s3,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  ListPartsCommand,
} from './aws-setup.js';

const s3Params = {
  Bucket: 'dlsms-student-recording',
  Key: 'video.mp4',
};


s3.send(new CreateMultipartUploadCommand(s3Params))
  .then((data) => {
    s3Params.UploadId = data.UploadId;
  })
  .catch((err) => {
    console.log(err);
  });

export const uploadVideo = async ({ chunk, index }) => {
  try {
    await s3.send(
      new UploadPartCommand({
        ...s3Params,
        Body: chunk,
        PartNumber: Number(index) + 1,
      })
    );
  } catch (error) {
    console.log(error);
  }
};
export const finalChunk = async () => {
  try {
    const data = await s3.send(new ListPartsCommand(s3Params));

    const parts = [];
    data.Parts.forEach((part) => {
      parts.push({ ETag: part.ETag, PartNumber: part.PartNumber });
    });
    s3Params.MultipartUpload = { Parts: parts };

    await s3.send(
      new CompleteMultipartUploadCommand({
        ...s3Params,
      })
    );
  } catch (error) {
    console.log(error);
  }
};
