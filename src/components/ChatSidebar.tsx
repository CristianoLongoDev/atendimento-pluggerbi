
import React from 'react';
import { MessageSquare, Bot, User, Filter, Search, Plus, Settings, Users, FileText, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ChatSidebarProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedSection: string;
  onSectionChange: (section: string) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  selectedFilter,
  onFilterChange,
  searchTerm,
  onSearchChange,
  selectedSection,
  onSectionChange,
}) => {
  const filters = [
    { id: 'all', label: 'Todas', icon: MessageSquare, count: 12 },
    { id: 'ai', label: 'IA Ativa', icon: Bot, count: 8 },
    { id: 'human', label: 'Atendimento Humano', icon: User, count: 3 },
    { id: 'pending', label: 'Pendentes', icon: Filter, count: 1 },
  ];

  const configSections = [
    { id: 'conversations', label: 'Conversas', icon: MessageSquare },
    { id: 'account', label: 'Minha Conta', icon: User },
    { id: 'channels', label: 'Canais Atendimento', icon: Settings },
    { id: 'agents', label: 'Agentes Bots', icon: Bot },
    { id: 'prompts', label: 'Prompts', icon: FileText },
    { id: 'roles', label: 'Funções', icon: ShieldCheck },
  ];

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col h-full">
      {/* Seções de navegação */}
      <div className="p-4 border-b border-border">
        <div className="space-y-1">
          {configSections.map((section) => {
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

      {/* Conteúdo específico para conversas */}
      {selectedSection === 'conversations' && (
        <>
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filtros</h2>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Nova
              </Button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="p-4 border-b border-border">
            <div className="space-y-2">
              {filters.map((filter) => {
                const Icon = filter.icon;
                return (
                  <Button
                    key={filter.id}
                    variant={selectedFilter === filter.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => onFilterChange(filter.id)}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {filter.label}
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {filter.count}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-2 space-y-1">
              {/* Chat list will be rendered here */}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatSidebar;
