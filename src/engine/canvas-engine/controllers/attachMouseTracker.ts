import { CrosshairLayer } from "../layers/crosshairLayer"
import { ChartTransform } from "../chartTransform"

export function attachMouseTracker(
  canvas:HTMLCanvasElement,
  crosshair:CrosshairLayer,
  transform:ChartTransform,
  requestRender:()=>void
){

  canvas.addEventListener("mousemove",(e)=>{

    const rect = canvas.getBoundingClientRect()

    const canvasX = e.clientX - rect.left
    const canvasY = e.clientY - rect.top

    crosshair.mouseX =
      transform.canvasToChartX(canvasX)

    crosshair.mouseY =
      canvasY

    requestRender()
  })

  canvas.addEventListener("mouseleave",()=>{

    crosshair.mouseX = null
    crosshair.mouseY = null

    requestRender()
  })
}