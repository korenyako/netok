import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface Snapshot {
  hostname: string;
  local_ip: string;
  isp: string;
  public_ip: string;
  status: string;
}

const StatusHeader: React.FC = () => {
  const [data, setData] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result: Snapshot = await invoke('run_all');
        setData(result);
      } catch (error) {
        console.error('Error invoking run_all:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Проверяем соединение…</div>;
  }

  if (!data) {
    return <div>Ошибка загрузки данных</div>;
  }

  return (
    <div>
      <h2>Статус сети</h2>
      <p>Hostname: {data.hostname}</p>
      <p>Local IP: {data.local_ip}</p>
      <p>ISP: {data.isp}</p>
      <p>Public IP: {data.public_ip}</p>
      <p>Status: {data.status}</p>
    </div>
  );
};

export default StatusHeader;