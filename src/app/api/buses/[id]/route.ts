// src/app/api/buses/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/* -------------------------------------------------
   GET /api/buses/123
   → returns { bus_code: "ABC123" }
   ------------------------------------------------- */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const busId = parseInt(params.id, 10);
    if (isNaN(busId)) {
      return NextResponse.json({ error: 'Invalid bus ID' }, { status: 400 });
    }

    const bus = await prisma.buses.findUnique({
      where: { id: BigInt(busId) },
      select: { bus_code: true },
    });

    if (!bus) {
      return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
    }

    return NextResponse.json({ bus_code: bus.bus_code });
  } catch (error) {
    console.error('Error fetching bus:', error);
    return NextResponse.json({ error: 'Failed to fetch bus' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

/* -------------------------------------------------
   PATCH /api/buses/123
   → { e_payment: 60000 } → updates e_payment
   ------------------------------------------------- */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const busId = parseInt(params.id, 10);
    if (isNaN(busId)) {
      return NextResponse.json({ error: 'Invalid bus ID' }, { status: 400 });
    }

    const { e_payment } = await request.json();

    const updated = await prisma.buses.update({
      where: { id: BigInt(busId) },
      data: { e_payment: e_payment !== undefined ? BigInt(e_payment) : null },
    });

    return NextResponse.json({ message: 'Bus updated', e_payment: updated.e_payment ? Number(updated.e_payment) : null });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Bus not found' }, { status: 404 });
    }
    console.error('Error updating bus:', error);
    return NextResponse.json({ error: 'Failed to update bus' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}