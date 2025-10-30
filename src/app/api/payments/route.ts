// src/app/api/payments/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/* -------------------------------------------------
   Response type for ViewPayments
   ------------------------------------------------- */
interface PaymentResponse {
  id: number;
  amount: number | null;
  pay_type: string | null;
  pay_complete: string | null;
  coordinator: string | null;
  created_at: string;
  bus: {
    id: number;
    bus_code: string | null;
    plate_no: string | null;
    e_payment: number | null;
  } | null;
}

/* -------------------------------------------------
   GET /api/payments?busId=123  → old
        /api/payments          → new (all + bus)
   ------------------------------------------------- */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const busIdParam = searchParams.get('busId');

    // ---- 1. Legacy: ?busId=123 ----
    if (busIdParam) {
      const busId = parseInt(busIdParam, 10);
      if (isNaN(busId)) {
        return NextResponse.json({ error: 'Invalid bus ID' }, { status: 400 });
      }

      const payments = await prisma.payment.findMany({
        where: { bus: BigInt(busId) },
        orderBy: { created_at: 'desc' },
      });

      // Serialize any BigInts to avoid JSON issues
      return NextResponse.json(
        payments.map((p) => ({
          ...serializeBigInt(p),
          created_at: p.created_at instanceof Date ? p.created_at.toISOString() : p.created_at,
          payment_date: p.payment_date instanceof Date ? p.payment_date.toISOString().split('T')[0] : p.payment_date,
          // Add other fields if they sometimes come as Date objects.
        }))
      );
    }

    // ---- 2. New: All payments with bus details ----
    const rows = await prisma.payment.findMany({
      select: {
        id: true,
        amount: true,
        pay_type: true,
        pay_complete: true,
        created_at: true,
        coordinator: true,
        bus_rel: {                     // ← use the relation
          select: {
            id: true,
            bus_code: true,
            plate_no: true,
            e_payment: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const formatted: PaymentResponse[] = rows.map((p) => ({
      id: Number(p.id),
      amount: p.amount ? Number(p.amount) : null,
      pay_type: p.pay_type ?? null,
      pay_complete: p.pay_complete ?? null,
      coordinator: p.coordinator ?? null,
      created_at: p.created_at.toISOString(),
      bus: p.bus_rel
        ? {
            id: Number(p.bus_rel.id),
            bus_code: p.bus_rel.bus_code ?? null,
            plate_no: p.bus_rel.plate_no ?? null,
            e_payment: p.bus_rel.e_payment ? Number(p.bus_rel.e_payment) : null,
          }
        : null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

/* -------------------------------------------------
   POST /api/payments
   ------------------------------------------------- */
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      week,
      completed_by,
      coordinator,
      bus,           // ← this is bus ID (number)
      p_week,
      receipt,
      amount,
      sender,
      payment_day,
      payment_date,
      pay_type,
      pay_complete,
      issue,
      inspection,
    } = data;

    if (
      !week ||
      !completed_by ||
      !coordinator ||
      !bus ||
      !p_week ||
      !receipt ||
      !payment_day ||
      !payment_date ||
      !pay_type ||
      !pay_complete ||
      !issue ||
      !inspection
    ) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    await prisma.payment.create({
      data: {
        week: new Date(week),
        completed_by,
        coordinator,
        bus: BigInt(bus),           // ← FK column
        p_week,
        receipt,
        amount: amount ? Number(amount) : null,
        sender: sender || null,
        payment_day,
        payment_date: new Date(payment_date),
        pay_type,
        pay_complete,
        issue,
        inspection,
        created_at: new Date(),
      },
    });

    return NextResponse.json(
      { message: 'Payment submitted successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting payment:', error);
    return NextResponse.json(
      { error: 'Failed to submit payment' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Add serializeBigInt util, copied if needed:
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