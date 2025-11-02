import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/* -------------------------------------------------------------
   Helper – serialize BigInt and Date objects in one pass
   ------------------------------------------------------------- */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const safeJSON = (data: any): any => {
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      if (typeof value === 'bigint') {
        return Number(value);
      }
      return value;
    })
  );
};

export async function GET() {
  try {
    const rows = await prisma.contact_us.findMany({ orderBy: { created_at: 'desc' } });
    return NextResponse.json(safeJSON(rows));
  } catch (error) {
    console.error('Error fetching contact_us:', error);
    return NextResponse.json({ error: 'Failed to fetch contact messages' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, phone, company, subject, message } = data;

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
    }

    await prisma.contact_us.create({
      data: {
        name,
        email,
        phone: phone || null,
        company: company || null,
        subject: subject || null,
        message,
        created_at: new Date(),
      },
    });

    return NextResponse.json({ message: 'Contact message submitted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json({ error: 'Failed to submit contact message' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}