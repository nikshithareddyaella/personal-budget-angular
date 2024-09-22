import { Component, ElementRef, Inject, Input, PLATFORM_ID, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables} from 'chart.js';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'pb-homepage',
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent implements AfterViewInit {
  canvas: any;
  ctx: any;
  response: any;
  myChart: any;


  public dataSource={
    datasets:[
        {
            data: [30, 350, 90],
            backgroundColor: [
            '#ffcd56',
            '#ff6384',
            '#36a2eb',
            '#fd6b19',
            '#FF00FF',
            '#7d3c98',
            '#DAF7A6',
            '#900C3F',
            '#FFC300',
            ],
        }
    ],

    labels: [
        'Eat out',
        'Rent',
        'Groceries'
    ]
};

constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: any) {
  Chart.register(...registerables);
}

ngAfterViewInit(): void {

      this.http.get('http://localhost:3000/budget')
      .subscribe((res: any) => {
        for(var i =0; i< res.myBudget.length; i++){
          this.dataSource.datasets[0].data[i] = res.myBudget[i].budget;
          this.dataSource.labels[i] = res.myBudget[i].title;
        }
          this.createChart();
      });
  }

  createChart(): void {
      const ctx = <HTMLCanvasElement>document.getElementById('myChart');
      var myPieChart = new Chart(ctx, {
        type: 'pie',
        data: this.dataSource,
      });
    }



}
