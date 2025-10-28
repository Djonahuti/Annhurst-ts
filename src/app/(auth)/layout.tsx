import { ReactNode } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';


type Settings = {
  logo?: string | null;
  logo_blk?: string | null;
  footer_write?: string | null;
  footer_head?: string | null;
  email?: string[] | null;
  phone?: string[] | null;
  bottom_left?: string | null;
};

const prisma = new PrismaClient();

export default async function AuthLayout({ children }: { children: ReactNode }) {
  let settings: Settings = {};

  try {
    const settingsData = await prisma.settings.findFirst({
      select: {
        logo: true,
        logo_blk: true,
        footer_write: true,
        footer_head: true,
        email: true,
        phone: true,
        bottom_left: true,
      },
    });

    settings = {
      logo: settingsData?.logo || null,
      logo_blk: settingsData?.logo_blk || null,
      footer_write: settingsData?.footer_write || null,
      footer_head: settingsData?.footer_head || null,
      email: settingsData?.email || null,
      phone: settingsData?.phone || null,
      bottom_left: settingsData?.bottom_left || null,
    };
  } catch (error) {
    console.error('Error fetching settings:', error);
  } finally {
    await prisma.$disconnect();
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 bg-gradient-to-r dark:from-gray-400 dark:to-red-300">
      <Card className="w-full max-w-md space-y-8 p-4">
        <CardContent>{children}</CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You Have a Bus, but don&apos;t have Login Credentials?{' '}
            <Link href="/contact" className="text-primary hover:underline">
              Contact your coordinator
            </Link>
          </p>
        </CardFooter> 

      <div className="mt-6 text-center">
        {settings.bottom_left && (
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} {settings.bottom_left || "Company"}
          </p>
        )}
      </div>               
      </Card>
    </div>
  );
}