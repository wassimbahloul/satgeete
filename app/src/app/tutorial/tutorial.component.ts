import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CourseServiceService } from '../../services/course-service.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.css']
})
export class TutorialComponent implements OnInit {
  formationId!: string;
  courses: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseServiceService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.formationId = this.route.snapshot.params['id'];
    this.loadCourses();
  }

  loadCourses(): void {
    this.courseService.getCoursesByFormationId(this.formationId).subscribe(
      (data: any[]) => {
        this.courses = data.map(course => ({
          ...course,
          showVideos: false,
          videos: course.videos.map((video: any) => ({
            ...video,
            safeUrl: this.getSafeVideoUrl(video.url)
          }))
        }));
      },
      (error) => {
        console.error('Error loading courses:', error);
      }
    );
  }

  showVideos(course: any): void {
    course.showVideos = !course.showVideos;
  }

  getSafeVideoUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  isCloudinaryVideo(video: any): boolean {
    return video.url.startsWith('https://res.cloudinary.com');
  }

  isYouTubeVideo(video: any): boolean {
    return video.url.includes('youtu.be') || video.url.includes('youtube.com');
  }
  
  getYouTubeEmbedUrl(url: string): SafeResourceUrl {
    const videoId = this.getYouTubeVideoId(url);
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
  
  getYouTubeVideoId(url: string): string | null {
    // Détecter l'ID de la vidéo YouTube à partir de l'URL
    const youtubeRegex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?/]+)/;
    const match = url.match(youtubeRegex);
    return match && match[1];
  }
  deleteCourse(id: string): void {
    this.courseService.deleteCourse(id).subscribe(
      () => {
        // Mettre à jour la liste des cours après suppression
        this.courses = this.courses.filter(course => course._id !== id);
        console.log(`Course with id ${id} deleted successfully.`);
      },
      (error) => {
        console.error(`Error deleting course with id ${id}:`, error);
        // Gestion de l'erreur (affichage d'un message à l'utilisateur, par exemple)
      }
    );
  }
  
}