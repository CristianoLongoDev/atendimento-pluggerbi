import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useFunctions, BotFunction } from '@/hooks/useFunctions';
import { useFunctionParameters, FunctionParameter } from '@/hooks/useFunctionParameters';
import { Plus, Edit, Trash2, X } from 'lucide-react';

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
  const { fetchParameters, createParameter, updateParameter, deleteParameter, parameters } = useFunctionParameters();
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [localParameters, setLocalParameters] = useState<FunctionParameter[]>([]);
  const [showParameterForm, setShowParameterForm] = useState(false);
  const [editingParameterId, setEditingParameterId] = useState<string | null>(null);
  const [parameterForm, setParameterForm] = useState({
    parameter_id: '',
    name: '',
    type: 'string' as 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array',
    permited_values: '',
    default_value: '',
    format: '' as '' | 'email' | 'uri' | 'date' | 'date-time',
  });

  useEffect(() => {
    if (mode === 'edit' && botFunction) {
      setFormData({
        id: botFunction.id,
        name: botFunction.name,
        description: botFunction.description || '',
      });
      // Load parameters for existing function
      loadParameters(botFunction.id);
    } else {
      setFormData({
        id: '',
        name: '',
        description: '',
      });
      setLocalParameters([]);
    }
    setShowParameterForm(false);
    setEditingParameterId(null);
    resetParameterForm();
  }, [mode, botFunction, open]);

  // Update local parameters when parameters from hook change
  useEffect(() => {
    if (mode === 'edit' && parameters.length > 0) {
      setLocalParameters(parameters);
    }
  }, [parameters, mode]);

  const loadParameters = async (functionId: string) => {
    try {
      await fetchParameters(botId, functionId);
    } catch (error) {
      console.error('Error loading parameters:', error);
    }
  };

  const resetParameterForm = () => {
    setParameterForm({
      parameter_id: '',
      name: '',
      type: 'string',
      permited_values: '',
      default_value: '',
      format: '',
    });
  };

  const generateParameterId = () => {
    return `param_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleAddParameter = () => {
    setEditingParameterId(null);
    resetParameterForm();
    setShowParameterForm(true);
  };

  const handleEditParameter = (parameter: FunctionParameter) => {
    setParameterForm({
      parameter_id: parameter.parameter_id,
      name: parameter.name,
      type: parameter.type,
      permited_values: parameter.permited_values || '',
      default_value: parameter.default_value || '',
      format: parameter.format || '',
    });
    setEditingParameterId(parameter.parameter_id);
    setShowParameterForm(true);
  };

  const handleCancelParameter = () => {
    setShowParameterForm(false);
    setEditingParameterId(null);
    resetParameterForm();
  };

  const handleSaveParameter = async () => {
    if (!formData.id && mode === 'create') {
      // If creating a new function, just add to local state
      const newParameter: FunctionParameter = {
        function_id: formData.id,
        parameter_id: parameterForm.parameter_id || generateParameterId(),
        name: parameterForm.name,
        type: parameterForm.type,
        permited_values: parameterForm.permited_values || undefined,
        default_value: parameterForm.default_value || undefined,
        format: parameterForm.format || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (editingParameterId) {
        setLocalParameters(prev => prev.map(p => 
          p.parameter_id === editingParameterId ? newParameter : p
        ));
      } else {
        setLocalParameters(prev => [...prev, newParameter]);
      }

      setShowParameterForm(false);
      setEditingParameterId(null);
      resetParameterForm();
      return;
    }

    // For existing functions, save to API
    try {
      let result;
      const parameterData = {
        name: parameterForm.name,
        type: parameterForm.type,
        permited_values: parameterForm.permited_values || undefined,
        default_value: parameterForm.default_value || undefined,
        format: parameterForm.format || undefined,
      };

      if (editingParameterId) {
        result = await updateParameter(botId, formData.id, editingParameterId, parameterData);
      } else {
        result = await createParameter(botId, formData.id, {
          parameter_id: parameterForm.parameter_id || generateParameterId(),
          ...parameterData,
        });
      }

      if (result.success) {
        toast({
          title: "Sucesso",
          description: editingParameterId ? "Parâmetro atualizado!" : "Parâmetro criado!",
        });
        loadParameters(formData.id);
        setShowParameterForm(false);
        setEditingParameterId(null);
        resetParameterForm();
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
    }
  };

  const handleDeleteParameter = async (parameterId: string) => {
    if (!formData.id && mode === 'create') {
      // If creating a new function, just remove from local state
      setLocalParameters(prev => prev.filter(p => p.parameter_id !== parameterId));
      return;
    }

    try {
      const result = await deleteParameter(botId, formData.id, parameterId);
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Parâmetro excluído!",
        });
        loadParameters(formData.id);
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
        description: "Erro inesperado ao excluir parâmetro",
        variant: "destructive",
      });
    }
  };

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
        
        // If function was created successfully and we have local parameters, create them
        if (result.success && localParameters.length > 0) {
          for (const param of localParameters) {
            await createParameter(botId, formData.id, {
              parameter_id: param.parameter_id,
              name: param.name,
              type: param.type,
              permited_values: param.permited_values,
              default_value: param.default_value,
              format: param.format,
            });
          }
        }
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

  const displayParameters = mode === 'edit' ? localParameters : localParameters;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nova Função' : 'Editar Função'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
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
          </div>

          <Separator />

          {/* Parameters Section */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Parâmetros da Função</CardTitle>
                <Button type="button" onClick={handleAddParameter} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Incluir Parâmetro
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Parameter Form */}
              {showParameterForm && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm">
                        {editingParameterId ? 'Editar Parâmetro' : 'Novo Parâmetro'}
                      </CardTitle>
                      <Button type="button" variant="ghost" size="sm" onClick={handleCancelParameter}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>ID do Parâmetro</Label>
                        <Input
                          value={parameterForm.parameter_id}
                          onChange={(e) => setParameterForm(prev => ({ ...prev, parameter_id: e.target.value }))}
                          disabled={!!editingParameterId}
                          placeholder="Será gerado automaticamente se vazio"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input
                          value={parameterForm.name}
                          onChange={(e) => setParameterForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                          placeholder="ex: categoria"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select 
                          value={parameterForm.type} 
                          onValueChange={(value) => setParameterForm(prev => ({ ...prev, type: value as any }))}
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
                        <Label>Formato</Label>
                        <Select 
                          value={parameterForm.format || "none"} 
                          onValueChange={(value) => setParameterForm(prev => ({ 
                            ...prev, 
                            format: value === "none" ? "" : value as any 
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Nenhum" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhum</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="uri">URI</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="date-time">Date-Time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Valores Permitidos (JSON)</Label>
                      <Textarea
                        value={parameterForm.permited_values}
                        onChange={(e) => setParameterForm(prev => ({ ...prev, permited_values: e.target.value }))}
                        placeholder='ex: ["eletronicos", "roupas", "casa"]'
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Valor Padrão</Label>
                      <Input
                        value={parameterForm.default_value}
                        onChange={(e) => setParameterForm(prev => ({ ...prev, default_value: e.target.value }))}
                        placeholder="ex: eletronicos"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={handleCancelParameter}>
                        Cancelar
                      </Button>
                      <Button type="button" onClick={handleSaveParameter}>
                        Salvar Parâmetro
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Parameters List */}
              {displayParameters.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Parâmetros Cadastrados</h4>
                  {displayParameters.map((param) => (
                    <div key={param.parameter_id} className="p-3 border rounded-lg bg-muted/30">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium">{param.name}</h5>
                            <Badge variant="secondary">{param.type}</Badge>
                            {param.format && (
                              <Badge variant="outline">{param.format}</Badge>
                            )}
                          </div>
                          {param.default_value && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Padrão: {param.default_value}
                            </p>
                          )}
                          {param.permited_values && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Valores: {param.permited_values}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditParameter(param)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteParameter(param.parameter_id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {displayParameters.length === 0 && !showParameterForm && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum parâmetro cadastrado</p>
                  <p className="text-sm">Clique em "Incluir Parâmetro" para adicionar</p>
                </div>
              )}
            </CardContent>
          </Card>

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