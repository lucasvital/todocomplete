import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { LayoutDashboard, BookTemplate, Timer } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { PomodoroTimer } from './PomodoroTimer';
import { TaskTemplateButton } from './TaskTemplateButton';
import { UserAvatar } from './UserAvatar';
import { NotificationBell } from './NotificationBell';
import { AuthButton } from './AuthButton';
import { useState } from 'react';

export function Header() {
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <header className="flex items-center justify-between pb-6">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Todo List</h1>
        
        <div className="flex items-center gap-2">
          {/* Pomodoro Button */}
          <DropdownMenu open={showPomodoro} onOpenChange={setShowPomodoro}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Timer className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
              <PomodoroTimer />
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Templates Button */}
          <DropdownMenu open={showTemplates} onOpenChange={setShowTemplates}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <BookTemplate className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
              <TaskTemplateButton />
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dashboard Button */}
          <Link to="/dashboard">
            <Button variant="outline" size="icon">
              <LayoutDashboard className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <UserAvatar />
        <div className="flex items-center gap-2">
          <NotificationBell />
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
