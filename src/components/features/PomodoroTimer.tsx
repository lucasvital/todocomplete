import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, MinusCircle, PlusCircle, Settings2, Coffee, Brain, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { cn } from '../../lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';

type TimerMode = 'focus' | 'break' | 'longBreak';

interface TimerSettings {
  focusTime: number;
  breakTime: number;
  longBreakTime: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  volume: number;
}

const DEFAULT_SETTINGS: TimerSettings = {
  focusTime: 25,
  breakTime: 5,
  longBreakTime: 15,
  longBreakInterval: 4,
  autoStartBreaks: true,
  autoStartPomodoros: false,
  volume: 80,
};

export function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.focusTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            handleTimerComplete();
            return getTimeForMode(getNextMode());
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, settings]);

  const getTimeForMode = (currentMode: TimerMode): number => {
    switch (currentMode) {
      case 'focus':
        return settings.focusTime * 60;
      case 'break':
        return settings.breakTime * 60;
      case 'longBreak':
        return settings.longBreakTime * 60;
      default:
        return settings.focusTime * 60;
    }
  };

  const getNextMode = (): TimerMode => {
    if (mode === 'focus') {
      const newCompletedPomodoros = completedPomodoros + 1;
      setCompletedPomodoros(newCompletedPomodoros);
      
      if (newCompletedPomodoros % settings.longBreakInterval === 0) {
        return 'longBreak';
      }
      return 'break';
    }
    return 'focus';
  };

  const handleTimerComplete = () => {
    const newMode = getNextMode();
    setMode(newMode);
    playNotificationSound();
    
    if (Notification.permission === 'granted') {
      new Notification(
        getNotificationTitle(newMode),
        { body: getNotificationBody(newMode) }
      );
    }

    // Auto-start next session if enabled
    if (
      (newMode === 'focus' && settings.autoStartPomodoros) ||
      ((newMode === 'break' || newMode === 'longBreak') && settings.autoStartBreaks)
    ) {
      setIsRunning(true);
    }
  };

  const getNotificationTitle = (currentMode: TimerMode): string => {
    switch (currentMode) {
      case 'focus':
        return 'Hora de focar!';
      case 'break':
        return 'Hora da pausa!';
      case 'longBreak':
        return 'Hora do café!';
      default:
        return 'Pomodoro Timer';
    }
  };

  const getNotificationBody = (currentMode: TimerMode): string => {
    switch (currentMode) {
      case 'focus':
        return 'Vamos voltar ao trabalho?';
      case 'break':
        return 'Faça uma pausa rápida para recarregar as energias.';
      case 'longBreak':
        return 'Você merece um bom café! Aproveite sua pausa longa.';
      default:
        return '';
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.volume = settings.volume / 100;
    audio.play().catch(() => {
      // Falha silenciosa se o navegador bloquear o áudio
    });
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getTimeForMode(mode));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getModeIcon = (currentMode: TimerMode) => {
    switch (currentMode) {
      case 'focus':
        return <Brain className="h-4 w-4" />;
      case 'break':
        return <Clock className="h-4 w-4" />;
      case 'longBreak':
        return <Coffee className="h-4 w-4" />;
    }
  };

  const getModeColor = (currentMode: TimerMode) => {
    switch (currentMode) {
      case 'focus':
        return "text-red-500";
      case 'break':
        return "text-green-500";
      case 'longBreak':
        return "text-blue-500";
    }
  };

  return (
    <div className="space-y-4">
      <Card className={cn(
        "transition-all duration-200",
        isMinimized ? "w-auto" : "w-full"
      )}>
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            {!isMinimized && (
              <div className="flex items-center gap-2">
                {getModeIcon(mode)}
                <span className={cn(
                  "text-sm font-medium",
                  getModeColor(mode)
                )}>
                  {mode === 'focus' ? 'Foco' : mode === 'break' ? 'Pausa' : 'Café'}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({completedPomodoros} pomodoros)
                </span>
              </div>
            )}
            <div className="flex items-center gap-1 ml-auto">
              {!isMinimized && (
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Settings2 className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Configurações do Timer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Duração do Foco (minutos)</Label>
                        <Input
                          type="number"
                          value={settings.focusTime}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            focusTime: parseInt(e.target.value) || DEFAULT_SETTINGS.focusTime
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Duração da Pausa (minutos)</Label>
                        <Input
                          type="number"
                          value={settings.breakTime}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            breakTime: parseInt(e.target.value) || DEFAULT_SETTINGS.breakTime
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Duração da Pausa Longa (minutos)</Label>
                        <Input
                          type="number"
                          value={settings.longBreakTime}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            longBreakTime: parseInt(e.target.value) || DEFAULT_SETTINGS.longBreakTime
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Intervalo para Pausa Longa (pomodoros)</Label>
                        <Input
                          type="number"
                          value={settings.longBreakInterval}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            longBreakInterval: parseInt(e.target.value) || DEFAULT_SETTINGS.longBreakInterval
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Volume da Notificação</Label>
                        <Slider
                          value={[settings.volume]}
                          max={100}
                          step={1}
                          onValueChange={([value]) => setSettings(prev => ({
                            ...prev,
                            volume: value
                          }))}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="autoStartBreaks"
                          checked={settings.autoStartBreaks}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            autoStartBreaks: e.target.checked
                          }))}
                        />
                        <Label htmlFor="autoStartBreaks">Iniciar pausas automaticamente</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="autoStartPomodoros"
                          checked={settings.autoStartPomodoros}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            autoStartPomodoros: e.target.checked
                          }))}
                        />
                        <Label htmlFor="autoStartPomodoros">Iniciar pomodoros automaticamente</Label>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <PlusCircle className="h-3 w-3" /> : <MinusCircle className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tabular-nums">
              {formatTime(timeLeft)}
            </span>

            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isRunning ? "outline" : "default"}
                      size="icon"
                      className="h-7 w-7"
                      onClick={toggleTimer}
                    >
                      {isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isRunning ? 'Pausar' : 'Iniciar'}</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={resetTimer}
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reiniciar</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </Card>

      {!isMinimized && (
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "w-full",
              mode === 'focus' && "border-red-500"
            )}
            onClick={() => {
              setMode('focus');
              setTimeLeft(settings.focusTime * 60);
              setIsRunning(false);
            }}
          >
            <Brain className="h-4 w-4 mr-2" />
            Foco
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "w-full",
              mode === 'break' && "border-green-500"
            )}
            onClick={() => {
              setMode('break');
              setTimeLeft(settings.breakTime * 60);
              setIsRunning(false);
            }}
          >
            <Clock className="h-4 w-4 mr-2" />
            Pausa
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "w-full",
              mode === 'longBreak' && "border-blue-500"
            )}
            onClick={() => {
              setMode('longBreak');
              setTimeLeft(settings.longBreakTime * 60);
              setIsRunning(false);
            }}
          >
            <Coffee className="h-4 w-4 mr-2" />
            Café
          </Button>
        </div>
      )}
    </div>
  );
}
