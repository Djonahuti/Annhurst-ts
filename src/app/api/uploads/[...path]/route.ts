import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    
    // Reconstruct the filename from path segments
    // pathSegments will be like ['K15,N50000,06.11.2025,DR Receipt.jpg']
    // or ['K15%2CN50000%2C06.11.2025%2CDR%20Receipt.jpg'] if URL encoded
    const filename = pathSegments.join('/');
    
    // Decode URL-encoded filename
    const decodedFilename = decodeURIComponent(filename);
    
    // Security: Prevent path traversal attacks
    // Normalize the path and ensure it doesn't go outside the uploads directory
    const normalizedPath = path.normalize(decodedFilename).replace(/^(\.\.(\/|\\|$))+/, '');
    
    // Construct file path
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadsDir, normalizedPath);
    
    // Additional security: Ensure the resolved path is within uploads directory
    if (!filePath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 403 });
    }
    
    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // Read file
    const fileBuffer = await fs.readFile(filePath);
    
    // Determine content type based on file extension
    const ext = path.extname(decodedFilename).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
    };
    
    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    
    // Return file with appropriate headers
    // Convert Buffer to Uint8Array for NextResponse compatibility
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${decodedFilename}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
  }
}

