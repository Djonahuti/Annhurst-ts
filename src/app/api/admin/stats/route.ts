import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PrismaPage {
  id: bigint;
  title: string;
  slug: string;
  is_published: boolean | null;
  updated_at: Date;
  views: number;
}

interface PrismaPayment {
  amount: bigint | null;
}

export async function GET() {
  try {
    const pages: PrismaPage[] = await prisma.pages.findMany({
      select: { id: true, title: true, slug: true, is_published: true, updated_at: true, views: true },
      orderBy: { updated_at: 'desc' },
    });

    const admins = await prisma.admins.count();
    const coordinators = await prisma.coordinators.count();
    const drivers = await prisma.driver.count();
    const totalUsers = admins + coordinators + drivers;

    const payments: PrismaPayment[] = await prisma.payment.findMany({ select: { amount: true } });
    const buses = await prisma.buses.findMany({ select: { id: true } });

    const totalRevenue = payments.reduce((sum: number, p: PrismaPayment) => sum + Number(p.amount || 0), 0);

    const stats = {
      totalPages: pages.length,
      publishedPages: pages.filter((p: PrismaPage) => p.is_published).length,
      totalUsers,
      totalBuses: buses.length,
      totalRevenue,
    };

    const recentPages = pages.slice(0, 3).map((p: PrismaPage) => ({
      id: p.id.toString(),
      title: p.title,
      slug: p.slug,
      status: p.is_published ? 'published' : 'draft',
      lastModified: p.updated_at ? p.updated_at.toISOString().split('T')[0] : '',
      views: p.views,
    }));

    return NextResponse.json({ stats, recentPages });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}