
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
  DialogOverlay, 
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
import { CalendarIcon, Save, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion'; 

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

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: "circOut" } },
  exit: { opacity: 0, scale: 0.98, y: -5, transition: { duration: 0.15, ease: "circIn" } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
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
    formState: { errors, isSubmitting }, 
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

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
  };

  const buttonMotionProps = {
    whileHover: { scale: 1.02, y: -1, boxShadow: "0px 3px 10px hsla(var(--primary-rgb), 0.1)" }, 
    whileTap: { scale: 0.98, y: 0 },
    transition: { type: "spring", stiffness: 350, damping: 15 }
  };

  return (
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
        <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <DialogOverlay className="bg-black/70 backdrop-blur-sm" />
            </motion.div>
            
            <DialogContent 
              as={motion.div} 
              variants={dialogVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                "sm:max-w-[580px] bg-card/90 dark:bg-card/85 backdrop-blur-xl", 
                "shadow-2xl rounded-xl border border-border/40 dark:border-border/30"
              )}
              onEscapeKeyDown={onClose}
            >
              <DialogHeader className="pb-3 border-b border-border/30">
                <DialogTitle className="text-xl font-semibold text-foreground dark:text-slate-100">
                  {initialData ? 'Edit Task' : 'Create New Task'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-y-5 pt-3">
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}>
                  <Label htmlFor="task_title" className="text-xs font-medium text-muted-foreground dark:text-slate-400">Task Title</Label>
                  <Input
                    id="task_title"
                    {...register('task_title')}
                    placeholder="e.g., Design new homepage mockup"
                    className={cn(
                        "mt-1.5 py-2.5 bg-input/70 dark:bg-input/60 border-border/60 dark:border-border/50", 
                        "focus-visible:border-primary",
                        errors.task_title && 'border-destructive focus-visible:ring-destructive/40'
                    )}
                    aria-invalid={errors.task_title ? "true" : "false"}
                  />
                  {errors.task_title && (
                    <p className="text-xs text-destructive mt-1">{errors.task_title.message}</p>
                  )}
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <Label htmlFor="task_description" className="text-xs font-medium text-muted-foreground dark:text-slate-400">Description</Label>
                  <Textarea
                    id="task_description"
                    {...register('task_description')}
                    placeholder="Add more details..."
                    className={cn(
                        "mt-1.5 bg-input/70 dark:bg-input/60 border-border/60 dark:border-border/50 min-h-[90px]", 
                        "focus-visible:border-primary",
                        errors.task_description && 'border-destructive focus-visible:ring-destructive/40'
                    )}
                    aria-invalid={errors.task_description ? "true" : "false"}
                  />
                  {errors.task_description && (
                    <p className="text-xs text-destructive mt-1">{errors.task_description.message}</p>
                  )}
                </motion.div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                    <Label htmlFor="task_due_date" className="text-xs font-medium text-muted-foreground dark:text-slate-400">Due Date</Label>
                    <Controller
                      name="task_due_date"
                      control={control}
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal mt-1.5 py-2.5",
                                "bg-input/70 dark:bg-input/60 border-border/60 dark:border-border/50 hover:bg-muted/60 dark:hover:bg-muted/40",
                                !field.value && "text-muted-foreground dark:text-slate-400"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 opacity-80" />
                              {field.value ? format(field.value, "dd MMM, yyyy") : 
                                <span className="text-muted-foreground/80">Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-card border-border/50 shadow-xl rounded-lg" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={(date) => field.onChange(date || null)}
                              initialFocus
                              disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))} 
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                  </motion.div>

                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <Label htmlFor="task_status" className="text-xs font-medium text-muted-foreground dark:text-slate-400">Status</Label>
                    <Controller
                      name="task_status"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger id="task_status" className={cn(
                              "mt-1.5 py-2.5 bg-input/70 dark:bg-input/60 border-border/60 dark:border-border/50",
                              "focus:border-primary"
                            )}>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border/50 shadow-xl rounded-lg">
                            {Object.values(TaskStatus).map((status) => (
                              <SelectItem key={status} value={status} className="capitalize hover:bg-accent/20 dark:hover:bg-accent/30 py-2">
                                {status.replace('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </motion.div>
                </div>

                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                  <Label htmlFor="task_remarks" className="text-xs font-medium text-muted-foreground dark:text-slate-400">Remarks</Label>
                  <Textarea
                    id="task_remarks"
                    {...register('task_remarks')}
                    placeholder="Any additional notes..."
                    className={cn(
                        "mt-1.5 bg-input/70 dark:bg-input/60 border-border/60 dark:border-border/50 min-h-[70px]",
                        "focus-visible:border-primary",
                        errors.task_remarks && 'border-destructive focus-visible:ring-destructive/40'
                    )}
                    aria-invalid={errors.task_remarks ? "true" : "false"}
                  />
                  {errors.task_remarks && (
                    <p className="text-xs text-destructive mt-1">{errors.task_remarks.message}</p>
                  )}
                </motion.div>

                <DialogFooter className="mt-5 pt-5 border-t border-border/30 gap-2.5 sm:gap-3">
                  <DialogClose asChild>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className={cn(
                        "border-border/70 dark:border-border/60 hover:bg-muted/70 dark:hover:bg-muted/50 rounded-lg",
                        "py-2.5 px-5 text-sm"
                      )}
                      as={motion.button} 
                      {...buttonMotionProps} 
                      onClick={onClose} 
                    >
                      <XCircle className="mr-2 h-4.5 w-4.5 opacity-90" />
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className={cn(
                      "bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg",
                      "py-2.5 px-5 text-sm transition-all duration-200"
                    )}
                    as={motion.button} 
                    {...buttonMotionProps} 
                  >
                    {isSubmitting ? <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" /> : <Save className="mr-2 h-4.5 w-4.5 opacity-90" />}
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
