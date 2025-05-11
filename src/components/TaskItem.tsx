
"use client";

import type { FC } from 'react';
import { Task, TaskStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableRow, TableCell } from '@/components/ui/table';
import { Edit3, Trash2, CalendarDays, CircleHelp, LoaderCircle, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { format, isPast, isToday, formatDistanceToNowStrict } from 'date-fns';
import { motion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  motionVariants?: Variants; 
}

const getStatusBadgeInfo = (status: TaskStatus): { variant: "default" | "secondary" | "outline" | "destructive"; icon: JSX.Element; label: string; className?: string } => {
  switch (status) {
    case TaskStatus.Pending:
      return { variant: 'secondary', icon: <CircleHelp className="h-3 w-3" />, label: 'Pending', className: 'bg-yellow-100/80 text-yellow-700 border-yellow-300/70 dark:bg-yellow-700/20 dark:text-yellow-300 dark:border-yellow-600/50' };
    case TaskStatus.InProgress:
      return { variant: 'default', icon: <LoaderCircle className="h-3 w-3 animate-spin" />, label: 'In Progress', className: 'bg-blue-100/80 text-primary border-blue-300/70 dark:bg-primary/20 dark:text-blue-300 dark:border-primary/50' };
    case TaskStatus.Completed:
      return { variant: 'outline', icon: <CheckCircle2 className="h-3 w-3" />, label: 'Completed', className: 'bg-green-100/70 text-green-700 border-green-400/70 dark:bg-green-700/20 dark:text-green-300 dark:border-green-600/50' };
    default:
      return { variant: 'secondary', icon: <CircleHelp className="h-3 w-3" />, label: 'Unknown', className: 'bg-muted text-muted-foreground border-border' };
  }
};

const TaskItem: FC<TaskItemProps> = ({ task, onEdit, onDelete, motionVariants }) => {
  const statusInfo = getStatusBadgeInfo(task.task_status);

  const isOverdue = task.task_due_date && isPast(task.task_due_date) && !isToday(task.task_due_date) && task.task_status !== TaskStatus.Completed;
  const isDueToday = task.task_due_date && isToday(task.task_due_date) && task.task_status !== TaskStatus.Completed;

  const dueDateClass = cn(
    "text-xs flex items-center",
    isOverdue ? "text-destructive dark:text-red-400 font-medium" : 
    isDueToday ? "text-accent dark:text-orange-400 font-medium" : 
    "text-muted-foreground dark:text-slate-400"
  );
  
  const actionButtonVariants = {
    hover: { scale: 1.05, backgroundColor: "hsla(var(--muted-hsl), 0.7)", color: "hsl(var(--primary))" }, 
    tap: { scale: 0.95 },
     transition: { type: "spring", stiffness: 400, damping: 10 }
  };
  const deleteButtonVariants = {
    hover: { scale: 1.05, backgroundColor: "hsla(var(--destructive-hsl), 0.1)", color: "hsl(var(--destructive))" }, 
    tap: { scale: 0.95 },
    transition: { type: "spring", stiffness: 400, damping: 10 }
  };


  return (
    <motion.tr
      variants={motionVariants} 
      className="border-b border-border/30 dark:border-slate-700/60 hover:bg-muted/60 dark:hover:bg-muted/30 transition-colors duration-150 group"
      layout 
    >
      <TableCell className="font-medium py-3.5 px-4 align-top">
        <div 
          className="text-sm font-semibold text-foreground dark:text-slate-100 group-hover:text-primary transition-colors cursor-pointer"
          onClick={(e) => { e.stopPropagation(); onEdit(task);}} 
        >
          {task.task_title}
        </div>
        {task.task_description && (
            <p 
              className="text-xs text-muted-foreground dark:text-slate-400 mt-0.5 max-w-xs sm:max-w-sm md:max-w-md truncate" 
              title={task.task_description}
            >
              {task.task_description}
            </p>
        )}
      </TableCell>

      <TableCell className="py-3.5 px-4 align-middle">
        <Badge variant={statusInfo.variant} className={cn("capitalize text-[0.7rem] py-0.5 px-2.5 rounded-full flex items-center gap-1 shadow-sm font-normal", statusInfo.className)}>
          {statusInfo.icon}
          {statusInfo.label}
        </Badge>
      </TableCell>

      <TableCell className={cn("py-3.5 px-4 align-middle", dueDateClass)}>
        {task.task_due_date ? (
          <>
            {isOverdue && <AlertTriangle className="mr-1 h-3.5 w-3.5 shrink-0" />}
            {!isOverdue && <CalendarDays className="mr-1 h-3.5 w-3.5 shrink-0 opacity-70" />}
            {format(new Date(task.task_due_date), 'dd MMM, yy')}
          </>
        ) : (
          <span className="italic text-muted-foreground/80 text-xs">No due date</span>
        )}
      </TableCell>

      <TableCell className="hidden md:table-cell py-3.5 px-4 text-[0.7rem] text-muted-foreground/90 dark:text-slate-500 align-middle">
        <div className="flex items-center">
            <Clock className="mr-1 h-3 w-3 shrink-0 opacity-60"/>
            {formatDistanceToNowStrict(new Date(task.last_updated_on), { addSuffix: true })}
        </div>
      </TableCell>
      
      <TableCell className="text-right py-3 px-4 align-middle">
        <div className="flex items-center justify-end space-x-0.5"> 
          <motion.div {...actionButtonVariants}>
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEdit(task);}} className="text-muted-foreground h-8 w-8 rounded-full">
              <Edit3 className="h-4 w-4" />
              <span className="sr-only">Edit Task</span>
            </Button>
          </motion.div>
          <motion.div {...deleteButtonVariants}>
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="text-muted-foreground h-8 w-8 rounded-full">
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete Task</span>
            </Button>
          </motion.div>
        </div>
      </TableCell>
    </motion.tr>
  );
};

export default TaskItem;
