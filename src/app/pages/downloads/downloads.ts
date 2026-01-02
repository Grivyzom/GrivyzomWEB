import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DownloadsService, DownloadableFile } from '../../core/services/downloads.service';
import { LucideAngularModule, Download, FileText, Shield } from 'lucide-angular';

@Component({
  selector: 'app-downloads',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './downloads.html',
  styleUrls: ['./downloads.css']
})
export class DownloadsComponent implements OnInit {
  private readonly downloadsService = inject(DownloadsService);
  
  readonly icons = { Download, FileText, Shield };
  
  files = signal<DownloadableFile[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadFiles();
  }

  loadFiles(): void {
    this.loading.set(true);
    this.downloadsService.getFiles().subscribe({
      next: (response) => {
        this.files.set(response.files);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading files:', err);
        this.error.set('No se pudieron cargar los archivos.');
        this.loading.set(false);
      }
    });
  }

  onDownload(fileId: number): void {
    this.downloadsService.downloadFile(fileId);
  }
}
