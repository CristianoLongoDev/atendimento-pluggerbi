
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Bot, User } from 'lucide-react';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';

interface Chat {
  id: string;
  customerName: string;
  customerAvatar?: string;
  customerPhone?: string;
  customerEmail?: string;
  lastMessage: string;
  timestamp: string;
  channel: 'whatsapp' | 'instagram' | 'facebook' | 'widget';
  status: 'ai' | 'human' | 'pending' | 'closed' | 'waiting';
  unreadCount: number;
  isActive: boolean;
  botAgentName?: string;
  metadata?: any;
}

interface GroupedChat {
  groupKey: string;
  customerName: string;
  customerAvatar?: string;
  channel: 'whatsapp' | 'instagram' | 'facebook' | 'widget';
  lastMessage: string;
  timestamp: string;
  status: 'ai' | 'human' | 'pending' | 'closed' | 'waiting';
  unreadCount: number;
  conversationCount: number;
  conversations: Chat[];
}

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onChatSelect: (groupKey: string, conversations: Chat[]) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, selectedChatId, onChatSelect }) => {
  // Agrupar conversas por customerName + channel
  const groupedChats = React.useMemo(() => {
    const groups: { [key: string]: GroupedChat } = {};
    
    chats.forEach(chat => {
      // Debug para CRISTIANO
      if (chat.customerName.includes('CRISTIANO')) {
        console.log('🔍 CHAT LIST DEBUG CRISTIANO:', {
          customerName: chat.customerName,
          channel: chat.channel,
          status: chat.status,
          isActive: chat.isActive
        });
      }
      const groupKey = `${chat.customerName}-${chat.channel}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          groupKey,
          customerName: chat.customerName,
          customerAvatar: chat.customerAvatar,
          channel: chat.channel,
          lastMessage: chat.lastMessage,
          timestamp: chat.timestamp,
          status: chat.status,
          unreadCount: chat.unreadCount,
          conversationCount: 1,
          conversations: [chat]
        };
      } else {
        // Atualizar com a conversa mais recente - comparar por string quando já formatado
        if (chat.timestamp > groups[groupKey].timestamp) {
          groups[groupKey].lastMessage = chat.lastMessage;
          groups[groupKey].timestamp = chat.timestamp;
          groups[groupKey].status = chat.status;
        }
        
        groups[groupKey].unreadCount += chat.unreadCount;
        groups[groupKey].conversationCount += 1;
        groups[groupKey].conversations.push(chat);
      }
    });
    
    // Ordenar conversas dentro de cada grupo por timestamp (mais recente primeiro)
    Object.values(groups).forEach(group => {
      group.conversations.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    });
    
    // Retornar grupos ordenados por timestamp da última mensagem
    return Object.values(groups).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [chats]);
  const getChannelColor = (channel: string) => {
    const colors = {
      whatsapp: 'bg-green-500',
      instagram: 'bg-pink-500',
      facebook: 'bg-blue-500',
      widget: 'bg-purple-500',
    };
    return colors[channel as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ai':
        return <Bot className="w-3 h-3 text-blue-500" />;
      case 'human':
        return <User className="w-3 h-3 text-green-500" />;
      default:
        return <MessageSquare className="w-3 h-3 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      ai: 'IA',
      human: 'Humano',
      pending: 'Pendente',
      closed: 'Finalizado',
      waiting: 'Aguardando'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      // Se já está formatado (contém "/"), retorna como está
      if (timestamp.includes('/')) {
        return timestamp;
      }
      // Se é uma data ISO, formata para o fuso correto
      const date = new Date(timestamp);
      return formatInTimeZone(date, 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch (error) {
      return timestamp; // Fallback para o valor original caso haja erro
    }
  };

  return (
    <div className="space-y-1">
      {groupedChats.map((group) => (
        <div
          key={group.groupKey}
          className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
            selectedChatId === group.groupKey ? 'bg-muted' : ''
          }`}
          onClick={() => onChatSelect(group.groupKey, group.conversations)}
        >
          <div className="flex items-start space-x-3">
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={group.customerAvatar} />
                <AvatarFallback>{group.customerName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div 
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${getChannelColor(group.channel)} flex items-center justify-center`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  group.conversations.some(conv => conv.isActive) 
                    ? 'bg-green-500' 
                    : 'bg-red-500'
                }`}></div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium truncate">{group.customerName}</h4>
                <span className="text-xs text-muted-foreground">{formatTimestamp(group.timestamp)}</span>
              </div>
              
              <div className="flex items-center space-x-1 mb-2">
                {group.channel === 'whatsapp' && (
                  <img src="/lovable-uploads/84640d55-cdf5-4bb9-9e7b-d1c9310ed0e6.png" alt="WhatsApp" className="w-4 h-4" />
                )}
                {group.channel === 'instagram' && (
                  <MessageSquare className="w-3 h-3 text-pink-500" />
                )}
                {group.channel === 'facebook' && (
                  <MessageSquare className="w-3 h-3 text-blue-500" />
                )}
                {group.channel === 'widget' && (
                  <MessageSquare className="w-3 h-3 text-purple-500" />
                )}
                <span className="text-sm text-muted-foreground capitalize">
                  {group.channel}
                </span>
                {group.conversationCount > 1 && (
                  <Badge variant="secondary" className="text-xs ml-1">
                    {group.conversationCount}
                  </Badge>
                )}
              </div>
              
              
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {getStatusIcon(group.status)}
                  <span className="text-xs text-muted-foreground">
                    {getStatusText(group.status)}
                  </span>
                </div>
                
                {group.unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs h-5 min-w-5 flex items-center justify-center">
                    {group.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
