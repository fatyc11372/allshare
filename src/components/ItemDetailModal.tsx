import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Toaster } from './ui/sonner';
import { MapPin, Clock3, Tag, Package, UserCircle, MessageSquareShare, X } from 'lucide-react';

interface ItemDetailModalProps {
  item: any; // 
  onClose: () => void;
  onLogin?: () => void;
  onAddItem?: () => void;
}

export function ItemDetailModal({ item, onClose, onLogin, onAddItem }: ItemDetailModalProps) {
  const [showFullImage, setShowFullImage] = useState(false);

  if (!item) return null;

  return (
    <>
      <Dialog open={!!item && !showFullImage} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0">
          <Toaster />
          
          <div 
            className="relative aspect-[16/10] w-full overflow-hidden border-b cursor-pointer"
            onClick={() => setShowFullImage(true)}
          > 
            <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-sky-100 text-sky-700 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm pointer-events-none">
                <Package className="h-3.5 w-3.5" />
                {item.category}
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm pointer-events-none">
                {item.condition}
              </span>
            </div>
          </div>

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

      <Dialog open={showFullImage} onOpenChange={setShowFullImage}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full p-0 bg-black/95 border-none flex flex-col items-center justify-center">
          <button onClick={() => setShowFullImage(false)} className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors z-50">
            <X className="w-6 h-6" />
          </button>
          <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
        </DialogContent>
      </Dialog>
    </>
  );
}