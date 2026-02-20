'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Shield,
  LayoutDashboard,
  Award,
  Heart,
  Globe,
  Headphones,
  Briefcase,
  User,
  Building2,
  GraduationCap,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Star,
} from 'lucide-react';

/* =============================================
   Hero carousel images
   ============================================= */
const heroImages = [
  {
    src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80',
    alt: 'Financial dashboard and analytics',
  },
  {
    src: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1920&q=80',
    alt: 'Credit card and digital finance',
  },
  {
    src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80',
    alt: 'Stock market and trading data',
  },
  {
    src: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1920&q=80',
    alt: 'Banking and money management',
  },
  {
    src: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=1920&q=80',
    alt: 'Finance charts and analysis',
  },
];

/* =============================================
   Animated Counter Hook
   ============================================= */
function useCounter(end: number, duration: number = 2000, inView: boolean) {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;

    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDone(true);
      }
    };
    requestAnimationFrame(step);
  }, [end, duration, inView]);

  return { count, done };
}

/* =============================================
   Typing effect component
   ============================================= */
function TypingText({ text, className = '' }: { text: string; className?: string }) {
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const hasTyped = useRef(false);

  useEffect(() => {
    if (!isInView || hasTyped.current) return;
    hasTyped.current = true;
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [isInView, text]);

  useEffect(() => {
    const blink = setInterval(() => setShowCursor((p) => !p), 530);
    return () => clearInterval(blink);
  }, []);

  return (
    <span ref={ref} className={className}>
      {displayed}
      <span
        className="inline-block w-[2px] h-[1em] bg-[#FFD700] ml-0.5 align-middle"
        style={{ opacity: showCursor ? 1 : 0, transition: 'opacity 0.1s' }}
      />
    </span>
  );
}

/* =============================================
   Staggered word reveal component
   ============================================= */
const wordContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const wordVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

function StaggeredHeading({
  children,
  className = '',
}: {
  children: string;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const words = children.split(' ');

  return (
    <motion.span
      ref={ref}
      variants={wordContainerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {words.map((word, i) => (
        <motion.span key={i} variants={wordVariants} className="inline-block mr-[0.3em]">
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* =============================================
   Section Wrapper with parallax
   ============================================= */
function AnimatedSection({
  children,
  className = '',
  delay = 0,
  parallaxSpeed = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  parallaxSpeed?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [parallaxSpeed * 30, parallaxSpeed * -30]);

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay }}
      className={`will-change-transform ${className}`}
      style={parallaxSpeed ? { y } : undefined}
    >
      {children}
    </motion.section>
  );
}

/* =============================================
   Wave Section Divider
   ============================================= */
function WaveDivider({ flip = false }: { flip?: boolean }) {
  return (
    <div className={`relative w-full h-16 md:h-24 overflow-hidden ${flip ? 'rotate-180' : ''}`}>
      <svg
        viewBox="0 0 1440 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute bottom-0 w-full h-full"
        preserveAspectRatio="none"
      >
        <path
          d="M0,50 C360,100 720,0 1080,50 C1260,75 1380,60 1440,50 L1440,100 L0,100 Z"
          fill="url(#waveGrad)"
          fillOpacity="0.1"
        />
        <defs>
          <linearGradient id="waveGrad" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00D4FF" />
            <stop offset="50%" stopColor="#7B5EA7" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/* =============================================
   Feature Card with 3D tilt
   ============================================= */
function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX((y - centerY) / centerY * -8);
    setRotateY((x - centerX) / centerX * 8);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setRotateX(0);
    setRotateY(0);
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.06,
      }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: 'transform 0.1s ease-out',
        }}
        className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-7
                   hover:border-[#00D4FF]/30 hover:shadow-[0_0_30px_rgba(0,212,255,0.08)]
                   transition-all duration-200 cursor-default h-full will-change-transform"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D4FF]/20 to-[#7B5EA7]/20 flex items-center justify-center mb-5
                        group-hover:from-[#00D4FF]/30 group-hover:to-[#7B5EA7]/30 transition-all duration-300">
          <Icon className="w-6 h-6 text-[#00D4FF]" />
        </div>
        <h3 className="font-['Sora'] text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-white/50 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

/* =============================================
   Grant Card with 3D tilt
   ============================================= */
function GrantCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX((y - centerY) / centerY * -6);
    setRotateY((x - centerX) / centerX * 6);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setRotateX(0);
    setRotateY(0);
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.05,
      }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: 'transform 0.1s ease-out',
        }}
        className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6
                   hover:border-[#FFD700]/30 hover:shadow-[0_0_30px_rgba(255,215,0,0.06)]
                   transition-all duration-200 cursor-default h-full will-change-transform"
      >
        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#FFD700]/20 to-[#7B5EA7]/20 flex items-center justify-center mb-4
                        group-hover:from-[#FFD700]/30 group-hover:to-[#7B5EA7]/30 transition-all duration-300">
          <Icon className="w-5 h-5 text-[#FFD700]" />
        </div>
        <h3 className="font-['Sora'] text-base font-semibold text-white mb-1.5">{title}</h3>
        <p className="text-white/45 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

/* =============================================
   Testimonial Card
   ============================================= */
function TestimonialCard({
  quote,
  name,
  role,
  index,
}: {
  quote: string;
  name: string;
  role: string;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.08,
      }}
      className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8
                 hover:border-white/20 transition-all duration-200"
    >
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-[#FFD700] text-[#FFD700]" />
        ))}
      </div>
      <p className="text-white/70 text-sm leading-relaxed mb-6 italic">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#7B5EA7] flex items-center justify-center">
          <span className="text-white font-semibold text-sm">{name.charAt(0)}</span>
        </div>
        <div>
          <p className="text-white text-sm font-semibold">{name}</p>
          <p className="text-white/40 text-xs">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* =============================================
   Stat Counter with glow pulse
   ============================================= */
function StatCounter({
  end,
  suffix,
  prefix,
  label,
  index,
}: {
  end: number;
  suffix?: string;
  prefix?: string;
  label: string;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const { count, done } = useCounter(end, 2000, isInView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="text-center"
    >
      <motion.p
        animate={
          done
            ? {
                textShadow: [
                  '0 0 0px rgba(0,212,255,0)',
                  '0 0 20px rgba(0,212,255,0.5)',
                  '0 0 0px rgba(0,212,255,0)',
                ],
              }
            : {}
        }
        transition={done ? { duration: 1.5, ease: 'easeInOut' } : {}}
        className="font-['Sora'] text-3xl md:text-4xl font-bold text-white mb-1"
      >
        {prefix}
        {count.toLocaleString()}
        {suffix}
      </motion.p>
      <p className="text-white/40 text-sm">{label}</p>
    </motion.div>
  );
}

/* =============================================
   Shimmer Button wrapper
   ============================================= */
function ShimmerButton({
  children,
  href,
  className = '',
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <Link href={href} className={`relative overflow-hidden group ${className}`}>
      {children}
      <span
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700
                   bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
      />
    </Link>
  );
}

/* =============================================
   Scale-on-scroll image wrapper
   ============================================= */
function ScaleImage({
  src,
  alt,
  className = '',
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.02, 1.06, 1.02]);

  return (
    <motion.div ref={ref} style={{ scale }} className={`overflow-hidden will-change-transform ${className}`}>
      <Image src={src} alt={alt} fill className="object-cover" priority={priority} sizes="100vw" />
    </motion.div>
  );
}

/* =============================================
   MAIN PAGE COMPONENT
   ============================================= */
export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  /* ---------- Hero Image Carousel ---------- */
  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  /* ---------- Hero Counter Refs ---------- */
  const heroCounterRef = useRef(null);
  const heroCounterInView = useInView(heroCounterRef, { once: true });
  const { count: managedCount } = useCounter(2400, 2000, heroCounterInView);
  const { count: usersCount } = useCounter(150, 2000, heroCounterInView);
  const { count: countriesCount } = useCounter(98, 2000, heroCounterInView);

  /* ---------- Testimonials auto-slide ---------- */
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const testimonials = [
    {
      quote:
        'NexaVault transformed how I manage my finances. The real-time dashboard gives me complete visibility and control over every transaction.',
      name: 'Sarah Chen',
      role: 'Entrepreneur, San Francisco',
    },
    {
      quote:
        'Accessing grant funding through NexaVault was seamless. Within weeks I had the capital I needed to scale my business globally.',
      name: 'Marcus Okonkwo',
      role: 'CEO, Lagos Tech Hub',
    },
    {
      quote:
        'The security features are unmatched. I sleep well knowing my assets are protected by bank-grade encryption and 24/7 monitoring.',
      name: 'Elena Vasquez',
      role: 'Investment Advisor, Madrid',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  /* ---------- Features Data ---------- */
  const features = [
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description:
        '256-bit AES encryption, biometric authentication, and real-time fraud detection protect every transaction you make.',
    },
    {
      icon: LayoutDashboard,
      title: 'Smart Dashboard',
      description:
        'Real-time balance tracking, spending analytics, and AI-powered insights keep you in complete financial control.',
    },
    {
      icon: Award,
      title: 'Grant Access',
      description:
        'Unlock exclusive funding opportunities across business, education, and personal development categories worldwide.',
    },
    {
      icon: Heart,
      title: 'Global Donations',
      description:
        'Make a difference worldwide with transparent, trackable donations to verified causes and organizations.',
    },
    {
      icon: Globe,
      title: 'Multi-Language',
      description:
        'Available in 6+ languages with localized experiences, making banking accessible to users across the globe.',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description:
        'Round-the-clock assistance from our dedicated team via live chat, email, and phone whenever you need help.',
    },
  ];

  /* ---------- Grants Data ---------- */
  const grants = [
    {
      icon: Briefcase,
      title: 'Business Grants',
      description: 'Fuel your startup or scale your enterprise with dedicated business funding.',
    },
    {
      icon: User,
      title: 'Individual Grants',
      description: 'Personal development funds for education, health, and life milestones.',
    },
    {
      icon: Building2,
      title: 'Office Capital',
      description: 'Workspace setup and operational capital for growing organizations.',
    },
    {
      icon: Globe,
      title: 'General Grants',
      description: 'Flexible funding for diverse needs across multiple categories.',
    },
    {
      icon: GraduationCap,
      title: 'School Grants',
      description: 'Scholarships and education grants for students at every level.',
    },
    {
      icon: Heart,
      title: 'Women Empowerment',
      description: 'Dedicated funding to support women-led initiatives and enterprises.',
    },
  ];

  /* ---------- Floating hero heading words ---------- */
  const heroWords = ['Banking', 'Without'];
  const heroWordVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.05 + i * 0.1,
      },
    }),
  };

  return (
    <main className="relative overflow-hidden bg-gradient-to-b from-[#050A14] to-[#0A1628]">
      {/* Animated gradient text keyframes (injected once) */}
      <style jsx global>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-text {
          background-size: 200% 200%;
          animation: gradientShift 4s ease infinite;
        }
      `}</style>

      {/* ======================================
          SECTION 1 — HERO WITH IMAGE CAROUSEL
          ====================================== */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24"
      >
        {/* Background Image Carousel */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="sync">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <Image
                src={heroImages[currentSlide].src}
                alt={heroImages[currentSlide].alt}
                fill
                className="object-cover"
                priority={currentSlide === 0}
                sizes="100vw"
              />
            </motion.div>
          </AnimatePresence>
          {/* Dark overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/60 z-[1]" />
        </div>

        {/* Floating Gradient Orbs (on top of overlay) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
          <motion.div
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -50, -80, 0],
              scale: [1, 1.1, 1.05, 1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[15%] left-[15%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-[#00D4FF]/20 to-[#7B5EA7]/10 blur-3xl opacity-20 will-change-transform"
          />
          <motion.div
            animate={{
              x: [0, -40, 20, 0],
              y: [0, 30, -40, 0],
              scale: [1, 0.95, 1.1, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-gradient-to-br from-[#7B5EA7]/20 to-[#FFD700]/10 blur-3xl opacity-20 will-change-transform"
          />
          <motion.div
            animate={{
              x: [0, 20, -30, 0],
              y: [0, -20, 30, 0],
              scale: [1, 1.05, 0.95, 1],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[50%] right-[35%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-[#FFD700]/15 to-[#00D4FF]/10 blur-3xl opacity-15 will-change-transform"
          />
        </div>

        {/* Hero Content (fixed on top) */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge with typing effect */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-8">
              <Sparkles className="w-4 h-4 text-[#FFD700]" />
              <TypingText text="Next-Generation Digital Banking" className="text-white/60 text-sm" />
            </div>
          </motion.div>

          {/* Floating word heading */}
          <h1 className="font-['Sora'] text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight">
            {heroWords.map((word, i) => (
              <motion.span
                key={word}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={heroWordVariants}
                className="inline-block mr-[0.3em]"
              >
                {word}
              </motion.span>
            ))}
            <br className="sm:hidden" />
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="inline-block bg-gradient-to-r from-[#00D4FF] via-[#7B5EA7] to-[#00D4FF] bg-clip-text text-transparent animate-gradient-text"
            >
              Boundaries
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Secure. Smart. Seamless. Experience next-generation digital banking with real-time
            balance management and global grant opportunities.
          </motion.p>

          {/* CTA Buttons with shimmer */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <ShimmerButton
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#00D4FF] to-[#7B5EA7] rounded-xl
                         text-white font-semibold text-base hover:shadow-[0_0_30px_rgba(0,212,255,0.3)] transition-all duration-300
                         hover:scale-105"
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </ShimmerButton>
            <ShimmerButton
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 border border-white/20 rounded-xl
                         text-white font-semibold text-base hover:bg-white/5 hover:border-white/30 transition-all duration-300
                         backdrop-blur-xl"
            >
              Sign In
              <ChevronRight className="w-4 h-4" />
            </ShimmerButton>
          </motion.div>

          {/* Animated Counters */}
          <motion.div
            ref={heroCounterRef}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="grid grid-cols-3 gap-8 max-w-xl mx-auto"
          >
            <div className="text-center">
              <p className="font-['Sora'] text-2xl md:text-3xl font-bold text-white">
                ${managedCount === 2400 ? '2.4' : (managedCount / 1000).toFixed(1)}B+
              </p>
              <p className="text-white/40 text-sm mt-1">Managed</p>
            </div>
            <div className="text-center">
              <p className="font-['Sora'] text-2xl md:text-3xl font-bold text-white">
                {usersCount}K+
              </p>
              <p className="text-white/40 text-sm mt-1">Users</p>
            </div>
            <div className="text-center">
              <p className="font-['Sora'] text-2xl md:text-3xl font-bold text-white">
                {countriesCount}
              </p>
              <p className="text-white/40 text-sm mt-1">Countries</p>
            </div>
          </motion.div>
        </div>

        {/* Slide indicators (dots) */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`rounded-full transition-all duration-500 ${
                index === currentSlide
                  ? 'bg-[#00D4FF] w-8 h-2.5'
                  : 'bg-white/30 w-2.5 h-2.5 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-1.5"
          >
            <motion.div className="w-1.5 h-1.5 bg-[#00D4FF] rounded-full" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Wave divider */}
      <WaveDivider />

      {/* ======================================
          SECTION 2 — FEATURES
          ====================================== */}
      <AnimatedSection className="relative py-24 md:py-32 px-6" parallaxSpeed={0.3}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block text-[#00D4FF] text-sm font-semibold tracking-widest uppercase mb-4"
            >
              Features
            </motion.span>
            <h2 className="font-['Sora'] text-3xl md:text-5xl font-bold text-white mb-5">
              <StaggeredHeading>Why Choose</StaggeredHeading>{' '}
              <span className="bg-gradient-to-r from-[#00D4FF] to-[#7B5EA7] bg-clip-text text-transparent">
                NexaVault
              </span>
              ?
            </h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto">
              Built for the modern financial world, with tools that empower you to bank smarter.
            </p>
          </div>

          {/* Banking app mockup image */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden mb-12"
          >
            <ScaleImage
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80"
              alt="Person using a banking application on their phone"
              className="absolute inset-0 rounded-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050A14] via-[#050A14]/40 to-transparent z-[1]" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} index={index} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      <WaveDivider flip />

      {/* ======================================
          SECTION 3 — GRANTS OVERVIEW
          ====================================== */}
      <AnimatedSection className="relative py-24 md:py-32 px-6" parallaxSpeed={0.2}>
        {/* Background accent */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#FFD700]/5 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block text-[#FFD700] text-sm font-semibold tracking-widest uppercase mb-4"
            >
              Grants
            </motion.span>
            <h2 className="font-['Sora'] text-3xl md:text-5xl font-bold text-white mb-5">
              <StaggeredHeading>Unlock</StaggeredHeading>{' '}
              <span className="bg-gradient-to-r from-[#FFD700] to-[#7B5EA7] bg-clip-text text-transparent">
                Funding Opportunities
              </span>
            </h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto">
              Explore curated grants designed to accelerate your personal and professional growth.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {grants.map((grant, index) => (
              <GrantCard key={grant.title} {...grant} index={index} />
            ))}
          </div>

          <div className="text-center">
            <ShimmerButton
              href="/grants"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#FFD700]/20 to-[#7B5EA7]/20
                         border border-[#FFD700]/30 rounded-xl text-[#FFD700] font-semibold text-base
                         hover:from-[#FFD700]/30 hover:to-[#7B5EA7]/30 hover:border-[#FFD700]/50
                         hover:shadow-[0_0_30px_rgba(255,215,0,0.1)] transition-all duration-300"
            >
              Explore Grants
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </ShimmerButton>
          </div>
        </div>
      </AnimatedSection>

      <WaveDivider />

      {/* ======================================
          SECTION 4 — DONATION TEASER
          ====================================== */}
      <AnimatedSection className="relative py-24 md:py-32 px-6" parallaxSpeed={0.15}>
        <div className="relative max-w-5xl mx-auto overflow-hidden rounded-3xl">
          {/* Violet gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#7B5EA7] via-[#5A3D8A] to-[#3D2668]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#7B5EA7]/50 to-transparent" />
          {/* Decorative orb */}
          <div className="absolute -right-20 -top-20 w-[300px] h-[300px] rounded-full bg-[#00D4FF]/10 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 w-[250px] h-[250px] rounded-full bg-[#FFD700]/10 blur-3xl" />

          <div className="relative z-10 px-8 md:px-16 py-16 md:py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              {/* Text content */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="text-center md:text-left"
              >
                <Heart className="w-12 h-12 text-white/80 mx-auto md:mx-0 mb-6" />
                <h2 className="font-['Sora'] text-3xl md:text-5xl font-bold text-white mb-5">
                  <StaggeredHeading>Make a Difference Today</StaggeredHeading>
                </h2>
                <p className="text-white/70 text-lg max-w-xl mx-auto md:mx-0 mb-10 leading-relaxed">
                  Your generosity has the power to transform lives. Donate securely to verified causes
                  worldwide with full transparency and real-time tracking of your impact.
                </p>
                <ShimmerButton
                  href="/donate"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/15 border border-white/25 rounded-xl
                             text-white font-semibold text-base backdrop-blur-xl
                             hover:bg-white/25 hover:border-white/40 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]
                             transition-all duration-300"
                >
                  Donate Now
                  <Heart className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                </ShimmerButton>
              </motion.div>

              {/* Donation / community image */}
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="relative h-[280px] md:h-[360px] rounded-2xl overflow-hidden hidden md:block"
              >
                <ScaleImage
                  src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&q=80"
                  alt="People giving and helping in community charity"
                  className="absolute inset-0 rounded-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#7B5EA7]/40 z-[1]" />
              </motion.div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <WaveDivider flip />

      {/* ======================================
          SECTION 5 — STATISTICS BAR
          ====================================== */}
      <AnimatedSection className="relative py-20 px-6" parallaxSpeed={0.1}>
        {/* Background city skyline image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1920&q=80"
            alt="City skyline at night"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[#050A14]/85" />
        </div>
        <div className="absolute inset-0 bg-white/[0.02]" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <StatCounter end={50} suffix="K+" label="Active Users" index={0} />
            <StatCounter end={12} prefix="$" suffix="M+" label="Grants Distributed" index={1} />
            <StatCounter end={25} suffix="+" label="Currencies Supported" index={2} />
            <StatCounter end={6} suffix="+" label="Languages Available" index={3} />
          </div>
        </div>
      </AnimatedSection>

      <WaveDivider />

      {/* ======================================
          SECTION 6 — TESTIMONIALS
          ====================================== */}
      <AnimatedSection className="relative py-24 md:py-32 px-6" parallaxSpeed={0.2}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block text-[#00D4FF] text-sm font-semibold tracking-widest uppercase mb-4"
            >
              Testimonials
            </motion.span>
            <h2 className="font-['Sora'] text-3xl md:text-5xl font-bold text-white mb-5">
              <StaggeredHeading>Trusted by</StaggeredHeading>{' '}
              <span className="bg-gradient-to-r from-[#00D4FF] to-[#7B5EA7] bg-clip-text text-transparent">
                Thousands
              </span>
            </h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto">
              See what our users have to say about their NexaVault experience.
            </p>
          </div>

          {/* Desktop: all three visible */}
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={testimonial.name} {...testimonial} index={index} />
            ))}
          </div>

          {/* Mobile: auto-sliding single card */}
          <div className="md:hidden relative">
            <div className="overflow-hidden">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4 }}
              >
                <TestimonialCard {...testimonials[activeTestimonial]} index={0} />
              </motion.div>
            </div>
            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === activeTestimonial
                      ? 'bg-[#00D4FF] w-6'
                      : 'bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      <WaveDivider flip />

      {/* ======================================
          SECTION 7 — BOTTOM CTA
          ====================================== */}
      <AnimatedSection className="relative py-24 md:py-32 px-6" parallaxSpeed={0.15}>
        <div className="relative max-w-4xl mx-auto text-center overflow-hidden rounded-3xl">
          {/* Background building image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80"
              alt="Modern glass building representing financial strength"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#050A14]/90 via-[#0A1628]/85 to-[#050A14]/90" />
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/10 via-[#7B5EA7]/10 to-transparent z-[1]" />
          <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-sm z-[1]" />
          <div className="absolute inset-0 border border-white/10 rounded-3xl z-[1]" />
          {/* Decorative orbs */}
          <div className="absolute -top-20 -left-20 w-[250px] h-[250px] rounded-full bg-[#00D4FF]/10 blur-3xl z-[1]" />
          <div className="absolute -bottom-20 -right-20 w-[250px] h-[250px] rounded-full bg-[#7B5EA7]/10 blur-3xl z-[1]" />

          <div className="relative z-10 px-8 md:px-16 py-16 md:py-20">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="font-['Sora'] text-3xl md:text-5xl font-bold text-white mb-5">
                <StaggeredHeading>Ready to Get Started?</StaggeredHeading>
              </h2>
              <p className="text-white/50 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                Join thousands of users who trust NexaVault for secure, intelligent banking. Create
                your free account in minutes.
              </p>
              <ShimmerButton
                href="/register"
                className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-[#00D4FF] to-[#7B5EA7] rounded-xl
                           text-white font-semibold text-lg hover:shadow-[0_0_40px_rgba(0,212,255,0.3)]
                           hover:scale-105 transition-all duration-300"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </ShimmerButton>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* ======================================
          FOOTER BAR
          ====================================== */}
      <footer className="relative border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            &copy; {new Date().getFullYear()} NexaVault. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-white/40 hover:text-white/70 text-sm transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="text-white/40 hover:text-white/70 text-sm transition-colors">
              Register
            </Link>
            <Link href="/grants" className="text-white/40 hover:text-white/70 text-sm transition-colors">
              Grants
            </Link>
            <Link href="/donate" className="text-white/40 hover:text-white/70 text-sm transition-colors">
              Donate
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
