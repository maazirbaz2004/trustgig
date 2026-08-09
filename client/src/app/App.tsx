import { useState } from "react";
import {
  Shield, FileText, CheckCircle, XCircle, Eye,
  ChevronRight, ChevronDown, AlertTriangle, User,
  LayoutGrid, Scale, LogOut, Package,
} from "lucide-react";

import { T } from "../theme/tokens";
import { Btn } from "../components/ui/Btn";
import { Pill } from "../components/ui/Pill";

// ─── Data ──────────────────────────────────────────────────────────────────
type KycStatus = "pending" | "approved" | "rejected";
type DisputeStatus = "open" | "under_review" | "resolved";

interface KycRow {
  id: string; name: string; email: string; city: string;
  cnicNo: string; submittedAt: string; status: KycStatus;
  avatar: string;
}

interface DisputeRow {
  id: string;
  client:     { name: string; avatar: string };
  freelancer: { name: string; avatar: string };
  gigTitle: string; amount: number;
  filedAt: string; status: DisputeStatus;
  summary: string;
}

const KYC_ROWS: KycRow[] = [
  { id:"k1", name:"Nadia Hussain",  email:"nadia.h@gmail.com",     city:"Karachi",    cnicNo:"42101-7654321-9", submittedAt:"14 Dec, 09:21", status:"pending",  avatar:"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&h=48&fit=crop" },
  { id:"k2", name:"Omar Sheikh",    email:"omar.sheikh@email.pk",   city:"Lahore",     cnicNo:"35201-1234567-3", submittedAt:"14 Dec, 08:47", status:"pending",  avatar:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop" },
  { id:"k3", name:"Ayesha Malik",   email:"ayesha.m@outlook.com",   city:"Islamabad",  cnicNo:"61101-9876543-2", submittedAt:"13 Dec, 17:05", status:"pending",  avatar:"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=48&h=48&fit=crop" },
  { id:"k4", name:"Kamran Bashir",  email:"kamran.b@hotmail.com",   city:"Rawalpindi", cnicNo:"37405-5551234-1", submittedAt:"13 Dec, 14:32", status:"approved", avatar:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=48&h=48&fit=crop" },
  { id:"k5", name:"Sara Qureshi",   email:"sara.q@gmail.com",       city:"Faisalabad", cnicNo:"33100-2223344-8", submittedAt:"12 Dec, 11:18", status:"pending",  avatar:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=48&h=48&fit=crop" },
  { id:"k6", name:"Faisal Khan",    email:"faisal.k@proton.me",     city:"Karachi",    cnicNo:"42000-8889900-5", submittedAt:"12 Dec, 09:54", status:"rejected", avatar:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=48&h=48&fit=crop" },
  { id:"k7", name:"Hamza Tariq",    email:"hamza.t@email.pk",       city:"Multan",     cnicNo:"36302-3334445-7", submittedAt:"11 Dec, 16:40", status:"approved", avatar:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop" },
];

const DISPUTE_ROWS: DisputeRow[] = [
  {
    id:"DIS-0041",
    client:     { name:"Zara Siddiqui", avatar:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop" },
    freelancer: { name:"Hamza Khan",    avatar:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop" },
    gigTitle:"React/Next.js web application", amount:25000,
    filedAt:"13 Dec 2024", status:"open",
    summary:"Client claims the delivered work does not match the agreed specifications. Homepage is missing responsive mobile layout and the backend API returns incorrect data on the /user endpoint. Freelancer disputes this, stating specifications were met and revisions were outside the agreed scope.",
  },
  {
    id:"DIS-0039",
    client:     { name:"Usman Tariq",  avatar:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop" },
    freelancer: { name:"Sana Mirza",   avatar:"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop" },
    gigTitle:"Brand identity & logo design", amount:8000,
    filedAt:"11 Dec 2024", status:"under_review",
    summary:"Client requested 12 logo variations but the package included 3. Freelancer delivered 3 as agreed. Client is requesting a full refund citing 'unsatisfactory quality', but the work appears to meet the brief as submitted.",
  },
  {
    id:"DIS-0035",
    client:     { name:"Ahmad Raza",   avatar:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop" },
    freelancer: { name:"Ali Hassan",   avatar:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop" },
    gigTitle:"Interior painting — 3 rooms", amount:12000,
    filedAt:"09 Dec 2024", status:"resolved",
    summary:"Both parties reached agreement after mediation. Client received a 20% partial refund to cover paint touch-ups. Case closed.",
  },
];

const KYC_STATUS: Record<KycStatus, { label: string; color: string; bg: string }> = {
  pending:  { label: "Pending",  color: T.amber, bg: T.amberTint },
  approved: { label: "Approved", color: T.green, bg: T.greenTint },
  rejected: { label: "Rejected", color: T.red,   bg: T.redTint   },
};

const DIS_STATUS: Record<DisputeStatus, { label: string; color: string; bg: string }> = {
  open:         { label: "Open",         color: T.red,    bg: T.redTint   },
  under_review: { label: "Under Review", color: T.amber,  bg: T.amberTint },
  resolved:     { label: "Resolved",     color: T.muted,  bg: "#EBEBF0"   },
};

// ─── Micro components moved to /components/ui ────────────────────────────────

// ─── KYC table ─────────────────────────────────────────────────────────────
function KycTable() {
  const [rows, setRows] = useState<KycRow[]>(KYC_ROWS);
  const [viewId, setViewId] = useState<string | null>(null);

  const approve = (id: string) => setRows(prev => prev.map(r => r.id === id ? { ...r, status: "approved" } : r));
  const reject  = (id: string) => setRows(prev => prev.map(r => r.id === id ? { ...r, status: "rejected" } : r));

  const counts = {
    pending:  rows.filter(r => r.status === "pending").length,
    approved: rows.filter(r => r.status === "approved").length,
    rejected: rows.filter(r => r.status === "rejected").length,
  };

  return (
    <div>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 20, fontWeight: 600, color: T.ink, margin: "0 0 3px" }}>
            KYC Review Queue
          </h2>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: T.muted, margin: 0 }}>
            <span style={{ color: T.amber, fontWeight: 600 }}>{counts.pending} pending</span>
            {" · "}{counts.approved} approved · {counts.rejected} rejected
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {(["pending","approved","rejected"] as KycStatus[]).map(s => (
            <span key={s} style={{
              padding: "3px 10px", borderRadius: 4,
              backgroundColor: KYC_STATUS[s].bg,
              fontFamily: "IBM Plex Mono, monospace", fontSize: 10.5, fontWeight: 700,
              color: KYC_STATUS[s].color,
            }}>
              {KYC_STATUS[s].label}: {counts[s]}
            </span>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{
        backgroundColor: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(55,47,140,0.06)",
      }}>
        {/* Head */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "32px 220px 120px 130px 140px 110px 1fr",
          gap: 0, padding: "0 16px",
          backgroundColor: T.bg,
          borderBottom: `1px solid ${T.border}`,
          height: 36,
          alignItems: "center",
        }}>
          {["#","Applicant","CNIC No.","Submitted","Status","CNIC Preview","Actions"].map((h, i) => (
            <span key={h} style={{
              fontFamily: "Inter, sans-serif", fontSize: 10.5, fontWeight: 700,
              color: T.subtle, textTransform: "uppercase", letterSpacing: "0.07em",
              paddingRight: 12,
              textAlign: i === 6 ? "right" : "left",
            }}>
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {rows.map((row, idx) => {
          const isPending = row.status === "pending";
          const isViewing = viewId === row.id;

          return (
            <div key={row.id}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "32px 220px 120px 130px 140px 110px 1fr",
                  gap: 0, padding: "0 16px",
                  borderBottom: `1px solid ${T.border}`,
                  height: 52, alignItems: "center",
                  backgroundColor: isViewing ? "#F9F8FF" : T.white,
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => { if (!isViewing) (e.currentTarget as HTMLElement).style.backgroundColor = "#FAFAFA"; }}
                onMouseLeave={e => { if (!isViewing) (e.currentTarget as HTMLElement).style.backgroundColor = T.white; }}
              >
                {/* Row number */}
                <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: T.subtle }}>
                  {idx + 1}
                </span>

                {/* Applicant */}
                <div style={{ display: "flex", alignItems: "center", gap: 9, paddingRight: 12 }}>
                  <img src={row.avatar} alt={row.name} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `1px solid ${T.border}` }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, fontWeight: 600, color: T.ink, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {row.name}
                    </p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: T.muted, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {row.email}
                    </p>
                  </div>
                </div>

                {/* CNIC No */}
                <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: T.ink, paddingRight: 12 }}>
                  {row.cnicNo}
                </span>

                {/* Submitted */}
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: T.muted, paddingRight: 12 }}>
                  {row.submittedAt}
                </span>

                {/* Status */}
                <div style={{ paddingRight: 12 }}>
                  <Pill cfg={KYC_STATUS[row.status]} />
                </div>

                {/* CNIC preview thumbnail */}
                <div style={{ paddingRight: 12 }}>
                  <div style={{
                    width: 64, height: 38, borderRadius: 4,
                    backgroundColor: isPending ? T.indigoTint : row.status === "approved" ? T.greenTint : T.redTint,
                    border: `1px solid ${T.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", position: "relative", overflow: "hidden",
                  }}
                    onClick={() => setViewId(isViewing ? null : row.id)}
                  >
                    <FileText
                      size={16}
                      strokeWidth={1.6}
                      style={{ color: isPending ? T.indigo : row.status === "approved" ? T.green : T.red, opacity: 0.7 }}
                    />
                    <span style={{
                      position: "absolute", bottom: 2, right: 3,
                      fontFamily: "IBM Plex Mono, monospace", fontSize: 7, color: T.muted,
                    }}>
                      CNIC
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <Btn variant="ghost" size="xs"
                    onClick={() => setViewId(isViewing ? null : row.id)}>
                    <Eye size={11} strokeWidth={2} />
                    View CNIC
                  </Btn>
                  <Btn variant="green" size="xs"
                    disabled={!isPending}
                    onClick={() => approve(row.id)}>
                    <CheckCircle size={11} strokeWidth={2.5} />
                    Approve
                  </Btn>
                  <Btn variant="red-outline" size="xs"
                    disabled={!isPending}
                    onClick={() => reject(row.id)}>
                    <XCircle size={11} strokeWidth={2} />
                    Reject
                  </Btn>
                </div>
              </div>

              {/* Expanded CNIC view */}
              {isViewing && (
                <div style={{
                  padding: "16px 20px 16px 68px",
                  backgroundColor: "#F9F8FF",
                  borderBottom: `1px solid ${T.border}`,
                  display: "flex", gap: 20, alignItems: "flex-start",
                }}>
                  {/* CNIC front mock */}
                  {["Front", "Back"].map(side => (
                    <div key={side} style={{
                      width: 160, height: 96, borderRadius: 6,
                      backgroundColor: side === "Front" ? "#E8E5F8" : "#EAE8F5",
                      border: `1px solid ${T.border}`,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: 6,
                    }}>
                      <FileText size={22} strokeWidth={1.4} style={{ color: T.indigo, opacity: 0.5 }} />
                      <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 9.5, color: T.muted, letterSpacing: "0.06em" }}>
                        CNIC {side.toUpperCase()} · {row.cnicNo}
                      </span>
                    </div>
                  ))}
                  <div style={{ paddingTop: 2 }}>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: T.muted, margin: "0 0 6px" }}>
                      Submitted by <strong style={{ color: T.ink }}>{row.name}</strong> from {row.city}
                    </p>
                    <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: T.muted, margin: "0 0 12px" }}>
                      {row.cnicNo} · {row.submittedAt}
                    </p>
                    {row.status === "pending" && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <Btn variant="green" size="sm" onClick={() => { approve(row.id); setViewId(null); }}>
                          <CheckCircle size={12} strokeWidth={2.5} />
                          Approve Verification
                        </Btn>
                        <Btn variant="red-outline" size="sm" onClick={() => { reject(row.id); setViewId(null); }}>
                          <XCircle size={12} strokeWidth={2} />
                          Reject — Documents Invalid
                        </Btn>
                      </div>
                    )}
                    {row.status !== "pending" && (
                      <Pill cfg={KYC_STATUS[row.status]} />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Disputes table ─────────────────────────────────────────────────────────
function DisputesTable() {
  const [rows, setRows] = useState<DisputeRow[]>(DISPUTE_ROWS);
  const [expanded, setExpanded] = useState<string | null>(null);

  const resolve = (id: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, status: "resolved" } : r));
    setExpanded(null);
  };

  const counts = {
    open:         rows.filter(r => r.status === "open").length,
    under_review: rows.filter(r => r.status === "under_review").length,
    resolved:     rows.filter(r => r.status === "resolved").length,
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 20, fontWeight: 600, color: T.ink, margin: "0 0 3px" }}>
            Dispute Cases
          </h2>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: T.muted, margin: 0 }}>
            <span style={{ color: T.red, fontWeight: 600 }}>{counts.open} open</span>
            {" · "}{counts.under_review} under review · {counts.resolved} resolved
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {(["open","under_review","resolved"] as DisputeStatus[]).map(s => (
            <span key={s} style={{
              padding: "3px 10px", borderRadius: 4,
              backgroundColor: DIS_STATUS[s].bg,
              fontFamily: "IBM Plex Mono, monospace", fontSize: 10.5, fontWeight: 700,
              color: DIS_STATUS[s].color,
            }}>
              {DIS_STATUS[s].label}: {counts[s]}
            </span>
          ))}
        </div>
      </div>

      <div style={{
        backgroundColor: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(55,47,140,0.06)",
      }}>
        {/* Head */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "110px 160px 160px 1fr 90px 120px 120px",
          padding: "0 16px", gap: 0,
          backgroundColor: T.bg,
          borderBottom: `1px solid ${T.border}`,
          height: 36, alignItems: "center",
        }}>
          {["Case ID","Client","Freelancer","Gig · Amount","Filed","Status",""].map((h, i) => (
            <span key={i} style={{
              fontFamily: "Inter, sans-serif", fontSize: 10.5, fontWeight: 700,
              color: T.subtle, textTransform: "uppercase", letterSpacing: "0.07em",
              paddingRight: 12, textAlign: i === 6 ? "right" : "left",
            }}>
              {h}
            </span>
          ))}
        </div>

        {rows.map(row => {
          const isExpanded = expanded === row.id;
          const isResolved = row.status === "resolved";

          return (
            <div key={row.id}>
              {/* Main row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "110px 160px 160px 1fr 90px 120px 120px",
                  padding: "0 16px", gap: 0,
                  height: 52, alignItems: "center",
                  borderBottom: `1px solid ${T.border}`,
                  backgroundColor: isExpanded ? "#F9F8FF" : T.white,
                  cursor: "default",
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => { if (!isExpanded) (e.currentTarget as HTMLElement).style.backgroundColor = "#FAFAFA"; }}
                onMouseLeave={e => { if (!isExpanded) (e.currentTarget as HTMLElement).style.backgroundColor = T.white; }}
              >
                {/* Case ID */}
                <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11.5, fontWeight: 700, color: T.indigo, paddingRight: 12 }}>
                  {row.id}
                </span>

                {/* Client */}
                <div style={{ display: "flex", alignItems: "center", gap: 7, paddingRight: 12 }}>
                  <img src={row.client.avatar} alt={row.client.name} style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {row.client.name}
                  </span>
                </div>

                {/* Freelancer */}
                <div style={{ display: "flex", alignItems: "center", gap: 7, paddingRight: 12 }}>
                  <img src={row.freelancer.avatar} alt={row.freelancer.name} style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {row.freelancer.name}
                  </span>
                </div>

                {/* Gig + amount */}
                <div style={{ paddingRight: 12, minWidth: 0 }}>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: T.ink, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {row.gigTitle}
                  </p>
                  <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11.5, fontWeight: 700, color: T.indigo, margin: "1px 0 0" }}>
                    Rs. {row.amount.toLocaleString()}
                  </p>
                </div>

                {/* Filed */}
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: T.muted, paddingRight: 12 }}>
                  {row.filedAt}
                </span>

                {/* Status */}
                <div style={{ paddingRight: 12 }}>
                  <Pill cfg={DIS_STATUS[row.status]} />
                </div>

                {/* Action */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  {!isResolved ? (
                    <Btn variant="indigo" size="xs"
                      onClick={() => setExpanded(isExpanded ? null : row.id)}>
                      {isExpanded
                        ? <><ChevronDown size={11} strokeWidth={2} /> Close</>
                        : <><ChevronRight size={11} strokeWidth={2} /> Review Case</>}
                    </Btn>
                  ) : (
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: T.muted }}>Closed</span>
                  )}
                </div>
              </div>

              {/* Expanded case detail */}
              {isExpanded && (
                <div style={{
                  padding: "20px 20px 20px",
                  backgroundColor: "#F9F8FF",
                  borderBottom: `1px solid ${T.border}`,
                }}>
                  {/* Summary */}
                  <div style={{
                    display: "flex", gap: 10, alignItems: "flex-start",
                    padding: "12px 16px", borderRadius: 6,
                    backgroundColor: T.white, border: `1px solid ${T.border}`,
                    marginBottom: 16,
                  }}>
                    <AlertTriangle size={14} strokeWidth={2} style={{ color: T.amber, flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, color: T.subtle, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 5px" }}>
                        Case Summary
                      </p>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: T.ink, lineHeight: 1.65, margin: 0 }}>
                        {row.summary}
                      </p>
                    </div>
                  </div>

                  {/* Metadata strip */}
                  <div style={{
                    display: "flex", gap: 28, marginBottom: 18,
                    padding: "10px 16px", borderRadius: 6,
                    backgroundColor: T.white, border: `1px solid ${T.border}`,
                  }}>
                    {[
                      { label: "Case ID",    value: row.id },
                      { label: "Filed",      value: row.filedAt },
                      { label: "Amount held",value: `Rs. ${row.amount.toLocaleString()}` },
                      { label: "Client",     value: row.client.name },
                      { label: "Freelancer", value: row.freelancer.name },
                    ].map(d => (
                      <div key={d.label}>
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, color: T.muted, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          {d.label}
                        </p>
                        <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 12, fontWeight: 600, color: T.ink, margin: 0 }}>
                          {d.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Resolution actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700, color: T.subtle, textTransform: "uppercase", letterSpacing: "0.07em", marginRight: 4 }}>
                      Resolution:
                    </span>
                    <button
                      onClick={() => resolve(row.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        height: 34, padding: "0 16px", borderRadius: 5, border: "none",
                        backgroundColor: T.red, color: "#fff", cursor: "pointer",
                        fontFamily: "Inter, sans-serif", fontSize: 12.5, fontWeight: 700,
                        boxShadow: "0 1px 4px rgba(185,28,44,0.25)",
                        transition: "filter 0.12s",
                      }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.filter = "brightness(0.88)")}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.filter = "none")}
                    >
                      <XCircle size={13} strokeWidth={2.5} />
                      Refund Client
                    </button>
                    <button
                      onClick={() => resolve(row.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        height: 34, padding: "0 16px", borderRadius: 5, border: "none",
                        backgroundColor: T.green, color: "#fff", cursor: "pointer",
                        fontFamily: "Inter, sans-serif", fontSize: 12.5, fontWeight: 700,
                        boxShadow: "0 1px 4px rgba(15,122,92,0.25)",
                        transition: "filter 0.12s",
                      }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.filter = "brightness(0.88)")}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.filter = "none")}
                    >
                      <CheckCircle size={13} strokeWidth={2.5} />
                      Release to Freelancer
                    </button>
                    <button
                      onClick={() => setExpanded(null)}
                      style={{
                        height: 34, padding: "0 14px", borderRadius: 5,
                        border: `1px solid ${T.border}`, backgroundColor: "transparent",
                        color: T.muted, cursor: "pointer",
                        fontFamily: "Inter, sans-serif", fontSize: 12.5, fontWeight: 500,
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = T.bg)}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Admin panel ────────────────────────────────────────────────────────────
function AdminPanel() {
  const [tab, setTab] = useState<"kyc" | "disputes">("kyc");

  const NAV = [
    { key: "kyc",      icon: <User size={14} strokeWidth={1.8} />,      label: "KYC Review",   badge: KYC_ROWS.filter(r => r.status === "pending").length },
    { key: "disputes", icon: <Scale size={14} strokeWidth={1.8} />,     label: "Disputes",     badge: DISPUTE_ROWS.filter(r => r.status !== "resolved").length },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: T.bg, fontFamily: "Inter, sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 208, flexShrink: 0,
        backgroundColor: T.sidebar,
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh",
        overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, backgroundColor: T.indigo, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={13} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <span style={{ fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 600, color: "#fff", lineHeight: 1 }}>
                TrustGig
              </span>
              <span style={{
                display: "block", fontFamily: "IBM Plex Mono, monospace",
                fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 1,
              }}>
                Admin
              </span>
            </div>
          </div>
        </div>

        {/* Nav section label */}
        <div style={{ padding: "16px 16px 6px" }}>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 9.5, fontWeight: 700, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.09em" }}>
            Moderation
          </span>
        </div>

        {/* Nav items */}
        <nav style={{ padding: "0 8px", flex: 1 }}>
          {NAV.map(item => {
            const isActive = tab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key as "kyc" | "disputes")}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 10px", borderRadius: 6, marginBottom: 2,
                  border: "none", cursor: "pointer",
                  backgroundColor: isActive ? "rgba(55,47,140,0.55)" : "transparent",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.52)",
                  transition: "all 0.13s",
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  {item.icon}
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: isActive ? 600 : 400 }}>
                    {item.label}
                  </span>
                </div>
                {item.badge > 0 && (
                  <span style={{
                    minWidth: 18, height: 18, padding: "0 5px",
                    borderRadius: 99, backgroundColor: isActive ? T.red : "rgba(185,28,44,0.55)",
                    fontFamily: "IBM Plex Mono, monospace", fontSize: 10, fontWeight: 700, color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin user strip */}
        <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "#4E44B8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <User size={13} color="rgba(255,255,255,0.80)" strokeWidth={2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.80)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                admin@trustgig.pk
              </p>
              <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 9.5, color: "rgba(255,255,255,0.32)", margin: "1px 0 0" }}>
                Super Admin
              </p>
            </div>
            <LogOut size={13} style={{ color: "rgba(255,255,255,0.28)", flexShrink: 0, cursor: "pointer" }} />
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <div style={{
          height: 52, borderBottom: `1px solid ${T.border}`,
          backgroundColor: T.white,
          display: "flex", alignItems: "center", padding: "0 28px",
          justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: T.muted }}>Admin</span>
            <ChevronRight size={13} style={{ color: T.muted }} />
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600, color: T.ink }}>
              {tab === "kyc" ? "KYC Review" : "Disputes"}
            </span>
          </div>
          <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: T.subtle }}>
            Mon 16 Dec 2024 · 11:42 PKT
          </span>
        </div>

        {/* Content */}
        <div style={{ padding: "28px 28px 60px", overflowY: "auto" }}>
          {tab === "kyc"      && <KycTable />}
          {tab === "disputes" && <DisputesTable />}
        </div>
      </div>
    </div>
  );
}

// ─── Empty state illustration ───────────────────────────────────────────────
function BoxStampIllustration() {
  const W = 220, H = 180;
  const bx = 60, by = 96, bw = 100, bh = 64;           // box body
  const mid = bx + bw / 2;                               // center x

  // stamp centre (floating top-right of box)
  const sc = { x: 162, y: 44, r: 26 };

  function stampTeeth(cx: number, cy: number, R: number, n: number, depth: number) {
    const pts: string[] = [];
    for (let i = 0; i <= n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? R : R - depth;
      pts.push(`${i === 0 ? "M" : "L"} ${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
    }
    return pts.join(" ") + " Z";
  }

  return (
    <svg
      width={W} height={H}
      viewBox={`0 0 ${W} ${H}`}
      fill="none"
      aria-label="Empty open box with stamp"
    >
      {/* ── Box ── */}

      {/* Left face */}
      <path
        d={`M ${bx},${by} L ${bx - 18},${by - 14} L ${bx - 18},${by + bh - 10} L ${bx},${by + bh} Z`}
        stroke={T.indigo} strokeWidth="1.5" strokeLinejoin="round"
        fill={T.paper}
      />

      {/* Box body (front face) */}
      <rect x={bx} y={by} width={bw} height={bh} rx="1"
        stroke={T.indigo} strokeWidth="1.5"
        fill={T.white}
      />

      {/* Box body center vertical crease */}
      <line x1={mid} y1={by} x2={mid} y2={by + bh}
        stroke={T.indigo} strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />

      {/* Horizontal band (tape line) */}
      <line x1={bx} y1={by + bh * 0.42} x2={bx + bw} y2={by + bh * 0.42}
        stroke={T.indigo} strokeWidth="1" opacity="0.18" />

      {/* Left flap (open, folded left) */}
      <path
        d={`M ${bx},${by} L ${bx - 8},${by - 26} L ${mid - 5},${by - 26} L ${mid},${by} Z`}
        stroke={T.indigo} strokeWidth="1.5" strokeLinejoin="round"
        fill={T.paper}
      />

      {/* Right flap (open, folded right) */}
      <path
        d={`M ${mid},${by} L ${mid + 5},${by - 26} L ${bx + bw + 8},${by - 26} L ${bx + bw},${by} Z`}
        stroke={T.indigo} strokeWidth="1.5" strokeLinejoin="round"
        fill={T.paper}
      />

      {/* Flap crease line */}
      <line x1={bx} y1={by} x2={bx + bw} y2={by}
        stroke={T.indigo} strokeWidth="1" opacity="0.5" />

      {/* Inner box shadow lines (depth) */}
      <line x1={bx + 6} y1={by + 6} x2={bx + bw - 6} y2={by + 6}
        stroke={T.indigo} strokeWidth="0.8" opacity="0.15" />
      <line x1={bx + 6} y1={by + 6} x2={bx + 6} y2={by + bh - 8}
        stroke={T.indigo} strokeWidth="0.8" opacity="0.15" />

      {/* Ground shadow */}
      <ellipse cx={bx + bw / 2 - 6} cy={by + bh + 10} rx={48} ry={5}
        fill={T.indigo} opacity="0.07" />

      {/* ── Floating stamp (stamp-red, rotated -14°) ── */}
      <g transform={`rotate(-14, ${sc.x}, ${sc.y})`}>
        {/* Outer serrated ring */}
        <path
          d={stampTeeth(sc.x, sc.y, sc.r, 16, 2.8)}
          fill={T.redTint}
          stroke={T.red} strokeWidth="1.2"
        />
        {/* Inner circle */}
        <circle cx={sc.x} cy={sc.y} r={sc.r * 0.72}
          fill="none" stroke={T.red} strokeWidth="0.9" opacity="0.40" />

        {/* Shield icon simplified: a rounded pentagon */}
        <path
          d={`M ${sc.x},${sc.y - 9} L ${sc.x + 7},${sc.y - 5} L ${sc.x + 7},${sc.y + 2} Q ${sc.x + 7},${sc.y + 9} ${sc.x},${sc.y + 11} Q ${sc.x - 7},${sc.y + 9} ${sc.x - 7},${sc.y + 2} L ${sc.x - 7},${sc.y - 5} Z`}
          fill="none" stroke={T.red} strokeWidth="1.4" strokeLinejoin="round"
        />
        {/* Check inside shield */}
        <polyline
          points={`${sc.x - 3},${sc.y + 1} ${sc.x},${sc.y + 4} ${sc.x + 4},${sc.y - 2}`}
          fill="none" stroke={T.red} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
        />
      </g>

      {/* Motion lines from stamp (dashes above stamp) */}
      {[-8, 0, 8].map((dx, i) => (
        <line key={i}
          x1={sc.x + dx - 4 + i * 2} y1={sc.y - sc.r - 6}
          x2={sc.x + dx - 4 + i * 2} y2={sc.y - sc.r - 13}
          stroke={T.red} strokeWidth="1.2" strokeLinecap="round" opacity={0.4 - i * 0.1}
        />
      ))}

      {/* Small dots in the box interior (empty-ness) */}
      {[[mid - 14, by + 32],[mid + 12, by + 42],[mid - 4, by + 22]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.4} fill={T.indigo} opacity="0.18" />
      ))}
    </svg>
  );
}

function EmptyState() {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: T.paper,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        backgroundColor: T.white,
        borderRadius: 16,
        border: `1px solid rgba(55,47,140,0.10)`,
        boxShadow: "0 4px 28px rgba(55,47,140,0.09), 0 1px 6px rgba(55,47,140,0.05)",
        padding: "52px 56px 48px",
        maxWidth: 400,
        width: "100%",
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center",
        gap: 0,
      }}>
        {/* Illustration */}
        <div style={{ marginBottom: 28 }}>
          <BoxStampIllustration />
        </div>

        {/* Heading */}
        <h2 style={{
          fontFamily: "Fraunces, serif",
          fontSize: 24, fontWeight: 600,
          color: T.ink, margin: "0 0 10px",
          lineHeight: 1.25, letterSpacing: "-0.02em",
        }}>
          You haven&apos;t booked<br />any gigs yet.
        </h2>

        {/* Subtext */}
        <p style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 14.5, color: T.muted,
          lineHeight: 1.65, margin: "0 0 28px",
          maxWidth: 260,
        }}>
          Explore trusted talent near you — verified professionals ready to help.
        </p>

        {/* CTA */}
        <button style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          height: 46, padding: "0 28px", borderRadius: 10,
          border: "none", cursor: "pointer",
          backgroundColor: T.indigo, color: T.white,
          fontFamily: "Inter, sans-serif", fontSize: 14.5, fontWeight: 700,
          letterSpacing: "0.01em",
          boxShadow: "0 2px 10px rgba(55,47,140,0.28)",
          transition: "background 0.15s, box-shadow 0.15s",
        }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = T.indigoDark; el.style.boxShadow = "0 4px 16px rgba(55,47,140,0.36)"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = T.indigo; el.style.boxShadow = "0 2px 10px rgba(55,47,140,0.28)"; }}
        >
          <LayoutGrid size={15} strokeWidth={2.5} />
          Explore Gigs
        </button>

        {/* Secondary link */}
        <a href="#" style={{
          fontFamily: "Inter, sans-serif", fontSize: 13,
          color: T.muted, marginTop: 14,
          textDecoration: "none", textUnderlineOffset: 3,
        }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = T.indigo; el.style.textDecoration = "underline"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = T.muted; el.style.textDecoration = "none"; }}
        >
          How does TrustGig work?
        </a>
      </div>
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────
type View = "admin" | "empty";

export default function App() {
  const [view, setView] = useState<View>("admin");

  return (
    <div style={{ position: "relative" }}>
      {/* Floating view switcher */}
      <div style={{
        position: "fixed", bottom: 20, right: 20, zIndex: 9999,
        display: "flex", gap: 4, padding: 4,
        backgroundColor: "rgba(28,24,48,0.88)",
        backdropFilter: "blur(10px)",
        borderRadius: 10,
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}>
        {([
          { key: "admin", label: "Admin Panel", icon: <Scale size={12} strokeWidth={2} /> },
          { key: "empty", label: "Empty State", icon: <Package size={12} strokeWidth={2} /> },
        ] as { key: View; label: string; icon: React.ReactNode }[]).map(v => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              height: 30, padding: "0 12px", borderRadius: 7, border: "none",
              cursor: "pointer",
              backgroundColor: view === v.key ? T.indigo : "transparent",
              color: view === v.key ? "#fff" : "rgba(255,255,255,0.50)",
              fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600,
              transition: "all 0.13s",
            }}
          >
            {v.icon}{v.label}
          </button>
        ))}
      </div>

      {view === "admin" && <AdminPanel />}
      {view === "empty" && <EmptyState />}
    </div>
  );
}
