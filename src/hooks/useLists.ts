import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, deleteDoc, doc, or, addDoc, Timestamp, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';

export interface List {
  id: string;
  name: string;
  owner: string;
  sharedWith: string[];
  createdAt: Date;
  updatedAt: Date;
}

export function useLists() {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (!user?.email) {
      setLists([]);
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'lists'),
        or(
          where('owner', '==', user.email),
          where('sharedWith', 'array-contains-any', [user.email])
        )
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const listsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
          })) as List[];
          
          setLists(listsData);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Error fetching lists:', err);
          setError(err as Error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up lists listener:', error);
      setError(error as Error);
      setLoading(false);
    }
  }, [user?.email]);

  const createList = async (data: { name: string; color: string; icon?: string }) => {
    if (!user) {
      setError('Você precisa estar logado para criar uma lista');
      return;
    }

    try {
      const list = {
        ...data,
        owner: user.email,
        createdAt: Timestamp.now(),
        sharedWith: [],
      };

      await addDoc(collection(db, 'lists'), list);
      setError(null);
    } catch (error) {
      console.error('Error creating list:', error);
      setError('Erro ao criar lista. Por favor, tente novamente.');
      throw error;
    }
  };

  const updateList = async (id: string, data: Partial<List>) => {
    if (!user) {
      setError('Você precisa estar logado para atualizar uma lista');
      return;
    }

    try {
      await updateDoc(doc(db, 'lists', id), {
        ...data,
        updatedAt: Timestamp.now(),
      });
      setError(null);
    } catch (err) {
      console.error('Error updating list:', err);
      setError('Erro ao atualizar lista. Por favor, tente novamente.');
      throw err;
    }
  };

  const deleteList = async (id: string) => {
    if (!user) {
      setError('Você precisa estar logado para excluir uma lista');
      return;
    }

    try {
      await deleteDoc(doc(db, 'lists', id));
      setError(null);
    } catch (err) {
      console.error('Error deleting list:', err);
      setError('Erro ao deletar lista. Por favor, tente novamente.');
      throw err;
    }
  };

  const shareList = async (listId: string, userEmail: string) => {
    if (!user) {
      setError('Você precisa estar logado para compartilhar uma lista');
      return;
    }

    try {
      // Atualizar a lista com o novo colaborador
      await updateDoc(doc(db, 'lists', listId), {
        sharedWith: arrayUnion(userEmail),
      });

      // Buscar nome da lista
      const listDoc = await getDoc(doc(db, 'lists', listId));
      const listName = listDoc.data()?.name || 'Lista';

      // Criar uma notificação para o usuário convidado
      await addDoc(collection(db, 'notifications'), {
        type: 'LIST_SHARE',
        listId,
        listName,
        toEmail: userEmail,
        fromEmail: user.email,
        createdAt: Timestamp.now(),
        read: false,
        message: `${user.email} convidou você para colaborar na lista "${listName}"`,
      });

      setError(null);
    } catch (error) {
      console.error('Error sharing list:', error);
      setError('Erro ao compartilhar lista. Por favor, tente novamente.');
      throw error;
    }
  };

  return {
    lists,
    loading,
    error,
    createList,
    updateList,
    deleteList,
    shareList,
  };
}
