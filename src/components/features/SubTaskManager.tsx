import { useState } from 'react';
import { SubTask } from '../../types/todo';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import Checkbox from '../ui/checkbox';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SubTaskManagerProps {
  subTasks: SubTask[];
  onSubTasksChange: (subTasks: SubTask[]) => void;
  expanded?: boolean;
}

export function SubTaskManager({ subTasks, onSubTasksChange, expanded = false }: SubTaskManagerProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [newSubTask, setNewSubTask] = useState('');

  const progress = subTasks.length 
    ? Math.round((subTasks.filter(task => task.completed).length / subTasks.length) * 100)
    : 0;

  const handleAddSubTask = () => {
    if (!newSubTask.trim()) return;

    const newTask: SubTask = {
      id: crypto.randomUUID(),
      text: newSubTask.trim(),
      completed: false,
      createdAt: new Date(),
    };

    onSubTasksChange([...subTasks, newTask]);
    setNewSubTask('');
  };

  const handleToggleSubTask = (taskId: string, completed: boolean) => {
    onSubTasksChange(
      subTasks.map(task =>
        task.id === taskId ? { ...task, completed } : task
      )
    );
  };

  const handleRemoveSubTask = (taskId: string) => {
    onSubTasksChange(subTasks.filter(task => task.id !== taskId));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-accent rounded-sm"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        <div className="text-sm text-muted-foreground">
          Subtarefas ({subTasks.filter(t => t.completed).length}/{subTasks.length})
        </div>
        {subTasks.length > 0 && (
          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="pl-6 space-y-2">
          {subTasks.map(task => (
            <div key={task.id} className="flex items-center gap-2">
              <Checkbox
                checked={task.completed}
                onCheckedChange={(checked) => handleToggleSubTask(task.id, checked as boolean)}
              />
              <span className={cn(
                "flex-1 text-sm",
                task.completed && "line-through text-muted-foreground"
              )}>
                {task.text}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleRemoveSubTask(task.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <div className="flex items-center gap-2">
            <Input
              placeholder="Nova subtarefa..."
              value={newSubTask}
              onChange={(e) => setNewSubTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubTask()}
              className="h-8 text-sm"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleAddSubTask}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
