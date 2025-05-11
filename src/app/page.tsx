"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import AppHeader from '@/components/AppHeader';
import TaskList from '@/components/TaskList';
import TaskFormDialog, { TaskFormData } from '@/components/TaskFormDialog';
import SmartSuggestionsSection from '@/components/SmartSuggestionsSection';
import { Task, TaskStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Search, AlertTriangle, CircleCheck } from 'lucide-react';
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
import { usePathname } from 'next/navigation';


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
  const pathname = usePathname();


  const mainContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLDivElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);
  const smartSuggestionsRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);


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
    if (mainContainerRef.current) {
      gsap.fromTo(mainContainerRef.current, 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.2 }
      );

      if (searchInputRef.current) {
        gsap.fromTo(searchInputRef.current,
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: searchInputRef.current,
              start: "top 90%", 
              toggleActions: "play none none none" 
            }
          }
        );
      }
      
      if (footerRef.current) {
        gsap.fromTo(footerRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0, duration: 0.7, ease: "power2.out",
            scrollTrigger: {
              trigger: footerRef.current,
              start: "top 95%",
              toggleActions: "play none none none"
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
        icon: <CircleCheck className="h-5 w-5 text-green-500" />
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
          icon: <CircleCheck className="h-5 w-5 text-primary" /> 
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
          icon: <CircleCheck className="h-5 w-5 text-green-500" /> 
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/30 dark:from-gray-900 dark:to-gray-800 overflow-x-hidden">
      <AppHeader 
        onAddTask={handleOpenForm} 
        onSuggestTasks={toggleSmartSuggestions}
        isSuggestingTasks={isSuggestingTasksLoading}
      />
      <main ref={mainContainerRef} className="flex-grow container mx-auto px-4 md:px-8 py-8">
        <motion.div
          ref={searchInputRef}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 relative"
        >
          <Input
            type="text"
            placeholder="Search tasks by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 text-base py-6 rounded-xl shadow-lg border-border/50 focus-visible:ring-primary focus-visible:ring-2 bg-card/80 backdrop-blur-sm"
            aria-label="Search tasks"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground" />
        </motion.div>

        <div ref={taskListRef}>
          {isLoadingTasks ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10 text-muted-foreground text-lg"
            >
              Loading tasks...
            </motion.div>
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
              initial={{ opacity: 0, height: 0, y: 50 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 30 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="overflow-hidden" 
            >
              <SmartSuggestionsSection
                existingTasks={tasks}
                onAddSuggestedTask={handleAddSuggestedTask}
                isVisible={isSmartSuggestionsVisible}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isFormOpen && (
          <TaskFormDialog
            isOpen={isFormOpen}
            onClose={handleCloseForm}
            onSubmit={handleFormSubmit}
            initialData={editingTask}
          />
        )}
      </AnimatePresence>

      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent className="bg-card shadow-2xl rounded-xl border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-foreground">Are you sure you want to delete this task?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete the task
              "{tasks.find(t => t.id === taskToDelete)?.task_title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel 
              asChild
              onClick={() => setTaskToDelete(null)}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                Cancel
              </motion.button>
            </AlertDialogCancel>
            <AlertDialogAction asChild onClick={confirmDeleteTask}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                Delete
              </motion.button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <motion.footer 
        ref={footerRef}
        className="text-center py-8 border-t border-border/30 text-sm text-muted-foreground mt-12"
      >
        <p>&copy; {new Date().getFullYear()} TaskWise. Crafted with Next.js, FastAPI, and AI magic.</p>
      </motion.footer>
    </div>
  );
}
