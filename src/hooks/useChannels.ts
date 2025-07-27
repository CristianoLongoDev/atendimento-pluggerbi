import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Channel {
  id: string;
  type: string;
  name: string;
  config: Record<string, any>;
  active?: number;
  created_at?: string;
  updated_at?: string;
}

export const useChannels = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Token de acesso não encontrado');
    }
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchChannels = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('https://atendimento.pluggerbi.com/channels', {
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar canais. Status: ${response.status}`);
      }
      
      const data = await response.json();
      setChannels(data.channels || []);
    } catch (err) {
      console.error('Error fetching channels:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const createChannel = async (channelData: Omit<Channel, 'id'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('https://atendimento.pluggerbi.com/channels', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id: crypto.randomUUID(),
          ...channelData
        })
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao criar canal. Status: ${response.status}`);
      }
      
      await fetchChannels(); // Refresh the list
      return { success: true };
    } catch (err) {
      console.error('Error creating channel:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    } finally {
      setLoading(false);
    }
  };

  const updateChannel = async (id: string, channelData: Partial<Channel>) => {
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`https://atendimento.pluggerbi.com/channels/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(channelData)
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao atualizar canal. Status: ${response.status}`);
      }
      
      await fetchChannels(); // Refresh the list
      return { success: true };
    } catch (err) {
      console.error('Error updating channel:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    } finally {
      setLoading(false);
    }
  };

  const deleteChannel = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`https://atendimento.pluggerbi.com/channels/${id}`, {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao excluir canal. Status: ${response.status}`);
      }
      
      await fetchChannels(); // Refresh the list
      return { success: true };
    } catch (err) {
      console.error('Error deleting channel:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  return {
    channels,
    loading,
    error,
    fetchChannels,
    createChannel,
    updateChannel,
    deleteChannel
  };
};