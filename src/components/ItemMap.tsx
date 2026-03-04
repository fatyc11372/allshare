import { useEffect } from 'react';
import type { Item } from '../types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 修復 Leaflet 預設圖示問題
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface ItemMapProps {
  items: Item[];
  onItemClick: (item: Item) => void;
  selectedCategory: string | null;
}

export function ItemMap({ items, onItemClick, selectedCategory }: ItemMapProps) {
  const availableItems = items.filter(item => item.available);

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border">
      <MapContainer
        center={[25.0330, 121.5654]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {availableItems.map(item => (
          <Marker
            key={item.id}
            position={[item.coordinates.lat, item.coordinates.lng]}
            eventHandlers={{ click: () => onItemClick(item) }}
          >
            <Popup>
              <div className="p-1">
                <img src={item.imageUrl} alt={item.title} className="w-32 h-20 object-cover rounded mb-2" />
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.location}</p>
                <p className="text-xs text-gray-500">{item.owner.name}</p>
                <button
                  className="mt-2 w-full text-xs bg-purple-600 text-white rounded px-2 py-1"
                  onClick={() => onItemClick(item)}
                >
                  查看詳情
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}