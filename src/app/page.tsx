"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import TaskList from '@/components/TaskList';
import TaskFormDialog, { TaskFormData } from '@/components/TaskFormDialog';
import SmartSuggestionsSection from '@/components/SmartSuggestionsSection';
import { Task, TaskStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, AlertTriangle, CheckCircle, PlusCircle, Lightbulb, Loader2 as LoaderIcon, LayoutGrid } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import axiosInstance from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSmartSuggestionsVisible, setIsSmartSuggestionsVisible] = useState(false);
  const [isSuggestingTasksLoading, setIsSuggestingTasksLoading] = useState(false); 
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  const { toast } = useToast();
  const pageContainerRef = useRef<HTMLDivElement>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoadingTasks(true);
    try {
      const response = await axiosInstance.get('/tasks');
      const data = response.data;
      const fetchedTasks: Task[] = data.map((task: any) => ({
        ...task,
        task_due_date: task.task_due_date ? new Date(task.task_due_date) : null,
        created_on: new Date(task.created_on),
        last_updated_on: new Date(task.last_updated_on),
      }));
      setTasks(fetchedTasks.sort((a, b) => new Date(b.created_on).getTime() - new Date(a.created_on).getTime()));
    } catch (error: any) {
      let description = error.response?.data?.detail || error.message || 'Could not load tasks.';
      if (error.message === 'Network Error') {
        description = 'Network Error: Please ensure the backend server is running and accessible.';
      }
      toast({ 
        title: 'Error Loading Tasks', 
        description: description, 
        variant: 'destructive',
        icon: <AlertTriangle className="h-5 w-5" />
      });
    } finally {
      setIsLoadingTasks(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleOpenForm = (task?: Task) => {
    setEditingTask(task || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleFormSubmit = async (data: TaskFormData) => {
    try {
      const taskPayload = {
        ...data,
        task_due_date: data.task_due_date ? data.task_due_date.toISOString() : null,
        last_updated_by: "User", 
        created_by: editingTask ? editingTask.created_by : "User", 
      };

      let successMessage = '';
      if (editingTask) {
        await axiosInstance.put(`/tasks/${editingTask.id}`, taskPayload);
        successMessage = `"${data.task_title}" has been updated.`;
      } else {
        await axiosInstance.post('/tasks', taskPayload);
        successMessage = `"${data.task_title}" has been added.`;
      }
      
      toast({ 
        title: editingTask ? 'Task Updated' : 'Task Added', 
        description: successMessage,
        variant: 'success', 
        icon: <CheckCircle className="h-5 w-5" /> 
      });
      fetchTasks(); 
      handleCloseForm();
    } catch (error: any) {
      let description = error.response?.data?.detail || error.message || 'Could not save the task.';
      if (error.message === 'Network Error') {
        description = 'Network Error: Please ensure the backend server is running and accessible before saving.';
      }
      toast({ 
        title: 'Error Saving Task', 
        description: description, 
        variant: 'destructive',
        icon: <AlertTriangle className="h-5 w-5" />
      });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
  };

  const confirmDeleteTask = async () => {
    if (taskToDelete) {
      const task = tasks.find(t => t.id === taskToDelete);
      try {
        await axiosInstance.delete(`/tasks/${taskToDelete}`);
        toast({ 
          title: 'Task Deleted', 
          description: `Task "${task?.task_title}" has been removed.`, 
          variant: 'success', 
          icon: <CheckCircle className="h-5 w-5" /> 
        });
        fetchTasks(); 
      } catch (error: any) {
        let description = error.response?.data?.detail || error.message || 'Could not delete the task.';
        if (error.message === 'Network Error') {
          description = 'Network Error: Please ensure the backend server is running and accessible before deleting.';
        }
        toast({ 
          title: 'Error Deleting Task', 
          description: description, 
          variant: 'destructive',
          icon: <AlertTriangle className="h-5 w-5" />
        });
      } finally {
        setTaskToDelete(null);
      }
    }
  };

  const handleAddSuggestedTask = async (taskData: { title: string; description: string }) => {
    const currentUser = 'AI Assistant'; 
    
    const newTaskPayload = {
      task_title: taskData.title,
      task_description: taskData.description,
      task_due_date: null, 
      task_status: TaskStatus.Pending,
      task_remarks: 'AI Suggested',
      created_by: currentUser,
    };

    try {
        await axiosInstance.post('/tasks', newTaskPayload);
        toast({ 
          title: 'Suggested Task Added', 
          description: `"${newTaskPayload.task_title}" has been added.`,
          variant: 'success',
          icon: <CheckCircle className="h-5 w-5" /> 
        });
        fetchTasks(); 
    } catch (error: any) {
      let description = error.response?.data?.detail || error.message || 'Could not add suggested task.';
      if (error.message === 'Network Error') {
        description = 'Network Error: Please ensure the backend server is running and accessible.';
      }
      toast({ 
        title: 'Error Adding Suggested Task', 
        description: description, 
        variant: 'destructive',
        icon: <AlertTriangle className="h-5 w-5" />
      });
    }
  };

  const toggleSmartSuggestions = () => {
    setIsSmartSuggestionsVisible(prev => !prev);
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.task_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.task_description && task.task_description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const pageVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "circOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.25, ease: "circIn" } }
  };

  const controlsVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.35, ease: "circOut" } }
  };
  
  const buttonMotionProps = {
    whileHover: { scale: 1.02, y: -1, boxShadow: "0px 3px 10px hsla(var(--primary-rgb), 0.12)" },
    whileTap: { scale: 0.97, y: 0 },
    transition: { type: "spring", stiffness: 350, damping: 15 }
  };


  return (
    <motion.div 
      ref={pageContainerRef} 
      className="w-full space-y-6 sm:space-y-8"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    > 
      <motion.div 
        className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4" 
        variants={controlsVariants}
      >
        <div className="relative w-full sm:max-w-md lg:max-w-lg"> 
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
                "pl-10 text-sm sm:text-base py-2.5 h-11 rounded-lg shadow-sm border-border/70 focus-visible:ring-primary focus-visible:ring-1.5",
                "bg-card placeholder:text-muted-foreground/70"
            )}
            aria-label="Search tasks"
          />
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-[1.1rem] w-[1.1rem] text-muted-foreground/80" />
        </div>

        <div className="flex items-center space-x-2 sm:space-x-2.5 w-full sm:w-auto justify-end shrink-0">
            <motion.div {...buttonMotionProps}>
              <Button 
                onClick={toggleSmartSuggestions} 
                variant="outline" 
                disabled={isSuggestingTasksLoading} 
                className={cn(
                    "rounded-lg shadow-sm border-accent/80 hover:border-accent hover:bg-accent/10 text-accent",
                    "text-xs sm:text-sm px-3 h-10 sm:h-11 transition-all group"
                )}
              >
                {isSuggestingTasksLoading ? <LoaderIcon className="mr-1.5 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-1.5 h-4 w-4 group-hover:fill-current transition-colors" />}
                {isSuggestingTasksLoading ? 'AI Thinking...' : 'Smart Ideas'}
              </Button>
            </motion.div>

            <motion.div {...buttonMotionProps}>
              <Button 
                onClick={() => handleOpenForm()} 
                className={cn(
                    "rounded-lg shadow-md hover:shadow-lg text-primary-foreground",
                    "bg-primary hover:bg-primary/90", 
                    "text-xs sm:text-sm px-3 h-10 sm:h-11 transition-all"
                )}
              >
                <PlusCircle className="mr-1.5 h-4 w-4" />
                Add New Task
              </Button>
            </motion.div>
        </div>
      </motion.div>

      <div>
        {isLoadingTasks ? (
          <div className="space-y-3.5 pt-3">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-[72px] w-full rounded-lg bg-card/90" />
            ))}
          </div>
        ) : (
          <TaskList
            tasks={filteredTasks}
            onEditTask={handleOpenForm}
            onDeleteTask={handleDeleteTask}
          />
        )}
      </div>
      
      <AnimatePresence>
        {isSmartSuggestionsVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: 20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: 15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden mt-5" 
          >
            <SmartSuggestionsSection
              existingTasks={tasks}
              onAddSuggestedTask={handleAddSuggestedTask}
              isVisible={isSmartSuggestionsVisible} // Pass visibility for internal logic if needed
            />
          </motion.div>
        )}
      </AnimatePresence>

      <TaskFormDialog
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingTask}
      />
      
      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent className="bg-card shadow-xl rounded-lg border-border/60">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-foreground">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm">
              Are you sure you want to delete the task: "{tasks.find(t => t.id === taskToDelete)?.task_title || 'Selected Task'}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2 sm:gap-2.5">
            <AlertDialogCancel asChild >
              <motion.button
                {...buttonMotionProps}
                onClick={() => setTaskToDelete(null)} 
                className="px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors text-xs sm:text-sm font-medium"
              >
                Cancel
              </motion.button>
            </AlertDialogCancel>
            <AlertDialogAction asChild >
              <motion.button
                {...buttonMotionProps}
                onClick={confirmDeleteTask} 
                className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors text-xs sm:text-sm font-medium"
              >
                Delete Task
              </motion.button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
