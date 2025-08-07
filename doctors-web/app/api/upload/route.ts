import { NextRequest, NextResponse } from 'next/server';
import { bucket } from '@/lib/gcs';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false, // disable Next.js default body parser
  },
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const uploadedFiles = [];

  for (const [fieldName, file] of formData.entries()) {
    if (file instanceof File) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = `${Date.now()}-${uuidv4()}-${file.name}`;
      const blob = bucket.file(filename);

      await blob.save(buffer, {
        contentType: file.type,
      });

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
      uploadedFiles.push({
        fieldName,
        url: publicUrl,
        filename: file.name,
      });
    }
  }

  return NextResponse.json({ uploaded: uploadedFiles });
}
