import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Toaster } from './ui/sonner';
import { MapPin, ArrowRightLeft, Clock3, Tag, Package, UserCircle, MessageSquareShare } from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar: string;
  phone?: string;
  socialBindings: {
    facebook: boolean;
    imessage: boolean;
    instagram: boolean;
  };
}

interface ItemDetailModalProps {
  item: {
    id: string;
    title: string;
    category: string;
    condition: string;
    availableFrom: string;
    availableTo: string;
    location: string;
    image: string;
    owner: User;
    distance?: number;
  } | null;
  onClose: () => void;
  onLogin: () => void;
  onAddItem: () => void;
}

export function ItemDetailModal({ item, onClose, onLogin, onAddItem }: ItemDetailModalProps) {
  if (!item) return null;

  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0">
        <Toaster />
        
        {/* 1. 圖片區域：優化為不裁切模式 */}
        <div className="relative aspect-[16/10] w-full bg-muted/30 overflow-hidden border-b"> 
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-contain p-2" // 核心修改：將 object-cover 改為 object-contain，並加入 p-2 讓圖片跟框框有一點間距
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="bg-sky-100 text-sky-700 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              {item.category}
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full">
              {item.condition}
            </span>
          </div>
        </div>

        {/* 2. 內容區域 (省略，保持不變) */}
        <div className="px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight mb-4">{item.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm text-muted-foreground bg-muted/20 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-primary" />
                <span>借用時間：{new Date(item.availableFrom).toLocaleDateString()} - {new Date(item.availableTo).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-500" />
                <span>地點：{item.location} {item.distance ? `(距離 ${item.distance.toFixed(1)} km)` : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                <span>物品狀況：{item.condition}</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                <UserCircle className="h-4 w-4 text-blue-600" />
                <span>物品主人：{item.owner.name}</span>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-xl text-sm">
              <h4 className="font-semibold mb-2">物品描述</h4>
              <p className="text-muted-foreground leading-relaxed">
                這是一張狀況良好的桌子，非常適合居家辦公或用餐使用。歡迎信任的社群成員借用。借用前請確認可以自行搬運。
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button size="lg" className="flex-1 gap-2 bg-sky-600 hover:bg-sky-700">
                <MessageSquareShare className="h-5 w-5" />
                向 {item.owner.name} 發送借用請求
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}