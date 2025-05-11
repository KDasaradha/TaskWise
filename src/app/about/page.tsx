"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Users, Target, Rocket, ShieldCheck, Zap, Lightbulb, BarChart3, LayoutDashboard } from 'lucide-react'; // Added Zap, Lightbulb, BarChart3, LayoutDashboard

const FeatureCard = ({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-card/70 dark:bg-slate-800/70 backdrop-blur-md p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-border/20"
  >
    <div className="flex items-center mb-4">
      <div className="p-3 bg-primary/10 rounded-full mr-4 text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-foreground dark:text-slate-100">{title}</h3>
    </div>
    <p className="text-muted-foreground dark:text-slate-300 text-sm leading-relaxed">
      {description}
    </p>
  </motion.div>
);

const AboutPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "circOut" } },
  };

  return (
    <div className="w-full bg-gradient-to-br from-background to-secondary/20 dark:from-gray-900 dark:to-gray-800/30 py-8 px-4 sm:px-6 lg:px-0"> {/* Adjusted padding */}
      <div className="container mx-auto">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-16 pt-8 pb-12 rounded-3xl bg-card/50 dark:bg-slate-800/50 backdrop-blur-xl shadow-2xl border border-border/10"
        >
          <div className="inline-block p-4 bg-primary/10 rounded-full mb-6">
             <Zap className="h-16 w-16 text-primary drop-shadow-lg" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-primary mb-6">
            About TaskWise
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Streamlining your productivity with intelligent task management, built for modern teams and individuals.
          </p>
        </motion.section>

        {/* Mission and Vision Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 gap-10 mb-20 items-center"
        >
          <motion.div variants={itemVariants} className="prose prose-lg dark:prose-invert max-w-none text-foreground dark:text-slate-200">
            <h2 className="text-3xl font-bold tracking-tight text-primary mb-4 flex items-center">
              <Target className="w-8 h-8 mr-3 text-accent" /> Our Mission
            </h2>
            <p>
              To empower users with a smart, intuitive, and efficient platform for managing tasks, fostering productivity and clarity. We believe that well-organized tasks lead to accomplished goals and reduced stress.
            </p>
            <p>
              TaskWise aims to seamlessly integrate into your workflow, providing the tools you need to stay on top of your commitments, whether personal projects or complex team assignments.
            </p>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Image
              src="https://picsum.photos/seed/taskwise_mission/600/400"
              alt="Team collaborating on a project"
              width={600}
              height={400}
              className="rounded-2xl shadow-xl object-cover w-full h-auto aspect-[3/2] transform hover:scale-105 transition-transform duration-300"
              data-ai-hint="team collaboration"
            />
          </motion.div>
        </motion.section>

        {/* Key Features Section */}
        <section className="mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl font-bold tracking-tight text-center text-foreground dark:text-slate-100 mb-12"
          >
            Why Choose <span className="text-primary">TaskWise</span>?
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Rocket className="w-8 h-8" />}
              title="Intuitive & Fast"
              description="Designed for ease of use, TaskWise allows you to create, manage, and track tasks with minimal effort and maximum speed."
              delay={0.3}
            />
            <FeatureCard
              icon={<Lightbulb className="w-8 h-8" />}
              title="AI-Powered Suggestions"
              description="Leverage smart suggestions to discover related tasks, break down complex projects, and stay ahead of your workload."
              delay={0.45}
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Built for Everyone"
              description="Whether you're a solo achiever or part of a dynamic team, TaskWise adapts to your needs, helping you organize and conquer."
              delay={0.6}
            />
             <FeatureCard
              icon={<ShieldCheck className="w-8 h-8" />}
              title="Secure & Reliable"
              description="Your data is important. TaskWise is built with security in mind, ensuring your tasks are safe and accessible when you need them."
              delay={0.75}
            />
            <FeatureCard
              icon={<BarChart3 className="w-8 h-8" />}
              title="Insightful Analytics"
              description="Gain clarity on your productivity with visual analytics, helping you understand your progress and identify areas for improvement."
              delay={0.9}
            />
             <FeatureCard
              icon={<LayoutDashboard className="w-8 h-8" />}
              title="Modern Dashboard"
              description="Get a quick overview of your task landscape with a clean, informative dashboard that highlights key metrics and recent activity."
              delay={1.05}
            />
          </div>
        </section>

        {/* Call to Action or Team Section - Placeholder */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="text-center py-12 bg-primary/10 dark:bg-primary/20 rounded-2xl shadow-lg"
        >
          <h2 className="text-3xl font-bold text-primary mb-4">Ready to Boost Your Productivity?</h2>
          <p className="text-lg text-muted-foreground dark:text-slate-300 mb-6 max-w-xl mx-auto">
            Join thousands of users who trust TaskWise to manage their daily work and long-term goals.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(var(--primary-hsl), 0.3)" }} // Note: --primary-hsl needs to be defined in CSS for this to work
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg shadow-md hover:bg-primary/90 transition-all text-lg"
            onClick={() => {
              if (typeof window !== 'undefined') window.location.href = '/';
            }}
          >
            Get Started with TaskWise
          </motion.button>
        </motion.section>
      </div>
    </div>
  );
};

export default AboutPage;
