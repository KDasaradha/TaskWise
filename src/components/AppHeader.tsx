import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Lightbulb } from 'lucide-react';

interface AppHeaderProps {
  onAddTask: () => void;
  onSuggestTasks: () => void;
  isSuggestingTasks: boolean;
}

const AppHeader: FC<AppHeaderProps> = ({ onAddTask, onSuggestTasks, isSuggestingTasks }) => {
  return (
    <header className="py-6 px-4 md:px-8 border-b border-border shadow-sm sticky top-0 bg-background/80 backdrop-blur-md z-50">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">TaskWise</h1>
        <div className="flex items-center space-x-3">
          <Button onClick={onSuggestTasks} variant="outline" disabled={isSuggestingTasks}>
            <Lightbulb className="mr-2 h-5 w-5" />
            {isSuggestingTasks ? 'Suggesting...' : 'Smart Suggestions'}
          </Button>
          <Button onClick={onAddTask}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Task
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
