
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Settings, 
  User, 
  Search,
  Moon,
  Sun
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Header: React.FC = () => {
  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ChatHub
          </h1>
        </div>
        
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Online
        </Badge>
      </div>

      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar em todas as conversas..."
            className="pl-10 bg-muted/50 border-0 focus:bg-background"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center p-0"
          >
            3
          </Badge>
        </Button>
        
        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
        
        <Button variant="ghost" size="sm">
          <Sun className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center space-x-2 ml-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src="" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p className="font-medium">Admin</p>
            <p className="text-xs text-muted-foreground">Atendente</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
