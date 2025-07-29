import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AccountData {
  id: string;
  name: string;
}

export const useAccountData = () => {
  const { profile } = useAuth();
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useAccountData - profile:', profile);
    console.log('useAccountData - account_id:', profile?.account_id);
    
    if (!profile?.account_id) {
      console.log('useAccountData - No account_id found');
      return;
    }

    const fetchAccountDataInternal = async (retryCount = 0) => {
      console.log('useAccountData - Starting fetch, retry:', retryCount);
      setLoading(true);
      setError(null);
      
      try {
        // Obter o token de acesso atual
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('Token de acesso não encontrado');
        }

        const url = `https://atendimento.pluggerbi.com/accounts/${profile.account_id}`;
        console.log('useAccountData - Fetching from URL:', url);
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        console.log('useAccountData - Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Erro ao buscar dados da conta. Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('useAccountData - Response data:', data);
        
        setAccountData({
          id: profile.account_id,
          name: data.account?.name || 'Nome da conta não encontrado'
        });
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('useAccountData - Error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        
        // Retry up to 2 times for network errors
        if (retryCount < 2 && (errorMessage.includes('Failed to fetch') || errorMessage.includes('timeout'))) {
          console.log(`Retrying fetchAccountData in 2 seconds... (attempt ${retryCount + 1}/2)`);
          setTimeout(() => fetchAccountDataInternal(retryCount + 1), 2000);
          return;
        }
        
        setError(errorMessage);
        setAccountData({
          id: profile.account_id,
          name: 'Erro ao carregar nome da conta'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAccountDataInternal();
  }, [profile?.account_id]);

  return { accountData, loading, error };
};