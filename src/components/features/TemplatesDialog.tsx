import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { FileText, Plus, Star, X } from 'lucide-react';
import { PrioritySelect } from './PrioritySelect';
import { Priority, Todo } from '../../types/todo';
import { cn } from '../../lib/utils';

interface TemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTodo: (todo: Partial<Todo>) => void;
}

interface Template {
  id: string;
  name: string;
  todo: Partial<Todo>;
}

export function TemplatesDialog({ open, onOpenChange, onAddTodo }: TemplatesDialogProps) {
  const [activeTab, setActiveTab] = useState('templates');
  const [templates] = useState<Template[]>([
    {
      id: '1',
      name: 'Daily Standup',
      todo: {
        text: 'Daily Standup',
        priority: 'medium' as Priority,
        subTasks: [
          { id: '1', text: 'O que fiz ontem', completed: false },
          { id: '2', text: 'O que farei hoje', completed: false },
          { id: '3', text: 'Há algum impedimento?', completed: false },
        ]
      }
    },
    {
      id: '2',
      name: 'Planejamento Semanal',
      todo: {
        text: 'Planejamento Semanal',
        priority: 'high' as Priority,
        subTasks: [
          { id: '1', text: 'Definir objetivos da semana', completed: false },
          { id: '2', text: 'Agendar reuniões importantes', completed: false },
          { id: '3', text: 'Revisar tarefas pendentes', completed: false },
        ]
      }
    }
  ]);

  // Estado para novo template
  const [newTemplate, setNewTemplate] = useState<Partial<Todo>>({
    text: '',
    priority: 'medium',
    subTasks: []
  });
  const [newSubTask, setNewSubTask] = useState('');

  const handleAddSubTask = () => {
    if (!newSubTask.trim()) return;
    
    setNewTemplate(prev => ({
      ...prev,
      subTasks: [
        ...(prev.subTasks || []),
        { id: Date.now().toString(), text: newSubTask, completed: false }
      ]
    }));
    setNewSubTask('');
  };

  const handleRemoveSubTask = (id: string) => {
    setNewTemplate(prev => ({
      ...prev,
      subTasks: prev.subTasks?.filter(task => task.id !== id)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Templates de Tarefas
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="create">Criar Template</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="group relative rounded-lg border p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {template.todo.subTasks?.length} subtarefas
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        onAddTodo(template.todo);
                        onOpenChange(false);
                      }}
                    >
                      Usar Template
                    </Button>
                  </div>

                  {/* Subtarefas Preview */}
                  <div className="mt-4 space-y-2">
                    {template.todo.subTasks?.map((task) => (
                      <div key={task.id} className="text-sm text-muted-foreground">
                        • {task.text}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da Tarefa</Label>
                <Input
                  value={newTemplate.text}
                  onChange={(e) => setNewTemplate({ ...newTemplate, text: e.target.value })}
                  placeholder="Digite o nome da tarefa..."
                />
              </div>

              <div className="space-y-2">
                <Label>Prioridade</Label>
                <PrioritySelect
                  value={newTemplate.priority}
                  onChange={(value) => setNewTemplate({ ...newTemplate, priority: value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Subtarefas</Label>
                <div className="flex gap-2">
                  <Input
                    value={newSubTask}
                    onChange={(e) => setNewSubTask(e.target.value)}
                    placeholder="Nova subtarefa..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddSubTask();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddSubTask}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {newTemplate.subTasks?.map((task) => (
                    <div key={task.id} className="flex items-center gap-2">
                      <div className="flex-1">{task.text}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSubTask(task.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  onAddTodo(newTemplate);
                  setNewTemplate({
                    text: '',
                    priority: 'medium',
                    subTasks: []
                  });
                  onOpenChange(false);
                }}
                disabled={!newTemplate.text}
              >
                Salvar Template
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
