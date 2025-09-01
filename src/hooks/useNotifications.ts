import { useEffect, useRef, useCallback, useState } from 'react';
import { useNotificationSettings } from './useNotificationSettings';

export type SoundType = 'beep' | 'ding' | 'chime' | 'pop' | 'custom' | 'silent';

interface NotificationOptions {
  originalTitle: string;
  originalFavicon: string;
  alternateTitle: string;
}

export const useNotifications = (options: NotificationOptions) => {
  const [isNotifying, setIsNotifying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const titleElementRef = useRef<HTMLTitleElement | null>(null);
  const faviconElementRef = useRef<HTMLLinkElement | null>(null);
  const currentStateRef = useRef<'original' | 'alternate'>('original');
  const { settings } = useNotificationSettings();

  // Inicializa elementos DOM
  useEffect(() => {
    titleElementRef.current = document.querySelector('title');
    faviconElementRef.current = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    
    // Cria elemento de áudio para notificação
    audioRef.current = new Audio();
    
    // Define o som baseado na opção escolhida
    const setupAudioSource = () => {
      if (!audioRef.current) return;
      
      const soundType = settings.soundType;
      
      switch (soundType) {
        case 'beep':
          audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMdCzeFz/LVdSIFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMdCzeFz/LVdSIFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMdCzeFz/LVdSIFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMdCzeFz/LVdSIFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMdCzeFz/LVdSIFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMdCzeFz/LVdSIFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMdCzeFz/LVdSIFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMdCzeFz/LVdSIFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMdCzeFz/LVdSIFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMdCzeFz/LVdSIFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMdCzeFz/LVdSIFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMdCzeFz/LVdSIFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMdCzeFz/LVdSIFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMdCzeFz/LVdSIFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMdCzeFz/LVdSIF';
          break;
        case 'ding':
          // Som mais agudo e rápido
          audioRef.current.src = 'data:audio/wav;base64,UklGRhwBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAACIK8dJvwzC+BAemRoSmRrQWe8Wm90c';
          break;
        case 'chime':
          // Som mais suave e melodioso
          audioRef.current.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAB=';
          break;
        case 'pop':
          // Som tipo "pop" 
          audioRef.current.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAC=';
          break;
        case 'custom':
          if (settings.customSoundUrl) {
            audioRef.current.src = settings.customSoundUrl;
          }
          break;
        case 'silent':
          audioRef.current = null;
          break;
        default:
          audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMdCzeFz/LVdSIFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMdCzeFz/LVdSIFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMdCzeFz/LVdSIFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMdCzeFz/LVdSIF';
      }
    };
    
    setupAudioSource();

    return () => {
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, [settings.soundType, settings.customSoundUrl]);

  const alternateDisplay = useCallback(() => {
    if (!titleElementRef.current || !faviconElementRef.current) return;

    currentStateRef.current = currentStateRef.current === 'original' ? 'alternate' : 'original';
    
    if (currentStateRef.current === 'alternate') {
      titleElementRef.current.textContent = options.alternateTitle;
      // Para o favicon alternado, usamos um ícone de notificação simples
      faviconElementRef.current.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">!</text></svg>';
    } else {
      titleElementRef.current.textContent = options.originalTitle;
      faviconElementRef.current.href = options.originalFavicon;
    }
  }, [options]);

  const startNotifications = useCallback(() => {
    if (isNotifying) return;
    
    console.log('🔔 Iniciando notificações');
    setIsNotifying(true);
    
    // Toca som de notificação
    if (audioRef.current && settings.soundType !== 'silent') {
      audioRef.current.play().catch(e => console.log('Não foi possível tocar o som:', e));
    }
    
    // Inicia alternância visual
    intervalRef.current = setInterval(alternateDisplay, 1000);
  }, [isNotifying, alternateDisplay]);

  const stopNotifications = useCallback(() => {
    if (!isNotifying) return;
    
    console.log('🔕 Parando notificações');
    setIsNotifying(false);
    
    // Para a alternância
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Restaura estado original
    if (titleElementRef.current && faviconElementRef.current) {
      titleElementRef.current.textContent = options.originalTitle;
      faviconElementRef.current.href = options.originalFavicon;
    }
    currentStateRef.current = 'original';
  }, [isNotifying, options]);

  // Para notificações quando a página fica ativa
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isNotifying) {
        stopNotifications();
      }
    };

    const handleFocus = () => {
      if (isNotifying) {
        stopNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isNotifying, stopNotifications]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isNotifying,
    startNotifications,
    stopNotifications
  };
};