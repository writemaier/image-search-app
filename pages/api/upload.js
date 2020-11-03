import S3 from "aws-sdk/clients/s3";

export default async (req, res) => {
  const s3Instance = new S3({
    endpoint: process.env.KOYEB_ENDPOINT || "s3.eu-west-1.prod.koyeb.com",
    accessKeyId: process.env.KOYEB_S3_ACCESS_KEY,
    secretAccessKey: process.env.KOYEB_S3_SECRET_KEY,
    region: process.env.KOYEB_REGION || "eu-west-1",
    signatureVersion: "v4",
  });

  const params = {
    Bucket: process.env.KOYEB_STORE,
    Key: req?.body?.filename,
    ContentType: req.body?.contentType,
    Expires: 90000,
  };

  const url = s3Instance.getSignedUrl("putObject", params);

  res.statusCode = 201;
  res.json({
    method: "put",
    url,
    fields: {},
    headers: {
      "content-type": req.body?.contentType,
    },
  });
};
