"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Star, Smile } from "lucide-react"
import Link from 'next/link';
import { Button } from "./ui/button"
import { useEffect, useState } from "react"
import { motion, type Variants, easeOut } from "framer-motion";

interface Page {
  id: string
  title: string
  slug: string
  is_published: boolean
  text: string | null
  hero_big_black: string | null
  hero_big_primary: string | null
  hero_text: string | null
  hero_year: string | null
  hero_year_span: string | null
  hero_100: string | null
  hero_100_span: string | null
  hero_24: string | null
  hero_24_span: string | null
  hero_primary_button: string | null
  hero_secondary_button: string | null
  body_heading: string | null
  body_first_text: string | null
  body_second_text: string | null
  body_heading2: string | null
  body_sub_heading2: string | null
  body_heading3: string | null
  body_sub_heading3: string | null
  body_heading4: string | null
  body_sub_heading4: string | null
  section_text: string | null
  team_img: string | null
  team_text: string | null
  team_role: string | null
  team_text2: string | null
  team_role2: string | null
  team_text3: string | null
  team_role3: string | null
  box_head: string | null
  box_text: string | null
  box_head2: string | null
  box_text2: string | null
  box_head3: string | null
  box_text3: string | null
  box_head4: string | null
  box_text4: string | null
  box_head5: string | null
  box_text5: string | null
  box_head6: string | null
  box_text6: string | null
  box_head7: string | null
  box_text7: string | null
  box_head8: string | null
  box_text8: string | null
  box_head9: string | null
  box_text9: string | null
}

export default function HeroSection() {
  const [page, setPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/pages/home');
        const data = await res.json();
        if (res.ok) {
          setPage(data);
        } else {
          console.error('Error fetching page:', data.error);
        }
      } catch (error) {
        console.error('Error fetching home page:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!page) {
    return <div className="p-12 text-center text-red-500">Nothing to see here.</div>
  }

  // Animation Variants
  const textVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: easeOut },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3 + i * 0.2,
        duration: 0.6,
        ease: easeOut,
      },
    }),
  };

  const metricsVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.7 + i * 0.15,
        duration: 0.5,
        ease: easeOut,
      },
    }),
  };

  return (
<section className="relative min-h-[600px] flex items-center bg-cover bg-center bg-no-repeat"
  style={{ 
    backgroundImage: `url('/uploads/banner.jpg')` 
  }}
>
  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-black/40 dark:bg-black/30"></div>

      <div className="container relative z-10 mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12">
          {/* Text Content */}
          <motion.div
            className="max-w-2xl flex-1"
            initial="hidden"
            animate="visible"
            variants={textVariants}
          >
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900">
              {page.hero_big_black}{" "}
              <span className="text-primary underline decoration-primary dark:text-primary-light dark:decoration-primary-light">
                {page.hero_big_primary}
              </span>
            </h1>
            <p className="mt-6 text-lg text-gray-100 dark:text-gray bg-black/30 p-4 rounded-md">
              {page.hero_text}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link href="/services">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-gray-600 to-primary-light text-gray-200 hover:from-primary-dark hover:to-primary-dark transform transition duration-300 ease-in-out hover:scale-105"
                >
                  {page.hero_primary_button}
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="ghost"
                  size="lg"
                  className="border-2 border-primary text-primary hover:bg-primary-dark hover:text-gray-200 dark:hover:text-gray-200 dark:border-primary-light dark:text-primary-light dark:hover:bg-primary-light hover:border-none transform transition duration-300 ease-in-out hover:scale-105"
                >
                  {page.hero_secondary_button}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Cards Row */}
          <div className="flex flex-col md:flex-row gap-6 flex-1 justify-center lg:justify-end">
            {/* Investment Success Card */}
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <Card className="w-64 shadow-lg backdrop-blur-sm border-0 bg-black/30 dark:bg-black/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-primary dark:text-primary-light" />
                    <h3 className="font-semibold text-gray-200">{page.text}</h3>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-primary dark:text-primary-light font-semibold">{page.body_second_text}</span>
                    <span className="text-gray-300 dark:text-gray-200">{page.team_img}</span>
                  </div>
                  <Progress value={80} className="mt-3 h-2" />
                </CardContent>
              </Card>
            </motion.div>

            {/* Customer Satisfaction Card */}
            <motion.div
              custom={1}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <Card className="w-64 shadow-lg backdrop-blur-sm border-0 bg-black/30 dark:bg-black/50">
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Smile className="w-6 h-6 text-primary dark:text-primary-light" />
                    <h3 className="font-semibold text-gray-200">{page.team_text}</h3>
                    <p className="text-3xl font-bold text-primary dark:text-primary-light">{page.team_role}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Metrics Row */}
        <motion.div
          className="mt-14 flex flex-wrap gap-8 md:gap-12 justify-center lg:justify-start text-primary dark:text-primary-light font-bold text-2xl"
          initial="hidden"
          animate="visible"
        >
          {[page.hero_year, page.hero_100, page.hero_24].map((value, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={metricsVariants}
              className="text-center min-w-[100px] bg-black/50 p-6 rounded-md"
            >
              {value}
              <br />
              <span className="text-gray-300 underline decoration-primary text-xs">
                {[page.hero_year_span, page.hero_100_span, page.hero_24_span][i]}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
</section>

  )
}