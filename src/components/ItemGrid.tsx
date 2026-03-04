import React from 'react';
import { Item } from '../types';
import { ItemCard } from './ItemCard';

interface ItemGridProps {
  items: Item[];
  onItemClick: (item: Item) => void;
  onFavorite: (itemId: string) => void;
  favoritedItems: Set<string>;
  showDistance?: boolean;
}

export function ItemGrid({ items, onItemClick, onFavorite, favoritedItems }: ItemGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold mb-2">找不到符合的物品</h3>
        <p className="text-muted-foreground">試試調整搜尋條件或分類篩選</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onItemClick={onItemClick}
          onFavorite={onFavorite}
          isFavorited={favoritedItems.has(item.id)}
        />
      ))}
    </div>
  );
}