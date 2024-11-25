import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule) },
  { path: 'signup', loadChildren: () => import('./pages/signup/signup.module').then( m => m.SignupPageModule) },
  { path: 'landing', loadChildren: () => import('./pages/landing/landing.module').then( m => m.LandingPageModule) },
  { path: 'resetpassword', loadChildren: () => import('./pages/reset-password/reset-password.module').then( m => m.ResetPasswordPageModule) },
  { path: 'home', loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule), canActivate: [AuthGuard] }, // Aplica el guard aquí
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
