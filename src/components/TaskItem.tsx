"use client";

import type { FC } from 'react';
import { Task, TaskStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableRow, TableCell } from '@/components/ui/table';
import { Edit3, Trash2, CalendarClock, AlertTriangle, CircleDot, CircleCheck, CirclePause } from 'lucide-react';
import { format, isPast, isToday, formatDistanceToNowStrict } from 'date-fns';
import { motion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  motionVariants?: Variants; 
}

const getStatusBadgeInfo = (status: TaskStatus): { icon: JSX.Element; label: string; className?: string } => {
  switch (status) {
    case TaskStatus.Pending:
      return { icon: <CirclePause className="h-3 w-3" />, label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-300/70 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-600/50' };
    case TaskStatus.InProgress:
      return { icon: <CircleDot className="h-3 w-3 animate-pulse" />, label: 'In Progress', className: 'bg-blue-100 text-blue-700 border-blue-300/70 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-600/50' };
    case TaskStatus.Completed:
      return { icon: <CircleCheck className="h-3 w-3" />, label: 'Completed', className: 'bg-green-100 text-green-700 border-green-400/70 dark:bg-green-500/20 dark:text-green-300 dark:border-green-600/50' };
    default:
      return { icon: <CirclePause className="h-3 w-3" />, label: 'Unknown', className: 'bg-slate-100 text-slate-600 border-slate-300/70 dark:bg-slate-700/20 dark:text-slate-400 dark:border-slate-600/50' };
  }
};

const TaskItem: FC<TaskItemProps> = ({ task, onEdit, onDelete, motionVariants }) => {
  const statusInfo = getStatusBadgeInfo(task.task_status);

  const isOverdue = task.task_due_date && isPast(new Date(task.task_due_date)) && !isToday(new Date(task.task_due_date)) && task.task_status !== TaskStatus.Completed;
  const isDueToday = task.task_due_date && isToday(new Date(task.task_due_date)) && task.task_status !== TaskStatus.Completed;

  const dueDateClass = cn(
    "text-[0.7rem] sm:text-xs flex items-center",
    isOverdue ? "text-destructive dark:text-red-400/90 font-medium" : 
    isDueToday ? "text-accent dark:text-orange-400/90 font-medium" : 
    "text-muted-foreground/90 dark:text-slate-400/80"
  );
  
  const actionButtonMotionProps = {
    whileHover: { scale: 1.08, y: -0.5, color: "hsl(var(--primary))" }, 
    whileTap: { scale: 0.92 },
    transition: { type: "spring", stiffness: 400, damping: 12 }
  };
  const deleteButtonMotionProps = {
    whileHover: { scale: 1.08, y: -0.5, color: "hsl(var(--destructive))" }, 
    whileTap: { scale: 0.92 },
    transition: { type: "spring", stiffness: 400, damping: 12 }
  };

  return (
    <motion.tr
      key={task.id} // Ensure key is here for AnimatePresence direct child
      variants={motionVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout // Enables smooth layout changes
      className="border-b border-border/40 dark:border-border/30 hover:bg-muted/40 dark:hover:bg-muted/20 transition-colors duration-150 group"
    >
      <TableCell className="py-3 px-3 sm:px-4 align-top">
        <div 
          className="text-sm font-medium text-foreground dark:text-slate-100 group-hover:text-primary transition-colors cursor-pointer line-clamp-1"
          onClick={(e) => { e.stopPropagation(); onEdit(task);}} 
          title={task.task_title}
        >
          {task.task_title}
        </div>
        {task.task_description && (
            <p 
              className="text-xs text-muted-foreground dark:text-slate-400/90 mt-0.5 max-w-[150px] sm:max-w-xs md:max-w-sm line-clamp-1" 
              title={task.task_description}
            >
              {task.task_description}
            </p>
        )}
      </TableCell>

      <TableCell className="py-3 px-3 sm:px-4 align-middle">
        <Badge variant={"outline"} className={cn("capitalize text-[0.65rem] sm:text-xs py-0.5 px-2 rounded-full flex items-center gap-1 shadow-xs font-normal min-w-[90px] justify-center", statusInfo.className)}>
          {statusInfo.icon}
          <span className="truncate">{statusInfo.label}</span>
        </Badge>
      </TableCell>

      <TableCell className={cn("py-3 px-3 sm:px-4 align-middle", dueDateClass)}>
        {task.task_due_date ? (
          <>
            {isOverdue && <AlertTriangle className="mr-1 h-3.5 w-3.5 shrink-0" />}
            {!isOverdue && isDueToday && <CalendarClock className="mr-1 h-3.5 w-3.5 shrink-0 text-accent" />}
            {!isOverdue && !isDueToday && <CalendarClock className="mr-1 h-3.5 w-3.5 shrink-0 opacity-60" />}
            {format(new Date(task.task_due_date), 'dd MMM yy')}
          </>
        ) : (
          <span className="italic text-muted-foreground/70 text-[0.7rem] sm:text-xs">Not set</span>
        )}
      </TableCell>

      <TableCell className="hidden md:table-cell py-3 px-3 sm:px-4 text-[0.7rem] text-muted-foreground/80 dark:text-slate-500/90 align-middle">
        {formatDistanceToNowStrict(new Date(task.last_updated_on), { addSuffix: true })}
      </TableCell>
      
      <TableCell className="text-right py-2.5 px-3 sm:px-4 align-middle">
        <div className="flex items-center justify-end space-x-0"> 
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => { e.stopPropagation(); onEdit(task);}} 
            className="text-muted-foreground/80 hover:text-primary h-7 w-7 sm:h-8 sm:w-8 rounded-md"
            asChild
          >
            <motion.button {...actionButtonMotionProps}>
              <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sr-only">Edit Task</span>
            </motion.button>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} 
            className="text-muted-foreground/80 hover:text-destructive h-7 w-7 sm:h-8 sm:w-8 rounded-md"
            asChild
          >
            <motion.button {...deleteButtonMotionProps}>
              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sr-only">Delete Task</span>
            </motion.button>
          </Button>
        </div>
      </TableCell>
    </motion.tr>
  );
};

export default TaskItem;
