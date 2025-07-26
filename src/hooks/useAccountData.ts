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
    if (!profile?.account_id) {
      return;
    }

    const fetchAccountData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`https://atendimento.pluggerbi.com/accounts/${profile.account_id}`);
        
        if (!response.ok) {
          throw new Error('Erro ao buscar dados da conta');
        }
        
        const data = await response.json();
        setAccountData({
          id: profile.account_id,
          name: data.name || 'Nome da conta não encontrado'
        });
      } catch (err) {
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