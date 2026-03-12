export interface Layer {
  draw(ctx: CanvasRenderingContext2D): void
}

export class Chart {
  layers: Layer[] = []

  add(layer: Layer) {
    this.layers.push(layer)
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const l of this.layers) {
      l.draw(ctx)
    }
  }
}