import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from '@/components/ui/sidebar';
import { User, MessageSquare, Bot, FileText, Shield, Plus } from 'lucide-react';

const Settings = () => {
  const { profile } = useAuth();
  const [activeSection, setActiveSection] = useState('minha-conta');

  const menuItems = [
    { id: 'minha-conta', title: 'Minha Conta', icon: User },
    { id: 'canais-atendimento', title: 'Canais Atendimento', icon: MessageSquare },
    { id: 'agentes-bots', title: 'Agentes Bots', icon: Bot },
    { id: 'prompts', title: 'Prompts', icon: FileText },
    { id: 'funcoes', title: 'Funções', icon: Shield },
  ];

  // Mock data - em produção virá do Supabase
  const mockUsers = [
    { id: '1', name: 'João Silva', email: 'joao@empresa.com', role: 'admin', createdAt: '2024-01-15' },
    { id: '2', name: 'Maria Santos', email: 'maria@empresa.com', role: 'agent', createdAt: '2024-01-20' },
  ];

  const mockChannels = [
    { id: '1', name: 'WhatsApp Principal', botName: 'Bot Vendas', status: 'Ativo', createdAt: '2024-01-10' },
    { id: '2', name: 'Instagram Direct', botName: 'Bot Suporte', status: 'Inativo', createdAt: '2024-01-12' },
  ];

  const renderMinhaContaSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Minha Conta</h2>
        <p className="text-muted-foreground">Gerencie as informações da sua conta e usuários</p>
      </div>

      <Tabs defaultValue="conta" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="conta">Conta</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="conta" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Conta</CardTitle>
              <CardDescription>Detalhes da sua conta empresarial</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Nome da Empresa</label>
                  <p className="text-lg text-muted-foreground mt-1">
                    {profile?.account_id ? 'Minha Empresa' : 'Carregando...'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Usuários</CardTitle>
                <CardDescription>Gerencie os usuários da sua conta</CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Usuário
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? 'Administrador' : 'Agente'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">Editar</Button>
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

  const renderCanaisAtendimentoSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Canais de Atendimento</h2>
          <p className="text-muted-foreground">Gerencie seus canais de comunicação</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Canal
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome do Canal</TableHead>
                <TableHead>Nome do Bot</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockChannels.map((channel) => (
                <TableRow key={channel.id}>
                  <TableCell className="font-mono">{channel.id}</TableCell>
                  <TableCell className="font-medium">{channel.name}</TableCell>
                  <TableCell>{channel.botName}</TableCell>
                  <TableCell>
                    <Badge variant={channel.status === 'Ativo' ? 'default' : 'secondary'}>
                      {channel.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(channel.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">Editar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderPlaceholderSection = (title: string, description: string) => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardContent className="flex items-center justify-center h-40">
          <p className="text-muted-foreground">Em desenvolvimento...</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'minha-conta':
        return renderMinhaContaSection();
      case 'canais-atendimento':
        return renderCanaisAtendimentoSection();
      case 'agentes-bots':
        return renderPlaceholderSection('Agentes Bots', 'Configure seus bots de atendimento');
      case 'prompts':
        return renderPlaceholderSection('Prompts', 'Gerencie os prompts dos seus bots');
      case 'funcoes':
        return renderPlaceholderSection('Funções', 'Configure funções e permissões');
      default:
        return renderMinhaContaSection();
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="w-64">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Configurações</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveSection(item.id)}
                        className={activeSection === item.id ? 'bg-accent text-accent-foreground' : ''}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Settings;