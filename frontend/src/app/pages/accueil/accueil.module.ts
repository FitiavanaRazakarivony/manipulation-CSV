import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccueilComponent } from './accueil.component';
import { AccueilRoutingModule } from './accueil-routing.module';
import { FormComponent } from '../../components/form/form.component';
import { CommonModule } from '@angular/common';
import { ListeCSVComponent } from '../../components/liste-csv/liste-csv.component';
@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        AccueilRoutingModule,
    ],
    declarations: [
        AccueilComponent,
        FormComponent,
        ListeCSVComponent
    ],

})
export class AcceuilModule { }
