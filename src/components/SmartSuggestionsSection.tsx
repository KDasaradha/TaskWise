"use client";

import type { FC } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Task, TaskStatus } from '@/types';
import { suggestTasks, SuggestTasksOutput } from '@/ai/flows/smart-task-suggestion';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, PlusSquare, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface SmartSuggestionsSectionProps {
  existingTasks: Task[];
  onAddSuggestedTask: (taskData: { title: string; description: string }) => void;
  isVisible: boolean;
}

const SmartSuggestionsSection: FC<SmartSuggestionsSectionProps> = ({
  existingTasks,
  onAddSuggestedTask,
  isVisible,
}) => {
  const [suggestions, setSuggestions] = useState<SuggestTasksOutput['suggestedTasks']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetSuggestions = async () => {
    if (existingTasks.length === 0) {
      toast({
        title: 'No existing tasks',
        description: 'Add some tasks first to get smart suggestions.',
        variant: 'default',
      });
      return;
    }

    setIsLoading(true);
    setSuggestions([]);
    try {
      const aiInput = {
        existingTasks: existingTasks.map(task => ({
          task_title: task.task_title,
          task_description: task.task_description,
        })),
      };
      const result = await suggestTasks(aiInput);
      if (result.suggestedTasks && result.suggestedTasks.length > 0) {
        setSuggestions(result.suggestedTasks);
        toast({
          title: 'Suggestions Ready!',
          description: `${result.suggestedTasks.length} new task ideas for you.`,
        });
      } else {
        setSuggestions([]);
        toast({
          title: 'No new suggestions',
          description: "Couldn't find any new task suggestions based on your current list.",
        });
      }
    } catch (error) {
      console.error('Error fetching smart suggestions:', error);
      toast({
        title: 'Error',
        description: 'Failed to get smart suggestions. Please try again.',
        variant: 'destructive',
      });
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <Card className="mt-8 shadow-lg rounded-xl border-none bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center">
          <Lightbulb className="h-8 w-8 text-accent mr-3" />
          <div>
            <CardTitle className="text-2xl font-semibold text-foreground">Smart Task Suggestions</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Let AI help you discover your next tasks based on your current list.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-10 w-10 text-primary animate-spin mr-3" />
            <p className="text-lg text-muted-foreground">Generating suggestions...</p>
          </div>
        )}

        {!isLoading && suggestions.length === 0 && (
          <div className="text-center py-8">
            <Image 
              src="https://picsum.photos/seed/taskwise_ai/300/180" 
              alt="AI waiting for prompt" 
              width={300} 
              height={180} 
              className="mx-auto mb-4 rounded-lg shadow-md" 
              data-ai-hint="artificial intelligence"
            />
            <p className="text-md text-muted-foreground mb-4">
              {existingTasks.length > 0 ? "Click 'Get Suggestions' to see what AI thinks you should do next!" : "Add some tasks first to unlock AI suggestions."}
            </p>
             <Button onClick={handleGetSuggestions} disabled={existingTasks.length === 0 || isLoading} className="bg-accent hover:bg-accent/90">
                <Lightbulb className="mr-2 h-5 w-5" /> Get Suggestions
            </Button>
          </div>
        )}

        {!isLoading && suggestions.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-3">Here are some tasks you might want to consider:</p>
            <ul className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="p-4 bg-background/50 rounded-lg shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <h4 className="font-semibold text-md text-foreground">{suggestion.task_title}</h4>
                    {suggestion.task_description && (
                      <p className="text-xs text-muted-foreground mt-1">{suggestion.task_description}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddSuggestedTask({ title: suggestion.task_title, description: suggestion.task_description })}
                    className="ml-4"
                  >
                    <PlusSquare className="mr-2 h-4 w-4" /> Add Task
                  </Button>
                </li>
              ))}
            </ul>
             <div className="pt-4 text-center">
                <Button onClick={handleGetSuggestions} variant="ghost" className="text-accent hover:text-accent/90">
                    <Lightbulb className="mr-2 h-5 w-5" /> Get More Suggestions
                </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartSuggestionsSection;
