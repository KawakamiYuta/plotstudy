import React, { useEffect, useState } from "react"
import Plot from "react-plotly.js"
import { FrameData, frameStore } from "../stores/frameStore"

// const MAX_LINES = 200
// const FFT_SIZE = 1024
// const EMPTY_LEVEL = 0

// const createInitialData = () =>
//   Array.from({ length: MAX_LINES }, () =>
//     new Array(FFT_SIZE).fill(EMPTY_LEVEL)
//   )

export default function WaterfallCanvas() {

  const [data,setData] = useState<number[][]>([])

  useEffect(()=>{

    const unsubscribe =
      frameStore.subscribe((frame:FrameData)=>{

        setData(prev => {
          const MAX_LINES = 100
          
          if (prev.length == 0) 
            return Array.from({length: MAX_LINES }, () => 
              new Array(frame.spectrum.length).fill(0))

          const next = [...prev, frame.spectrum]



          if(next.length > MAX_LINES)
            next.shift()

          return next
        })

      })

    return unsubscribe

  },[])

  return (

<Plot
  data={[
    {
      z: data,
      type: "heatmap",

      zmin: 0,
      zmax: 160,

      colorscale: "Jet",

      showscale: false
    }
  ]}

  layout={{
    margin:{l:0,r:0,t:0,b:0},

    paper_bgcolor:"var(--bg-main)",
    plot_bgcolor:"var(--bg-panel)",

    xaxis:{
      visible:false,
      fixedrange:true
    },

    yaxis:{
      visible:false,
      fixedrange:true
    }
  }}

  config={{
    displayModeBar:false,
    scrollZoom:false,
    responsive:true
  }}

  style={{
    width:"100%",
    height:"100%"
  }}

  useResizeHandler
/>
  )
}