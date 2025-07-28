import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Prompt {
  bot_id: string;
  id: string;
  prompt: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export const usePrompts = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
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

  const fetchPrompts = async (botId: string) => {
    console.log('fetchPrompts - Starting to fetch prompts for bot:', botId);
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`https://atendimento.pluggerbi.com/bots/${botId}/prompts`, {
        headers
      });
      
      console.log('fetchPrompts - Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar prompts. Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('fetchPrompts - Response data:', data);
      setPrompts(data.prompts || []);
    } catch (err) {
      console.error('Error fetching prompts:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const createPrompt = async (promptData: Omit<Prompt, 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`https://atendimento.pluggerbi.com/bots/${promptData.bot_id}/prompts`, {
        method: 'POST',
        headers,
        body: JSON.stringify(promptData)
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao criar prompt. Status: ${response.status}`);
      }
      
      await fetchPrompts(promptData.bot_id); // Refresh the list
      return { success: true };
    } catch (err) {
      console.error('Error creating prompt:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    } finally {
      setLoading(false);
    }
  };

  const updatePrompt = async (botId: string, promptId: string, promptData: Partial<Prompt>) => {
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      console.log('updatePrompt - Request data:', {
        botId,
        promptId,
        promptData,
        url: `https://atendimento.pluggerbi.com/bots/${botId}/prompts/${promptId}`
      });
      
      const response = await fetch(`https://atendimento.pluggerbi.com/bots/${botId}/prompts/${promptId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(promptData)
      });
      
      console.log('updatePrompt - Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('updatePrompt - Error response:', errorText);
        throw new Error(`Erro ao atualizar prompt. Status: ${response.status}`);
      }
      
      await fetchPrompts(botId); // Refresh the list
      return { success: true };
    } catch (err) {
      console.error('Error updating prompt:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    } finally {
      setLoading(false);
    }
  };

  const deletePrompt = async (botId: string, promptId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`https://atendimento.pluggerbi.com/bots/${botId}/prompts/${promptId}`, {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao excluir prompt. Status: ${response.status}`);
      }
      
      await fetchPrompts(botId); // Refresh the list
      return { success: true };
    } catch (err) {
      console.error('Error deleting prompt:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' };
    } finally {
      setLoading(false);
    }
  };

  return {
    prompts,
    loading,
    error,
    fetchPrompts,
    createPrompt,
    updatePrompt,
    deletePrompt
  };
};