import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const paymentId = BigInt(params.id);
  const { pay_complete } = await request.json();

  try {
    await prisma.payment.update({
      where: { id: paymentId },
      data: { pay_complete },
    });
    return NextResponse.json({ message: 'Payment updated' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}