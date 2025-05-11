"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import TaskList from '@/components/TaskList';
import TaskFormDialog, { TaskFormData } from '@/components/TaskFormDialog';
import SmartSuggestionsSection from '@/components/SmartSuggestionsSection';
import { Task, TaskStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, AlertTriangle, CheckCircle, PlusCircle, Lightbulb, Loader2 as LoaderIcon } from 'lucide-react';
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
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

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

  const mainContainerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null); 
  const taskListRef = useRef<HTMLDivElement>(null);
  const smartSuggestionsRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (mainContainerRef.current && !isLoadingTasks) { 
      gsap.fromTo(mainContainerRef.current, 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.1 }
      );

      if (controlsRef.current) {
        gsap.fromTo(controlsRef.current.children,
          { opacity: 0, y: -15, scale: 0.98 },
          {
            opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.4)", stagger: 0.1,
            scrollTrigger: {
              trigger: controlsRef.current,
              start: "top 95%", 
              toggleActions: "play none none reset" 
            }
          }
        );
      }
    }
  }, [isLoadingTasks]); 

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
     if (!isSmartSuggestionsVisible && smartSuggestionsRef.current) {
      setTimeout(() => {
        smartSuggestionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 300);
    }
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.task_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.task_description && task.task_description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const buttonMotionProps = {
    whileHover: { scale: 1.03, y: -1, boxShadow: "0px 4px 12px hsla(var(--primary-rgb), 0.1)" },
    whileTap: { scale: 0.97, y: 0 },
    transition: { type: "spring", stiffness: 400, damping: 15 }
  };

  return (
    <div ref={mainContainerRef} className="w-full space-y-8"> 
      <motion.div 
        ref={controlsRef}
        className="flex flex-col sm:flex-row items-center justify-between gap-4 p-1" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
      >
        <div className="relative w-full sm:max-w-lg"> 
          <Input
            type="text"
            placeholder="Search tasks by title, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
                "pl-12 text-base py-3 rounded-xl shadow-lg border-border/60 focus-visible:ring-primary focus-visible:ring-2",
                "bg-card/90 dark:bg-card/70 backdrop-blur-sm placeholder:text-muted-foreground/80"
            )}
            aria-label="Search tasks"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>

        <div className="flex items-center space-x-2 md:space-x-3 w-full sm:w-auto justify-end shrink-0">
            <motion.div {...buttonMotionProps}>
              <Button 
                onClick={toggleSmartSuggestions} 
                variant="outline" 
                disabled={isSuggestingTasksLoading} 
                className={cn(
                    "rounded-lg shadow-md border-accent/70 hover:border-accent hover:bg-accent/10 text-accent",
                    "text-xs sm:text-sm px-3 sm:px-4 py-2 h-11 sm:h-auto transition-all duration-200"
                )}
              >
                {isSuggestingTasksLoading ? <LoaderIcon className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : <Lightbulb className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />}
                {isSuggestingTasksLoading ? 'Thinking...' : 'Smart Suggest'}
              </Button>
            </motion.div>

            <motion.div {...buttonMotionProps}>
              <Button 
                onClick={() => handleOpenForm()} 
                className={cn(
                    "rounded-lg shadow-md hover:shadow-lg text-primary-foreground",
                    "bg-primary hover:bg-primary/90", 
                    "text-xs sm:text-sm px-3 sm:px-4 py-2 h-11 sm:h-auto transition-all duration-200"
                )}
              >
                <PlusCircle className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Add Task
              </Button>
            </motion.div>
        </div>
      </motion.div>


      <div ref={taskListRef}>
        {isLoadingTasks ? (
          <div className="space-y-4 pt-4">
            {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl bg-card/80 dark:bg-card/60" />
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
            ref={smartSuggestionsRef}
            initial={{ opacity: 0, height: 0, y: 30 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: 20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden mt-6" 
          >
            <SmartSuggestionsSection
              existingTasks={tasks}
              onAddSuggestedTask={handleAddSuggestedTask}
              isVisible={isSmartSuggestionsVisible}
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
        <AlertDialogContent className="bg-card shadow-2xl rounded-xl border-border/50 glassmorphism">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-foreground">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete the task: "{tasks.find(t => t.id === taskToDelete)?.task_title || 'Selected Task'}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-5 gap-2 sm:gap-3">
            <AlertDialogCancel 
              asChild
            >
              <motion.button
                {...buttonMotionProps}
                onClick={() => setTaskToDelete(null)} 
                className="px-5 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
              >
                Cancel
              </motion.button>
            </AlertDialogCancel>
            <AlertDialogAction asChild >
              <motion.button
                {...buttonMotionProps}
                onClick={confirmDeleteTask} 
                className="px-5 py-2.5 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors text-sm font-medium"
              >
                Delete Task
              </motion.button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
