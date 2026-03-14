import { listen } from "@tauri-apps/api/event";

export class TauriDataStream<T>{

    private listeners:((d:T)=>void)[]=[]

    constructor(eventName:string){

        listen<T>(eventName,(e)=>{

            for(const l of this.listeners)
                l(e.payload)

        })
    }

    subscribe(cb:(d:T)=>void){

        this.listeners.push(cb)

        return ()=>{
            this.listeners=this.listeners.filter(l=>l!==cb)
        }
    }
}