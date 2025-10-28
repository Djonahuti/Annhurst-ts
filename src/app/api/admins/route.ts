import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function serializeBigInt<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_key, value) => (typeof value === 'bigint' ? Number(value) : value))
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (email) {
      // Get specific admin by email
      const admin = await prisma.admins.findUnique({
        where: { email },
      });
      
      if (!admin) {
        return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
      }
      return NextResponse.json(serializeBigInt(admin));
    } else {
      // Get all admins
      const admins = await prisma.admins.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          banned: true,
          created_at: true,
        },
        orderBy: { created_at: 'desc' },
      });
      
      return NextResponse.json(serializeBigInt(admins));
    }
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, password, role } = data;

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admins.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'editor',
        banned: false,
      },
    });

    return NextResponse.json({ 
      message: 'Admin created successfully',
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
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

    const admin = await prisma.admins.update({
      where: { id: BigInt(id) },
      data: { banned },
    });

    return NextResponse.json({ 
      message: 'Admin updated successfully',
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        banned: admin.banned,
      }
    });
  } catch (error) {
    console.error('Error updating admin:', error);
    return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
