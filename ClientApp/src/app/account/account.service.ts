import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Register } from '../shared/models/account/register';
import { Login } from '../shared/models/account/login';
import { User } from '../shared/models/account/user';
import { ReplaySubject, map, of, take } from 'rxjs';
import { Router } from '@angular/router';
import { ConfirmEmail } from '../shared/models/account/confirmEmail';
import { ResetPassword } from '../shared/models/account/resetPassword';
import { RegisterWithExternal } from '../shared/models/account/registerWithExternal';
import { LoginWithExternal } from '../shared/models/account/loginWithExternal';
import { environment } from 'src/environments/environment';
import jwt_decode from 'jwt-decode';
import { SharedService } from '../shared/shared.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private userSource = new ReplaySubject<User | null>(1);
  user$ = this.userSource.asObservable();

  refreshTokenTimeout: any;
  timeoutId: any;

  constructor(private http: HttpClient, 
    private router: Router,
    private sharedService: SharedService) { }

  refreshToken = async () => {
    this.http.post<User>(`${environment.appUrl}account/refresh-token`, {}, {withCredentials: true})
    .subscribe({
      next: (user: User) => {
        if (user) {
          this.setUser(user);
        }
      }, error: error => {
        this.sharedService.showNotification(false, 'Error', error.error);
        this.logout();
      }
    })
  }

  refreshUser(jwt: string | null) {
    if (jwt === null) {
      this.userSource.next(null);
      return of(undefined);
    }

    let headers = new HttpHeaders();
    headers = headers.set('Authorization', 'Bearer ' + jwt);

    return this.http.get<User>(`${environment.appUrl}account/refresh-page`, {headers, withCredentials: true}).pipe(
      map((user: User) => {
        if (user) {
          this.setUser(user);
        }
      })
    )
  }

  login(model: Login) {
    return this.http.post<User>(`${environment.appUrl}account/login`, model, {withCredentials: true})
    .pipe(
      map((user: User) => {
        if (user) {
          this.setUser(user);
        }
      })
    );
  }

  loginWithThirdParty(model: LoginWithExternal) {
    return this.http.post<User>(`${environment.appUrl}account/login-with-third-party`, model, {withCredentials: true})
    .pipe(
      map((user: User) => {
        if (user) {
          this.setUser(user);
        }
      })
    )
  }

  logout() {
    localStorage.removeItem(environment.userKey);
    this.userSource.next(null);
    this.router.navigateByUrl('/');
    this.stopRefreshTokenTimer();
  }

  register(model: Register) {
    return this.http.post(`${environment.appUrl}account/register`, model);
  }

  registerWithThirdParty(model: RegisterWithExternal) {
    return this.http.post<User>(`${environment.appUrl}account/register-with-third-party`, model).pipe(
      map((user: User) => {
        if (user) {
          this.setUser(user);
        }
      })
    );
  }

  confirmEmail(model: ConfirmEmail) {
    return this.http.put(`${environment.appUrl}account/confirm-email`, model);
  }

  resendEmailConfirmationLink(email: string) {
    return this.http.post(`${environment.appUrl}account/resend-email-confirmation-link/${email}`, {});
  }

  forgotUsernameOrPassword(email: string) {
    return this.http.post(`${environment.appUrl}account/forgot-username-or-password/${email}`, {});
  }

  resetPassword(model: ResetPassword) {
    return this.http.put(`${environment.appUrl}account/reset-password`, model);
  }

  getJWT() {
    const key = localStorage.getItem(environment.userKey);
    if (key) {
      const user: User = JSON.parse(key);
      return user.jwt;
    } else {
      return null;
    }
  }

  checkUserIdleTimout() {
    this.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        // the user is logged in
        if (user) {
          // if not currently dipsplaying expiring session modal
          if (!this.sharedService.displayingExpiringSessionModal) {
            this.timeoutId = setTimeout(() => {
              this.sharedService.displayingExpiringSessionModal = true;
              this.sharedService.openExpiringSessionCountdown();
              // in 10 minutes of user incativity
            }, 10 * 60 * 1000);
          }
        }
      }
    })
  }

  private setUser(user: User) {
    this.stopRefreshTokenTimer();
    this.startRefreshTokenTimer(user.jwt);
    localStorage.setItem(environment.userKey, JSON.stringify(user));
    this.userSource.next(user);

    this.sharedService.displayingExpiringSessionModal = false;
    this.checkUserIdleTimout();
  }

  private startRefreshTokenTimer(jwt: string) {
    const decodedToken: any = jwt_decode(jwt);
    // expires in seconds
    const expires = new Date(decodedToken.exp * 1000);
    // 30 seconds before the expiration
    const timeout = expires.getTime() - Date.now() - (30 * 1000);
    this.refreshTokenTimeout = setTimeout(this.refreshToken, timeout);
  }

  private stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }
}
