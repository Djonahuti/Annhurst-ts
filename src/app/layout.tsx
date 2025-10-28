import './globals.css';
import type { ReactNode } from 'react';
import { Inter, Playfair_Display } from 'next/font/google';
import { cn } from '@/lib/utils';
import { PrismaClient } from '@prisma/client';
import { Providers } from '@/components/Shared/Providers';

const inter = Inter({ subsets: ['latin'] });
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
});

export const metadata = {
  title: 'Annhurst Transport Limited',
  description: 'Annhurst Transport Service Limited provides comprehensive bus higher purchase solutions for transportation businesses.',
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: ReactNode }) {
  const prisma = new PrismaClient();
  try {
    // Fetch logo from settings table
    const settings = await prisma.settings.findFirst({ select: { logo_blk: true } });
    let faviconUrl: string | undefined = undefined;
    let faviconType: string | undefined = undefined;

    if (settings?.logo_blk) {
      // Construct URL based on Multer's storage path (public/uploads)
      faviconUrl = `/uploads/${settings.logo_blk.split('/').pop()}`; // Extract filename from path
      // Detect file extension and set MIME type
      if (settings.logo_blk.endsWith('.svg')) {
        faviconType = 'image/svg+xml';
      } else if (settings.logo_blk.endsWith('.jpg') || settings.logo_blk.endsWith('.jpeg')) {
        faviconType = 'image/jpeg';
      } else if (settings.logo_blk.endsWith('.png')) {
        faviconType = 'image/png';
      } else if (settings.logo_blk.endsWith('.ico')) {
        faviconType = 'image/x-icon';
      }
    }

    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          {faviconUrl && (
            <link
              key="favicon"
              rel="icon"
              href={faviconUrl}
              {...(faviconType ? { type: faviconType } : {})}
            />
          )}
        </head>
        <body className={cn(inter.className, playfairDisplay.variable, 'bg-background text-foreground')}>
          <Providers>{children}</Providers>
        </body>
      </html>
    );
  } finally {
    await prisma.$disconnect();
  }
}
