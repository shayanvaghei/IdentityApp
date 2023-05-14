import { Component, OnInit } from '@angular/core';
import { AccountService } from './account/account.service';
import { SharedService } from './shared/shared.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private accountService: AccountService,
    private sharedService: SharedService) {}

  ngOnInit(): void {
    this.refreshUser();
  }

  private refreshUser() {
    const jwt = this.accountService.getJWT();
    if (jwt) {
      this.accountService.refreshUser(jwt).subscribe({
        next: _ => {},
        error: error => {
          this.accountService.logout();
          this.sharedService.showNotification(false, 'Account blocked', error.error);
        }
      })
    } else {
      this.accountService.refreshUser(null).subscribe();
    }
  }
}
