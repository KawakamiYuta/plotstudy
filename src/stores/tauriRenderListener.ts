import { listen } from "@tauri-apps/api/event";

export class TauriRenderStream<T> {

    private latest: T | null = null
    private listeners: ((d:T)=>void)[]=[]
    private running=false

    constructor(eventName:string){

        listen<T>(eventName,(e)=>{
            this.latest = e.payload
        })

        this.start()
    }

    subscribe(cb:(d:T)=>void){

        this.listeners.push(cb)

        return ()=>{
            this.listeners = this.listeners.filter(l=>l!==cb)
        }
    }

    private start(){

        if(this.running) return
        this.running=true

        const loop=()=>{

            if(this.latest){

                const frame=this.latest
                this.latest=null

                for(const l of this.listeners)
                    l(frame)
            }

            requestAnimationFrame(loop)
        }

        requestAnimationFrame(loop)
    }
}