import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Bot } from '@/hooks/useBots';

interface BotFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (botData: Omit<Bot, 'id'> | { id: string } & Partial<Bot>) => Promise<{ success: boolean; error?: string }>;
  bot?: Bot | null;
  mode: 'create' | 'edit';
}

export const BotForm: React.FC<BotFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  bot,
  mode
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'suporte',
    system_prompt: ''
  });

  // Update form data when bot changes
  useEffect(() => {
    if (mode === 'edit' && bot) {
      setFormData({
        name: bot.name || '',
        type: bot.type || 'suporte',
        system_prompt: bot.system_prompt || ''
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        type: 'suporte',
        system_prompt: ''
      });
    }
  }, [bot, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.system_prompt) {
        toast({
          title: "Erro",
          description: "Nome e System Prompt são obrigatórios",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const botData = {
        name: formData.name,
        type: formData.type,
        system_prompt: formData.system_prompt
      };

      let result;
      if (mode === 'edit' && bot) {
        result = await onSubmit({ id: bot.id, ...botData });
      } else {
        result = await onSubmit(botData);
      }

      if (result.success) {
        toast({
          title: "Sucesso",
          description: mode === 'edit' ? "Bot atualizado com sucesso" : "Bot criado com sucesso"
        });
        onOpenChange(false);
        setFormData({
          name: '',
          type: 'suporte',
          system_prompt: ''
        });
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao salvar bot",
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Editar Bot' : 'Novo Bot'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome do bot"
              required
            />
          </div>

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
                <SelectItem value="suporte">Suporte Integração Movidesk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="system_prompt">System Prompt *</Label>
            <Textarea
              id="system_prompt"
              value={formData.system_prompt}
              onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
              placeholder="Defina as instruções e comportamento do bot..."
              className="h-40"
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