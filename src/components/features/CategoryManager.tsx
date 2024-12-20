import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Category } from '../../types/todo';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../config/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { X, Plus, Settings2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { ChromePicker } from 'react-color';

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#4CAF50');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCategories();
    }
  }, [user]);

  const loadCategories = async () => {
    if (!user) return;

    const q = query(
      collection(db, 'categories'),
      where('userId', '==', user.uid)
    );

    const querySnapshot = await getDocs(q);
    const loadedCategories: Category[] = [];
    querySnapshot.forEach((doc) => {
      loadedCategories.push({ id: doc.id, ...doc.data() } as Category);
    });

    setCategories(loadedCategories);
  };

  const handleAddCategory = async () => {
    if (!user || !newCategoryName.trim()) return;

    const newCategory = {
      name: newCategoryName.trim(),
      color: selectedColor,
      userId: user.uid,
    };

    try {
      await addDoc(collection(db, 'categories'), newCategory);
      setNewCategoryName('');
      setSelectedColor('#4CAF50');
      loadCategories();
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      await updateDoc(doc(db, 'categories', editingCategory.id), {
        name: editingCategory.name,
        color: editingCategory.color,
      });
      setEditingCategory(null);
      loadCategories();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          Gerenciar Categorias
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Add new category */}
          <div className="space-y-2">
            <Label>Nova Categoria</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Nome da categoria"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <div className="relative">
                <button
                  type="button"
                  className="w-10 h-10 rounded border"
                  style={{ backgroundColor: selectedColor }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                />
                {showColorPicker && (
                  <div className="absolute right-0 top-12 z-50">
                    <div
                      className="fixed inset-0"
                      onClick={() => setShowColorPicker(false)}
                    />
                    <ChromePicker
                      color={selectedColor}
                      onChange={(color) => setSelectedColor(color.hex)}
                    />
                  </div>
                )}
              </div>
              <Button onClick={handleAddCategory}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* List categories */}
          <div className="space-y-2">
            <Label>Categorias Existentes</Label>
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-2 rounded border"
                >
                  {editingCategory?.id === category.id ? (
                    <div className="flex gap-2 flex-1">
                      <Input
                        value={editingCategory.name}
                        onChange={(e) =>
                          setEditingCategory({
                            ...editingCategory,
                            name: e.target.value,
                          })
                        }
                      />
                      <div className="relative">
                        <button
                          type="button"
                          className="w-8 h-8 rounded border"
                          style={{ backgroundColor: editingCategory.color }}
                          onClick={() => setShowColorPicker(!showColorPicker)}
                        />
                        {showColorPicker && (
                          <div className="absolute right-0 top-10 z-50">
                            <div
                              className="fixed inset-0"
                              onClick={() => setShowColorPicker(false)}
                            />
                            <ChromePicker
                              color={editingCategory.color}
                              onChange={(color) =>
                                setEditingCategory({
                                  ...editingCategory,
                                  color: color.hex,
                                })
                              }
                            />
                          </div>
                        )}
                      </div>
                      <Button onClick={handleUpdateCategory}>Salvar</Button>
                      <Button
                        variant="ghost"
                        onClick={() => setEditingCategory(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCategory(category)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
