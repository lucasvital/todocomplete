import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  where,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Todo } from '../../types/todo';

// Referência da coleção de todos no Firestore
export const todosCollection = collection(db, 'todos');

// Função para escutar mudanças nos todos
export const subscribeTodos = (
  userId: string | undefined,
  onTodosUpdate: (todos: Todo[]) => void,
  onError: (error: Error) => void
) => {
  // Se não houver userId, não busca nada
  if (!userId) {
    onTodosUpdate([]);
    return () => {};
  }

  try {
    // Query para buscar apenas os todos do usuário atual
    const q = query(
      todosCollection,
      where('userId', '==', userId)
    );

    // Escuta mudanças em tempo real
    return onSnapshot(
      q,
      (snapshot) => {
        const todos = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            text: data.text || '',
            completed: data.completed || false,
            userId: data.userId,
            createdAt: data.createdAt?.toDate() || new Date(),
          } as Todo;
        });

        // Ordenar localmente por enquanto
        todos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        onTodosUpdate(todos);
      },
      (error) => {
        console.error('Error fetching todos:', error);
        onError(error);
      }
    );
  } catch (error) {
    console.error('Error setting up todos listener:', error);
    onError(error as Error);
    return () => {};
  }
};

// Função para adicionar um novo todo
export const addTodo = async (text: string, userId: string) => {
  try {
    const docRef = await addDoc(todosCollection, {
      text,
      completed: false,
      userId,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding todo:', error);
    throw error;
  }
};

// Função para alternar o estado de um todo
export const toggleTodo = async (id: string, completed: boolean) => {
  try {
    const todoRef = doc(db, 'todos', id);
    await updateDoc(todoRef, { 
      completed,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error toggling todo:', error);
    throw error;
  }
};

// Função para deletar um todo
export const deleteTodo = async (id: string) => {
  try {
    const todoRef = doc(db, 'todos', id);
    await deleteDoc(todoRef);
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
};
