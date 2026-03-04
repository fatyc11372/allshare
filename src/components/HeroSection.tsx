import { Search } from 'lucide-react';
import { Button } from './ui/button';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchFocus?: () => void;
}

export function HeroSection({ searchQuery, onSearchChange, onSearchFocus }: HeroSectionProps) {
  return (
    <section className="bg-gradient-to-b from-purple-50 to-white py-20 text-center">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 tracking-tight">
          凡物公用，讓物品發揮最大價值
        </h1>
        <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          在 allshare，您可以免費借用鄰居的物品，也可以將閒置物品分享給需要的人。
          建立更緊密的社區連結，一起實踐共享經濟。
        </p>

        {/* 支援雙向綁定的巨大搜尋列 */}
        <div className="max-w-2xl mx-auto bg-white p-2 rounded-full shadow-lg flex items-center mb-8 border border-gray-100 transition-shadow hover:shadow-xl focus-within:shadow-xl focus-within:ring-2 focus-within:ring-purple-500/20">
          <div className="pl-5 text-gray-400">
            <Search className="w-6 h-6" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="你想借什麼？例如：電鑽、摺疊椅、露營帳篷..."
            className="flex-1 w-full py-4 px-4 outline-none text-gray-700 text-lg placeholder:text-gray-400 bg-transparent"
            onFocus={onSearchFocus}
          />
          <Button 
            size="lg" 
            className="rounded-full px-8 bg-purple-600 hover:bg-purple-700 text-md h-12" 
            onClick={onSearchFocus}
          >
            尋找物品
          </Button>
        </div>

        <div className="flex justify-center space-x-4">
          <Button size="lg" variant="outline" className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full px-8" onClick={onSearchFocus}>
            瀏覽所有物品
          </Button>
        </div>
      </div>
    </section>
  );
}