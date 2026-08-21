// SVG Avatar Presets for MedBook (Patients and Doctors)
// High-performance, self-contained SVG Data URIs (zero network latency, zero external dependencies)

export interface AvatarPreset {
  id: string
  label: string
  gender: 'male' | 'female'
  role: 'PATIENT' | 'DOCTOR'
  dataUri: string
}

function svgToDataUri(svgString: string): string {
  const cleanSvg = svgString.replace(/\n\s*/g, ' ').trim()
  return `data:image/svg+xml;utf8,${encodeURIComponent(cleanSvg)}`
}

// ─── PATIENT PRESETS ──────────────────────────────────────────────────────────

const PATIENT_FEMALE_1 = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="pf1_bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#E0E7FF"/>
      <stop offset="100%" stop-color="#C7D2FE"/>
    </linearGradient>
    <linearGradient id="pf1_hair" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4A2810"/>
      <stop offset="100%" stop-color="#2D1505"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="60" fill="url(#pf1_bg)"/>
  <!-- Hair back -->
  <path d="M 30 55 C 25 75, 28 98, 38 105 C 45 108, 75 108, 82 105 C 92 98, 95 75, 90 55 Z" fill="url(#pf1_hair)"/>
  <!-- Clothes -->
  <path d="M 22 120 C 22 96, 40 85, 60 85 C 80 85, 98 96, 98 120 Z" fill="#6366F1"/>
  <!-- Neck -->
  <rect x="52" y="70" width="16" height="20" rx="4" fill="#F8C39E"/>
  <!-- Head -->
  <ellipse cx="60" cy="52" rx="22" ry="26" fill="#FED8B1"/>
  <!-- Hair Front -->
  <path d="M 38 48 C 36 28, 84 28, 82 48 C 76 38, 44 38, 38 48 Z" fill="url(#pf1_hair)"/>
  <!-- Eyes -->
  <ellipse cx="51" cy="52" rx="2.5" ry="3" fill="#1E293B"/>
  <ellipse cx="69" cy="52" rx="2.5" ry="3" fill="#1E293B"/>
  <circle cx="52" cy="51" r="0.8" fill="#FFFFFF"/>
  <circle cx="70" cy="51" r="0.8" fill="#FFFFFF"/>
  <!-- Eyebrows -->
  <path d="M 47 45 Q 51 43 55 45" stroke="#4A2810" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <path d="M 65 45 Q 69 43 73 45" stroke="#4A2810" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <!-- Smile -->
  <path d="M 53 64 Q 60 70 67 64" stroke="#D97706" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <!-- Cheeks -->
  <circle cx="46" cy="58" r="3.5" fill="#FDA4AF" opacity="0.6"/>
  <circle cx="74" cy="58" r="3.5" fill="#FDA4AF" opacity="0.6"/>
</svg>`)

const PATIENT_FEMALE_2 = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="pf2_bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FCE7F3"/>
      <stop offset="100%" stop-color="#FBCFE8"/>
    </linearGradient>
    <linearGradient id="pf2_hair" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#B45309"/>
      <stop offset="100%" stop-color="#78350F"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="60" fill="url(#pf2_bg)"/>
  <!-- Ponytail -->
  <circle cx="60" cy="22" r="14" fill="url(#pf2_hair)"/>
  <!-- Clothes -->
  <path d="M 22 120 C 22 96, 40 85, 60 85 C 80 85, 98 96, 98 120 Z" fill="#EC4899"/>
  <!-- Neck -->
  <rect x="52" y="70" width="16" height="20" rx="4" fill="#E8B088"/>
  <!-- Head -->
  <ellipse cx="60" cy="52" rx="22" ry="26" fill="#F7C59F"/>
  <!-- Hair Front Bangs -->
  <path d="M 38 46 C 42 30, 78 30, 82 46 C 75 36, 45 36, 38 46 Z" fill="url(#pf2_hair)"/>
  <!-- Glasses -->
  <rect x="44" y="47" width="13" height="10" rx="3" fill="none" stroke="#374151" stroke-width="1.8"/>
  <rect x="63" y="47" width="13" height="10" rx="3" fill="none" stroke="#374151" stroke-width="1.8"/>
  <path d="M 57 51 L 63 51" stroke="#374151" stroke-width="1.8"/>
  <!-- Eyes -->
  <circle cx="50.5" cy="52" r="2" fill="#1E293B"/>
  <circle cx="69.5" cy="52" r="2" fill="#1E293B"/>
  <!-- Smile -->
  <path d="M 54 65 Q 60 70 66 65" stroke="#BE185D" stroke-width="1.8" stroke-linecap="round" fill="none"/>
</svg>`)

const PATIENT_FEMALE_3 = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="pf3_bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#CCFBF1"/>
      <stop offset="100%" stop-color="#99F6E4"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="60" fill="url(#pf3_bg)"/>
  <!-- Hijab / Headwrap -->
  <path d="M 32 60 C 30 25, 90 25, 88 60 C 88 95, 92 110, 80 115 C 68 120, 52 120, 40 115 C 28 110, 32 95, 32 60 Z" fill="#0D9488"/>
  <!-- Face cutout -->
  <ellipse cx="60" cy="56" rx="19" ry="22" fill="#D49A6A"/>
  <!-- Clothes -->
  <path d="M 22 120 C 22 102, 38 94, 60 94 C 82 94, 98 102, 98 120 Z" fill="#0F766E"/>
  <!-- Eyes -->
  <ellipse cx="52" cy="54" rx="2.5" ry="3" fill="#1E293B"/>
  <ellipse cx="68" cy="54" rx="2.5" ry="3" fill="#1E293B"/>
  <!-- Eyebrows -->
  <path d="M 48 48 Q 52 46 56 48" stroke="#1E293B" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <path d="M 64 48 Q 68 46 72 48" stroke="#1E293B" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <!-- Smile -->
  <path d="M 54 66 Q 60 71 66 66" stroke="#9A3412" stroke-width="1.8" stroke-linecap="round" fill="none"/>
</svg>`)

const PATIENT_MALE_1 = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="pm1_bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#EFF6FF"/>
      <stop offset="100%" stop-color="#DBEAFE"/>
    </linearGradient>
    <linearGradient id="pm1_hair" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="60" fill="url(#pm1_bg)"/>
  <!-- Clothes -->
  <path d="M 22 120 C 22 96, 40 85, 60 85 C 80 85, 98 96, 98 120 Z" fill="#3B82F6"/>
  <!-- Neck -->
  <rect x="52" y="70" width="16" height="20" rx="4" fill="#F8C39E"/>
  <!-- Head -->
  <ellipse cx="60" cy="52" rx="22" ry="25" fill="#FED8B1"/>
  <!-- Hair Modern Cut -->
  <path d="M 37 46 C 36 26, 84 22, 83 44 C 77 34, 45 35, 37 46 Z" fill="url(#pm1_hair)"/>
  <!-- Eyes -->
  <circle cx="51" cy="52" r="2.5" fill="#1E293B"/>
  <circle cx="69" cy="52" r="2.5" fill="#1E293B"/>
  <circle cx="52" cy="51" r="0.8" fill="#FFFFFF"/>
  <circle cx="70" cy="51" r="0.8" fill="#FFFFFF"/>
  <!-- Eyebrows -->
  <path d="M 46 45 Q 51 43 56 45" stroke="#1E293B" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path d="M 64 45 Q 69 43 74 45" stroke="#1E293B" stroke-width="2" stroke-linecap="round" fill="none"/>
  <!-- Smile -->
  <path d="M 53 64 Q 60 69 67 64" stroke="#B45309" stroke-width="2" stroke-linecap="round" fill="none"/>
</svg>`)

const PATIENT_MALE_2 = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="pm2_bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FEF3C7"/>
      <stop offset="100%" stop-color="#FDE68A"/>
    </linearGradient>
    <linearGradient id="pm2_hair" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#78350F"/>
      <stop offset="100%" stop-color="#451A03"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="60" fill="url(#pm2_bg)"/>
  <!-- Clothes -->
  <path d="M 22 120 C 22 96, 40 85, 60 85 C 80 85, 98 96, 98 120 Z" fill="#10B981"/>
  <!-- Neck -->
  <rect x="52" y="70" width="16" height="20" rx="4" fill="#D49A6A"/>
  <!-- Head -->
  <ellipse cx="60" cy="52" rx="22" ry="25" fill="#E2A775"/>
  <!-- Hair & Beard -->
  <path d="M 37 45 C 37 26, 83 26, 83 45 C 75 35, 45 35, 37 45 Z" fill="url(#pm2_hair)"/>
  <!-- Beard -->
  <path d="M 44 58 C 44 78, 76 78, 76 58 C 76 72, 44 72, 44 58 Z" fill="url(#pm2_hair)"/>
  <!-- Eyes -->
  <circle cx="51" cy="51" r="2.5" fill="#1E293B"/>
  <circle cx="69" cy="51" r="2.5" fill="#1E293B"/>
  <!-- Smile -->
  <path d="M 54 62 Q 60 66 66 62" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" fill="none"/>
</svg>`)

const PATIENT_MALE_3 = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="pm3_bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#EDE9FE"/>
      <stop offset="100%" stop-color="#DDD6FE"/>
    </linearGradient>
    <linearGradient id="pm3_hair" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#94A3B8"/>
      <stop offset="100%" stop-color="#64748B"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="60" fill="url(#pm3_bg)"/>
  <!-- Clothes -->
  <path d="M 22 120 C 22 96, 40 85, 60 85 C 80 85, 98 96, 98 120 Z" fill="#8B5CF6"/>
  <!-- Neck -->
  <rect x="52" y="70" width="16" height="20" rx="4" fill="#F8C39E"/>
  <!-- Head -->
  <ellipse cx="60" cy="52" rx="22" ry="25" fill="#FED8B1"/>
  <!-- Silver Hair -->
  <path d="M 37 45 C 36 24, 84 24, 83 45 C 76 34, 44 34, 37 45 Z" fill="url(#pm3_hair)"/>
  <!-- Glasses -->
  <circle cx="51" cy="52" r="7" fill="none" stroke="#475569" stroke-width="1.6"/>
  <circle cx="69" cy="52" r="7" fill="none" stroke="#475569" stroke-width="1.6"/>
  <path d="M 58 52 L 62 52" stroke="#475569" stroke-width="1.6"/>
  <!-- Eyes -->
  <circle cx="51" cy="52" r="2" fill="#1E293B"/>
  <circle cx="69" cy="52" r="2" fill="#1E293B"/>
  <!-- Smile -->
  <path d="M 54 65 Q 60 69 66 65" stroke="#B45309" stroke-width="1.8" stroke-linecap="round" fill="none"/>
</svg>`)

// ─── DOCTOR PRESETS ──────────────────────────────────────────────────────────

const DOCTOR_FEMALE_1 = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="df1_bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#E0F2FE"/>
      <stop offset="100%" stop-color="#BAE6FD"/>
    </linearGradient>
    <linearGradient id="df1_hair" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#451A03"/>
      <stop offset="100%" stop-color="#1C1917"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="60" fill="url(#df1_bg)"/>
  <!-- Hair back -->
  <path d="M 32 52 C 28 72, 30 92, 38 100 C 45 104, 75 104, 82 100 C 90 92, 92 72, 88 52 Z" fill="url(#df1_hair)"/>
  <!-- Scrub/Shirt (Teal) -->
  <path d="M 22 120 C 22 96, 40 85, 60 85 C 80 85, 98 96, 98 120 Z" fill="#0284C7"/>
  <!-- White Doctor Coat -->
  <path d="M 22 120 L 44 89 L 52 120 Z" fill="#FFFFFF"/>
  <path d="M 98 120 L 76 89 L 68 120 Z" fill="#FFFFFF"/>
  <!-- Stethoscope -->
  <path d="M 46 90 C 46 106, 74 106, 74 90" fill="none" stroke="#334155" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="60" cy="107" r="3.5" fill="#94A3B8" stroke="#334155" stroke-width="1.5"/>
  <!-- Neck -->
  <rect x="52" y="70" width="16" height="20" rx="4" fill="#F8C39E"/>
  <!-- Head -->
  <ellipse cx="60" cy="52" rx="22" ry="25" fill="#FED8B1"/>
  <!-- Hair front -->
  <path d="M 38 48 C 36 28, 84 28, 82 48 C 76 38, 44 38, 38 48 Z" fill="url(#df1_hair)"/>
  <!-- Eyes -->
  <circle cx="51" cy="52" r="2.5" fill="#1E293B"/>
  <circle cx="69" cy="52" r="2.5" fill="#1E293B"/>
  <!-- Eyebrows -->
  <path d="M 47 45 Q 51 43 55 45" stroke="#451A03" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <path d="M 65 45 Q 69 43 73 45" stroke="#451A03" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <!-- Smile -->
  <path d="M 53 64 Q 60 69 67 64" stroke="#BE185D" stroke-width="1.8" stroke-linecap="round" fill="none"/>
</svg>`)

const DOCTOR_FEMALE_2 = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="df2_bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ECFDF5"/>
      <stop offset="100%" stop-color="#A7F3D0"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="60" fill="url(#df2_bg)"/>
  <!-- Surgical Cap (Teal) -->
  <ellipse cx="60" cy="40" rx="26" ry="20" fill="#0D9488"/>
  <rect x="36" y="38" width="48" height="8" rx="2" fill="#14B8A6"/>
  <!-- Scrubs -->
  <path d="M 22 120 C 22 96, 40 85, 60 85 C 80 85, 98 96, 98 120 Z" fill="#0D9488"/>
  <!-- White Coat -->
  <path d="M 22 120 L 44 89 L 52 120 Z" fill="#F8FAFC"/>
  <path d="M 98 120 L 76 89 L 68 120 Z" fill="#F8FAFC"/>
  <!-- Stethoscope -->
  <path d="M 46 90 C 46 106, 74 106, 74 90" fill="none" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="60" cy="107" r="3.5" fill="#64748B" stroke="#1E293B" stroke-width="1.5"/>
  <!-- Neck -->
  <rect x="52" y="70" width="16" height="20" rx="4" fill="#D49A6A"/>
  <!-- Head -->
  <ellipse cx="60" cy="54" rx="21" ry="23" fill="#E2A775"/>
  <!-- Eyes -->
  <circle cx="51" cy="53" r="2.5" fill="#1E293B"/>
  <circle cx="69" cy="53" r="2.5" fill="#1E293B"/>
  <!-- Smile -->
  <path d="M 53 64 Q 60 69 67 64" stroke="#9A3412" stroke-width="1.8" stroke-linecap="round" fill="none"/>
</svg>`)

const DOCTOR_FEMALE_3 = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="df3_bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#EEF2FF"/>
      <stop offset="100%" stop-color="#C7D2FE"/>
    </linearGradient>
    <linearGradient id="df3_hair" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#D97706"/>
      <stop offset="100%" stop-color="#92400E"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="60" fill="url(#df3_bg)"/>
  <!-- Hair back -->
  <path d="M 32 52 C 28 72, 30 92, 38 100 C 45 104, 75 104, 82 100 C 90 92, 92 72, 88 52 Z" fill="url(#df3_hair)"/>
  <!-- Blue Shirt -->
  <path d="M 22 120 C 22 96, 40 85, 60 85 C 80 85, 98 96, 98 120 Z" fill="#2563EB"/>
  <!-- White Doctor Coat -->
  <path d="M 22 120 L 44 89 L 52 120 Z" fill="#FFFFFF"/>
  <path d="M 98 120 L 76 89 L 68 120 Z" fill="#FFFFFF"/>
  <!-- Stethoscope -->
  <path d="M 46 90 C 46 106, 74 106, 74 90" fill="none" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="60" cy="107" r="3.5" fill="#3B82F6" stroke="#0F172A" stroke-width="1.5"/>
  <!-- Neck -->
  <rect x="52" y="70" width="16" height="20" rx="4" fill="#F8C39E"/>
  <!-- Head -->
  <ellipse cx="60" cy="52" rx="22" ry="25" fill="#FED8B1"/>
  <!-- Hair front -->
  <path d="M 38 48 C 36 28, 84 28, 82 48 C 76 38, 44 38, 38 48 Z" fill="url(#df3_hair)"/>
  <!-- Glasses -->
  <rect x="44" y="47" width="13" height="10" rx="3" fill="none" stroke="#2563EB" stroke-width="1.8"/>
  <rect x="63" y="47" width="13" height="10" rx="3" fill="none" stroke="#2563EB" stroke-width="1.8"/>
  <path d="M 57 51 L 63 51" stroke="#2563EB" stroke-width="1.8"/>
  <!-- Eyes -->
  <circle cx="50.5" cy="52" r="2" fill="#1E293B"/>
  <circle cx="69.5" cy="52" r="2" fill="#1E293B"/>
  <!-- Smile -->
  <path d="M 53 64 Q 60 69 67 64" stroke="#BE185D" stroke-width="1.8" stroke-linecap="round" fill="none"/>
</svg>`)

const DOCTOR_MALE_1 = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="dm1_bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#E0F2FE"/>
      <stop offset="100%" stop-color="#BAE6FD"/>
    </linearGradient>
    <linearGradient id="dm1_hair" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="60" fill="url(#dm1_bg)"/>
  <!-- Inner shirt + tie -->
  <path d="M 22 120 C 22 96, 40 85, 60 85 C 80 85, 98 96, 98 120 Z" fill="#0284C7"/>
  <path d="M 58 87 L 62 87 L 63 105 L 60 110 L 57 105 Z" fill="#1E3A8A"/>
  <!-- White Doctor Coat -->
  <path d="M 22 120 L 44 89 L 52 120 Z" fill="#FFFFFF"/>
  <path d="M 98 120 L 76 89 L 68 120 Z" fill="#FFFFFF"/>
  <!-- Stethoscope -->
  <path d="M 45 90 C 45 106, 75 106, 75 90" fill="none" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="60" cy="107" r="3.5" fill="#94A3B8" stroke="#1E293B" stroke-width="1.5"/>
  <!-- Neck -->
  <rect x="52" y="70" width="16" height="20" rx="4" fill="#F8C39E"/>
  <!-- Head -->
  <ellipse cx="60" cy="52" rx="22" ry="25" fill="#FED8B1"/>
  <!-- Short Dark Hair -->
  <path d="M 37 46 C 36 24, 84 22, 83 44 C 77 34, 45 35, 37 46 Z" fill="url(#dm1_hair)"/>
  <!-- Eyes -->
  <circle cx="51" cy="52" r="2.5" fill="#1E293B"/>
  <circle cx="69" cy="52" r="2.5" fill="#1E293B"/>
  <!-- Eyebrows -->
  <path d="M 46 45 Q 51 43 56 45" stroke="#1E293B" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path d="M 64 45 Q 69 43 74 45" stroke="#1E293B" stroke-width="2" stroke-linecap="round" fill="none"/>
  <!-- Smile -->
  <path d="M 53 64 Q 60 69 67 64" stroke="#B45309" stroke-width="2" stroke-linecap="round" fill="none"/>
</svg>`)

const DOCTOR_MALE_2 = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="dm2_bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#E0E7FF"/>
      <stop offset="100%" stop-color="#C7D2FE"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="60" fill="url(#dm2_bg)"/>
  <!-- Surgical Cap (Blue) -->
  <ellipse cx="60" cy="40" rx="26" ry="20" fill="#2563EB"/>
  <rect x="36" y="38" width="48" height="8" rx="2" fill="#3B82F6"/>
  <!-- Scrubs -->
  <path d="M 22 120 C 22 96, 40 85, 60 85 C 80 85, 98 96, 98 120 Z" fill="#2563EB"/>
  <!-- White Coat -->
  <path d="M 22 120 L 44 89 L 52 120 Z" fill="#F8FAFC"/>
  <path d="M 98 120 L 76 89 L 68 120 Z" fill="#F8FAFC"/>
  <!-- Stethoscope -->
  <path d="M 45 90 C 45 106, 75 106, 75 90" fill="none" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="60" cy="107" r="3.5" fill="#3B82F6" stroke="#0F172A" stroke-width="1.5"/>
  <!-- Neck -->
  <rect x="52" y="70" width="16" height="20" rx="4" fill="#D49A6A"/>
  <!-- Head -->
  <ellipse cx="60" cy="54" rx="21" ry="23" fill="#E2A775"/>
  <!-- Eyes -->
  <circle cx="51" cy="53" r="2.5" fill="#1E293B"/>
  <circle cx="69" cy="53" r="2.5" fill="#1E293B"/>
  <!-- Smile -->
  <path d="M 53 64 Q 60 69 67 64" stroke="#9A3412" stroke-width="2" stroke-linecap="round" fill="none"/>
</svg>`)

const DOCTOR_MALE_3 = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="dm3_bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F1F5F9"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
    <linearGradient id="dm3_hair" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#94A3B8"/>
      <stop offset="100%" stop-color="#64748B"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="60" fill="url(#dm3_bg)"/>
  <!-- Scrub/Shirt -->
  <path d="M 22 120 C 22 96, 40 85, 60 85 C 80 85, 98 96, 98 120 Z" fill="#4F46E5"/>
  <!-- White Doctor Coat -->
  <path d="M 22 120 L 44 89 L 52 120 Z" fill="#FFFFFF"/>
  <path d="M 98 120 L 76 89 L 68 120 Z" fill="#FFFFFF"/>
  <!-- Stethoscope -->
  <path d="M 45 90 C 45 106, 75 106, 75 90" fill="none" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="60" cy="107" r="3.5" fill="#64748B" stroke="#1E293B" stroke-width="1.5"/>
  <!-- Neck -->
  <rect x="52" y="70" width="16" height="20" rx="4" fill="#F8C39E"/>
  <!-- Head -->
  <ellipse cx="60" cy="52" rx="22" ry="25" fill="#FED8B1"/>
  <!-- Silver Hair -->
  <path d="M 37 45 C 36 24, 84 24, 83 45 C 76 34, 44 34, 37 45 Z" fill="url(#dm3_hair)"/>
  <!-- Glasses -->
  <rect x="44" y="47" width="13" height="10" rx="3" fill="none" stroke="#334155" stroke-width="1.8"/>
  <rect x="63" y="47" width="13" height="10" rx="3" fill="none" stroke="#334155" stroke-width="1.8"/>
  <path d="M 57 51 L 63 51" stroke="#334155" stroke-width="1.8"/>
  <!-- Eyes -->
  <circle cx="50.5" cy="52" r="2" fill="#1E293B"/>
  <circle cx="69.5" cy="52" r="2" fill="#1E293B"/>
  <!-- Smile -->
  <path d="M 54 65 Q 60 69 66 65" stroke="#B45309" stroke-width="1.8" stroke-linecap="round" fill="none"/>
</svg>`)

// ─── CATALOG ──────────────────────────────────────────────────────────────────

export const PATIENT_AVATARS: AvatarPreset[] = [
  { id: 'p_f_1', label: 'Female Patient 1', gender: 'female', role: 'PATIENT', dataUri: PATIENT_FEMALE_1 },
  { id: 'p_f_2', label: 'Female Patient 2 (Glasses)', gender: 'female', role: 'PATIENT', dataUri: PATIENT_FEMALE_2 },
  { id: 'p_f_3', label: 'Female Patient 3 (Hijab)', gender: 'female', role: 'PATIENT', dataUri: PATIENT_FEMALE_3 },
  { id: 'p_m_1', label: 'Male Patient 1', gender: 'male', role: 'PATIENT', dataUri: PATIENT_MALE_1 },
  { id: 'p_m_2', label: 'Male Patient 2 (Beard)', gender: 'male', role: 'PATIENT', dataUri: PATIENT_MALE_2 },
  { id: 'p_m_3', label: 'Male Patient 3 (Glasses)', gender: 'male', role: 'PATIENT', dataUri: PATIENT_MALE_3 },
]

export const DOCTOR_AVATARS: AvatarPreset[] = [
  { id: 'd_f_1', label: 'Dr. Specialist (Female)', gender: 'female', role: 'DOCTOR', dataUri: DOCTOR_FEMALE_1 },
  { id: 'd_f_2', label: 'Dr. Surgeon (Female)', gender: 'female', role: 'DOCTOR', dataUri: DOCTOR_FEMALE_2 },
  { id: 'd_f_3', label: 'Dr. Consultant (Female)', gender: 'female', role: 'DOCTOR', dataUri: DOCTOR_FEMALE_3 },
  { id: 'd_m_1', label: 'Dr. Specialist (Male)', gender: 'male', role: 'DOCTOR', dataUri: DOCTOR_MALE_1 },
  { id: 'd_m_2', label: 'Dr. Surgeon (Male)', gender: 'male', role: 'DOCTOR', dataUri: DOCTOR_MALE_2 },
  { id: 'd_m_3', label: 'Dr. Consultant (Male)', gender: 'male', role: 'DOCTOR', dataUri: DOCTOR_MALE_3 },
]

export function getPresetsByRole(role: 'PATIENT' | 'DOCTOR', gender?: 'male' | 'female'): AvatarPreset[] {
  const list = role === 'DOCTOR' ? DOCTOR_AVATARS : PATIENT_AVATARS
  if (gender) {
    return list.filter((p) => p.gender === gender)
  }
  return list
}
