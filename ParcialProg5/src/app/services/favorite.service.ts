import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where
} from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';
import { Favorite, FavoriteCreateInput, FavoriteUpdateInput } from '../model/favorito.model';

interface FavoriteDoc {
  countryCode: string;
  countryName: string;
  comment: string;
  rating: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private firestore = inject(Firestore);

  private userFavoritesCollection(uid: string) {
    return collection(this.firestore, `users/${uid}/favorites`);
  }

  getFavoritesByUser(uid: string): Observable<Favorite[]> {
    const favoritesRef = query(this.userFavoritesCollection(uid), orderBy('createdAt', 'desc'));
    return collectionData(favoritesRef, { idField: 'id' }).pipe(
      map((items) => items as Favorite[])
    );
  }

  async getFavoriteById(uid: string, favoriteId: string): Promise<Favorite | null> {
    const favoriteRef = doc(this.firestore, `users/${uid}/favorites/${favoriteId}`);
    const snapshot = await getDoc(favoriteRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data() as FavoriteDoc;

    return {
      id: snapshot.id,
      countryCode: data.countryCode,
      countryName: data.countryName,
      comment: data.comment,
      rating: data.rating,
      createdAt: (data.createdAt as Favorite['createdAt']) ?? null,
      updatedAt: (data.updatedAt as Favorite['updatedAt']) ?? null
    };
  }

  async addFavorite(uid: string, payload: FavoriteCreateInput): Promise<void> {
    const normalizedCode = payload.countryCode.toUpperCase().trim();
    const alreadyExists = await this.existsByCountryCode(uid, normalizedCode);
    if (alreadyExists) {
      throw new Error('duplicate-country');
    }

    const favoriteRef = doc(this.firestore, `users/${uid}/favorites/${normalizedCode}`);

    await runTransaction(this.firestore, async (transaction) => {
      const snapshot = await transaction.get(favoriteRef);
      if (snapshot.exists()) {
        throw new Error('duplicate-country');
      }

      transaction.set(favoriteRef, {
        countryCode: normalizedCode,
        countryName: payload.countryName.trim(),
        comment: payload.comment.trim(),
        rating: payload.rating,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });
  }

  async updateFavorite(uid: string, favoriteId: string, payload: FavoriteUpdateInput): Promise<void> {
    const favoriteRef = doc(this.firestore, `users/${uid}/favorites/${favoriteId}`);

    await updateDoc(favoriteRef, {
      comment: payload.comment.trim(),
      rating: payload.rating,
      updatedAt: serverTimestamp()
    });
  }

  async deleteFavorite(uid: string, favoriteId: string): Promise<void> {
    const favoriteRef = doc(this.firestore, `users/${uid}/favorites/${favoriteId}`);
    await deleteDoc(favoriteRef);
  }

  async existsByCountryCode(uid: string, countryCode: string): Promise<boolean> {
    const normalizedCode = countryCode.toUpperCase().trim();
    const fixedDocRef = doc(this.firestore, `users/${uid}/favorites/${normalizedCode}`);
    const fixedDoc = await getDoc(fixedDocRef);
    if (fixedDoc.exists()) {
      return true;
    }

    const favoritesRef = this.userFavoritesCollection(uid);
    const countryQuery = query(
      favoritesRef,
      where('countryCode', '==', normalizedCode),
      limit(1)
    );

    const result = await getDocs(countryQuery);
    return !result.empty;
  }
}
