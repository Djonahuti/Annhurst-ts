import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const field = formData.get('field') as 'logo' | 'logo_blk';

    if (!file || !field) {
      return NextResponse.json({ error: 'Missing file or field' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${uuidv4()}-${file.name}`;
    const filepath = join(process.cwd(), 'public', 'settings', filename);

    await mkdir(join(process.cwd(), 'public', 'settings'), { recursive: true });
    await writeFile(filepath, buffer);

    return NextResponse.json({ filename });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}