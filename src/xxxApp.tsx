import { Layout, Model } from "flexlayout-react";
import "flexlayout-react/style/light.css";
import "./styles.css";
import { useRef } from "react";

var json = {
  global: {
    tabSetEnableDrop: true,
    tabEnableClose: true,
    tabSetEnableDrag: true,
    tabEnableDrag: true,
  },
  borders: [],
  layout: {
    type: "tabset",
    weight: 100,
    children: [
      {
        type: "tabset",
        weight: 50,
        children: [
          {
            type: "tab",
            name: "One",
            component: "placeholder",
          },
        ],
      },
      {
        type: "tabset",
        weight: 50,
        children: [
          {
            type: "tab",
            name: "Two",
            component: "placeholder",
          },
        ],
      },
    ],
  },
};
export default function App() {
  const model = useRef(Model.fromJson(json));

  const factory = (node) => {
    var component = node.getComponent();

    if (component === "placeholder") {
      return <div className="placeholder">{node.getName()}</div>;
    }
    return null;
  };

  return (
    <div style={{ height: "100%" }}>
  <Layout model={model.current} factory={factory} />;
  </div>
  )
}
