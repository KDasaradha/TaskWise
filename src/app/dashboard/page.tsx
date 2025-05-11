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
import { AlertTriangle, CheckCircle2, Loader2, ListChecks, Hourglass, Activity, CalendarClock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import Link from 'next/link';

const StatCard: FC<{ title: string; value: number | string; icon: React.ReactNode; description?: string, colorClass?: string }> = ({ title, value, icon, description, colorClass = "text-primary" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-primary rounded-xl overflow-hidden bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("h-6 w-6", colorClass)}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        {description && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
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
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };
  
  const getStatusBadgeVariant = (status: TaskStatus): "default" | "secondary" | "outline" | "destructive" | null | undefined => {
    switch (status) {
      case TaskStatus.Pending: return "secondary";
      case TaskStatus.InProgress: return "default";
      case TaskStatus.Completed: return "outline"; 
      default: return "secondary";
    }
  };


  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold tracking-tight text-foreground mb-8"
        >
          Dashboard
        </motion.h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-background via-secondary/10 to-background dark:from-gray-900 dark:via-gray-800/20 dark:to-gray-900 py-8 px-4 sm:px-6 lg:px-0"> {/* Adjusted padding */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "circOut" }}
        className="text-4xl font-extrabold tracking-tighter text-foreground mb-10 pb-2 border-b-2 border-primary/30"
      >
        Task Dashboard
      </motion.h1>

      <motion.div 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StatCard title="Total Tasks" value={taskStats.total} icon={<ListChecks />} description={`${taskStats.completed} completed`} />
        <StatCard title="Pending" value={taskStats.pending} icon={<Hourglass />} colorClass="text-yellow-500" description="Awaiting action" />
        <StatCard title="In Progress" value={taskStats.inProgress} icon={<Activity />} colorClass="text-blue-500" description="Currently active" />
        <StatCard title="Completed" value={taskStats.completed} icon={<CheckCircle2 />} colorClass="text-green-500" description="Successfully finished" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "circOut" }}
      >
        <Card className="shadow-xl rounded-2xl overflow-hidden border-none bg-card/70 dark:bg-slate-800/70 backdrop-blur-lg">
          <CardHeader className="border-b border-border/20 dark:border-slate-700/30">
            <div className="flex items-center space-x-3">
                <CalendarClock className="h-7 w-7 text-accent" />
                <div>
                    <CardTitle className="text-xl font-semibold text-foreground dark:text-slate-100">Recently Updated Tasks</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground dark:text-slate-400">Top 5 tasks with recent activity.</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentlyUpdatedTasks.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                 <Image 
                    src="https://picsum.photos/seed/empty_recent_tasks/300/200" 
                    alt="No recent tasks" 
                    width={300} 
                    height={200} 
                    className="mx-auto mb-4 rounded-lg shadow-md opacity-75"
                    data-ai-hint="empty tasks"
                  />
                <p className="text-lg">No tasks have been updated recently.</p>
                <p className="text-sm">
                  <Link href="/" className="text-primary hover:underline">Manage your tasks</Link> to see updates here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/20 dark:bg-slate-700/40">
                    <TableRow className="border-b border-border/30">
                      <TableHead className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Title</TableHead>
                      <TableHead className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</TableHead>
                      <TableHead className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Last Updated</TableHead>
                      <TableHead className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentlyUpdatedTasks.map((task, index) => (
                      <motion.tr 
                        key={task.id}
                        variants={itemVariants} 
                        initial="hidden" 
                        animate="visible" 
                        custom={index} 
                        className="border-b border-border/20 dark:border-slate-700/50 hover:bg-muted/50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <TableCell className="font-medium px-4 py-3 text-foreground dark:text-slate-200">{task.task_title}</TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge variant={getStatusBadgeVariant(task.task_status)} className="capitalize text-xs">
                            {task.task_status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs px-4 py-3 text-muted-foreground dark:text-slate-400">
                          {formatDistanceToNow(new Date(task.last_updated_on), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-xs px-4 py-3 text-muted-foreground dark:text-slate-400 text-right">
                          {task.task_due_date ? format(new Date(task.task_due_date), 'MMM dd, yyyy') : 'Not set'}
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
        className="mt-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <Link href="/">
          <Button variant="outline" className="rounded-lg border-primary/50 hover:border-primary hover:bg-primary/10 transition-all duration-300">
            View All Tasks
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
