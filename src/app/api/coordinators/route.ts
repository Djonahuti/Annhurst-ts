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
      const coordinator = await prisma.coordinators.findFirst({ where: { email } })
      if (!coordinator) return NextResponse.json({ error: 'Coordinator not found' }, { status: 404 })
      return NextResponse.json(serializeBigInt(coordinator))
    }

    const coordinators = await prisma.coordinators.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        banned: true,
      },
    });

    const response = coordinators.map((coordinator) => ({
      id: Number(coordinator.id), // Convert BigInt to number
      name: coordinator.name || 'Unknown',
      email: coordinator.email || 'Unknown',
      phone: (coordinator.phone as string[] | null) ?? [],
      banned: coordinator.banned,
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching coordinators:', error);
    return NextResponse.json({ error: 'Failed to fetch coordinators' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, password, phone } = data;

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const coordinator = await prisma.coordinators.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || [],
        banned: false,
      },
    });

    return NextResponse.json({ 
      message: 'Coordinator created successfully',
      coordinator: {
        id: coordinator.id,
        name: coordinator.name,
        email: coordinator.email,
        phone: coordinator.phone,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating coordinator:', error);
    return NextResponse.json({ error: 'Failed to create coordinator' }, { status: 500 });
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

    const coordinator = await prisma.coordinators.update({
      where: { id: BigInt(id) },
      data: { banned },
    });

    return NextResponse.json({ 
      message: 'Coordinator updated successfully',
      coordinator: {
        id: coordinator.id,
        name: coordinator.name,
        email: coordinator.email,
        banned: coordinator.banned,
      }
    });
  } catch (error) {
    console.error('Error updating coordinator:', error);
    return NextResponse.json({ error: 'Failed to update coordinator' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
