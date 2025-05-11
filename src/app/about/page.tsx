"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Users, Target, Rocket, ShieldCheck, Zap, Lightbulb, BarChart3, LayoutDashboard, Brain, ArrowRight } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const FeatureCard = ({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 25, scale: 0.98 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, amount: 0.25 }}
    transition={{ duration: 0.4, delay, ease: "circOut" }}
    className={cn(
        "p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 h-full",
        "bg-card border border-border/60" 
    )}
  >
    <div className="flex items-start mb-3">
      <div className="p-2 bg-primary/10 rounded-lg mr-3 text-primary shrink-0">
        {icon}
      </div>
      <h3 className="text-md sm:text-lg font-semibold text-foreground mt-0.5">{title}</h3>
    </div>
    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
      {description}
    </p>
  </motion.div>
);

const AboutPage = () => {
  const pageVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "circOut" } },
  };

  const sectionItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: "circOut" } },
  };
  const sectionImageVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: "circOut" } },
  };


  return (
    <motion.div 
      className="w-full space-y-12 sm:space-y-16"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    > 
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center pt-6 pb-8 rounded-xl bg-card/70 backdrop-blur-md shadow-lg border border-border/50"
      >
        <motion.div 
          initial={{scale:0.6, opacity:0}} 
          animate={{scale:1, opacity:1}} 
          transition={{delay:0.1, type:"spring", stiffness:200, damping:12}}
          className="inline-block p-2.5 bg-primary/10 rounded-full mb-4 shadow-sm"
        >
           <Brain className="h-10 w-10 sm:h-12 sm:w-12 text-primary drop-shadow-md" />
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gradient-primary mb-3">
          About TaskWise
        </h1>
        <p className="text-md sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed px-4">
          Streamlining your productivity with smart, intuitive task management.
        </p>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ visible: { transition: { staggerChildren: 0.15 }}}}
        className="grid md:grid-cols-2 gap-6 sm:gap-10 items-center"
      >
        <motion.div variants={sectionItemVariants} className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-foreground">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary mb-3 flex items-center">
            <Target className="w-6 h-6 mr-2 text-accent shrink-0" /> Our Mission
          </h2>
          <p>
            To provide a seamless and intelligent platform for managing tasks, helping individuals and teams achieve clarity, focus, and peak productivity. We believe that effective task organization is key to accomplishing goals and reducing stress.
          </p>
          <p>
            TaskWise aims to be your trusted partner in navigating daily commitments and long-term projects, offering the tools you need to conquer your to-do list with confidence.
          </p>
        </motion.div>
        <motion.div variants={sectionImageVariants}>
          <Image
            src="https://picsum.photos/seed/mission_team/550/400"
            alt="Team collaborating around a desk with notes"
            width={550}
            height={400}
            className="rounded-xl shadow-lg object-cover w-full h-auto aspect-[11/8] transition-transform duration-200 hover:scale-[1.015]"
            data-ai-hint="team collaboration"
          />
        </motion.div>
      </motion.section>

      <section>
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-2xl sm:text-3xl font-bold tracking-tight text-center text-foreground mb-8 sm:mb-10"
        >
          Why Choose <span className="text-gradient-primary">TaskWise</span>?
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          <FeatureCard
            icon={<Rocket className="w-5 h-5" />}
            title="Intuitive & Fast"
            description="Effortlessly manage tasks with a sleek, high-speed interface designed for maximum efficiency."
            delay={0.1}
          />
          <FeatureCard
            icon={<Lightbulb className="w-5 h-5" />}
            title="AI-Powered Suggestions"
            description="Leverage intelligent suggestions to uncover related tasks and proactively manage your workload."
            delay={0.15}
          />
          <FeatureCard
            icon={<Users className="w-5 h-5" />}
            title="Built for Everyone"
            description="Whether solo or in a team, TaskWise adapts to your unique organizational needs."
            delay={0.2}
          />
           <FeatureCard
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Secure & Reliable"
            description="Your data's integrity is paramount. Built with robust security to keep tasks safe."
            delay={0.25}
          />
          <FeatureCard
            icon={<BarChart3 className="w-5 h-5" />}
            title="Insightful Analytics"
            description="Gain clarity on your productivity, track progress, and optimize your workflow effectively."
            delay={0.3}
          />
           <FeatureCard
            icon={<LayoutDashboard className="w-5 h-5" />}
            title="Modern Dashboard"
            description="Get a bird's-eye view of your task landscape with a clean, informative overview."
            delay={0.35}
          />
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0, y:15 }}
        whileInView={{ opacity: 1, y:0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="text-center py-8 sm:py-10 bg-gradient-to-br from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 rounded-xl shadow-lg border border-border/40"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-primary mb-2.5">Ready to Boost Your Productivity?</h2>
        <p className="text-sm sm:text-md text-muted-foreground mb-5 max-w-md mx-auto px-4">
          Join users who trust TaskWise to organize their work and achieve goals with ease and intelligence.
        </p>
        <Link href="/" passHref>
          <Button 
            size="lg" 
            className={cn(
                "px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-md shadow-md hover:bg-primary/90",
                "text-sm sm:text-base group transition-all"
            )}
            as={motion.button}
            whileHover={{ scale: 1.02, y: -1, boxShadow: "0px 4px 12px hsla(var(--primary-rgb), 0.15)"}} 
            whileTap={{ scale: 0.97 }}
            transition={{type:"spring", stiffness:320, damping:16}}
          >
            Get Started Now <ArrowRight className="ml-1.5 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
      </motion.section>
    </motion.div>
  );
};

export default AboutPage;
