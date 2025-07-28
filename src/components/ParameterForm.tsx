import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFunctionParameters, FunctionParameter } from '@/hooks/useFunctionParameters';

interface ParameterFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parameter?: FunctionParameter | null;
  mode: 'create' | 'edit';
  botId: string;
  functionId: string;
  onSuccess: () => void;
}

const ParameterForm: React.FC<ParameterFormProps> = ({
  open,
  onOpenChange,
  parameter,
  mode,
  botId,
  functionId,
  onSuccess,
}) => {
  const { toast } = useToast();
  const { createParameter, updateParameter } = useFunctionParameters();
  
  const [formData, setFormData] = useState({
    parameter_id: '',
    name: '',
    type: 'string' as 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array',
    permited_values: '',
    default_value: '',
    format: '' as '' | 'email' | 'uri' | 'date' | 'date-time',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && parameter) {
      setFormData({
        parameter_id: parameter.parameter_id,
        name: parameter.name,
        type: parameter.type,
        permited_values: parameter.permited_values || '',
        default_value: parameter.default_value || '',
        format: parameter.format || '',
      });
    } else {
      setFormData({
        parameter_id: '',
        name: '',
        type: 'string',
        permited_values: '',
        default_value: '',
        format: '',
      });
    }
  }, [mode, parameter, open]);

  const generateParameterId = () => {
    return `param_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      
      const parameterData = {
        name: formData.name,
        type: formData.type,
        permited_values: formData.permited_values || undefined,
        default_value: formData.default_value || undefined,
        format: (formData.format as any) || undefined,
      };

      if (mode === 'create') {
        result = await createParameter(botId, functionId, {
          parameter_id: formData.parameter_id || generateParameterId(),
          ...parameterData,
        });
      } else {
        result = await updateParameter(botId, functionId, formData.parameter_id, parameterData);
      }

      if (result.success) {
        toast({
          title: "Sucesso",
          description: mode === 'create' ? "Parâmetro criado com sucesso!" : "Parâmetro atualizado com sucesso!",
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
        description: "Erro inesperado ao salvar parâmetro",
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
            {mode === 'create' ? 'Novo Parâmetro' : 'Editar Parâmetro'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parameter_id">ID do Parâmetro</Label>
              <Input
                id="parameter_id"
                value={formData.parameter_id}
                onChange={(e) => setFormData(prev => ({ ...prev, parameter_id: e.target.value }))}
                disabled={mode === 'edit'}
                placeholder="Será gerado automaticamente se vazio"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="ex: categoria"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="integer">Integer</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="object">Object</SelectItem>
                  <SelectItem value="array">Array</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Formato</Label>
              <Select 
                value={formData.format} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, format: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="uri">URI</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="date-time">Date-Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="permited_values">Valores Permitidos (JSON)</Label>
            <Textarea
              id="permited_values"
              value={formData.permited_values}
              onChange={(e) => setFormData(prev => ({ ...prev, permited_values: e.target.value }))}
              placeholder='ex: ["eletronicos", "roupas", "casa"]'
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="default_value">Valor Padrão</Label>
            <Input
              id="default_value"
              value={formData.default_value}
              onChange={(e) => setFormData(prev => ({ ...prev, default_value: e.target.value }))}
              placeholder="ex: eletronicos"
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

export default ParameterForm;