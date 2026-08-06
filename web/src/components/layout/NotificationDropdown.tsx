import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api, NotificationDTO } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function NotificationDropdown() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = React.useState(false);

  // Poll for unread count every 30 seconds
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () => api.notifications.getUnreadCount(),
    refetchInterval: 30000,
  });

  // Fetch full notification list when dropdown is open
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.notifications.list(),
    enabled: isOpen,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => api.notifications.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.notifications.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  const handleNotificationClick = (notification: NotificationDTO) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    setIsOpen(false);
    router.push(`/dashboard/tickets/${notification.ticketId}`);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative text-muted-foreground hover:text-foreground rounded-full"
        onClick={handleToggle}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-1 text-xs text-primary"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                Mark all as read
              </Button>
            )}
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    className={cn(
                      "flex flex-col text-left p-3 border-b border-border/50 hover:bg-muted/50 transition-colors last:border-0",
                      !notif.isRead && "bg-primary/5"
                    )}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        {!notif.isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {notif.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {notif.message}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Backdrop for closing dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
