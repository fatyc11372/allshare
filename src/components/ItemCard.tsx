import React from 'react';
import { Heart, MapPin, Star } from 'lucide-react';
import { Item } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { CATEGORIES } from '../data/constants';

interface ItemCardProps {
  item: Item;
  onItemClick: (item: Item) => void;
  onFavorite: (itemId: string) => void;
  isFavorited: boolean;
}

export function ItemCard({ item, onItemClick, onFavorite, isFavorited }: ItemCardProps) {
  const category = CATEGORIES.find((c) => c.id === item.category);

  return (
    <div
      className="bg-card rounded-lg border shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onItemClick(item)}
    >
      <div className="relative">
        <ImageWithFallback
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-48 object-cover"
        />
        <button
          className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full hover:bg-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(item.id);
          }}
        >
          <Heart
            className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
          />
        </button>
        {!item.available && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary">
              {item.borrowedBy ? '借出中' : '已下架'}
            </Badge>
          </div>
        )}
        {category && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="outline" className="bg-white/80">
              {category.icon} {category.name}
            </Badge>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{item.title}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
        <div className="flex items-center space-x-2 mb-3">
          <MapPin className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{item.location}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={item.owner.avatar} />
              <AvatarFallback>{item.owner.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{item.owner.name}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-muted-foreground">{item.owner.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}