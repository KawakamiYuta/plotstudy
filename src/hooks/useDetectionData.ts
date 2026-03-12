import { useState, useEffect } from "react"

export type Detection = {
  frame_id: number
  freq: number
  power: number
  snr: number
  timestamp: number
}

export function useDetectionData(): Detection[] {
  const [data, setData] = useState<Detection[]>([])

  useEffect(() => {
    setData(generateFakeDetections(30))
  }, [])

  return data
}

function generateFakeDetections(count: number): Detection[] {
  const baseFreq = 1000
  const startTime = Date.now()

  return Array.from({ length: count }, (_, i) => {
    const freqJitter = (Math.random() - 0.5) * 50
    const power = -40 + Math.random() * 20
    const snr = 5 + Math.random() * 20

    return {
      frame_id: i,
      freq: baseFreq + freqJitter,
      power: parseFloat(power.toFixed(2)),
      snr: parseFloat(snr.toFixed(2)),
      timestamp: startTime + i * 100,
    }
  })
}