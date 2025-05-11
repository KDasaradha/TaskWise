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
import { Inbox, CheckSquare, ListChecks } from 'lucide-react'; 
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
        staggerChildren: 0.06, 
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.99 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "circOut" } },
    exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.2, ease: "circIn" } }
  };

  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "circOut" }}
        className="text-center py-10 sm:py-16 px-4"
      >
        <motion.div initial={{ scale:0.6, opacity:0 }} animate={{scale:1, opacity:1}} transition={{delay:0.05, type:"spring", stiffness:220, damping: 12}}>
          <Inbox className="mx-auto h-14 w-14 text-primary/40 dark:text-primary/30 mb-4" />
        </motion.div>
        <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-1.5">Your Task List is Empty</h3>
        <p className="text-sm sm:text-md text-muted-foreground max-w-xs sm:max-w-sm mx-auto">
          Looks like you're all caught up! Add a new task to get started.
        </p>
        <Image 
          src="https://picsum.photos/seed/task_empty_modern/320/200" 
          alt="A calming empty workspace" 
          width={320} 
          height={200} 
          className="mx-auto mt-6 rounded-lg shadow-md opacity-70"
          data-ai-hint="empty workspace" 
        />
      </motion.div>
    );
  }

  return (
    <Card className={cn(
        "shadow-lg rounded-xl overflow-hidden border-none",
        "bg-card" 
    )}>
       <CardHeader className="px-4 sm:px-5 py-3.5 border-b border-border/50">
        <CardTitle className="text-base sm:text-lg font-semibold text-foreground flex items-center">
          <ListChecks className="mr-2 h-5 w-5 text-primary" />
          Task Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="min-w-full"> 
            <TableHeader className="bg-muted/50 dark:bg-muted/30">
              <TableRow className="border-b border-border/50">
                <TableHead className="w-[35%] sm:w-[40%] px-3 sm:px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Task</TableHead>
                <TableHead className="w-[20%] sm:w-[15%] px-3 sm:px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</TableHead>
                <TableHead className="w-[20%] sm:w-[15%] px-3 sm:px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Due Date</TableHead>
                <TableHead className="hidden md:table-cell w-[15%] px-3 sm:px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Updated</TableHead> 
                <TableHead className="text-right w-[10%] sm:w-[15%] px-3 sm:px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            {/* AnimatePresence should wrap the direct children that will enter/exit */}
            <TableBody>
              <AnimatePresence initial={false}>
                {tasks.map((task) => (
                    <TaskItem
                      key={task.id} // Key must be on the motion component for AnimatePresence
                      task={task}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                      motionVariants={itemVariants}
                    />
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskList;
