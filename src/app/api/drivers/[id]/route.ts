import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const driverId = BigInt(id);
  const body = await request.json();

  const {
    name,
    email,
    phone,
    address,
    bus_id,
    coordinator_id,
  } = body;

  try {
    // 1. Update driver fields
    await prisma.driver.update({
      where: { id: driverId },
      data: {
        name,
        email,
        phone: phone ? [phone] : undefined,
        address: address ? [address] : undefined,
      },
    });

    // 2. Clear any previous bus assignment for this driver
    await prisma.buses.updateMany({
      where: { driver: driverId },
      data: { driver: null },
    });

    // 3. Assign the selected bus (if any)
    if (bus_id && bus_id !== 'N/A') {
      await prisma.buses.update({
        where: { id: BigInt(bus_id) },
        data: {
          driver: driverId,
          coordinator: coordinator_id && coordinator_id !== 'N/A'
            ? BigInt(coordinator_id)
            : null,
        },
      });
    }

    return NextResponse.json({ message: 'Driver updated' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update driver' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}