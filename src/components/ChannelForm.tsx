import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Channel } from '@/hooks/useChannels';

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
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'whatsapp',
    name: '',
    botAgent: '',
    config: '{\n  "phone_number": "+55"\n}'
  });

  // Update form data when channel changes
  useEffect(() => {
    if (mode === 'edit' && channel) {
      setFormData({
        type: channel.type || 'whatsapp',
        name: channel.name || '',
        botAgent: channel.config?.bot_agent || '',
        config: channel.config ? JSON.stringify(channel.config, null, 2) : '{\n  "phone_number": "+55"\n}'
      });
    } else if (mode === 'create') {
      setFormData({
        type: 'whatsapp',
        name: '',
        botAgent: '',
        config: '{\n  "phone_number": "+55"\n}'
      });
    }
  }, [channel, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.botAgent) {
        toast({
          title: "Erro",
          description: "Agente Bot é obrigatório",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Validate JSON config
      let configObj;
      try {
        configObj = JSON.parse(formData.config);
      } catch (err) {
        toast({
          title: "Erro",
          description: "Configuração deve ser um JSON válido",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Add bot_agent to config
      configObj.bot_agent = formData.botAgent;

      const channelData = {
        type: formData.type,
        name: formData.name,
        config: configObj
      };

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
          config: '{\n  "phone_number": "+55"\n}'
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
            >
              <SelectTrigger>
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
            <Label htmlFor="botAgent">Agente Bot *</Label>
            <Select
              value={formData.botAgent}
              onValueChange={(value) => setFormData(prev => ({ ...prev, botAgent: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o agente bot" />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                <SelectItem value="bot-principal">Bot Principal</SelectItem>
                <SelectItem value="bot-vendas">Bot Vendas</SelectItem>
                <SelectItem value="bot-suporte">Bot Suporte</SelectItem>
                <SelectItem value="bot-social">Bot Social</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="config">Configuração (JSON)</Label>
            <Textarea
              id="config"
              value={formData.config}
              onChange={(e) => setFormData(prev => ({ ...prev, config: e.target.value }))}
              placeholder="Configuração em formato JSON"
              className="h-32 font-mono text-sm"
              required
            />
          </div>

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