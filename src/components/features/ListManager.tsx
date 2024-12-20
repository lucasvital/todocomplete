import { Plus } from 'lucide-react';
import { useState } from 'react';
import { List } from '../../types/list';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { ListCard } from './ListCard';
import { useLists } from '../../hooks/useLists';
import { Todo } from '../../types/todo';
import { EmojiPicker } from './EmojiPicker';

interface ListManagerProps {
  todos?: Todo[];
  onCreateList?: (name: string, color: string, icon: string) => void;
}

export function ListManager({ 
  todos = [], 
  onCreateList = () => {} 
}: ListManagerProps) {
  const { lists = [], loading, error, updateList, deleteList, shareList } = useLists();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingList, setEditingList] = useState<List | null>(null);
  const [newListName, setNewListName] = useState('');
  const [newListColor, setNewListColor] = useState('#2563eb'); // Azul por padrão
  const [newListIcon, setNewListIcon] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newListName.trim()) return;

    if (editingList) {
      await updateList(editingList.id, {
        name: newListName,
        color: newListColor,
        icon: newListIcon,
      });
    } else {
      onCreateList(newListName.trim(), newListColor, newListIcon);
    }

    setNewListName('');
    setNewListColor('#2563eb');
    setNewListIcon('');
    setEditingList(null);
    setIsDialogOpen(false);
  };

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    onCreateList(newListName.trim(), newListColor, newListIcon);
    setNewListName('');
    setIsDialogOpen(false);
  };

  const handleEdit = (list: List) => {
    setEditingList(list);
    setNewListName(list.name);
    setNewListColor(list.color);
    setNewListIcon(list.icon || '');
    setIsDialogOpen(true);
  };

  const handleDelete = async (listId: string) => {
    // Adicionar confirmação aqui
    if (window.confirm('Tem certeza que deseja excluir esta lista?')) {
      await deleteList(listId);
    }
  };

  const handleShare = async (listId: string) => {
    const email = window.prompt('Digite o email do usuário para compartilhar:');
    if (email) {
      await shareList(listId, email);
    }
  };

  if (loading) {
    return <div>Carregando listas...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Suas Listas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Lista
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingList ? 'Editar Lista' : 'Criar Nova Lista'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={editingList ? handleSubmit : handleCreateList} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Nome da lista"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Cor</label>
                <div className="flex gap-2">
                  {['#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#9333ea'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="w-8 h-8 rounded-full border-2 transition-all"
                      style={{
                        backgroundColor: color,
                        borderColor: newListColor === color ? 'white' : color,
                      }}
                      onClick={() => setNewListColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ícone</label>
                <EmojiPicker
                  value={newListIcon}
                  onChange={setNewListIcon}
                />
              </div>

              <Button type="submit" className="w-full">
                {editingList ? 'Salvar' : 'Criar'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(lists || []).map((list) => (
          <ListCard
            key={list.id}
            list={list}
            todos={todos.filter((todo) => todo.list === list.id)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onShare={handleShare}
          />
        ))}
      </div>
    </div>
  );
}
