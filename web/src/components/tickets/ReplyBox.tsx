"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReplyBoxProps {
  onSend: (message: string, isInternal: boolean, file?: File) => void;
  isSending: boolean;
  userRole?: string;
  className?: string;
}

export function ReplyBox({ onSend, isSending, userRole, className }: ReplyBoxProps) {
  const [text, setText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && !selectedFile) return;
    if (isSending) return;
    onSend(trimmed, isInternal, selectedFile || undefined);
    setText("");
    setIsInternal(false);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit.");
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  return (
    <div className={cn("p-4 bg-card border-t border-border sticky bottom-0", className)}>
      <div className="relative border border-input bg-background rounded-lg focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 transition-all overflow-hidden shadow-sm">
        {selectedFile && (
          <div className="px-3 pt-3 pb-1 flex items-center gap-2">
            <div className="flex items-center gap-2 bg-muted px-2 py-1 rounded-md text-xs font-medium text-muted-foreground border border-border">
              <span className="truncate max-w-[200px]">{selectedFile.name}</span>
              <button 
                type="button" 
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-muted-foreground hover:text-foreground hover:bg-background rounded-full p-0.5"
              >
                &times;
              </button>
            </div>
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
          placeholder="Type your reply here..."
          className={cn(
            "w-full min-h-[80px] max-h-[200px] resize-none px-3 pb-12 bg-transparent outline-none text-sm placeholder:text-muted-foreground disabled:opacity-50",
            selectedFile ? "pt-1" : "pt-3"
          )}
        />
        
        <div className="absolute bottom-2 right-2 flex items-center justify-between left-3">
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/gif,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={() => fileInputRef.current?.click()}
              className="w-8 h-8 p-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted" 
              title="Attach file" 
              aria-label="Attach file"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            

          </div>
          
          <Button 
            onClick={handleSend}
            disabled={(!text.trim() && !selectedFile) || isSending}
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
