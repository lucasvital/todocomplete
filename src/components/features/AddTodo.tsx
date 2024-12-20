import { useState } from 'react';
import { Priority, Todo } from '../../types/todo';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DatePicker } from '../ui/date-picker';
import { PrioritySelect } from './PrioritySelect';
import { ListSelect } from './ListSelect';
import { CategorySelect } from './CategorySelect';
import { TagManager } from './TagManager';
import { SubTaskManager } from './SubTaskManager';
import { Bell } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface AddTodoProps {
  onAdd: (todo: Partial<Todo>) => void;
}

export function AddTodo({ onAdd }: AddTodoProps) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [reminder, setReminder] = useState<string>('none');
  const [list, setList] = useState<string>('none');
  const [category, setCategory] = useState<string>('none');
  const [tags, setTags] = useState([]);
  const [subTasks, setSubTasks] = useState([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    onAdd({
      text: text.trim(),
      priority,
      dueDate: dueDate?.getTime(),
      reminder: reminder === 'none' ? null : getReminder(dueDate, reminder),
      list: list === 'none' ? undefined : list,
      category: category === 'none' ? undefined : category,
      tags,
      subTasks,
      completed: false,
      createdAt: Date.now(),
    });

    // Reset form
    setText('');
    setPriority('medium');
    setDueDate(null);
    setReminder('none');
    setList('none');
    setCategory('none');
    setTags([]);
    setSubTasks([]);
  };

  const getReminder = (date: Date | null, type: string): number | null => {
    if (!date) return null;
    const dueTime = date.getTime();
    switch (type) {
      case '5min':
        return dueTime - 5 * 60 * 1000;
      case '15min':
        return dueTime - 15 * 60 * 1000;
      case '30min':
        return dueTime - 30 * 60 * 1000;
      case '1hour':
        return dueTime - 60 * 60 * 1000;
      case '1day':
        return dueTime - 24 * 60 * 60 * 1000;
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Input
          placeholder="What needs to be done?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="text-lg"
          autoFocus
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <PrioritySelect 
              value={priority} 
              onChange={(value) => setPriority(value as Priority)} 
              priorities={['low', 'medium', 'high']}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date</label>
            <div className="flex gap-2">
              <DatePicker 
                value={dueDate || undefined} 
                onChange={(date) => setDueDate(date || null)} 
              />
              {dueDate && (
                <Select value={reminder} onValueChange={setReminder}>
                  <SelectTrigger className="w-[140px]">
                    <Bell className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Reminder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No reminder</SelectItem>
                    <SelectItem value="5min">5 minutes before</SelectItem>
                    <SelectItem value="15min">15 minutes before</SelectItem>
                    <SelectItem value="30min">30 minutes before</SelectItem>
                    <SelectItem value="1hour">1 hour before</SelectItem>
                    <SelectItem value="1day">1 day before</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">List</label>
            <ListSelect value={list} onChange={setList} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <CategorySelect value={category} onChange={setCategory} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tags</label>
          <TagManager selectedTags={tags} onTagsChange={setTags} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Sub Tasks</label>
          <SubTaskManager subTasks={subTasks} onSubTasksChange={setSubTasks} />
        </div>
      </div>

      <Button type="submit" className="w-full">
        Add Task
      </Button>
    </form>
  );
}
