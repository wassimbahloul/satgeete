import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseServiceService } from '../../services/course-service.service';

@Component({
  selector: 'app-formcours',
  templateUrl: './formcours.component.html',
  styleUrls: ['./formcours.component.css']
})
export class FormcoursComponent {
  form!: FormGroup;
  isEditing = false;
  courseId!: string;
  formationId!: string;
  selectedFiles: File[] = [];
  videoUrls: string[] = []; // Array to store video URLs

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private courseService: CourseServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.formationId = this.route.snapshot.params['id'];
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
      videos: [null, Validators.required],
      videoUrl: [''],
      formationId: [this.formationId, Validators.required]
    });
  }

  onFilesSelected(event: any): void {
  const files: FileList = event.target.files;
  if (files) {
    const newlySelectedFiles = Array.from(files) as File[];
    for (const file of newlySelectedFiles) {
      if (file.type === 'video/mp4') {
        this.selectedFiles.push(file);
      } else {
        console.warn(`Le fichier ${file.name} n'est pas de type MP4 et ne sera pas ajouté.`);
      }
    }
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
    if (this.form.valid) {
      const formData = new FormData();
      formData.append('formationId', this.form.get('formationId')?.value);
      formData.append('nom', this.form.get('nom')?.value);
      formData.append('explication', this.form.get('explication')?.value);

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
            console.log('Course mis à jour avec succès.');
            this.router.navigate(['/formations', this.formationId]);
          },
          (error) => {
            console.error('Erreur lors de la mise à jour du cours :', error);
          }
        );
      } else {
        this.courseService.createCourse(formData).subscribe(
          () => {
            console.log('Course ajouté avec succès.');
            this.router.navigate(['/formations', this.formationId]);
          },
          (error) => {
            console.error('Erreur lors de l\'ajout du cours :', error);
          }
        );
      }
    } else {
      console.error('Le formulaire n\'est pas valide.');
    }
  }
}
