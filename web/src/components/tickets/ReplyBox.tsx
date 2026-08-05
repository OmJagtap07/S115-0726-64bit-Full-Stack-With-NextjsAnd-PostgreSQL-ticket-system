"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReplyBoxProps {
  onSend: (message: string, isInternal: boolean) => void;
  isSending: boolean;
  userRole?: string;
  className?: string;
}

export function ReplyBox({ onSend, isSending, userRole, className }: ReplyBoxProps) {
  const [text, setText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    onSend(trimmed, isInternal);
    setText("");
    setIsInternal(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("p-4 bg-card border-t border-border sticky bottom-0", className)}>
      <div className="relative border border-input bg-background rounded-lg focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 transition-all overflow-hidden shadow-sm">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
          placeholder="Type your reply here... (Ctrl/Cmd + Enter to send)"
          className="w-full min-h-[80px] max-h-[200px] resize-none p-3 pb-12 bg-transparent outline-none text-sm placeholder:text-muted-foreground disabled:opacity-50"
        />
        
        <div className="absolute bottom-2 right-2 flex items-center justify-between left-3">
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted" title="Attach file" aria-label="Attach file">
              <Paperclip className="w-4 h-4" />
            </Button>
            
            {(userRole === 'ADMIN' || userRole === 'AGENT') && (
              <label className="flex items-center gap-1.5 ml-2 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors select-none">
                <input 
                  type="checkbox" 
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <span className={isInternal ? "text-amber-600 font-semibold" : ""}>Internal Note</span>
              </label>
            )}

            <div className="text-xs text-muted-foreground font-medium hidden sm:block ml-2">
              <span className="opacity-75">Tip:</span> Press <kbd className="px-1.5 py-0.5 mx-0.5 bg-muted rounded border border-border">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 mx-0.5 bg-muted rounded border border-border">Enter</kbd> to send
            </div>
          </div>
          
          <Button 
            onClick={handleSend}
            disabled={!text.trim() || isSending}
            size="sm"
            className="ml-auto h-8 px-4 gap-1.5 font-semibold"
          >
            {isSending ? "Sending..." : (
              <>
                Send <Send className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
