import { useState } from 'react';
import { Button } from '../ui/button';
import { BookTemplate, Plus, Save, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { db } from '../../config/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { Priority, Tag } from '../../types/todo';
import { PrioritySelect } from './PrioritySelect';

interface TaskTemplate {
  id: string;
  name: string;
  text: string;
  priority: Priority;
  tags: Tag[];
  estimatedTime?: number;
}

interface TaskTemplateButtonProps {
  onUseTemplate: (template: TaskTemplate) => void;
}

export function TaskTemplateButton({ onUseTemplate }: TaskTemplateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    text: '',
    priority: 'MEDIUM' as Priority,
    tags: [] as Tag[],
    estimatedTime: 0,
  });
  const { user } = useAuth();

  const loadTemplates = async () => {
    if (!user?.email) return;

    const q = query(
      collection(db, 'taskTemplates'),
      where('owner', '==', user.email)
    );

    const snapshot = await getDocs(q);
    const templatesData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TaskTemplate[];

    setTemplates(templatesData);
  };

  const handleSaveTemplate = async () => {
    if (!user?.email || !newTemplate.name || !newTemplate.text) return;

    try {
      await addDoc(collection(db, 'taskTemplates'), {
        ...newTemplate,
        owner: user.email,
        createdAt: new Date(),
      });

      setNewTemplate({
        name: '',
        text: '',
        priority: 'MEDIUM',
        tags: [],
        estimatedTime: 0,
      });

      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteDoc(doc(db, 'taskTemplates', templateId));
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4"
          onClick={() => {
            setIsOpen(true);
            loadTemplates();
          }}
        >
          <BookTemplate className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Templates de Tarefas</DialogTitle>
        </DialogHeader>
        
        {/* Novo Template */}
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Input
              placeholder="Nome do template"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
            />
            <Input
              placeholder="Descrição da tarefa"
              value={newTemplate.text}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, text: e.target.value }))}
            />
            <div className="flex items-center gap-2">
              <PrioritySelect
                priority={newTemplate.priority}
                onPriorityChange={(priority) => setNewTemplate(prev => ({ ...prev, priority }))}
              />
              <Input
                type="number"
                placeholder="Tempo estimado (min)"
                value={newTemplate.estimatedTime || ''}
                onChange={(e) => setNewTemplate(prev => ({ 
                  ...prev, 
                  estimatedTime: parseInt(e.target.value) || 0 
                }))}
                className="w-40"
              />
              <Button onClick={handleSaveTemplate}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>

          {/* Lista de Templates */}
          <div className="grid gap-4">
            {templates.map(template => (
              <Card key={template.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{template.name}</h4>
                    <p className="text-sm text-muted-foreground">{template.text}</p>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Prioridade:</span>
                      <span>{template.priority}</span>
                      {template.estimatedTime && (
                        <>
                          <span className="text-muted-foreground ml-2">Tempo:</span>
                          <span>{template.estimatedTime}min</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        onUseTemplate(template);
                        setIsOpen(false);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
