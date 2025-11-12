"use client";

import { Target, Eye, Users, Award, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, type Variants, easeOut, useAnimation } from "framer-motion";
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
  body_heading: string | null;
  body_first_text: string | null;
  body_second_text: string | null;
  body_heading2: string | null;
  body_sub_heading2: string | null;
  body_heading3: string | null;
  body_sub_heading3: string | null;
  body_heading4: string | null;
  body_sub_heading4: string | null;
  section_text: string | null;
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
}

// Reusable In-View Animation Wrapper
const AnimatedSection = ({ children }: { children: React.ReactNode }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [controls, inView]);

  return (
    <motion.div ref={ref} initial="hidden" animate={controls}>
      {children}
    </motion.div>
  );
};

export default function AboutPage() {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/pages/about');
        const data = await res.json();
        if (res.ok) {
          setPage(data);
        } else {
          console.error('Error fetching page:', data.error);
        }
      } catch (error) {
        console.error('Error fetching about page:', error);
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
    return <div className="p-12 text-center text-red-500">About page not found.</div>;
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

  const imageZoom: Variants = {
    hidden: { scale: 1.1, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 1, ease: easeOut } },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.6, ease: easeOut },
    }),
  };

  const teamVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.2, duration: 0.6, ease: easeOut },
    }),
  };

  const statVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.1, duration: 0.5, ease: easeOut },
    }),
  };

  return (
    <div className="playfair-display">
      {/* Hero Section */}
      <motion.div
        className="relative bg-cover bg-center bg-fixed bg-no-repeat min-h-[500px] flex items-center justify-center"
        style={{ backgroundImage: `url('/uploads/buses.jpg')` }}
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

      {/* Company Story */}
      <AnimatedSection>
        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-primary-light">
                  {page.body_heading}
                </h2>
                <p className="mt-6 text-lg text-gray-600 dark:text-gray-400">{page.body_first_text}</p>
                <p className="mt-6 text-lg text-gray-600 dark:text-gray-400">{page.body_second_text}</p>
              </motion.div>

              <motion.div
                className="relative overflow-hidden rounded-2xl shadow-2xl"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={imageZoom}
              >
                <div
                  className="aspect-[4/3] bg-cover bg-center"
                  style={{ backgroundImage: `url('/uploads/ab.png')` }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Mission & Vision */}
      <AnimatedSection>
        <div className="bg-gray-50 dark:bg-gray-900 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              className="mx-auto max-w-2xl lg:text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-base font-semibold text-primary dark:text-primary-light">
                {page.body_sub_heading2}
              </h2>
              <p className="mt-2 text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-300">
                {page.body_heading2}
              </p>
            </motion.div>

            <motion.div
              className="mx-auto mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                { icon: Target, title: page.box_head, desc: page.box_text },
                { icon: Eye, title: page.box_head2, desc: page.box_text2 },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={cardVariants}
                  whileHover={{ scale: 1.03 }}
                  className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <item.icon className="h-8 w-8 text-primary dark:text-primary-light" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-300">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </AnimatedSection> 

      {/* Values */}
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
                {page.body_sub_heading3}
              </h2>
              <p className="mt-2 text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-300">
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
                { icon: Users, title: page.box_head3, desc: page.box_text3 },
                { icon: Award, title: page.box_head4, desc: page.box_text4 },
                { icon: Globe, title: page.box_head5, desc: page.box_text5 },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={cardVariants}
                  whileHover={{ y: -8 }}
                  className="group text-center p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4, delay: i * 0.3 }}
                    className="inline-flex p-4 rounded-2xl bg-primary/10 mb-6"
                  >
                    <item.icon className="h-10 w-10 text-primary dark:text-primary-light" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-300">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-gray-600 dark:text-gray-400">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Team Section */}
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
              <p className="mt-2 text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-300">
                {page.body_heading4}
              </p>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-400">{page.section_text}</p>
            </motion.div>

            <motion.div
              className="mx-auto mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                { name: page.team_role, title: page.team_text },
                { name: page.team_role2, title: page.team_text2 },
                { name: page.team_role3, title: page.team_text3 },
              ].map((member, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={teamVariants}
                  whileHover={{ scale: 1.05 }}
                  className="text-center group"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="mx-auto h-32 w-32 rounded-full bg-gradient-to-br from-primary to-primary-light p-1 mb-6 shadow-lg"
                  >
                    <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                      <Users className="h-16 w-16 text-gray-400" />
                    </div>
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-300">
                    {member.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{member.title}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Stats */}
      <AnimatedSection>
        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.h2
              className="text-center text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {page.text}
            </motion.h2>

            <motion.dl
              className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                { label: page.box_text6, value: page.box_head6 },
                { label: page.box_text7, value: page.box_head7 },
                { label: page.box_text8, value: page.box_head8 },
                { label: page.box_text9, value: page.box_head9 },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={statVariants}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-md"
                >
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </dt>
                  <dd className="mt-2 text-3xl font-bold text-primary dark:text-primary-light">
                    <CountUp end={parseInt(stat.value?.replace(/\D/g, '') || '0', 10)} />
                    {stat.value?.replace(/\d/g, '')}
                  </dd>
                </motion.div>
              ))}
            </motion.dl>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}

// Count-Up Component
const CountUp = ({ end }: { end: number }) => {
  const [count, setCount] = useState(0);
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true });

  useEffect(() => {
    if (inView && end > 0) {
      let start = 0;
      const increment = end / 60;
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 30);
      return () => clearInterval(timer);
    }
  }, [inView, end]);

  return <motion.span ref={ref}>{count}</motion.span>;
};