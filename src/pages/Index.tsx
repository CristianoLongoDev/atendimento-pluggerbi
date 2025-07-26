
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import ChatSidebar from '@/components/ChatSidebar';
import ChatList from '@/components/ChatList';
import ChatArea from '@/components/ChatArea';
import ChatInfo from '@/components/ChatInfo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus, Edit, Trash2 } from 'lucide-react';

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
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChatId, setSelectedChatId] = useState<string | null>('1');
  const [selectedSection, setSelectedSection] = useState('conversations');
  
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

  const mockChannels = [
    { id: '1', name: 'WhatsApp Business', botName: 'Bot Principal', status: 'Ativo', createdAt: '2024-01-10' },
    { id: '2', name: 'Instagram Direct', botName: 'Bot Social', status: 'Ativo', createdAt: '2024-02-15' },
    { id: '3', name: 'Facebook Messenger', botName: 'Bot Principal', status: 'Inativo', createdAt: '2024-03-01' },
  ];

  const handleSendMessage = (message: string) => {
    console.log('Sending message:', message);
    // Implement message sending logic
  };

  const handleTransferToHuman = () => {
    console.log('Transferring to human');
    // Implement transfer logic
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
                      <label className="text-sm font-medium">Nome da Conta</label>
                      <p className="text-lg mt-1">Empresa Exemplo Ltda</p>
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
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Incluir Novo
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nome Canal</TableHead>
                      <TableHead>Nome Bot</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data Criação</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockChannels.map((channel) => (
                      <TableRow key={channel.id}>
                        <TableCell>{channel.id}</TableCell>
                        <TableCell>{channel.name}</TableCell>
                        <TableCell>{channel.botName}</TableCell>
                        <TableCell>
                          <Badge variant={channel.status === 'Ativo' ? 'default' : 'secondary'}>
                            {channel.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{channel.createdAt}</TableCell>
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
