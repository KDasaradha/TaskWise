"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Users, Target, Rocket, ShieldCheck, Zap, Lightbulb, BarChart3, LayoutDashboard, Brain } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const FeatureCard = ({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.95 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.5, delay, ease: "circOut" }}
    className={cn(
        "p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300",
        "bg-card/80 dark:bg-card/70 backdrop-blur-md border border-border/40" 
    )}
  >
    <div className="flex items-start mb-3.5">
      <div className="p-2.5 bg-primary/10 rounded-lg mr-3.5 text-primary shrink-0">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground dark:text-slate-100 mt-0.5">{title}</h3>
    </div>
    <p className="text-sm text-muted-foreground dark:text-slate-300 leading-relaxed">
      {description}
    </p>
  </motion.div>
);

const AboutPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariantsLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "circOut" } },
  };
  const itemVariantsRight = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "circOut" } },
  };


  return (
    <div className="w-full space-y-16 sm:space-y-20"> 
      <motion.section
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center pt-8 pb-10 rounded-2xl bg-card/50 dark:bg-card/40 backdrop-blur-lg shadow-xl border border-border/20"
      >
        <motion.div 
          initial={{scale:0.5, opacity:0}} 
          animate={{scale:1, opacity:1}} 
          transition={{delay:0.2, type:"spring", stiffness:180}}
          className="inline-block p-3 bg-primary/10 rounded-full mb-5 shadow-md"
        >
           <Brain className="h-12 w-12 sm:h-14 sm:w-14 text-primary drop-shadow-lg" />
        </motion.div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gradient-primary mb-4">
          About TaskWise
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground dark:text-slate-300 max-w-2xl mx-auto leading-relaxed px-4">
          Empowering your productivity with intelligent task management, designed for modern individuals and teams.
        </p>
      </motion.section>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center"
      >
        <motion.div variants={itemVariantsLeft} className="prose prose-base dark:prose-invert max-w-none text-foreground dark:text-slate-200">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary mb-3.5 flex items-center">
            <Target className="w-7 h-7 mr-2.5 text-accent shrink-0" /> Our Mission
          </h2>
          <p>
            To provide a smart, intuitive, and efficient platform for managing tasks, fostering productivity and clarity. We believe well-organized tasks lead to accomplished goals and reduced stress.
          </p>
          <p>
            TaskWise aims to seamlessly integrate into your workflow, offering the tools you need to conquer commitments, from personal projects to complex team assignments.
          </p>
        </motion.div>
        <motion.div variants={itemVariantsRight}>
          <Image
            src="https://picsum.photos/seed/mission_focus/600/450"
            alt="Focused individual working on a laptop"
            width={600}
            height={450}
            className="rounded-xl shadow-xl object-cover w-full h-auto aspect-[4/3] transition-transform duration-300 hover:scale-[1.02]"
            data-ai-hint="focus work"
          />
        </motion.div>
      </motion.section>

      <section>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl font-bold tracking-tight text-center text-foreground dark:text-slate-100 mb-10 sm:mb-12"
        >
          Why Choose <span className="text-gradient-primary">TaskWise</span>?
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <FeatureCard
            icon={<Rocket className="w-6 h-6" />}
            title="Intuitive & Fast"
            description="Effortlessly create, manage, and track tasks with a sleek, high-speed interface designed for maximum efficiency."
            delay={0.1}
          />
          <FeatureCard
            icon={<Lightbulb className="w-6 h-6" />}
            title="AI-Powered Suggestions"
            description="Leverage intelligent suggestions to uncover related tasks, break down projects, and proactively manage your workload."
            delay={0.2}
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Built for Everyone"
            description="Whether you're a solo achiever or part of a dynamic team, TaskWise adapts to your unique organizational needs."
            delay={0.3}
          />
           <FeatureCard
            icon={<ShieldCheck className="w-6 h-6" />}
            title="Secure & Reliable"
            description="Your data's integrity is paramount. TaskWise is built with robust security to keep your tasks safe and accessible."
            delay={0.4}
          />
          <FeatureCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Insightful Analytics"
            description="Gain clarity on your productivity through visual analytics, helping you track progress and optimize your workflow."
            delay={0.5}
          />
           <FeatureCard
            icon={<LayoutDashboard className="w-6 h-6" />}
            title="Modern Dashboard"
            description="Get a bird's-eye view of your task landscape with a clean, informative dashboard that highlights key metrics."
            delay={0.6}
          />
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0, y:20 }}
        whileInView={{ opacity: 1, y:0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center py-10 sm:py-12 bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 rounded-2xl shadow-lg"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-3">Ready to Supercharge Your Productivity?</h2>
        <p className="text-md sm:text-lg text-muted-foreground dark:text-slate-300 mb-6 max-w-lg mx-auto px-4">
          Join users who trust TaskWise to organize their daily work and achieve long-term goals with ease.
        </p>
        <Link href="/" passHref>
          <Button 
            size="lg" 
            className="px-7 py-3 bg-primary text-primary-foreground font-semibold rounded-lg shadow-md hover:bg-primary/90 transition-all text-base group"
            as={motion.button}
            whileHover={{ scale: 1.03, y: -2, boxShadow: "0px 6px 15px hsla(var(--primary-rgb), 0.2)"}} 
            whileTap={{ scale: 0.97 }}
            transition={{type:"spring", stiffness:300, damping:15}}
          >
            Get Started with TaskWise <Zap className="ml-2 h-4 w-4 group-hover:fill-current transition-transform duration-300 group-hover:animate-pulse" />
          </Button>
        </Link>
      </motion.section>
    </div>
  );
};

export default AboutPage;
