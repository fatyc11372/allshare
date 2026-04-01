import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { PackagePlus, Clock3, MapPin, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../supabase';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: any) => void;
  currentUser: any;
}

export function AddItemModal({ isOpen, onClose, onSubmit, currentUser }: AddItemModalProps) {
  const [formData, setFormData] = useState({
    title: '', category: '', condition: '', description: '',
    availableFrom: '', availableTo: '', location: '', image: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) { toast.error('請先登入'); return; }
    setIsSubmitting(true);

    try {
      let imageUrl = '';
      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const fileName = `${currentUser.id}_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage
          .from('item-images')
          .getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      const { data, error } = await supabase.from('items').insert({
        title: formData.title,
        category: formData.category,
        condition: formData.condition,
        description: formData.description,
        location: formData.location,
        image_url: imageUrl,
        owner_id: currentUser.id,
        owner_name: currentUser.name,
        available: true,
        features: [],
      }).select().single();

      if (error) throw error;

      toast.success('物品發佈成功！');
      onSubmit(data);
      onClose();
      setFormData({ title: '', category: '', condition: '', description: '', availableFrom: '', availableTo: '', location: '', image: '' });
      setImageFile(null);
    } catch (err: any) {
      toast.error('發佈失敗：' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-2xl font-bold tracking-tight">發佈我的好物</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-2xl aspect-[16/10] bg-muted/20 flex flex-col items-center justify-center relative overflow-hidden group">
            {formData.image ? (
              <>
                <img src={formData.image} alt="Item preview" className="w-full h-full object-contain p-2" />
                <Button size="icon" variant="destructive" className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" type="button" onClick={() => { setFormData({ ...formData, image: '' }); setImageFile(null); }}>
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                <div className="p-4 bg-muted rounded-full">
                  <ImageIcon className="h-8 w-8" />
                </div>
                <span className="text-sm font-medium">點擊上傳物品圖片</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" required />
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <div className="col-span-2">
              <Input placeholder="物品名稱，例如：我的溫馨小桌子" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="rounded-xl p-6" required />
            </div>
            <div className="col-span-2">
  <Input placeholder="物品描述，例如：九成新，附配件" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="rounded-xl p-6" required />
</div>
            <Input placeholder="物品狀況 (例如：九成新)" value={formData.condition} onChange={(e) => setFormData({ ...formData, condition: e.target.value })} className="rounded-xl p-6" required />
            <Input placeholder="類別 (例如：廚房、工具)" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="rounded-xl p-6" required />
            <div className="col-span-2 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-500" />
              <Input placeholder="物品地點，例如：台北市大安區仁愛圓環" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="rounded-xl p-6" required />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl px-6">取消</Button>
            <Button type="submit" size="lg" disabled={isSubmitting} className="rounded-xl px-10 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700">
              <PackagePlus className="h-5 w-5 mr-2" />
              {isSubmitting ? '發佈中...' : '立即發佈'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}