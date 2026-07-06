"use client";

import Link from "next/link";
import {
  ClipboardList, TrendingUp, MessageSquare, Utensils, BarChart3, Shield,
  ArrowRight, Sparkles, Check, ChevronDown, Star, Users,
  Apple, Brain, LineChart, Quote, Activity, Target, Zap, Heart,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import React from "react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const fadeIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

function AnimatedStat({ value, label }: { value: string; label: string }) {
  const [displayed, setDisplayed] = useState("0");
  const num = parseInt(value.replace(/\D/g, ""));
  const suffix = value.replace(/[\d,]/g, "");

  useEffect(() => {
    if (!num) { setDisplayed(value); return; }
    let start = 0;
    const step = Math.ceil(num / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setDisplayed(value); clearInterval(timer); }
      else { setDisplayed(start.toLocaleString() + suffix); }
    }, 30);
    return () => clearInterval(timer);
  }, [num, suffix, value]);

  return (
    <div className="text-center">
      <p className="text-2xl md:text-3xl font-bold text-foreground">{displayed}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

const testimonials = [
  { name: "Dr. Priya Sharma", role: "Nutritionist, Mumbai", avatar: "PS", rating: 5, text: "NutriSuite has completely transformed how I manage my clients. The meal tracking and analytics are game-changing." },
  { name: "Rahul Verma", role: "Dietitian, Delhi", avatar: "RV", rating: 5, text: "I've tried many platforms, but NutriSuite is the only one that combines ease of use with powerful features." },
  { name: "Ananya Patel", role: "Health Coach, Bangalore", avatar: "AP", rating: 5, text: "My clients love the mobile experience. The progress tracking keeps them motivated like never before." },
  { name: "Vikram Singh", role: "Fitness Trainer, Pune", avatar: "VS", rating: 5, text: "The diet plan assignment and client management features save me hours every week. Absolutely essential tool." },
];

const pricingPlans = [
  {
    name: "Starter", price: "Free", period: "forever", desc: "Perfect for getting started",
    features: ["Up to 5 clients", "Basic diet plans", "Email support", "1 nutritionist"],
    popular: false, color: "from-emerald-500/10 to-teal-500/10",
  },
  {
    name: "Professional", price: "\u20B9499", period: "/month", desc: "Best for growing practices",
    features: ["Unlimited clients", "Advanced analytics", "Priority support", "Custom branding", "Team collaboration"],
    popular: true, color: "from-purple-500/10 to-pink-500/10",
  },
  {
    name: "Enterprise", price: "\u20B91,999", period: "/month", desc: "For large organizations",
    features: ["Everything in Pro", "API access", "Dedicated manager", "Custom integrations", "SLA guarantee", "Bulk import"],
    popular: false, color: "from-blue-500/10 to-indigo-500/10",
  },
];

const faqs = [
  { q: "How do I get started with NutriSuite?", a: "Simply create an account, set up your profile, and start adding clients. You can create diet plans right away." },
  { q: "Can I import my existing clients?", a: "Yes, you can import client data via CSV. Enterprise plans include bulk import capabilities." },
  { q: "Is my data secure?", a: "Absolutely. We use enterprise-grade encryption, JWT authentication, and role-based access control." },
  { q: "Can clients use it on mobile?", a: "Yes, NutriSuite is fully responsive and works seamlessly on all devices." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards, UPI, and net banking." },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx((i) => (i + 1) % testimonials.length), 4000);
    return () => clearInterval(t);
  }, []);

  const colors = ["#6C63FF", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#14B8A6", "#3B82F6"];
  const sectionBg = [
    "bg-gradient-to-br from-purple-50 via-white to-pink-50",
    "bg-gradient-to-br from-emerald-50 via-white to-teal-50",
    "bg-gradient-to-br from-blue-50 via-white to-indigo-50",
    "bg-gradient-to-br from-orange-50 via-white to-amber-50",
    "bg-gradient-to-br from-rose-50 via-white to-purple-50",
    "bg-gradient-to-br from-cyan-50 via-white to-sky-50",
    "bg-gradient-to-br from-violet-50 via-white to-fuchsia-50",
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Floating decorative blobs — colorful */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
        {colors.map((c, i) => (
          <motion.div key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              background: c,
              opacity: 0.06,
              width: `${300 + i * 80}px`,
              height: `${300 + i * 80}px`,
              top: `${[5, 15, 30, 50, 65, 75, 85, 45][i]}%`,
              left: `${[65, 80, 10, 85, 20, 70, 30, 50][i]}%`,
            }}
            animate={{
              x: [0, 60 * (i % 2 ? 1 : -1), 0],
              y: [0, 40 * (i % 3 === 0 ? 1 : -1), 0],
            }}
            transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      {/* Nav */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div whileHover={{ rotate: 20, scale: 1.1 }}
              className="size-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center"
            >
              <Sparkles className="h-4 w-4 text-white" />
            </motion.div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">NutriSuite</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors px-3 py-1.5">Sign In</Link>
            <Link href="/register"
              className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >Get Started <ArrowRight className="h-3.5 w-3.5" /></Link>
          </nav>
        </div>
      </motion.header>

      {/* Hero — Purple/Pink Section */}
      <section className="relative overflow-hidden z-10 bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-950 dark:via-purple-950/10 dark:to-pink-950/10">
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-32 text-center relative">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-purple-200 bg-purple-50 text-xs font-medium text-purple-700 mb-8 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300"
          >
            <Sparkles className="h-3 w-3" />
            Trusted by 10,000+ health professionals worldwide
          </motion.div>

          <motion.h1 variants={fadeUp} initial="initial" animate="animate" transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1] text-gray-900 dark:text-white"
          >
            Your Personal{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              Health Dashboard
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} initial="initial" animate="animate" transition={{ delay: 0.45, duration: 0.6 }}
            className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Track nutrition, manage diet plans, monitor client progress, and stay connected — all in one premium platform.
          </motion.p>

          <motion.div variants={fadeUp} initial="initial" animate="animate" transition={{ delay: 0.6, duration: 0.6 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <Link href="/register"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium hover:shadow-xl hover:shadow-purple-500/30 transition-all hover:-translate-y-0.5"
            >Start Free Trial <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            ><PlayIcon className="h-4 w-4" /> Watch Demo</Link>
          </motion.div>

          {/* Hero illustration */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-20 max-w-5xl mx-auto"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-300/30 via-pink-300/30 to-purple-300/30 dark:from-purple-500/10 dark:via-pink-500/10 dark:to-purple-500/10 rounded-2xl blur-xl" />
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-200/40 to-pink-200/40 dark:from-purple-500/10 dark:to-pink-500/10 rounded-2xl" />
              <DashboardSvg />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats — Emerald/Teal Section */}
      <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-80px" }}
        className="border-y bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/10 dark:via-teal-950/10 dark:to-emerald-950/10 relative z-10"
      >
        <div className="max-w-7xl mx-auto px-6 py-14">
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: "10,000+", label: "Active Clients", icon: Users, color: "from-emerald-500 to-teal-500" },
              { value: "50,000+", label: "Meals Tracked", icon: Apple, color: "from-teal-500 to-cyan-500" },
              { value: "99.9%", label: "Uptime", icon: Activity, color: "from-green-500 to-emerald-500" },
              { value: "4.9/5", label: "Client Rating", icon: Star, color: "from-emerald-500 to-green-500" },
            ].map((stat) => (
              <motion.div key={stat.label} variants={fadeUp} className="text-center">
                <div className={`inline-flex size-10 rounded-xl bg-gradient-to-br ${stat.color}/20 items-center justify-center mb-3`}>
                  <stat.icon className={`h-5 w-5 text-${stat.color.split(" ")[0].replace("from-", "").replace("/20", "")}`} style={{ color: stat.color.includes("emerald") ? "#10B981" : stat.color.includes("teal") ? "#14B8A6" : stat.color.includes("cyan") ? "#06B6D4" : "#10B981" }} />
                </div>
                <AnimatedStat value={stat.value} label={stat.label} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works — Blue/Indigo Section */}
      <section className="py-24 relative z-10 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-950/10 dark:via-gray-950 dark:to-indigo-950/10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-xs font-medium text-blue-700 mb-4 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
              <Sparkles className="h-3 w-3" /> Simple Setup
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
              How It{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Get started in minutes and transform your practice with intelligent tools.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-300/50 via-indigo-300/50 to-blue-300/50" />
            {[
              { step: "01", icon: UserPlus, title: "Create Account", desc: "Sign up in seconds. No credit card required. Start your free trial today." },
              { step: "02", icon: ClipboardList, title: "Add Clients & Plans", desc: "Import clients, create personalized diet plans, and assign them with one click." },
              { step: "03", icon: TrendingUp, title: "Track & Grow", desc: "Monitor progress, communicate in real-time, and watch your practice thrive." },
            ].map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="text-center relative"
              >
                <motion.div whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }} transition={{ duration: 0.3 }}
                  className="size-20 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mx-auto mb-5 relative z-10 border border-blue-200 dark:border-blue-800"
                >
                  <item.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </motion.div>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent mb-2">{item.step}</div>
                <h3 className="font-semibold mb-1.5 text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features — Orange/Amber Section */}
      <section className="py-24 relative z-10 bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-orange-950/10 dark:via-gray-950 dark:to-amber-950/10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-200 bg-orange-50 text-xs font-medium text-orange-700 mb-4 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300">
              <Brain className="h-3 w-3" /> Powerful Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
              Everything You{" "}
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Need</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              A comprehensive suite of tools for nutritionists and dietitians to manage clients effectively.
            </p>
          </motion.div>
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true, margin: "-80px" }} variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, i) => {
              const cardColors = [
                "from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-200 dark:border-purple-800",
                "from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 border-emerald-200 dark:border-emerald-800",
                "from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-800",
                "from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 border-orange-200 dark:border-orange-800",
                "from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 border-rose-200 dark:border-rose-800",
                "from-cyan-100 to-sky-100 dark:from-cyan-900/30 dark:to-sky-900/30 border-cyan-200 dark:border-cyan-800",
              ];
              const iconColors = [
                "from-purple-500 to-pink-500",
                "from-emerald-500 to-teal-500",
                "from-blue-500 to-indigo-500",
                "from-orange-500 to-amber-500",
                "from-rose-500 to-pink-500",
                "from-cyan-500 to-sky-500",
              ];
              return (
                <motion.div key={feature.title} variants={fadeUp}
                  whileHover={{ y: -6, scale: 1.01 }}
                  className={`group p-6 rounded-xl border bg-gradient-to-br ${cardColors[i]} hover:shadow-xl transition-all duration-300`}
                >
                  <motion.div whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }} transition={{ duration: 0.4 }}
                    className={`size-10 rounded-xl bg-gradient-to-br ${iconColors[i]} text-white flex items-center justify-center mb-4`}
                  >
                    <feature.icon className="h-5 w-5" />
                  </motion.div>
                  <h3 className="font-semibold mb-1.5 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Testimonials — Rose/Pink Section */}
      <section className="py-24 relative z-10 overflow-hidden bg-gradient-to-br from-rose-50 via-white to-pink-50 dark:from-rose-950/10 dark:via-gray-950 dark:to-pink-950/10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-rose-200 bg-rose-50 text-xs font-medium text-rose-700 mb-4 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300">
              <Quote className="h-3 w-3" /> Testimonials
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
              Loved by{" "}
              <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">Professionals</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Hear from health professionals who trust NutriSuite every day.
            </p>
          </motion.div>
          <div className="max-w-2xl mx-auto relative min-h-[220px]">
            {testimonials.map((t, i) => (
              <motion.div key={t.name}
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={i === testimonialIdx ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: -40, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
                style={{ display: i === testimonialIdx ? "block" : "none" }}
              >
                <div className="p-8 rounded-2xl border border-rose-100 dark:border-rose-900 bg-white dark:bg-gray-900 text-center shadow-lg shadow-rose-500/5">
                  <div className="flex justify-center gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, ri) => (
                      <Star key={ri} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-base text-gray-600 dark:text-gray-300 mb-6 leading-relaxed italic">"{t.text}"</p>
                  <div className="flex items-center justify-center gap-3">
                    <div className="size-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                      {t.avatar}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            <div className="flex justify-center gap-2 mt-6 relative top-[260px]">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setTestimonialIdx(i)}
                  className={`size-2 rounded-full transition-all duration-300 ${i === testimonialIdx ? "w-6 bg-gradient-to-r from-rose-500 to-pink-500" : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing — Cyan/Sky Section */}
      <section className="py-24 relative z-10 bg-gradient-to-br from-cyan-50 via-white to-sky-50 dark:from-cyan-950/10 dark:via-gray-950 dark:to-sky-950/10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-200 bg-cyan-50 text-xs font-medium text-cyan-700 mb-4 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
              <Sparkles className="h-3 w-3" /> Pricing
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
              Simple,{" "}
              <span className="bg-gradient-to-r from-cyan-500 to-sky-500 bg-clip-text text-transparent">Transparent</span> Pricing
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Choose the plan that fits your practice. No hidden fees, cancel anytime.
            </p>
          </motion.div>
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true, margin: "-80px" }} variants={stagger}
            className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {pricingPlans.map((plan) => (
              <motion.div key={plan.name} variants={fadeUp}
                className={`relative rounded-2xl border p-6 ${plan.popular ? "border-purple-300 dark:border-purple-700 bg-gradient-to-b from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 shadow-xl scale-105" : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-lg"}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white text-[10px] font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">{plan.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                      <div className="size-4 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register"
                  className={`block text-center py-2.5 rounded-lg text-sm font-medium transition-all ${plan.popular ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/25" : "border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                >Get {plan.name}</Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ — Violet/Fuchsia Section */}
      <section className="py-24 relative z-10 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 dark:from-violet-950/10 dark:via-gray-950 dark:to-fuchsia-950/10">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-violet-200 bg-violet-50 text-xs font-medium text-violet-700 mb-4 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300">
              <Brain className="h-3 w-3" /> FAQ
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
              Got{" "}
              <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">Questions?</span>
            </h2>
          </motion.div>
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger} className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeUp}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden"
              >
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {faq.q}
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </motion.div>
                </button>
                <motion.div initial={false}
                  animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-4 text-sm text-gray-500 dark:text-gray-400">{faq.a}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA — Multi-color Section */}
      <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        className="py-24 relative overflow-hidden z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-orange-500/10 dark:from-purple-600/20 dark:via-pink-500/20 dark:to-orange-500/20" />
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-3xl mx-auto px-6 text-center relative"
        >
          <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
            className="size-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center mx-auto mb-6 border border-purple-200 dark:border-purple-800"
          >
            <Sparkles className="h-7 w-7 text-purple-600 dark:text-purple-400" />
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
            Ready to Transform{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">Your Practice?</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto">
            Join thousands of health professionals who use NutriSuite to deliver better outcomes.
          </p>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/register"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white font-medium hover:shadow-xl hover:shadow-purple-500/30 transition-all"
            >Get Started Free <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/login"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >Sign In</Link>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-12 relative z-10 bg-gradient-to-b from-transparent to-purple-50/50 dark:to-purple-950/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="size-6 rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">NutriSuite</span>
            </Link>
            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <Link href="/login" className="hover:text-gray-900 dark:hover:text-white transition-colors">Sign In</Link>
              <Link href="/register" className="hover:text-gray-900 dark:hover:text-white transition-colors">Register</Link>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              &copy; {new Date().getFullYear()} NutriSuite. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── SVG Components ── */

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
    </svg>
  );
}

function UserPlus({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}

function DashboardSvg() {
  const colors = {
    purple: "#6C63FF",
    pink: "#EC4899",
    emerald: "#10B981",
    amber: "#F59E0B",
    rose: "#EF4444",
    cyan: "#06B6D4",
    blue: "#3B82F6",
  };

  return (
    <svg viewBox="0 0 900 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl">
      {/* Card bg */}
      <rect width="900" height="500" rx="12" className="fill-white dark:fill-gray-900" />
      {/* Sidebar */}
      <rect x="0" y="0" width="220" height="500" rx="12" className="fill-gray-50 dark:fill-gray-950" />
      <rect x="20" y="20" width="36" height="36" rx="10" fill={colors.purple} opacity="0.2" />
      <rect x="66" y="28" width="90" height="6" rx="3" className="fill-gray-300 dark:fill-gray-700" />
      <rect x="66" y="40" width="55" height="4" rx="2" className="fill-gray-200 dark:fill-gray-800" />
      {[0,1,2,3,4,5].map(i => (
        <React.Fragment key={i}>
          <rect x="20" y={76 + i*44} width="26" height="26" rx="7" fill={i === 0 ? colors.purple : colors.blue} opacity={i === 0 ? 0.3 : 0.1} />
          <rect x="58" y={83 + i*44} width="100" height="5" rx="2.5" className="fill-gray-200 dark:fill-gray-800" />
          <rect x="58" y={93 + i*44} width="65" height="3" rx="1.5" className="fill-gray-100 dark:fill-gray-800" />
        </React.Fragment>
      ))}
      {/* Top bar */}
      <rect x="240" y="20" width="640" height="42" rx="10" className="fill-gray-100 dark:fill-gray-800" />
      <rect x="260" y="32" width="200" height="18" rx="6" className="fill-gray-200 dark:fill-gray-700" />
      {/* Notification dot */}
      <motion.circle cx="830" cy="41" r="8" fill={colors.pink} opacity="0.7"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Stat cards */}
      {[
        { x: 240, color: colors.purple },
        { x: 398, color: colors.pink },
        { x: 556, color: colors.emerald },
        { x: 714, color: colors.amber },
      ].map((card, i) => (
        <React.Fragment key={i}>
          <rect x={card.x} y={78} width="142" height="90" rx="12" className="fill-gray-50 dark:fill-gray-800/50" />
          <rect x={card.x + 20} y={94} width="24" height="24" rx="6" fill={card.color} opacity="0.3" />
          <rect x={card.x + 54} y={96} width="50" height="4" rx="2" className="fill-gray-300 dark:fill-gray-700" />
          <rect x={card.x + 54} y={104} width="30" height="3" rx="1.5" className="fill-gray-200 dark:fill-gray-800" />
          <rect x={card.x + 20} y={126} width="60" height="8" rx="4" fill={card.color} opacity="0.4" />
        </React.Fragment>
      ))}
      {/* Chart area */}
      <rect x="240" y="186" width="420" height="160" rx="12" className="fill-gray-50 dark:fill-gray-800/50" />
      <rect x="260" y="206" width="120" height="6" rx="3" className="fill-gray-200 dark:fill-gray-700" />
      {/* Chart line */}
      <path d="M260 310 L310 280 L350 295 L400 250 L440 265 L480 230 L520 245 L550 215 L580 230 L620 200"
        stroke="url(#chartGrad)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      {/* Chart area fill */}
      <path d="M260 310 L310 280 L350 295 L400 250 L440 265 L480 230 L520 245 L550 215 L580 230 L620 200 L620 346 L260 346 Z"
        fill="url(#chartArea)" opacity="0.2" />
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={colors.purple} />
          <stop offset="50%" stopColor={colors.pink} />
          <stop offset="100%" stopColor={colors.cyan} />
        </linearGradient>
        <linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.purple} />
          <stop offset="100%" stopColor={colors.purple} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Animated chart dot */}
      <motion.circle cx="620" cy="200" r="6" fill={colors.cyan} stroke="white" strokeWidth="2"
        animate={{ r: [6, 9, 6], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Right panel — activity list */}
      <rect x="680" y="186" width="200" height="160" rx="12" className="fill-gray-50 dark:fill-gray-800/50" />
      {[
        { y: 204, color: colors.emerald },
        { y: 238, color: colors.amber },
        { y: 272, color: colors.rose },
        { y: 306, color: colors.blue },
      ].map((item, i) => (
        <React.Fragment key={i}>
          <rect x="696" y={item.y} width="36" height="36" rx="18" fill={item.color} opacity="0.15" />
          <rect x="744" y={item.y + 8} width="110" height="5" rx="2.5" className="fill-gray-200 dark:fill-gray-700" />
          <rect x="744" y={item.y + 18} width="70" height="3" rx="1.5" className="fill-gray-100 dark:fill-gray-800" />
        </React.Fragment>
      ))}
      {/* Bottom bar */}
      <rect x="240" y="364" width="640" height="42" rx="10" className="fill-gray-100 dark:fill-gray-800" />
      <rect x="260" y="376" width="140" height="18" rx="6" className="fill-gray-200 dark:fill-gray-700" />
      {/* Table */}
      <rect x="240" y="420" width="640" height="60" rx="10" className="fill-gray-50 dark:fill-gray-800/50" />
      {[0,1,2,3,4].map(i => (
        <React.Fragment key={i}>
          <rect x="256" y={434} width="110" height="6" rx="3" className="fill-gray-200 dark:fill-gray-700" />
          <rect x="400" y={434} width="70" height="6" rx="3" className="fill-gray-200 dark:fill-gray-700" />
          <rect x="510" y={434} width="90" height="6" rx="3" className="fill-gray-200 dark:fill-gray-700" />
          <rect x="640" y={434} width="50" height="6" rx="3" className="fill-gray-200 dark:fill-gray-700" />
        </React.Fragment>
      ))}
    </svg>
  );
}

const features = [
  {
    icon: ClipboardList,
    title: "Diet Plans",
    description: "Create and assign personalized diet plans with easy-to-follow PDF guides tailored to each client's goals.",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description: "Monitor weight trends, mood patterns, and progress photos with beautiful visual analytics and charts.",
  },
  {
    icon: MessageSquare,
    title: "Messaging",
    description: "Stay connected with built-in messaging, feedback, and real-time notifications for better engagement.",
  },
  {
    icon: Utensils,
    title: "Meal Tracking",
    description: "Clients can log daily meals with photos, and nutritionists can provide detailed feedback on choices.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Comprehensive dashboards with client growth metrics, compliance rates, and outcome tracking.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Enterprise-grade security with encrypted data, JWT authentication, and role-based access control.",
  },
];
