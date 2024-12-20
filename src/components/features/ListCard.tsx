import { MoreHorizontal, Pencil, Share2, Trash2 } from 'lucide-react';
import { List, ListStats } from '../../types/list';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';
import { Todo } from '../../types/todo';

interface ListCardProps {
  list: List;
  todos: Todo[];
  onEdit: (list: List) => void;
  onDelete: (listId: string) => void;
  onShare: (listId: string) => void;
}

export function ListCard({ list, todos, onEdit, onDelete, onShare }: ListCardProps) {
  // Calcular estatísticas
  const stats: ListStats = {
    totalTasks: todos.length,
    completedTasks: todos.filter(todo => todo.completed).length,
    highPriorityTasks: todos.filter(todo => todo.priority === 'HIGH').length,
    dueSoonTasks: todos.filter(todo => {
      if (!todo.dueDate) return false;
      const daysUntilDue = Math.ceil((todo.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 3 && daysUntilDue >= 0;
    }).length,
    overdueTasks: todos.filter(todo => {
      if (!todo.dueDate) return false;
      return todo.dueDate < new Date();
    }).length,
  };

  return (
    <div
      className={cn(
        "p-4 rounded-lg border bg-card text-card-foreground shadow-sm",
        "hover:shadow-md transition-shadow"
      )}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: list.color,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {list.icon && <span className="text-xl">{list.icon}</span>}
          <h3 className="font-semibold">{list.name}</h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(list)}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShare(list.id)}>
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(list.id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex justify-between">
          <span>Total de tarefas:</span>
          <span>{stats.totalTasks}</span>
        </div>
        <div className="flex justify-between">
          <span>Concluídas:</span>
          <span>{stats.completedTasks}</span>
        </div>
        {stats.highPriorityTasks > 0 && (
          <div className="flex justify-between text-red-500">
            <span>Alta prioridade:</span>
            <span>{stats.highPriorityTasks}</span>
          </div>
        )}
        {stats.dueSoonTasks > 0 && (
          <div className="flex justify-between text-yellow-500">
            <span>Vencem em breve:</span>
            <span>{stats.dueSoonTasks}</span>
          </div>
        )}
        {stats.overdueTasks > 0 && (
          <div className="flex justify-between text-red-500">
            <span>Atrasadas:</span>
            <span>{stats.overdueTasks}</span>
          </div>
        )}
      </div>

      {/* Barra de progresso */}
      <div className="mt-4">
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{
              width: `${stats.totalTasks ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
