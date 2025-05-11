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
import { AlertTriangle, CheckCircle2, ListChecks, Hourglass, Activity, CalendarClock, Eye } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import Link from 'next/link';

const StatCard: FC<{ title: string; value: string | number; icon: React.ReactNode; description?: string, colorClass?: string, cardClass?: string }> = 
({ title, value, icon, description, colorClass = "text-primary", cardClass }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.4, ease: "circOut" }}
  >
    <Card 
        className={cn(
            "shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden",
            "bg-card/80 dark:bg-card/70 backdrop-blur-sm border-border/40",
            cardClass 
        )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-4 px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        <div className={cn("h-5 w-5", colorClass)}>{icon}</div>
      </CardHeader>
      <CardContent className="pt-0 pb-4 px-4">
        <div className="text-3xl font-bold text-foreground">{value}</div>
        {description && <p className="text-xs text-muted-foreground pt-0.5">{description}</p>}
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
    return { total, pending, inProgress, completed };
  }, [tasks]);

  const recentlyUpdatedTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b.last_updated_on).getTime() - new Date(a.last_updated_on).getTime())
      .slice(0, 5);
  }, [tasks]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
  };

  const itemVariants = { 
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({ 
      opacity: 1, 
      x: 0, 
      transition: { delay: i * 0.05, duration:0.3, ease:"easeOut" } 
    }),
  };
  
  const getStatusBadgeStyle = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.Pending: return "bg-yellow-100/80 text-yellow-700 border-yellow-300/70 dark:bg-yellow-700/20 dark:text-yellow-300 dark:border-yellow-600/50";
      case TaskStatus.InProgress: return "bg-blue-100/80 text-primary border-blue-300/70 dark:bg-primary/20 dark:text-blue-300 dark:border-primary/50";
      case TaskStatus.Completed: return "bg-green-100/70 text-green-700 border-green-400/70 dark:bg-green-700/20 dark:text-green-300 dark:border-green-600/50";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };


  if (isLoading) {
    return (
      <div className="w-full space-y-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-bold tracking-tight text-foreground"
        >
          Dashboard
        </motion.h1>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl bg-card/70" />)}
        </div>
        <Skeleton className="h-72 rounded-xl bg-card/70" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-10"> 
      <motion.h1
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "circOut" }}
        className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground pb-1"
      >
        Task <span className="text-gradient-primary">Overview</span>
      </motion.h1>

      <motion.div 
        className="grid gap-5 md:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StatCard title="Total Tasks" value={taskStats.total} icon={<ListChecks size={20}/>} description={`${taskStats.completed} completed`} cardClass="border-l-4 border-primary/80"/>
        <StatCard title="Pending" value={taskStats.pending} icon={<Hourglass size={20}/>} colorClass="text-yellow-500 dark:text-yellow-400" description="Awaiting action" cardClass="border-l-4 border-yellow-500/70"/>
        <StatCard title="In Progress" value={taskStats.inProgress} icon={<Activity size={20}/>} colorClass="text-blue-500 dark:text-blue-400" description="Currently active" cardClass="border-l-4 border-blue-500/70"/>
        <StatCard title="Completed" value={taskStats.completed} icon={<CheckCircle2 size={20}/>} colorClass="text-green-500 dark:text-green-400" description="Successfully finished" cardClass="border-l-4 border-green-500/70"/>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "circOut" }}
      >
        <Card className="shadow-xl rounded-xl overflow-hidden border-none bg-card/80 dark:bg-card/70 backdrop-blur-md">
          <CardHeader className="px-5 py-4 border-b border-border/30 dark:border-border/25">
            <div className="flex items-center space-x-2.5">
                <CalendarClock className="h-5 w-5 text-accent" />
                <div>
                    <CardTitle className="text-md font-semibold text-foreground dark:text-slate-100">Recently Updated Tasks</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground dark:text-slate-400">Top 5 tasks with recent activity.</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentlyUpdatedTasks.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                 <Image 
                    src="https://picsum.photos/seed/dashboard_empty_recent/300/180" 
                    alt="No recent tasks" 
                    width={300} 
                    height={180} 
                    className="mx-auto mb-4 rounded-lg shadow-md opacity-80"
                    data-ai-hint="recent empty"
                  />
                <p className="text-md">No tasks have been updated recently.</p>
                <p className="text-xs mt-1">
                  <Link href="/" className="text-primary hover:underline font-medium">Manage your tasks</Link> to see updates here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/10 dark:bg-muted/20">
                    <TableRow className="border-b border-border/30 dark:border-border/25">
                      <TableHead className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</TableHead>
                      <TableHead className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                      <TableHead className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Updated</TableHead>
                      <TableHead className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentlyUpdatedTasks.map((task, index) => (
                      <motion.tr 
                        key={task.id}
                        custom={index}
                        variants={itemVariants} 
                        initial="hidden" 
                        animate="visible" 
                        className="border-b border-border/20 dark:border-border/50 hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="font-medium px-4 py-3 text-sm text-foreground dark:text-slate-200">{task.task_title}</TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge variant={"outline"} className={cn("capitalize text-[0.7rem] py-0.5 px-2 font-normal", getStatusBadgeStyle(task.task_status))}>
                            {task.task_status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs px-4 py-3 text-muted-foreground dark:text-slate-400">
                          {formatDistanceToNow(new Date(task.last_updated_on), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-xs px-4 py-3 text-muted-foreground dark:text-slate-400 text-right">
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
        className="mt-10 text-center"
        initial={{ opacity: 0, y:15 }}
        animate={{ opacity: 1, y:0 }}
        transition={{ delay: 0.4, duration: 0.4, ease:"easeOut" }}
      >
        <Link href="/" passHref>
          <Button 
            variant="outline" 
            className={cn(
                "rounded-lg border-primary/60 hover:border-primary hover:bg-primary/10 text-primary",
                "px-6 py-2.5 text-sm font-medium transition-all duration-200 group"
            )}
            as={motion.button}
            whileHover={{ scale: 1.03, y:-1, boxShadow: "0px 3px 10px hsla(var(--primary-rgb),0.1)"}}
            whileTap={{ scale: 0.97}}
            transition={{type:"spring", stiffness:300, damping:15}}
          >
            <Eye className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" /> View All Tasks
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
