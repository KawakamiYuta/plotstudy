import { create } from "zustand"
import * as FlexLayout from "flexlayout-react"
import { defaultLayout } from "./defaultLayout"

type Tab = {
  // type: string,
  name: string,
  component: string,
  config: any,
}

type LayoutState = {
  model: FlexLayout.Model
  index: number,
  // tabs: TabArguments[]

  // getModel: (model: FlexLayout.Model) => void
  // init: () => void
  addTab: ({name, component, config}: Tab) => void
}


export const useLayoutStore = create<LayoutState>((set, get) => ({
  model: FlexLayout.Model.fromJson(defaultLayout),
  index: 0,
  // tabs: [],  

  addTab: (tab) => {
    const { model, index } = get()
    console.log("addTab", tab)
    
    const uid = `wave-{index}`
    // const model = get().model
    // console.log(model)
    // if (!model) return
    model.doAction(
      FlexLayout.Actions.addNode(
        { type: "tab", id: uid, ...tab},
            // {type:"tab", component:"waveform",
            //    name:"Waveform"},
        "plot-root",
        FlexLayout.DockLocation.CENTER,
        -1
      )
    )
    model.doAction(
      FlexLayout.Actions.popoutTab(uid)
    )
    set({index: index + 1})
    // set({model})
  }
}))