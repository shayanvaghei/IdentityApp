import { Injectable } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { NotificationComponent } from './components/modals/notification/notification.component';
import { ExpiringSessionCountdownComponent } from './components/modals/expiring-session-countdown/expiring-session-countdown.component';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  bsModalRef?: BsModalRef;
  displayingExpiringSessionModal = false;

  constructor(private modalService: BsModalService) { }

  showNotification(isSuccess: boolean, title: string, message: string) {
    const initalState: ModalOptions = {
      initialState: {
        isSuccess,
        title,
        message
      }
    };

    this.bsModalRef = this.modalService.show(NotificationComponent, initalState);
  }

  openExpiringSessionCountdown = async () => {
    const config: ModalOptions = {
      backdrop: 'static',
      keyboard: false,
      ignoreBackdropClick: true
    }

    this.bsModalRef = this.modalService.show(ExpiringSessionCountdownComponent, config);
  }
}
