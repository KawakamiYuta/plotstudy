type SliderControlProps = {
  label: string
  value: number
  min?: number
  max?: number
  onChange: (v:number)=>void
}

export function SliderControl({
  label,
  value,
  min = 0,
  max = 100,
  onChange
}: SliderControlProps){

  return (
    <div className="slider-group">

      <span>{label}</span>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e)=>onChange(Number(e.target.value))}
      />

      <span className="slider-value">
        {value}
      </span>

    </div>
  )
}