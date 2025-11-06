import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const filename = formData.get('filename') as string;

    if (!file || !filename) {
      return NextResponse.json({ error: 'File and filename are required' }, { status: 400 });
    }

    // Store in public/uploads using the provided filename without UUIDs
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    // Use the provided filename as-is
    const safeFilename = filename;
    const filePath = path.join(uploadDir, safeFilename);
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(arrayBuffer));

    // Return relative URL for client usage (served statically in dev and build)
    const url = path.posix.join('/uploads', safeFilename);
    return NextResponse.json({ message: 'File uploaded successfully', filename: safeFilename, url });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}