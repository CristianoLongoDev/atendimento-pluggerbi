
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAccountData } from '@/hooks/useAccountData';
import { useChannels } from '@/hooks/useChannels';
import Header from '@/components/Header';
import ChatSidebar from '@/components/ChatSidebar';
import ChatList from '@/components/ChatList';
import ChatArea from '@/components/ChatArea';
import ChatInfo from '@/components/ChatInfo';
import { ChannelForm } from '@/components/ChannelForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Plus, Edit, Trash2, MoreHorizontal } from 'lucide-react';

// Mock data
const mockChats = [
  {
    id: '1',
    customerName: 'Maria Silva',
    customerAvatar: '',
    lastMessage: 'Preciso de ajuda com meu pedido',
    timestamp: '14:32',
    channel: 'whatsapp' as const,
    status: 'ai' as const,
    unreadCount: 2,
    isActive: true,
  },
  {
    id: '2',
    customerName: 'João Santos',
    customerAvatar: '',
    lastMessage: 'Quando será feita a entrega?',
    timestamp: '14:15',
    channel: 'instagram' as const,
    status: 'human' as const,
    unreadCount: 0,
    isActive: false,
  },
  {
    id: '3',
    customerName: 'Ana Costa',
    customerAvatar: '',
    lastMessage: 'Gostaria de cancelar minha assinatura',
    timestamp: '13:45',
    channel: 'facebook' as const,
    status: 'ai' as const,
    unreadCount: 1,
    isActive: false,
  },
  {
    id: '4',
    customerName: 'Pedro Oliveira',
    customerAvatar: '',
    lastMessage: 'Como faço para trocar um produto?',
    timestamp: '13:20',
    channel: 'widget' as const,
    status: 'pending' as const,
    unreadCount: 3,
    isActive: false,
  },
];

const mockMessages = [
  {
    id: '1',
    content: 'Olá! Preciso de ajuda com meu pedido',
    timestamp: '14:30',
    sender: 'customer' as const,
  },
  {
    id: '2',
    content: 'Olá Maria! Sou a IA assistente da empresa. Em que posso ajudá-la com seu pedido?',
    timestamp: '14:30',
    sender: 'ai' as const,
  },
  {
    id: '3',
    content: 'Meu pedido não chegou e já passou do prazo',
    timestamp: '14:31',
    sender: 'customer' as const,
  },
  {
    id: '4',
    content: 'Entendo sua preocupação. Vou verificar o status do seu pedido. Poderia me informar o número do pedido?',
    timestamp: '14:31',
    sender: 'ai' as const,
  },
  {
    id: '5',
    content: 'É o pedido #12345',
    timestamp: '14:32',
    sender: 'customer' as const,
  },
];

const Index = () => {
  const { profile, isAdmin } = useAuth();
  const { accountData, loading: accountLoading } = useAccountData();
  const { channels, loading: channelsLoading, createChannel, updateChannel, deleteChannel } = useChannels();
  const { toast } = useToast();
  
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChatId, setSelectedChatId] = useState<string | null>('1');
  const [selectedSection, setSelectedSection] = useState('conversations');
  
  // Channel management states
  const [isChannelFormOpen, setIsChannelFormOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState(null);
  const [channelFormMode, setChannelFormMode] = useState<'create' | 'edit'>('create');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<string | null>(null);
  
  const selectedChat = mockChats.find(chat => chat.id === selectedChatId);
  
  const filteredChats = mockChats.filter(chat => {
    const matchesFilter = selectedFilter === 'all' || chat.status === selectedFilter;
    const matchesSearch = chat.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Mock data for settings sections
  const mockUsers = [
    { id: '1', name: 'Admin User', email: 'admin@empresa.com', role: 'Administrador', status: 'Ativo', createdAt: '2024-01-15' },
    { id: '2', name: 'Agent User', email: 'agent@empresa.com', role: 'Agente', status: 'Ativo', createdAt: '2024-02-20' },
  ];

  const handleSendMessage = (message: string) => {
    console.log('Sending message:', message);
    // Implement message sending logic
  };

  const handleTransferToHuman = () => {
    console.log('Transferring to human');
    // Implement transfer logic
  };

  // Channel management handlers
  const handleCreateChannel = () => {
    setChannelFormMode('create');
    setEditingChannel(null);
    setIsChannelFormOpen(true);
  };

  const handleEditChannel = (channel: any) => {
    setChannelFormMode('edit');
    setEditingChannel(channel);
    setIsChannelFormOpen(true);
  };

  const handleDeleteChannel = (channelId: string) => {
    setChannelToDelete(channelId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteChannel = async () => {
    if (channelToDelete) {
      const result = await deleteChannel(channelToDelete);
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Canal excluído com sucesso"
        });
      } else {
        toast({
          title: "Erro",
          description: result.error || "Erro ao excluir canal",
          variant: "destructive"
        });
      }
    }
    setIsDeleteDialogOpen(false);
    setChannelToDelete(null);
  };

  const handleChannelSubmit = async (channelData: any) => {
    if (channelFormMode === 'edit' && editingChannel) {
      return await updateChannel(channelData.id, channelData);
    } else {
      return await createChannel(channelData);
    }
  };

  const renderMainContent = () => {
    switch (selectedSection) {
      case 'conversations':
        return (
          <>
            <div className="w-80 border-r border-border bg-card overflow-y-auto">
              <div className="p-4 border-b border-border">
                <h3 className="font-medium text-sm text-muted-foreground mb-3">
                  CONVERSAS ATIVAS ({filteredChats.length})
                </h3>
              </div>
              <div className="p-2">
                <ChatList
                  chats={filteredChats}
                  selectedChatId={selectedChatId}
                  onChatSelect={setSelectedChatId}
                />
              </div>
            </div>

            <ChatArea
              selectedChat={selectedChat}
              messages={mockMessages}
              onSendMessage={handleSendMessage}
              onTransferToHuman={handleTransferToHuman}
            />

            <ChatInfo selectedChat={selectedChat} />
          </>
        );

      case 'account':
        return (
          <div className="flex-1 p-6">
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="account">Conta</TabsTrigger>
                <TabsTrigger value="users">Usuários</TabsTrigger>
              </TabsList>
              <TabsContent value="account" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações da Conta</CardTitle>
                    <CardDescription>
                      Informações gerais da sua conta
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">ID da Conta</label>
                      {accountLoading ? (
                        <Skeleton className="h-6 w-48 mt-1" />
                      ) : (
                        <p className="text-lg mt-1 font-mono">{accountData?.id || 'Não informado'}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Nome da Conta</label>
                      {accountLoading ? (
                        <Skeleton className="h-6 w-64 mt-1" />
                      ) : (
                        <p className="text-lg mt-1">{accountData?.name || 'Nome não disponível'}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="users" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Usuários</h3>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Usuário
                  </Button>
                </div>
                
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Função</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data Criação</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>
                              <Badge variant={user.status === 'Ativo' ? 'default' : 'secondary'}>
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{user.createdAt}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        );

      case 'channels':
        return (
          <div className="flex-1 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Canais de Atendimento</h3>
              <Button onClick={handleCreateChannel}>
                <Plus className="w-4 h-4 mr-2" />
                Incluir Novo
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0">
                {channelsLoading ? (
                  <div className="p-6">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ) : (
                  <Table>
                     <TableHeader>
                       <TableRow>
                         <TableHead>ID</TableHead>
                         <TableHead>Nome</TableHead>
                         <TableHead>Tipo</TableHead>
                         <TableHead>Agente Bot</TableHead>
                         <TableHead>Status</TableHead>
                         <TableHead>Configuração</TableHead>
                         <TableHead>Data Criação</TableHead>
                         <TableHead>Ações</TableHead>
                       </TableRow>
                     </TableHeader>
                    <TableBody>
                       {channels.length === 0 ? (
                         <TableRow>
                           <TableCell colSpan={8} className="text-center text-muted-foreground">
                             Nenhum canal encontrado
                           </TableCell>
                         </TableRow>
                       ) : (
                         channels.map((channel) => (
                          <TableRow key={channel.id}>
                            <TableCell className="font-mono text-xs">
                              {channel.id.substring(0, 8)}...
                            </TableCell>
                            <TableCell>{channel.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {channel.type}
                              </Badge>
                            </TableCell>
                             <TableCell>
                               <Badge variant="secondary">
                                 {channel.config?.bot_agent || 'Não definido'}
                               </Badge>
                             </TableCell>
                             <TableCell>
                               <Badge variant={channel.status === 1 ? "default" : "destructive"}>
                                 {channel.status === 1 ? 'Ativo' : 'Desabilitado'}
                               </Badge>
                             </TableCell>
                             <TableCell className="max-w-32">
                              <code className="text-xs bg-muted p-1 rounded truncate block">
                                {JSON.stringify(channel.config).substring(0, 30)}...
                              </code>
                            </TableCell>
                            <TableCell>
                              {channel.created_at ? new Date(channel.created_at).toLocaleDateString('pt-BR') : '-'}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-background border z-50">
                                  <DropdownMenuItem onClick={() => handleEditChannel(channel)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Alterar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteChannel(channel.id)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <ChannelForm
              open={isChannelFormOpen}
              onOpenChange={setIsChannelFormOpen}
              onSubmit={handleChannelSubmit}
              channel={editingChannel}
              mode={channelFormMode}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir este canal? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={confirmDeleteChannel}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );

      case 'agents':
        return (
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Agentes Bots</h3>
              <p className="text-muted-foreground">Funcionalidade em desenvolvimento</p>
            </div>
          </div>
        );

      case 'prompts':
        return (
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Prompts</h3>
              <p className="text-muted-foreground">Funcionalidade em desenvolvimento</p>
            </div>
          </div>
        );

      case 'roles':
        return (
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Funções</h3>
              <p className="text-muted-foreground">Funcionalidade em desenvolvimento</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <ChatSidebar
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedSection={selectedSection}
          onSectionChange={setSelectedSection}
        />
        
        {renderMainContent()}
      </div>
    </div>
  );
};

export default Index;
