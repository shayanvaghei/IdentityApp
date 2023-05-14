import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './shared/components/errors/not-found/not-found.component';
import { PlayComponent } from './play/play.component';
import { AuthorizationGuard } from './shared/guards/authorization.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [AuthorizationGuard],
    children: [
      { path: 'play', component: PlayComponent },
      { path: 'admin', loadChildren: () => import('./admin/admin.module').then(module => module.AdminModule) },
    ]
  },
  // Implenting lazy loading by the following format
  { path: 'account', loadChildren: () => import('./account/account.module').then(module => module.AccountModule) },
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', component: NotFoundComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
