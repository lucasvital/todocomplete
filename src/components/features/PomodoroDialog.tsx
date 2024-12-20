import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Bell, Clock, Coffee, Focus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PomodoroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PomodoroDialog({ open, onOpenChange }: PomodoroDialogProps) {
  const [pomodoroTime, setPomodoroTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [autoStartBreaks, setAutoStartBreaks] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Configurar Pomodoro
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Tempo de Foco */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Focus className="h-4 w-4 text-primary" />
              <Label htmlFor="focusTime">Tempo de Foco</Label>
            </div>
            <div className="flex items-center gap-4">
              <Slider
                id="focusTime"
                value={[pomodoroTime]}
                onValueChange={([value]) => setPomodoroTime(value)}
                max={60}
                min={1}
                step={1}
                className="flex-1"
              />
              <div className="w-16">
                <Input
                  type="number"
                  value={pomodoroTime}
                  onChange={(e) => setPomodoroTime(Number(e.target.value))}
                  min={1}
                  max={60}
                  className="h-8"
                />
              </div>
            </div>
          </div>

          {/* Tempo de Pausa */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4 text-primary" />
              <Label htmlFor="breakTime">Tempo de Pausa</Label>
            </div>
            <div className="flex items-center gap-4">
              <Slider
                id="breakTime"
                value={[breakTime]}
                onValueChange={([value]) => setBreakTime(value)}
                max={30}
                min={1}
                step={1}
                className="flex-1"
              />
              <div className="w-16">
                <Input
                  type="number"
                  value={breakTime}
                  onChange={(e) => setBreakTime(Number(e.target.value))}
                  min={1}
                  max={30}
                  className="h-8"
                />
              </div>
            </div>
          </div>

          {/* Configurações Adicionais */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coffee className="h-4 w-4 text-primary" />
                <Label htmlFor="autoStartBreaks">Iniciar pausas automaticamente</Label>
              </div>
              <Switch
                id="autoStartBreaks"
                checked={autoStartBreaks}
                onCheckedChange={setAutoStartBreaks}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <Label htmlFor="notifications">Notificações</Label>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => {
            // Implementar lógica do timer
            onOpenChange(false);
          }}>
            Iniciar Timer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
