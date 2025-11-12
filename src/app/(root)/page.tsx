'use client'
import Link from 'next/link';
import { Bus, Shield, Clock, Users, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import HeroSection from '@/components/HeroSection'
import { useEffect, useState } from 'react'
import { motion, useAnimation, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

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
  body_sub_heading: string | null
  body_first_text: string | null
  body_second_text: string | null
  body_heading2: string | null
  body_sub_heading2: string | null
  body_heading3: string | null
  body_sub_heading3: string | null
  body_heading4: string | null
  body_sub_heading4: string | null
  section_text: string | null
  section_secondary_btn: string | null
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
  section_head: string | null
  section_primary_btn: string | null
}

// Reusable Section Wrapper with In-View Trigger
const AnimatedSection = ({ children }: { children: React.ReactNode }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [controls, inView]);

  return (
    <motion.div ref={ref} initial="hidden" animate={controls}>
      {children}
    </motion.div>
  );
};

export default function HomePage() {
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

  // Variants
  const headingVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' },
    }),
  };

  const serviceCardVariants: Variants = {
    hidden: (i: number) => ({ opacity: 0, x: i === 0 ? -50 : 50 }),
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.2, duration: 0.7, ease: 'easeOut' },
    }),
  };

  const statVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
  };

  const ctaVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.3 } },
  };

  return (
    <div className="playfair-display">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <AnimatedSection>
        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              className="mx-auto max-w-2xl lg:text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={headingVariants}
            >
              <h2 className="text-base font-semibold leading-7 text-primary-light">
                {page.body_sub_heading}
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-300 sm:text-4xl">
                {page.body_heading}
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
                {page.body_first_text}
              </p>
            </motion.div>

            <motion.div
              className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
            >
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {[
                  { icon: Shield, head: page.box_head, text: page.box_text },
                  { icon: Clock, head: page.box_head2, text: page.box_text2 },
                  { icon: Users, head: page.box_head3, text: page.box_text3 },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={cardVariants}
                    whileHover={{ scale: 1.05 }}
                    className="flex flex-col p-4 rounded-lg transition-all duration-300 shadow-lg"
                  >
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-gray-300">
                      <item.icon className="h-5 w-5 flex-none text-primary dark:text-primary-light" />
                      {item.head}
                    </dt>
                    <dd className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-400">
                      <p>{item.text}</p>
                    </dd>
                  </motion.div>
                ))}
              </dl>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Services Overview */}
      <AnimatedSection>
        <div className="bg-gray-50 dark:bg-gray-900 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              className="mx-auto max-w-2xl lg:text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={headingVariants}
            >
              <h2 className="text-base font-semibold leading-7 text-primary dark:text-primary-light">
                {page.body_sub_heading2}
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-300 sm:text-4xl">
                {page.body_heading2}
              </p>
            </motion.div>

            <motion.div
              className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {[
                  { icon: Bus, head: page.box_head4, text: page.box_text4 },
                  { icon: TrendingUp, head: page.box_head5, text: page.box_text5 },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={serviceCardVariants}
                    whileHover={{ scale: 1.05, borderColor: 'rgb(239 68 68)' }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-900/5 p-8 transition-all duration-300"
                  >
                    <div className="flex items-center gap-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary dark:bg-primary-light">
                        <item.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold leading-7 text-gray-900 dark:text-gray-300">
                        {item.head}
                      </h3>
                    </div>
                    <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-400">
                      {item.text}
                    </p>
                    <div className="mt-6">
                      <Link href="/services" className="text-primary dark:text-primary-light hover:text-primary-dark font-medium">
                        {page.section_secondary_btn} →
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Stats Section with Count-Up */}
      <AnimatedSection>
        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              className="mx-auto max-w-2xl lg:max-w-none text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={headingVariants}
            >
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-300 sm:text-4xl">
                {page.body_heading3}
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
                {page.body_sub_heading3}
              </p>
            </motion.div>

            <motion.dl
              className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                { value: page.box_head6, label: page.box_text6 },
                { value: page.box_head7, label: page.box_text7 },
                { value: page.box_head8, label: page.box_text8 },
                { value: page.box_head9, label: page.box_text9 },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={statVariants}
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col bg-gray-400/5 p-8 rounded-lg transition-all"
                >
                  <dt className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </dt>
                  <dd className="order-first text-3xl font-bold tracking-tight text-primary dark:text-primary-light">
                    <CountUp end={parseInt(stat.value?.replace(/\D/g, '') || '0', 10)} />
                    {stat.value?.replace(/\d/g, '')}
                  </dd>
                </motion.div>
              ))}
            </motion.dl>
          </div>
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      <motion.div
        className="bg-gradient-to-r from-gray-600 to-primary-light shimmer-effect"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={ctaVariants}
      >
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {page.section_head}
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-red-100">
              {page.section_text}
            </p>
            <motion.div
              className="mt-10 flex items-center justify-center gap-x-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-gray-600 to-primary-light text-gray-200 hover:from-white hover:to-white hover:text-primary transform transition duration-300 ease-in-out hover:scale-105"
                >
                  {page.section_primary_btn}
                </Button>
              </Link>
              <Link href="/services">
                <Button
                  variant="ghost"
                  size="lg"
                  className="border-2 border-white text-gray-200 dark:hover:bg-gray-200 dark:hover:text-primary hover:bg-gray-200 hover:text-primary hover:border-none transform transition duration-300 ease-in-out hover:scale-105"
                >
                  {page.section_secondary_btn}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Simple Count-Up Component
const CountUp = ({ end }: { end: number }) => {
  const [count, setCount] = useState(0);
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true });

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        transition: { duration: 0.1 },
      });
      let start = 0;
      const increment = end / 50;
      const timer = setInterval(() => {
        start += increment;
        if (start > end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 30);
      return () => clearInterval(timer);
    }
  }, [inView, end, controls]);

  return (
    <motion.span ref={ref} animate={controls}>
      {count}
    </motion.span>
  );
}; 