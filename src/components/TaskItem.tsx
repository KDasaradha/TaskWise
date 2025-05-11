"use client";

import type { FC } from 'react';
import { Task, TaskStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableRow, TableCell } from '@/components/ui/table';
import { Edit3, Trash2, CalendarDays, CircleHelp, LoaderCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const getStatusVariant = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.Pending:
      return 'secondary';
    case TaskStatus.InProgress:
      return 'default'; // Uses primary color
    case TaskStatus.Completed:
      return 'outline'; // Or 'success' if you add a success variant
    default:
      return 'secondary';
  }
};

const getStatusIcon = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.Pending:
      return <CircleHelp className="mr-2 h-4 w-4 text-muted-foreground" />;
    case TaskStatus.InProgress:
      return <LoaderCircle className="mr-2 h-4 w-4 animate-spin text-primary" />;
    case TaskStatus.Completed:
      return <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />; // Example color
    default:
      return <CircleHelp className="mr-2 h-4 w-4 text-muted-foreground" />;
  }
};

const TaskItem: FC<TaskItemProps> = ({ task, onEdit, onDelete }) => {
  return (
    <TableRow className="hover:bg-muted/50 transition-colors duration-150">
      <TableCell className="font-medium py-4 px-3">
        <div className="text-base text-foreground">{task.task_title}</div>
        {task.task_description && <p className="text-xs text-muted-foreground mt-1">{task.task_description}</p>}
      </TableCell>
      <TableCell className="py-4 px-3">
        <Badge variant={getStatusVariant(task.task_status)} className="capitalize text-xs py-1 px-2 rounded-full flex items-center">
          {getStatusIcon(task.task_status)}
          {task.task_status.replace('_', ' ')}
        </Badge>
      </TableCell>
      <TableCell className="py-4 px-3">
        {task.task_due_date ? (
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="mr-2 h-4 w-4" />
            {format(new Date(task.task_due_date), 'MMM dd, yyyy')}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground italic">Not set</span>
        )}
      </TableCell>
       <TableCell className="py-4 px-3 text-xs text-muted-foreground">
        {format(new Date(task.last_updated_on), 'MMM dd, yyyy p')}
      </TableCell>
      <TableCell className="text-right py-4 px-3">
        <div className="flex items-center justify-end space-x-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(task)} className="text-primary hover:text-primary/80 h-8 w-8">
            <Edit3 className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)} className="text-destructive hover:text-destructive/80 h-8 w-8">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default TaskItem;
