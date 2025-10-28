import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function serializeBigInt<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_key, value) => (typeof value === 'bigint' ? Number(value) : value))
  );
}

export async function GET() {
  try {
    const pages = await prisma.pages.findMany({
      orderBy: { created_at: 'desc' },
    });
    return NextResponse.json(serializeBigInt(pages));
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const created = await prisma.pages.create({ data });
    return NextResponse.json(serializeBigInt(created), { status: 201 });
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

