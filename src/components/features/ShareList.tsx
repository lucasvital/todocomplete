import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Share } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { db } from '../../lib/firebase';
import { doc, updateDoc, arrayUnion, addDoc, collection, Timestamp } from 'firebase/firestore';

interface ShareListProps {
  listId: string;
  listName: string;
}

export function ShareList({ listId, listName }: ShareListProps) {
  const [email, setEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!email) return;
    
    try {
      setIsSharing(true);
      // Atualizar a lista com o novo colaborador
      await updateDoc(doc(db, 'lists', listId), {
        sharedWith: arrayUnion(email),
      });

      // Criar uma notificação para o usuário convidado
      await addDoc(collection(db, 'notifications'), {
        type: 'LIST_SHARE',
        listId,
        listName,
        toEmail: email,
        createdAt: new Date(),
        read: false,
        message: `Você foi convidado para colaborar na lista "${listName}"`,
      });

      setEmail('');
      alert('Convite enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao compartilhar lista:', error);
      alert('Erro ao compartilhar lista. Tente novamente.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Share className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Compartilhar Lista</DialogTitle>
          <DialogDescription>
            Digite o email da pessoa com quem você quer compartilhar a lista "{listName}".
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Email do colaborador"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button onClick={handleShare} disabled={isSharing}>
            {isSharing ? 'Compartilhando...' : 'Compartilhar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
