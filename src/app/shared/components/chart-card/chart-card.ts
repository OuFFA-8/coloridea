import {
  Component,
  Input,
  OnInit,
  OnChanges,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject,
  PLATFORM_ID,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart-card.html',
})
export class ChartCard implements OnInit, AfterViewInit, OnChanges {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) type!: 'doughnut' | 'line';
  @Input({ required: true }) data!: number[];

  @ViewChild('chartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private chart: any = null;
  private chartJsLoaded = false;

  ngOnInit() {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadChartJs();
    }
  }

  ngOnChanges() {
    if (this.chart && this.data?.length) {
      this.updateChart();
    }
  }

  async loadChartJs() {
    if (typeof (window as any).Chart === 'undefined') {
      await new Promise<void>((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js';
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    }
    this.chartJsLoaded = true;
    setTimeout(() => this.renderChart(), 100);
  }

  renderChart() {
    if (!this.canvasRef?.nativeElement || !this.chartJsLoaded) return;
    const Chart = (window as any).Chart;
    if (!Chart) return;

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    const textColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';

    if (this.type === 'doughnut') {
      this.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Delivered', 'Remaining'],
          datasets: [
            {
              data: this.data?.length >= 2 ? this.data : [0, 1],
              backgroundColor: [
                'rgba(37,99,235,0.85)',
                isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              ],
              borderColor: [
                'rgb(37,99,235)',
                isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              ],
              borderWidth: 2,
              hoverOffset: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: textColor,
                font: { size: 10, weight: 'bold' },
                padding: 16,
                usePointStyle: true,
                pointStyleWidth: 8,
              },
            },
            tooltip: {
              backgroundColor: isDark ? '#1f2937' : '#fff',
              titleColor: isDark ? '#fff' : '#0f172a',
              bodyColor: textColor,
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              borderWidth: 1,
              padding: 12,
              cornerRadius: 12,
            },
          },
        },
      });
    } else {
      const labels = this.data?.map((_, i) => `Output ${i + 1}`) || [];
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Items Delivered',
              data: this.data || [],
              borderColor: 'rgb(37,99,235)',
              backgroundColor: isDark ? 'rgba(37,99,235,0.08)' : 'rgba(37,99,235,0.06)',
              borderWidth: 2.5,
              pointBackgroundColor: 'rgb(37,99,235)',
              pointBorderColor: isDark ? '#111827' : '#fff',
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7,
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: isDark ? '#1f2937' : '#fff',
              titleColor: isDark ? '#fff' : '#0f172a',
              bodyColor: textColor,
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              borderWidth: 1,
              padding: 12,
              cornerRadius: 12,
            },
          },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: textColor, font: { size: 10 } },
              border: { display: false },
            },
            y: {
              grid: { color: gridColor },
              ticks: { color: textColor, font: { size: 10 }, stepSize: 1 },
              border: { display: false },
              beginAtZero: true,
            },
          },
        },
      });
    }
  }

  updateChart() {
    if (!this.chart) return;
    if (this.type === 'doughnut') {
      this.chart.data.datasets[0].data = this.data;
    } else {
      this.chart.data.labels = this.data?.map((_, i) => `Output ${i + 1}`);
      this.chart.data.datasets[0].data = this.data;
    }
    this.chart.update('active');
  }
}
