import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper: Convert BigInt → string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, serializeBigInt(v)])
    );
  }
  return obj;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  try {
    const coordinator = await prisma.coordinators.findFirst({
      where: { email: email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    if (!coordinator) {
      return NextResponse.json({ error: 'Coordinator not found' }, { status: 404 });
    }

    const buses = await prisma.buses.findMany({
      where: { coordinator: BigInt(coordinator.id) },
      select: {
        id: true,
        bus_code: true,
        plate_no: true,
        driver_rel: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const serialized = {
      coordinator: serializeBigInt(coordinator),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      buses: buses.map((b: any) => ({
        id: Number(b.id),
        bus_code: b.bus_code,
        plate_no: b.plate_no,
        driver_id: b.driver_rel?.id ? Number(b.driver_rel.id) : null,
        driver_name: b.driver_rel?.name || null,
      })),
    };

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error fetching coordinator & buses:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}