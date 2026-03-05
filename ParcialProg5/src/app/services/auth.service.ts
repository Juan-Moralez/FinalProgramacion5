import { Injectable, inject } from '@angular/core';
import { Auth, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);

  user$: Observable<User | null> = new Observable<User | null>((subscriber) => {
    const unsubscribe = onAuthStateChanged(
      this.auth,
      (user) => subscriber.next(user),
      (error) => subscriber.error(error)
    );

    return () => unsubscribe();
  });

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }
  getUserAfterAuthReady(): Promise<User | null> {
  if (this.auth.currentUser) {
    return Promise.resolve(this.auth.currentUser);
  }

  return new Promise<User | null>((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      this.auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      (error) => {
        unsubscribe();
        reject(error);
      }
    );
  });
}

}
