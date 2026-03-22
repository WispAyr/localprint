import { useEffect, useState } from "react";
import { adminApi, type AdminStats } from "./adminApi";

function MiniBarChart({ data }: { data: { day: string; count: number }[] }) {
  if (!data.length) return <div className="admin-chart-empty">No data</div>;
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="admin-bar-chart">
      {data.map((d, i) => (
        <div key={i} className="admin-bar-col" title={`${d.day}: ${d.count}`}>
          <div className="admin-bar" style={{ height: `${(d.count / max) * 100}%` }} />
          {i % 7 === 0 && <span className="admin-bar-label">{new Date(d.day).getDate()}</span>}
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    adminApi.stats().then(setStats).catch(console.error);
  }, []);

  if (!stats) return <div className="admin-loading">Loading stats...</div>;

  const cards = [
    { label: "Total Users", value: stats.totalUsers, sub: `${stats.activeUsers} active` },
    { label: "Total Designs", value: stats.totalDesigns },
    { label: "Sessions (24h)", value: stats.activeSessions24h },
    { label: "Signups (30d)", value: stats.signupsLast30Days.reduce((s, d) => s + d.count, 0) },
  ];

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Dashboard</h1>
      <div className="admin-stats-grid">
        {cards.map((card) => (
          <div key={card.label} className="admin-stat-card">
            <div className="admin-stat-value">{card.value}</div>
            <div className="admin-stat-label">{card.label}</div>
            {card.sub && <div className="admin-stat-sub">{card.sub}</div>}
          </div>
        ))}
      </div>
      <div className="admin-section">
        <h2 className="admin-section-title">Signups — Last 30 Days</h2>
        <MiniBarChart data={stats.signupsLast30Days} />
      </div>
    </div>
  );
}
