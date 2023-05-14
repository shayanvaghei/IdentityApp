import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminGuard } from '../shared/guards/admin.guard';
import { AddEditMemberComponent } from './add-edit-member/add-edit-member.component';

const routes: Routes = [
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [AdminGuard],
    children: [
      { path: '', component: AdminComponent},
      // path for creating a new member
      { path: 'add-edit-member', component: AddEditMemberComponent},
      // path for editing an existing member
      { path: 'add-edit-member/:id', component: AddEditMemberComponent},
    ]
  },
]

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AdminRoutingModule { }
