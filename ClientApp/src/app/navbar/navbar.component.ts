import { Component } from '@angular/core';
import { AccountService } from '../account/account.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  collapsed = true;

  constructor(public accountService: AccountService) { }

  logout() {
    this.accountService.logout();
  }

  toggleCollapsed() {
    this.collapsed = !this.collapsed;
  }
}
