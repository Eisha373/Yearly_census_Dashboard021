"use client";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

// ... rest of imports
import { generateReclaimProof } from '../utils/reclaim';
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from "react";
import { ethers } from 'ethers';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import CONTRACT from '../contract/CensusRegistry.json';

const CONTRACT_ADDRESS = CONTRACT.address;
const ABI = CONTRACT.abi;

const MOCK_COUNTRY_DATA = [
  { country: "Pakistan", members: 38 },
  { country: "USA", members: 31 },
  { country: "India", members: 24 },
  { country: "Germany", members: 18 },
  { country: "UAE", members: 15 },
  { country: "Others", members: 16 },
];

const MOCK_INCOME_DATA = [
  { tier: "Tier 1 <$10k", count: 45 },
  { tier: "Tier 2 $10-50k", count: 63 },
  { tier: "Tier 3 >$50k", count: 34 },
];

const BAR_COLORS = ["#1D9E75", "#378ADD", "#7F77DD", "#D85A30", "#D4537E", "#888780"];

type CountryEntry = { country: string; members: number };
type IncomeEntry = { tier: string; count: number };

function MetricCard({ label, value, sub, accent }: {
  label: string; value: string | number; sub?: string; accent: string;
}) {
  return (
    <div style={{
      background: "#0f1117", border: `1px solid ${accent}33`, borderRadius: 16,
      padding: "1.5rem", display: "flex", flexDirection: "column", gap: 8,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent, borderRadius: "16px 16px 0 0" }} />
      <span style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b7280", fontFamily: "monospace" }}>{label}</span>
      <span style={{ fontSize: 42, fontWeight: 700, color: "#f9fafb", lineHeight: 1, letterSpacing: "-0.02em" }}>{value}</span>
      {sub && <span style={{ fontSize: 13, color: "#6b7280" }}>{sub}</span>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b7280", fontFamily: "monospace", marginBottom: "1rem" }}>
      {children}
    </h2>
  );
}

export default function CensusDashboard() {
  const [memberCount, setMemberCount] = useState<number>(0);
  const [countryData] = useState<CountryEntry[]>(MOCK_COUNTRY_DATA);
  const [incomeData] = useState<IncomeEntry[]>(MOCK_INCOME_DATA);
  const [isLive, setIsLive] = useState(false);
  const [requestUrl, setRequestUrl] = useState('');
  const [proofStatus, setProofStatus] = useState('idle');
  const [proofData, setProofData] = useState<unknown>(null);
  const [txHash, setTxHash] = useState('');
  const [chainError, setChainError] = useState('');

  // ✅ Fetch live member count on load
   useEffect(() => {
  // fetchMemberCount(); // disabled - using mock data
  setMemberCount(1); // 1 citizen registered (you!)
  setIsLive(false);
}, []);

  async function fetchMemberCount() {
  try {
    const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const count = await contract.totalMembers();
    setMemberCount(Number(count));
    setIsLive(true);
  } catch (err) {
    console.error('Could not fetch member count:', err);
    setMemberCount(1); // fallback
    setIsLive(false);
  }
}

  // ✅ Register citizen on-chain after proof
  async function registerOnChain() {
    try {
      setChainError('');
      if (!window.ethereum) {
        setChainError('MetaMask not found. Please install MetaMask.');
        return;
      }

      // Switch to Amoy testnet
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x13882' }], // 80002 in hex
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

const tx = await contract.registerCitizen("Pakistan", "github-verified", {
  maxFeePerGas: ethers.parseUnits("50", "gwei"),
  maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"),
});
      setProofStatus('registering');
      await tx.wait();

      setTxHash(tx.hash);
      await fetchMemberCount();
      setProofStatus('registered');

    } catch (err: unknown) {
      console.error('Chain registration error:', err);
      if (err instanceof Error) {
        setChainError(err.message);
      }
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#080a0f", color: "#f9fafb", fontFamily: "'Segoe UI', sans-serif", padding: "2rem" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#1D9E75", fontFamily: "monospace", marginBottom: 6 }}>Network State</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, letterSpacing: "-0.02em", color: "#f9fafb" }}>Yearly Census Dashboard</h1>
          <p style={{ color: "#6b7280", marginTop: 6, fontSize: 14 }}>Verified citizen data — powered by ZK Proofs &amp; Blockchain</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: isLive ? "#0f2a1e" : "#1a1a2e", border: `1px solid ${isLive ? "#1D9E75" : "#378ADD"}`, borderRadius: 99, padding: "6px 14px", fontSize: 12, fontFamily: "monospace", color: isLive ? "#1D9E75" : "#378ADD" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: isLive ? "#1D9E75" : "#378ADD", display: "inline-block" }} />
             {isLive ? "Live — On-chain data" : "Census 2025 — Polygon Amoy"}
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
        <MetricCard label="Active Members" value={memberCount} sub={isLive ? "Live from blockchain" : "Verified citizens this cycle"} accent="#1D9E75" />
        <MetricCard label="Countries Represented" value={countryData.length} sub="Across 6 regions" accent="#378ADD" />
        <MetricCard label="Income Tiers Verified" value={incomeData.reduce((s, d) => s + d.count, 0)} sub="ZK proofs submitted" accent="#7F77DD" />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        <div style={{ background: "#0f1117", border: "1px solid #1f2937", borderRadius: 16, padding: "1.5rem" }}>
          <SectionTitle>Country Distribution</SectionTitle>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={countryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="country" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, color: "#f9fafb", fontSize: 13 }} cursor={{ fill: "#ffffff08" }} />
              <Bar dataKey="members" radius={[4, 4, 0, 0]}>
                {countryData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "#0f1117", border: "1px solid #1f2937", borderRadius: 16, padding: "1.5rem" }}>
          <SectionTitle>Income Tier Breakdown</SectionTitle>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={incomeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="tier" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, color: "#f9fafb", fontSize: 13 }} cursor={{ fill: "#ffffff08" }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                <Cell fill="#7F77DD" /><Cell fill="#534AB7" /><Cell fill="#3C3489" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
            {[{ label: "Tier 1  < $10k", color: "#7F77DD" }, { label: "Tier 2  $10k–50k", color: "#534AB7" }, { label: "Tier 3  > $50k", color: "#3C3489" }].map((t) => (
              <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9ca3af" }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: t.color, display: "inline-block" }} />
                {t.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reclaim Proof Section */}
      <div style={{ background: '#0f1117', border: '1px solid #1f2937', borderRadius: 16, padding: '1.5rem', marginTop: '1.5rem' }}>
        <SectionTitle>Verify Your Identity</SectionTitle>
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: '1rem' }}>
          Prove your identity via GitHub — no raw data shared.
        </p>

        <button
          onClick={async () => {
            setProofStatus('loading');
            try {
              const url = await generateReclaimProof((proof) => {
                setProofData(proof);
                setProofStatus('verified');
                registerOnChain(); // ✅ auto register after proof
              });
              setRequestUrl(url);
              setProofStatus('ready');
            } catch {
              setProofStatus('error');
            }
          }}
          style={{ background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}
        >
          {proofStatus === 'loading' ? 'Generating...' : proofStatus === 'registering' ? 'Registering on-chain...' : 'Generate Proof'}
        </button>

        {requestUrl && proofStatus !== 'registered' && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 12 }}>Scan QR or tap the link:</p>
            <QRCodeSVG value={requestUrl} size={200} bgColor="#0f1117" fgColor="#1D9E75" />
            <div style={{ marginTop: 16 }}>
              <a href={requestUrl} target="_blank" rel="noreferrer"
                style={{ background: '#378ADD', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
                Open Verification Link →
              </a>
            </div>
          </div>
        )}

        {/* Verified box */}
        {(proofStatus === 'verified' || proofStatus === 'registering' || proofStatus === 'registered') && (
          <div style={{ marginTop: '1rem', background: '#0f2a1e', border: '1px solid #1D9E75', borderRadius: 12, padding: '1rem 1.25rem' }}>
            <p style={{ color: '#1D9E75', fontWeight: 600, fontSize: 14 }}>✅ Identity Verified — GitHub proof accepted</p>
            {proofStatus === 'registering' && <p style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>⏳ Recording on blockchain... please wait</p>}
            {proofStatus === 'registered' && (
              <>
                <p style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>🎉 Citizen registered on Polygon Amoy!</p>
                {txHash && (
                  <a href={`https://amoy.polygonscan.com/tx/${txHash}`} target="_blank" rel="noreferrer"
                    style={{ color: '#378ADD', fontSize: 12, display: 'block', marginTop: 6 }}>
                    View transaction on PolygonScan →
                  </a>
                )}
              </>
            )}
          </div>
        )}

        {chainError && <p style={{ color: '#E24B4A', fontSize: 13, marginTop: 8 }}>⚠️ {chainError}</p>}
        {proofStatus === 'error' && <p style={{ color: '#E24B4A', fontSize: 13, marginTop: 8 }}>Could not generate proof. Check your App ID and Secret.</p>}
      </div>

      {/* Footer */}
      <div style={{ marginTop: "2.5rem", borderTop: "1px solid #1f2937", paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", fontSize: 12, color: "#4b5563", fontFamily: "monospace" }}>
        <span>Network State Census · Powered by Reclaim Protocol + Polygon</span>
        <span>Census Cycle: 2025</span>
      </div>

    </main>
  );
}