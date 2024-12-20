import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useAuth } from '../../hooks/useAuth';

export function UserAvatar() {
  const { user } = useAuth();

  if (!user) return null;

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <Avatar>
      <AvatarImage src={user.photoURL || undefined} alt={user.email || ''} />
      <AvatarFallback className="bg-primary">
        {user.email ? getInitials(user.email) : '?'}
      </AvatarFallback>
    </Avatar>
  );
}
