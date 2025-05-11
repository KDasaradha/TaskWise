"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FC } from 'react';
import { Task, TaskStatus } from '@/types';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { AlertTriangle, Loader2, PieChartIcon, BarChartBig, TrendingUp, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { format, parseISO } from 'date-fns'; 
import { cn } from '@/lib/utils';


const COLORS = {
  [TaskStatus.Pending]: 'hsl(var(--chart-1))', 
  [TaskStatus.InProgress]: 'hsl(var(--chart-2))', 
  [TaskStatus.Completed]: 'hsl(var(--chart-3))', 
  default: 'hsl(var(--chart-default))', 
};

const ChartCard: FC<{ title: string; description?: string; children: React.ReactNode; icon?: React.ReactNode, delay?: number }> = 
({ title, description, children, icon, delay=0 }) => (
 <motion.div
    initial={{ opacity: 0, y: 15, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.35, ease: "circOut", delay }}
  >
    <Card 
        className={cn(
            "shadow-lg rounded-xl overflow-hidden border-none min-h-[380px] sm:min-h-[400px] flex flex-col",
            "bg-card"
        )}
    >
      <CardHeader className="border-b border-border/50 pb-2.5 pt-3.5 px-4 sm:px-5">
         <div className="flex items-center space-x-2">
            {icon || <BarChartBig className="h-5 w-5 text-primary" />}
            <div>
                <CardTitle className="text-sm sm:text-base font-semibold text-foreground">{title}</CardTitle>
                {description && <CardDescription className="text-xs text-muted-foreground mt-0.5">{description}</CardDescription>}
            </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 sm:pt-5 flex-grow flex items-center justify-center px-2 sm:px-3">
        {children}
      </CardContent>
    </Card>
  </motion.div>
);


const AnalyticsPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [activePieIndex, setActivePieIndex] = useState(0);


  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/tasks');
      const fetchedTasks: Task[] = response.data.map((task: any) => ({
        ...task,
        task_due_date: task.task_due_date ? parseISO(task.task_due_date) : null,
        created_on: parseISO(task.created_on),
        last_updated_on: parseISO(task.last_updated_on),
      }));
      setTasks(fetchedTasks);
    } catch (error: any) {
      let description = error.message || 'Could not load tasks for analytics.';
      if (error.message === 'Network Error') {
        description = 'Network Error: Failed to connect to the server. Please ensure the backend is running and accessible at the configured API URL.';
      }
      toast({
        title: 'Error Loading Analytics Data',
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

  const taskStatusData = useMemo(() => {
    const counts = {
      [TaskStatus.Pending]: 0,
      [TaskStatus.InProgress]: 0,
      [TaskStatus.Completed]: 0,
    };
    tasks.forEach(task => {
      if (task.task_status in counts) {
        counts[task.task_status]++;
      }
    });
    return [
      { name: 'Pending', value: counts[TaskStatus.Pending], fill: COLORS[TaskStatus.Pending] },
      { name: 'In Progress', value: counts[TaskStatus.InProgress], fill: COLORS[TaskStatus.InProgress] },
      { name: 'Completed', value: counts[TaskStatus.Completed], fill: COLORS[TaskStatus.Completed] },
    ].filter(item => item.value > 0); 
  }, [tasks]);
  
  const tasksByMonthData = useMemo(() => {
    const monthCounts: { [key: string]: { created: number; completed: number } } = {};
    
    // Create a list of month names for the last 12 months for correct sorting
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const sortedMonths: string[] = [];
    for (let i = 11; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - i, 1);
        const monthKey = format(date, 'yyyy-MMM'); // Use yyyy-MMM for unique keys across years
        sortedMonths.push(monthKey);
        monthCounts[monthKey] = { created: 0, completed: 0 };
    }

    tasks.forEach(task => {
      if (task.created_on && !isNaN(new Date(task.created_on).getTime())) {
        const createdMonthKey = format(new Date(task.created_on), 'yyyy-MMM');
        if (monthCounts[createdMonthKey]) {
          monthCounts[createdMonthKey].created++;
        }
      }

      if (task.task_status === TaskStatus.Completed && task.last_updated_on) {
         if(!isNaN(new Date(task.last_updated_on).getTime())) {
            const completedMonthKey = format(new Date(task.last_updated_on), 'yyyy-MMM');
            if (monthCounts[completedMonthKey]) {
              monthCounts[completedMonthKey].completed++;
            }
        }
      }
    });
  
    return sortedMonths.map(monthKey => ({
      name: format(parseISO(monthKey.split('-')[0] + '-' + format(new Date(monthKey), 'MM') + '-01T00:00:00.000Z'), 'MMM yy'), // Format to 'Mon yy'
      Created: monthCounts[monthKey].created,
      Completed: monthCounts[monthKey].completed,
    })).filter(d => d.Created > 0 || d.Completed > 0 || sortedMonths.slice(-6).includes(d.name.replace(' ','-'))); // Show at least last 6 months even if zero
  }, [tasks]);

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 6) * cos; 
    const sy = cy + (outerRadius + 6) * sin;
    const mx = cx + (outerRadius + 18) * cos; 
    const my = cy + (outerRadius + 18) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 15; 
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g style={{ filter: `drop-shadow(0px 2px 3px rgba(0,0,0,0.1))` }}>
        <text x={cx} y={cy} dy={5} textAnchor="middle" fill={fill} className="font-semibold text-sm sm:text-base">
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="hsl(var(--card))" 
          strokeWidth={1.5}
        />
        <Sector // Outer ring for emphasis
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 3}
          outerRadius={outerRadius + 5}
          fill={fill}
          className="opacity-50"
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={1.2} />
        <circle cx={ex} cy={ey} r={2.5} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 8} y={ey} textAnchor={textAnchor} fill="hsl(var(--foreground))" className="text-[0.65rem] sm:text-xs font-medium">{`${value} Tasks`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 8} y={ey} dy={12} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))" className="text-[0.6rem] sm:text-[0.65rem]">
          {`(${(percent * 100).toFixed(0)}%)`}
        </text>
      </g>
    );
  };
  
  const onPieEnter = (_: any, index: number) => {
    setActivePieIndex(index);
  };


  if (isLoading) {
    return (
      <div className="w-full space-y-6 sm:space-y-8">
        <motion.h1 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
        >
          Task Analytics
        </motion.h1>
        <div className="grid gap-5 md:grid-cols-1 lg:grid-cols-2">
            <Skeleton className="h-[380px] sm:h-[400px] rounded-xl bg-card/80" />
            <Skeleton className="h-[380px] sm:h-[400px] rounded-xl bg-card/80" />
        </div>
      </div>
    );
  }
  
  if (tasks.length === 0 && !isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[calc(100vh-280px)] text-center px-4">
         <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "circOut" }}
          className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-4"
        >
          Task Analytics
        </motion.h1>
        <Image 
            src="https://picsum.photos/seed/analytics_empty_modern/350/250" 
            alt="No data available for analytics chart" 
            width={350} 
            height={250} 
            className="rounded-lg shadow-md mb-5 opacity-75"
            data-ai-hint="chart illustration empty"
        />
        <p className="text-md text-muted-foreground mb-1">No task data to crunch just yet!</p>
        <p className="text-sm text-muted-foreground/80">Start adding and completing tasks to visualize your productivity.</p>
      </div>
    );
  }

  const pageVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "circOut" } },
  };

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
        Task <span className="text-gradient-primary">Insights</span>
      </motion.h1>

      <div 
        className="grid gap-5 md:grid-cols-1 lg:grid-cols-2"
      >
        <ChartCard title="Task Status Breakdown" description="Current distribution of tasks by status." icon={<PieChartIcon className="h-5 w-5 text-primary" />} delay={0.05}>
          {taskStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <Pie
                  activeIndex={activePieIndex}
                  activeShape={renderActiveShape}
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60} 
                  outerRadius={95} 
                  fill="hsl(var(--primary))"
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  paddingAngle={2.5}
                  stroke="none"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || COLORS.default} stroke={"hsl(var(--card))"} strokeWidth={1}/>
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderRadius: '0.375rem', borderColor: 'hsl(var(--border)/0.7)', padding: '6px 10px', fontSize: '0.7rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  cursor={{ fill: 'hsl(var(--muted)/0.15)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="text-center text-muted-foreground text-xs sm:text-sm p-3">No status data available. Add tasks to see chart.</div>
          )}
        </ChartCard>

        <ChartCard title="Monthly Task Activity" description="Tasks created vs. completed by month." icon={<TrendingUp className="h-5 w-5 text-primary" />} delay={0.1}>
          {tasksByMonthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tasksByMonthData} margin={{ top: 5, right: 10, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="hsl(var(--border)/0.3)" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={{stroke: "hsl(var(--border)/0.4)"}}/>
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} width={30}/>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderRadius: '0.375rem', borderColor: 'hsl(var(--border)/0.7)', padding: '6px 10px', fontSize: '0.7rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  cursor={{fill: 'hsl(var(--muted)/0.15)'}}
                />
                <Legend wrapperStyle={{ fontSize: '0.65rem', paddingTop: '6px' }} iconSize={8}/>
                <Bar dataKey="Created" fill="hsl(var(--chart-4))" radius={[2.5, 2.5, 0, 0]} barSize={12} />
                <Bar dataKey="Completed" fill="hsl(var(--chart-5))" radius={[2.5, 2.5, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="text-center text-muted-foreground text-xs sm:text-sm p-3">No monthly trend data available. Complete tasks to see progress.</div>
          )}
        </ChartCard>
      </div>
    </motion.div>
  );
};

export default AnalyticsPage;
