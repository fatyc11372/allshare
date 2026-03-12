import { Search, Bell, MapPin, PackagePlus, UserCircle, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Toaster } from './ui/sonner';

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
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* 左側 Logo 區域 */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onSearchChange('')}
              className="flex items-center gap-3 transition-opacity hover:opacity-80"
            >
              <img
                src="/allshare-logo.png"
                alt="allshare logo"
                className="h-9 w-9 rounded-xl shadow-sm"
              />
              <h1 className="text-2xl font-extrabold tracking-tighter text-primary hidden sm:block">
                allshare
              </h1>
            </button>
          </div>

          {/* 中間搜尋欄位 (強制顯示版！) */}
          <div className="flex-1 max-w-xl flex items-center relative mx-2 md:mx-4">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜尋你想借的物品..."
              className="w-full pl-9 pr-4 rounded-full bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* 右側按鈕區域 */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <Button variant="outline" size="sm" className="hidden md:flex gap-2" onClick={onMapSearch}>
              <MapPin className="h-4 w-4 text-sky-500" />
              探索地圖
            </Button>
            
            <Button variant="default" size="sm" className="gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700" onClick={onAddItem}>
              <PackagePlus className="h-4 w-4" />
              <span className="hidden sm:inline">發佈物品</span>
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
              <Button variant="ghost" size="sm" className="gap-2" onClick={onLogin}>
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