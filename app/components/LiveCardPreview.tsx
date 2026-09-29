"use client";

import Image from "next/image";

interface CardPreviewProps {
  fatherPrefix: string;
  fatherName: string;
  motherPrefix: string;
  motherName: string;
  familyAddress: string;
  mobile1: string;
  mobile2: string;
  grandmotherName: string;
  grandfatherName: string;
  brideName: string;
  brideInitials: string;
  groomName: string;
  groomMotherPrefix: string;
  groomMotherName: string;
  groomFatherPrefix: string;
  groomFatherName: string;
  weddingDate: string;
  haldiDate: string;
  haldiVenue: string;
  mehndiDate: string;
  mehndiVenue: string;
  weddingVenue: string;
  rsvpList: string[];
  complimentsList: string[];
  onClose?: () => void;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "Auspicious Date to be confirmed";
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function LiveCardPreview({
  fatherPrefix,
  fatherName,
  motherPrefix,
  motherName,
  familyAddress,
  mobile1,
  mobile2,
  grandmotherName,
  grandfatherName,
  brideName,
  brideInitials,
  groomName,
  groomMotherPrefix,
  groomMotherName,
  groomFatherPrefix,
  groomFatherName,
  weddingDate,
  haldiDate,
  haldiVenue,
  mehndiDate,
  mehndiVenue,
  weddingVenue,
  rsvpList,
  complimentsList,
  onClose,
}: CardPreviewProps) {
  const displayBride = brideName.trim() || "Rupa";
  const displayGroom = groomName.trim() || "Groom Name";
  const displayFather = fatherName.trim() ? `${fatherPrefix} ${fatherName.trim()}` : "Sh. Father's Name";
  const displayMother = motherName.trim() ? `${motherPrefix} ${motherName.trim()}` : "Smt. Mother's Name";

  const cleanRsvps = rsvpList.filter((item) => item && item.trim());
  const cleanCompliments = complimentsList.filter((item) => item && item.trim());

  return (
    <div className="live-card-container">
      {/* Action Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">📜</span>
          <div>
            <h4 className="font-display font-bold text-maroon text-base">Summary Card Preview</h4>
            <p className="text-xs text-stone-500 font-serif italic">
              Preview of how your shared details come together
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="royal-date-close-btn"
            aria-label="Close Preview"
          >
            ✕
          </button>
        )}
      </div>

      {/* Realistic Physical Wedding Card */}
      <div className="physical-wedding-card">
        {/* Ornate Gold Border Corners */}
        <div className="gold-corner top-left"></div>
        <div className="gold-corner top-right"></div>
        <div className="gold-corner bottom-left"></div>
        <div className="gold-corner bottom-right"></div>

        {/* Sacred Header Shloka */}
        <div className="text-center pt-2">
          <div className="shloka-om">॥ श्री गणेशाय नमः ॥</div>
          <div className="shloka-sanskrit">
            वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥
          </div>
          <div className="w-20 h-0.5 mx-auto bg-gradient-to-r from-transparent via-amber-600 to-transparent my-2"></div>
        </div>

        {/* Royal Crest / Monogram */}
        <div className="flex justify-center my-2">
          <div className="royal-crest-wrapper pulse-gold">
            <Image
              src="/rupi.png"
              alt="Royal Wedding Crest"
              width={72}
              height={72}
              className="rounded-full shadow-inner object-cover"
            />
          </div>
        </div>

        {/* Heavenly Blessings */}
        {(grandfatherName || grandmotherName) && (
          <div className="text-center my-3 px-4">
            <div className="card-subhead-script">With the Heavenly Blessings of</div>
            <div className="card-elders">
              {grandfatherName && <span>{grandfatherName}</span>}
              {grandfatherName && grandmotherName && <span> & </span>}
              {grandmotherName && <span>{grandmotherName}</span>}
            </div>
          </div>
        )}

        {/* Cordial Invitation From Parents */}
        <div className="text-center my-3 px-4">
          <div className="card-hosts">
            {displayMother} & {displayFather}
          </div>
          <p className="card-body-text max-w-lg mx-auto">
            cordially invite your auspicious presence and blessings on the joyous wedding ceremony of their cherished daughter
          </p>
        </div>

        {/* Bride & Groom Centerpiece */}
        <div className="text-center my-5 py-4 px-2 bg-gradient-to-r from-amber-500/5 via-amber-500/15 to-amber-500/5 rounded-xl border-y border-amber-300/40">
          <div className="card-bride-name">
            {displayBride}
            {brideInitials && <span className="card-nickname"> ({brideInitials})</span>}
          </div>
          <div className="card-weds">weds</div>
          <div className="card-groom-name">{displayGroom}</div>
          <div className="card-groom-parents">
            Son of {groomMotherName ? `${groomMotherPrefix} ${groomMotherName}` : "Smt. Groom's Mother"} &{" "}
            {groomFatherName ? `${groomFatherPrefix} ${groomFatherName}` : "Sh. Groom's Father"}
          </div>
        </div>

        {/* Programme Section */}
        <div className="card-events-section my-4">
          <div className="card-events-header">Auspicious Celebrations</div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center mt-3">
            {/* Haldi */}
            <div className="card-event-badge haldi">
              <div className="event-icon">🌼</div>
              <div className="event-title">Haldi Ceremony</div>
              <div className="event-date">{formatDate(haldiDate)}</div>
              <div className="event-venue">{haldiVenue || "Residence / TBD"}</div>
            </div>

            {/* Mehndi */}
            <div className="card-event-badge mehndi">
              <div className="event-icon">🌿</div>
              <div className="event-title">Mehndi Ceremony</div>
              <div className="event-date">{formatDate(mehndiDate)}</div>
              <div className="event-venue">{mehndiVenue || "Residence / TBD"}</div>
            </div>

            {/* Wedding */}
            <div className="card-event-badge wedding">
              <div className="event-icon">🪔</div>
              <div className="event-title">Wedding & Reception</div>
              <div className="event-date">{formatDate(weddingDate)}</div>
              <div className="event-venue">{weddingVenue || "Kisan Bhawan, Sector 16, Faridabad"}</div>
            </div>
          </div>
        </div>

        {/* Bottom Details Grid */}
        <div className="border-t border-amber-200/80 pt-4 mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* RSVP */}
          <div>
            <span className="card-footer-title">R.S.V.P.</span>
            {cleanRsvps.length > 0 ? (
              <ul className="mt-1 space-y-0.5 text-stone-700">
                {cleanRsvps.map((name, i) => (
                  <li key={i}>• {name}</li>
                ))}
              </ul>
            ) : (
              <p className="text-stone-400 italic mt-0.5">Family & Friends</p>
            )}
          </div>

          {/* Compliments */}
          <div>
            <span className="card-footer-title">With Best Compliments From</span>
            {cleanCompliments.length > 0 ? (
              <p className="mt-1 text-stone-700 leading-relaxed">
                {cleanCompliments.join(", ")}
              </p>
            ) : (
              <p className="text-stone-400 italic mt-0.5">Near & Dear Ones</p>
            )}
          </div>
        </div>

        {/* Residence & Contact */}
        <div className="text-center border-t border-amber-200/60 pt-3 mt-3 text-[11px] text-stone-600">
          <p className="font-serif italic font-medium text-amber-950">
            {familyAddress || "Family Residence, Sector 16, Faridabad"}
          </p>
          {(mobile1 || mobile2) && (
            <p className="mt-0.5 tracking-wider font-mono text-[10px] text-maroon">
              Tel: {mobile1} {mobile2 ? `• ${mobile2}` : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
