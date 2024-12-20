'use client'

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useTodos } from '../hooks/useTodos';
import { AuthButton } from '../components/features/AuthButton';
import { UserAvatar } from '../components/features/UserAvatar';
import { NotificationBell } from '../components/features/NotificationBell';
import { ListManager } from '../components/features/ListManager';
import { FilterMenu } from '../components/features/FilterMenu';
import { BarChart2, Clock, FileText, Plus, Search, Sun, Moon, LogOut } from 'lucide-react'
import { db } from '../config/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Todo, Priority } from '../types/todo';
import { cn } from '../lib/utils'
import { CategoryManager } from '../components/features/CategoryManager';
import { AddTodo } from '../components/features/AddTodo';
import { TodoCard } from '../components/features/TodoCard';
import { PomodoroDialog } from '../components/features/PomodoroDialog';
import { TemplatesDialog } from '../components/features/TemplatesDialog';

export default function TodoList() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isDark, setTheme } = useTheme();
  const { todos, loading: todosLoading, error, addTodo, toggleTodo, deleteTodo, updateTodo } = useTodos();
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL')
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'createdAt'>('createdAt')
  const [isAddTodoOpen, setIsAddTodoOpen] = useState(false);
  const [isListManagerOpen, setIsListManagerOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  const toggleDarkMode = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  // Ordenar tarefas
  const sortTodos = (todos: Todo[]) => {
    return [...todos].sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate - b.dueDate;
      }
      // default: createdAt
      return b.createdAt - a.createdAt;
    });
  };

  // Filtrar e ordenar tarefas
  const filteredTodos = sortTodos(todos).filter(todo => {
    const matchesFilter = 
      filter === 'ALL' ||
      (filter === 'ACTIVE' && !todo.completed) ||
      (filter === 'COMPLETED' && todo.completed);

    const matchesSearch = 
      todo.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      todo.tags?.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  // Mostra loading enquanto carrega autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Se não estiver logado, mostra tela de login
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Welcome to Todo App</h1>
        <p className="text-muted-foreground">Please sign in to continue</p>
        <AuthButton />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Todo App</h1>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
                  <UserAvatar />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user?.displayName && (
                      <p className="font-medium">{user.displayName}</p>
                    )}
                    {user?.email && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuItem onClick={toggleDarkMode} className="cursor-pointer">
                  {isDark ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" />
                  )}
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-[300px]"
              />
            </div>
            {/* Filters */}
            <FilterMenu
              filter={filter}
              setFilter={setFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => setShowButtons(prev => !prev)}>
              {showButtons ? 'Esconder Botões' : 'Mostrar Botões'}
            </Button>
            {showButtons && (
              <div className="flex items-center gap-4">
                {/* Dashboard */}
                <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>

                {/* Templates */}
                <Button variant="outline" onClick={() => setIsTemplatesOpen(true)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Templates
                </Button>

                {/* Pomodoro */}
                <Button variant="outline" onClick={() => setIsPomodoroOpen(true)}>
                  <Clock className="h-4 w-4 mr-2" />
                  Pomodoro
                </Button>

                {/* List Manager */}
                <Dialog open={isListManagerOpen} onOpenChange={setIsListManagerOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Manage Lists</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Manage Lists</DialogTitle>
                    </DialogHeader>
                    <ListManager />
                  </DialogContent>
                </Dialog>

                {/* Category Manager */}
                <Dialog open={isCategoryManagerOpen} onOpenChange={setIsCategoryManagerOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Manage Categories</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Manage Categories</DialogTitle>
                    </DialogHeader>
                    <CategoryManager />
                  </DialogContent>
                </Dialog>
              </div>
            )}
            {/* Add Todo */}
            <Dialog open={isAddTodoOpen} onOpenChange={setIsAddTodoOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <AddTodo onAdd={addTodo} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Todo List */}
        <div className="space-y-4">
          {filteredTodos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onToggleComplete={() => toggleTodo(todo.id, !todo.completed)}
              onDelete={() => deleteTodo(todo.id)}
              onUpdate={(data) => updateTodo(todo.id, data)}
            />
          ))}
        </div>
      </main>

      {/* Modais */}
      <PomodoroDialog
        open={isPomodoroOpen}
        onOpenChange={setIsPomodoroOpen}
      />

      <TemplatesDialog
        open={isTemplatesOpen}
        onOpenChange={setIsTemplatesOpen}
        onAddTodo={addTodo}
      />
    </div>
  );
}
