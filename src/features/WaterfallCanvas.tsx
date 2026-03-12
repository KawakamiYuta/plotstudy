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
          // colorscale: "Jet",
          colorscale: "Jet",
          showscale: false,

          zmin: 0,
          zmax: 160
        }
      ]}
      layout={{
  paper_bgcolor: "#0b1119",   // アプリ背景
  plot_bgcolor: "#0f1722",    // パネル背景

  margin:{l:40,r:10,t:10,b:30},

  xaxis:{
    color:"#8fa1b8",
    gridcolor:"#1d2a3a",
    zeroline:false
  },

  yaxis:{
    color:"#8fa1b8",
    gridcolor:"#1d2a3a",
    zeroline:false,
    visible: false,
    // autorange:"reversed"
  }
      }}
      style={{
        width:"100%",
        height:"100%"
      }}
      useResizeHandler={true}
      config={{
        displayModeBar:false
      }}
    />

  )
}