import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

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

    const fetchAccountData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const url = `https://atendimento.pluggerbi.com/accounts/${profile.account_id}`;
        console.log('useAccountData - Fetching from URL:', url);
        
        const response = await fetch(url);
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
      } catch (err) {
        console.error('useAccountData - Error:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setAccountData({
          id: profile.account_id,
          name: 'Erro ao carregar nome da conta'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [profile?.account_id]);

  return { accountData, loading, error };
};