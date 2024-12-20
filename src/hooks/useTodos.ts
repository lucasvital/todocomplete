import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, getDoc, or } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';
import { Todo, Priority } from '../types/todo';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.email) {
      setTodos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Buscar todas as tarefas do usuário
      const todosQuery = query(
        collection(db, 'todos'),
        where('userId', '==', user.uid)
      );

      // Escutar mudanças nas tarefas
      const unsubscribeTodos = onSnapshot(
        todosQuery,
        (snapshot) => {
          const todosData = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              text: data.text || '',
              completed: data.completed || false,
              priority: data.priority || 'medium',
              list: data.list || null,
              category: data.category || null,
              tags: data.tags || [],
              subTasks: data.subTasks || [],
              createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
              updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null,
              completedAt: data.completedAt instanceof Timestamp ? data.completedAt.toDate() : null,
              dueDate: data.dueDate instanceof Timestamp ? data.dueDate.toDate() : null,
              reminder: data.reminder instanceof Timestamp ? data.reminder.toDate() : null,
              userId: data.userId,
            } as Todo;
          });

          setTodos(todosData);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Error fetching todos:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => {
        unsubscribeTodos();
      };
    } catch (error) {
      console.error('Error setting up todos listener:', error);
      setError(error.message);
      setLoading(false);
    }
  }, [user?.email, user?.uid]);

  const addTodo = async (data: Partial<Todo>) => {
    if (!user) {
      setError('Você precisa estar logado para criar uma tarefa');
      return;
    }

    try {
      // Prepare todo data
      const todoData = {
        text: data.text || '',
        completed: false,
        priority: data.priority || 'medium',
        list: data.list || null,
        category: data.category || null,
        tags: data.tags || [],
        subTasks: data.subTasks || [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        userId: user.uid,
      };

      // Convert dates to Timestamps if they exist
      if (data.dueDate instanceof Date) {
        todoData.dueDate = Timestamp.fromDate(data.dueDate);
      }
      if (data.reminder instanceof Date) {
        todoData.reminder = Timestamp.fromDate(data.reminder);
      }

      await addDoc(collection(db, 'todos'), todoData);
    } catch (error) {
      console.error('Error adding todo:', error);
      setError(error.message);
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    if (!user) return;

    try {
      const todoRef = doc(db, 'todos', id);
      await updateDoc(todoRef, {
        completed,
        completedAt: completed ? Timestamp.now() : null,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error toggling todo:', error);
      setError(error.message);
    }
  };

  const updateTodo = async (id: string, data: Partial<Todo>) => {
    if (!user) return;

    try {
      const todoRef = doc(db, 'todos', id);
      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };

      // Convert dates to Timestamps if they exist
      if (data.dueDate instanceof Date) {
        updateData.dueDate = Timestamp.fromDate(data.dueDate);
      }
      if (data.reminder instanceof Date) {
        updateData.reminder = Timestamp.fromDate(data.reminder);
      }

      await updateDoc(todoRef, updateData);
    } catch (error) {
      console.error('Error updating todo:', error);
      setError(error.message);
    }
  };

  const deleteTodo = async (id: string) => {
    if (!user) return;

    try {
      const todoRef = doc(db, 'todos', id);
      await deleteDoc(todoRef);
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError(error.message);
    }
  };

  return {
    todos,
    loading,
    error,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
  };
}
