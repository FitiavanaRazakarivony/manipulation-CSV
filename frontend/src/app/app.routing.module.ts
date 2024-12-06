import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormComponent } from "./components/form/form.component";
import { AccueilComponent } from "./pages/accueil/accueil.component";

const routes: Routes = [
    { path: '', component: AccueilComponent },

    // a vérifier le loadchildren
    // { path:'', loadChildren:() => import('./pages/accueil/accueil.module').then(m => m.AcceuilModule) },
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forRoot(routes) 
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {}
