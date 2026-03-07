import { Viewport } from "./viewport"
import { Margin } from "./types/margin"

export class ChartTransform {

  constructor(
    public width:number,
    public height:number,
    public margin:Margin,
    public view:Viewport
  ) {}

  get chartWidth(){
    return this.width - this.margin.left - this.margin.right
  }

  get chartHeight(){
    return this.height - this.margin.top - this.margin.bottom
  }

  // canvas → chart
  canvasToChartX(x:number){
    return x - this.margin.left
  }

  canvasToChartY(y:number){
    return y - this.margin.top
  }

  // chart → canvas
  chartToCanvasX(x:number){
    return x + this.margin.left
  }

  chartToCanvasY(y:number){
    return y + this.margin.top
  }

  // chart → bin
  chartToBin(x:number){
    return this.view.offset + x / this.view.pxPerUnit
  }

  // bin → chart
  binToChart(bin:number){
    return (bin - this.view.offset) * this.view.pxPerUnit
  }

  resize(width:number, height:number){
    this.width = width
    this.height = height
  }
}