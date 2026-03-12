import { IJsonModel } from "flexlayout-react";

export const defaultLayout: IJsonModel = {
  "global": {
  },
  "borders": [],
  "layout": {
    "type": "row",
    "id": "root",
    // "id": "#126f4dd8-6f4f-4e6c-a7fc-64da0db52861",
    "children": [
      {
        "type": "row",
        "id": "#6ea25519-1fc1-41b2-8b1a-3bf75f01b081",
        "weight": 50,
        "children": [
          {
            "type": "tabset",
            "id": "#8183ef08-d18b-4bc4-92b4-f40d6618b717",
            "weight": 8.091908091908092,
            "enableMaximize": false,
            "children": [
              {
                "type": "tab",
                "id": "#5f4c92ad-d08c-49c7-86e1-69adb71e241f",
                "name": "Control",
                "component": "control"
              }
            ]
          },
          {
            "type": "row",
            "id": "#7a7472e5-b620-41bb-92bc-5cf91bd83744",
            "weight": 91.9080919080919,
            "children": [
              {
                "type": "tabset",
                // "id": "#35529e78-0796-45aa-8725-543986c0b24d",
                "id": "plot-root",
                "weight": 50,
                "children": [
                  {
                    "type": "tab",
                    "id": "#25c4fa55-4e38-4d94-b890-8992c710dee5",
                    "name": "Spectrum",
                    "component": "spectrum"
                  },
                  {
                    "type": "tab",
                    "name": "Waterfall",
                    "component": "waterfall"
                  }
                ]
              },
              {
                "type": "tabset",
                "id": "#1a126141-cce6-4e96-8fd5-c477690c54df",
                "weight": 50,
                "children": [
                  {
                    "type": "tab",
                    "id": "#5dd970d8-2747-46b6-8344-2de5f704ab37",
                    "name": "Detections",
                    "component": "detection"
                  }
                ],
                "active": true
              }
            ]
          }
        ]
      }
    ]
  },
  "popouts": {}
}