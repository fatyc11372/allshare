import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { supabase } from '../supabase';
import { toast } from 'sonner';
import { Send } from 'lucide-react';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  currentUser: any;
}

export function MessageModal({ isOpen, onClose, request, currentUser }: MessageModalProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!request) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('request_id', request.id)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  useEffect(() => {
    if (isOpen && request) {
      fetchMessages();
      // 即時監聽新訊息
      const channel = supabase
        .channel('messages-' + request.id)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `request_id=eq.${request.id}`,
        }, (payload) => {
          setMessages(prev => [...prev, payload.new]);
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [isOpen, request]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !currentUser) return;
    setLoading(true);
    const { error } = await supabase.from('messages').insert({
      request_id: request.id,
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      sender_avatar: currentUser.avatar,
      content: newMessage.trim(),
    });
    setLoading(false);
    if (error) {
      toast.error('發送失敗');
      return;
    }
    setNewMessage('');
  };

  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            關於「{request.items?.title}」的訊息
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-[400px]">
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            <div className="space-y-4 p-2">
              {messages.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8">
                  還沒有訊息，開始對話吧！
                </p>
              )}
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-2 ${msg.sender_id === currentUser.id ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={msg.sender_avatar} />
                    <AvatarFallback>{msg.sender_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className={`max-w-[70%] ${msg.sender_id === currentUser.id ? 'items-end' : 'items-start'} flex flex-col`}>
                    <span className="text-xs text-muted-foreground mb-1">{msg.sender_name}</span>
                    <div className={`rounded-lg px-3 py-2 text-sm ${msg.sender_id === currentUser.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {msg.content}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      {new Date(msg.created_at).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex items-center space-x-2 pt-4 border-t mt-2">
            <Input
              placeholder="輸入訊息..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            />
            <Button size="sm" onClick={handleSend} disabled={loading || !newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}