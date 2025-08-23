import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  full_name: string;
}

export const useUserProfiles = () => {
  const [userProfiles, setUserProfiles] = useState<{ [userId: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const fetchUserProfile = async (userId: string): Promise<string> => {
    // Verificar se já temos o perfil em cache
    if (userProfiles[userId]) {
      return userProfiles[userId];
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
        return 'Atendente';
      }

      const userName = data?.full_name || 'Atendente';
      
      // Salvar no cache
      setUserProfiles(prev => ({
        ...prev,
        [userId]: userName
      }));

      return userName;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return 'Atendente';
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId: string): string => {
    return userProfiles[userId] || 'Atendente';
  };

  return {
    fetchUserProfile,
    getUserName,
    loading
  };
};