"use client";

import { useState, useEffect, useCallback } from 'react';
import AppHeader from '@/components/AppHeader';
import TaskList from '@/components/TaskList';
import TaskFormDialog, { TaskFormData } from '@/components/TaskFormDialog';
import SmartSuggestionsSection from '@/components/SmartSuggestionsSection';
import { Task, TaskStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
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
      // Axios interceptor will log detailed error
      const errorMessage = error.response?.data?.detail || error.message || 'Could not load tasks. Please ensure the backend is running.';
      toast({ title: 'Error Loading Tasks', description: errorMessage, variant: 'destructive' });
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
    let response;
    let successMessage = '';

    try {
      if (editingTask) {
        // For PUT, construct payload based on TaskUpdate model expectations (optional fields)
        // TaskFormData from Zod has defaults, so all fields will be present.
        // Backend's TaskUpdate uses exclude_unset=True, so this is fine.
        const updatePayload = {
          ...data, // Contains all fields from TaskFormData
          task_due_date: data.task_due_date ? data.task_due_date.toISOString() : null,
          last_updated_by: "User", // Example: should ideally be dynamic
        };
        response = await axiosInstance.put(`/tasks/${editingTask.id}`, updatePayload);
        successMessage = `"${data.task_title}" has been updated.`;
      } else {
        // For POST, construct payload explicitly matching TaskCreate model (or TaskBase fields)
        const createPayload = {
          task_title: data.task_title,
          task_description: data.task_description, // Zod default ensures this is a string
          task_due_date: data.task_due_date ? data.task_due_date.toISOString() : null,
          task_status: data.task_status,
          task_remarks: data.task_remarks, // Zod default ensures this is a string
          created_by: "User", // Example: backend TaskCreate also has a default
        };
        response = await axiosInstance.post('/tasks', createPayload);
        successMessage = `"${data.task_title}" has been added.`;
      }
      
      toast({ title: editingTask ? 'Task Updated' : 'Task Added', description: successMessage });
      fetchTasks(); 
      handleCloseForm();
    } catch (error: any) {
      // Axios interceptor will log detailed error
      const errorMessage = error.response?.data?.detail || error.message || 'Could not save the task. Please ensure the backend is running and reachable.';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
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
        toast({ title: 'Task Deleted', description: `Task "${task?.task_title}" has been deleted.`, variant: 'destructive' });
        fetchTasks(); 
      } catch (error: any) {
        // Axios interceptor will log detailed error
        const errorMessage = error.response?.data?.detail || error.message || 'Could not delete the task.';
        toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
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
      task_due_date: null, // Suggested tasks might not have a due date initially
      task_status: TaskStatus.Pending,
      task_remarks: 'AI Suggested',
      created_by: currentUser,
    };

    try {
        await axiosInstance.post('/tasks', newTaskPayload);
        toast({ title: 'Suggested Task Added', description: `"${newTaskPayload.task_title}" has been added.` });
        fetchTasks(); 
    } catch (error: any) {
      // Axios interceptor will log detailed error
      const errorMessage = error.response?.data?.detail || error.message || 'Could not add suggested task.';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
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
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader 
        onAddTask={() => handleOpenForm()} 
        onSuggestTasks={toggleSmartSuggestions}
        isSuggestingTasks={isSuggestingTasksLoading}
      />
      <main className="flex-grow container mx-auto px-4 md:px-8 py-8">
        <div className="mb-6 relative">
          <Input
            type="text"
            placeholder="Search tasks by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-base py-6 rounded-lg shadow-sm focus-visible:ring-primary focus-visible:ring-2"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>

        {isLoadingTasks ? (
          <div className="text-center py-10 text-muted-foreground">Loading tasks...</div>
        ) : (
          <TaskList
            tasks={filteredTasks}
            onEditTask={handleOpenForm}
            onDeleteTask={handleDeleteTask}
          />
        )}
        
        {isSmartSuggestionsVisible && (
           <SmartSuggestionsSection
              existingTasks={tasks}
              onAddSuggestedTask={handleAddSuggestedTask}
              isVisible={isSmartSuggestionsVisible}
           />
        )}
      </main>

      <TaskFormDialog
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingTask}
      />

      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task
              "{tasks.find(t => t.id === taskToDelete)?.task_title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTaskToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTask} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <footer className="text-center py-6 border-t border-border text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} TaskWise. Built with Next.js, FastAPI, and AI.</p>
      </footer>
    </div>
  );
