
"use client";

import React, { useEffect } from 'react';
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
  DialogOverlay, // Import DialogOverlay for background animation
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
import { CalendarIcon, Save, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion'; // Import Framer Motion

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

// Framer Motion variants for dialog
const dialogVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

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
    formState: { errors, isSubmitting }, // Added isSubmitting for button state
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    // Default values are set in useEffect to handle dynamic initialData
  });

  // Effect to reset form when initialData changes or dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      const defaultValues = initialData
        ? {
            task_title: initialData.task_title,
            task_description: initialData.task_description || '',
            task_due_date: initialData.task_due_date ? new Date(initialData.task_due_date) : null,
            task_status: initialData.task_status,
            task_remarks: initialData.task_remarks || '',
          }
        : {
            task_title: '',
            task_description: '',
            task_due_date: null,
            task_status: TaskStatus.Pending,
            task_remarks: '',
          };
      reset(defaultValues);
    }
  }, [initialData, isOpen, reset]);

  const handleFormSubmit = (data: TaskFormData) => {
    onSubmit(data);
    // No need to reset here if onSubmit leads to unmount via AnimatePresence
  };

  // Button animation variants
  const buttonMotionProps = {
    whileHover: { scale: 1.03, transition: { duration: 0.15 } },
    whileTap: { scale: 0.97 },
  };

  return (
    // AnimatePresence handles the mounting/unmounting animations
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
        <AnimatePresence>
        {isOpen && (
          <>
            {/* Animated Overlay */}
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
            </motion.div>
            
            {/* Animated Dialog Content with glassmorphism */}
            <DialogContent 
              as={motion.div} // Use motion.div for DialogContent
              variants={dialogVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="sm:max-w-[550px] bg-card/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl rounded-xl border border-border/30 dark:border-slate-700/50"
              onEscapeKeyDown={onClose}
              onPointerDownOutside={onClose} // Ensures clicking outside closes
            >
              <DialogHeader className="mb-2">
                <DialogTitle className="text-2xl font-semibold text-foreground dark:text-slate-100">
                  {initialData ? 'Edit Task Details' : 'Create a New Task'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-5 pt-2 pb-4">
                {/* Task Title Input */}
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <Label htmlFor="task_title" className="text-sm font-medium text-muted-foreground dark:text-slate-300">Task Title</Label>
                  <Input
                    id="task_title"
                    {...register('task_title')}
                    placeholder="e.g., Finalize project report"
                    className={cn("mt-1 bg-background/70 dark:bg-slate-700/50 border-border/50 dark:border-slate-600", errors.task_title && 'border-destructive focus-visible:ring-destructive')}
                    aria-invalid={errors.task_title ? "true" : "false"}
                  />
                  {errors.task_title && (
                    <p className="text-xs text-destructive mt-1">{errors.task_title.message}</p>
                  )}
                </motion.div>

                {/* Task Description Textarea */}
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                  <Label htmlFor="task_description" className="text-sm font-medium text-muted-foreground dark:text-slate-300">Description (Optional)</Label>
                  <Textarea
                    id="task_description"
                    {...register('task_description')}
                    placeholder="Add more details about the task..."
                    className={cn("mt-1 bg-background/70 dark:bg-slate-700/50 border-border/50 dark:border-slate-600 min-h-[100px]", errors.task_description && 'border-destructive focus-visible:ring-destructive')}
                    aria-invalid={errors.task_description ? "true" : "false"}
                  />
                  {errors.task_description && (
                    <p className="text-xs text-destructive mt-1">{errors.task_description.message}</p>
                  )}
                </motion.div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Due Date Picker */}
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <Label htmlFor="task_due_date" className="text-sm font-medium text-muted-foreground dark:text-slate-300">Due Date (Optional)</Label>
                    <Controller
                      name="task_due_date"
                      control={control}
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal mt-1 bg-background/70 dark:bg-slate-700/50 border-border/50 dark:border-slate-600 hover:bg-muted/50 dark:hover:bg-slate-600/50",
                                !field.value && "text-muted-foreground dark:text-slate-400"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-card border-border/50 shadow-xl rounded-lg" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={(date) => field.onChange(date || null)}
                              initialFocus
                              disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))} // Disable past dates
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                  </motion.div>

                  {/* Task Status Select */}
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                    <Label htmlFor="task_status" className="text-sm font-medium text-muted-foreground dark:text-slate-300">Status</Label>
                    <Controller
                      name="task_status"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger id="task_status" className="mt-1 bg-background/70 dark:bg-slate-700/50 border-border/50 dark:border-slate-600">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border/50 shadow-xl rounded-lg">
                            {Object.values(TaskStatus).map((status) => (
                              <SelectItem key={status} value={status} className="capitalize hover:bg-accent/50 dark:hover:bg-slate-600/50">
                                {status.replace('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </motion.div>
                </div>

                {/* Task Remarks Textarea */}
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <Label htmlFor="task_remarks" className="text-sm font-medium text-muted-foreground dark:text-slate-300">Remarks (Optional)</Label>
                  <Textarea
                    id="task_remarks"
                    {...register('task_remarks')}
                    placeholder="Any additional notes or comments..."
                    className={cn("mt-1 bg-background/70 dark:bg-slate-700/50 border-border/50 dark:border-slate-600", errors.task_remarks && 'border-destructive focus-visible:ring-destructive')}
                    aria-invalid={errors.task_remarks ? "true" : "false"}
                  />
                  {errors.task_remarks && (
                    <p className="text-xs text-destructive mt-1">{errors.task_remarks.message}</p>
                  )}
                </motion.div>

                <DialogFooter className="mt-6 gap-2 sm:gap-0">
                  <DialogClose asChild>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="border-border/50 dark:border-slate-600 hover:bg-muted/50 dark:hover:bg-slate-700/50 rounded-lg"
                      as={motion.button} // Use motion.button for Framer Motion
                      {...buttonMotionProps} // Apply animation props
                      onClick={onClose} // Ensure onClose is called
                    >
                      <XCircle className="mr-2 h-4.5 w-4.5" />
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    as={motion.button} // Use motion.button for Framer Motion
                    {...buttonMotionProps} // Apply animation props
                  >
                    <Save className="mr-2 h-4.5 w-4.5" />
                    {isSubmitting ? (initialData ? 'Saving...' : 'Adding...') : (initialData ? 'Save Changes' : 'Add Task')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </>
        )}
        </AnimatePresence>
      </Dialog>
  );
};

export default TaskFormDialog;
