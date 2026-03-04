export interface Owner {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
}

export interface BorrowedBy {
  id: string;
  name: string;
  avatar: string;
  borrowedAt: Date;
  returnDate: Date;
  contactInfo: string;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  owner: Owner;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  available: boolean;
  borrowedBy?: BorrowedBy;
  features: string[];
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}