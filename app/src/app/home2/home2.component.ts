import { Component } from '@angular/core';
import { FormationService } from '../../services/formation.service';

@Component({
  selector: 'app-home2',
  templateUrl: './home2.component.html',
  styleUrl: './home2.component.css'
})
export class Home2Component {


  email: string | null = null;
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
  formations: any[] = [];
  filteredFormations: any[] = [];
  searchTerm: string = '';

  constructor(private formationService: FormationService) { }

  ngOnInit(): void {
    this.email=localStorage.getItem('adminEmail');
    this.fetchFormations();
  }

  fetchFormations() {
    this.formationService.getFormations().subscribe(
      (data) => {
        this.formations = data;
        this.filteredFormations = data; // Initialiser filteredFormations avec toutes les formations
        console.log('Formations:', this.formations);
      },
      (error) => {
        console.error('Erreur lors de la récupération des formations:', error);
      }
    );
  }

  deleteFormation(id: string) {
    this.formationService.deleteFormation(id).subscribe(
      () => {
        console.log('Formation deleted successfully');
        this.fetchFormations(); // Réactualiser la liste des formations après la suppression
      },
      error => {
        console.error('Error deleting formation:', error);
      }
    );
  }

  search(): void {
    if (this.searchTerm) {
      // Filtrer les formations en fonction du terme de recherche
      this.filteredFormations = this.formations.filter(formation =>
        formation.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredFormations = this.formations; // Afficher toutes les formations si le terme de recherche est vide
    }
  }
}
