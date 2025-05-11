"use client";

import type { FC } from 'react';
import { Task } from '@/types';
import TaskItem from './TaskItem';
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const TaskList: FC<TaskListProps> = ({ tasks, onEditTask, onDeleteTask }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-10">
        <Image 
          src="https://picsum.photos/seed/taskwise_empty/300/200" 
          alt="Empty task list" 
          width={300} 
          height={200} 
          className="mx-auto mb-4 rounded-lg shadow-md"
          data-ai-hint="empty tasks" 
        />
        <p className="text-xl text-muted-foreground">No tasks yet. Add a new task to get started!</p>
      </div>
    );
  }

  return (
    <Card className="shadow-lg rounded-xl overflow-hidden border-none bg-card">
      <CardHeader className="p-0">
        {/* CardHeader can be empty or contain a title if needed, but we'll use the main table header */}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[40%] px-3 py-3 text-sm font-semibold text-foreground">Title</TableHead>
                <TableHead className="w-[15%] px-3 py-3 text-sm font-semibold text-foreground">Status</TableHead>
                <TableHead className="w-[15%] px-3 py-3 text-sm font-semibold text-foreground">Due Date</TableHead>
                <TableHead className="w-[15%] px-3 py-3 text-sm font-semibold text-foreground">Last Updated</TableHead>
                <TableHead className="text-right w-[15%] px-3 py-3 text-sm font-semibold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskList;
