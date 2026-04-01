import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadNotifications(); }, []);

  async function loadNotifications() {
    setLoading(true);
    const { data } = await supabase
      .from('notifications' as any)
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    setNotifications((data as any[]) || []);
    setLoading(false);
  }

  async function markAllRead() {
    await supabase
      .from('notifications' as any)
      .update({ is_read: true })
      .eq('user_id', user?.id)
      .eq('is_read', false);
    setNotifications((n) => n.map((x) => ({ ...x, is_read: true })));
  }

  async function deleteNotification(id: string) {
    await supabase.from('notifications' as any).delete().eq('id', id);
    setNotifications((n) => n.filter((x) => x.id !== id));
  }

  const unread = notifications.filter((n) => !n.is_read).length;

  const typeIcon = (type: string) => {
    const colors: Record<string, string> = {
      lead: 'bg-blue-100 text-blue-600',
      visit: 'bg-orange-100 text-orange-600',
      task: 'bg-purple-100 text-purple-600',
      system: 'bg-gray-100 text-gray-600',
    };
    return colors[type] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notificações</h1>
          {unread > 0 && <p className="text-sm text-muted-foreground">{unread} não lida{unread > 1 ? 's' : ''}</p>}
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4 mr-1" /> Marcar todas como lidas
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={n.is_read ? 'opacity-70' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg mt-0.5 ${typeIcon(n.type)}`}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{n.title}</p>
                      {!n.is_read && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    {n.message && <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(n.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {n.link && (
                      <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate(n.link)}>
                        Ver
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteNotification(n.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
