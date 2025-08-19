import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { validateAndSanitizeMessage, webSocketMessageSchema, conversationIdSchema, isValidUUID } from '@/lib/validation';
import { formatInTimeZone } from 'date-fns-tz';

interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: 'customer' | 'ai' | 'agent';
  channel?: string;
  message_type?: string;
  tokens?: number;
  metadata?: {
    contact?: {
      id?: string;
      name?: string;
      phone?: string;
    };
    bot?: {
      name?: string;
      agent_name?: string;
    };
  };
}

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

interface UseRealtimeConversationsReturn {
  chats: Chat[];
  messages: { [chatId: string]: Message[] };
  isConnected: boolean;
  sendMessage: (chatId: string, content: string) => void;
  transferToHuman: (chatId: string) => void;
  refreshConversations: () => void;
  fetchMessages: (conversationId: string | number) => void;
  markAsRead: (chatId: string) => void;
}

export const useRealtimeConversations = (): UseRealtimeConversationsReturn => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  
  const { isConnected, sendMessage: wsSendMessage, subscribe } = useWebSocket('wss://atendimento.pluggerbi.com/ws');

  // Subscribe to WebSocket messages
  useEffect(() => {
    console.log('🌐 WEBSOCKET: Configurando subscription...');
    console.log('🌐 WEBSOCKET: isConnected =', isConnected);
    
    const unsubscribe = subscribe((message) => {
      console.log('🔥 WEBSOCKET MESSAGE RECEIVED:', message.type, message);
      
      switch (message.type) {
        case 'new_message':
          console.log('📩 Handling new_message event');
          handleNewMessage(message.data);
          break;
        case 'subscription_updated':
          console.log('📊 Handling subscription_updated event');
          handleSubscriptionUpdate(message.data);
          break;
        case 'messages_response':
          console.log('💬 Handling messages_response event');
          handleMessagesResponse(message);
          break;
        case 'connection_confirmed':
          console.log('✅ Connection confirmed');
          break;
        case 'pong':
          console.log('🏓 Pong received');
          break;
        default:
          console.log('❓ Unknown message type:', message.type);
          break;
      }
    });

    return unsubscribe;
  }, [subscribe]);

  // Auto-refresh conversations when WebSocket connects
  useEffect(() => {
    if (isConnected) {
      console.log('🔄 WebSocket conectado, buscando conversas...');
      // Aguarda um pouco para garantir que a conexão está estável
      setTimeout(() => {
        if (isConnected) { // Double check connection is still active
          const refreshPayload = {
            type: 'subscribe_conversations',
            data: {
              conversation_ids: [] // Empty array = all conversations
            }
          };
          wsSendMessage(refreshPayload);
          console.log('📤 Enviado subscribe_conversations');
        }
      }, 1000);
    }
  }, [isConnected, wsSendMessage]);

  const handleNewMessage = useCallback((data: any) => {
    console.log('🔔 NEW MESSAGE RECEIVED:', data);
    
    if (!data || !data.data) {
      console.log('❌ No message data received');
      return;
    }

    const messageData = data.data;
    const conversation_id = data.conversation_id;
    
    // Extract data according to new API structure
    const message_id = messageData.id;
    const content = messageData.content;
    const sender = messageData.sender === 'user' ? 'customer' : messageData.sender;
    const timestamp = messageData.timestamp;
    const channel = messageData.channel;
    const message_type = messageData.message_type;
    const tokens = messageData.tokens;
    const metadata = messageData.metadata;
    
    console.log('📍 Processing new message for conversation:', conversation_id);
    console.log('💬 Message details:', { message_id, content, sender, timestamp });

    // Add new message to the messages state with force update
    setMessages(prev => {
      const currentMessages = prev[conversation_id] || [];
      const newMessage: Message = {
        id: message_id || `msg_${Date.now()}`,
        content: content,
        sender: sender,
        timestamp: timestamp ? (() => {
          const date = new Date(timestamp + (timestamp.includes('Z') ? '' : 'Z'));
          return formatInTimeZone(date, 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm');
        })() : formatInTimeZone(new Date(), 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm'),
        channel,
        message_type,
        tokens,
        metadata
      };
      
      console.log('🔄 Adding message to conversation:', conversation_id, newMessage);
      console.log('📚 Current messages count:', currentMessages.length);
      
      const updatedMessages = {
        ...prev,
        [conversation_id]: [...currentMessages, newMessage]
      };
      
      console.log('📝 Updated messages state:', updatedMessages[conversation_id]);
      return updatedMessages;
    });

    // Update chat list with new last message
    setChats(prev => {
      const updatedChats = prev.map(chat => {
        if (chat.id === conversation_id) {
          console.log('🔄 Updating chat:', chat.id, 'with new message');
          return {
            ...chat,
            lastMessage: content,
            timestamp: timestamp ? (() => {
              const date = new Date(timestamp + (timestamp.includes('Z') ? '' : 'Z'));
              return formatInTimeZone(date, 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm');
            })() : formatInTimeZone(new Date(), 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm'),
            unreadCount: chat.unreadCount + 1,
            status: sender === 'customer' || sender === 'user' ? 'pending' : chat.status
          };
        }
        return chat;
      });
      
      console.log('💼 Updated chats with new message');
      return updatedChats;
    });
  }, []);

  const handleSubscriptionUpdate = useCallback((data: any) => {
    console.log('🔥 Processing subscription update:', data);
    
    if (data.conversations) {
      console.log('🔍 TOTAL CONVERSAS RECEBIDAS:', data.conversations.length);
      
      // Log each conversation to see channel data
      data.conversations.forEach((conv: any, index: number) => {
        console.log(`📋 CONVERSA ${index + 1}:`, {
          id: conv.id,
          channel: conv.channel,
          channel_type: conv.channel_type,
          contact_name: conv.contact_name,
          customer_name: conv.customer_name,
          last_message: conv.last_message,
          conversation_status: conv.conversation_status,
          status: conv.status,
          isActiveStatus: conv.status === 'active'
        });
      });
      
      // Update chats list - mapping status_attendance to our status
      const updatedChats = data.conversations.map((conv: any): Chat => {
         // Log para debug de todos os usuários
         console.log('🔍 DEBUG CONVERSA:', {
           id: conv.id,
           customer_name: conv.customer_name,
           status: conv.status,
           channel: conv.channel,
           isActive: conv.status === 'active'
         });
        
        return {
          id: conv.id,
          customerName: conv.customer_name || `Cliente ${conv.id}`,
          customerPhone: conv.metadata?.contact?.phone,
          customerEmail: conv.metadata?.contact?.email,
          customerAvatar: conv.metadata?.contact?.avatar,
          lastMessage: conv.last_message || 'Sem mensagens',
          timestamp: conv.updated_at ? (() => {
            try {
              // Se já está formatado (DD/MM/YYYY), retorna como está
              if (typeof conv.updated_at === 'string' && conv.updated_at.includes('/')) {
                return conv.updated_at;
              }
              
              // Garantir que a data seja interpretada como UTC antes de converter para timezone de SP
              let date;
              if (typeof conv.updated_at === 'string') {
                // Se for string, garantir que seja interpretada como UTC
                date = new Date(conv.updated_at + (conv.updated_at.includes('Z') ? '' : 'Z'));
              } else {
                date = new Date(conv.updated_at);
              }
              
              // Verifica se a data é válida
              if (isNaN(date.getTime())) {
                console.warn('Invalid date from backend:', conv.updated_at);
                return formatInTimeZone(new Date(), 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm');
              }
              
              return formatInTimeZone(date, 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm');
            } catch (error) {
              console.error('Error formatting timestamp:', error, conv.updated_at);
              return formatInTimeZone(new Date(), 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm');
            }
          })() : '',
          channel: conv.channel === 'whatsapp' ? 'whatsapp' : 'widget',
          status: (() => {
            // Usar campo status diretamente (active/closed)
            if (conv.status === 'active') return 'ai';
            if (conv.status === 'closed') return 'closed';
            // Fallback para outros status possíveis
            if (conv.status === 'human') return 'human';
            if (conv.status === 'waiting') return 'waiting';
            return 'pending';
          })(),
          unreadCount: conv.unread_count || 0,
          isActive: conv.status === 'active', // Usar status diretamente
          botAgentName: conv.metadata?.bot?.agent_name,
          metadata: conv.metadata
        };
      });
      
      setChats(updatedChats);
    }

    if (data.messages) {
      // Update messages for specific conversations
      const messagesByConversation: { [chatId: string]: Message[] } = {};
      
      data.messages.forEach((msg: any) => {
        const conversationId = msg.conversation_id;
        if (!messagesByConversation[conversationId]) {
          messagesByConversation[conversationId] = [];
        }
        
        messagesByConversation[conversationId].push({
          id: msg.id,
          content: msg.content,
          sender: msg.sender === 'user' ? 'customer' : msg.sender,
          timestamp: (() => {
            const date = new Date(msg.timestamp + (msg.timestamp.includes('Z') ? '' : 'Z'));
            return formatInTimeZone(date, 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm');
          })(),
          channel: msg.channel,
          message_type: msg.message_type,
          tokens: msg.tokens,
          metadata: msg.metadata
        });
      });

      setMessages(prev => ({
        ...prev,
        ...messagesByConversation
      }));
    }
  }, []);

  const handleMessagesResponse = useCallback((message: any) => {
    console.log('Processing messages response:', message);
    
    if (message.conversation_id && message.data) {
      // Extrair conversation_status se disponível
      const conversationStatus = message.data.conversation_status;
      const isActive = conversationStatus === 'active';
      
      console.log(`🔍 MESSAGES RESPONSE - Conversation ${message.conversation_id}:`, {
        conversation_status: conversationStatus,
        isActive: isActive
      });
      
      if (message.data.messages) {
        const conversationMessages = message.data.messages.map((msg: any): Message => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender === 'user' ? 'customer' : msg.sender,
          timestamp: (() => {
            const date = new Date(msg.timestamp + (msg.timestamp.includes('Z') ? '' : 'Z'));
            return formatInTimeZone(date, 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm');
          })(),
          channel: msg.channel,
          message_type: msg.message_type,
          tokens: msg.tokens,
          metadata: msg.metadata
        }));

        console.log('📝 Setting messages for conversation:', message.conversation_id, conversationMessages);

        setMessages(prev => ({
          ...prev,
          [message.conversation_id]: conversationMessages
        }));
      }
      
      // Atualizar o status da conversa baseado no conversation_status
      setChats(prev => prev.map(chat => {
        if (chat.id === message.conversation_id.toString()) {
          console.log(`🔄 Updating chat ${chat.id} isActive from ${chat.isActive} to ${isActive}`);
          return {
            ...chat,
            isActive: isActive,
            status: isActive ? 'ai' : 'closed'
          };
        }
        return chat;
      }));
    }
  }, []);

  const sendMessage = useCallback((chatId: string, content: string) => {
    if (!isConnected) {
      console.warn('❌ WebSocket not connected. Cannot send message.');
      return;
    }

    if (!chatId) {
      console.warn('❌ No chat ID provided. Cannot send message.');
      return;
    }

    console.log('📤 SENDING MESSAGE to chat:', chatId, 'content:', content);
    console.log('🌐 WebSocket connection status:', isConnected);

    const messagePayload = {
      type: 'send_message',
      data: {
        conversation_id: chatId,
        content,
        sender: 'agent'
      }
    };

    console.log('📤 Sending message payload:', messagePayload);
    
    try {
      wsSendMessage(messagePayload);
      console.log('✅ Message sent successfully via WebSocket');
    } catch (error) {
      console.error('❌ Error sending message via WebSocket:', error);
      return;
    }
    
    // Optimistically add message to local state
    const tempMessage: Message = {
      id: `temp_${Date.now()}`,
      content,
      sender: 'agent',
      timestamp: formatInTimeZone(new Date(), 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm')
    };

    console.log('📝 Adding optimistic message to local state:', tempMessage);

    setMessages(prev => {
      const currentMessages = prev[chatId] || [];
      const updatedMessages = {
        ...prev,
        [chatId]: [...currentMessages, tempMessage]
      };
      console.log('📊 Updated messages state for chat:', chatId, updatedMessages[chatId]);
      return updatedMessages;
    });

    // Update chat last message
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        console.log('📝 Updating chat last message for:', chatId);
        return {
          ...chat,
          lastMessage: content,
          timestamp: tempMessage.timestamp
        };
      }
      return chat;
    }));
  }, [isConnected, wsSendMessage]);

  const transferToHuman = useCallback((chatId: string) => {
    if (!isConnected) {
      console.warn('WebSocket not connected. Cannot transfer to human.');
      return;
    }

    const transferPayload = {
      type: 'transfer_to_human',
      data: {
        conversation_id: chatId
      }
    };

    wsSendMessage(transferPayload);
  }, [isConnected, wsSendMessage]);

  const fetchMessages = useCallback((conversationId: string | number) => {
    console.log('🔍 FETCH MESSAGES CALLED for conversation:', conversationId);
    console.log('🌐 WebSocket connected:', isConnected);
    
    // Convert to string if it's a number
    const conversationIdStr = String(conversationId);
    
    // Validate conversation ID
    try {
      conversationIdSchema.parse(conversationId);
    } catch (error) {
      console.error('Invalid conversation ID:', error);
      return;
    }
    
    if (!isConnected) {
      console.warn('❌ WebSocket not connected. Cannot fetch messages.');
      return;
    }

    console.log('🔍 FETCHING MESSAGES for conversation:', conversationIdStr);
    
    const fetchPayload = {
      type: 'get_messages',
      data: {
        conversation_id: parseInt(conversationIdStr),
        limit: 50,
        offset: 0
      }
    };

    console.log('📤 Sending get_messages payload:', fetchPayload);
    wsSendMessage(fetchPayload);
  }, [isConnected, wsSendMessage]);

  const refreshConversations = useCallback(() => {
    if (!isConnected) {
      console.warn('WebSocket not connected. Cannot refresh conversations.');
      return;
    }

    const refreshPayload = {
      type: 'subscribe_conversations',
      data: {
        conversation_ids: [] // Empty array = all conversations
      }
    };

    wsSendMessage(refreshPayload);
  }, [isConnected, wsSendMessage]);

  const markAsRead = useCallback((chatId: string) => {
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          unreadCount: 0
        };
      }
      return chat;
    }));
  }, []);

  return {
    chats,
    messages,
    isConnected,
    sendMessage,
    transferToHuman,
    refreshConversations,
    fetchMessages,
    markAsRead
  };
};