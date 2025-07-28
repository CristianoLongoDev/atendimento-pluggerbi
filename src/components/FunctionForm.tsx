import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFunctions, BotFunction } from '@/hooks/useFunctions';

interface FunctionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  botFunction?: BotFunction | null;
  mode: 'create' | 'edit';
  botId: string;
  onSuccess: () => void;
}

const FunctionForm: React.FC<FunctionFormProps> = ({
  open,
  onOpenChange,
  botFunction,
  mode,
  botId,
  onSuccess,
}) => {
  const { toast } = useToast();
  const { createFunction, updateFunction } = useFunctions();
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && botFunction) {
      setFormData({
        id: botFunction.id,
        name: botFunction.name,
        description: botFunction.description || '',
      });
    } else {
      setFormData({
        id: '',
        name: '',
        description: '',
      });
    }
  }, [mode, botFunction, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      
      if (mode === 'create') {
        result = await createFunction(botId, {
          id: formData.id,
          name: formData.name,
          description: formData.description || undefined,
        });
      } else {
        result = await updateFunction(botId, formData.id, {
          name: formData.name,
          description: formData.description || undefined,
        });
      }

      if (result.success) {
        toast({
          title: "Sucesso",
          description: mode === 'create' ? "Função criada com sucesso!" : "Função atualizada com sucesso!",
        });
        onOpenChange(false);
        onSuccess();
      } else {
        toast({
          title: "Erro",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar função",
        variant: "destructive",
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
            {mode === 'create' ? 'Nova Função' : 'Editar Função'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id">ID da Função</Label>
            <Input
              id="id"
              value={formData.id}
              onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
              disabled={mode === 'edit'}
              required
              placeholder="ex: buscar_produto"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="ex: Buscar Produto"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o objetivo desta função..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : mode === 'create' ? 'Criar' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FunctionForm;