"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { WeddingSubmission } from "@/lib/db";

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcodeError, setPasscodeError] = useState("");
  const [submissions, setSubmissions] = useState<WeddingSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<WeddingSubmission | null>(null);

  // Check sessionStorage for saved passcode on mount
  useEffect(() => {
    const savedSecret = sessionStorage.getItem("rupi_admin_secret");
    if (savedSecret) {
      setSecret(savedSecret);
      fetchSubmissions(savedSecret);
    }
  }, []);

  const fetchSubmissions = useCallback(async (token: string) => {
    setIsLoading(true);
    setPasscodeError("");

    try {
      const res = await fetch("/api/admin", {
        headers: {
          "x-admin-secret": token,
        },
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        setPasscodeError("Invalid admin passcode. Access denied.");
        sessionStorage.removeItem("rupi_admin_secret");
        return;
      }

      const data = await res.json();
      if (data.submissions) {
        setSubmissions(data.submissions);
        setIsAuthenticated(true);
        sessionStorage.setItem("rupi_admin_secret", token);
        if (data.submissions.length > 0 && !selectedSubmission) {
          setSelectedSubmission(data.submissions[0]);
        }
      }
    } catch {
      setPasscodeError("Failed to fetch submissions. Please check server.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedSubmission]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim()) {
      setPasscodeError("Please enter the admin passcode.");
      return;
    }
    fetchSubmissions(secret.trim());
  };

  const handleLogout = () => {
    sessionStorage.removeItem("rupi_admin_secret");
    setIsAuthenticated(false);
    setSecret("");
    setSubmissions([]);
    setSelectedSubmission(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Are you sure you want to permanently delete submission #${id}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin?id=${id}`, {
        method: "DELETE",
        headers: { "x-admin-secret": secret },
      });
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
        if (selectedSubmission?.id === id) {
          setSelectedSubmission(null);
        }
        alert(`Submission #${id} deleted successfully.`);
      }
    } catch {
      alert("Failed to delete submission.");
    }
  };

  // Copy helper for Card Designer / Printing Press
  const copyFormattedForDesigner = (sub: WeddingSubmission) => {
    const rsvpList = Array.isArray(sub.rsvp_names)
      ? sub.rsvp_names.map((r: string | { name: string; contact?: string }) => typeof r === "string" ? r : `${r.name} (${r.contact || ''})`).filter(Boolean)
      : [];
    const complimentsList = Array.isArray(sub.best_compliments)
      ? sub.best_compliments.filter(Boolean)
      : [];

    const text = `
======================================================
  ROYAL WEDDING INVITATION CARD TEXT FOR PRINTING
======================================================
|| श्री गणेशाय नमः ||

${sub.grandfather_name || sub.grandmother_name ? `With the Heavenly Blessings of:\n${sub.grandfather_name ? `• ${sub.grandfather_name}\n` : ''}${sub.grandmother_name ? `• ${sub.grandmother_name}\n` : ''}\n` : ''}
${sub.father_prefix} ${sub.father_name} & ${sub.mother_prefix} ${sub.mother_name}
solicit your gracious presence and divine blessings on the auspicious occasion of the wedding ceremony of their beloved daughter

${sub.bride_name} ${sub.bride_initials ? `(${sub.bride_initials})` : ''}
weds
${sub.groom_name}
Son of ${sub.groom_mother_name ? `${sub.groom_mother_prefix} ${sub.groom_mother_name}` : 'Smt. Groom Mother'} & ${sub.groom_father_name ? `${sub.groom_father_prefix} ${sub.groom_father_name}` : 'Sh. Groom Father'}

--- AUSPICIOUS CEREMONIES ---
${sub.haldi_date ? `• Haldi Ceremony: ${sub.haldi_date} | Venue: ${sub.haldi_venue || 'Residence'}\n` : ''}${sub.mehndi_date ? `• Mehndi Ceremony: ${sub.mehndi_date} | Venue: ${sub.mehndi_venue || 'Residence'}\n` : ''}• Wedding & Reception:
  Date: ${sub.wedding_date || 'TBD'}
  Venue: ${sub.wedding_reception_venue || 'Kisan Bhawan, Sector 16, Faridabad'}

${rsvpList.length > 0 ? `R.S.V.P.:\n${rsvpList.map(r => `  • ${r}`).join('\n')}\n` : ''}
${complimentsList.length > 0 ? `With Best Compliments From:\n  ${complimentsList.join(', ')}\n` : ''}
Residence:
  ${sub.family_address || 'Faridabad, Haryana'}
  Contact: ${sub.mobile_1} ${sub.mobile_2 ? `| ${sub.mobile_2}` : ''}

${sub.additional_notes ? `Special Notes:\n  ${sub.additional_notes}\n` : ''}
======================================================
    `.trim();

    navigator.clipboard.writeText(text);
    alert("Full formatted invitation card text copied! Ready to paste to printing vendor / WhatsApp. ✨");
  };

  // Export to CSV
  const downloadCsv = () => {
    if (submissions.length === 0) {
      alert("No submissions to export.");
      return;
    }

    const headers = [
      "ID", "Submitted At", "Bride Name", "Groom Name",
      "Father Name", "Mother Name", "Family Address", "Mobile 1", "Mobile 2",
      "Wedding Date", "Haldi Date", "Mehndi Date", "Reception Venue", "Notes"
    ];

    const rows = submissions.map((s) => [
      s.id,
      s.created_at,
      `"${s.bride_name}"`,
      `"${s.groom_name}"`,
      `"${s.father_prefix} ${s.father_name}"`,
      `"${s.mother_prefix} ${s.mother_name}"`,
      `"${(s.family_address || "").replace(/"/g, '""')}"`,
      `"${s.mobile_1}"`,
      `"${s.mobile_2}"`,
      `"${s.wedding_date || ""}"`,
      `"${s.haldi_date || ""}"`,
      `"${s.mehndi_date || ""}"`,
      `"${(s.wedding_reception_venue || "").replace(/"/g, '""')}"`,
      `"${(s.additional_notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rupi_wedding_submissions_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const downloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(submissions, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `rupi_wedding_submissions_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-[#faf5ec]/60 pb-16">
      {/* ─── Top Admin Bar ─── */}
      <header className="royal-header py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border border-amber-400 p-0.5 bg-white shadow-sm flex-shrink-0">
                <Image
                  src="/rupi.png"
                  alt="₹upi Monogram"
                  width={30}
                  height={30}
                  className="rounded-full object-cover"
                />
              </div>
              <span className="font-display text-sm font-bold text-maroon tracking-wider">
                ADMIN PORTAL
              </span>
            </Link>
            <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-semibold border border-amber-300">
              Wedding Submissions
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-stone-600 hover:text-maroon px-2 py-1"
            >
              ← Back to Questionnaire
            </Link>
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="btn-ghost !text-xs !py-1 !px-2.5 text-stone-600"
              >
                Logout 🔒
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* ─── Passcode Gate Screen ─── */}
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto mt-12 wedding-card text-center p-8 fade-in">
            <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-300 flex items-center justify-center text-2xl mx-auto mb-4 pulse-gold">
              👑
            </div>

            <h2 className="section-header text-xl text-maroon mb-1">
              Admin Access
            </h2>
            <p className="text-xs text-stone-600 font-serif italic mb-6">
              Enter your secure admin passcode to view family invitation submissions.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Enter Admin Secret Passcode"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="wedding-input text-center tracking-widest font-mono text-base"
                  autoFocus
                />
              </div>

              {passcodeError && (
                <p className="text-xs text-red-600 font-medium">{passcodeError}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? "Verifying..." : "Unlock Dashboard 🔓"}
              </button>
            </form>
          </div>
        ) : (
          /* ─── Authenticated Dashboard View ─── */
          <div className="fade-in space-y-6">
            {/* Top Metrics & Actions Bar */}
            <div className="bg-white border border-amber-300/80 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display font-bold text-xl text-maroon">
                  ₹upi Wedding Submissions Overview
                </h1>
                <p className="text-xs text-stone-500 font-serif italic mt-0.5">
                  Total Entries Received: <strong>{submissions.length}</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={downloadCsv}
                  className="btn-ghost !text-xs !py-1.5 !px-3 font-semibold flex items-center gap-1.5"
                  title="Export spreadsheet for printing vendor"
                >
                  📊 Download CSV
                </button>
                <button
                  type="button"
                  onClick={downloadJson}
                  className="btn-ghost !text-xs !py-1.5 !px-3 font-semibold flex items-center gap-1.5"
                  title="Export raw JSON"
                >
                  💾 Download JSON
                </button>
                <button
                  type="button"
                  onClick={() => fetchSubmissions(secret)}
                  className="btn-ghost !text-xs !py-1.5 !px-3"
                  title="Refresh list"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>

            {/* Main Submissions Content */}
            {submissions.length === 0 ? (
              <div className="wedding-card text-center py-12">
                <p className="text-stone-500 font-serif italic text-base">
                  No submissions recorded yet. Once ₹upi submits her questionnaire, it will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left List of Submissions */}
                <div className="lg:col-span-1 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 px-1">
                    All Submissions ({submissions.length})
                  </h3>

                  {submissions.map((sub) => {
                    const isSelected = selectedSubmission?.id === sub.id;
                    const dateFormatted = new Date(sub.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={sub.id}
                        onClick={() => setSelectedSubmission(sub)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-50/80 border-amber-400 shadow-sm"
                            : "bg-white border-stone-200 hover:border-amber-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-xs font-bold text-maroon">
                            #{sub.id}
                          </span>
                          <span className="text-[11px] text-stone-500">
                            {dateFormatted}
                          </span>
                        </div>

                        <div className="font-display font-bold text-sm text-stone-800">
                          {sub.bride_name} &amp; {sub.groom_name}
                        </div>

                        <div className="text-xs text-stone-600 mt-1 truncate">
                          {sub.father_prefix} {sub.father_name} • {sub.mobile_1}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Details Panel for Selected Submission */}
                <div className="lg:col-span-2">
                  {selectedSubmission ? (
                    <div className="wedding-card !p-6 space-y-6">
                      {/* Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-maroon text-sm">
                              Submission #{selectedSubmission.id}
                            </span>
                            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                              Saved to Database
                            </span>
                          </div>
                          <div className="text-xs text-stone-500 mt-1">
                            Recorded: {new Date(selectedSubmission.created_at).toLocaleString("en-IN")}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => copyFormattedForDesigner(selectedSubmission)}
                            className="btn-primary !text-xs !py-2 !px-4"
                            title="Copy full worded card for printing"
                          >
                            📋 Copy Card Wording
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(selectedSubmission.id)}
                            className="btn-remove"
                            title="Delete submission"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Detail Sections Grid */}
                      <div className="space-y-4 text-sm">
                        {/* 1. Couple */}
                        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200">
                          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-maroon mb-2">
                            Bride &amp; Groom
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-stone-500 block">Bride:</span>
                              <span className="font-semibold text-stone-800 text-sm">
                                {selectedSubmission.bride_name} {selectedSubmission.bride_initials ? `(${selectedSubmission.bride_initials})` : ""}
                              </span>
                            </div>
                            <div>
                              <span className="text-stone-500 block">Groom:</span>
                              <span className="font-semibold text-stone-800 text-sm">
                                {selectedSubmission.groom_name}
                              </span>
                            </div>
                            <div>
                              <span className="text-stone-500 block">Groom&apos;s Parents:</span>
                              <span className="text-stone-800">
                                {selectedSubmission.groom_mother_name ? `${selectedSubmission.groom_mother_prefix} ${selectedSubmission.groom_mother_name}` : "—"} &amp;{" "}
                                {selectedSubmission.groom_father_name ? `${selectedSubmission.groom_father_prefix} ${selectedSubmission.groom_father_name}` : "—"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 2. Family & Contact */}
                        <div className="bg-white p-4 rounded-xl border border-amber-200">
                          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-maroon mb-2">
                            Family &amp; Residence
                          </h4>
                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="text-stone-500">Parents:</span>{" "}
                              <strong className="text-stone-800">
                                {selectedSubmission.father_prefix} {selectedSubmission.father_name} &amp; {selectedSubmission.mother_prefix} {selectedSubmission.mother_name}
                              </strong>
                            </div>
                            <div>
                              <span className="text-stone-500">Residence Address:</span>{" "}
                              <span className="text-stone-800">{selectedSubmission.family_address || "—"}</span>
                            </div>
                            <div className="flex items-center gap-4 pt-1">
                              {selectedSubmission.mobile_1 && (
                                <a
                                  href={`tel:${selectedSubmission.mobile_1}`}
                                  className="text-amber-800 hover:underline font-semibold flex items-center gap-1"
                                >
                                  📞 Call {selectedSubmission.mobile_1}
                                </a>
                              )}
                              {selectedSubmission.mobile_2 && (
                                <a
                                  href={`tel:${selectedSubmission.mobile_2}`}
                                  className="text-amber-800 hover:underline font-semibold flex items-center gap-1"
                                >
                                  📞 Call {selectedSubmission.mobile_2}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 3. Dates & Venues */}
                        <div className="bg-white p-4 rounded-xl border border-amber-200">
                          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-maroon mb-2">
                            Auspicious Dates &amp; Venues
                          </h4>
                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="text-stone-500">💍 Wedding Date:</span>{" "}
                              <strong className="text-maroon font-semibold">
                                {selectedSubmission.wedding_date || "—"}
                              </strong>
                            </div>
                            <div>
                              <span className="text-stone-500">Reception Venue:</span>{" "}
                              <span className="text-stone-800">{selectedSubmission.wedding_reception_venue}</span>{" "}
                              {selectedSubmission.wedding_map_url && (
                                <a
                                  href={selectedSubmission.wedding_map_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-amber-800 underline ml-2 font-medium"
                                >
                                  [View Map Pin]
                                </a>
                              )}
                            </div>
                            {selectedSubmission.haldi_date && (
                              <div>
                                <span className="text-stone-500">🌼 Haldi:</span>{" "}
                                <span className="text-stone-800">
                                  {selectedSubmission.haldi_date} ({selectedSubmission.haldi_venue || "Residence"})
                                </span>
                              </div>
                            )}
                            {selectedSubmission.mehndi_date && (
                              <div>
                                <span className="text-stone-500">🌿 Mehndi:</span>{" "}
                                <span className="text-stone-800">
                                  {selectedSubmission.mehndi_date} ({selectedSubmission.mehndi_venue || "Residence"})
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 4. Additional Notes */}
                        {selectedSubmission.additional_notes && (
                          <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-300 text-xs">
                            <span className="font-bold text-maroon block mb-1">
                              Special Instructions / Notes:
                            </span>
                            <p className="text-stone-700 whitespace-pre-wrap">
                              {selectedSubmission.additional_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="wedding-card text-center py-10 text-stone-500 font-serif italic">
                      Select a submission on the left to view details.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
