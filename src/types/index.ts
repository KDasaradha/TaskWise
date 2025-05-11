export enum TaskStatus {
  Pending = 'pending',
  InProgress = 'in_progress',
  Completed = 'completed',
}

export interface Task {
  id: string;
  task_title: string;
  task_description: string;
  task_due_date: Date | null;
  task_status: TaskStatus;
  task_remarks: string;
  created_on: Date;
  last_updated_on: Date;
  created_by: string;
  last_updated_by: string;
}
