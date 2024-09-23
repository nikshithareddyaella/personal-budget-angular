import { Component, OnInit } from '@angular/core';
import { DataService, BudgetItem } from '../data.service';
import { Chart, registerables } from 'chart.js';
import * as d3 from 'd3';

@Component({
  selector: 'pb-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {
  myChart: any;
  pie = d3.pie<BudgetItem>().value(d => d.budget);

  public dataSource: {
    datasets: {
      data: number[];
      backgroundColor: string[];
    }[];
    labels: string[];
  } = {
    datasets: [
      {
        data: [], // This should be initialized as an empty array
        backgroundColor: [
          '#ffcd56', '#ff6384', '#36a2eb', '#fd6b19', '#FF00FF',
          '#7d3c98', '#DAF7A6', '#900C3F', '#FFC300'
        ],
      }
    ],
    labels: [] // Initialize this as an empty array of strings
  };

  constructor(private dataService: DataService) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {

  this.dataService.fetchBudgetDataIfNeeded();

  // Subscribe to the BehaviorSubject to get updated data
  this.dataService.getBudgetData().subscribe((budgetData) => {
     if (budgetData.length > 0) {
      console.log('Budget Data:', budgetData); // Check if data is being received
       this.createChart(budgetData);
       this.createD3Charts(budgetData);
     }
   });

  }

  createChart(budgetData: BudgetItem[]): void {
    // Destroy previous chart if it exists
    if (this.myChart) {
      this.myChart.destroy();
    }

    // Update dataSource with new budget data
    this.dataSource.datasets[0].data = budgetData.map(item => item.budget);
    this.dataSource.labels = budgetData.map(item => item.title);

    const ctx = <HTMLCanvasElement>document.getElementById('myChart');
    if (ctx) {
      this.myChart = new Chart(ctx, {
        type: 'pie',
        data: this.dataSource,
      });
    } else {
      console.error('Canvas element not found');
    }
  }


  createD3Charts(myBudget: BudgetItem[]): void {
    this.createPieChart(myBudget);
    this.createBarChart(myBudget);
  }

  createPieChart(data: BudgetItem[]): void {
    if (!data || data.length === 0) {
      console.error('No data provided for pie chart');
      return;
    }
    const width = 700, height = 400, radius = Math.min(width, height) / 2;

    d3.select("#d3PieChart").selectAll("*").remove(); // Clear previous charts
    const svgPie = d3.select("#d3PieChart").append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const arc = d3.arc<d3.PieArcDatum<BudgetItem>>().outerRadius(radius * 0.5).innerRadius(0);
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Tooltip setup
    const tooltip = d3.select("#d3PieChart").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#f4f4f4")
      .style("padding", "5px")
      .style("border", "1px solid #333")
      .style("border-radius", "5px")
      .style("text-align", "center");

    const arcs = svgPie.selectAll(".arc")
      .data(this.pie(data))
      .enter().append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("d", arc)
      .style("fill", (d) => color(d.data.title))
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible")
          .text(`${d.data.title}: $${d.data.budget}`);
      })
      .on("mousemove", (event) => {
        tooltip.style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

    arcs.append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("dy", ".35em")
      .text((d) => d.data.title);
  }

  createBarChart(data: BudgetItem[]): void {
    const margin = { top: 20, right: 30, bottom: 40, left: 40 },
      width = 500 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

    d3.select("#barChart").selectAll("*").remove(); // Clear previous charts
    const svgBar = d3.select("#barChart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const maxBudget = d3.max(data, d => d.budget) || 0;

    const x = d3.scaleLinear()
      .domain([0, maxBudget]).nice()
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(data.map(d => d.title))
      .range([0, height])
      .padding(0.1);

    // Tooltip setup
    const tooltip = d3.select("#barChart").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#f4f4f4")
      .style("padding", "5px")
      .style("border", "1px solid #333")
      .style("border-radius", "5px")
      .style("text-align", "center");

    svgBar.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", (d: BudgetItem) => y(d.title) || 0) // Default to 0 if y is undefined
      .attr("width", (d: BudgetItem) => x(d.budget || 0)) // Default to 0 if budget is undefined
      .attr("height", y.bandwidth())
      .attr("fill", (d, i) => d3.schemeCategory10[i])
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible")
          .text(`${d.title}: $${d.budget}`);
      })
      .on("mousemove", (event) => {
        tooltip.style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

    svgBar.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svgBar.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y));
  }

  updateD3Charts(): void {
    this.dataService.getBudgetData().subscribe((budgetData) => {
      this.createD3Charts(budgetData);
    });
  }
}
