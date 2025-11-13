'use client';

import { Bus, Calculator, Shield, Clock, Users, TrendingUp, FileText, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, Variants, easeOut, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface Page {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
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
  section_secondary_btn: string | null;
  team_img: string | null;
  team_text: string | null;
  team_role: string | null;
  team_text2: string | null;
  team_role2: string | null;
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
  section_head: string | null;
  section_primary_btn: string | null;
  hp: string[] | null;
  fm: string[] | null;
}

// Reusable In-View Animation Wrapper
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

export default function ServicesPage() {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/pages/services');
        const data = await res.json();
        if (res.ok) {
          setPage(data);
        } else {
          console.error('Error fetching page:', data.error);
        }
      } catch (error) {
        console.error('Error fetching service page:', error);
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
    );
  }

  if (!page) {
    return <div className="p-12 text-center text-red-500">Nothing to see here.</div>;
  }

  // === Animation Variants ===
  const heroVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1.2, ease: easeOut } },
  };

  const textSlideUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOut } },
  };

  const cardVariants: Variants = {
    hidden: (i: number) => ({ opacity: 0, x: i === 0 ? -50 : 50 }),
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.2, duration: 0.7, ease: easeOut },
    }),
  };

  const stepVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.2, duration: 0.6, ease: easeOut },
    }),
  };

  const featureVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.6, ease: easeOut },
    }),
  };

  const ctaVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.3 } },
  };

  return (
    <div className="playfair-display">
      {/* Hero Section */}
      <motion.div
        className="relative bg-cover bg-center bg-fixed bg-no-repeat min-h-[500px] flex items-center justify-center"
        style={{ backgroundImage: `url('/uploads/serv.jpg')` }}
        initial="hidden"
        animate="visible"
        variants={heroVariants}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent"></div>

        <motion.div
          className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 text-center"
          variants={textSlideUp}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg">
            {page.hero_big_black}{" "}
            <span className="text-primary dark:text-primary-light">{page.hero_big_primary}</span>
          </h1>
          <p className="mt-6 text-xl leading-8 text-gray-200 max-w-3xl mx-auto drop-shadow">
            {page.hero_text}
          </p>
        </motion.div>
      </motion.div>

      {/* Main Services */}
      <AnimatedSection>
        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              className="mx-auto max-w-2xl lg:text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-base font-semibold text-primary dark:text-primary-light">
                {page.body_sub_heading}
              </h2>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-300 sm:text-4xl">
                {page.body_heading}
              </p>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-400">{page.body_first_text}</p>
            </motion.div>

            <motion.div
              className="mx-auto mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {/* Higher Purchase */}
              <motion.div
                custom={0}
                variants={cardVariants}
                whileHover={{ y: -8 }}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg ring-1 ring-gray-900/5 p-8 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Bus className="h-8 w-8 text-primary dark:text-primary-light" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-300">{page.box_head}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{page.box_text}</p>
                <ul className="space-y-3 mb-6">
                  {page.hp?.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
                    </motion.li>
                  ))}
                </ul>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">{page.text}</span>
                  <Link href="/contact">
                    <Button className="bg-gradient-to-r from-gray-600 to-primary-light text-white hover:from-primary hover:to-primary-dark transform transition hover:scale-105">
                      {page.hero_primary_button}
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Fleet Management */}
              <motion.div
                custom={1}
                variants={cardVariants}
                whileHover={{ y: -8 }}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-xl ring-1 ring-gray-900/5 p-8 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-gray-600 to-primary-light group-hover:to-primary/30 transition-colors">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-300">{page.box_head2}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{page.box_text2}</p>
                <ul className="space-y-3 mb-6">
                  {page.fm?.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="h-2 w-2 rounded-full bg-gradient-to-r from-gray-600 to-primary-light"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
                    </motion.li>
                  ))}
                </ul>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">{page.hero_year}</span>
                  <Link href="/contact">
                    <Button variant="ghost" className="border-2 border-primary text-primary hover:bg-primary-dark hover:text-gray-200 transform transition hover:scale-105">
                      {page.hero_secondary_button}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Process Section */}
      <AnimatedSection>
        <div className="bg-gray-50 dark:bg-gray-900 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              className="mx-auto max-w-2xl lg:text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-base font-semibold text-primary dark:text-primary-light">How It Works</h2>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-300 sm:text-4xl">
                Simple 4-step process
              </p>
            </motion.div>

            <motion.div
              className="mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                { step: 1, title: page.box_head3, desc: page.box_text3 },
                { step: 2, title: page.box_head4, desc: page.box_text4 },
                { step: 3, title: page.box_head5, desc: page.box_text5 },
                { step: 4, title: page.box_head6, desc: page.box_text6 },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={stepVariants}
                  whileHover={{ scale: 1.05 }}
                  className="group text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: i * 0.2, type: "spring", stiffness: 200 }}
                    className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white mb-4"
                  >
                    {item.step}
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-300">{item.title}</h3>
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Features */}
      <AnimatedSection>
        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              className="mx-auto max-w-2xl lg:text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-base font-semibold text-primary dark:text-primary-light">
                {page.body_sub_heading3}
              </h2>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-300 sm:text-4xl">
                {page.body_heading3}
              </p>
            </motion.div>

            <motion.div
              className="mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                { icon: Calculator, title: page.box_head7, desc: page.box_text7 },
                { icon: Clock, title: page.box_head8, desc: page.box_text8 },
                { icon: Shield, title: page.box_head9, desc: page.box_text9 },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={featureVariants}
                  whileHover={{ y: -8 }}
                  className="group text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3, delay: i * 0.3 }}
                    className="inline-flex p-4 rounded-2xl bg-primary/10 mb-6"
                  >
                    <item.icon className="h-10 w-10 text-primary dark:text-primary-light" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-300">{item.title}</h3>
                  <p className="mt-3 text-gray-600 dark:text-gray-400">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Additional Services */}
      <AnimatedSection>
        <div className="bg-gray-50 dark:bg-gray-900 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              className="mx-auto max-w-2xl lg:text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-base font-semibold text-primary dark:text-primary-light">
                {page.body_sub_heading4}
              </h2>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-300 sm:text-4xl">
                {page.body_heading4}
              </p>
            </motion.div>

            <motion.div
              className="mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                { icon: FileText, title: page.team_role, desc: page.team_text },
                { icon: Headphones, title: page.team_role2, desc: page.team_text2 },
                { icon: Users, title: page.team_role3, desc: page.team_text3 },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={featureVariants}
                  whileHover={{ scale: 1.05 }}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg ring-1 ring-gray-900/5 p-6 transition-all"
                >
                  <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 inline-flex mb-4">
                    <item.icon className="h-8 w-8 text-primary dark:text-primary-light" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-300">{item.title}</h3>
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
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
        <div className="px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">{page.section_head}</h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-blue-100">{page.section_text}</p>
            <motion.div
              className="mt-10 flex justify-center gap-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-gray-600 to-primary-light text-gray-200 hover:from-white hover:to-white hover:text-primary transform transition duration-300 ease-in-out hover:scale-105"
                >
                  {page.hero_primary_button}
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  variant="ghost"
                  size="lg"
                  className="border-2 border-white text-gray-200 hover:bg-gray-200 hover:text-primary hover:border-none transform transition duration-300 ease-in-out hover:scale-105"
                >
                  {page.hero_secondary_button}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}