import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CourseServiceService } from '../../services/course-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LogService } from '../../services/logs.service';

@Component({
  selector: 'app-formcours1',
  templateUrl: './formcours1.component.html',
  styleUrls: ['./formcours1.component.css']
})
export class Formcours1Component implements OnInit {
  form!: FormGroup;
  isEditing = false;
  courseId!: string;
  formationId!: string;
  selectedFiles: File[] = [];
  videoUrls: string[] = []; // Array to store video URLs
  invalidFileType = false; // Flag to check invalid file types
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private courseService: CourseServiceService,
    private router: Router,
    private logService: LogService // Inject the LogService
  ) {}

  ngOnInit(): void {
    this.formationId = this.route.snapshot.params['id'];
    this.courseId = this.route.snapshot.params['courseId']; // Assuming courseId is passed in the route for editing
    this.initForm();

    if (this.courseId) {
      this.isEditing = true;
      this.courseService.getCourse(this.courseId).subscribe(
        (course) => {
          this.form.patchValue(course);
        },
        (error) => {
          console.error('Erreur lors de la récupération du cours :', error);
        }
      );
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      explication: ['', Validators.required],
      pdf: ['', Validators.required],
      videos: [null],
      videoUrl: [''],
      formationId: [this.formationId, Validators.required]
    });
  }

  onFilesSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files) {
      const newlySelectedFiles = Array.from(files) as File[];
      const invalidFiles = newlySelectedFiles.some(file => file.type !== 'video/mp4');

      if (invalidFiles) {
        this.invalidFileType = true;
        return;
      } else {
        this.invalidFileType = false;
      }

      this.selectedFiles.push(...newlySelectedFiles);
      this.form.get('videos')?.setValue(this.selectedFiles);
    }
  }

  addVideoUrl(): void {
    const videoUrl = this.form.get('videoUrl')?.value;
    if (videoUrl) {
      this.videoUrls.push(videoUrl);
      this.form.get('videoUrl')?.setValue('');
    }
  }

  removeSelectedFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.form.get('videos')?.setValue(this.selectedFiles);
  }

  removeVideoUrl(index: number): void {
    this.videoUrls.splice(index, 1);
  }

  onSubmit(): void {
    if (this.form.valid && (this.selectedFiles.length > 0 || this.videoUrls.length > 0)) {
      this.isLoading = true;
      const formData = new FormData();
      formData.append('formationId', this.form.get('formationId')?.value);
      formData.append('nom', this.form.get('nom')?.value);
      formData.append('explication', this.form.get('explication')?.value);
      formData.append('pdf', this.form.get('pdf')?.value);

      // Add each video file to FormData
      this.selectedFiles.forEach(file => {
        formData.append('videos', file);
      });

      // Add each video URL to FormData
      this.videoUrls.forEach(url => {
        formData.append('videoUrls', url);
      });

      if (this.isEditing) {
        this.courseService.updateCourse(this.courseId, formData).subscribe(
          () => {
            const updatedNom = this.form.get('nom')?.value; // Get the name of the updated course
            this.logAction('update', updatedNom); // Log the update action
            console.log('Course mis à jour avec succès.');
            this.router.navigate(['/formations', this.formationId]);
          },
          (error) => {
            console.error('Erreur lors de la mise à jour du cours :', error);
            this.isLoading = false;
          }
        );
      } else {
        this.courseService.createCourse(formData).subscribe(
          () => {
            const createdNom = this.form.get('nom')?.value; // Get the name of the created course
            this.logAction('create', createdNom); // Log the create action
            console.log('Course ajouté avec succès.');
            this.router.navigate(['/formation', this.formationId, 'viewadmin1']);
          },
          (error) => {
            console.error('Erreur lors de l\'ajout du cours :', error);
            this.isLoading = false;
          }
        );
      }
    } else {
      console.error('Le formulaire n\'est pas valide ou aucune vidéo n\'a été ajoutée.');
    }
  }

  logAction(action: string, nom: string): void {
    const email = localStorage.getItem('admin'); // Assuming 'admin' is stored when the admin logs in
    if (email) {
      this.logService.createLog(email, action, nom).subscribe(
        () => {
          console.log('Action logged successfully.');
        },
        (error) => {
          console.error('Error logging action:', error);
        }
      );
    }
  }
}
