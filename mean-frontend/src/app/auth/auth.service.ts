import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { MatExpansionPanelDescription } from '@angular/material';

@Injectable ({ providedIn: 'root' })
export class AuthService {
private token = '';
private isAuth = false;
private userId: string;
private authStatusListener = new Subject<boolean>();
private tokenTimer: NodeJS.Timer;


constructor(private httpClient: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuth;
  }

  getUserId() {
    return this.userId;
  }

  createUser(email: string, password: string) {
    const authData: AuthData = {email: email, password: password};
    return this.httpClient.post('http://localhost:3000/user/signup', authData).subscribe(() => {
      this.router.navigate['/login'];
    }, error => {
      this.authStatusListener.next(false);
    });
}

getAuthStatusListener() {
  return this.authStatusListener.asObservable();
}

private setTimer(duration: number ) {
  this.tokenTimer = setTimeout(() => {
    this.logout();
  }, duration * 1000);
}

  login(email: string, password: string) {
  const authData: AuthData = {email: email, password: password};
  this.httpClient.post<{token: string, expiresIn: number, userId: string}>('http://localhost:3000/user/login', authData).subscribe(
    result => {
      this.token = result.token;
      if (result.token) {
        const expiresInDuration = result.expiresIn;
        this.setTimer(expiresInDuration);
        this.isAuth = true;
        this.userId = result.userId;
        const now = new Date();
        const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
        this.saveAuthData(result.token, expirationDate, this.userId);
        this.authStatusListener.next(true);
        this.router.navigate(['/']);
      }
    }
  );
}

logout() {
  this.token = null;
  this.isAuth = false;
  this.authStatusListener.next(false);
  clearTimeout(this.tokenTimer);
  this.clearAuthData();
  this.userId = null;
  this.router.navigate(['/']);
}

private saveAuthData(token: string, expirationDate: Date, userId: string) {
  localStorage.setItem('token', token);
  localStorage.setItem('expiration', expirationDate.toISOString());
  localStorage.setItem('userId', userId);
}

private clearAuthData() {
  localStorage.removeItem('token');
  localStorage.removeItem('expiration');
  localStorage.removeItem('userId');
}

autoAuthUser() {
  const authInfo = this.getAuthData();
  if (!authInfo) {
    return;
  }
  const now = new Date();
  const expirationDuration = authInfo.expirationDate.getTime() - now.getTime();
  if (expirationDuration > 0) {
    this.token = authInfo.token;
    this.userId = authInfo.userId;
    this.isAuth = true;
    this.setTimer(expirationDuration / 1000);
    this.authStatusListener.next(true);
  }
}

private getAuthData() {
  const token = localStorage.getItem('token');
  const expiration = localStorage.getItem('expiration');
  const userId = localStorage.getItem('userId');
  if (!token || !expiration) {
    return;
  }
  return {
    token: token,
    expirationDate: new Date(expiration),
    userId: userId
  };
}
}
