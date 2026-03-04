import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CATEGORIES } from '../data/constants';
import { supabase } from '../supabase';
import { toast } from 'sonner';
import type { Item } from '../types';

interface EditItemModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditItemModal({ item, isOpen, onClose, onUpdated }: EditItemModalProps) {
  const [title, setTitle] = useState(item?.title || '');
  const [description, setDescription] = useState(item?.description || '');
  const [category, setCategory] = useState(item?.category || '');
  const [location, setLocation] = useState(item?.location || '');
  const [features, setFeatures] = useState(item?.features.join(', ') || '');
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const handleSave = async () => {
    if (!title || !description || !category || !location) {
      toast.error('請填寫所有必要欄位');
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from('items')
      .update({
        title,
        description,
        category,
        location,
        features: features.split(',').map(f => f.trim()).filter(Boolean),
      })
      .eq('id', item.id);
    setLoading(false);
    if (error) {
      toast.error('更新失敗：' + error.message);
      return;
    }
    toast.success('物品已更新！');
    onUpdated();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>編輯物品</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>物品名稱</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>物品描述</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>分類</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="選擇分類" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>地點</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>特色標籤（用逗號分隔）</Label>
            <Input value={features} onChange={(e) => setFeatures(e.target.value)} className="mt-1" />
          </div>
          <div className="flex space-x-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">取消</Button>
            <Button onClick={handleSave} className="flex-1" disabled={loading}>
              {loading ? '儲存中...' : '儲存'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}