// =========================================================
// MedTekser — ортақ көмекші функциялар және RU / KZ локализациясы
// Стандартты тіл: орыс тілі ("ru"), ауыстырғыш: RU | KZ
// =========================================================

let LANG = localStorage.getItem("medtekser_lang") || "ru";
if (LANG !== "ru" && LANG !== "kk") LANG = "ru";

function t(ru, kk) {
  return LANG === "kk" ? kk : ru;
}

const STATUS_LABELS_I18N = {
  ru: {
    new: "Новая",
    confirmed: "Подтверждена",
    scheduled: "Назначена",
    in_progress: "Проходит осмотр",
    done: "Завершена",
    cancelled: "Отменена",
    pending: "Ожидает",
    fit: "Годен",
    unfit: "Не годен",
    absent: "Не явился",
  },
  kk: {
    new: "Жаңа",
    confirmed: "Расталды",
    scheduled: "Жоспарланды",
    in_progress: "Өтуде",
    done: "Аяқталды",
    cancelled: "Бас тартылды",
    pending: "Күтуде",
    fit: "Жарамды",
    unfit: "Жарамсыз",
    absent: "Келмеді",
  },
};

function statusLabel(s) {
  return (STATUS_LABELS_I18N[LANG] || STATUS_LABELS_I18N.ru)[s] || s;
}

const PROGRESS_COLORS = { fit: "#0d9f6e", unfit: "#e11d48", absent: "#d97706", scheduled: "#7c3aed" };

// Lucide стиліндегі SVG иконкалар
const ICON_PATHS = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62L18.3 9.38A1 1 0 0 0 17.52 9H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  chart: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 13H8M16 17H8M16 13h-2"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  stethoscope: '<path d="M11 2v2M5 2v2M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>',
  clipboard: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  flask: '<path d="M10 2v7.31M14 9.3V2M8.5 2h7M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  building: '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
  printer: '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect width="12" height="8" x="6" y="14" rx="1"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  arrowLeft: '<path d="m12 19-7-7 7-7M19 12H5"/>',
  arrowRight: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  hospital: '<path d="M12 6v4M14 14h-4M14 18h-4M14 8h-4"/><path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2"/><path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
};

function icon(name, size = 20, sw = 2) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ""}</svg>`;
}

const WA_ICON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41"/></svg>';

const LOGO_HTML = `<span class="logo-mark">${icon("heart", 20, 2.2)}</span><span>Med<b>Tekser</b></span>`;

function fmtMoney(n) {
  return new Intl.NumberFormat("ru-RU").format(Math.round(n || 0)) + " ₸";
}

function fmtPhone(raw) {
  let d = String(raw || "+77787961219").replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("8")) d = "7" + d.slice(1);
  if (d.length === 11 && d.startsWith("7")) {
    return `+7 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`;
  }
  return raw;
}

function waDigits(raw) {
  let d = String(raw || "77787961219").replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("8")) d = "7" + d.slice(1);
  return d || "77787961219";
}

function waLink(phone, text) {
  return `https://wa.me/${waDigits(phone)}?text=${encodeURIComponent(text || "")}`;
}

function fmtDate(s) {
  if (!s) return "—";
  const d = new Date(s.length <= 10 ? s + "T00:00:00" : s);
  if (isNaN(d)) return s;
  const monthsRu = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
  const monthsKk = ["қаңтар", "ақпан", "наурыз", "сәуір", "мамыр", "маусым", "шілде", "тамыз", "қыркүйек", "қазан", "қараша", "желтоқсан"];
  const m = LANG === "kk" ? monthsKk : monthsRu;
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`;
}

function badge(status) {
  return `<span class="badge ${status}">${statusLabel(status)}</span>`;
}

function examName(itemOrType, cfg) {
  if (!itemOrType) return "";
  if (typeof itemOrType === "object") {
    return LANG === "kk" ? (itemOrType.exam_name_kk || itemOrType.name_kk || itemOrType.exam_name || itemOrType.name)
                         : (itemOrType.exam_name_ru || itemOrType.name_ru || itemOrType.exam_name || itemOrType.name);
  }
  if (cfg && cfg.exam_types && cfg.exam_types[itemOrType]) {
    const et = cfg.exam_types[itemOrType];
    return LANG === "kk" ? (et.name_kk || et.name) : (et.name_ru || et.name);
  }
  return itemOrType;
}

function examDesc(et) {
  if (!et) return "";
  return LANG === "kk" ? (et.desc_kk || et.desc || "") : (et.desc_ru || et.desc || "");
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

function initials(name) {
  return String(name || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function avatarColor(name) {
  const colors = ["#0ea58e", "#7c3aed", "#d97706", "#ff6b4a", "#0284c7", "#db2777"];
  let h = 0;
  for (const c of String(name)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return colors[h % colors.length];
}

// Local demo data is available only in a local preview. Public pages must use
// a configured server API; browser storage is never a production database.
const API_BASE_URL = String(window.MEDTEKSER_API_BASE_URL || "").trim().replace(/\/+$/, "");
let PRIVACY_NOTICE_URL = String(window.MEDTEKSER_PRIVACY_NOTICE_URL || "").trim();
const IS_LOCAL_PREVIEW = location.protocol === "file:" ||
  ["localhost", "127.0.0.1", "::1"].includes(location.hostname);
let USE_LOCAL_API = IS_LOCAL_PREVIEW && !API_BASE_URL;

function apiIsConfigured() {
  if (USE_LOCAL_API) return true;
  if (!API_BASE_URL) return false;
  try {
    const url = new URL(API_BASE_URL);
    return (url.protocol === "https:" || (IS_LOCAL_PREVIEW && url.protocol === "http:")) && Boolean(url.host);
  } catch (_) {
    return false;
  }
}

function intakeIsConfigured() {
  if (IS_LOCAL_PREVIEW) return true;
  return apiIsConfigured() && privacyNoticeIsConfigured();
}

function setPrivacyNoticeUrl(url) {
  const candidate = String(url || "").trim();
  try {
    PRIVACY_NOTICE_URL = new URL(candidate).protocol === "https:" ? candidate : "";
  } catch (_) {
    PRIVACY_NOTICE_URL = "";
  }
}

function privacyNoticeIsConfigured() {
  if (!PRIVACY_NOTICE_URL) return false;
  try {
    return new URL(PRIVACY_NOTICE_URL).protocol === "https:";
  } catch (_) {
    return false;
  }
}

function apiUrl(path) {
  if (!API_BASE_URL) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function apiUnavailableMessage() {
  return t(
    "Сервер заявок пока не подключён. Свяжитесь с нами в WhatsApp, чтобы передать запрос.",
    "Өтінім сервері әлі қосылмаған. Сұрауды жіберу үшін WhatsApp арқылы хабарласыңыз."
  );
}
const DEFAULT_CONFIG = {
  contact_phone: "+77787961219",
  exam_types: {
    periodic: {
      name: "Периодический медосмотр",
      name_ru: "Периодический медосмотр",
      name_kk: "Мерзімді медициналық тексеру",
    },
    preliminary: {
      name: "Предварительный медосмотр (форма 075/у)",
      name_ru: "Предварительный медосмотр (форма 075/у)",
      name_kk: "Жұмысқа кірер алдындағы тексеру (075/е нысаны)",
    },
    pre_shift: {
      name: "Предсменный / предрейсовый осмотр",
      name_ru: "Предсменный / предрейсовый осмотр",
      name_kk: "Ауысым / рейс алдындағы тексеру",
    },
    checkup: {
      name: "Корпоративный Check-Up",
      name_ru: "Корпоративный Check-Up",
      name_kk: "Корпоративтік Check-Up",
    },
  },
};

function loadLocalDb() {
  if (!USE_LOCAL_API) return { clinics: [], requests: [], employees: [], sessions: {} };
  try {
    const raw = localStorage.getItem("medtekser_db_v1");
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  const initial = { clinics: [], requests: [], employees: [], sessions: {} };
  saveLocalDb(initial);
  return initial;
}

function saveLocalDb(db) {
  if (!USE_LOCAL_API) return;
  try { localStorage.setItem("medtekser_db_v1", JSON.stringify(db)); } catch (_) {}
}

function enrichLocalRequest(db, r, includeEmps = false) {
  const et = DEFAULT_CONFIG.exam_types[r.exam_type] || {};
  const emps = db.employees.filter((e) => e.request_id === r.id);
  const progress = { pending: 0, scheduled: 0, fit: 0, unfit: 0, absent: 0 };
  emps.forEach((e) => { progress[e.status] = (progress[e.status] || 0) + 1; });
  const clinic = r.clinic_id ? db.clinics.find((c) => c.id === +r.clinic_id) || null : null;
  const out = {
    ...r,
    exam_name: et.name || r.exam_type,
    exam_name_ru: et.name_ru || et.name,
    exam_name_kk: et.name_kk || et.name,
    progress,
    employees_loaded: emps.length,
    clinic,
  };
  if (includeEmps) out.employees = emps;
  return out;
}

function parseCsvLocal(text) {
  const lines = String(text || "").trim().split(/\r?\n/).filter((l) => l.trim());
  const out = [];
  for (const line of lines) {
    const sep = line.includes("\t") ? "\t" : (line.includes(";") ? ";" : ",");
    let cells = line.split(sep).map((c) => c.trim());
    if (!cells[0] || ["таә", "аты-жөні", "фио", "full_name", "№"].includes(cells[0].toLowerCase())) continue;
    if (/^\d+$/.test(cells[0]) && cells[0].length < 6 && cells[1]) cells = cells.slice(1);
    out.push({ full_name: cells[0] || "", iin: cells[1] || "", position: cells[2] || "", harmful_factor: cells[3] || "" });
  }
  return out;
}

function localApi(path, { method = "GET", body, token } = {}) {
  const db = loadLocalDb();
  const sess = token ? db.sessions[token] : null;
  const fail = (msg, status = 400) => { const e = new Error(msg); e.status = status; throw e; };

  if (path === "/api/config" && method === "GET") return DEFAULT_CONFIG;
  if (path === "/api/logout" && method === "POST") {
    if (token) { delete db.sessions[token]; saveLocalDb(db); }
    return { ok: true };
  }
  if (path === "/api/requests" && method === "POST") {
    const count = Math.max(1, parseInt(body.employees_count) || 1);
    const id = db.requests.reduce((m, r) => Math.max(m, r.id), 0) + 1;
    const accessBytes = new Uint8Array(8);
    crypto.getRandomValues(accessBytes);
    const access_code = [...accessBytes].map((value) => value.toString(16).padStart(2, "0")).join("").toUpperCase();
    const row = {
      id, company: (body.company || "").trim(), bin: (body.bin || "").trim(),
      contact_name: (body.contact_name || "").trim(), phone: (body.phone || "").trim(),
      email: (body.email || "").trim(), employees_count: count,
      exam_type: body.exam_type || "periodic", preferred_date: body.preferred_date || "",
      comment: (body.comment || "").trim(), status: "new", clinic_id: null,
      scheduled_date: null, access_code, created_at: new Date().toISOString().slice(0, 19),
    };
    db.requests.unshift(row);
    saveLocalDb(db);
    return { id, access_code };
  }
  if (path === "/api/cabinet/login" && method === "POST") {
    const rid = parseInt(body.request_id) || 0;
    const code = String(body.code || "").trim().toUpperCase();
    const r = db.requests.find((x) => x.id === rid && x.access_code.toUpperCase() === code);
    if (!r) fail(t("Неверный номер заявки или код доступа", "Өтінім нөмірі немесе кіру коды қате"), 401);
    const tok = "cab_" + Math.random().toString(36).slice(2);
    db.sessions[tok] = { role: "company", request_id: r.id };
    saveLocalDb(db);
    return { token: tok };
  }
  if (path === "/api/cabinet" && method === "GET") {
    if (!sess || sess.role !== "company") fail(t("Нет доступа", "Рұқсат жоқ"), 401);
    const r = db.requests.find((x) => x.id === sess.request_id);
    if (!r) fail(t("Заявка не найдена", "Өтінім табылмады"), 404);
    return enrichLocalRequest(db, r, true);
  }
  if (path === "/api/cabinet/employees" && method === "POST") {
    if (!sess || sess.role !== "company") fail(t("Нет доступа", "Рұқсат жоқ"), 401);
    const list = body.employees || parseCsvLocal(body.csv);
    if (!list.length) fail(t("Список сотрудников пуст", "Қызметкерлер тізімі бос"), 400);
    let nextId = db.employees.reduce((m, e) => Math.max(m, e.id), 0) + 1;
    list.forEach((e) => {
      db.employees.push({
        id: nextId++, request_id: sess.request_id, full_name: e.full_name,
        iin: e.iin || "", position: e.position || "", harmful_factor: e.harmful_factor || "",
        status: "pending", conclusion: "",
      });
    });
    saveLocalDb(db);
    return { added: list.length };
  }
  if (path.startsWith("/api/cabinet/employees/") && method === "DELETE") {
    if (!sess || sess.role !== "company") fail(t("Нет доступа", "Рұқсат жоқ"), 401);
    const eid = parseInt(path.split("/").pop());
    db.employees = db.employees.filter((e) => !(e.id === eid && e.request_id === sess.request_id && e.status === "pending"));
    saveLocalDb(db);
    return { ok: true };
  }
  if (path === "/api/admin/login" && method === "POST") {
    // Local browser preview only; public pages and the Python API use server auth.
    if (!String(body.password || "").trim()) fail(t("Введите пароль", "Құпиясөзді енгізіңіз"), 401);
    const tok = "adm_" + Math.random().toString(36).slice(2);
    db.sessions[tok] = { role: "admin" };
    saveLocalDb(db);
    return { token: tok };
  }
  if (path.startsWith("/api/admin/")) {
    if (!sess || sess.role !== "admin") fail(t("Нет доступа", "Рұқсат жоқ"), 401);
    if (path === "/api/admin/requests" && method === "GET") {
      return [...db.requests].sort((a, b) => b.id - a.id).map((r) => enrichLocalRequest(db, r));
    }
    if (path === "/api/admin/clinics" && method === "GET") return db.clinics;
    if (path === "/api/admin/clinics" && method === "POST") {
      const id = db.clinics.reduce((m, c) => Math.max(m, c.id), 0) + 1;
      db.clinics.push({ id, name: body.name, address: body.address || "", phone: body.phone || "", license: body.license || "" });
      saveLocalDb(db);
      return { ok: true };
    }
    if (path.startsWith("/api/admin/clinics/") && method === "DELETE") {
      const cid = parseInt(path.split("/").pop());
      db.clinics = db.clinics.filter((c) => c.id !== cid);
      saveLocalDb(db);
      return { ok: true };
    }
    if (path === "/api/admin/stats" && method === "GET") {
      const items = db.requests.map((r) => enrichLocalRequest(db, r));
      const active = items.filter((i) => i.status !== "cancelled");
      return {
        requests: items.length,
        new: items.filter((i) => i.status === "new").length,
        employees: active.reduce((s, i) => s + Math.max(i.employees_count, i.employees_loaded), 0),
        examined: active.reduce((s, i) => s + i.progress.fit + i.progress.unfit, 0),
      };
    }
    const parts = path.strip ? path.split("/") : path.replace(/^\/+|\/+$/g, "").split("/");
    if (parts.length === 4 && parts[2] === "requests" && method === "GET") {
      const r = db.requests.find((x) => x.id === +parts[3]);
      if (!r) fail("Not found", 404);
      return enrichLocalRequest(db, r, true);
    }
    if (parts.length === 4 && parts[2] === "requests" && method === "PUT") {
      const r = db.requests.find((x) => x.id === +parts[3]);
      if (!r) fail("Not found", 404);
      if (body.status) r.status = body.status;
      if ("clinic_id" in body) r.clinic_id = body.clinic_id ? +body.clinic_id : null;
      if ("scheduled_date" in body) r.scheduled_date = body.scheduled_date || null;
      saveLocalDb(db);
      return { ok: true };
    }
    if (parts.length === 5 && parts[2] === "requests" && parts[4] === "employees" && method === "PUT") {
      const rid = +parts[3];
      db.employees.forEach((e) => {
        if (e.request_id === rid && (e.status === "pending" || e.status === "scheduled")) e.status = body.status;
      });
      saveLocalDb(db);
      return { ok: true };
    }
    if (parts.length === 4 && parts[2] === "employees" && method === "PUT") {
      const e = db.employees.find((x) => x.id === +parts[3]);
      if (e) {
        if (body.status) e.status = body.status;
        if (body.conclusion !== undefined) e.conclusion = body.conclusion;
        saveLocalDb(db);
      }
      return { ok: true };
    }
  }
  fail("Not found", 404);
}

async function api(path, { method = "GET", body, token } = {}) {
  if (USE_LOCAL_API) {
    return localApi(path, { method, body, token });
  }
  if (!apiIsConfigured()) {
    throw new Error(apiUnavailableMessage());
  }
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = "Bearer " + token;
  let res;
  try {
    res = await fetch(apiUrl(path), { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch (e) {
    throw new Error(t(
      "Не удалось подключиться к серверу. Поля формы остались заполненными — попробуйте ещё раз или свяжитесь с нами в WhatsApp.",
      "Серверге қосылу мүмкін болмады. Форма өрістері толтырылған күйде қалды — қайта көріңіз немесе WhatsApp арқылы хабарласыңыз."
    ));
  }
  const ct = res.headers.get("Content-Type") || "";
  if ((res.status === 404 || res.status === 405) && !ct.includes("application/json")) {
    throw new Error(apiUnavailableMessage());
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || t("Произошла ошибка", "Қате орын алды"));
    err.status = res.status;
    throw err;
  }
  if (path === "/api/requests" && method === "POST" &&
      (res.status !== 201 || !Number.isSafeInteger(Number(data.id)) || Number(data.id) < 1 ||
       typeof data.access_code !== "string" || !data.access_code.trim())) {
    throw new Error(t(
      "Сервер не подтвердил приём заявки. Поля формы остались заполненными — попробуйте ещё раз или свяжитесь с нами в WhatsApp.",
      "Сервер өтінімнің қабылданғанын растаған жоқ. Форма өрістері толтырылған күйде қалды — қайта көріңіз немесе WhatsApp арқылы хабарласыңыз."
    ));
  }
  return data;
}

async function downloadFile(path, token, filename) {
  if (!USE_LOCAL_API) {
    if (!apiIsConfigured()) throw new Error(apiUnavailableMessage());
    let res;
    try {
      res = await fetch(apiUrl(path), { headers: { Authorization: "Bearer " + token } });
    } catch (_) {
      throw new Error(t("Не удалось подключиться к серверу", "Серверге қосылу мүмкін болмады"));
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || t("Не удалось скачать файл с сервера", "Файлды серверден жүктеу мүмкін болмады"));
    }
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    return;
  }
  // Fallback CSV generation from localStorage DB
  const db = loadLocalDb();
  const rid = parseInt(path.split("/")[4]) || 1;
  const rows = [["№", "ФИО / ТАӘ", "ИИН / ЖСН", "Должность / Лауазымы", "Вредный фактор / Зиянды фактор", "Статус / Мәртебе", "Заключение / Қорытынды"]];
  db.employees.filter((e) => e.request_id === rid).forEach((e, i) => {
    rows.push([i + 1, e.full_name, e.iin, e.position, e.harmful_factor, statusLabel(e.status), e.conclusion || ""]);
  });
  const csvCell = (value) => {
    const text = String(value ?? "");
    const safe = /^[\u0000-\u0020]*[=+\-@]/.test(text) ? "'" + text : text;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const csv = "\ufeff" + rows.map((r) => r.map(csvCell).join(";")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function toast(msg, type = "") {
  let wrap = document.querySelector(".toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    wrap.setAttribute("aria-live", "polite");
    wrap.setAttribute("aria-atomic", "false");
    document.body.appendChild(wrap);
  }
  const el = document.createElement("div");
  el.className = "toast " + type;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function progressBar(progress, total) {
  if (!total) return '<div class="progress"></div>';
  return `<div class="progress">${Object.entries(PROGRESS_COLORS)
    .map(([k, c]) => `<div style="width:${(100 * (progress[k] || 0)) / total}%;background:${c}"></div>`)
    .join("")}</div>`;
}

function progressLegend(p) {
  return `<div class="legend">
    <span><i style="background:${PROGRESS_COLORS.fit}"></i>${statusLabel("fit")}: <b>${p.fit}</b></span>
    <span><i style="background:${PROGRESS_COLORS.unfit}"></i>${statusLabel("unfit")}: <b>${p.unfit}</b></span>
    <span><i style="background:${PROGRESS_COLORS.absent}"></i>${statusLabel("absent")}: <b>${p.absent}</b></span>
    <span><i style="background:${PROGRESS_COLORS.scheduled}"></i>${statusLabel("scheduled")}: <b>${p.scheduled}</b></span>
    <span><i style="background:#d1d9d7"></i>${statusLabel("pending")}: <b>${p.pending}</b></span>
  </div>`;
}

function setBusy(btn, busy, text) {
  if (!btn) return;
  if (busy) { btn.dataset.text = btn.innerHTML; btn.innerHTML = text || t("Подождите…", "Күте тұрыңыз…"); btn.disabled = true; }
  else { btn.innerHTML = btn.dataset.text || btn.innerHTML; btn.disabled = false; }
}

// ---------- RU | KZ ауыстырғышы және data-ru / data-kk атрибуттары ----------
function renderLangSwitchers() {
  document.querySelectorAll("[data-lang-switch]").forEach((wrap) => {
    const isDark = wrap.dataset.langSwitch === "dark";
    wrap.className = "lang-switch" + (isDark ? " dark" : "");
    wrap.innerHTML = `
      <button type="button" class="lang-btn ${LANG === "ru" ? "active" : ""}" onclick="setLang('ru')">RU</button>
      <button type="button" class="lang-btn ${LANG === "kk" ? "active" : ""}" onclick="setLang('kk')">KZ</button>
    `;
  });
}

function applyTranslations() {
  document.documentElement.lang = LANG;
  renderLangSwitchers();
  document.querySelectorAll("[data-ru]").forEach((el) => {
    const val = LANG === "kk" ? (el.dataset.kk ?? el.dataset.ru) : el.dataset.ru;
    if (el.dataset.i18nHtml !== undefined) el.innerHTML = val;
    else el.textContent = val;
  });
  document.querySelectorAll("[data-ph-ru]").forEach((el) => {
    el.placeholder = LANG === "kk" ? (el.dataset.phKk ?? el.dataset.phRu) : el.dataset.phRu;
  });
  if (typeof window.onLangChange === "function") {
    window.onLangChange(LANG);
  }
}

function setLang(lang) {
  if (lang !== "ru" && lang !== "kk") return;
  LANG = lang;
  localStorage.setItem("medtekser_lang", lang);
  applyTranslations();
}

// Shared theme controls.
function getTheme() {
  try { return localStorage.getItem("medtekser_theme") || "light"; } catch (_) { return "light"; }
}
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.querySelectorAll(".theme-btn").forEach((btn) => {
    btn.innerHTML = theme === "dark" ? "☀️" : "🌙";
    btn.title = theme === "dark" ? t("Светлая тема", "Жарық тақырып") : t("Тёмная тема", "Қараңғы тақырып");
  });
}
function toggleTheme() {
  const next = getTheme() === "dark" ? "light" : "dark";
  try { localStorage.setItem("medtekser_theme", next); } catch (_) {}
  applyTheme(next);
}

document.addEventListener("DOMContentLoaded", () => {
  if (USE_LOCAL_API) {
    const notice = document.createElement("div");
    notice.className = "local-preview-notice";
    notice.setAttribute("role", "note");
    notice.dataset.ru = "Локальный предпросмотр: заявки хранятся только в этом браузере, вход не проверяет сервер. Не вводите реальные персональные или медицинские данные.";
    notice.dataset.kk = "Жергілікті preview: өтінімдер тек осы браузерде сақталады, кіруді сервер тексермейді. Нақты жеке немесе медициналық деректерді енгізбеңіз.";
    document.body.prepend(notice);
  }
  document.querySelectorAll("[data-logo]").forEach((el) => (el.innerHTML = LOGO_HTML));
  document.querySelectorAll("[data-icon]").forEach((el) => {
    el.innerHTML = icon(el.dataset.icon, +el.dataset.size || 20) + el.innerHTML;
  });
  // Inject theme toggle button right next to every .lang-switch if not already present
  document.querySelectorAll(".lang-switch").forEach((sw) => {
    if (!sw.parentElement.querySelector(".theme-btn")) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "theme-btn";
      btn.onclick = toggleTheme;
      sw.insertAdjacentElement("afterend", btn);
    }
  });
  applyTheme(getTheme());
  applyTranslations();
});
