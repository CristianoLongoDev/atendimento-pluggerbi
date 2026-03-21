import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE } from '@/lib/apiClient';

interface SearchResult {
  conversation_id: number;
  contact_id: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  account_id: string;
  contact_name: string;
  contact_phone: string;
  account_name: string;
  total_messages: number;
  last_message_at: string;
  message_preview: string;
}

interface SearchResponse {
  success: boolean;
  data: {
    conversations: SearchResult[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      has_next: boolean;
    };
    search_info: {
      term: string;
      results_count: number;
    };
  };
  status: string;
}

export const useConversationSearch = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { session, profile } = useAuth();

  const searchConversations = async (searchTerm: string) => {
    if (!searchTerm.trim() || searchTerm.length < 3) {
      setError('Termo de busca deve ter pelo menos 3 caracteres');
      return;
    }

    if (!session?.access_token) {
      setError('Token de autenticação não encontrado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/conversations/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          search_term: searchTerm,
          limit: 50,
          offset: 0,
          account_id: profile?.account_id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();
      
      if (data.success) {
        setResults(data.data.conversations);
      } else {
        throw new Error('Erro na resposta da API');
      }
    } catch (err) {
      console.error('Erro na busca:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido na busca');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return {
    searchConversations,
    clearResults,
    results,
    loading,
    error,
  };
};