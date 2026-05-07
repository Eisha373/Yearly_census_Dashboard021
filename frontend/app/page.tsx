"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ─── Mock Data (replace with live contract calls later) ───────────────────────
const MOCK_MEMBER_COUNT = 142;

const MOCK_COUNTRY_DATA = [
  { country: "Pakistan", members: 38 },
  { country: "USA", members: 31 },
  { country: "India", members: 24 },
  { country: "Germany", members: 18 },
  { country: "UAE", members: 15 },
  { country: "Others", members: 16 },
];

const MOCK_INCOME_DATA = [
  { tier: "Tier 1\n< $10k", count: 45 },
  { tier: "Tier 2\n$10k–50k", count: 63 },
  { tier: "Tier 3\n> $50k", count: 34 },
];

const BAR_COLORS = ["#1D9E75", "#378ADD", "#7F77DD", "#D85A30", "#D4537E", "#888780"];

// ─── Types ────────────────────────────────────────────────────────────────────
type CountryEntry = { country: string; members: number };
type IncomeEntry = { tier: string; count: number };

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
}) {
  return (
    <div
      style={{
        background: "#0f1117",
        border: `1px solid ${accent}33`,
        borderRadius: 16,
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: accent,
          borderRadius: "16px 16px 0 0",
        }}
      />
      <span
        style={{
          fontSize: 12,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#6b7280",
          fontFamily: "monospace",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 42,
          fontWeight: 700,
          color: "#f9fafb",
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </span>
      {sub && (
        <span style={{ fontSize: 13, color: "#6b7280" }}>{sub}</span>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 13,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "#6b7280",
        fontFamily: "monospace",
        marginBottom: "1rem",
      }}
    >
      {children}
    </h2>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CensusDashboard() {
  const [memberCount, setMemberCount] = useState(0);
  const [countryData] = useState<CountryEntry[]>(MOCK_COUNTRY_DATA);
  const [incomeData] = useState<IncomeEntry[]>(MOCK_INCOME_DATA);
  const [isLive] = useState(false); // flip to true once contract is connected

  // Animate member count on load
  useEffect(() => {
    let start = 0;
    const end = MOCK_MEMBER_COUNT;
    const duration = 1200;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setMemberCount(end);
        clearInterval(timer);
      } else {
        setMemberCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#080a0f",
        color: "#f9fafb",
        fontFamily: "'Segoe UI', sans-serif",
        padding: "2rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "2.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#1D9E75",
              fontFamily: "monospace",
              marginBottom: 6,
            }}
          >
            Network State
          </div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              margin: 0,
              letterSpacing: "-0.02em",
              color: "#f9fafb",
            }}
          >
            Yearly Census Dashboard
          </h1>
          <p style={{ color: "#6b7280", marginTop: 6, fontSize: 14 }}>
            Verified citizen data — powered by ZK Proofs &amp; Blockchain
          </p>
        </div>

        {/* Live / Mock Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: isLive ? "#0f2a1e" : "#1a1a2e",
            border: `1px solid ${isLive ? "#1D9E75" : "#378ADD"}`,
            borderRadius: 99,
            padding: "6px 14px",
            fontSize: 12,
            fontFamily: "monospace",
            color: isLive ? "#1D9E75" : "#378ADD",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: isLive ? "#1D9E75" : "#378ADD",
              display: "inline-block",
            }}
          />
          {isLive ? "Live — On-chain data" : "Mock data — contract pending"}
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2.5rem",
        }}
      >
        <MetricCard
          label="Active Members"
          value={memberCount}
          sub="Verified citizens this cycle"
          accent="#1D9E75"
        />
        <MetricCard
          label="Countries Represented"
          value={countryData.length}
          sub="Across 6 regions"
          accent="#378ADD"
        />
        <MetricCard
          label="Income Tiers Verified"
          value={incomeData.reduce((s, d) => s + d.count, 0)}
          sub="ZK proofs submitted"
          accent="#7F77DD"
        />
      </div>

      {/* ── Charts Row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {/* Country Distribution */}
        <div
          style={{
            background: "#0f1117",
            border: "1px solid #1f2937",
            borderRadius: 16,
            padding: "1.5rem",
          }}
        >
          <SectionTitle>Country Distribution</SectionTitle>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={countryData}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="country"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: 8,
                  color: "#f9fafb",
                  fontSize: 13,
                }}
                cursor={{ fill: "#ffffff08" }}
              />
              <Bar dataKey="members" radius={[4, 4, 0, 0]}>
                {countryData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={BAR_COLORS[i % BAR_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Income Tier Breakdown */}
        <div
          style={{
            background: "#0f1117",
            border: "1px solid #1f2937",
            borderRadius: 16,
            padding: "1.5rem",
          }}
        >
          <SectionTitle>Income Tier Breakdown</SectionTitle>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={incomeData}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="tier"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: 8,
                  color: "#f9fafb",
                  fontSize: 13,
                }}
                cursor={{ fill: "#ffffff08" }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                <Cell fill="#7F77DD" />
                <Cell fill="#534AB7" />
                <Cell fill="#3C3489" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Tier legend */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginTop: "1rem",
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Tier 1  < $10k", color: "#7F77DD" },
              { label: "Tier 2  $10k–50k", color: "#534AB7" },
              { label: "Tier 3  > $50k", color: "#3C3489" },
            ].map((t) => (
              <div
                key={t.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  color: "#9ca3af",
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: t.color,
                    display: "inline-block",
                  }}
                />
                {t.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "2.5rem",
          borderTop: "1px solid #1f2937",
          paddingTop: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
          fontSize: 12,
          color: "#4b5563",
          fontFamily: "monospace",
        }}
      >
        <span>Network State Census · Powered by Reclaim Protocol + Polygon</span>
        <span>Census Cycle: 2025</span>
      </div>
    </main>
  );
}