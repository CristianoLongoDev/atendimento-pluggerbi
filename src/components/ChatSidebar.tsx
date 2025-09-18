
import React, { useState, useEffect } from 'react';
import { MessageSquare, Bot, User, Settings, Users, FileText, ShieldCheck, Puzzle, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

let APP_VERSION = 'v1.0.0';

interface Chat {
  id: string;
  status: 'ai' | 'human' | 'pending' | 'closed' | 'waiting';
  unreadCount: number;
}

interface ChatSidebarProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSearchSubmit: (term: string) => void;
  onSearchClear: () => void;
  selectedSection: string;
  onSectionChange: (section: string) => void;
  chats: Chat[];
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  selectedSection,
  onSectionChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [versionText, setVersionText] = useState(APP_VERSION);
  
  const isDevelopment = import.meta.env.DEV;
  
  // Carregar versão salva do localStorage quando o componente montar
  useEffect(() => {
    if (isDevelopment) {
      const savedVersion = localStorage.getItem('app_version');
      if (savedVersion) {
        APP_VERSION = savedVersion;
        setVersionText(savedVersion);
      }
    }
  }, [isDevelopment]);
  
  const handleVersionClick = () => {
    if (isDevelopment) {
      setIsEditing(true);
    }
  };
  
  const saveVersion = () => {
    if (isDevelopment && versionText !== APP_VERSION) {
      APP_VERSION = versionText;
      localStorage.setItem('app_version', versionText);
      console.log('Versão salva:', versionText);
    }
    setIsEditing(false);
  };
  
  const handleVersionSave = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveVersion();
    }
  };
  
  const handleVersionBlur = () => {
    saveVersion();
  };

  const allSections = [
    { id: 'conversations', label: 'Conversas', icon: MessageSquare },
    { id: 'account', label: 'Minha Conta', icon: User },
    { id: 'agent-bots', label: 'Agentes Bots', icon: Bot },
    { id: 'channels', label: 'Canais Atendimento', icon: Settings },
    { id: 'integrations', label: 'Integrações', icon: Puzzle },
    { id: 'prompts', label: 'Eventos', icon: FileText },
    { id: 'intents', label: 'Intenções', icon: Target },
    { id: 'roles', label: 'Funções', icon: ShieldCheck },
  ];

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col h-full">
      {/* Seções de navegação */}
      <div className="p-4 border-b border-border flex-1">
        <div className="space-y-1">
          {/* Todas as seções como menu simples */}
          {allSections.map((section) => {
            const Icon = section.icon;
            return (
              <Button
                key={section.id}
                variant={selectedSection === section.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => onSectionChange(section.id)}
              >
                <Icon className="w-4 h-4 mr-3" />
                {section.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Footer com versão */}
      <div className="p-3 border-t border-border mt-auto">
        <div className="text-xs text-muted-foreground text-center">
          {isEditing && isDevelopment ? (
            <Input
              value={versionText}
              onChange={(e) => setVersionText(e.target.value)}
              onKeyDown={handleVersionSave}
              onBlur={handleVersionBlur}
              className="text-xs text-center h-6 bg-transparent border-none focus:border-input"
              autoFocus
            />
          ) : (
            <div 
              onClick={handleVersionClick}
              className={isDevelopment ? "cursor-pointer hover:bg-muted/50 rounded px-2 py-1" : ""}
              title={isDevelopment ? "Clique para editar (apenas em desenvolvimento)" : ""}
            >
              {versionText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
