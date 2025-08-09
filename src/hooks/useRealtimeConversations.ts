import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { validateAndSanitizeMessage, webSocketMessageSchema, conversationIdSchema, isValidUUID } from '@/lib/validation';

interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: 'customer' | 'ai' | 'agent';
  channel?: string;
}

interface Chat {
  id: string;
  customerName: string;
  customerAvatar?: string;
  lastMessage: string;
  timestamp: string;
  channel: 'whatsapp' | 'instagram' | 'facebook' | 'widget';
  status: 'ai' | 'human' | 'pending' | 'closed';
  unreadCount: number;
  isActive: boolean;
}

interface UseRealtimeConversationsReturn {
  chats: Chat[];
  messages: { [chatId: string]: Message[] };
  isConnected: boolean;
  sendMessage: (chatId: string, content: string) => void;
  transferToHuman: (chatId: string) => void;
  refreshConversations: () => void;
  fetchMessages: (conversationId: string | number) => void;
}

export const useRealtimeConversations = (): UseRealtimeConversationsReturn => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  
  const { isConnected, sendMessage: wsSendMessage, subscribe } = useWebSocket('wss://atendimento.pluggerbi.com/ws');

  // Subscribe to WebSocket messages
  useEffect(() => {
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
          handleMessagesResponse(message.data);
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

  const handleNewMessage = useCallback((messageData: any) => {
    console.log('🔔 NEW MESSAGE RECEIVED:', messageData);
    
    if (!messageData) {
      console.log('❌ No message data received');
      return;
    }

    const { conversation_id, message_id, content, sender, timestamp, channel } = messageData;

    // Add new message to the messages state
    setMessages(prev => ({
      ...prev,
      [conversation_id]: [
        ...(prev[conversation_id] || []),
        {
          id: message_id,
          content,
          sender: sender || 'customer',
          timestamp: new Date(timestamp).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          channel
        }
      ]
    }));

    // Update chat list with new last message
    setChats(prev => prev.map(chat => {
      if (chat.id === conversation_id) {
        return {
          ...chat,
          lastMessage: content,
          timestamp: new Date(timestamp).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          unreadCount: chat.unreadCount + 1,
          status: sender === 'customer' ? 'pending' : chat.status
        };
      }
      return chat;
    }));
  }, []);

  const handleSubscriptionUpdate = useCallback((data: any) => {
    console.log('Processing subscription update:', data);
    
    if (data.conversations) {
      // Log each conversation to see channel data
      data.conversations.forEach((conv: any, index: number) => {
        console.log(`📋 CONVERSA ${index + 1}:`, {
          id: conv.id,
          channel: conv.channel,
          channel_type: conv.channel_type,
          contact_name: conv.contact_name,
          last_message: conv.last_message
        });
      });
      
      // Update chats list - mapping status_attendance to our status
      const updatedChats = data.conversations.map((conv: any) => ({
        id: conv.id,
        customerName: conv.contact_name || `Cliente ${conv.id}`,
        lastMessage: conv.last_message || 'Sem mensagens',
        timestamp: conv.last_message_time ? 
          new Date(conv.last_message_time).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }) : '',
        channel: (() => {
          const channelValue = conv.channel_type || conv.channel;
          return (channelValue === 'whatsapp' || channelValue === 'instagram' || channelValue === 'facebook' || channelValue === 'widget') 
            ? channelValue : 'widget';
        })(),
        status: (() => {
          if (conv.status_attendance === 'bot') return 'ai';
          if (conv.status_attendance === 'human') return 'human';
          if (conv.status_attendance === 'pending') return 'pending';
          return 'pending';
        })(),
        unreadCount: conv.unread_count || 0,
        isActive: conv.status === 'active'
      }));
      
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
          content: msg.message_text || msg.content,
          sender: msg.sender === 'user' ? 'customer' : msg.sender,
          timestamp: new Date(msg.timestamp).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          channel: msg.channel
        });
      });

      setMessages(prev => ({
        ...prev,
        ...messagesByConversation
      }));
    }
  }, []);

  const handleMessagesResponse = useCallback((data: any) => {
    console.log('Processing messages response:', data);
    
    if (data.conversation_id && data.data && data.data.messages) {
      const conversationMessages = data.data.messages.map((msg: any) => ({
        id: msg.id,
        content: msg.message_text,
        sender: msg.sender === 'user' ? 'customer' : msg.sender,
        timestamp: new Date(msg.timestamp).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        channel: msg.channel
      }));

      setMessages(prev => ({
        ...prev,
        [data.conversation_id]: conversationMessages
      }));
    }
  }, []);

  const sendMessage = useCallback((chatId: string, content: string) => {
    if (!isConnected) {
      console.warn('WebSocket not connected. Cannot send message.');
      return;
    }

    console.log('📤 SENDING MESSAGE to chat:', chatId, 'content:', content);

    const messagePayload = {
      type: 'send_message',
      data: {
        conversation_id: chatId,
        content,
        sender: 'agent'
      }
    };

    console.log('📤 Sending message payload:', messagePayload);
    wsSendMessage(messagePayload);
    
    // Optimistically add message to local state
    const tempMessage: Message = {
      id: `temp_${Date.now()}`,
      content,
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), tempMessage]
    }));

    // Update chat last message
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
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
        conversation_id: conversationIdStr
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
      data: {}
    };

    wsSendMessage(refreshPayload);
  }, [isConnected, wsSendMessage]);

  return {
    chats,
    messages,
    isConnected,
    sendMessage,
    transferToHuman,
    refreshConversations,
    fetchMessages
  };
};