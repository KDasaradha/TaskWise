"use client";

import { useState, useEffect } from 'react';
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


const initialTasks: Task[] = [
  {
    id: '1',
    task_title: 'Setup project environment',
    task_description: 'Initialize Next.js, install dependencies, configure Tailwind.',
    task_due_date: new Date(new Date().setDate(new Date().getDate() + 2)),
    task_status: TaskStatus.Completed,
    task_remarks: 'All set up!',
    created_on: new Date(new Date().setDate(new Date().getDate() - 3)),
    last_updated_on: new Date(new Date().setDate(new Date().getDate() - 2)),
    created_by: 'Dev Team',
    last_updated_by: 'Dev Team',
  },
  {
    id: '2',
    task_title: 'Develop Task List UI',
    task_description: 'Create component to display tasks in a table with sorting and filtering.',
    task_due_date: new Date(new Date().setDate(new Date().getDate() + 5)),
    task_status: TaskStatus.InProgress,
    task_remarks: 'Working on responsiveness.',
    created_on: new Date(new Date().setDate(new Date().getDate() - 1)),
    last_updated_on: new Date(),
    created_by: 'Frontend Lead',
    last_updated_by: 'Frontend Lead',
  },
  {
    id: '3',
    task_title: 'Implement Task Creation Logic',
    task_description: 'Build form and backend endpoint for adding new tasks.',
    task_due_date: new Date(new Date().setDate(new Date().getDate() + 7)),
    task_status: TaskStatus.Pending,
    task_remarks: '',
    created_on: new Date(),
    last_updated_on: new Date(),
    created_by: 'Backend Dev',
    last_updated_by: 'Backend Dev',
  },
];


export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSmartSuggestionsVisible, setIsSmartSuggestionsVisible] = useState(false);
  const [isSuggestingTasksLoading, setIsSuggestingTasksLoading] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const { toast } = useToast();

  // Effect to load tasks from localStorage or use initialTasks
  useEffect(() => {
    const storedTasks = localStorage.getItem('taskwise-tasks');
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks).map((task: any) => ({
          ...task,
          task_due_date: task.task_due_date ? new Date(task.task_due_date) : null,
          created_on: new Date(task.created_on),
          last_updated_on: new Date(task.last_updated_on),
        }));
        setTasks(parsedTasks);
      } catch (error) {
        console.error("Failed to parse tasks from localStorage", error);
        setTasks(initialTasks); // Fallback to initial if parsing fails
      }
    } else {
      setTasks(initialTasks);
    }
  }, []);

  // Effect to save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('taskwise-tasks', JSON.stringify(tasks));
  }, [tasks]);


  const handleOpenForm = (task?: Task) => {
    setEditingTask(task || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleFormSubmit = (data: TaskFormData) => {
    const currentUser = 'User'; // Mock user
    const now = new Date();

    if (editingTask) {
      setTasks(
        tasks.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                ...data,
                last_updated_on: now,
                last_updated_by: currentUser,
              }
            : task
        )
      );
      toast({ title: 'Task Updated', description: `"${data.task_title}" has been updated.` });
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        ...data,
        created_on: now,
        last_updated_on: now,
        created_by: currentUser,
        last_updated_by: currentUser,
      };
      setTasks([newTask, ...tasks]);
      toast({ title: 'Task Added', description: `"${data.task_title}" has been added to your list.` });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
  };

  const confirmDeleteTask = () => {
    if (taskToDelete) {
      const task = tasks.find(t => t.id === taskToDelete);
      setTasks(tasks.filter((task) => task.id !== taskToDelete));
      toast({ title: 'Task Deleted', description: `Task "${task?.task_title}" has been deleted.`, variant: 'destructive' });
      setTaskToDelete(null);
    }
  };


  const handleAddSuggestedTask = (taskData: { title: string; description: string }) => {
    const currentUser = 'AI Assistant';
    const now = new Date();
    const newTask: Task = {
      id: crypto.randomUUID(),
      task_title: taskData.title,
      task_description: taskData.description,
      task_due_date: null, // Suggested tasks might not have a due date
      task_status: TaskStatus.Pending,
      task_remarks: 'AI Suggested',
      created_on: now,
      last_updated_on: now,
      created_by: currentUser,
      last_updated_by: currentUser,
    };
    setTasks([newTask, ...tasks]);
    toast({ title: 'Suggested Task Added', description: `"${newTask.task_title}" has been added.` });
  };

  const toggleSmartSuggestions = async () => {
    setIsSmartSuggestionsVisible(prev => !prev);
    // If we are opening it and tasks exist, it will auto-fetch if designed that way,
    // or a button inside SmartSuggestionsSection will trigger it.
    // The AppHeader button primarily toggles visibility.
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.task_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.task_description.toLowerCase().includes(searchQuery.toLowerCase())
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

        <TaskList
          tasks={filteredTasks}
          onEditTask={handleOpenForm}
          onDeleteTask={handleDeleteTask}
        />
        
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
        <p>&copy; {new Date().getFullYear()} TaskWise. Built with Next.js and AI.</p>
      </footer>
    </div>
  );
}
