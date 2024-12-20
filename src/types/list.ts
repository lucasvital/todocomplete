export interface List {
  id: string;
  name: string;
  color: string;
  icon?: string;
  ownerId: string;
  sharedWith?: string[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface ListStats {
  totalTasks: number;
  completedTasks: number;
  highPriorityTasks: number;
  dueSoonTasks: number; // Tarefas que vencem em 3 dias
  overdueTasks: number;
}
