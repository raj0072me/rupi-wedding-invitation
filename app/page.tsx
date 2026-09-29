"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import RoyalDatePicker from "./components/RoyalDatePicker";
import LiveCardPreview from "./components/LiveCardPreview";

// ── Types ──────────────────────────────────────────────────────────────────
interface FormData {
  father_prefix: string;
  father_name: string;
  mother_prefix: string;
  mother_name: string;
  family_address: string;
  mobile_1: string;
  mobile_2: string;
  grandmother_name: string;
  grandfather_name: string;
  bride_name: string;
  bride_initials: string;
  groom_name: string;
  groom_mother_prefix: string;
  groom_mother_name: string;
  groom_father_prefix: string;
  groom_father_name: string;
  wedding_date: string;
  haldi_date: string;
  haldi_venue: string;
  mehndi_date: string;
  mehndi_venue: string;
  wedding_reception_venue: string;
  wedding_map_url: string;
  rsvp_names: string[];
  best_compliments: string[];
  additional_notes: string;
}

const DEFAULT_FORM: FormData = {
  father_prefix: "Sh.",
  father_name: "",
  mother_prefix: "Smt.",
  mother_name: "",
  family_address: "",
  mobile_1: "",
  mobile_2: "",
  grandmother_name: "",
  grandfather_name: "",
  bride_name: "Rupa",
  bride_initials: "",
  groom_name: "",
  groom_mother_prefix: "Smt.",
  groom_mother_name: "",
  groom_father_prefix: "Sh.",
  groom_father_name: "",
  wedding_date: "2027-01-30",
  haldi_date: "2027-01-29",
  haldi_venue: "",
  mehndi_date: "2027-01-29",
  mehndi_venue: "",
  wedding_reception_venue: "Kisan Bhawan, Sector 16, Faridabad, Haryana 121002",
  wedding_map_url: "https://maps.app.goo.gl/UzVhUn48VhkQPS88A",
  rsvp_names: [""],
  best_compliments: ["All Relatives & Friends"],
  additional_notes: "",
};

const STORAGE_KEY = "rupi_wedding_draft";
const TOTAL_STEPS = 10;

const STEP_TITLES = [
  "Welcome",
  "Family Details",
  "Divine Blessings",
  "The Bride",
  "The Groom",
  "Auspicious Dates",
  "Venues & Locations",
  "R.S.V.P.",
  "Best Compliments",
  "Review & Submit",
];

function formatMobileNumber(val: string): string {
  // Strip all non-digit characters, limit to 10 digits
  const digits = val.replace(/\D/g, "").slice(0, 10);
  // Auto add space after 5 digits (XXXXX XXXXX)
  if (digits.length > 5) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return digits;
}

export default function QuestionnairePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);
  const [isRestored, setIsRestored] = useState(false);
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [showLivePreviewModal, setShowLivePreviewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<{ id: number; submitted_at: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setFormData((prev) => ({
            ...prev,
            ...parsed,
            // ensure arrays and formatted numbers are intact
            mobile_1: parsed.mobile_1 ? formatMobileNumber(parsed.mobile_1) : prev.mobile_1,
            mobile_2: parsed.mobile_2 ? formatMobileNumber(parsed.mobile_2) : prev.mobile_2,
            rsvp_names: parsed.rsvp_names?.length ? parsed.rsvp_names : prev.rsvp_names,
            best_compliments: parsed.best_compliments?.length ? parsed.best_compliments : prev.best_compliments,
          }));
          setIsRestored(true);
          setTimeout(() => setIsRestored(false), 5000);
        }
      }
    } catch (e) {
      console.error("Failed to load local draft:", e);
    }
  }, []);

  // Save to localStorage on changes
  const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error("Local draft save error:", err);
      }
      return updated;
    });

    setIsSavedNotice(true);
    const timer = setTimeout(() => setIsSavedNotice(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Dynamic Array Helpers
  const handleRsvpChange = (index: number, val: string) => {
    const updated = [...formData.rsvp_names];
    updated[index] = val;
    updateField("rsvp_names", updated);
  };

  const addRsvpField = () => {
    updateField("rsvp_names", [...formData.rsvp_names, ""]);
  };

  const removeRsvpField = (index: number) => {
    if (formData.rsvp_names.length <= 1) {
      updateField("rsvp_names", [""]);
      return;
    }
    const updated = formData.rsvp_names.filter((_, i) => i !== index);
    updateField("rsvp_names", updated);
  };

  const handleComplimentChange = (index: number, val: string) => {
    const updated = [...formData.best_compliments];
    updated[index] = val;
    updateField("best_compliments", updated);
  };

  const addComplimentField = () => {
    updateField("best_compliments", [...formData.best_compliments, ""]);
  };

  const removeComplimentField = (index: number) => {
    if (formData.best_compliments.length <= 1) {
      updateField("best_compliments", [""]);
      return;
    }
    const updated = formData.best_compliments.filter((_, i) => i !== index);
    updateField("best_compliments", updated);
  };

  // Step Navigation
  const goToNextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      startTransition(() => {
        setCurrentStep((s) => s + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      startTransition(() => {
        setCurrentStep((s) => s - 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  };

  const jumpToStep = (stepNumber: number) => {
    startTransition(() => {
      setCurrentStep(stepNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Submission failed. Please check required fields.");
      }

      // Success! Clear local draft
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}

      setSubmissionSuccess({
        id: data.id,
        submitted_at: data.submitted_at || new Date().toISOString(),
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const error = err as Error;
      setSubmitError(error.message || "Failed to submit. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate Progress Percentage
  const progressPercent = Math.round((currentStep / TOTAL_STEPS) * 100);

  return (
    <>
      {/* ─── Top Luxury Navigation Header ─── */}
      <header className="royal-header py-3 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-amber-400 p-0.5 bg-white shadow-sm flex-shrink-0">
              <Image
                src="/rupi.png"
                alt="₹upi Monogram"
                width={36}
                height={36}
                className="rounded-full object-cover"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-playfair text-base sm:text-lg font-bold text-maroon tracking-wide">
                  Rupi&apos;s Wedding
                </span>
                <span className="text-sm">❤️</span>
              </div>
              <span className="text-[11px] text-amber-900/70 font-sans tracking-wide uppercase font-semibold hidden sm:inline">
                Information Form
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Portal Link */}
            <Link
              href="/admin"
              className="text-xs font-semibold text-stone-600 hover:text-maroon px-2 py-1 transition-colors"
              title="Admin Portal"
            >
              Admin 🔒
            </Link>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="max-w-5xl mx-auto mt-2 px-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-amber-900 mb-1">
            <span>Step {currentStep} of {TOTAL_STEPS}: {STEP_TITLES[currentStep - 1]}</span>
            <span>{progressPercent}% Completed</span>
          </div>
          <div className="progress-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* ─── Main Content Container ─── */}
      <main className="form-container py-8 flex-1">
        {/* Draft Restored Banner */}
        {isRestored && (
          <div className="mb-6 bg-amber-50/90 border border-amber-300 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-900 shadow-sm fade-in">
            <div className="flex items-center gap-2">
              <span className="text-base">✨</span>
              <span>
                <strong>Welcome back, ₹upi!</strong> Your previously entered details have been automatically restored.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsRestored(false)}
              className="text-stone-400 hover:text-stone-700 ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Live Auto-save indicator */}
        <div className="flex items-center justify-end mb-3 pr-1">
          <span className="text-[11px] text-stone-500 font-serif italic flex items-center gap-1">
            {isSavedNotice ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                ✓ Saved to this device
              </span>
            ) : (
              <span>🔒 Automatically saved on every keystroke</span>
            )}
          </span>
        </div>

        {/* ─── Submission Success View ─── */}
        {submissionSuccess ? (
          <div className="wedding-card text-center py-10 px-6 fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-amber-50 border-2 border-amber-400 flex items-center justify-center text-3xl mb-4 shadow-lg pulse-gold">
              👑
            </div>

            <h2 className="section-header text-2xl sm:text-3xl text-maroon mb-2">
              Thank You, Rupi! ❤️
            </h2>
            <p className="section-subtitle max-w-md mx-auto mb-6 text-base">
              Your wedding details have been safely received by Bhai. Everything has been noted down!
            </p>

            <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-4 max-w-sm mx-auto mb-8 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-stone-500">Submission ID:</span>
                <span className="font-mono font-bold text-maroon">#{submissionSuccess.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Bride & Groom:</span>
                <span className="font-semibold text-stone-800">{formData.bride_name} & {formData.groom_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Recorded At:</span>
                <span className="font-mono text-stone-700">
                  {new Date(submissionSuccess.submitted_at).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setSubmissionSuccess(null);
                  setCurrentStep(1);
                  setFormData(DEFAULT_FORM);
                }}
                className="btn-secondary"
              >
                Submit New Entry
              </button>
            </div>
          </div>
        ) : (
          /* ─── 10-Step Wizard ─── */
          <div className="wedding-card fade-in">
            {/* ── STEP 1: Welcome ── */}
            {currentStep === 1 && (
              <div className="text-center py-4">
                <div className="flex justify-center mb-4">
                  <div className="royal-crest-wrapper pulse-gold">
                    <Image
                      src="/rupi.png"
                      alt="Rupi"
                      width={88}
                      height={88}
                      className="rounded-full object-cover"
                      priority
                    />
                  </div>
                </div>

                <div className="text-amber-800 font-serif italic text-sm mb-1">
                  ॥ श्री गणेशाय नमः ॥
                </div>

                <h1 className="section-header text-2xl sm:text-3xl text-maroon mb-3">
                  Dear Rupi ❤️
                </h1>

                <p className="section-subtitle max-w-lg mx-auto text-base sm:text-lg mb-8 leading-relaxed">
                  To keep all your wedding details organized in one easy place without repeated messages and calls, please fill in your details here at your own comfortable pace.
                </p>

                <button
                  id="btn-begin-questionnaire"
                  type="button"
                  onClick={goToNextStep}
                  className="btn-primary text-base !py-3.5 !px-8"
                >
                  Start Form ✨
                </button>
              </div>
            )}

            {/* ── STEP 2: "A Cordial Invitation From" (Family Details) ── */}
            {currentStep === 2 && (
              <div>
                <div className="mb-6">
                  <span className="text-xs uppercase tracking-widest text-amber-700 font-semibold font-display">
                    Section 1 • Family Details
                  </span>
                  <h2 className="section-header mt-1">A Cordial Invitation From</h2>
                  <p className="section-subtitle">
                    Enter the names of the esteemed parents sending this sacred invitation.
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Father's Name */}
                  <div>
                    <label className="field-label" htmlFor="father_name">
                      Father&apos;s Name *
                    </label>
                    <div className="prefix-input-group">
                      <select
                        value={formData.father_prefix}
                        onChange={(e) => updateField("father_prefix", e.target.value)}
                        className="prefix-select"
                        aria-label="Father's Prefix"
                      >
                        <option value="Sh.">Sh.</option>
                        <option value="Late Sh.">Late Sh.</option>
                        <option value="Mr.">Mr.</option>
                      </select>
                      <input
                        id="father_name"
                        type="text"
                        placeholder="e.g. Ramesh Kumar Sharma"
                        value={formData.father_name}
                        onChange={(e) => updateField("father_name", e.target.value)}
                        className="wedding-input flex-1"
                        required
                      />
                    </div>
                    <p className="field-note">✦ Please ensure spellings match official family records.</p>
                  </div>

                  {/* Mother's Name */}
                  <div>
                    <label className="field-label" htmlFor="mother_name">
                      Mother&apos;s Name *
                    </label>
                    <div className="prefix-input-group">
                      <select
                        value={formData.mother_prefix}
                        onChange={(e) => updateField("mother_prefix", e.target.value)}
                        className="prefix-select"
                        aria-label="Mother's Prefix"
                      >
                        <option value="Smt.">Smt.</option>
                        <option value="Late Smt.">Late Smt.</option>
                        <option value="Mrs.">Mrs.</option>
                      </select>
                      <input
                        id="mother_name"
                        type="text"
                        placeholder="e.g. Sunita Sharma"
                        value={formData.mother_name}
                        onChange={(e) => updateField("mother_name", e.target.value)}
                        className="wedding-input flex-1"
                        required
                      />
                    </div>
                  </div>

                  {/* Family Residence Address */}
                  <div>
                    <label className="field-label" htmlFor="family_address">
                      Family Residence Address
                    </label>
                    <textarea
                      id="family_address"
                      placeholder="e.g. House No. 123, Sector 16, Faridabad, Haryana - 121002"
                      value={formData.family_address}
                      onChange={(e) => updateField("family_address", e.target.value)}
                      className="wedding-input wedding-textarea"
                    />
                    <p className="field-note">
                      ✦ Printed on the invitation card under &quot;Residence&quot;.
                    </p>
                  </div>

                  {/* Mobile Numbers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="field-label" htmlFor="mobile_1">
                        Primary Contact Mobile
                      </label>
                      <input
                        id="mobile_1"
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9 ]*"
                        maxLength={11}
                        placeholder="98765 43210"
                        value={formData.mobile_1}
                        onChange={(e) => updateField("mobile_1", formatMobileNumber(e.target.value))}
                        className="wedding-input tracking-wider font-mono text-base"
                      />
                      <p className="field-note">✦ 10 digits (e.g. 98765 43210)</p>
                    </div>
                    <div>
                      <label className="field-label" htmlFor="mobile_2">
                        Alternate Contact Mobile (Optional)
                      </label>
                      <input
                        id="mobile_2"
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9 ]*"
                        maxLength={11}
                        placeholder="98111 22334"
                        value={formData.mobile_2}
                        onChange={(e) => updateField("mobile_2", formatMobileNumber(e.target.value))}
                        className="wedding-input tracking-wider font-mono text-base"
                      />
                      <p className="field-note">✦ Optional secondary mobile number</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: Blessings & Elders ── */}
            {currentStep === 3 && (
              <div>
                <div className="mb-6">
                  <span className="text-xs uppercase tracking-widest text-amber-700 font-semibold font-display">
                    Section 2 • Revered Elders
                  </span>
                  <h2 className="section-header mt-1">With the Heavenly Blessings Of</h2>
                  <p className="section-subtitle">
                    Honoring beloved grandparents whose divine grace guides this sacred union.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="field-label" htmlFor="grandfather_name">
                      Grandfather&apos;s Name (Dada Ji)
                    </label>
                    <input
                      id="grandfather_name"
                      type="text"
                      placeholder="e.g. Late Sh. Moolchand Sharma"
                      value={formData.grandfather_name}
                      onChange={(e) => updateField("grandfather_name", e.target.value)}
                      className="wedding-input"
                    />
                    <p className="field-note">✦ You may include honorifics such as &quot;Late Sh.&quot; or &quot;Dada Ji&quot;.</p>
                  </div>

                  <div>
                    <label className="field-label" htmlFor="grandmother_name">
                      Grandmother&apos;s Name (Dadi Ji)
                    </label>
                    <input
                      id="grandmother_name"
                      type="text"
                      placeholder="e.g. Late Smt. Bhagwati Devi"
                      value={formData.grandmother_name}
                      onChange={(e) => updateField("grandmother_name", e.target.value)}
                      className="wedding-input"
                    />
                    <p className="field-note">✦ Leave blank if you prefer not to include ancestors on the card.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 4: The Bride (₹upi) ── */}
            {currentStep === 4 && (
              <div>
                <div className="mb-6">
                  <span className="text-xs uppercase tracking-widest text-amber-700 font-semibold font-display">
                    Section 3 • The Bride
                  </span>
                  <h2 className="section-header mt-1">The Radiant Bride</h2>
                  <p className="section-subtitle">
                    The queen of this celebration.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="field-label" htmlFor="bride_name">
                      Bride&apos;s Full Name (Formal) *
                    </label>
                    <input
                      id="bride_name"
                      type="text"
                      placeholder="Rupa"
                      value={formData.bride_name}
                      onChange={(e) => updateField("bride_name", e.target.value)}
                      className="wedding-input font-display font-semibold text-lg"
                      required
                    />
                    <p className="field-note">✦ Your lovely full name for our family records ❤️</p>
                  </div>

                  <div>
                    <label className="field-label" htmlFor="bride_initials">
                      Affectionate Nickname / Monogram (Optional)
                    </label>
                    <input
                      id="bride_initials"
                      type="text"
                      placeholder="e.g. ₹upi or initials"
                      value={formData.bride_initials}
                      onChange={(e) => updateField("bride_initials", e.target.value)}
                      className="wedding-input"
                    />
                    <p className="field-note">
                      ✦ If you want to add your nickname or initials (like ₹upi or R&amp;A)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 5: The Groom & His Family ── */}
            {currentStep === 5 && (
              <div>
                <div className="mb-6">
                  <span className="text-xs uppercase tracking-widest text-amber-700 font-semibold font-display">
                    Section 4 • The Groom
                  </span>
                  <h2 className="section-header mt-1">The Groom & His Family</h2>
                  <p className="section-subtitle">
                    Details of the handsome groom and his honorable parents.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="field-label" htmlFor="groom_name">
                      Groom&apos;s Full Name *
                    </label>
                    <input
                      id="groom_name"
                      type="text"
                      placeholder="Attapattu"
                      value={formData.groom_name}
                      onChange={(e) => updateField("groom_name", e.target.value)}
                      className="wedding-input font-display font-semibold text-lg"
                      required
                    />
                  </div>

                  {/* Groom Mother */}
                  <div>
                    <label className="field-label" htmlFor="groom_mother_name">
                      Groom&apos;s Mother
                    </label>
                    <div className="prefix-input-group">
                      <select
                        value={formData.groom_mother_prefix}
                        onChange={(e) => updateField("groom_mother_prefix", e.target.value)}
                        className="prefix-select"
                        aria-label="Groom's Mother Prefix"
                      >
                        <option value="Smt.">Smt.</option>
                        <option value="Late Smt.">Late Smt.</option>
                        <option value="Mrs.">Mrs.</option>
                      </select>
                      <input
                        id="groom_mother_name"
                        type="text"
                        placeholder="Mother's Name"
                        value={formData.groom_mother_name}
                        onChange={(e) => updateField("groom_mother_name", e.target.value)}
                        className="wedding-input flex-1"
                      />
                    </div>
                  </div>

                  {/* Groom Father */}
                  <div>
                    <label className="field-label" htmlFor="groom_father_name">
                      Groom&apos;s Father
                    </label>
                    <div className="prefix-input-group">
                      <select
                        value={formData.groom_father_prefix}
                        onChange={(e) => updateField("groom_father_prefix", e.target.value)}
                        className="prefix-select"
                        aria-label="Groom's Father Prefix"
                      >
                        <option value="Sh.">Sh.</option>
                        <option value="Late Sh.">Late Sh.</option>
                        <option value="Mr.">Mr.</option>
                      </select>
                      <input
                        id="groom_father_name"
                        type="text"
                        placeholder="Father's Name"
                        value={formData.groom_father_name}
                        onChange={(e) => updateField("groom_father_name", e.target.value)}
                        className="wedding-input flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 6: Auspicious Dates & Times ── */}
            {currentStep === 6 && (
              <div>
                <div className="mb-6">
                  <span className="text-xs uppercase tracking-widest text-amber-700 font-semibold font-display">
                    Section 5 • Auspicious Dates
                  </span>
                  <h2 className="section-header mt-1">Sacred Wedding Dates</h2>
                  <p className="section-subtitle">
                    Select the mahurat and ceremony dates using the Royal Calendar.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Wedding Date */}
                  <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-300/50">
                    <RoyalDatePicker
                      label="💍 Wedding & Reception Date *"
                      sublabel="Main auspicious wedding ceremony"
                      value={formData.wedding_date}
                      onChange={(val) => updateField("wedding_date", val)}
                      icon="🪔"
                      placeholder="Select Wedding Date"
                    />
                  </div>

                  {/* Haldi Ceremony Date */}
                  <div>
                    <RoyalDatePicker
                      label="🌼 Haldi Ceremony Date"
                      sublabel="Auspicious turmeric ceremony"
                      value={formData.haldi_date}
                      onChange={(val) => updateField("haldi_date", val)}
                      icon="🌼"
                      placeholder="Select Haldi Date (Optional)"
                    />
                  </div>

                  {/* Mehndi Ceremony Date */}
                  <div>
                    <RoyalDatePicker
                      label="🌿 Mehndi Ceremony Date"
                      sublabel="Henna celebration with loved ones"
                      value={formData.mehndi_date}
                      onChange={(val) => updateField("mehndi_date", val)}
                      icon="🌿"
                      placeholder="Select Mehndi Date (Optional)"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 7: Venues & Locations (Smart Autofill) ── */}
            {currentStep === 7 && (
              <div>
                <div className="mb-6">
                  <span className="text-xs uppercase tracking-widest text-amber-700 font-semibold font-display">
                    Section 6 • Venues &amp; Locations
                  </span>
                  <h2 className="section-header mt-1">Ceremony Venues &amp; Locations</h2>
                  <p className="section-subtitle">
                    Tell us where each wedding ceremony will take place.
                  </p>

                  <div className="mt-3.5 bg-amber-50/80 border border-amber-300/80 rounded-xl p-3.5 text-xs text-amber-950 space-y-1.5">
                    <p className="font-semibold text-maroon flex items-center gap-1.5">
                      <span>💡</span>
                      <span>How this works:</span>
                    </p>
                    <p className="leading-relaxed">
                      • <strong>Wedding &amp; Reception:</strong> Already filled with <em>Kisan Bhawan, Sector 16, Faridabad</em> along with the Google Maps pin.
                    </p>
                    <p className="leading-relaxed">
                      • <strong>Haldi &amp; Mehndi:</strong> You don&apos;t have to re-type addresses! Just click <span className="bg-white px-1.5 py-0.5 rounded border border-amber-300 font-medium">🏠 Same as Home Address</span> to automatically use your home address from Step 2, or <span className="bg-white px-1.5 py-0.5 rounded border border-amber-300 font-medium">🏛️ Same as Wedding Venue</span>, or enter another venue name if held elsewhere.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Wedding & Reception Venue */}
                  <div className="venue-highlight-card">
                    <label className="field-label" htmlFor="wedding_reception_venue">
                      💍 Wedding & Reception Venue *
                    </label>
                    <textarea
                      id="wedding_reception_venue"
                      value={formData.wedding_reception_venue}
                      onChange={(e) => updateField("wedding_reception_venue", e.target.value)}
                      className="wedding-input wedding-textarea"
                    />
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <a
                        href={formData.wedding_map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-800 hover:text-maroon font-semibold underline flex items-center gap-1"
                      >
                        📍 Open Google Maps Pin Link
                      </a>
                      <span className="text-stone-500 font-serif italic">Sector 16, Faridabad</span>
                    </div>
                  </div>

                  {/* Haldi Venue */}
                  <div>
                    <label className="field-label" htmlFor="haldi_venue">
                      🌼 Haldi Ceremony Venue
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (formData.family_address) {
                            updateField("haldi_venue", formData.family_address);
                          } else {
                            alert("Please enter your Family Residence Address first in Step 2.");
                          }
                        }}
                        className="autofill-pill"
                      >
                        🏠 Same as Home Address
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField("haldi_venue", formData.wedding_reception_venue)}
                        className="autofill-pill"
                      >
                        🏛️ Same as Wedding Venue
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField("haldi_venue", "")}
                        className="autofill-pill"
                      >
                        ✎ Clear Venue
                      </button>
                    </div>
                    <input
                      id="haldi_venue"
                      type="text"
                      placeholder="e.g. Family Residence or Banquet Hall"
                      value={formData.haldi_venue}
                      onChange={(e) => updateField("haldi_venue", e.target.value)}
                      className="wedding-input"
                    />
                  </div>

                  {/* Mehndi Venue */}
                  <div>
                    <label className="field-label" htmlFor="mehndi_venue">
                      🌿 Mehndi Ceremony Venue
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (formData.family_address) {
                            updateField("mehndi_venue", formData.family_address);
                          } else {
                            alert("Please enter your Family Residence Address first in Step 2.");
                          }
                        }}
                        className="autofill-pill"
                      >
                        🏠 Same as Home Address
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField("mehndi_venue", formData.wedding_reception_venue)}
                        className="autofill-pill"
                      >
                        🏛️ Same as Wedding Venue
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField("mehndi_venue", "")}
                        className="autofill-pill"
                      >
                        ✎ Clear Venue
                      </button>
                    </div>
                    <input
                      id="mehndi_venue"
                      type="text"
                      placeholder="e.g. Family Residence or Banquet Hall"
                      value={formData.mehndi_venue}
                      onChange={(e) => updateField("mehndi_venue", e.target.value)}
                      className="wedding-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 8: RSVP Contacts (Dynamic List) ── */}
            {currentStep === 8 && (
              <div>
                <div className="mb-6">
                  <span className="text-xs uppercase tracking-widest text-amber-700 font-semibold font-display">
                    Section 7 • R.S.V.P.
                  </span>
                  <h2 className="section-header mt-1">R.S.V.P. Contacts</h2>
                  <p className="section-subtitle">
                    Family members or event coordinators to contact for guest queries.
                  </p>
                  <p className="field-note text-amber-800/80 mt-1">
                    ✦ Note: Mobile number is optional. You can just enter names or designations.
                  </p>
                </div>

                <div className="space-y-3">
                  {formData.rsvp_names.map((contact, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Chacha Ji or Rohit (Mobile number optional)"
                        value={contact}
                        onChange={(e) => handleRsvpChange(index, e.target.value)}
                        className="wedding-input flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeRsvpField(index)}
                        className="btn-remove"
                        title="Remove contact"
                        aria-label={`Remove RSVP contact ${index + 1}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={addRsvpField}
                      className="btn-ghost"
                    >
                      + Add Another RSVP Contact
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 9: "With Best Compliments From" (Dynamic List) ── */}
            {currentStep === 9 && (
              <div>
                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-widest text-amber-700 font-semibold font-display">
                      Section 8 • Well-Wishers
                    </span>
                    <span className="text-[11px] uppercase tracking-wider text-stone-400 font-medium bg-stone-100/80 px-2 py-0.5 rounded-full">
                      Optional
                    </span>
                  </div>
                  <h2 className="section-header mt-1">
                    With Best Compliments From <span className="text-sm font-normal text-stone-400 font-serif italic">(Optional)</span>
                  </h2>
                  <p className="section-subtitle opacity-60 text-xs italic text-stone-500">
                    Family groups, maternal uncles (Nanihal), cousins, and dear friends.
                  </p>
                </div>

                <div className="space-y-3">
                  {formData.best_compliments.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g. All Relatives & Friends / Sharma Parivaar"
                        value={item}
                        onChange={(e) => handleComplimentChange(index, e.target.value)}
                        className="wedding-input flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeComplimentField(index)}
                        className="btn-remove"
                        title="Remove compliment entry"
                        aria-label={`Remove compliment ${index + 1}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={addComplimentField}
                      className="btn-ghost"
                    >
                      + Add Another Well-Wisher Group
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 10: Review, Preview & Submit ── */}
            {currentStep === 10 && (
              <div>
                <div className="mb-6">
                  <span className="text-xs uppercase tracking-widest text-amber-700 font-semibold font-display">
                    Final Step • Confirmation
                  </span>
                  <h2 className="section-header mt-1">Review Details &amp; Send to Bhai</h2>
                  <p className="section-subtitle">
                    Please review all the details you entered below before sending them to Bhai.
                  </p>
                </div>

                {/* Live Card Simulation Preview Component */}
                <div className="mb-8">
                  <LiveCardPreview
                    fatherPrefix={formData.father_prefix}
                    fatherName={formData.father_name}
                    motherPrefix={formData.mother_prefix}
                    motherName={formData.mother_name}
                    familyAddress={formData.family_address}
                    mobile1={formData.mobile_1}
                    mobile2={formData.mobile_2}
                    grandmotherName={formData.grandmother_name}
                    grandfatherName={formData.grandfather_name}
                    brideName={formData.bride_name}
                    brideInitials={formData.bride_initials}
                    groomName={formData.groom_name}
                    groomMotherPrefix={formData.groom_mother_prefix}
                    groomMotherName={formData.groom_mother_name}
                    groomFatherPrefix={formData.groom_father_prefix}
                    groomFatherName={formData.groom_father_name}
                    weddingDate={formData.wedding_date}
                    haldiDate={formData.haldi_date}
                    haldiVenue={formData.haldi_venue}
                    mehndiDate={formData.mehndi_date}
                    mehndiVenue={formData.mehndi_venue}
                    weddingVenue={formData.wedding_reception_venue}
                    rsvpList={formData.rsvp_names}
                    complimentsList={formData.best_compliments}
                  />
                </div>

                {/* Structured Summary Rows with Quick Edit Buttons */}
                <div className="space-y-4 mb-6">
                  {/* Family Details Card */}
                  <div className="review-card-section">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-display font-bold text-xs uppercase tracking-wider text-maroon">
                        1. Family Details
                      </h4>
                      <button
                        type="button"
                        onClick={() => jumpToStep(2)}
                        className="text-xs text-amber-800 hover:underline font-semibold"
                      >
                        Edit ✎
                      </button>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Parents:</span>
                      <span className="review-value">
                        {formData.father_prefix} {formData.father_name || "—"} & {formData.mother_prefix} {formData.mother_name || "—"}
                      </span>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Address:</span>
                      <span className="review-value">{formData.family_address || "—"}</span>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Mobiles:</span>
                      <span className="review-value">
                        {formData.mobile_1 || "—"} {formData.mobile_2 ? `• ${formData.mobile_2}` : ""}
                      </span>
                    </div>
                  </div>

                  {/* Bride & Groom Card */}
                  <div className="review-card-section">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-display font-bold text-xs uppercase tracking-wider text-maroon">
                        2. Couple Details
                      </h4>
                      <button
                        type="button"
                        onClick={() => jumpToStep(4)}
                        className="text-xs text-amber-800 hover:underline font-semibold"
                      >
                        Edit ✎
                      </button>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Bride:</span>
                      <span className="review-value">
                        {formData.bride_name} {formData.bride_initials ? `(${formData.bride_initials})` : ""}
                      </span>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Groom:</span>
                      <span className="review-value">{formData.groom_name || "—"}</span>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Groom Parents:</span>
                      <span className="review-value">
                        {formData.groom_mother_name ? `${formData.groom_mother_prefix} ${formData.groom_mother_name}` : "—"} &{" "}
                        {formData.groom_father_name ? `${formData.groom_father_prefix} ${formData.groom_father_name}` : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Dates & Venues Card */}
                  <div className="review-card-section">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-display font-bold text-xs uppercase tracking-wider text-maroon">
                        3. Dates & Venues
                      </h4>
                      <button
                        type="button"
                        onClick={() => jumpToStep(6)}
                        className="text-xs text-amber-800 hover:underline font-semibold"
                      >
                        Edit ✎
                      </button>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Wedding Date:</span>
                      <span className="review-value font-semibold text-maroon">
                        {formData.wedding_date || "—"}
                      </span>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Wedding Venue:</span>
                      <span className="review-value">{formData.wedding_reception_venue}</span>
                    </div>
                    {formData.haldi_date && (
                      <div className="review-row">
                        <span className="review-label">Haldi:</span>
                        <span className="review-value">
                          {formData.haldi_date} ({formData.haldi_venue || "Home"})
                        </span>
                      </div>
                    )}
                    {formData.mehndi_date && (
                      <div className="review-row">
                        <span className="review-label">Mehndi:</span>
                        <span className="review-value">
                          {formData.mehndi_date} ({formData.mehndi_venue || "Home"})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Notes Textarea */}
                <div className="mb-6">
                  <label className="field-label" htmlFor="additional_notes">
                    Special Notes or Specific Printing Instructions (Optional)
                  </label>
                  <textarea
                    id="additional_notes"
                    placeholder="e.g. Please include Lord Krishna shloka, add QR code for Google Maps, or special timings for dinner..."
                    value={formData.additional_notes}
                    onChange={(e) => updateField("additional_notes", e.target.value)}
                    className="wedding-input wedding-textarea"
                  />
                </div>

                {/* Error Banner */}
                {submitError && (
                  <div className="mb-6 bg-red-50 border border-red-300 text-red-700 p-4 rounded-xl text-sm flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Submit Action Button */}
                <div className="text-center pt-2">
                  <button
                    id="btn-submit-wedding-details"
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="btn-primary text-base !py-4 !px-10 w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin text-lg">⏳</span>
                        <span>Sending Details to Bhai...</span>
                      </span>
                    ) : (
                      <span>💌 Send Details to Bhai ❤️</span>
                    )}
                  </button>
                  <p className="text-xs text-stone-500 font-serif italic mt-3">
                    Your details will be immediately sent to Bhai for our family records.
                  </p>
                </div>
              </div>
            )}

            {/* ── Bottom Step Navigation Buttons ── */}
            {currentStep > 1 && currentStep < TOTAL_STEPS && (
              <div className="flex items-center justify-between pt-8 mt-6 border-t border-amber-200/60">
                <button
                  type="button"
                  onClick={goToPrevStep}
                  className="btn-secondary"
                >
                  ← Back
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={goToNextStep}
                    className="btn-primary"
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {currentStep === 10 && (
              <div className="flex items-center justify-start pt-6 mt-6 border-t border-amber-200/60">
                <button
                  type="button"
                  onClick={goToPrevStep}
                  className="btn-secondary"
                >
                  ← Back to Best Compliments
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─── Floating Live Card Preview Modal ─── */}
      {showLivePreviewModal && (
        <div
          className="royal-date-modal-overlay"
          onClick={() => setShowLivePreviewModal(false)}
        >
          <div
            className="royal-date-modal !max-w-2xl max-h-[90vh] overflow-y-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <LiveCardPreview
              fatherPrefix={formData.father_prefix}
              fatherName={formData.father_name}
              motherPrefix={formData.mother_prefix}
              motherName={formData.mother_name}
              familyAddress={formData.family_address}
              mobile1={formData.mobile_1}
              mobile2={formData.mobile_2}
              grandmotherName={formData.grandmother_name}
              grandfatherName={formData.grandfather_name}
              brideName={formData.bride_name}
              brideInitials={formData.bride_initials}
              groomName={formData.groom_name}
              groomMotherPrefix={formData.groom_mother_prefix}
              groomMotherName={formData.groom_mother_name}
              groomFatherPrefix={formData.groom_father_prefix}
              groomFatherName={formData.groom_father_name}
              weddingDate={formData.wedding_date}
              haldiDate={formData.haldi_date}
              haldiVenue={formData.haldi_venue}
              mehndiDate={formData.mehndi_date}
              mehndiVenue={formData.mehndi_venue}
              weddingVenue={formData.wedding_reception_venue}
              rsvpList={formData.rsvp_names}
              complimentsList={formData.best_compliments}
              onClose={() => setShowLivePreviewModal(false)}
            />
          </div>
        </div>
      )}

      {/* ─── Footer ─── */}
      <footer className="site-footer">
        <p className="text-xs text-stone-500 font-serif">
          Crafted with love for <strong>Rupa (₹upi)</strong> ❤️ • Kisan Bhawan, Sector 16, Faridabad
        </p>
      </footer>
    </>
  );
}
