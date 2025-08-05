import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

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
}

export const useRealtimeConversations = (): UseRealtimeConversationsReturn => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  
  const { isConnected, sendMessage: wsSendMessage, subscribe } = useWebSocket('wss://atendimento.pluggerbi.com/ws');

  // Subscribe to WebSocket messages
  useEffect(() => {
    const unsubscribe = subscribe((message) => {
      switch (message.type) {
        case 'new_message':
          handleNewMessage(message.data);
          break;
        case 'subscription_updated':
          handleSubscriptionUpdate(message.data);
          break;
        default:
          break;
      }
    });

    return unsubscribe;
  }, [subscribe]);

  const handleNewMessage = useCallback((messageData: any) => {
    console.log('Processing new message:', messageData);
    
    if (!messageData) return;

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
      // Update chats list
      const updatedChats = data.conversations.map((conv: any) => ({
        id: conv.id,
        customerName: conv.customer_name || `Cliente ${conv.id}`,
        lastMessage: conv.last_message || 'Sem mensagens',
        timestamp: conv.last_message_timestamp ? 
          new Date(conv.last_message_timestamp).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }) : '',
        channel: (conv.channel === 'whatsapp' || conv.channel === 'instagram' || conv.channel === 'facebook' || conv.channel === 'widget') 
          ? conv.channel : 'widget',
        status: (conv.status === 'ai' || conv.status === 'human' || conv.status === 'pending' || conv.status === 'closed') 
          ? conv.status : 'pending',
        unreadCount: conv.unread_count || 0,
        isActive: conv.is_active || false
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
          content: msg.content,
          sender: msg.sender || 'customer',
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

  const sendMessage = useCallback((chatId: string, content: string) => {
    if (!isConnected) {
      console.warn('WebSocket not connected. Cannot send message.');
      return;
    }

    const messagePayload = {
      type: 'send_message',
      data: {
        conversation_id: chatId,
        content,
        sender: 'agent'
      }
    };

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
    refreshConversations
  };
};