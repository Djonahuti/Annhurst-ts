import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PrismaPage {
  id: number;
  title: string;
  slug: string;
  is_published: boolean;
  meta_description: string | null;
  text: string | null;
  hero_big_black: string | null;
  hero_big_primary: string | null;
  hero_text: string | null;
  hero_year: string | null;
  hero_year_span: string | null;
  hero_100: string | null;
  hero_100_span: string | null;
  hero_24: string | null;
  hero_24_span: string | null;
  hero_primary_button: string | null;
  hero_secondary_button: string | null;
  body_heading: string | null;
  body_sub_heading: string | null;
  body_first_text: string | null;
  body_second_text: string | null;
  body_heading2: string | null;
  body_sub_heading2: string | null;
  body_heading3: string | null;
  body_sub_heading3: string | null;
  body_heading4: string | null;
  body_sub_heading4: string | null;
  section_text: string | null;
  section_head: string | null;
  section_primary_btn: string | null;
  section_secondary_btn: string | null;
  team_img: string | null;
  team_text: string | null;
  team_role: string | null;
  team_img2: string | null;
  team_text2: string | null;
  team_role2: string | null;
  team_img3: string | null;
  team_text3: string | null;
  team_role3: string | null;
  box_head: string | null;
  box_text: string | null;
  box_head2: string | null;
  box_text2: string | null;
  box_head3: string | null;
  box_text3: string | null;
  box_head4: string | null;
  box_text4: string | null;
  box_head5: string | null;
  box_text5: string | null;
  box_head6: string | null;
  box_text6: string | null;
  box_head7: string | null;
  box_text7: string | null;
  box_head8: string | null;
  box_text8: string | null;
  box_head9: string | null;
  box_text9: string | null;
}

export async function GET() {
  try {
    const page = await prisma.pages.findFirst({
      where: {
        slug: 'contact',
        is_published: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        is_published: true,
        meta_description: true,
        text: true,
        hero_big_black: true,
        hero_big_primary: true,
        hero_text: true,
        hero_year: true,
        hero_year_span: true,
        hero_100: true,
        hero_100_span: true,
        hero_24: true,
        hero_24_span: true,
        hero_primary_button: true,
        hero_secondary_button: true,
        body_heading: true,
        body_sub_heading: true,
        body_first_text: true,
        body_second_text: true,
        body_heading2: true,
        body_sub_heading2: true,
        body_heading3: true,
        body_sub_heading3: true,
        body_heading4: true,
        body_sub_heading4: true,
        section_text: true,
        section_head: true,
        section_primary_btn: true,
        section_secondary_btn: true,
        team_img: true,
        team_text: true,
        team_role: true,
        team_img2: true,
        team_text2: true,
        team_role2: true,
        team_img3: true,
        team_text3: true,
        team_role3: true,
        box_head: true,
        box_text: true,
        box_head2: true,
        box_text2: true,
        box_head3: true,
        box_text3: true,
        box_head4: true,
        box_text4: true,
        box_head5: true,
        box_text5: true,
        box_head6: true,
        box_text6: true,
        box_head7: true,
        box_text7: true,
        box_head8: true,
        box_text8: true,
        box_head9: true,
        box_text9: true,
      },
    });

    if (!page) {
      return NextResponse.json({ error: 'Contact page not found' }, { status: 404 });
    }

    // Convert image paths to URLs (e.g., /uploads/filename)
    const pageWithUrls = {
      ...page,
      id: page.id.toString(),
    };

    return NextResponse.json(pageWithUrls);
  } catch (error) {
    console.error('Error fetching contact page:', error);
    return NextResponse.json({ error: 'Failed to fetch contact page' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}