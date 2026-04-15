import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BROKER_NAV_ITEMS, BROKER_SECONDARY_NAV } from '@/lib/broker-nav';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, LogOut, ChevronRight, Menu } from 'lucide-react';

function BrokerSidebarContent() {
  const { profile, roles } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/parceiro') return location.pathname === '/parceiro';
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-card">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
        {!collapsed && (
          <Link to="/parceiro" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">LI</span>
            </div>
            <span className="font-semibold text-foreground text-sm">Portal Parceiro</span>
          </Link>
        )}
        {collapsed && (
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
            <span className="text-primary-foreground font-bold text-sm">LI</span>
          </div>
        )}
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Comercial</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {BROKER_NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={isActive(item.path)} tooltip={item.title}>
                    <Link to={item.path}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Conta</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {BROKER_SECONDARY_NAV.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={isActive(item.path)} tooltip={item.title}>
                    <Link to={item.path}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-3">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {(profile?.full_name || 'C').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {profile?.full_name || 'Corretor'}
              </p>
              <p className="text-xs text-muted-foreground">Parceiro</p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

function BrokerHeader() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 gap-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger>
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
        <nav className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
          <Link to="/parceiro" className="hover:text-foreground transition-colors">Parceiro</Link>
          {breadcrumbs.map((bc, i) => (
            <span key={i} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">{bc.label}</span>
            </span>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/parceiro/notificacoes')}>
          <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {(profile?.full_name || 'C').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate('/parceiro/perfil')}>Meu Perfil</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function getBreadcrumbs(pathname: string) {
  const map: Record<string, { label: string }[]> = {
    '/parceiro': [],
    '/parceiro/leads': [{ label: 'Leads' }],
    '/parceiro/imoveis': [{ label: 'Imóveis' }],
    '/parceiro/visitas': [{ label: 'Visitas' }],
    '/parceiro/propostas': [{ label: 'Propostas' }],
    '/parceiro/comissoes': [{ label: 'Comissões' }],
    '/parceiro/perfil': [{ label: 'Meu Perfil' }],
    '/parceiro/notificacoes': [{ label: 'Notificações' }],
  };
  return map[pathname] || [];
}

export default function BrokerLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <BrokerSidebarContent />
        <div className="flex-1 flex flex-col min-w-0">
          <BrokerHeader />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
