import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { TutorialComponent } from './tutorial/tutorial.component';
import { AjoutformationComponent } from './ajoutformation/ajoutformation.component';
import { LoginComponent } from './login/login.component';
import { FormcoursComponent } from './formcours/formcours.component';

const routes: Routes = [
  {
    path: 'formation',
 
    children: [
      {
        path: '',
        component: HomeComponent
      },
      {
        path: 'ajout',
        component: AjoutformationComponent
      },
      {
        path: ':id/edit',
        component: AjoutformationComponent // Route pour l'édition d'une formation spécifique
      },
      {
        path: ':id/view',
        component: TutorialComponent
      },
      {
        path: ':id/ajoutcours',
        component:FormcoursComponent
      }
    ]
  },
  
  {
    path: '',
    component: LoginComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
