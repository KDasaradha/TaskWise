
"use client";

import type { FC } from 'react';
import { Task, TaskStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableRow, TableCell } from '@/components/ui/table';
import { Edit3, Trash2, CalendarDays, CircleHelp, LoaderCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { motion, Variants } from 'framer-motion';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  motionVariants?: Variants; // Optional prop for list animations
}

const getStatusBadgeInfo = (status: TaskStatus): { variant: "default" | "secondary" | "outline" | "destructive"; icon: JSX.Element; label: string } => {
  switch (status) {
    case TaskStatus.Pending:
      return { variant: 'secondary', icon: <CircleHelp className="h-3.5 w-3.5" />, label: 'Pending' };
    case TaskStatus.InProgress:
      return { variant: 'default', icon: <LoaderCircle className="h-3.5 w-3.5 animate-spin" />, label: 'In Progress' };
    case TaskStatus.Completed:
      return { variant: 'outline', icon: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />, label: 'Completed' };
    default:
      return { variant: 'secondary', icon: <CircleHelp className="h-3.5 w-3.5" />, label: 'Unknown' };
  }
};

const TaskItem: FC<TaskItemProps> = ({ task, onEdit, onDelete, motionVariants }) => {
  const statusInfo = getStatusBadgeInfo(task.task_status);

  const dueDateColor = task.task_due_date
    ? isPast(task.task_due_date) && !isToday(task.task_due_date) && task.task_status !== TaskStatus.Completed
      ? 'text-destructive dark:text-red-500 font-semibold'
      : isToday(task.task_due_date) && task.task_status !== TaskStatus.Completed
      ? 'text-accent dark:text-orange-400 font-semibold'
      : 'text-muted-foreground dark:text-slate-400'
    : 'text-muted-foreground dark:text-slate-400 italic';

  const rowHoverVariants = {
    hover: { 
      // backgroundColor: "hsl(var(--muted)/0.7)", // Using Tailwind's hover:bg-muted/70 is better
      scale: 1.01, 
      boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
      transition: { duration: 0.2, ease: "easeOut" }
    },
    initial: {
      // backgroundColor: "transparent",
      scale: 1,
      boxShadow: "0px 0px 0px rgba(0,0,0,0)",
    }
  };
  
  const actionButtonVariants = {
    hover: { scale: 1.1, color: "hsl(var(--primary))" },
    tap: { scale: 0.9 },
  };
  const deleteButtonVariants = {
    hover: { scale: 1.1, color: "hsl(var(--destructive))" },
    tap: { scale: 0.9 },
  };


  return (
    // Enhanced TableRow with Framer Motion for hover effects and list item animation
    <motion.tr
      variants={motionVariants} // Apply passed-in variants for list animation (e.g., stagger)
      initial="initial" // Default initial state for hover
      whileHover="hover" // Apply hover animation
      className="border-b border-border/20 dark:border-slate-700/50 hover:bg-muted/70 dark:hover:bg-slate-800/70 transition-colors duration-150 cursor-pointer group"
    >
      {/* Task Title and Description */}
      <TableCell className="font-medium py-4 px-4 align-top">
        <div className="text-base text-foreground dark:text-slate-200 group-hover:text-primary transition-colors">{task.task_title}</div>
        {task.task_description && <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1 max-w-md truncate" title={task.task_description}>{task.task_description}</p>}
      </TableCell>

      {/* Task Status Badge */}
      <TableCell className="py-4 px-4 align-middle">
        <Badge variant={statusInfo.variant} className="capitalize text-xs py-1 px-3 rounded-full flex items-center gap-1.5 shadow-sm border">
          {statusInfo.icon}
          {statusInfo.label}
        </Badge>
      </TableCell>

      {/* Task Due Date */}
      <TableCell className={`py-4 px-4 align-middle ${dueDateColor}`}>
        {task.task_due_date ? (
          <div className="flex items-center text-sm">
            {isPast(task.task_due_date) && !isToday(task.task_due_date) && task.task_status !== TaskStatus.Completed && <AlertTriangle className="mr-1.5 h-4 w-4" />}
            <CalendarDays className="mr-1.5 h-4 w-4 opacity-70" />
            {format(new Date(task.task_due_date), 'MMM dd, yyyy')}
          </div>
        ) : (
          <span className="text-sm">Not set</span>
        )}
      </TableCell>

      {/* Last Updated Timestamp */}
      <TableCell className="py-4 px-4 text-xs text-muted-foreground dark:text-slate-500 align-middle">
        {format(new Date(task.last_updated_on), 'MMM dd, p')}
      </TableCell>
      
      {/* Action Buttons with Framer Motion */}
      <TableCell className="text-right py-4 px-4 align-middle">
        <div className="flex items-center justify-end space-x-1">
          <motion.div variants={actionButtonVariants} whileHover="hover" whileTap="tap">
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEdit(task);}} className="text-muted-foreground hover:text-primary h-9 w-9 rounded-full">
              <Edit3 className="h-4.5 w-4.5" />
              <span className="sr-only">Edit Task</span>
            </Button>
          </motion.div>
          <motion.div variants={deleteButtonVariants} whileHover="hover" whileTap="tap">
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="text-muted-foreground hover:text-destructive h-9 w-9 rounded-full">
              <Trash2 className="h-4.5 w-4.5" />
              <span className="sr-only">Delete Task</span>
            </Button>
          </motion.div>
        </div>
      </TableCell>
    </motion.tr>
  );
};

export default TaskItem;
