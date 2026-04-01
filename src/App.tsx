import { useState, useMemo, useEffect } from 'react';
import { Map, LayoutGrid } from 'lucide-react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoryFilter } from './components/CategoryFilter';
import { ItemGrid } from './components/ItemGrid';
import { ItemMap } from './components/ItemMap';
import { ItemDetailModal } from './components/ItemDetailModal';
import { AddItemModal } from './components/AddItemModal';
import { ProfileModal } from './components/ProfileModal';
import { LoginModal } from './components/LoginModal';
import { Button } from './components/ui/button';
import type { Item } from './types';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import { supabase } from './supabase';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  provider: string;
  socialBindings: {
    facebook: boolean;
    imessage: boolean;
    instagram: boolean;
  };
}

interface BookingRequests {
  incoming: any[];
  outgoing: any[];
}

function dbItemToItem(row: any): Item {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    imageUrl: row.image_url || 'https://images.unsplash.com/photo-1586380128687-e15d6d7e923b?w=400',
    owner: {
      id: row.owner_id,
      name: row.owner_name || '用戶',
      avatar: row.owner_avatar || '',
      rating: (row.borrow_requests || []).filter((r: any) => r.status === 'approved').length,
      reviewCount: 0,
    },
    location: row.location,
    coordinates: { lat: row.lat || 25.0330, lng: row.lng || 121.5654 },
    available: row.available,
    features: row.features || [],
    createdAt: new Date(row.created_at),
    borrowedBy: row.borrowed_by_id ? {
      id: row.borrowed_by_id,
      name: row.borrowed_by_name || '借用者',
      avatar: '',
      borrowedAt: row.borrowed_at ? new Date(row.borrowed_at) : new Date(),
      returnDate: row.borrowed_at
        ? new Date(new Date(row.borrowed_at).getTime() + 7 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      contactInfo: '未提供', // 這裡補上了 TypeScript 要求的 contactInfo
    } : undefined,
  };
}

const buildUser = (session: any) => ({
  id: session.user.id,
  name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || '用戶',
  email: session.user.email || '',
  avatar: session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`,
  provider: session.user.app_metadata?.provider || 'email',
  socialBindings: { facebook: false, imessage: false, instagram: false },
});

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [items, setItems] = useState<Item[]>([]);
  const [favoritedItems, setFavoritedItems] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingRequests, setBookingRequests] = useState<BookingRequests>({ incoming: [], outgoing: [] });

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('items')
      .select('*, borrow_requests(id, status)')
      .order('created_at', { ascending: false });
    setLoading(false);
    if (error) {
      toast.error('載入物品失敗');
      return;
    }
    setItems((data || []).map(dbItemToItem));
  };

  const fetchBookingRequests = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const userId = session.user.id;

    const { data } = await supabase
      .from('borrow_requests')
      .select('*, items(title, image_url, owner_id)')
      .order('created_at', { ascending: false });

    const deduped = (arr: any[]) => {
      const seen: Record<string, any> = {};
      arr.forEach((r: any) => {
        const key = `${r.item_id}-${r.borrower_id}`;
        if (!seen[key] || new Date(r.created_at) > new Date(seen[key].created_at)) {
          seen[key] = r;
        }
      });
      return Object.values(seen);
    };

    setBookingRequests({
      incoming: [...deduped((data || []).filter((r: any) => r.items?.owner_id === userId))],
      outgoing: [...deduped((data || []).filter((r: any) => r.borrower_id === userId))],
    });
  };

  useEffect(() => {
    fetchItems();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(buildUser(session));
        fetchBookingRequests();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser(buildUser(session));
        fetchBookingRequests();
      } else {
        setCurrentUser(null);
        setBookingRequests({ incoming: [], outgoing: [] });
      }
    });

    const requestChannel = supabase
      .channel('borrow-requests-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'borrow_requests',
      }, () => {
        fetchBookingRequests();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(requestChannel);
    };
  }, []);

  const userItems = useMemo(() => {
    if (!currentUser) return [];
    return items.filter(item => item.owner.id === currentUser.id);
  }, [items, currentUser]);

  const borrowedItems = useMemo(() => {
    if (!currentUser) return [];
    return items.filter(item => item.borrowedBy?.id === currentUser.id);
  }, [items, currentUser]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (!item.available && item.owner.id !== currentUser?.id) return false;
      const matchesSearch = searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.features.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === null || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory, currentUser]);

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
    setIsItemModalOpen(true);
  };

  const handleBooking = async (itemId: string, message: string) => {
    if (!currentUser) {
      toast.error('請先登入才能借用物品');
      setIsLoginModalOpen(true);
      return;
    }
    const { error } = await supabase.from('borrow_requests').insert({
      item_id: itemId,
      borrower_id: currentUser.id,
      borrower_name: currentUser.name,
      message,
      status: 'pending',
    });
    if (error) {
      toast.error('發送失敗：' + error.message);
      return;
    }
    toast.success('借用請求已發送！物品主人會很快聯絡您。');
    fetchBookingRequests();
  };

  const handleAddItem = () => {
    if (!currentUser) {
      toast.error('請先登入才能發佈物品');
      setIsLoginModalOpen(true);
      return;
    }
    setIsAddItemModalOpen(true);
  };

  const handleSubmitNewItem = (itemData: any) => {
    const newItem = dbItemToItem(itemData);
    setItems(prev => [newItem, ...prev]);
    toast.success('物品發佈成功！');
  };

  const handleFavorite = (itemId: string) => {
    if (!currentUser) {
      toast.error('請先登入才能收藏物品');
      setIsLoginModalOpen(true);
      return;
    }
    setFavoritedItems(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId);
        toast.success('已取消收藏');
      } else {
        newFavorites.add(itemId);
        toast.success('已加入收藏');
      }
      return newFavorites;
    });
  };

  const scrollToItems = () => {
    const itemsSection = document.getElementById('items-section');
    if (itemsSection) itemsSection.scrollIntoView({ behavior: 'smooth' });
  };

  const handleProfileClick = () => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    setIsProfileModalOpen(true);
  };

  const handleLogin = (userData: User) => {
    setCurrentUser(userData);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setFavoritedItems(new Set());
    toast.success('已登出');
  };

  const handleRequestAction = async (id: string, action: string) => {
    // 1. 處理「標記已讀」
    if (action === 'mark_read') {
      await supabase.from('borrow_requests')
        .update({ is_read: true })
        .eq('id', id);
      await fetchBookingRequests();
      return;
    }

    // 2. 處理「取消借出」與「確認歸還」
    if (action === 'cancel_borrow' || action === 'confirm_return') {
      const request = bookingRequests.incoming.find((r: any) => r.id === id);
      if (!request?.item_id) return;

      const newStatus = action === 'cancel_borrow' ? 'cancelled' : 'completed';
      
      // 更新請求狀態
      await supabase.from('borrow_requests')
        .update({ status: newStatus })
        .eq('id', id);

      // 把物品狀態改回上架，清空借用者資訊
      await supabase.from('items')
        .update({
          available: true,
          borrowed_by_id: null,
          borrowed_by_name: null,
          borrowed_at: null,
        })
        .eq('id', request.item_id);

      toast.success(action === 'cancel_borrow' ? '已取消借出，物品重新上架' : '已確認歸還，物品重新上架');
      await fetchBookingRequests();
      await fetchItems();
      return;
    }

    // 3. 處理「同意」與「拒絕」
    const status = action === 'approve' ? 'approved' : 'declined';
    const { error, data } = await supabase.from('borrow_requests')
      .update({
        status,
        ...(action === 'approve' ? { approved_at: new Date().toISOString() } : {}),
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('更新失敗:', error);
      toast.error('更新狀態失敗');
      return;
    }

    if (action === 'approve') {
      const request = bookingRequests.incoming.find((r: any) => r.id === id);
      if (request?.item_id) {
        await supabase.from('items')
          .update({
            available: false,
            borrowed_by_id: request.borrower_id,
            borrowed_by_name: request.borrower_name,
            borrowed_at: new Date().toISOString(),
          })
          .eq('id', request.item_id);
      }
      toast.success('已同意借用請求');
    } else {
      toast.success('已拒絕借用請求');
    }

    await fetchBookingRequests();
    await fetchItems();
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <Header
        onAddItem={handleAddItem}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onProfileClick={handleProfileClick}
        onMapSearch={() => { setViewMode('map'); scrollToItems(); }}
        currentUser={currentUser}
        onLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />
      <HeroSection 
  searchQuery={searchQuery} 
  onSearchChange={setSearchQuery} 
  onSearchFocus={scrollToItems} 
/>
      <div id="items-section" className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">可借用物品</h2>
          <p className="text-muted-foreground">發現您可以從鄰居那裡借用的物品</p>
        </div>
        <div className="flex items-center justify-between mb-4">
          <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
          <div className="flex items-center space-x-2">
            <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
              <LayoutGrid className="w-4 h-4 mr-2" />網格視圖
            </Button>
            <Button variant={viewMode === 'map' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('map')}>
              <Map className="w-4 h-4 mr-2" />地圖視圖
            </Button>
          </div>
        </div>
        <div className="mt-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-muted-foreground">載入中...</p>
            </div>
          ) : viewMode === 'grid' ? (
            <ItemGrid items={filteredItems} onItemClick={handleItemClick} onFavorite={handleFavorite} favoritedItems={favoritedItems} showDistance={true} />
          ) : (
            <ItemMap items={filteredItems} onItemClick={handleItemClick} selectedCategory={selectedCategory} />
          )}
        </div>
      </div>
      <ItemDetailModal
        item={selectedItem}
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onBooking={handleBooking}
        currentUser={currentUser}
        onItemUpdated={fetchItems}
      />
      <AddItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        onSubmit={handleSubmitNewItem}
        currentUser={currentUser}
      />
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userItems={userItems}
        borrowedItems={borrowedItems}
        favoritedItems={favoritedItems}
        allItems={items}
        onItemClick={handleItemClick}
        onFavorite={handleFavorite}
        onAddItem={handleAddItem}
        currentUser={currentUser}
        bookingRequests={bookingRequests}
        onRequestAction={handleRequestAction}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}