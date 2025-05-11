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
  DialogDescription,
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
import { CalendarIcon, Save, XCircle, Loader2, Edit } from 'lucide-react';
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
  hidden: { opacity: 0, scale: 0.96, y: 5 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: "circOut" } },
  exit: { opacity: 0, scale: 0.97, y: -3, transition: { duration: 0.1, ease: "circIn" } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
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
    setValue, // Added setValue to clear date
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
    whileHover: { scale: 1.015, y: -1, boxShadow: "0px 2.5px 8px hsla(var(--primary-rgb), 0.1)" }, 
    whileTap: { scale: 0.98, y: 0 },
    transition: { type: "spring", stiffness: 380, damping: 16 }
  };

  return (
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
        <AnimatePresence>
        {isOpen && (
          <>
            <DialogOverlay as={motion.div} variants={overlayVariants} initial="hidden" animate="visible" exit="exit" className="bg-black/60 backdrop-blur-sm" />
            
            <DialogContent 
              as={motion.div} 
              variants={dialogVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                "sm:max-w-[560px] bg-card", 
                "shadow-xl rounded-lg border border-border/50"
              )}
              onEscapeKeyDown={onClose}
            >
              <DialogHeader className="pb-3.5 border-b border-border/40">
                <DialogTitle className="text-lg sm:text-xl font-semibold text-foreground flex items-center">
                  <Edit className="mr-2 h-5 w-5 text-primary" />
                  {initialData ? 'Edit Task Details' : 'Create a New Task'}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground pt-0.5">
                  Fill in the details below to {initialData ? 'update your' : 'create a'} task.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-y-4 pt-2.5">
                <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}>
                  <Label htmlFor="task_title" className="text-xs font-medium text-muted-foreground">Task Title <span className="text-destructive">*</span></Label>
                  <Input
                    id="task_title"
                    {...register('task_title')}
                    placeholder="e.g., Plan weekly sprint"
                    className={cn(
                        "mt-1 h-10 bg-input/60 border-border/70 text-sm", 
                        "focus-visible:border-primary",
                        errors.task_title && 'border-destructive focus-visible:ring-destructive/30'
                    )}
                    aria-invalid={errors.task_title ? "true" : "false"}
                  />
                  {errors.task_title && (
                    <p className="text-xs text-destructive mt-0.5">{errors.task_title.message}</p>
                  )}
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <Label htmlFor="task_description" className="text-xs font-medium text-muted-foreground">Description (Optional)</Label>
                  <Textarea
                    id="task_description"
                    {...register('task_description')}
                    placeholder="Provide a brief overview of the task..."
                    className={cn(
                        "mt-1 bg-input/60 border-border/70 min-h-[80px] text-sm", 
                        "focus-visible:border-primary",
                        errors.task_description && 'border-destructive focus-visible:ring-destructive/30'
                    )}
                    aria-invalid={errors.task_description ? "true" : "false"}
                  />
                  {errors.task_description && (
                    <p className="text-xs text-destructive mt-0.5">{errors.task_description.message}</p>
                  )}
                </motion.div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3.5 gap-y-4">
                  <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                    <Label htmlFor="task_due_date" className="text-xs font-medium text-muted-foreground">Due Date (Optional)</Label>
                    <Controller
                      name="task_due_date"
                      control={control}
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal mt-1 h-10 text-sm",
                                "bg-input/60 border-border/70 hover:bg-muted/50",
                                !field.value && "text-muted-foreground/80"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                              {field.value ? format(field.value, "dd MMM, yyyy") : 
                                <span className="text-muted-foreground/70">Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-card border-border/60 shadow-lg rounded-md" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={(date) => field.onChange(date || null)}
                              initialFocus
                              disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))} 
                            />
                             <div className="p-2 border-t border-border/50 text-center">
                                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => field.onChange(null)}>Clear Date</Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                  </motion.div>

                  <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <Label htmlFor="task_status" className="text-xs font-medium text-muted-foreground">Status</Label>
                    <Controller
                      name="task_status"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || TaskStatus.Pending}>
                          <SelectTrigger id="task_status" className={cn(
                              "mt-1 h-10 bg-input/60 border-border/70 text-sm",
                              "focus:border-primary"
                            )}>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border/60 shadow-lg rounded-md">
                            {Object.values(TaskStatus).map((status) => (
                              <SelectItem key={status} value={status} className="capitalize hover:bg-accent/15 dark:hover:bg-accent/25 py-1.5 text-sm">
                                {status.replace('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </motion.div>
                </div>

                <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                  <Label htmlFor="task_remarks" className="text-xs font-medium text-muted-foreground">Remarks (Optional)</Label>
                  <Textarea
                    id="task_remarks"
                    {...register('task_remarks')}
                    placeholder="Add any final notes or comments..."
                    className={cn(
                        "mt-1 bg-input/60 border-border/70 min-h-[70px] text-sm",
                        "focus-visible:border-primary",
                        errors.task_remarks && 'border-destructive focus-visible:ring-destructive/30'
                    )}
                    aria-invalid={errors.task_remarks ? "true" : "false"}
                  />
                  {errors.task_remarks && (
                    <p className="text-xs text-destructive mt-0.5">{errors.task_remarks.message}</p>
                  )}
                </motion.div>

                <DialogFooter className="mt-4 pt-4 border-t border-border/40 gap-2 sm:gap-2.5">
                  <DialogClose asChild>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className={cn(
                        "border-border/80 hover:bg-muted/60 rounded-md",
                        "py-2 px-4 text-xs sm:text-sm h-9 sm:h-10"
                      )}
                      as={motion.button} 
                      {...buttonMotionProps} 
                      onClick={onClose} 
                    >
                      <XCircle className="mr-1.5 h-4 w-4 opacity-80" />
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className={cn(
                      "bg-primary hover:bg-primary/90 text-primary-foreground rounded-md shadow-sm hover:shadow-md",
                      "py-2 px-4 text-xs sm:text-sm h-9 sm:h-10 transition-all"
                    )}
                    as={motion.button} 
                    {...buttonMotionProps} 
                  >
                    {isSubmitting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4 opacity-90" />}
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
