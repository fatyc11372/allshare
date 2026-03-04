import { useState } from 'react';
import { supabase } from '../supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { CATEGORIES } from '../data/constants';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (itemData: any) => void;
  currentUser: any;
}

export function AddItemModal({ isOpen, onClose, onSubmit, currentUser }: AddItemModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [features, setFeatures] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!title || !description || !category || !location) {
      setError('請填寫所有必要欄位');
      return;
    }
    setLoading(true);
    setError('');

    let imageUrl = 'https://images.unsplash.com/photo-1586380128687-e15d6d7e923b?w=400';

    if (image) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('item-images')
        .upload(fileName, image);
      if (uploadError) {
        setError('圖片上傳失敗：' + uploadError.message);
        setLoading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('item-images').getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    const { data, error: insertError } = await supabase.from('items').insert({
      title,
      description,
      category,
      location,
      image_url: imageUrl,
      features: features.split(',').map((f) => f.trim()).filter(Boolean),
      owner_id: currentUser.id,
      owner_name: currentUser.name,
      owner_avatar: currentUser.avatar,
      available: true,
      lat: 25.0330 + (Math.random() - 0.5) * 0.02,
      lng: 121.5654 + (Math.random() - 0.5) * 0.02,
    }).select().single();

    setLoading(false);

    if (insertError) {
      setError('發佈失敗：' + insertError.message);
      return;
    }

    onSubmit(data);
    setTitle('');
    setDescription('');
    setCategory('');
    setLocation('');
    setFeatures('');
    setImage(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>發佈物品</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">物品名稱</Label>
            <Input
              id="title"
              placeholder="例如：電動螺絲起子"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="description">物品描述</Label>
            <Textarea
              id="description"
              placeholder="描述物品的狀況、用途等..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="category">分類</Label>
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
            <Label htmlFor="location">地點</Label>
            <Input
              id="location"
              placeholder="例如：大安區, 台北市"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="features">特色標籤（用逗號分隔）</Label>
            <Input
              id="features"
              placeholder="例如：充電式, 附收納盒, 九成新"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="image">物品照片（選填）</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="mt-1"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex space-x-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              取消
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={loading}>
              {loading ? '發佈中...' : '發佈物品'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}