import { useTabStore } from "./stores/useTabStore"

export function TabBar() {
  const { tabs, activeTab, setActive, closeTab } = useTabStore()

  return (
    <div className="tabbar">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={tab.id === activeTab ? "tab active" : "tab"}
          onClick={() => setActive(tab.id)}
        >
          {tab.title}
          <button onClick={() => closeTab(tab.id)}>×</button>
        </div>
      ))}
    </div>
  )
}

export function TabContent() {
  const { tabs, activeTab } = useTabStore()

  const tab = tabs.find((t) => t.id === activeTab)
  if (!tab) return null

  return <div className="tab-content">{tab.content}</div>
}