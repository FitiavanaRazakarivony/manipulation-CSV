import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { CsvUploadService } from '../../services/csv/file-upload.service';
@Component({
  selector: 'app-liste-csv',
  templateUrl: './liste-csv.component.html',
  styleUrls: ['./liste-csv.component.css']
})
export class ListeCSVComponent {

  files: any[] = [];  // Tableau de fichiers à afficher
  fileType: string = ''; // Type de fichier sélectionné : 'upload', 'output', ou vide pour tous

  constructor(private fileService: CsvUploadService) { }

  ngOnInit(): void {
    this.loadFiles('output'); // Charger tous les fichiers par défaut
  }

  loadFiles(type?: string): void {
    // Si type est défini, on charge les fichiers du type spécifique (upload/output), sinon on charge tous les fichiers
    this.fileType = type || ''; // Si aucun type, on prend une chaîne vide pour afficher tous les fichiers
    console.log('type', this.fileType);

    this.fileService.getFiles(this.fileType).subscribe({
      next: (data) => {
        console.log('Réponse brute de l\'API:', data); // Vérifiez le format exact
        if (Array.isArray(data)) {
          this.files = data;  // Si la réponse est un tableau
        } else if (data && data.files) {
          this.files = data.files;  // Si la réponse contient 'files'
        } else {
          console.log('Données inattendues :', data); // Si la structure est différente
          this.files = [];
        }
        console.log('Fichiers récupérés:', this.files);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des fichiers:', error);
        // Alerte SweetAlert pour une erreur de récupération
        Swal.fire({
          icon: 'error',
          title: 'Erreur!',
          text: 'Impossible de récupérer les fichiers. Veuillez réessayer plus tard.',
          showConfirmButton: true
        });
      }
    });
  }

  // downloadFile(type: string, fileName: string): void {

  //   const fileUrl = `https://api-manipulation-csv.vercel.app/api/download/${type}/${fileName}`; // URL pour le téléchargement
  //   window.open(fileUrl, '_blank'); // Ouvre le fichier dans un nouvel onglet

  //   // Alerte SweetAlert pour un téléchargement réussi
  //   Swal.fire({
  //     position: 'top-end',
  //     icon: 'success',
  //     title: 'Téléchargement lancé!',
  //     text: `Le fichier ${fileName} est en cours de téléchargement.`,
  //     showConfirmButton: false,
  //     timer: 1500,
  //     timerProgressBar: true,
  //   });
  // }


  downloadFile(type: string, fileName: string): void {
    this.fileService.onDownload(type, fileName);
  }

  deleteFile(fileName: string): void {
    this.fileService.deleteFile(this.fileType, fileName).subscribe({
      next: () => {
        // Remove file from UI if deleted successfully
        this.files = this.files.filter(file => file !== fileName);
        console.log(`${fileName} a été supprimé.`);

        // Alerte SweetAlert pour une suppression réussie
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Fichier supprimé!',
          text: `${fileName} a été supprimé avec succès.`,
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
      },
      error: (error) => {
        console.error('Erreur lors de la suppression du fichier:', error);

        // Alerte SweetAlert pour une erreur de suppression
        Swal.fire({
          icon: 'error',
          title: 'Erreur!',
          text: `La suppression du fichier ${fileName} a échoué. Veuillez réessayer.`,
          showConfirmButton: true
        });
      }
    });
  }
}
