import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Todo } from '../../types/todo';
import { Checkbox } from '../ui/checkbox';
import { useCategories } from '../../hooks/useCategories';
import { useLists } from '../../hooks/useLists';
import { cn } from '../../lib/utils';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
}

export function TodoItem({ todo, onToggle }: TodoItemProps) {
  const { categories } = useCategories();
  const { lists } = useLists();

  const category = categories.find(c => c.id === todo.category);
  const list = lists.find(l => l.id === todo.list);

  const priorityColor = {
    high: 'text-red-500',
    medium: 'text-yellow-500',
    low: 'text-blue-500',
  }[todo.priority];

  return (
    <div className={cn(
      'flex items-center gap-4 p-4 rounded-lg border',
      todo.completed && 'opacity-50'
    )}>
      <Checkbox
        checked={todo.completed}
        onCheckedChange={(checked) => onToggle(todo.id, checked as boolean)}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('font-medium', todo.completed && 'line-through')}>
            {todo.text}
          </span>
          <span className={cn('text-sm font-medium', priorityColor)}>
            {todo.priority.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
          {list && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: list.color }} />
              <span>{list.name}</span>
            </div>
          )}
          
          {category && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
              <span>{category.name}</span>
            </div>
          )}

          {todo.dueDate && (
            <span>
              Vence em {format(todo.dueDate, "PPP", { locale: ptBR })}
            </span>
          )}
        </div>

        {todo.subTasks.length > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            {todo.subTasks.filter(st => st.completed).length} de {todo.subTasks.length} subtarefas completas
          </div>
        )}
      </div>
    </div>
  );
}
