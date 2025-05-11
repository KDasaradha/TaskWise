"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FC } from 'react';
import { Task, TaskStatus } from '@/types';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { AlertTriangle, Loader2, PieChartIcon, BarChartBig, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { format } from 'date-fns'; 
import { cn } from '@/lib/utils';


const COLORS = {
  [TaskStatus.Pending]: 'hsl(var(--chart-1))', 
  [TaskStatus.InProgress]: 'hsl(var(--chart-2))', 
  [TaskStatus.Completed]: 'hsl(var(--chart-3))', 
  default: 'hsl(var(--muted))', 
};

const ChartCard: FC<{ title: string; description?: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ title, description, children, icon }) => (
 <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.45, ease: "circOut" }}
  >
    <Card 
        className={cn(
            "shadow-xl rounded-xl overflow-hidden border-none min-h-[420px] flex flex-col",
            "bg-card/80 dark:bg-card/70 backdrop-blur-md"
        )}
    >
      <CardHeader className="border-b border-border/30 dark:border-border/25 pb-3 pt-4 px-5">
         <div className="flex items-center space-x-2.5">
            {icon || <BarChartBig className="h-6 w-6 text-primary" />}
            <div>
                <CardTitle className="text-md font-semibold text-foreground dark:text-slate-100">{title}</CardTitle>
                {description && <CardDescription className="text-xs text-muted-foreground dark:text-slate-400 mt-0.5">{description}</CardDescription>}
            </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5 flex-grow flex items-center justify-center">
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
        task_due_date: task.task_due_date ? new Date(task.task_due_date) : null,
        created_on: new Date(task.created_on),
        last_updated_on: new Date(task.last_updated_on),
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
    const sortedMonths = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(2000, i, 1); 
      return format(date, 'MMM');
    });
  
    sortedMonths.forEach(month => {
      monthCounts[month] = { created: 0, completed: 0 };
    });
  
    tasks.forEach(task => {
      const createdOnDate = new Date(task.created_on);
      if (!isNaN(createdOnDate.getTime())) {
        const createdMonth = format(createdOnDate, 'MMM');
        if (monthCounts[createdMonth]) {
          monthCounts[createdMonth].created++;
        }
      }

      if (task.task_status === TaskStatus.Completed && task.last_updated_on) {
        const lastUpdatedOnDate = new Date(task.last_updated_on); 
        if(!isNaN(lastUpdatedOnDate.getTime())) {
            const completedMonth = format(lastUpdatedOnDate, 'MMM');
            if (monthCounts[completedMonth]) {
              monthCounts[completedMonth].completed++;
            }
        }
      }
    });
  
    return sortedMonths.map(month => ({
      name: month,
      Created: monthCounts[month].created,
      Completed: monthCounts[month].completed,
    })).filter(d => d.Created > 0 || d.Completed > 0); 
  }, [tasks]);

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 8) * cos; 
    const sy = cy + (outerRadius + 8) * sin;
    const mx = cx + (outerRadius + 20) * cos; 
    const my = cy + (outerRadius + 20) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 18; 
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g className="drop-shadow-md">
        <text x={cx} y={cy} dy={5} textAnchor="middle" fill={fill} className="font-bold text-base">
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
          strokeWidth={2}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 4}
          outerRadius={outerRadius + 7}
          fill={fill}
          className="opacity-60"
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={1.5} />
        <circle cx={ex} cy={ey} r={3} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 10} y={ey} textAnchor={textAnchor} fill="hsl(var(--foreground))" className="text-xs font-medium">{`${value} Tasks`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 10} y={ey} dy={14} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))" className="text-[0.65rem]">
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
      <div className="w-full space-y-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold tracking-tight text-foreground"
        >
          Task Analytics
        </motion.h1>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Skeleton className="h-[420px] rounded-xl bg-card/70" />
            <Skeleton className="h-[420px] rounded-xl bg-card/70" />
        </div>
      </div>
    );
  }
  
  if (tasks.length === 0 && !isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[calc(100vh-250px)] text-center px-4">
         <motion.h1
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "circOut" }}
          className="text-3xl font-extrabold tracking-tight text-foreground mb-5"
        >
          Task Analytics
        </motion.h1>
        <Image 
            src="https://picsum.photos/seed/analytics_no_data_modern/380/280" 
            alt="No data available for analytics" 
            width={380} 
            height={280} 
            className="rounded-xl shadow-xl mb-6 opacity-80"
            data-ai-hint="chart empty"
        />
        <p className="text-lg text-muted-foreground mb-1.5">No task data to crunch!</p>
        <p className="text-sm text-muted-foreground/80">Start adding tasks to visualize your productivity journey.</p>
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
        Task <span className="text-gradient-primary">Analytics</span>
      </motion.h1>

      <motion.div 
        className="grid gap-6 md:grid-cols-1 lg:grid-cols-2"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
      >
        <ChartCard title="Task Status Breakdown" description="Current distribution of tasks by status." icon={<PieChartIcon className="h-6 w-6 text-primary" />}>
          {taskStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <Pie
                  activeIndex={activePieIndex}
                  activeShape={renderActiveShape}
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70} 
                  outerRadius={110} 
                  fill="hsl(var(--primary))"
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  paddingAngle={3}
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || COLORS.default} stroke={"hsl(var(--card))"} strokeWidth={1.5} className="focus:outline-none"/>
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderRadius: '0.5rem', borderColor: 'hsl(var(--border))', padding: '8px 12px', fontSize: '0.75rem' }}
                  itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="text-center text-muted-foreground text-sm p-4">No status data available.</div>
          )}
        </ChartCard>

        <ChartCard title="Monthly Task Trends" description="Tasks created vs. completed each month." icon={<TrendingUp className="h-6 w-6 text-primary" />}>
          {tasksByMonthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={tasksByMonthData} margin={{ top: 5, right: 15, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.4)" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={{stroke: "hsl(var(--border)/0.5)"}}/>
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} width={35}/>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderRadius: '0.5rem', borderColor: 'hsl(var(--border))', padding: '8px 12px', fontSize: '0.75rem' }}
                  itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  cursor={{fill: 'hsl(var(--muted)/0.2)'}}
                />
                <Legend wrapperStyle={{ fontSize: '0.7rem', paddingTop: '8px' }} iconSize={10}/>
                <Bar dataKey="Created" fill="hsl(var(--chart-4))" radius={[3, 3, 0, 0]} barSize={16} />
                <Bar dataKey="Completed" fill="hsl(var(--chart-5))" radius={[3, 3, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="text-center text-muted-foreground text-sm p-4">No monthly trend data available.</div>
          )}
        </ChartCard>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
