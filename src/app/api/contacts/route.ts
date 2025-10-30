import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper: Convert BigInt → string recursively
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

/* -------------------------------------------------------------
   2. Convert every Date → ISO-8601 string (new)
   ------------------------------------------------------------- */
const toISOString = (obj: any): any => {
  return JSON.parse(
    JSON.stringify(obj, (_, v) => (v instanceof Date ? v.toISOString() : v))
  );
};

/* -------------------------------------------------------------
   Helper – combine both serializers
   ------------------------------------------------------------- */
const safeJSON = (data: any) => toISOString(serializeBigInt(data));

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
    
    let whereClause: any = {};
    
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
  try {
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

    const contact = await prisma.contact.create({
      data: {
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
      },
    });

    return NextResponse.json({ 
      message: 'Contact created successfully',
      contact
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
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
        where: { id: { in: ids.map((i: any) => BigInt(i)) } },
        data: { is_read, is_starred },
      });
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

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
