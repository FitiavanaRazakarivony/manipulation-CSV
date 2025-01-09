import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CsvUploadService } from '../../services/csv/file-upload.service';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'my-form',
  templateUrl: './form.component.html',
})
export class FormComponent {
  name = 'Manipulation CSV';
  public userForm: FormGroup;
  file: File | null = null;
  downloadLink: string | null = null;
  headers: string[] = [];  // Stocker les entêtes du fichier CSV
  allHeaders: Set<string> = new Set();  // Utiliser un Set pour éviter les doublons
  showHeaderOptions = false; // Contrôle l'affichage du bloc

  constructor(
    private _fb: FormBuilder,
    private csvUploadService: CsvUploadService,
    private cdr: ChangeDetectorRef
  ) {
    // Initialisation du formulaire principal
    this.userForm = this._fb.group({
      nameOutPut: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern(/^(?!.*\d)(?!.*<\?php)(?!.*@)(?!.*%)[a-zA-ZÀ-ÿ]+([ '-][a-zA-ZÀ-ÿ]+)*$/),
        ],
      ],
      typeJoin: [''], // Facultatif si un seul fichier
      filterCriteria: [''], // Champ initialisé avec une valeur vide par défaut
      address: this._fb.array([this.addAddressGroup()]),
    });
  }

  // Méthode pour basculer l'affichage des entêtes et du critère de filtre
  toggleHeaderOptions(): void {
    this.showHeaderOptions = !this.showHeaderOptions;
  }

  // Ajouter un nouveau groupe dans FormArray
  private addAddressGroup(): FormGroup {
    return this._fb.group({
      file: [null, Validators.required],
      headerFile: [''], // Ajouter un contrôle pour l'entête sélectionné
    });
  }

  // Getter pour accéder au FormArray
  get addressArray(): FormArray {
    return this.userForm.get('address') as FormArray;
  }

  // Ajouter un nouveau groupe d'adresse
  addAddress(): void {
    this.addressArray.push(this.addAddressGroup());
  }

  // Supprimer un groupe d'adresse
  removeAddress(index: number): void {
    this.addressArray.removeAt(index);

    if (this.addressArray.length <= 1) {
      // Réinitialiser typeJoin s'il n'est plus nécessaire
      this.userForm.get('typeJoin')?.reset('');
      this.cdr.detectChanges(); // Force la détection des changements
    }
  }

  // Gérer le changement de fichier
  onFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileControl = this.addressArray.at(index)?.get('file');
      if (fileControl) {
        fileControl.setValue(file); // Associe le fichier au contrôle
        console.log(`Fichier ajouté au contrôle ${index}:`, file.name);
      } else {
        console.warn(`Contrôle non trouvé à l'index ${index}`);
      }
    } else {
      console.warn('Aucun fichier sélectionné.');
    }
  }


  // Méthode pour extraire les en-têtes du CSV
  private extractCsvHeaders(csvContent: string): string[] {
    // Diviser le contenu du CSV en lignes
    const lines = csvContent.split('\n');

    // Vérifier si le fichier contient au moins une ligne
    if (lines.length > 0) {
      // Analyser la première ligne pour détecter le séparateur
      const firstLine = lines[0].trim();

      // Détecter le séparateur en fonction de la présence de ; ou ,
      let separator = ',';
      if (firstLine.indexOf(';') > -1) {
        separator = ';'; // Si le séparateur est un point-virgule
      }

      // Extraire les en-têtes en fonction du séparateur détecté
      const headers = firstLine
        .split(separator)  // Utiliser le séparateur détecté
        .map(header => header.trim().replace(/(^"|"$)/g, '')); // Supprimer les guillemets autour des valeurs

      // Filtrer les en-têtes vides
      return headers.filter(header => header.length > 0);
    }

    return [];
  }

  // Soumettre le formulaire
  uploadFile(): void {
    const formData = new FormData();

    // Ajout des champs du formulaire
    formData.append('nameOutPut', this.userForm.get('nameOutPut')?.value);
    const typeJoin = this.userForm.get('typeJoin')?.value;

    if (typeJoin) {
      formData.append('typeJoin', typeJoin);
    }

    const filterCriteria = this.userForm.get('filterCriteria')?.value;
    console.log('filterCriteria :', filterCriteria);

    if (filterCriteria) {
      formData.append('filterCriteria', filterCriteria);
    }

    // Ajout des fichiers
    this.addressArray.controls.forEach((control) => {
      const file = control.get('file')?.value;

      if (file) {
        formData.append('file', file, file.name); // Ajout des fichiers
      }
    });

    console.log(formData);

    // Envoi des données
    this.csvUploadService.uploadCsv(formData).subscribe(
      (response: any) => {
        this.downloadLink = response.finalCsvPath;

        // Afficher une alerte SweetAlert en cas de succès
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Fichier téléversé avec succès!',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      },
      (error) => {
        console.error('Erreur:', error);
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: 'Échec du téléversement.',
          text: error?.message || 'Une erreur est survenue.',
          showConfirmButton: true,
        });
      }
    );
  }
}
