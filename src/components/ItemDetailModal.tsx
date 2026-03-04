import { useState } from 'react';
import { MapPin, Star, Calendar, Edit, Trash2 } from 'lucide-react';
import { EditItemModal } from './EditItemModal';
import type { Item } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { CATEGORIES } from '../data/constants';
import { supabase } from '../supabase';
import { toast } from 'sonner';

interface ItemDetailModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  onBooking: (itemId: string, message: string) => void;
  currentUser?: any;
  onItemUpdated?: () => void;
}

export function ItemDetailModal({ item, isOpen, onClose, onBooking, currentUser, onItemUpdated }: ItemDetailModalProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!item) return null;

  const category = CATEGORIES.find((c) => c.id === item.category);
  const isOwner = currentUser && currentUser.id === item.owner.id;

  const handleBooking = () => {
    onBooking(item.id, message);
    setMessage('');
    onClose();
  };

  const handleToggleAvailable = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('items')
      .update({ available: !item.available })
      .eq('id', item.id);
    setLoading(false);
    if (error) {
      toast.error('更新失敗：' + error.message);
      return;
    }
    toast.success(item.available ? '物品已下架' : '物品已重新上架');
    onItemUpdated?.();
    onClose();
  };

  const handleDelete = async () => {
    if (!confirm('確定要刪除這個物品嗎？')) return;
    setLoading(true);
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', item.id);
    setLoading(false);
    if (error) {
      toast.error('刪除失敗：' + error.message);
      return;
    }
    toast.success('物品已刪除');
    onItemUpdated?.();
    onClose();
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <ImageWithFallback
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-64 object-cover rounded-lg"
          />
          <div className="flex items-center space-x-2">
            {category && (
              <Badge variant="outline">{category.icon} {category.name}</Badge>
            )}
            <Badge variant={item.available ? 'default' : 'secondary'}>
              {item.available ? '可借用' : '已下架/借出中'}
            </Badge>
          </div>

          <p className="text-muted-foreground">{item.description}</p>

          {item.features.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">物品特色</h4>
              <div className="flex flex-wrap gap-2">
                {item.features.map((feature, index) => (
                  <Badge key={index} variant="secondary">{feature}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{item.location}</span>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">物品主人</h4>
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={item.owner.avatar} />
                <AvatarFallback>{item.owner.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{item.owner.name}</p>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-muted-foreground">
                    {item.owner.rating} ({item.owner.reviewCount} 則評價)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 物品主人看到的操作按鈕 */}
          {isOwner && (
            <div className="border rounded-lg p-4 bg-muted/30">
              <h4 className="font-semibold mb-3">管理物品</h4>
              <div className="flex flex-col space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsEditOpen(true)}
                  disabled={loading}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  編輯物品
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleToggleAvailable}
                  disabled={loading}
                >
                  {item.available ? '下架物品' : '重新上架'}
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleDelete}
                  disabled={loading}
                >  
                  <Trash2 className="w-4 h-4 mr-2" />
                  刪除物品
                </Button>
              </div>
            </div>
          )}

          {/* 非物品主人看到的借用表單 */}
          {!isOwner && item.available && (
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3">發送借用請求</h4>
              <Textarea
                placeholder="告訴物品主人您想借用的原因和時間..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mb-3"
              />
              <Button onClick={handleBooking} className="w-full">
                發送借用請求
              </Button>
            </div>
          )}

          {!isOwner && !item.available && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <p className="text-center text-muted-foreground">此物品目前無法借用</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
    <EditItemModal
      item={item}
      isOpen={isEditOpen}
      onClose={() => setIsEditOpen(false)}
      onUpdated={() => { onItemUpdated?.(); onClose(); }}
    />  
    </>
  );
}