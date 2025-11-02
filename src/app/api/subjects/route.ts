// src/app/api/subjects/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper: Convert BigInt → string + format dates
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeSubject(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(serializeSubject);
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, serializeSubject(v)])
    );
  }
  return obj;
}

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      select: {
        id: true,
        subject: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });

    // Serialize BigInt + Dates
    const serialized = subjects.map(serializeSubject);

    return NextResponse.json(serialized);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { subject } = data;

    if (!subject || typeof subject !== 'string') {
      return NextResponse.json({ error: 'Valid subject is required' }, { status: 400 });
    }

    const newSubject = await prisma.subject.create({
      data: { subject },
    });

    return NextResponse.json({
      message: 'Subject created successfully',
      subject: serializeSubject(newSubject),
    }, { status: 201 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error creating subject:', error);
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}