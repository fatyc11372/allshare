import { useState, useEffect } from 'react';
import { Search, Map, Plus, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface HeaderProps {
  onAddItem: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onProfileClick: () => void;
  onMapSearch: () => void;
  currentUser: any;
  onLogin: () => void;
  onLogout: () => void;
}

export function Header({ onAddItem, searchQuery, onSearchChange, onProfileClick, onMapSearch, currentUser, onLogin, onLogout }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 250);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* 左側：高級漸層 + 開展型雙向箭頭 Logo */}
        <div className="flex-shrink-0 flex items-center cursor-pointer gap-3.5 hover:opacity-90 transition-opacity" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500 text-white p-2 rounded-xl shadow-md w-10 h-10">
            {/* 客製化 SVG：修改畫布座標，讓箭頭大幅向左右開展 */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full p-0.5">
              {/* 核心水平線：從 1.5 延伸到 22.5，幾乎佔滿畫布寬度 */}
              <path d="M 1.5 12 h 21" />
              {/* 左邊箭頭：貼近左側邊緣 (尖端在 1.5) */}
              <path d="M 5.5 8 l -4 4 l 4 4" />
              {/* 右邊箭頭：貼近右側邊緣 (尖端在 22.5) */}
              <path d="M 18.5 8 l 4 4 l -4 4" />
            </svg>
          </div>
          <span className="text-2xl font-black tracking-wide bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent pb-0.5">
            allshare
          </span>
        </div>

        {/* 中間：搜尋列 (向下捲動時才滑出) */}
        <div className={`flex-1 max-w-md mx-6 transition-all duration-300 ease-in-out ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
          <div className="relative flex items-center w-full h-10 rounded-full border border-gray-200 bg-gray-50 overflow-hidden px-3 focus-within:border-purple-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-100 transition-all">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="搜尋物品..."
              className="w-full h-full bg-transparent outline-none text-sm text-gray-700"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* 右側：功能按鈕區 */}
        <div className="flex-shrink-0 flex items-center space-x-2 sm:space-x-4">
          <Button variant="outline" size="sm" onClick={onMapSearch} className="hidden sm:flex rounded-full text-gray-600 border-gray-200 hover:bg-gray-50">
            <Map className="w-4 h-4 mr-2" /> 地圖
          </Button>
          <Button size="sm" onClick={onAddItem} className="rounded-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 border-none text-white shadow-md">
            <Plus className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">發佈物品</span>
          </Button>
          
          {currentUser ? (
            <Avatar className="w-9 h-9 cursor-pointer border-2 border-transparent hover:border-purple-200 transition-all shadow-sm" onClick={onProfileClick}>
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-purple-100 to-blue-100 text-purple-700 font-bold">{currentUser.name?.[0]}</AvatarFallback>
            </Avatar>
          ) : (
            <Button variant="ghost" size="sm" onClick={onLogin} className="rounded-full text-gray-600 hover:text-purple-600 hover:bg-purple-50">
              <LogIn className="w-4 h-4 mr-2" /> 登入
            </Button>
          )}
        </div>
        
      </div>
    </header>
  );
}