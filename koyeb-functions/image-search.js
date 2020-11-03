"use strict";
const algoliasearch = require("algoliasearch");
const Rekognition = require("aws-sdk/clients/rekognition");
const S3 = require("aws-sdk/clients/s3");

const executeRekognition = async (
  rekognitionInstance,

  objectbBody
) => {
  var params = {
    Image: {
      Bytes: objectbBody,
    },
  };

  try {
    const response = await rekognitionInstance.detectLabels(params).promise();
    return response.Labels;
  } catch (error) {
    throw error;
  }
};

const indexLabels = async (objectID, detectedLabels) => {
  try {
    const client = algoliasearch(
      process.env.ALGOLIA_APP_ID,
      process.env.ALGOLIA_API_KEY
    );

    const index = client.initIndex(process.env.ALGOLIA_INDEX);

    await index.partialUpdateObject(
      {
        objectID,

        detectedLabels,
      },
      { createIfNotExists: true }
    );
  } catch (error) {
    throw error;
  }
};

const getSourceObject = async (s3Instance, bucket, key) => {
  try {
    const response = await s3Instance
      .getObject({
        Bucket: bucket,
        Key: key,
      })
      .promise();

    return response.Body;
  } catch (error) {
    throw error;
  }
};

const getS3Configuration = (sourceBucket) => {
  return {
    accessKeyId: process.env[`KOYEB_STORE_${sourceBucket}_ACCESS_KEY`],
    secretAccessKey: process.env[`KOYEB_STORE_${sourceBucket}_SECRET_KEY`],
    region: process.env[`KOYEB_STORE_${sourceBucket}_REGION`],
    endpoint: process.env[`KOYEB_STORE_${sourceBucket}_ENDPOINT`],
  };
};

const getRekognitionConfiguration = () => {
  return {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION || "eu-west-1",
  };
};

const validateEnvironment = (bucket) => {
  if (!bucket) {
    throw new Error("Bucket name not present in event payload.");
  }

  if (
    !process.env?.[`KOYEB_STORE_${bucket}_ACCESS_KEY`] ||
    !process.env?.[`KOYEB_STORE_${bucket}_SECRET_KEY`] ||
    !process.env[`KOYEB_STORE_${bucket}_REGION`] ||
    !process.env[`KOYEB_STORE_${bucket}_ENDPOINT`]
  ) {
    throw new Error(
      `One of the following environment variables are missing: KOYEB_STORE_${bucket}_ACCESS_KEY, KOYEB_STORE_${bucket}_SECRET_KEY, KOYEB_STORE_${bucket}_ENDPOINT, KOYEB_STORE_${bucket}_REGION.`
    );
  }

  if (!process.env.AWS_ACCESS_KEY || !process.env.AWS_SECRET_KEY) {
    throw new Error(
      "Environment variables AWS_ACCESS_KEY and AWS_SECRET_KEY must be set."
    );
  }

  if (
    !process.env.ALGOLIA_APP_ID ||
    !process.env.ALGOLIA_API_KEY ||
    !process.env.ALGOLIA_INDEX
  ) {
    throw new Error(
      "Environment variables ALGOLIA_APP_ID, ALGOLIA_INDEX and ALGOLIA_API_KEY must be set."
    );
  }
};

const handler = async (event) => {
  const bucket = event?.bucket?.name;
  const key = event?.object?.key;

  validateEnvironment(bucket);

  const s3Instance = new S3(getS3Configuration(bucket));
  const rekognitionInstance = new Rekognition(getRekognitionConfiguration());

  const objectbBody = await getSourceObject(s3Instance, bucket, key);

  const detectedLabels = await executeRekognition(
    rekognitionInstance,
    objectbBody
  );

  await indexLabels(key, detectedLabels);
};

module.exports.handler = handler;
