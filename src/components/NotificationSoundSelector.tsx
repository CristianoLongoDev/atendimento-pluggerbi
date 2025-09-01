import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Volume2, VolumeX } from 'lucide-react';
import { SoundType } from '@/hooks/useNotifications';

interface NotificationSoundSelectorProps {
  currentSound: SoundType;
  customSoundUrl?: string;
  onSoundChange: (soundType: SoundType, customUrl?: string) => void;
}

export const NotificationSoundSelector: React.FC<NotificationSoundSelectorProps> = ({
  currentSound,
  customSoundUrl,
  onSoundChange
}) => {
  const [testSound, setTestSound] = useState<SoundType>(currentSound);
  const [customUrl, setCustomUrl] = useState(customSoundUrl || '');

  const soundOptions = [
    { value: 'beep', label: 'Beep (Padrão)', description: 'Som tradicional de notificação' },
    { value: 'ding', label: 'Ding', description: 'Som agudo e rápido' },
    { value: 'chime', label: 'Chime', description: 'Som suave e melodioso' },
    { value: 'pop', label: 'Pop', description: 'Som tipo "pop"' },
    { value: 'custom', label: 'Personalizado', description: 'Use seu próprio arquivo de áudio' },
    { value: 'silent', label: 'Silencioso', description: 'Sem som de notificação' }
  ];

  const playTestSound = (soundType: SoundType, customUrl?: string) => {
    if (soundType === 'silent') return;
    
    const audio = new Audio();
    
    switch (soundType) {
      case 'beep':
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMdCzeFz/LVdSIFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMdCzeFz/LVdSIFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMdCzeFz/LVdSIFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMdCzeFz/LVdSIFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMdCzeFz/LVdSIF';
        break;
      case 'ding':
        // Gerar som ding usando Web Audio API
        generateTone(1000, 150, 'sine');
        return;
      case 'chime':
        // Gerar som chime usando Web Audio API
        generateTone(800, 300, 'triangle');
        return;
      case 'pop':
        // Gerar som pop usando Web Audio API
        generateTone(1500, 100, 'square');
        return;
      case 'custom':
        if (customUrl) {
          audio.src = customUrl;
        }
        break;
    }
    
    if (audio.src) {
      audio.play().catch(e => console.log('Erro ao tocar som:', e));
    }
  };

  const generateTone = (frequency: number, duration: number, type: OscillatorType) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
    
    setTimeout(() => {
      audioContext.close();
    }, duration);
  };

  const handleSoundChange = (value: string) => {
    const soundType = value as SoundType;
    setTestSound(soundType);
    
    if (soundType === 'custom') {
      onSoundChange(soundType, customUrl);
    } else {
      onSoundChange(soundType);
    }
  };

  const handleCustomUrlChange = (url: string) => {
    setCustomUrl(url);
    if (testSound === 'custom') {
      onSoundChange('custom', url);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Som de Notificação
        </CardTitle>
        <CardDescription>
          Escolha o som que será tocado quando receber novas mensagens
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sound-select">Tipo de Som</Label>
          <Select value={testSound} onValueChange={handleSoundChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um som" />
            </SelectTrigger>
            <SelectContent>
              {soundOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {testSound === 'custom' && (
          <div className="space-y-2">
            <Label htmlFor="custom-url">URL do Arquivo de Áudio</Label>
            <Input
              id="custom-url"
              type="url"
              placeholder="https://exemplo.com/som.mp3"
              value={customUrl}
              onChange={(e) => handleCustomUrlChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Formatos suportados: MP3, WAV, OGG
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => playTestSound(testSound, customUrl)}
            disabled={testSound === 'silent'}
            className="flex-1"
          >
            {testSound === 'silent' ? (
              <>
                <VolumeX className="h-4 w-4 mr-2" />
                Silencioso
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Testar Som
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};