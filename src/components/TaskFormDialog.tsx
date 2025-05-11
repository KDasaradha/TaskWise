"use client";

import React from 'react'; // Added React import
import type { FC } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Task, TaskStatus } from '@/types';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const taskSchema = z.object({
  task_title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  task_description: z.string().max(500, 'Description must be 500 characters or less').optional().default(''),
  task_due_date: z.date().nullable().optional(),
  task_status: z.nativeEnum(TaskStatus),
  task_remarks: z.string().max(200, 'Remarks must be 200 characters or less').optional().default(''),
});

export type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
  initialData?: Task | null;
}

const TaskFormDialog: FC<TaskFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: initialData
      ? {
          task_title: initialData.task_title,
          task_description: initialData.task_description,
          task_due_date: initialData.task_due_date,
          task_status: initialData.task_status,
          task_remarks: initialData.task_remarks,
        }
      : {
          task_title: '',
          task_description: '',
          task_due_date: null,
          task_status: TaskStatus.Pending,
          task_remarks: '',
        },
  });

  const handleFormSubmit = (data: TaskFormData) => {
    onSubmit(data);
    reset(); // Reset form after submission
    onClose();
  };

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          task_title: initialData.task_title,
          task_description: initialData.task_description,
          task_due_date: initialData.task_due_date,
          task_status: initialData.task_status,
          task_remarks: initialData.task_remarks,
        });
      } else {
        reset({
          task_title: '',
          task_description: '',
          task_due_date: null,
          task_status: TaskStatus.Pending,
          task_remarks: '',
        });
      }
    }
  }, [initialData, reset, isOpen]);


  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[525px] bg-card shadow-xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {initialData ? 'Edit Task' : 'Add New Task'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="task_title">Title</Label>
            <Input
              id="task_title"
              {...register('task_title')}
              placeholder="Enter task title"
              className={errors.task_title ? 'border-destructive' : ''}
            />
            {errors.task_title && (
              <p className="text-sm text-destructive">{errors.task_title.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="task_description">Description (Optional)</Label>
            <Textarea
              id="task_description"
              {...register('task_description')}
              placeholder="Enter task description"
              className={errors.task_description ? 'border-destructive' : ''}
            />
            {errors.task_description && (
              <p className="text-sm text-destructive">{errors.task_description.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="task_due_date">Due Date (Optional)</Label>
              <Controller
                name="task_due_date"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={(date) => field.onChange(date || null)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="task_status">Status</Label>
              <Controller
                name="task_status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="task_status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TaskStatus).map((status) => (
                        <SelectItem key={status} value={status} className="capitalize">
                          {status.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>


          <div className="grid gap-2">
            <Label htmlFor="task_remarks">Remarks (Optional)</Label>
            <Textarea
              id="task_remarks"
              {...register('task_remarks')}
              placeholder="Enter remarks"
              className={errors.task_remarks ? 'border-destructive' : ''}
            />
            {errors.task_remarks && (
              <p className="text-sm text-destructive">{errors.task_remarks.message}</p>
            )}
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {initialData ? 'Save Changes' : 'Add Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskFormDialog;
