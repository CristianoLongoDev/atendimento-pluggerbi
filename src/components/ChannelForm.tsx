import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
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
    type: channel?.type || 'whatsapp',
    name: channel?.name || '',
    config: channel?.config ? JSON.stringify(channel.config, null, 2) : '{\n  "phone_number": "+55"\n}'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
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