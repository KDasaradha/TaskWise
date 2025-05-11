"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FC } from 'react';
import { Task, TaskStatus } from '@/types';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'; 
import { cn } from '@/lib/utils'; 
import { AlertTriangle, CheckCircle2, ListChecks, Hourglass, Activity, CalendarClock, Eye, TrendingUp } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import Link from 'next/link';

const StatCard: FC<{ title: string; value: string | number; icon: React.ReactNode; description?: string, colorClass?: string, cardClass?: string, delay?: number }> = 
({ title, value, icon, description, colorClass = "text-primary", cardClass, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 15, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.35, ease: "circOut", delay }}
  >
    <Card 
        className={cn(
            "shadow-md hover:shadow-lg transition-all duration-200 rounded-lg overflow-hidden",
            "bg-card border-border/60",
            cardClass 
        )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3.5 px-3.5 sm:px-4">
        <CardTitle className="text-[0.7rem] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</CardTitle>
        <div className={cn("h-4 w-4 sm:h-5 sm:w-5 opacity-80", colorClass)}>{icon}</div>
      </CardHeader>
      <CardContent className="pt-0 pb-3 px-3.5 sm:px-4">
        <div className="text-2xl sm:text-3xl font-bold text-foreground">{value}</div>
        {description && <p className="text-[0.65rem] sm:text-xs text-muted-foreground/90 pt-0.5">{description}</p>}
      </CardContent>
    </Card>
  </motion.div>
);

const DashboardPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/tasks');
      const fetchedTasks: Task[] = response.data.map((task: any) => ({
        ...task,
        task_due_date: task.task_due_date ? new Date(task.task_due_date) : null,
        created_on: new Date(task.created_on),
        last_updated_on: new Date(task.last_updated_on),
      }));
      setTasks(fetchedTasks);
    } catch (error: any) {
      let description = error.message || 'Could not load tasks for dashboard.';
      if (error.message === 'Network Error') {
        description = 'Network Error: Failed to connect to the server. Please ensure the backend is running and accessible at the configured API URL.';
      }
      toast({
        title: 'Error Loading Dashboard Data',
        description: description,
        variant: 'destructive',
        icon: <AlertTriangle className="h-5 w-5" />,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.task_status === TaskStatus.Pending).length;
    const inProgress = tasks.filter(t => t.task_status === TaskStatus.InProgress).length;
    const completed = tasks.filter(t => t.task_status === TaskStatus.Completed).length;
    const overdue = tasks.filter(t => t.task_due_date && new Date(t.task_due_date) < new Date() && t.task_status !== TaskStatus.Completed).length;
    return { total, pending, inProgress, completed, overdue };
  }, [tasks]);

  const recentlyUpdatedTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b.last_updated_on).getTime() - new Date(a.last_updated_on).getTime())
      .slice(0, 5);
  }, [tasks]);
  
  const getStatusBadgeStyle = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.Pending: return "bg-amber-100 text-amber-700 border-amber-300/70 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-600/50";
      case TaskStatus.InProgress: return "bg-blue-100 text-blue-700 border-blue-300/70 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-600/50";
      case TaskStatus.Completed: return "bg-green-100 text-green-700 border-green-400/70 dark:bg-green-500/20 dark:text-green-300 dark:border-green-600/50";
      default: return "bg-slate-100 text-slate-600 border-slate-300/70 dark:bg-slate-700/20 dark:text-slate-400 dark:border-slate-600/50";
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "circOut" } },
  };
  
  const sectionVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "circOut", delay: 0.15 } },
  };

  const tableRowVariants = { 
    hidden: { opacity: 0, x: -8 },
    visible: (i: number) => ({ 
      opacity: 1, 
      x: 0, 
      transition: { delay: i * 0.04, duration:0.25, ease:"easeOut" } 
    }),
  };


  if (isLoading) {
    return (
      <div className="w-full space-y-6 sm:space-y-8">
        <motion.h1 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
        >
          Dashboard
        </motion.h1>
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 sm:h-28 rounded-lg bg-card/80" />)}
        </div>
        <Skeleton className="h-64 sm:h-72 rounded-lg bg-card/80" />
      </div>
    );
  }

  return (
    <motion.div 
      className="w-full space-y-6 sm:space-y-8"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    > 
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "circOut" }}
        className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground pb-0.5"
      >
        Productivity <span className="text-gradient-primary">Dashboard</span>
      </motion.h1>

      <motion.div 
        className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-4"
        initial="initial" // For parent container to orchestrate children
        animate="animate" // This will trigger children animations
        variants={{ animate: { transition: { staggerChildren: 0.05 }}}}
      >
        <StatCard title="Total Tasks" value={taskStats.total} icon={<ListChecks size={18}/>} description={`${taskStats.completed} completed`} cardClass="border-l-4 border-primary/70" delay={0}/>
        <StatCard title="Pending" value={taskStats.pending} icon={<Hourglass size={18}/>} colorClass="text-amber-500 dark:text-amber-400" description="Awaiting action" cardClass="border-l-4 border-amber-500/60" delay={0.05}/>
        <StatCard title="In Progress" value={taskStats.inProgress} icon={<Activity size={18}/>} colorClass="text-blue-500 dark:text-blue-400" description="Currently active" cardClass="border-l-4 border-blue-500/60" delay={0.1}/>
        <StatCard title="Completed" value={taskStats.completed} icon={<CheckCircle2 size={18}/>} colorClass="text-green-500 dark:text-green-400" description="Successfully finished" cardClass="border-l-4 border-green-500/60" delay={0.15}/>
      </motion.div>

      <motion.div variants={sectionVariants}>
        <Card className="shadow-lg rounded-xl overflow-hidden border-none bg-card">
          <CardHeader className="px-4 sm:px-5 py-3.5 border-b border-border/50">
            <div className="flex items-center space-x-2">
                <CalendarClock className="h-5 w-5 text-accent" />
                <div>
                    <CardTitle className="text-sm sm:text-base font-semibold text-foreground">Recently Updated Tasks</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">Top 5 tasks with recent activity.</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentlyUpdatedTasks.length === 0 ? (
              <div className="p-5 sm:p-6 text-center text-muted-foreground">
                 <Image 
                    src="https://picsum.photos/seed/dashboard_no_tasks/280/160" 
                    alt="No recent tasks illustration" 
                    width={280} 
                    height={160} 
                    className="mx-auto mb-3.5 rounded-md shadow-sm opacity-75"
                    data-ai-hint="empty list illustration"
                  />
                <p className="text-sm sm:text-md">No tasks have been updated recently.</p>
                <p className="text-xs mt-1">
                  <Link href="/" className="text-primary hover:underline font-medium">Manage your tasks</Link> to see updates here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50 dark:bg-muted/30">
                    <TableRow className="border-b border-border/50">
                      <TableHead className="px-3 sm:px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Title</TableHead>
                      <TableHead className="px-3 sm:px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</TableHead>
                      <TableHead className="px-3 sm:px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Last Updated</TableHead>
                      <TableHead className="px-3 sm:px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentlyUpdatedTasks.map((task, index) => (
                      <motion.tr 
                        key={task.id}
                        custom={index}
                        variants={tableRowVariants} 
                        initial="hidden" 
                        animate="visible" 
                        className="border-b border-border/40 dark:border-border/30 hover:bg-muted/40 dark:hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="font-medium px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-foreground line-clamp-1" title={task.task_title}>{task.task_title}</TableCell>
                        <TableCell className="px-3 sm:px-4 py-2.5">
                          <Badge variant={"outline"} className={cn("capitalize text-[0.65rem] sm:text-xs py-0.5 px-2 font-normal min-w-[85px] justify-center", getStatusBadgeStyle(task.task_status))}>
                            {task.task_status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[0.7rem] sm:text-xs px-3 sm:px-4 py-2.5 text-muted-foreground">
                          {formatDistanceToNow(new Date(task.last_updated_on), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-[0.7rem] sm:text-xs px-3 sm:px-4 py-2.5 text-muted-foreground text-right">
                          {task.task_due_date ? format(new Date(task.task_due_date), 'dd MMM, yyyy') : <span className="italic">Not set</span>}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
       <motion.div 
        className="mt-6 sm:mt-8 text-center"
        initial={{ opacity: 0, y:10 }}
        animate={{ opacity: 1, y:0 }}
        transition={{ delay: 0.25, duration: 0.35, ease:"easeOut" }}
      >
        <Link href="/" passHref>
          <Button 
            variant="outline" 
            className={cn(
                "rounded-md border-primary/70 hover:border-primary hover:bg-primary/10 text-primary",
                "px-5 py-2 text-xs sm:text-sm font-medium transition-all group"
            )}
            as={motion.button}
            whileHover={{ scale: 1.025, y:-1, boxShadow: "0px 2.5px 8px hsla(var(--primary-rgb),0.1)"}}
            whileTap={{ scale: 0.97}}
            transition={{type:"spring", stiffness:320, damping:16}}
          >
            <Eye className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:text-primary transition-colors" /> View All Tasks
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;
