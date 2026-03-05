import { Timestamp } from '@angular/fire/firestore';

export interface Favorite {
  id: string;
  countryCode: string; // cca3
  countryName: string;
  comment: string;
  rating: number; // 1..5
  createdAt: Timestamp | Date | null;
  updatedAt: Timestamp | Date | null;
}

export interface FavoriteCreateInput {
  countryCode: string;
  countryName: string;
  comment: string;
  rating: number;
}

export interface FavoriteUpdateInput {
  comment: string;
  rating: number;
}
