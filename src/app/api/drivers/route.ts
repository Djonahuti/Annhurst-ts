import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function serializeBigInt<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_key, value) => (typeof value === 'bigint' ? Number(value) : value))
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (email) {
      const driver = await prisma.driver.findFirst({ where: { email } })
      if (!driver) return NextResponse.json({ error: 'Driver not found' }, { status: 404 })
      return NextResponse.json(serializeBigInt(driver))
    }

    const drivers = await prisma.driver.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        kyc: true,
        banned: true,
        buses: {
          take: 1,
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            bus_code: true,
            plate_no: true,
            coordinator_rel: {
              select: { id: true, name: true }
            }
          }
        }
      },
    });

    const response = drivers.map((driver) => {
      const bus = (driver.buses && driver.buses.length > 0) ? driver.buses[0] : null;
      return {
        id: Number(driver.id),
        name: driver.name || null,
        email: driver.email ?? null,
        phone: driver.phone as string[] | null,
        address: driver.address as string[] | null,
        kyc: driver.kyc,
        banned: driver.banned,
        bus_id: bus ? Number(bus.id) : null,
        bus_code: bus?.bus_code ?? null,
        plate_no: bus?.plate_no ?? null,
        coordinator_id: bus?.coordinator_rel ? Number(bus.coordinator_rel.id) : null,
        coordinator_name: bus?.coordinator_rel?.name ?? null,
      };
    });

    return NextResponse.json(serializeBigInt(response));
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json({ error: 'Failed to fetch drivers' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      dob,
      nin,
      phones,
      addresses,
    } = body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create driver record
    const driver = await prisma.driver.create({
      data: {
        name,
        email,
        password: hashedPassword,
        dob,
        nin: BigInt(nin),
        phone: phones,
        address: addresses,
        kyc: false,
      },
    });

    // Create user record with role 'driver'
    await prisma.users.create({
      data: {
        email,
        name,
        role: 'driver',
      },
    });

    return NextResponse.json({ message: 'Driver registered successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error registering driver:', error);
    return NextResponse.json({ error: 'Failed to register driver' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, banned } = data;

    if (!id || typeof banned !== 'boolean') {
      return NextResponse.json({ error: 'ID and banned status are required' }, { status: 400 });
    }

    const updated = await prisma.driver.update({
      where: { id: BigInt(id) },
      data: { banned },
      select: { id: true, name: true, email: true, banned: true },
    });

    return NextResponse.json(serializeBigInt(updated));
  } catch (error) {
    console.error('Error updating driver:', error);
    return NextResponse.json({ error: 'Failed to update driver' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}