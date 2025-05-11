
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
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox } from 'lucide-react'; // Icon for empty state

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskList: FC<TaskListProps> = ({ tasks, onEditTask, onDeleteTask }) => {
  // Framer Motion variants for the list container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Stagger animation of children
        delayChildren: 0.2,
      },
    },
  };

  // Framer Motion variants for individual task items
  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, scale: 0.9, transition: { duration: 0.3, ease: "easeIn" } }
  };

  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-16 px-6"
      >
        <Inbox className="mx-auto h-16 w-16 text-muted-foreground/70 mb-6" />
        <h3 className="text-2xl font-semibold text-foreground mb-2">No Tasks Yet!</h3>
        <p className="text-lg text-muted-foreground">
          Looks like your task list is empty. Click "Add Task" to get started.
        </p>
        <Image 
          src="https://picsum.photos/seed/taskwise_empty_modern/400/250" 
          alt="Stylized empty task list representation" 
          width={400} 
          height={250} 
          className="mx-auto mt-8 rounded-xl shadow-2xl opacity-70"
          data-ai-hint="empty illustration" 
        />
      </motion.div>
    );
  }

  return (
    // Enhanced Card styling with glassmorphism potential
    <Card className="shadow-2xl rounded-2xl overflow-hidden border-none bg-card/60 dark:bg-slate-800/60 backdrop-blur-md">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/20 dark:bg-slate-700/30">
              {/* Table Header with modern styling */}
              <TableRow className="border-b border-border/30">
                <TableHead className="w-[40%] px-4 py-4 text-sm font-semibold text-foreground/80 dark:text-slate-300 tracking-wider">Task Details</TableHead>
                <TableHead className="w-[15%] px-4 py-4 text-sm font-semibold text-foreground/80 dark:text-slate-300 tracking-wider">Status</TableHead>
                <TableHead className="w-[15%] px-4 py-4 text-sm font-semibold text-foreground/80 dark:text-slate-300 tracking-wider">Due Date</TableHead>
                <TableHead className="w-[15%] px-4 py-4 text-sm font-semibold text-foreground/80 dark:text-slate-300 tracking-wider">Last Updated</TableHead>
                <TableHead className="text-right w-[15%] px-4 py-4 text-sm font-semibold text-foreground/80 dark:text-slate-300 tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            {/* AnimatePresence handles enter/exit animations for items */}
            <AnimatePresence initial={false}>
              <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                {tasks.map((task) => (
                  // Each TaskItem is wrapped in motion.tr for individual animation
                  <TaskItem
                    key={task.id} // Key must be on the motion component for AnimatePresence
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
