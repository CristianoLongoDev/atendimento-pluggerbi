import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Channel } from '@/hooks/useChannels';
import { useBots } from '@/hooks/useBots';

interface ChannelFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (channelData: Omit<Channel, 'id'> | { id: string } & Partial<Channel>) => Promise<{ success: boolean; error?: string }>;
  channel?: Channel | null;
  mode: 'create' | 'edit';
}

export const ChannelForm: React.FC<ChannelFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  channel,
  mode
}) => {
  const { toast } = useToast();
  const { bots, fetchBots, error: botsError } = useBots();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'whatsapp',
    name: '',
    botAgent: '',
    status: 1,
    whatsappPhone: ''
  });

  // Fetch bots when component opens
  useEffect(() => {
    if (open) {
      fetchBots();
    }
  }, [open, fetchBots]);

  // Update form data when channel changes
  useEffect(() => {
    console.log('ChannelForm - useEffect triggered:', { mode, channel, open });
    
    if (mode === 'edit' && channel) {
      console.log('ChannelForm - Channel data for edit:', {
        id: channel.id,
        type: channel.type,
        name: channel.name,
        bot_id: channel.bot_id,
        active: channel.active,
        whatsapp_phone_number: (channel as any).whatsapp_phone_number
      });
      
      setFormData({
        type: channel.type || 'whatsapp',
        name: channel.name || '',
        botAgent: channel.bot_id || '',
        status: channel.active ? 1 : 0,
        whatsappPhone: (channel as any).whatsapp_phone_number || ''
      });
    } else if (mode === 'create') {
      setFormData({
        type: 'whatsapp',
        name: '',
        botAgent: '',
        status: 1,
        whatsappPhone: ''
      });
    }
  }, [channel, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Bot is optional if bots API is not available
      if (!formData.botAgent && !botsError) {
        toast({
          title: "Erro",
          description: "Agente Bot é obrigatório",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Validate WhatsApp phone number if type is whatsapp
      if (formData.type === 'whatsapp' && !formData.whatsappPhone) {
        toast({
          title: "Erro",
          description: "Telefone Remetente é obrigatório para WhatsApp",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const channelData: any = {
        type: formData.type,
        name: formData.name,
        bot_id: formData.botAgent,
        active: formData.status === 1
      };

      // Add whatsapp_phone_number only for WhatsApp type
      if (formData.type === 'whatsapp') {
        channelData.whatsapp_phone_number = formData.whatsappPhone;
      }

      let result;
      if (mode === 'edit' && channel) {
        result = await onSubmit({ id: channel.id, ...channelData });
      } else {
        result = await onSubmit(channelData);
      }

      if (result.success) {
        toast({
          title: "Sucesso",
          description: mode === 'edit' ? "Canal atualizado com sucesso" : "Canal criado com sucesso"
        });
        onOpenChange(false);
        setFormData({
          type: 'whatsapp',
          name: '',
          botAgent: '',
          status: 1,
          whatsappPhone: ''
        });
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao salvar canal",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro inesperado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Editar Canal' : 'Novo Canal'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              disabled={mode === 'edit'}
            >
              <SelectTrigger className={mode === 'edit' ? 'opacity-50 cursor-not-allowed' : ''}>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome do canal"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="botAgent">Agente Bot {!botsError && '*'}</Label>
            <Select
              value={formData.botAgent}
              onValueChange={(value) => setFormData(prev => ({ ...prev, botAgent: value }))}
              disabled={loading || (bots.length === 0 && !botsError)}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  botsError 
                    ? "Bots indisponíveis (opcional)" 
                    : bots.length === 0 
                    ? "Carregando bots..." 
                    : "Selecione o agente bot"
                } />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                {bots.map((bot) => (
                  <SelectItem key={bot.id} value={bot.id}>
                    {bot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {botsError && (
              <p className="text-sm text-muted-foreground">Bots indisponíveis no momento. Você pode criar o canal e associar um bot depois.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                <SelectItem value="1">Ativo</SelectItem>
                <SelectItem value="0">Desabilitado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type === 'whatsapp' && (
            <div className="space-y-2">
              <Label htmlFor="whatsappPhone">Telefone Remetente *</Label>
              <Input
                id="whatsappPhone"
                value={formData.whatsappPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsappPhone: e.target.value }))}
                placeholder="5511999999999"
                required
              />
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : (mode === 'edit' ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};