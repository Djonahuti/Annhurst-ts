import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/* -------------------------------------------------------------
   Helper – serialize BigInt and Date objects in one pass
   This ensures Date objects are properly converted before they
   can be incorrectly serialized
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const coordinatorId = searchParams.get('coordinatorId');
    const driverId = searchParams.get('driverId');
    const isRead = searchParams.get('is_read');
    const senderEmail = searchParams.get('sender_email');
    const receiverEmail = searchParams.get('receiver_email');
    const excludeSenderEmail = searchParams.get('exclude_sender_email');
    const isStarred = searchParams.get('is_starred');
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};
    
    if (coordinatorId) {
      whereClause.coordinator = BigInt(coordinatorId);
    }
    
    if (driverId) {
      whereClause.driver = BigInt(driverId);
    }
    
    if (isRead !== null) {
      whereClause.is_read = isRead === 'true';
    }

    if (senderEmail) {
      whereClause.sender_email = senderEmail;
    }

    if (receiverEmail) {
      whereClause.receiver_email = receiverEmail;
    }

    if (isStarred !== null) {
      whereClause.is_starred = isStarred === 'true';
    }

    const contacts = await prisma.contact.findMany({
      where: {
        ...whereClause,
        ...(excludeSenderEmail ? { sender_email: { not: excludeSenderEmail } } : {}),
      },
      include: {
        coordinator_rel: {
          select: { id: true, name: true, email: true },
        },
        driver_rel: {
          select: { id: true, name: true, email: true },
        },
        subject_rel: {
          select: { id: true, subject: true, created_at: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(safeJSON(contacts));
  } catch (error) {
    console.error('GET /api/contacts error:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  // Prepare request data and build payload once so we can safely retry without re-reading the body
  const data = await request.json();
  const {
    coordinator,
    driver,
    subject,
    message,
    attachment,
    sender,
    receiver,
    sender_email,
    receiver_email,
    is_starred,
  } = data;

  // Basic validation
  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  // Explicitly exclude id to prevent unique constraint violations
  // The id field is auto-incremented by the database
  const createData = {
    coordinator: coordinator ? BigInt(coordinator) : null,
    driver: driver ? BigInt(driver) : null,
    subject: subject ? BigInt(subject) : null,
    message,
    attachment: attachment || null,
    sender: sender || null,
    receiver: receiver || null,
    sender_email: sender_email || null,
    receiver_email: receiver_email || null,
    is_starred: is_starred || false,
    is_read: false,
    transaction_date: new Date(),
  };

  try {
    const contact = await prisma.contact.create({ data: createData });

    return NextResponse.json({ 
      message: 'Contact created successfully',
      contact: safeJSON(contact)
    }, { status: 201 });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any    
  } catch (error: any) {
    console.error('Error creating contact:', error);
    
    // Handle Prisma specific errors
    if (error.code === 'P2002') {
      // Attempt self-heal for out-of-sync sequence on contact.id, then retry once
      try {
        await prisma.$executeRawUnsafe(`
          SELECT setval(
            'public.contact_id_seq',
            COALESCE((SELECT MAX(id) FROM public.contact), 1),
            true
          );
        `);
        const contact = await prisma.contact.create({ data: createData });
        return NextResponse.json({ 
          message: 'Contact created successfully',
          contact: safeJSON(contact)
        }, { status: 201 });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any        
      } catch (healErr: any) {
        console.error('Sequence self-heal failed:', healErr);
        return NextResponse.json({ 
          error: 'Unique constraint violation. Sequence reset failed. Please contact an administrator.',
          details: healErr?.message || error.meta?.target
        }, { status: 409 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to create contact',
      details: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, ids, is_read, is_starred } = data;

    if (ids && Array.isArray(ids)) {
      await prisma.contact.updateMany({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        where: { id: { in: ids.map((i: any) => BigInt(i)) } },
        data: { is_read, is_starred },
      });
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (typeof is_read === 'boolean') updateData.is_read = is_read;
    if (typeof is_starred === 'boolean') updateData.is_starred = is_starred;

    const contact = await prisma.contact.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        coordinator_rel: {
          select: { id: true, name: true, email: true },
        },
        driver_rel: {
          select: { id: true, name: true, email: true },
        },
        subject_rel: {
          select: { id: true, subject: true, created_at: true },
        },
      },      
    });

    return NextResponse.json({
      message: 'Updated',
      contact: safeJSON(contact),
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
