import { Request, Response, RequestHandler } from 'express';
import { bucket } from '../utils/gcs.ts';
import { v4 as uuidv4 } from 'uuid';

export const uploadFile: RequestHandler = (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    return res.status(400).send('No files uploaded.');
  }

  const uploadPromises = files.map(file => {
    return new Promise<{ url: string, fieldName: string }>((resolve, reject) => {
      const filename = `${Date.now()}-${uuidv4()}-${file.originalname}`;
      const blob = bucket.file(filename);

      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: file.mimetype,
      });

      blobStream.on('error', (err) => {
        console.error(err);
        reject(`Error uploading ${file.originalname}: ${err.message}`);
      });

      blobStream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve({
          url: publicUrl,
          fieldName: file.fieldname,
        });
      });

      blobStream.end(file.buffer);
    });
  });

  Promise.all(uploadPromises)
    .then(uploaded => {
      res.status(200).send({ uploaded });
    })
    .catch(error => {
      res.status(500).send({ message: 'Failed to upload one or more files.', error });
    });
}; 