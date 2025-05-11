
"use client";

import type { FC } from 'react';
import { Task } from '@/types';
import TaskItem from './TaskItem';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, CheckSquare } from 'lucide-react'; 
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskList: FC<TaskListProps> = ({ tasks, onEditTask, onDeleteTask }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07, 
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: "circOut" } },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.25, ease: "circIn" } }
  };

  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center py-12 px-4"
      >
        <motion.div initial={{ scale:0.5, opacity:0 }} animate={{scale:1, opacity:1}} transition={{delay:0.1, type:"spring", stiffness:200}}>
          <Inbox className="mx-auto h-16 w-16 text-primary/50 mb-5" />
        </motion.div>
        <h3 className="text-2xl font-semibold text-foreground mb-1.5">No Tasks Here!</h3>
        <p className="text-md text-muted-foreground max-w-sm mx-auto">
          Looks like your plate is clear. Ready to add your next big thing?
        </p>
        <Image 
          src="https://picsum.photos/seed/tasklist_empty_zen/350/230" 
          alt="Abstract empty state" 
          width={350} 
          height={230} 
          className="mx-auto mt-8 rounded-xl shadow-lg opacity-80"
          data-ai-hint="empty zen" 
        />
      </motion.div>
    );
  }

  return (
    <Card className={cn(
        "shadow-xl rounded-xl overflow-hidden border-none",
        "bg-card/80 dark:bg-card/70 backdrop-blur-md" 
    )}>
       <CardHeader className="px-5 py-4 border-b border-border/30 dark:border-border/25">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center">
          <CheckSquare className="mr-2.5 h-5 w-5 text-primary" />
          Your Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="min-w-full"> 
            <TableHeader className="bg-muted/10 dark:bg-muted/20">
              <TableRow className="border-b border-border/30 dark:border-border/25">
                <TableHead className="w-[35%] sm:w-[40%] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Task Details</TableHead>
                <TableHead className="w-[15%] sm:w-[15%] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                <TableHead className="w-[15%] sm:w-[15%] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Due Date</TableHead>
                <TableHead className="hidden md:table-cell w-[15%] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Updated</TableHead> 
                <TableHead className="text-right w-[20%] sm:w-[15%] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <AnimatePresence initial={false}>
              <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                {tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    motionVariants={itemVariants}
                  />
                ))}
              </motion.tbody>
            </AnimatePresence>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskList;
