import { Storage } from '@google-cloud/storage';

const credentials = process.env.GCS_CREDENTIALS_JSON
  ? JSON.parse(process.env.GCS_CREDENTIALS_JSON)
  : process.env.GCS_CREDENTIALS_BASE64
    ? JSON.parse(Buffer.from(process.env.GCS_CREDENTIALS_BASE64, 'base64').toString('utf-8'))
    : undefined;

if (!credentials) throw new Error('GCS credentials missing');

export const bucketName = process.env.GCS_BUCKET_NAME!;
const storage = new Storage({ credentials });
export const bucket = storage.bucket(bucketName);
