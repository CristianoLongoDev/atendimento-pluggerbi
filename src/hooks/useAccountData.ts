import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthHeaders, API_BASE } from '@/lib/apiClient';

interface AccountData {
  id: string;
  name: string;
}

export const useAccountData = () => {
  const { user, profile } = useAuth();
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountData = async () => {
      if (!user || !profile?.account_id) {
        return;
      }

      setLoading(true);

      try {
        const headers = await getAuthHeaders();

        const response = await fetch(
          `${API_BASE}/accounts/${profile.account_id}`,
          { headers },
        );

        if (!response.ok) {
          throw new Error(`Erro ao buscar conta. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Resposta GET /accounts:', JSON.stringify(data));
        setAccountData({
          id: data.account?.id || profile.account_id,
          name: data.account?.name || 'Nome não encontrado',
        });
        setError(null);
      } catch (err: any) {
        console.error('Erro ao buscar dados da conta:', err);
        setError(err.message || 'Erro ao carregar dados da conta');
        setAccountData({ id: profile.account_id, name: profile.full_name });
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [user, profile?.account_id]);

  return { accountData, loading, error };
};