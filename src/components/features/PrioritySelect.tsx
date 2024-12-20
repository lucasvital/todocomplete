import { AlertCircle, ArrowDown, ArrowUp, Circle } from 'lucide-react';
import { Priority } from '../../types/todo';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { cn } from '../../lib/utils';

interface PrioritySelectProps {
  value: Priority;
  onChange: (value: Priority) => void;
}

const priorityConfig = {
  high: {
    label: 'Alta',
    icon: ArrowUp,
    color: 'text-red-500',
  },
  medium: {
    label: 'Média',
    icon: Circle,
    color: 'text-yellow-500',
  },
  low: {
    label: 'Baixa',
    icon: ArrowDown,
    color: 'text-blue-500',
  },
};

export function PrioritySelect({ value = 'medium', onChange }: PrioritySelectProps) {
  const config = priorityConfig[value];
  const Icon = config?.icon || Circle;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue>
          <div className="flex items-center gap-2">
            <Icon className={cn("h-4 w-4", config?.color)} />
            <span>{config?.label || 'Média'}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(priorityConfig).map(([key, config]) => (
          <SelectItem key={key} value={key}>
            <div className="flex items-center gap-2">
              <config.icon className={cn("h-4 w-4", config.color)} />
              <span>{config.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
