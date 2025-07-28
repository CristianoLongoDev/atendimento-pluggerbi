import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Prompt, usePrompts } from '@/hooks/usePrompts';

interface PromptFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt?: Prompt | null;
  mode: 'create' | 'edit';
  botId: string;
  onSuccess?: () => void;
}

const PromptForm = ({ open, onOpenChange, prompt, mode, botId, onSuccess }: PromptFormProps) => {
  const { toast } = useToast();
  const { createPrompt, updatePrompt } = usePrompts();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    prompt: '',
    description: '',
    display_rule: 'first_contact'
  });

  useEffect(() => {
    if (mode === 'edit' && prompt) {
      setFormData({
        id: prompt.id || '',
        prompt: prompt.prompt || '',
        description: prompt.description || '',
        display_rule: (prompt as any).display_rule || 'first_contact'
      });
    } else if (mode === 'create') {
      setFormData({
        id: '',
        prompt: '',
        description: '',
        display_rule: 'first_contact'
      });
    }
  }, [mode, prompt, open]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.id.trim() || !formData.prompt.trim()) {
      toast({
        title: "Erro",
        description: "ID e prompt são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      let result;
      
      if (mode === 'create') {
        result = await createPrompt({
          bot_id: botId,
          id: formData.id.trim(),
          prompt: formData.prompt.trim(),
          description: formData.description.trim() || undefined,
          display_rule: formData.display_rule
        } as any);
      } else {
        result = await updatePrompt(botId, prompt!.id, {
          prompt: formData.prompt.trim(),
          description: formData.description.trim() || undefined,
          display_rule: formData.display_rule
        } as any);
      }

      if (result.success) {
        toast({
          title: "Sucesso",
          description: mode === 'create' ? "Prompt criado com sucesso!" : "Prompt atualizado com sucesso!",
        });
        onOpenChange(false);
        setFormData({
          id: '',
          prompt: '',
          description: '',
          display_rule: 'first_contact'
        });
        // Call onSuccess callback to refresh the list
        onSuccess?.();
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao processar solicitação",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado",
        variant: "destructive",
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
            {mode === 'create' ? 'Criar Novo Prompt' : 'Editar Prompt'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id">ID do Prompt</Label>
            <Input
              id="id"
              value={formData.id}
              onChange={(e) => handleInputChange('id', e.target.value)}
              placeholder="Digite o ID do prompt"
              disabled={mode === 'edit'}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descrição opcional do prompt"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_rule">Regra Exibição</Label>
            <Select value={formData.display_rule} onValueChange={(value) => handleInputChange('display_rule', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a regra de exibição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first_contact">Primeiro Contato</SelectItem>
                <SelectItem value="every_time">Sempre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              value={formData.prompt}
              onChange={(e) => handleInputChange('prompt', e.target.value)}
              placeholder="Digite o conteúdo do prompt"
              className="min-h-[200px]"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : mode === 'create' ? 'Criar Prompt' : 'Atualizar Prompt'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PromptForm;