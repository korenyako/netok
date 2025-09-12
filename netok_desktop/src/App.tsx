import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

type NodeInfo = { 
  id: string; 
  name_key: string; 
  status: string; 
  latency_ms?: number; 
  hint_key?: string 
};

type Snapshot = { 
  at_utc: string; 
  nodes: NodeInfo[]; 
  summary_key: string 
};

export default function App() {
  const [data, setData] = useState<Snapshot | null>(null);
  
  const refresh = async () => {
    const json = await invoke<string>("run_diagnostics", { settingsJson: null });
    setData(JSON.parse(json));
  };
  
  return (
    <div style={{ padding: 16 }}>
      <h3>Netok</h3>
      <button onClick={refresh}>Обновить</button>
      {data && (
        <ul>
          {data.nodes.map(n => (
            <li key={n.id}>
              <b>{n.name_key}</b> — {n.status} {n.latency_ms ? `(${n.latency_ms}ms)` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
