export class WaterfallRingBuffer {

    private ring: Float32Array
    private writeIndex = 0
    private count = 0
    private newestFrameNo = -1

    constructor(
        readonly rowSize: number,
        readonly capacity: number
    ) {
        this.ring = new Float32Array(rowSize * capacity)
    }

    push(frameNo: number, row: Float32Array) {

        if (row.length !== this.rowSize) {
            throw new Error("row size mismatch")
        }

        const offset = this.writeIndex * this.rowSize
        this.ring.set(row, offset)

        this.writeIndex = (this.writeIndex + 1) % this.capacity

        if (this.count < this.capacity) {
            this.count++
        }

        this.newestFrameNo = frameNo
    }

    getNewestFrameNo() {
        return this.newestFrameNo
    }

    /** newest = 0 */
    getRow(age: number): Float32Array {

        if (age >= this.count) {
            throw new Error("row out of range")
        }

        const index =
            (this.writeIndex - 1 - age + this.capacity) % this.capacity

        const start = index * this.rowSize
        const end = start + this.rowSize

        return this.ring.subarray(start, end)
    }

    /** oldest row */
    getOldestRow(): Float32Array {

        const index =
            (this.writeIndex - this.count + this.capacity) % this.capacity

        const start = index * this.rowSize
        const end = start + this.rowSize

        return this.ring.subarray(start, end)
    }

    /** newest row */
    getNewestRow(): Float32Array {
        return this.getRow(0)
    }

    size() {
        return this.count
    }
}