import React from 'react';
import { cn } from '@/lib/utils';
import { TicketReplyDTO } from '@/lib/api';
import { Check, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export type MessageStatus = 'sent' | 'sending' | 'failed';

interface MessageBubbleProps {
  reply: TicketReplyDTO;
  status?: MessageStatus;
  isCurrentUser?: boolean; // If true, aligns right and uses brand color
  onRetry?: () => void;
}

export function MessageBubble({ reply, status = 'sent', isCurrentUser = false, onRetry }: MessageBubbleProps) {
  const alignClass = isCurrentUser ? "justify-end" : "justify-start";
  const bubbleClass = isCurrentUser 
    ? "bg-primary text-primary-foreground rounded-tr-none" 
    : "bg-muted text-foreground rounded-tl-none";

  const initials = reply.user?.name?.substring(0, 2).toUpperCase() || 'U';

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={cn("flex w-full mb-6", alignClass)}>
      
      {!isCurrentUser && (
        <Avatar className="w-8 h-8 mr-3 mt-1 shrink-0">
          <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex flex-col max-w-[80%]", isCurrentUser ? "items-end" : "items-start")}>
        <div className="flex items-baseline gap-2 mb-1 px-1">
          <span className="text-sm font-semibold text-foreground">
            {isCurrentUser ? "You" : reply.user?.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTime(reply.createdAt)}
          </span>
        </div>

        <div className={cn("px-4 py-3 rounded-2xl shadow-sm text-sm whitespace-pre-wrap leading-relaxed", bubbleClass)}>
          {reply.message}
        </div>

        {/* Optimistic Status Indicators */}
        {isCurrentUser && status !== 'sent' && (
          <div className="mt-1.5 flex items-center gap-1.5 px-1">
            {status === 'sending' && (
              <>
                <Clock className="w-3.5 h-3.5 text-muted-foreground animate-pulse" />
                <span className="text-xs text-muted-foreground font-medium">Sending...</span>
              </>
            )}
            
            {status === 'failed' && (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                <span className="text-xs text-destructive font-medium">Failed to send</span>
                {onRetry && (
                  <button 
                    onClick={onRetry}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 ml-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry
                  </button>
                )}
              </>
            )}
          </div>
        )}
        
        {isCurrentUser && status === 'sent' && (
          <div className="mt-1 flex items-center gap-1 px-1">
            <Check className="w-3.5 h-3.5 text-success" />
            <span className="text-xs text-muted-foreground">Sent</span>
          </div>
        )}
      </div>

    </div>
  );
}
