import { useState } from 'react';
import { Search, Bell, Menu, UserCircle, LogOut, PackagePlus, MapPin, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Toaster } from './ui/sonner';
import { toast } from 'sonner';

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

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onProfileClick: () => void;
  onMapSearch: () => void;
  currentUser: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onAddItem: () => void;
}

export function Header({
  searchQuery,
  onSearchChange,
  onProfileClick,
  onMapSearch,
  currentUser,
  onLogin,
  onLogout,
  onAddItem,
}: HeaderProps) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* 左側 Logo 區域：加入了你漂亮的新 Logo PNG */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSearchChange('')} // 點擊 Logo 回到首頁並清空搜尋
              className="flex items-center gap-3 transition-opacity hover:opacity-80"
            >
              {/* 新 Logo 圖片 */}
              <img
                src="/allshare-logo.png"
                alt="allshare logo"
                className="h-9 w-9 rounded-xl shadow-sm" // 設定尺寸與圓角
              />
              <h1 className="text-2xl font-extrabold tracking-tighter text-primary">
                allshare
              </h1>
            </button>
          </div>

          {/* 右側按鈕區域 (省略，保持不變) */}
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex gap-2"
              onClick={onMapSearch}
            >
              <MapPin className="h-4 w-4 text-sky-500" />
              探索地圖
            </Button>
            
            <Button
              variant="default"
              size="sm"
              className="gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
              onClick={onAddItem}
            >
              <PackagePlus className="h-4 w-4" />
              發佈物品
            </Button>
            
            <Toaster />
            
            {currentUser ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="hidden md:flex">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </Button>
                <div className="flex items-center gap-2 ml-1 cursor-pointer" onClick={onProfileClick}>
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full border" />
                </div>
                <Button variant="ghost" size="sm" className="hidden md:flex" onClick={onLogout}>
                  <LogOut className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={onLogin}
              >
                <UserCircle className="h-4 w-4 text-muted-foreground" />
                登入
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}