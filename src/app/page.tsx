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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSmartSuggestionsVisible, setIsSmartSuggestionsVisible] = useState(false);
  const [isSuggestingTasksLoading, setIsSuggestingTasksLoading] = useState(false); // This seems to be for the AI button itself
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  const { toast } = useToast();

  const fetchTasks = useCallback(async () => {
    setIsLoadingTasks(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`);
      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error response from server:", errorData);
        throw new Error(`Failed to fetch tasks. Status: ${response.status}`);
      }
      const data = await response.json();
      const fetchedTasks: Task[] = data.map((task: any) => ({
        ...task,
        task_due_date: task.task_due_date ? new Date(task.task_due_date) : null,
        created_on: new Date(task.created_on),
        last_updated_on: new Date(task.last_updated_on),
      }));
      setTasks(fetchedTasks.sort((a, b) => new Date(b.created_on).getTime() - new Date(a.created_on).getTime()));
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      toast({ title: 'Error Loading Tasks', description: 'Could not load tasks from the server. Please try again later.', variant: 'destructive' });
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
    const currentUser = 'User'; // Mock user, ideally from auth
    const taskPayload = {
      ...data,
      task_due_date: data.task_due_date ? data.task_due_date.toISOString() : null,
      // created_by and last_updated_by will be set by backend if needed, or passed here
    };

    try {
      let response;
      let successMessage = '';

      if (editingTask) {
        response = await fetch(`${API_BASE_URL}/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskPayload),
        });
        successMessage = `"${data.task_title}" has been updated.`;
      } else {
        response = await fetch(`${API_BASE_URL}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskPayload),
        });
        successMessage = `"${data.task_title}" has been added.`;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save task');
      }
      
      // const savedTask = await response.json(); // The backend returns the created/updated task
      toast({ title: editingTask ? 'Task Updated' : 'Task Added', description: successMessage });
      fetchTasks(); // Re-fetch tasks to update the list
    } catch (error: any) {
      console.error('Failed to submit task:', error);
      toast({ title: 'Error', description: error.message || 'Could not save the task.', variant: 'destructive' });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
  };

  const confirmDeleteTask = async () => {
    if (taskToDelete) {
      const task = tasks.find(t => t.id === taskToDelete);
      try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskToDelete}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to delete task');
        }
        toast({ title: 'Task Deleted', description: `Task "${task?.task_title}" has been deleted.`, variant: 'destructive' });
        fetchTasks(); // Re-fetch tasks
      } catch (error: any) {
        console.error('Failed to delete task:', error);
        toast({ title: 'Error', description: error.message || 'Could not delete the task.', variant: 'destructive' });
      } finally {
        setTaskToDelete(null);
      }
    }
  };

  const handleAddSuggestedTask = async (taskData: { title: string; description: string }) => {
    const currentUser = 'AI Assistant'; // Or 'User' if AI just suggests content
    const now = new Date();
    
    const newTaskPayload: TaskFormData = {
      task_title: taskData.title,
      task_description: taskData.description,
      task_due_date: null,
      task_status: TaskStatus.Pending,
      task_remarks: 'AI Suggested',
    };

    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newTaskPayload,
             created_by: currentUser, // if backend expects this
             last_updated_by: currentUser, // if backend expects this
          }),
        });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add suggested task');
      }
      // const addedTask = await response.json();
      toast({ title: 'Suggested Task Added', description: `"${newTaskPayload.task_title}" has been added.` });
      fetchTasks(); // Re-fetch tasks
    } catch (error: any) {
      console.error('Failed to add suggested task:', error);
      toast({ title: 'Error', description: error.message || 'Could not add suggested task.', variant: 'destructive' });
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
        isSuggestingTasks={isSuggestingTasksLoading} // This prop might be related to the AI button state in AppHeader
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
              existingTasks={tasks} // Pass current tasks to AI
              onAddSuggestedTask={handleAddSuggestedTask}
              isVisible={isSmartSuggestionsVisible}
              // Pass setIsSuggestingTasksLoading if SmartSuggestionsSection controls this state
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
}
