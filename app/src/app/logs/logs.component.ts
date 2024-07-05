import { Component, OnInit } from '@angular/core';
import { LogService } from '../../services/logs.service';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent implements OnInit {
  logs: any[] = [];

  constructor(private logService: LogService) { }

  ngOnInit(): void {
    this.fetchLogs();
  }

  fetchLogs(): void {
    this.logService.getLogs().subscribe(
      (data) => {
        this.logs = data;
        console.log('Logs:', this.logs);
      },
      (error) => {
        console.error('Error fetching logs:', error);
      }
    );
  }
}
