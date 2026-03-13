import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Toaster } from './ui/sonner';
import { MapPin, Clock3, Tag, Package, UserCircle, MessageSquareShare, X, Image as ImageIcon } from 'lucide-react';

interface ItemDetailModalProps {
  item: any;
  isOpen: boolean;
  onClose: () => void;
  onBooking: (itemId: string, message: string) => Promise<void>;
  currentUser: any;
  onItemUpdated?: () => Promise<void>;
}

export function ItemDetailModal({ 
  item, 
  isOpen, 
  onClose, 
  onBooking, 
  currentUser 
}: ItemDetailModalProps) {
  const [showFullImage, setShowFullImage] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  if (!item) return null;

  // 1. 防呆機制：處理日期顯示，避免出現 Invalid Date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '隨時';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '隨時';
    return d.toLocaleDateString();
  };

  // 2. 修復按鈕功能：發送真實的借用請求
  const handleBooking = async () => {
    setIsBooking(true);
    try {
      // 呼叫真實的 onBooking 函數
      await onBooking(item.id, `您好，我想向您借用「${item.title}」，謝謝！`);
      onClose(); // 送出成功後自動關閉視窗
    } catch (error) {
      console.error("發送請求失敗:", error);
    } finally {
      setIsBooking(false);
    }
  };

  // 3. 防呆機制：相容不同格式的圖片來源
  const imageSrc = item.image || item.imageUrl || '';

  return (
    <>
      <Dialog open={isOpen && !showFullImage} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0 bg-background rounded-3xl overflow-hidden flex flex-col">
          <Toaster />
          
          {/* 核心修正 1：圖片區域設置限制高度 (例如 max-h-[45vh])，並保留不裁切模式 */}
          <div 
            className="w-full max-h-[45vh] bg-muted/30 overflow-hidden border-b cursor-pointer flex items-center justify-center shrink-0 group relative"
            onClick={() => {
              if (imageSrc) setShowFullImage(true);
            }}
          > 
            {imageSrc ? (
              <img src={imageSrc} alt={item.title} className="w-full h-full object-contain p-2 hover:opacity-90 transition-opacity" />
            ) : (
              <div className="flex flex-col items-center text-muted-foreground">
                <ImageIcon className="h-12 w-12 mb-2 opacity-20" />
                <span>暫無圖片</span>
              </div>
            )}
            
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-sky-100 text-sky-700 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm pointer-events-none">
                <Package className="h-3.5 w-3.5" />
                {item.category || '未分類'}
              </span>
              {item.condition && (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm pointer-events-none">
                  {item.condition}
                </span>
              )}
            </div>
          </div>

          {/* 核心修正 2：資訊區域設置 flex-1 px-6 py-5 overflow-y-auto，將其變成獨立的可滾動區域 */}
          <div className="flex-1 px-6 py-5 overflow-y-auto bg-background">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight mb-4">{item.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              
              {/* 動態資料區域 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm text-muted-foreground bg-muted/20 p-4 rounded-xl">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate">借用時間：{formatDate(item.availableFrom)} - {formatDate(item.availableTo)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-500 shrink-0" />
                  <span className="truncate">地點：{item.location || '未提供'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate">物品狀況：{item.condition || '未提供'}</span>
                </div>
                <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                  <UserCircle className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="truncate">物品主人：{item.owner?.name || '社群成員'}</span>
                </div>
              </div>

              {/* 真實的物品描述 */}
              <div className="bg-muted/30 p-4 rounded-xl text-sm border border-muted">
                <h4 className="font-semibold mb-2">物品描述</h4>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {item.description || "這是一件很棒的物品，歡迎信任的社群成員借用！借用前請確認相關細節。"}
                </p>
              </div>

              {/* 復活的借用按鈕 */}
              <div className="flex items-center gap-2 pt-2">
                <Button 
                  size="lg" 
                  className="flex-1 gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white"
                  onClick={handleBooking}
                  disabled={isBooking}
                >
                  <MessageSquareShare className="h-5 w-5" />
                  {isBooking ? '發送中...' : `向 ${item.owner?.name || '主人'} 發送借用請求`}
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
          {imageSrc && <img src={imageSrc} alt={item.title} className="w-full h-full object-contain" />}
        </DialogContent>
      </Dialog>
    </>
  );
}