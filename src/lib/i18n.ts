import type {
  BeBaduyChapter,
  FeedbackCategory,
  FeedbackStatus,
  Locale,
} from "./types";

export const LOCALE_STORAGE_KEY = "bebaduy-feedback-locale";

export interface ChapterMeta {
  id: BeBaduyChapter;
  code: string;
  accentHex: string;
  title: Record<Locale, string>;
  subtitle: Record<Locale, string>;
}

export const CHAPTER_CATALOG: ChapterMeta[] = [
  {
    id: "general",
    code: "UMUM",
    accentHex: "#F5A640",
    title: { id: "Umum / Keseluruhan", en: "General / Whole App" },
    subtitle: {
      id: "Tampilan awal, alur navigasi, performa, atau kesan keseluruhan",
      en: "Onboarding, navigation flow, performance, or overall impression",
    },
  },
  {
    id: "narawas",
    code: "01 · NARAWAS",
    accentHex: "#859447",
    title: { id: "Narawas", en: "Narawas" },
    subtitle: {
      id: "Menyiapkan lahan huma & menyalakan api virtual (Ngahuru)",
      en: "Clearing the huma field & lighting virtual brush (Ngahuru)",
    },
  },
  {
    id: "ngaseuk",
    code: "02 · NGASEUK",
    accentHex: "#70C238",
    title: { id: "Ngaseuk", en: "Ngaseuk" },
    subtitle: {
      id: "Melubangi tanah dengan aseuk & menanam binih pare",
      en: "Dibbling planting holes with the aseuk & pouring rice seeds",
    },
  },
  {
    id: "ngored",
    code: "03 · NGORED",
    accentHex: "#3D8F29",
    title: { id: "Ngored", en: "Ngored" },
    subtitle: {
      id: "Membersihkan gulma dengan kored di tengah hujan & pertumbuhan",
      en: "Weeding with the kored through rain and growth cycles",
    },
  },
  {
    id: "mipit",
    code: "04 · MIPIT",
    accentHex: "#F0C233",
    title: { id: "Mipit", en: "Mipit" },
    subtitle: {
      id: "Memanen pare huma menguning dengan etem",
      en: "Harvesting golden pare huma stalks with the etem",
    },
  },
  {
    id: "ngalantai",
    code: "05 · NGALANTAI",
    accentHex: "#D99E3D",
    title: { id: "Ngalantai", en: "Ngalantai" },
    subtitle: {
      id: "Menyeimbangkan pocong di Lantaian bambu untuk dijemur",
      en: "Balancing harvested pocong on the bamboo drying rack",
    },
  },
  {
    id: "ngaleuitkeun",
    code: "06 · LEUIT",
    accentHex: "#D05C00",
    title: { id: "Ngaleuitkeun", en: "Ngaleuitkeun" },
    subtitle: {
      id: "Menyimpan hasil panen ke dalam leuit & refleksi Pikukuh",
      en: "Storing the harvest in the leuit granary & Pikukuh reflection",
    },
  },
  {
    id: "koleksi",
    code: "KOLEKSI",
    accentHex: "#F7B266",
    title: { id: "Koleksi Kartu", en: "Card Collection" },
    subtitle: {
      id: "Galeri kartu budaya, kartu alat tradisional, & siklus kedua",
      en: "Cultural card gallery, traditional tool cards, & second cycle",
    },
  },
];

export const CATEGORY_LABELS: Record<
  FeedbackCategory,
  Record<Locale, { label: string; placeholder: string }>
> = {
  bug: {
    id: {
      label: "Bug / Kendala",
      placeholder:
        "Ceritakan kendala yang kamu temui — misalnya langkah sebelum terjadi, apakah terjadi di tahap tertentu, atau masalah tampilan/suara...",
    },
    en: {
      label: "Bug / Issue",
      placeholder:
        "Tell us what went wrong — what steps led up to it, which chapter you were in, or any visual/audio glitches you noticed...",
    },
  },
  feature: {
    id: {
      label: "Saran Fitur",
      placeholder:
        "Punya ide agar perjalanan Ngahuma di BeBaduy terasa lebih seru, jelas, atau nyaman? Tulis pendapatmu di sini...",
    },
    en: {
      label: "Feature Idea",
      placeholder:
        "Have an idea to make the Ngahuma journey feel clearer, richer, or more enjoyable? Share your thoughts here...",
    },
  },
  culture: {
    id: {
      label: "Cerita & Budaya",
      placeholder:
        "Bagikan masukan terkait narasi, istilah adat Baduy, ketepatan informasi Ngahuma/Pikukuh, atau bagian cerita yang paling berkesan...",
    },
    en: {
      label: "Story & Culture",
      placeholder:
        "Share notes on cultural accuracy, Baduy terms, Ngahuma/Pikukuh storytelling, or parts of the narrative that stood out...",
    },
  },
  interaction: {
    id: {
      label: "Sensor & 3D",
      placeholder:
        "Bagaimana rasa gestur sentuh, gerak ponsel (CoreMotion), putar layar di Ngalantai, atau performa adegan 3D di perangkatmu?",
    },
    en: {
      label: "3D & Gestures",
      placeholder:
        "How did touch gestures, motion controls (CoreMotion), landscape tilt in Ngalantai, or 3D scene smoothness feel on your iPhone?",
    },
  },
  appreciation: {
    id: {
      label: "Apresiasi",
      placeholder:
        "Bagian mana dari BeBaduy yang paling kamu sukai? Ceritamu memberi semangat besar bagi kami untuk terus merawat aplikasi ini!",
    },
    en: {
      label: "Appreciation",
      placeholder:
        "Which moment in BeBaduy did you enjoy most? Your note helps us know what to keep nurturing!",
    },
  },
  other: {
    id: {
      label: "Lainnya",
      placeholder:
        "Apa pun yang ingin kamu sampaikan untuk BeBaduy, kami siap mendengarkan dengan senang hati...",
    },
    en: {
      label: "Other",
      placeholder:
        "Anything else you'd like to share with the BeBaduy team — we're glad to hear it...",
    },
  },
};

export const RATING_CAPTIONS: Record<number, Record<Locale, string>> = {
  1: { id: "Perlu banyak perbaikan", en: "Needs a lot of work" },
  2: { id: "Masih ada yang mengganjal", en: "A few rough edges" },
  3: { id: "Cukup menyenangkan", en: "Good & promising" },
  4: { id: "Sangat berkesan!", en: "Really enjoyable!" },
  5: { id: "Luar biasa, penuh makna!", en: "Wonderful & meaningful!" },
};

export const STATUS_LABELS: Record<FeedbackStatus, Record<Locale, string>> = {
  new: { id: "Baru", en: "New" },
  reviewed: { id: "Ditinjau", en: "Reviewed" },
  resolved: { id: "Selesai", en: "Resolved" },
  archived: { id: "Diarsipkan", en: "Archived" },
};

export const COPY = {
  id: {
    navTag: "Suara Huma",
    navFeedback: "Kirim Masukan",
    navInbox: "Kotak Masuk",
    heroEyebrow: "Ruang Masukan · Aplikasi iOS BeBaduy",
    heroTitle: "Bantu Kami Merawat Perjalanan Ngahuma",
    heroBody:
      "Setiap cerita, temuan bug, dan saranmu adalah benih berharga agar pengalaman mengenal tradisi berladang masyarakat Baduy di BeBaduy terasa semakin hangat dan bermakna.",
    heroCta: "Tulis Masukan",
    heroBadgeOffline: "Tanpa akun",
    heroBadgePrivacy: "Privasi terjaga",
    heroBadgeChapters: "6 Tahap Ngahuma + Koleksi",
    formTitle: "Bagikan Ceritamu",
    formSubtitle:
      "Isi seperlunya saja. Catatan singkat pun sangat membantu kami menyempurnakan BeBaduy.",
    ratingLabel: "Bagaimana pengalamanmu menjelajahi BeBaduy?",
    categoryLabel: "Topik Masukan",
    chapterLabel: "Tahap atau Bagian Terkait",
    messageLabel: "Pesan & Detail Masukan",
    messageRequired: "Wajib",
    optionalSectionTitle: "Detail Tambahan (Opsional)",
    optionalSectionHint:
      "Boleh dikosongkan. Membantu jika kamu ingin dibalas atau melaporkan kendala perangkat.",
    nameLabel: "Nama / Panggilan",
    namePlaceholder: "Contoh: Raka",
    emailLabel: "Email (jika ingin dibalas)",
    emailPlaceholder: "nama@email.com",
    deviceLabel: "Perangkat & iOS",
    devicePlaceholder: "iPhone 16 Pro · iOS 26",
    versionLabel: "Versi Aplikasi",
    versionPlaceholder: "1.0 (TestFlight)",
    submitButton: "Kirim ke Leuit Masukan",
    submittingButton: "Menyimpan masukan...",
    errorMinMessage: "Tuliskan setidaknya 5 karakter agar kami bisa memahami masukanmu.",
    errorEmail: "Format email sepertinya belum tepat.",
    errorGeneric:
      "Masukan belum dapat terkirim saat ini. Silakan coba beberapa saat lagi.",
    thankYouBadge: "Tersimpan di Leuit",
    thankYouTitle: "Hatur Nuhun!",
    thankYouBody:
      "Masukanmu sudah kami terima dengan baik. Seperti pare huma yang dijaga di leuit, setiap catatanmu akan kami baca saksama untuk merawat BeBaduy ke depannya.",
    thankYouRefLabel: "Kode Catatan",
    thankYouCopied: "Tersalin",
    thankYouCopy: "Salin",
    thankYouAnother: "Kirim Masukan Lain",
    sidebarChaptersTitle: "Tahap yang Bisa Kamu Ulas",
    sidebarChaptersHint: "Ketuk salah satu tahap untuk langsung memilihnya di formulir.",
    sidebarPrivacyTitle: "Sejalan dengan Pikukuh Privasi",
    sidebarPrivacyBody:
      "Sama seperti aplikasi BeBaduy yang 100% offline tanpa pelacakan, halaman ini tidak memasang analitik atau cookie iklan. Nama dan email sepenuhnya opsional.",
    footerLine: "BeBaduy · Mengenal Tradisi Ngahuma dari Desa Kanekes, Banten",
    footerAdmin: "Kotak Masuk Pengelola",
    inboxGateEyebrow: "Area Pengelola",
    inboxGateTitle: "Kotak Masuk Leuit",
    inboxGateBody:
      "Masukkan kata sandi pengelola untuk membaca, menandai status, dan mengekspor masukan pengguna BeBaduy.",
    inboxPasswordLabel: "Kata Sandi Pengelola",
    inboxPasswordPlaceholder: "Masukkan kata sandi...",
    inboxSignIn: "Buka Kotak Masuk",
    inboxSigningIn: "Memeriksa...",
    inboxInvalidPassword: "Kata sandi belum cocok. Silakan periksa kembali.",
    inboxNotConfigured:
      "ADMIN_PASSWORD belum diatur di environment server (.env.local).",
    inboxTitle: "Kotak Masuk Masukan",
    inboxSubtitle: "Kumpulan cerita, laporan bug, dan saran untuk BeBaduy.",
    inboxStorageLocal: "Penyimpanan Lokal (JSON)",
    inboxStorageSupabase: "Terhubung ke Supabase",
    inboxBackToForm: "Lihat Halaman Form",
    inboxExportCsv: "Unduh CSV",
    inboxExportJson: "Unduh JSON",
    inboxSignOut: "Keluar",
    inboxRefresh: "Muat Ulang",
    inboxSearchPlaceholder: "Cari kode HUMA, pesan, nama...",
    inboxAllStatuses: "Semua Status",
    inboxAllCategories: "Semua Topik",
    inboxAllChapters: "Semua Tahap",
    inboxStatTotal: "Total Masukan",
    inboxStatNew: "Baru Masuk",
    inboxStatResolved: "Selesai",
    inboxStatRating: "Rata-rata Nilai",
    inboxEmptyTitle: "Belum ada masukan yang cocok",
    inboxEmptyBody:
      "Masukan baru yang dikirim lewat halaman utama akan langsung muncul di sini.",
    inboxNoteLabel: "Catatan Internal Pengelola",
    inboxNotePlaceholder: "Tulis catatan tindak lanjut, versi perbaikan, atau tautan issue...",
    inboxSaveNote: "Simpan Catatan",
    inboxSavedNote: "Tersimpan",
    inboxDelete: "Hapus",
    inboxConfirmDelete: "Konfirmasi Hapus?",
    inboxCancel: "Batal",
    inboxAnonymous: "Pengunjung Tanpa Nama",
  },
  en: {
    navTag: "Feedback",
    navFeedback: "Send Feedback",
    navInbox: "Inbox",
    heroEyebrow: "Feedback Sanctuary · BeBaduy iOS App",
    heroTitle: "Help Us Nurture the Ngahuma Journey",
    heroBody:
      "Every story, bug report, and suggestion is a precious seed that helps us make learning Baduy rice-farming traditions in BeBaduy warmer and more meaningful.",
    heroCta: "Share Feedback",
    heroBadgeOffline: "No account needed",
    heroBadgePrivacy: "Privacy-first",
    heroBadgeChapters: "6 Ngahuma Chapters + Collection",
    formTitle: "Share Your Experience",
    formSubtitle:
      "Write as much or as little as you like — even a brief note helps us refine BeBaduy.",
    ratingLabel: "How did your journey through BeBaduy feel?",
    categoryLabel: "Feedback Topic",
    chapterLabel: "Related Chapter or Area",
    messageLabel: "Your Message",
    messageRequired: "Required",
    optionalSectionTitle: "Optional Details",
    optionalSectionHint:
      "Leave blank if you prefer. Helpful if you'd like a reply or are reporting a device-specific issue.",
    nameLabel: "Name / Nickname",
    namePlaceholder: "e.g. Raka",
    emailLabel: "Email (if you'd like a reply)",
    emailPlaceholder: "you@example.com",
    deviceLabel: "Device & iOS",
    devicePlaceholder: "e.g. iPhone 16 Pro · iOS 26",
    versionLabel: "App Version",
    versionPlaceholder: "e.g. 1.0 (TestFlight)",
    submitButton: "Send to Our Leuit",
    submittingButton: "Storing feedback...",
    errorMinMessage: "Please write at least 5 characters so we can understand your note.",
    errorEmail: "That email address doesn't look quite right.",
    errorGeneric: "We couldn't submit your feedback right now. Please try again shortly.",
    thankYouBadge: "Stored in the Leuit",
    thankYouTitle: "Hatur Nuhun — Thank You!",
    thankYouBody:
      "Your feedback has been safely received. Like pare huma kept in the leuit, we read every note with care to help BeBaduy grow.",
    thankYouRefLabel: "Reference Code",
    thankYouCopied: "Copied",
    thankYouCopy: "Copy",
    thankYouAnother: "Send Another Note",
    sidebarChaptersTitle: "Chapters You Can Review",
    sidebarChaptersHint: "Tap any chapter to select it directly in the form.",
    sidebarPrivacyTitle: "Rooted in Privacy",
    sidebarPrivacyBody:
      "Just like the offline BeBaduy iOS app, this page uses no ad trackers or third-party analytics. Your name and email are completely optional.",
    footerLine: "BeBaduy · Exploring Traditional Baduy Ngahuma from Kanekes, Banten",
    footerAdmin: "Maintainer Inbox",
    inboxGateEyebrow: "Maintainer Access",
    inboxGateTitle: "Leuit Feedback Inbox",
    inboxGateBody:
      "Enter the maintainer passphrase to read, triage, annotate, and export feedback submitted for BeBaduy.",
    inboxPasswordLabel: "Maintainer Passphrase",
    inboxPasswordPlaceholder: "Enter passphrase...",
    inboxSignIn: "Open Inbox",
    inboxSigningIn: "Checking...",
    inboxInvalidPassword: "Passphrase did not match. Please try again.",
    inboxNotConfigured:
      "ADMIN_PASSWORD is not configured on the server (.env.local).",
    inboxTitle: "Feedback Inbox",
    inboxSubtitle: "Stories, bug reports, and ideas shared for BeBaduy.",
    inboxStorageLocal: "Local Storage (JSON)",
    inboxStorageSupabase: "Connected to Supabase",
    inboxBackToForm: "Public Form",
    inboxExportCsv: "Export CSV",
    inboxExportJson: "Export JSON",
    inboxSignOut: "Sign Out",
    inboxRefresh: "Refresh",
    inboxSearchPlaceholder: "Search HUMA code, message, sender...",
    inboxAllStatuses: "All Statuses",
    inboxAllCategories: "All Topics",
    inboxAllChapters: "All Chapters",
    inboxStatTotal: "Total Notes",
    inboxStatNew: "New",
    inboxStatResolved: "Resolved",
    inboxStatRating: "Average Rating",
    inboxEmptyTitle: "No matching feedback yet",
    inboxEmptyBody:
      "New notes submitted from the public feedback page will appear right here.",
    inboxNoteLabel: "Internal Maintainer Note",
    inboxNotePlaceholder: "Add triage notes, target build, or issue link...",
    inboxSaveNote: "Save Note",
    inboxSavedNote: "Saved",
    inboxDelete: "Delete",
    inboxConfirmDelete: "Confirm Delete?",
    inboxCancel: "Cancel",
    inboxAnonymous: "Anonymous Visitor",
  },
} as const;
