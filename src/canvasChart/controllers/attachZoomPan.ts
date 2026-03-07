import { Viewport } from "../viewport"
import { ChartTransform } from "../chartTransform"

export function attachZoomPan(
  canvas:HTMLCanvasElement,
  view:Viewport,
  transform:ChartTransform,
  requestRender:()=>void
){

  let dragging=false
  let lastX=0

  canvas.addEventListener("wheel",(e)=>{

    const zoomFactor=1.1

    const chartX =
      transform.canvasToChartX(e.offsetX)

    const mouseBin =
      transform.chartToBin(chartX)

    if (e.deltaY<0)
      view.pxPerUnit*=zoomFactor
    else
      view.pxPerUnit/=zoomFactor

    view.pxPerUnit=
      Math.max(0.2,Math.min(50,view.pxPerUnit))

    view.offset =
      mouseBin -
      chartX/view.pxPerUnit

    requestRender()

  })

  canvas.addEventListener("mousedown",(e)=>{

    dragging=true
    lastX=e.clientX

  })

  window.addEventListener("mouseup",()=>{

    dragging=false

  })

  window.addEventListener("mousemove",(e)=>{

    if(!dragging) return

    const dx=e.clientX-lastX
    lastX=e.clientX

    view.offset -= dx/view.pxPerUnit

    requestRender()

  })
}