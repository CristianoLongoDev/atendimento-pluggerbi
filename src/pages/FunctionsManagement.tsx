import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useBots } from '@/hooks/useBots';
import { useFunctions, BotFunction } from '@/hooks/useFunctions';
import { useFunctionParameters, FunctionParameter } from '@/hooks/useFunctionParameters';
import FunctionForm from '@/components/FunctionForm';
import ParameterForm from '@/components/ParameterForm';
import PageHeader from '@/components/PageHeader';
import { Plus, MoreHorizontal, Edit, Trash2, Settings } from 'lucide-react';

const FunctionsManagement = () => {
  const { toast } = useToast();
  const { bots, fetchBots, loading: botsLoading } = useBots();
  const { functions, loading: functionsLoading, error, fetchFunctions, deleteFunction } = useFunctions();
  const { parameters, loading: parametersLoading, fetchParameters, deleteParameter } = useFunctionParameters();
  
  const [selectedBotId, setSelectedBotId] = useState<string>('');
  const [selectedFunctionId, setSelectedFunctionId] = useState<string>('');
  const [functionFormOpen, setFunctionFormOpen] = useState(false);
  const [parameterFormOpen, setParameterFormOpen] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState<BotFunction | null>(null);
  const [selectedParameter, setSelectedParameter] = useState<FunctionParameter | null>(null);
  const [functionFormMode, setFunctionFormMode] = useState<'create' | 'edit'>('create');
  const [parameterFormMode, setParameterFormMode] = useState<'create' | 'edit'>('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogType, setDeleteDialogType] = useState<'function' | 'parameter'>('function');
  const [itemToDelete, setItemToDelete] = useState<BotFunction | FunctionParameter | null>(null);

  useEffect(() => {
    fetchBots();
  }, []);

  // Auto-select first bot when bots are loaded
  useEffect(() => {
    if (bots.length > 0 && !selectedBotId) {
      setSelectedBotId(bots[0].id);
    }
  }, [bots, selectedBotId]);

  useEffect(() => {
    if (selectedBotId) {
      fetchFunctions(selectedBotId);
      setSelectedFunctionId('');
    }
  }, [selectedBotId]);

  useEffect(() => {
    if (selectedBotId && selectedFunctionId) {
      fetchParameters(selectedBotId, selectedFunctionId);
    }
  }, [selectedBotId, selectedFunctionId]);

  const handleBotSelect = (botId: string) => {
    setSelectedBotId(botId);
  };

  const handleFunctionSelect = (functionId: string) => {
    setSelectedFunctionId(functionId);
  };

  const handleCreateFunction = () => {
    if (!selectedBotId) {
      toast({
        title: "Erro",
        description: "Selecione um bot primeiro",
        variant: "destructive",
      });
      return;
    }
    setSelectedFunction(null);
    setFunctionFormMode('create');
    setFunctionFormOpen(true);
  };

  const handleEditFunction = (func: BotFunction) => {
    setSelectedFunction(func);
    setFunctionFormMode('edit');
    setFunctionFormOpen(true);
  };

  const handleCreateParameter = () => {
    if (!selectedFunctionId) {
      toast({
        title: "Erro",
        description: "Selecione uma função primeiro",
        variant: "destructive",
      });
      return;
    }
    setSelectedParameter(null);
    setParameterFormMode('create');
    setParameterFormOpen(true);
  };

  const handleEditParameter = (param: FunctionParameter) => {
    setSelectedParameter(param);
    setParameterFormMode('edit');
    setParameterFormOpen(true);
  };

  const handleDeleteClick = (item: BotFunction | FunctionParameter, type: 'function' | 'parameter') => {
    setItemToDelete(item);
    setDeleteDialogType(type);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    let result;
    
    if (deleteDialogType === 'function') {
      const func = itemToDelete as BotFunction;
      result = await deleteFunction(selectedBotId, func.id);
    } else {
      const param = itemToDelete as FunctionParameter;
      result = await deleteParameter(selectedBotId, selectedFunctionId, param.parameter_id);
    }
    
    if (result.success) {
      toast({
        title: "Sucesso",
        description: `${deleteDialogType === 'function' ? 'Função' : 'Parâmetro'} excluído com sucesso!`,
      });
      
      if (deleteDialogType === 'function') {
        fetchFunctions(selectedBotId);
        setSelectedFunctionId('');
      } else {
        fetchParameters(selectedBotId, selectedFunctionId);
      }
    } else {
      toast({
        title: "Erro",
        description: result.error || `Erro ao excluir ${deleteDialogType === 'function' ? 'função' : 'parâmetro'}`,
        variant: "destructive",
      });
    }
    
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  if (botsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Gerenciar Funções" 
        description="Configure e gerencie as funções disponíveis para seus bots de atendimento" 
      />

      <Card>
        <CardHeader>
          <CardTitle>Seleção de Bot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-sm">
            <Select value={selectedBotId} onValueChange={handleBotSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um bot" />
              </SelectTrigger>
              <SelectContent>
                {bots.map((bot) => (
                  <SelectItem key={bot.id} value={bot.id}>
                    {bot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedBotId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Functions Panel */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Funções do Bot</CardTitle>
                {functions.length > 0 && (
                  <Button onClick={handleCreateFunction} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Nova Função
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {functionsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Erro ao carregar funções: {error}</p>
                  <Button onClick={() => fetchFunctions(selectedBotId)} variant="outline">
                    Tentar novamente
                  </Button>
                </div>
              ) : functions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Nenhuma função encontrada para este bot.</p>
                  <Button onClick={handleCreateFunction}>
                    Criar primeira função
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {functions.map((func) => (
                    <div 
                      key={func.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedFunctionId === func.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => handleFunctionSelect(func.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{func.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {func.description || 'Sem descrição'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            ID: {func.id}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditFunction(func)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(func, 'function')}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Parameters Panel */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  Parâmetros da Função
                  {selectedFunctionId && (
                    <Badge variant="outline" className="ml-2">
                      {functions.find(f => f.id === selectedFunctionId)?.name}
                    </Badge>
                  )}
                </CardTitle>
                {selectedFunctionId && parameters.length > 0 && (
                  <Button onClick={handleCreateParameter} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Parâmetro
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedFunctionId ? (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Selecione uma função para ver seus parâmetros</p>
                </div>
              ) : parametersLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : parameters.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Nenhum parâmetro encontrado para esta função.</p>
                  <Button onClick={handleCreateParameter}>
                    Criar primeiro parâmetro
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {parameters.map((param) => (
                    <div key={param.parameter_id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{param.name}</h4>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditParameter(param)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(param, 'parameter')}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <FunctionForm
        open={functionFormOpen}
        onOpenChange={setFunctionFormOpen}
        botFunction={selectedFunction}
        mode={functionFormMode}
        botId={selectedBotId}
        onSuccess={() => fetchFunctions(selectedBotId)}
      />

      <ParameterForm
        open={parameterFormOpen}
        onOpenChange={setParameterFormOpen}
        parameter={selectedParameter}
        mode={parameterFormMode}
        botId={selectedBotId}
        functionId={selectedFunctionId}
        onSuccess={() => fetchParameters(selectedBotId, selectedFunctionId)}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {deleteDialogType === 'function' ? 'esta função' : 'este parâmetro'}? 
              {deleteDialogType === 'function' && ' Todos os parâmetros da função também serão excluídos.'}
              {' '}Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FunctionsManagement;