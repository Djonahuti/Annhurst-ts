import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import fs from 'fs/promises';
import path from 'path';

interface FileItem {
  name: string;
  type: 'file' | 'directory';
  size?: number;
  modified: string;
  path: string;
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is viewer (viewers can't access file manager)
    if (session.user.adminRole === 'viewer') {
      return NextResponse.json({ error: 'Access denied. Viewers cannot access file manager.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const dirPath = searchParams.get('path') || 'public';

    // Security: Prevent path traversal
    const baseDir = process.cwd();
    const requestedPath = path.join(baseDir, dirPath);
    const normalizedPath = path.normalize(requestedPath);

    // Ensure the path is within the project directory
    if (!normalizedPath.startsWith(baseDir)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    // Check if path exists
    try {
      const stats = await fs.stat(normalizedPath);
      if (!stats.isDirectory()) {
        return NextResponse.json({ error: 'Path is not a directory' }, { status: 400 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'Directory not found' }, { status: 404 });
    }

    // Read directory contents
    const items = await fs.readdir(normalizedPath, { withFileTypes: true });
    const fileList: FileItem[] = [];

    for (const item of items) {
      const itemPath = path.join(normalizedPath, item.name);
      const relativePath = path.relative(baseDir, itemPath);
      const stats = await fs.stat(itemPath);

      fileList.push({
        name: item.name,
        type: item.isDirectory() ? 'directory' : 'file',
        size: item.isFile() ? stats.size : undefined,
        modified: stats.mtime.toISOString(),
        path: relativePath.replace(/\\/g, '/'), // Normalize path separators
      });
    }

    // Sort: directories first, then files, both alphabetically
    fileList.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({
      currentPath: dirPath,
      files: fileList,
    });
  } catch (error) {
    console.error('Error reading directory:', error);
    return NextResponse.json(
      { error: 'Failed to read directory' },
      { status: 500 }
    );
  }
}

