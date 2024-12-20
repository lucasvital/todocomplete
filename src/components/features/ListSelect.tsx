import { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface List {
  id: string;
  name: string;
  color: string;
  icon: string;
  owner: string;
}

interface ListSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function ListSelect({ value, onChange }: ListSelectProps) {
  const [lists, setLists] = useState<List[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadLists();
    }
  }, [user]);

  const loadLists = async () => {
    if (!user) return;

    const q = query(
      collection(db, 'lists'),
      where('owner', '==', user.email)
    );

    const querySnapshot = await getDocs(q);
    const loadedLists: List[] = [];
    querySnapshot.forEach((doc) => {
      loadedLists.push({ id: doc.id, ...doc.data() } as List);
    });

    setLists(loadedLists);
  };

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select list" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No list</SelectItem>
        {lists.map((list) => (
          <SelectItem key={list.id} value={list.id}>
            <div className="flex items-center gap-2">
              {list.icon && (
                <span className="text-lg">{list.icon}</span>
              )}
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: list.color }}
              />
              {list.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
