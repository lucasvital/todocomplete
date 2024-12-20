import { useState } from 'react';
import { Tag } from '../../types/todo';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { cn } from '../../lib/utils';

interface TagManagerProps {
  selectedTags?: Tag[];
  onTagsChange?: (tags: Tag[]) => void;
  availableTags?: Tag[];
  standalone?: boolean;
}

const DEFAULT_COLORS = [
  'bg-red-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
];

export function TagManager({ 
  selectedTags = [], 
  onTagsChange = () => {}, 
  availableTags = [],
  standalone = false 
}: TagManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);
  const [localTags, setLocalTags] = useState<Tag[]>([]);

  const handleAddTag = (tag: Tag) => {
    if (!selectedTags.find(t => t.id === tag.id)) {
      const updatedTags = [...selectedTags, tag];
      onTagsChange(updatedTags);
      if (standalone) {
        setLocalTags(updatedTags);
      }
    }
  };

  const handleRemoveTag = (tagId: string) => {
    const updatedTags = selectedTags.filter(tag => tag.id !== tagId);
    onTagsChange(updatedTags);
    if (standalone) {
      setLocalTags(updatedTags);
    }
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;

    const newTag: Tag = {
      id: crypto.randomUUID(),
      name: newTagName.trim(),
      color: selectedColor,
    };

    handleAddTag(newTag);
    setNewTagName('');
    setSelectedColor(DEFAULT_COLORS[0]);
    setIsOpen(false);
  };

  const displayTags = standalone ? localTags : selectedTags;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {displayTags.map(tag => (
          <div
            key={tag.id}
            className={cn(
              'px-2 py-1 rounded-full text-white text-sm flex items-center gap-1',
              tag.color
            )}
          >
            {tag.name}
            <button
              onClick={() => handleRemoveTag(tag.id)}
              className="hover:bg-white/20 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-7">
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar nova tag</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Input
                  placeholder="Nome da tag"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cor</label>
                <div className="flex gap-2">
                  {DEFAULT_COLORS.map(color => (
                    <button
                      key={color}
                      className={cn(
                        'w-6 h-6 rounded-full',
                        color,
                        selectedColor === color && 'ring-2 ring-offset-2 ring-primary'
                      )}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleCreateTag} className="w-full">
                Criar Tag
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
