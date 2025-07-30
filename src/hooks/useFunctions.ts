import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BotFunction {
  bot_id: string;
  function_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface CreateFunctionData {
  function_id: string;
  description?: string;
  rule_display?: string;
}

interface UpdateFunctionData {
  description?: string;
  rule_display?: string;
}

export const useFunctions = () => {
  const [functions, setFunctions] = useState<BotFunction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchFunctions = async (botId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`https://atendimento.pluggerbi.com/bots/${botId}/functions`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setFunctions(data.functions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar funções');
      setFunctions([]);
    } finally {
      setLoading(false);
    }
  };

  const createFunction = async (botId: string, functionData: CreateFunctionData) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`https://atendimento.pluggerbi.com/bots/${botId}/functions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(functionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data: data.function };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Erro ao criar função' 
      };
    }
  };

  const updateFunction = async (botId: string, functionId: string, functionData: UpdateFunctionData) => {
    try {
      const headers = await getAuthHeaders();
      console.log('updateFunction - Headers:', headers);
      console.log('updateFunction - URL:', `https://atendimento.pluggerbi.com/bots/${botId}/functions/${functionId}`);
      console.log('updateFunction - Body:', JSON.stringify(functionData));
      
      const response = await fetch(`https://atendimento.pluggerbi.com/bots/${botId}/functions/${functionId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(functionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data: data.function };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Erro ao atualizar função' 
      };
    }
  };

  const deleteFunction = async (botId: string, functionId: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`https://atendimento.pluggerbi.com/bots/${botId}/functions/${functionId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Erro ao excluir função' 
      };
    }
  };

  return {
    functions,
    loading,
    error,
    fetchFunctions,
    createFunction,
    updateFunction,
    deleteFunction,
  };
};