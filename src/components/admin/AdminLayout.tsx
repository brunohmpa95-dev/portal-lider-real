import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_NAV_SECTIONS, ADMIN_SECONDARY_NAV, filterNavByRoles, filterSectionsByRoles } from '@/lib/admin-nav';
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
import { Bell, LogOut, ChevronRight, Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

function AdminSidebarContent() {
  const { roles, profile } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const sections = filterSectionsByRoles(ADMIN_NAV_SECTIONS, roles);
  const secondaryItems = filterNavByRoles(ADMIN_SECONDARY_NAV, roles);

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-card">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
        {!collapsed && (
          <Link to="/admin" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">LI</span>
            </div>
            <span className="font-semibold text-foreground text-sm">Líder Admin</span>
          </Link>
        )}
        {collapsed && (
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
            <span className="text-primary-foreground font-bold text-sm">LI</span>
          </div>
        )}
      </div>

      <SidebarContent>
        {sections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.path)}
                      tooltip={item.title}
                    >
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
        ))}

        <SidebarGroup>
          <SidebarGroupLabel>Conta</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                    tooltip={item.title}
                  >
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
                {(profile?.full_name || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {profile?.full_name || 'Usuário'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {roles[0] || 'sem perfil'}
              </p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

function AdminHeader() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const breadcrumbs = getBreadcrumbs(location.pathname);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 gap-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger>
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
        <nav className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
          <Link to="/admin" className="hover:text-foreground transition-colors">
            Admin
          </Link>
          {breadcrumbs.map((bc, i) => (
            <span key={i} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3" />
              {bc.path ? (
                <Link to={bc.path} className="hover:text-foreground transition-colors">
                  {bc.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{bc.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:block relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="pl-9 h-9 w-56 bg-muted/50"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => navigate('/admin/notifications')}
        >
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {(profile?.full_name || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate('/admin/profile')}>
              Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function getBreadcrumbs(pathname: string) {
  const map: Record<string, { label: string; path?: string }[]> = {
    '/admin': [],
    '/admin/leads': [{ label: 'Leads' }],
    '/admin/leads/new': [{ label: 'Leads', path: '/admin/leads' }, { label: 'Novo Lead' }],
    '/admin/properties': [{ label: 'Imóveis' }],
    '/admin/properties/new': [{ label: 'Imóveis', path: '/admin/properties' }, { label: 'Novo Imóvel' }],
    '/admin/clientes': [{ label: 'Clientes' }],
    '/admin/corretores': [{ label: 'Corretores' }],
    '/admin/contratos': [{ label: 'Contratos' }],
    '/admin/documentos': [{ label: 'Documentos' }],
    '/admin/tickets': [{ label: 'Chamados' }],
    '/admin/financeiro': [{ label: 'Financeiro' }],
    '/admin/auditoria': [{ label: 'Auditoria' }],
    '/admin/agenda': [{ label: 'Agenda' }],
    '/admin/team': [{ label: 'Equipe' }],
    '/admin/partners': [{ label: 'Parceiros' }],
    '/admin/reports': [{ label: 'Relatórios' }],
    '/admin/settings': [{ label: 'Configurações' }],
    '/admin/profile': [{ label: 'Meu Perfil' }],
    '/admin/notifications': [{ label: 'Notificações' }],
  };

  if (map[pathname]) return map[pathname];

  if (pathname.startsWith('/admin/leads/') && pathname !== '/admin/leads/new') {
    return [{ label: 'Leads', path: '/admin/leads' }, { label: 'Detalhe do Lead' }];
  }
  if (pathname.startsWith('/admin/properties/') && pathname !== '/admin/properties/new') {
    return [{ label: 'Imóveis', path: '/admin/properties' }, { label: 'Detalhe do Imóvel' }];
  }
  return [];
}

export default function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AdminSidebarContent />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
