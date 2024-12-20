export type Priority = 'low' | 'medium' | 'high';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  userId: string;
}

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  list?: string;
  category?: string;
  tags?: string[];
  subTasks: SubTask[];
  createdAt: Date | null;
  updatedAt: Date | null;
  completedAt: Date | null;
  dueDate: Date | null;
  reminder: Date | null;
  userId: string;
}

export interface TodoList {
  id: string;
  title: string;
  todos: Todo[];
  userId: string;
  sharedWith?: string[];
  createdAt: number;
}
