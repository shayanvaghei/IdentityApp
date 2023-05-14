import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MemberView } from '../shared/models/admin/memberView';
import { environment } from 'src/environments/environment.development';
import { MemberAddEdit } from '../shared/models/admin/memberAddEdit';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

  getMembers() {
    return this.http.get<MemberView[]>(`${environment.appUrl}/api/admin/get-members`);
  }

  getMember(id: string) {
    return this.http.get<MemberAddEdit>(`${environment.appUrl}/api/admin/get-member/${id}`);
  }

  getApplicationRoles() {
    return this.http.get<string[]>(`${environment.appUrl}/api/admin/get-application-roles`);
  }

  addEditMember(model: MemberAddEdit) {
    return this.http.post(`${environment.appUrl}/api/admin/add-edit-member`, model);
  }

  lockMember(id: string) {
    return this.http.put(`${environment.appUrl}/api/admin/lock-member/${id}`, {});
  }

  unlockMember(id: string) {
    return this.http.put(`${environment.appUrl}/api/admin/unlock-member/${id}`, {});
  }

  deleteMember(id: string) {
    return this.http.delete(`${environment.appUrl}/api/admin/delete-member/${id}`, {});
  }
}
