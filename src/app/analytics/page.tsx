"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FC } from 'react';
import { Task, TaskStatus } from '@/types';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { AlertTriangle, Loader2, PieChartIcon, BarChartBig } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { format } from 'date-fns'; 


// Define colors for charts - ensuring they are accessible
const COLORS = {
  [TaskStatus.Pending]: 'hsl(var(--chart-1))', 
  [TaskStatus.InProgress]: 'hsl(var(--chart-2))', 
  [TaskStatus.Completed]: 'hsl(var(--chart-3))', 
  default: 'hsl(var(--muted))', 
};

const ChartCard: FC<{ title: string; description?: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ title, description, children, icon }) => (
 <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, ease: "backOut" }}
  >
    <Card className="shadow-xl rounded-2xl overflow-hidden border-none bg-card/70 dark:bg-slate-800/70 backdrop-blur-lg min-h-[450px] flex flex-col">
      <CardHeader className="border-b border-border/20 dark:border-slate-700/30">
         <div className="flex items-center space-x-3">
            {icon || <BarChartBig className="h-7 w-7 text-primary" />}
            <div>
                <CardTitle className="text-xl font-semibold text-foreground dark:text-slate-100">{title}</CardTitle>
                {description && <CardDescription className="text-sm text-muted-foreground dark:text-slate-400">{description}</CardDescription>}
            </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 flex-grow flex items-center justify-center">
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
      const date = new Date();
      date.setMonth(i);
      return date.toLocaleString('default', { month: 'short' });
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
    }));
  }, [tasks]);

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-bold text-lg">
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
          className="shadow-lg"
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
          className="opacity-50"
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="hsl(var(--foreground))" className="text-sm">{`${value} Tasks`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))" className="text-xs">
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
      <div className="container mx-auto px-4 md:px-8 py-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold tracking-tight text-foreground mb-8"
        >
          Task Analytics
        </motion.h1>
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
            <Skeleton className="h-[450px] rounded-xl" />
            <Skeleton className="h-[450px] rounded-xl" />
        </div>
      </div>
    );
  }
  
  if (tasks.length === 0 && !isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-280px)] text-center"> {/* Adjusted min-height */}
         <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "circOut" }}
          className="text-4xl font-extrabold tracking-tighter text-foreground mb-6"
        >
          Task Analytics
        </motion.h1>
        <Image 
            src="https://picsum.photos/seed/no_analytics_data/400/300" 
            alt="No data for analytics" 
            width={400} 
            height={300} 
            className="rounded-xl shadow-xl mb-8 opacity-80"
            data-ai-hint="analytics empty"
        />
        <p className="text-xl text-muted-foreground mb-2">No task data available for analytics.</p>
        <p className="text-md text-muted-foreground">Add some tasks to see your progress visualized!</p>
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
        Task Analytics
      </motion.h1>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        <ChartCard title="Task Status Distribution" description="Overview of tasks by their current status." icon={<PieChartIcon className="h-7 w-7 text-primary" />}>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                activeIndex={activePieIndex}
                activeShape={renderActiveShape}
                data={taskStatusData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                fill="hsl(var(--primary))"
                dataKey="value"
                onMouseEnter={onPieEnter}
                paddingAngle={2}
              >
                {taskStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill || COLORS.default} stroke={entry.fill || COLORS.default} className="focus:outline-none"/>
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderRadius: '0.5rem', borderColor: 'hsl(var(--border))' }}
                itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tasks Created vs. Completed by Month" description="Monthly trend of task creation and completion." icon={<BarChartBig className="h-7 w-7 text-primary" />}>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={tasksByMonthData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false}/>
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderRadius: '0.5rem', borderColor: 'hsl(var(--border))' }}
                itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                cursor={{fill: 'hsl(var(--muted)/0.3)'}}
              />
              <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }}/>
              <Bar dataKey="Created" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="Completed" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default AnalyticsPage;
