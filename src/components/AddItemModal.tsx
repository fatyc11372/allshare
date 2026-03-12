import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { PackagePlus, Clock3, MapPin, Tag, Package, Image as ImageIcon, X } from 'lucide-react';
import { Toaster } from './ui/sonner';
import { toast } from 'sonner';

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  onItemAdd: (item: any) => void;
  currentUser: any;
}

export function AddItemModal({ open, onClose, onItemAdd, currentUser }: AddItemModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    condition: '',
    availableFrom: '',
    availableTo: '',
    location: '',
    image: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = {
      ...formData,
      id: `item_${Date.now()}`,
      owner: currentUser,
      availableFrom: new Date(formData.availableFrom).toISOString(),
      availableTo: new Date(formData.availableTo).toISOString(),
    };
    onItemAdd(newItem);
    toast.success('物品發佈成功！');
    onClose();
    setFormData({
      title: '', category: '', condition: '',
      availableFrom: '', availableTo: '', location: '', image: '',
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0">
        <Toaster />
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-2xl font-bold tracking-tight">發佈我的好物</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
          
          {/* 1. 圖片上傳與預覽區域：優化為不裁切模式 */}
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-2xl aspect-[16/10] bg-muted/20 flex flex-col items-center justify-center relative overflow-hidden group">
            {formData.image ? (
              <>
                <img
                  src={formData.image}
                  alt="Item preview"
                  className="w-full h-full object-contain p-2" // 核心修改：將 object-cover 改為 object-contain，並加入 p-2
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setFormData({ ...formData, image: '' })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                <div className="p-4 bg-muted rounded-full">
                  <ImageIcon className="h-8 w-8" />
                </div>
                <span className="text-sm font-medium">點擊上傳物品圖片</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required
                />
              </label>
            )}
          </div>

          {/* 2. 表單內容區域 (省略，保持不變) */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <div className="col-span-2">
              <Input
                placeholder="物品名稱，例如：我的溫馨小桌子"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="rounded-xl p-6"
                required
              />
            </div>

            <Input
              placeholder="物品狀況 (例如：九成新)"
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              className="rounded-xl p-6"
              required
            />
            
            <Input
              placeholder="類別 (例如：廚房、工具)"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="rounded-xl p-6"
              required
            />

            <div className="flex items-center gap-3 col-span-2 bg-muted/30 p-4 rounded-xl border">
              <Clock3 className="h-5 w-5 text-sky-500" />
              <Input
                type="date"
                value={formData.availableFrom}
                onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                className="bg-transparent border-none p-0 focus-visible:ring-0"
                required
              />
              <span className="text-muted-foreground">至</span>
              <Input
                type="date"
                value={formData.availableTo}
                onChange={(e) => setFormData({ ...formData, availableTo: e.target.value })}
                className="bg-transparent border-none p-0 focus-visible:ring-0"
                required
              />
            </div>
            
            <div className="col-span-2 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-500" />
              <Input
                placeholder="物品地點，例如：台北市大安區仁愛圓環"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="rounded-xl p-6"
                required
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl px-6">
              取消
            </Button>
            <Button type="submit" size="lg" className="rounded-xl px-10 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700">
              <PackagePlus className="h-5 w-5 mr-2" />
              立即發佈
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}