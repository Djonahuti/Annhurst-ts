import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/* -------------------------------------------------
   Shared response type (matches frontend interface)
   ------------------------------------------------- */
export interface SettingsResponse {
  id: number;
  logo: string | null;
  logo_blk: string | null;
  footer_write: string | null;
  footer_head: string | null;
  footer_head2: string | null;
  services: string[] | null;
  phone: string[] | null;
  email: string[] | null;
  address: string | null;
  bottom_left: string | null;
  bottom_right: string[] | null;
}

/* -------------------------------------------------
   GET /api/settings
   → returns current settings
   ------------------------------------------------- */
export async function GET() {
  try {
    const settings = await prisma.settings.findFirst();

    if (!settings) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    }

    const response: SettingsResponse = {
      id: typeof settings.id === 'bigint' ? Number(settings.id) : settings.id,
      logo: settings.logo ?? null,
      logo_blk: settings.logo_blk ?? null,
      footer_write: settings.footer_write ?? null,
      footer_head: settings.footer_head ?? null,
      footer_head2: settings.footer_head2 ?? null,
      services: (settings.services as string[] | null) ?? null,
      phone: (settings.phone as string[] | null) ?? null,
      email: (settings.email as string[] | null) ?? null,
      address: settings.address ?? null,
      bottom_left: settings.bottom_left ?? null,
      bottom_right: (settings.bottom_right as string[] | null) ?? null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

/* -------------------------------------------------
   PATCH /api/settings
   → update settings (used by Edit page)
   ------------------------------------------------- */
export async function PATCH(request: Request) {
  try {
    const data: Partial<SettingsResponse> = await request.json();

    const updated = await prisma.settings.update({
      where: { id: 1 }, // assuming single row
      data: {
        logo: data.logo ?? undefined,
        logo_blk: data.logo_blk ?? undefined,
        footer_write: data.footer_write ?? undefined,
        footer_head: data.footer_head ?? undefined,
        footer_head2: data.footer_head2 ?? undefined,
        services: data.services ?? undefined,
        phone: data.phone ?? undefined,
        email: data.email ?? undefined,
        address: data.address ?? undefined,
        bottom_left: data.bottom_left ?? undefined,
        bottom_right: data.bottom_right ?? undefined,
      },
    });

    const response: SettingsResponse = {
      id: typeof updated.id === 'bigint' ? Number(updated.id) : updated.id,
      logo: updated.logo ?? null,
      logo_blk: updated.logo_blk ?? null,
      footer_write: updated.footer_write ?? null,
      footer_head: updated.footer_head ?? null,
      footer_head2: updated.footer_head2 ?? null,
      services: (updated.services as string[] | null) ?? null,
      phone: (updated.phone as string[] | null) ?? null,
      email: (updated.email as string[] | null) ?? null,
      address: updated.address ?? null,
      bottom_left: updated.bottom_left ?? null,
      bottom_right: (updated.bottom_right as string[] | null) ?? null,
    };

    return NextResponse.json(response);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    }
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}