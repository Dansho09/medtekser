#!/usr/bin/env python3
"""MedTekser — корпоративтік медициналық тексеруді ұйымдастыру сервисі.

Тек Python стандартты кітапханасы қолданылады: қосымша орнату қажет емес.
Іске қосу:  python3 server.py   →  http://localhost:8000

Орта айнымалылары (міндетті емес):
  ADMIN_PASSWORD      — админ құпиясөзі (әдепкі: admin123, продакшнда міндетті түрде өзгертіңіз)
  PORT                — порт (әдепкі: 8000)
  DB_PATH             — SQLite файлының жолы
  CONTACT_PHONE       — сайттағы байланыс телефоны, мысалы +77001234567
  TELEGRAM_BOT_TOKEN  — жаңа өтінім туралы хабарлама жіберетін бот токені
  TELEGRAM_CHAT_ID    — хабарлама баратын чат ID
  PUBLIC_URL          — сайттың сыртқы мекенжайы (хабарламадағы сілтемелер үшін)
"""
import csv
import io
import json
import os
import secrets
import sqlite3
import threading
import urllib.parse
import urllib.request
from datetime import datetime, timedelta
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
DB_PATH = os.environ.get("DB_PATH", os.path.join(BASE_DIR, "medtekser.db"))
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")
PORT = int(os.environ.get("PORT", "8000"))
CONTACT_PHONE = os.environ.get("CONTACT_PHONE", "+77787961219")
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")
PUBLIC_URL = os.environ.get("PUBLIC_URL", "http://localhost:%d" % PORT).rstrip("/")
SESSION_DAYS = 14

# Бір қызметкерге арналған баға (теңге) — RU + KK
EXAM_TYPES = {
    "periodic": {
        "name": "Периодический медосмотр",
        "name_ru": "Периодический медосмотр",
        "name_kk": "Мерзімді медициналық тексеру",
        "price": 15000,
        "desc": "Обязательный ежегодный осмотр сотрудников с вредными производственными факторами (Приказ МЗ РК № ҚР ДСМ-131/2020)",
        "desc_ru": "Обязательный ежегодный осмотр сотрудников с вредными производственными факторами (Приказ МЗ РК № ҚР ДСМ-131/2020)",
        "desc_kk": "Зиянды өндірістік факторы бар қызметкерлерге жылына бір рет міндетті тексеру (ҚР ДСМ № 131/2020 бұйрығы)",
    },
    "preliminary": {
        "name": "Предварительный медосмотр (форма 075/у)",
        "name_ru": "Предварительный медосмотр (форма 075/у)",
        "name_kk": "Жұмысқа кірер алдындағы тексеру (075/е нысаны)",
        "price": 12000,
        "desc": "Медицинское освидетельствование кандидатов при приёме на работу с выдачей официального заключения",
        "desc_ru": "Медицинское освидетельствование кандидатов при приёме на работу с выдачей официального заключения",
        "desc_kk": "Жаңа қызметкерлерді жұмысқа қабылдар алдында ресми қорытынды бере отырып тексеру",
    },
    "pre_shift": {
        "name": "Предсменный / предрейсовый осмотр",
        "name_ru": "Предсменный / предрейсовый осмотр",
        "name_kk": "Ауысым / рейс алдындағы тексеру",
        "price": 3000,
        "desc": "Ежедневный допуск водителей и операторов спецтехники к смене (абонемент на месяц за 1 сотрудника)",
        "desc_ru": "Ежедневный допуск водителей и операторов спецтехники к смене (абонемент на месяц за 1 сотрудника)",
        "desc_kk": "Жүргізушілер мен арнайы техника операторларын күнделікті ауысымға жіберу (айына 1 адамға абонемент)",
    },
    "checkup": {
        "name": "Корпоративный Check-Up",
        "name_ru": "Корпоративный Check-Up",
        "name_kk": "Корпоративтік Check-Up",
        "price": 35000,
        "desc": "Расширенная диагностика здоровья команды: анализы крови, УЗИ, ЭКГ, терапевт и узкие специалисты",
        "desc_ru": "Расширенная диагностика здоровья команды: анализы крови, УЗИ, ЭКГ, терапевт и узкие специалисты",
        "desc_kk": "Команда денсаулығын кеңейтілген тексеру: қан талдаулары, УДЗ, ЭКГ, терапевт және бейінді мамандар",
    },
}
HARMFUL_FACTOR_SURCHARGE = 5000  # зиянды факторы бар қызметкерге үстеме
SERVICE_FEE_PERCENT = 10          # сервис комиссиясы

REQUEST_STATUSES = ["new", "confirmed", "scheduled", "in_progress", "done", "cancelled"]
EMPLOYEE_STATUSES = ["pending", "scheduled", "fit", "unfit", "absent"]


# ---------------------------------------------------------------- Дерекқор
def db():
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    os.makedirs(os.path.dirname(os.path.abspath(DB_PATH)), exist_ok=True)
    with db() as conn:
        conn.execute("PRAGMA journal_mode = WAL")
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS clinics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                address TEXT,
                phone TEXT,
                license TEXT,
                active INTEGER DEFAULT 1
            );
            CREATE TABLE IF NOT EXISTS requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company TEXT NOT NULL,
                bin TEXT,
                contact_name TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT,
                employees_count INTEGER NOT NULL,
                exam_type TEXT NOT NULL,
                preferred_date TEXT,
                comment TEXT,
                status TEXT DEFAULT 'new',
                clinic_id INTEGER REFERENCES clinics(id),
                scheduled_date TEXT,
                access_code TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS employees (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
                full_name TEXT NOT NULL,
                iin TEXT,
                position TEXT,
                harmful_factor TEXT,
                status TEXT DEFAULT 'pending',
                conclusion TEXT
            );
            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                role TEXT NOT NULL,
                request_id INTEGER,
                expires_at TEXT NOT NULL
            );
            """
        )
        if conn.execute("SELECT COUNT(*) FROM clinics").fetchone()[0] == 0:
            conn.executemany(
                "INSERT INTO clinics (name, address, phone, license) VALUES (?,?,?,?)",
                [
                    ("«Шипагер» медициналық орталығы", "Шымкент, Тәуке хан даңғ. 45", "+7 7252 55 10 20", "№ 0184920DF"),
                    ("«SapaMed» клиникасы", "Шымкент, Байтұрсынов к. 18", "+7 7252 44 20 30", "№ 0219401DF"),
                    ("MedTekser көшпелі медбригадасы", "Кәсіпорын аумағына шығу", "+7 700 000 00 03", "№ 0184920DF-M"),
                ],
            )
        if conn.execute("SELECT COUNT(*) FROM requests").fetchone()[0] == 0:
            now_str = datetime.now().isoformat(timespec="seconds")
            conn.execute(
                """INSERT INTO requests (company, bin, contact_name, phone, email, employees_count,
                   exam_type, preferred_date, comment, status, clinic_id, scheduled_date, access_code, created_at)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                ("ЖШС «Ontustik Qurylys Group»", "190440012345", "Ерлан Сапарұлы", "+7 701 555 44 33",
                 "hr@oqg.kz", 6, "periodic", "2026-11-20", "Көшпелі бригада таңертең сағат 09:00-де келсе жақсы болар еді",
                 "in_progress", 3, "2026-11-20", "DEMO12", now_str),
            )
            conn.executemany(
                """INSERT INTO employees (request_id, full_name, iin, position, harmful_factor, status, conclusion)
                   VALUES (1,?,?,?,?,?,?)""",
                [
                    ("Сейітов Нұрлан Асқарұлы", "900101300123", "Электрдәнекерлеуші", "Дәнекерлеу аэрозолі, шу", "fit", "Жұмысқа жарамды, шектеу жоқ"),
                    ("Әлиева Айгүл Серікқызы", "950505400456", "Мұнара кранының машинисі", "Биіктіктегі жұмыс", "fit", "Жұмысқа жарамды"),
                    ("Мұратов Дәурен Бақытұлы", "880312300789", "Жүк көлігінің жүргізушісі", "Діріл, шу", "fit", "Жұмысқа жарамды"),
                    ("Қасымов Бекзат Талғатұлы", "921120300551", "Монтажшы", "Биіктіктегі жұмыс, шу", "scheduled", ""),
                    ("Жұмабаева Гүлнар Маратқызы", "870714400219", "Қойма меңгерушісі", "", "scheduled", ""),
                    ("Оспанов Мақсат Қайратұлы", "980909300882", "Бетоншы", "Цемент шаңы, діріл", "pending", ""),
                ],
            )
            conn.execute(
                """INSERT INTO requests (company, bin, contact_name, phone, email, employees_count,
                   exam_type, preferred_date, comment, status, clinic_id, scheduled_date, access_code, created_at)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                ("ЖШС «Shymkent Logistics»", "210840098765", "Динара Кенжебекқызы", "+7 702 777 88 99",
                 "office@shymlog.kz", 25, "pre_shift", "2026-11-22", "25 жүргізушіге ай сайынғы ауысым алдындағы тексеру",
                 "confirmed", 1, "2026-11-22", "LOG777", now_str),
            )
        conn.execute("DELETE FROM sessions WHERE expires_at < ?", (datetime.now().isoformat(),))


def create_session(role, request_id=None):
    token = secrets.token_urlsafe(32)
    expires = (datetime.now() + timedelta(days=SESSION_DAYS)).isoformat(timespec="seconds")
    with db() as conn:
        conn.execute("INSERT INTO sessions (token, role, request_id, expires_at) VALUES (?,?,?,?)",
                     (token, role, request_id, expires))
    return token


def get_session(token):
    if not token:
        return None
    with db() as conn:
        row = conn.execute("SELECT * FROM sessions WHERE token=? AND expires_at > ?",
                           (token, datetime.now().isoformat())).fetchone()
    return dict(row) if row else None


def delete_session(token):
    with db() as conn:
        conn.execute("DELETE FROM sessions WHERE token=?", (token,))


def calc_price(exam_type, employees_count, harmful_count=0):
    base = EXAM_TYPES.get(exam_type, EXAM_TYPES["periodic"])["price"]
    subtotal = base * employees_count + HARMFUL_FACTOR_SURCHARGE * harmful_count
    fee = round(subtotal * SERVICE_FEE_PERCENT / 100)
    return {"per_employee": base, "subtotal": subtotal, "service_fee": fee, "total": subtotal + fee}


def request_to_dict(conn, row, include_employees=False):
    d = dict(row)
    et = EXAM_TYPES.get(d["exam_type"], {})
    d["exam_name"] = et.get("name", d["exam_type"])
    d["exam_name_ru"] = et.get("name_ru", d["exam_name"])
    d["exam_name_kk"] = et.get("name_kk", d["exam_name"])
    emps = conn.execute("SELECT * FROM employees WHERE request_id=? ORDER BY id", (d["id"],)).fetchall()
    harmful = sum(1 for e in emps if (e["harmful_factor"] or "").strip())
    count = max(d["employees_count"], len(emps))
    d["price"] = calc_price(d["exam_type"], count, harmful)
    d["progress"] = {s: sum(1 for e in emps if e["status"] == s) for s in EMPLOYEE_STATUSES}
    d["employees_loaded"] = len(emps)
    if d.get("clinic_id"):
        c = conn.execute("SELECT * FROM clinics WHERE id=?", (d["clinic_id"],)).fetchone()
        d["clinic"] = dict(c) if c else None
    else:
        d["clinic"] = None
    if include_employees:
        d["employees"] = [dict(e) for e in emps]
    return d


def notify_telegram(text):
    """Жаңа өтінім туралы Telegram-ға хабарлама (фонда, қате болса сайт тоқтамайды)."""
    if not (TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID):
        return

    def send():
        try:
            data = urllib.parse.urlencode({"chat_id": TELEGRAM_CHAT_ID, "text": text,
                                           "parse_mode": "HTML", "disable_web_page_preview": "true"}).encode()
            urllib.request.urlopen("https://api.telegram.org/bot%s/sendMessage" % TELEGRAM_BOT_TOKEN,
                                   data=data, timeout=10).read()
        except Exception as e:
            print("Telegram қатесі:", e)

    threading.Thread(target=send, daemon=True).start()


def html_escape(s):
    return str(s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


# ---------------------------------------------------------------- HTTP
class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map,
                      ".js": "application/javascript; charset=utf-8",
                      ".css": "text/css; charset=utf-8",
                      ".html": "text/html; charset=utf-8",
                      ".svg": "image/svg+xml"}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)

    def log_message(self, fmt, *args):
        print("[%s] %s" % (datetime.now().strftime("%H:%M:%S"), fmt % args))

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "same-origin")
        if not urlparse(self.path).path.startswith("/api/"):
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    # --- көмекші әдістер
    def send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def error(self, msg, status=400):
        self.send_json({"error": msg}, status)

    def read_json(self):
        length = int(self.headers.get("Content-Length") or 0)
        if length > 5_000_000:
            raise ValueError("Сұраныс тым үлкен")
        raw = self.rfile.read(length) if length else b"{}"
        return json.loads(raw.decode("utf-8") or "{}")

    def token(self):
        header = self.headers.get("Authorization", "")
        return header[7:] if header.startswith("Bearer ") else ""

    def require_admin(self):
        s = get_session(self.token())
        if not s or s["role"] != "admin":
            self.error("Рұқсат жоқ", 401)
            return False
        return True

    def company_request_id(self):
        s = get_session(self.token())
        if not s or s["role"] != "company":
            self.error("Рұқсат жоқ", 401)
            return None
        return s["request_id"]

    # --- маршруттар
    def do_GET(self):
        path = urlparse(self.path).path
        if not path.startswith("/api/"):
            if path in ("/cabinet", "/admin"):
                self.path = path + ".html"
            elif path == "/health":
                return self.send_json({"ok": True})
            return super().do_GET()
        self.dispatch(self.route_get)

    def do_POST(self):
        self.dispatch(self.route_post)

    def do_PUT(self):
        self.dispatch(self.route_put)

    def do_DELETE(self):
        self.dispatch(self.route_delete)

    def dispatch(self, fn):
        path = urlparse(self.path).path
        try:
            fn(path)
        except (ValueError, json.JSONDecodeError) as e:
            self.error(str(e) or "Қате деректер")
        except Exception as e:
            print("Қате:", repr(e))
            self.error("Сервер қатесі", 500)

    def route_get(self, path):
        if path == "/api/config":
            return self.send_json({
                "exam_types": EXAM_TYPES,
                "harmful_surcharge": HARMFUL_FACTOR_SURCHARGE,
                "service_fee_percent": SERVICE_FEE_PERCENT,
                "contact_phone": CONTACT_PHONE,
            })
        if path == "/api/cabinet":
            rid = self.company_request_id()
            if rid is None:
                return
            with db() as conn:
                row = conn.execute("SELECT * FROM requests WHERE id=?", (rid,)).fetchone()
                if not row:
                    return self.error("Өтінім табылмады", 404)
                data = request_to_dict(conn, row, include_employees=True)
                data.pop("access_code", None)
                return self.send_json(data)

        if not path.startswith("/api/admin/"):
            return self.error("Табылмады", 404)
        if not self.require_admin():
            return
        parts = path.strip("/").split("/")
        with db() as conn:
            if path == "/api/admin/requests":
                rows = conn.execute("SELECT * FROM requests ORDER BY id DESC").fetchall()
                return self.send_json([request_to_dict(conn, r) for r in rows])
            if len(parts) == 4 and parts[2] == "requests":
                row = conn.execute("SELECT * FROM requests WHERE id=?", (int(parts[3]),)).fetchone()
                if not row:
                    return self.error("Өтінім табылмады", 404)
                return self.send_json(request_to_dict(conn, row, include_employees=True))
            if len(parts) == 5 and parts[2] == "requests" and parts[4] == "export":
                return self.export_csv(conn, int(parts[3]))
            if path == "/api/admin/clinics":
                rows = conn.execute("SELECT * FROM clinics ORDER BY id").fetchall()
                return self.send_json([dict(r) for r in rows])
            if path == "/api/admin/stats":
                items = [request_to_dict(conn, r) for r in conn.execute("SELECT * FROM requests").fetchall()]
                active = [i for i in items if i["status"] != "cancelled"]
                paid = [i for i in active if i["status"] != "new"]
                return self.send_json({
                    "requests": len(items),
                    "new": sum(1 for i in items if i["status"] == "new"),
                    "employees": sum(max(i["employees_count"], i["employees_loaded"]) for i in active),
                    "examined": sum(i["progress"]["fit"] + i["progress"]["unfit"] for i in active),
                    "revenue": sum(i["price"]["total"] for i in paid),
                    "service_fee": sum(i["price"]["service_fee"] for i in paid),
                })
        self.error("Табылмады", 404)

    def export_csv(self, conn, rid):
        req = conn.execute("SELECT * FROM requests WHERE id=?", (rid,)).fetchone()
        if not req:
            return self.error("Өтінім табылмады", 404)
        buf = io.StringIO()
        w = csv.writer(buf, delimiter=";")
        w.writerow(["№", "ТАӘ", "ЖСН", "Лауазымы", "Зиянды фактор", "Мәртебе", "Қорытынды"])
        labels = {"pending": "Күтуде", "scheduled": "Жоспарланды", "fit": "Жарамды",
                  "unfit": "Жарамсыз", "absent": "Келмеді"}
        for i, e in enumerate(conn.execute("SELECT * FROM employees WHERE request_id=? ORDER BY id", (rid,)), 1):
            w.writerow([i, e["full_name"], e["iin"], e["position"], e["harmful_factor"],
                        labels.get(e["status"], e["status"]), e["conclusion"] or ""])
        body = ("﻿" + buf.getvalue()).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/csv; charset=utf-8")
        self.send_header("Content-Disposition", 'attachment; filename="medtekser_%d.csv"' % rid)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def route_post(self, path):
        if path == "/api/requests":
            d = self.read_json()
            if d.get("website"):
                return self.send_json({"id": 0, "access_code": ""}, 201)
            for f, label in (("company", "Компания атауы"), ("contact_name", "Байланыс тұлға"),
                             ("phone", "Телефон"), ("employees_count", "Қызметкерлер саны"),
                             ("exam_type", "Тексеру түрі")):
                if not str(d.get(f, "")).strip():
                    raise ValueError("Толтырыңыз: %s" % label)
            if d["exam_type"] not in EXAM_TYPES:
                raise ValueError("Тексеру түрі қате")
            count = int(d["employees_count"])
            if count < 1 or count > 10000:
                raise ValueError("Қызметкерлер саны 1–10000 аралығында болуы керек")
            bin_ = str(d.get("bin", "")).strip()
            if bin_ and (not bin_.isdigit() or len(bin_) != 12):
                raise ValueError("БСН 12 саннан тұруы керек")
            code = secrets.token_hex(3).upper()
            with db() as conn:
                cur = conn.execute(
                    """INSERT INTO requests (company, bin, contact_name, phone, email, employees_count,
                       exam_type, preferred_date, comment, access_code, created_at)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
                    (d["company"].strip()[:200], bin_, d["contact_name"].strip()[:120],
                     d["phone"].strip()[:30], str(d.get("email", "")).strip()[:120], count, d["exam_type"],
                     str(d.get("preferred_date", ""))[:10], str(d.get("comment", "")).strip()[:2000], code,
                     datetime.now().isoformat(timespec="seconds")),
                )
                rid = cur.lastrowid
            price = calc_price(d["exam_type"], count)
            notify_telegram(
                "🆕 <b>Жаңа өтінім №%d</b>\n🏢 %s\n👤 %s, %s\n🩺 %s · %d адам\n💰 %s ₸\n%s/admin" % (
                    rid, html_escape(d["company"]), html_escape(d["contact_name"]), html_escape(d["phone"]),
                    EXAM_TYPES[d["exam_type"]]["name"], count, "{:,}".format(price["total"]).replace(",", " "),
                    PUBLIC_URL))
            return self.send_json({"id": rid, "access_code": code, "price": price}, 201)

        if path == "/api/cabinet/login":
            d = self.read_json()
            try:
                rid = int(d.get("request_id") or 0)
            except (TypeError, ValueError):
                rid = 0
            with db() as conn:
                row = conn.execute("SELECT id FROM requests WHERE id=? AND access_code=?",
                                   (rid, str(d.get("code", "")).strip().upper())).fetchone()
            if not row:
                return self.error("Өтінім нөмірі немесе кіру коды қате", 401)
            return self.send_json({"token": create_session("company", row["id"])})

        if path == "/api/logout":
            delete_session(self.token())
            return self.send_json({"ok": True})

        if path == "/api/cabinet/employees":
            rid = self.company_request_id()
            if rid is None:
                return
            d = self.read_json()
            employees = d.get("employees")
            if employees is None and d.get("csv"):
                employees = parse_employees_csv(d["csv"])
            employees = [e for e in (employees or []) if str(e.get("full_name", "")).strip()]
            if not employees:
                raise ValueError("Қызметкерлер тізімі бос немесе формат қате")
            if len(employees) > 5000:
                raise ValueError("Бір рет жүктеуге ең көбі 5000 адам")
            with db() as conn:
                conn.executemany(
                    "INSERT INTO employees (request_id, full_name, iin, position, harmful_factor) VALUES (?,?,?,?,?)",
                    [(rid, str(e["full_name"]).strip()[:200], str(e.get("iin", "")).strip()[:12],
                      str(e.get("position", "")).strip()[:120], str(e.get("harmful_factor", "")).strip()[:200])
                     for e in employees],
                )
            return self.send_json({"added": len(employees)}, 201)

        if path == "/api/admin/login":
            d = self.read_json()
            if not secrets.compare_digest(str(d.get("password", "")).encode(), ADMIN_PASSWORD.encode()):
                return self.error("Құпиясөз қате", 401)
            return self.send_json({"token": create_session("admin")})

        if path == "/api/admin/clinics":
            if not self.require_admin():
                return
            d = self.read_json()
            if not str(d.get("name", "")).strip():
                raise ValueError("Клиника атауы қажет")
            with db() as conn:
                conn.execute("INSERT INTO clinics (name, address, phone, license) VALUES (?,?,?,?)",
                             (d["name"].strip(), d.get("address", ""), d.get("phone", ""), d.get("license", "")))
            return self.send_json({"ok": True}, 201)
        self.error("Табылмады", 404)

    def route_put(self, path):
        parts = path.strip("/").split("/")
        if len(parts) == 5 and parts[:3] == ["api", "admin", "requests"] and parts[4] == "employees":
            if not self.require_admin():
                return
            d = self.read_json()
            if d.get("status") not in EMPLOYEE_STATUSES:
                raise ValueError("Статус қате")
            with db() as conn:
                conn.execute("UPDATE employees SET status=? WHERE request_id=? AND status IN ('pending','scheduled')",
                             (d["status"], int(parts[3])))
            return self.send_json({"ok": True})

        if len(parts) == 4 and parts[:3] == ["api", "admin", "requests"]:
            if not self.require_admin():
                return
            rid = int(parts[3])
            d = self.read_json()
            fields, values = [], []
            if "status" in d:
                if d["status"] not in REQUEST_STATUSES:
                    raise ValueError("Статус қате")
                fields.append("status=?"); values.append(d["status"])
            if "clinic_id" in d:
                fields.append("clinic_id=?"); values.append(int(d["clinic_id"]) if d["clinic_id"] else None)
            if "scheduled_date" in d:
                fields.append("scheduled_date=?"); values.append(d["scheduled_date"] or None)
            if not fields:
                raise ValueError("Өзгеріс жоқ")
            with db() as conn:
                conn.execute("UPDATE requests SET %s WHERE id=?" % ", ".join(fields), (*values, rid))
            return self.send_json({"ok": True})

        if len(parts) == 4 and parts[:3] == ["api", "admin", "employees"]:
            if not self.require_admin():
                return
            d = self.read_json()
            if d.get("status") and d["status"] not in EMPLOYEE_STATUSES:
                raise ValueError("Статус қате")
            with db() as conn:
                conn.execute("UPDATE employees SET status=COALESCE(?, status), conclusion=COALESCE(?, conclusion) WHERE id=?",
                             (d.get("status"), d.get("conclusion"), int(parts[3])))
            return self.send_json({"ok": True})
        self.error("Табылмады", 404)

    def route_delete(self, path):
        parts = path.strip("/").split("/")
        if len(parts) == 4 and parts[:3] == ["api", "cabinet", "employees"]:
            rid = self.company_request_id()
            if rid is None:
                return
            with db() as conn:
                conn.execute("DELETE FROM employees WHERE id=? AND request_id=? AND status='pending'",
                             (int(parts[3]), rid))
            return self.send_json({"ok": True})
        if len(parts) == 4 and parts[:3] == ["api", "admin", "clinics"]:
            if not self.require_admin():
                return
            with db() as conn:
                used = conn.execute("SELECT COUNT(*) FROM requests WHERE clinic_id=?", (int(parts[3]),)).fetchone()[0]
                if used:
                    raise ValueError("Бұл клиника өтінімдерге тағайындалған, оны өшіруге болмайды")
                conn.execute("DELETE FROM clinics WHERE id=?", (int(parts[3]),))
            return self.send_json({"ok": True})
        self.error("Табылмады", 404)


def parse_employees_csv(text):
    text = text.lstrip("\ufeff")
    sample = text[:2000]
    delimiter = "\t" if "\t" in sample else (";" if ";" in sample else ",")
    result = []
    for row in csv.reader(io.StringIO(text.strip()), delimiter=delimiter):
        cells = [c.strip() for c in row] + ["", "", "", ""]
        if not cells[0] or cells[0].lower() in ("таә", "аты-жөні", "фио", "full_name", "№"):
            continue
        if cells[0].isdigit() and len(cells[0]) < 6 and cells[1] and not cells[1].isdigit():
            cells = cells[1:] + [""]
        result.append({"full_name": cells[0], "iin": cells[1], "position": cells[2], "harmful_factor": cells[3]})
    return result


if __name__ == "__main__":
    init_db()
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print("MedTekser іске қосылды: http://localhost:%d" % PORT)
    print("Админ панель: http://localhost:%d/admin" % PORT)
    if ADMIN_PASSWORD == "admin123":
        print("⚠️  ЕСКЕРТУ: әдепкі админ құпиясөзі қолданылып тұр. ADMIN_PASSWORD орнатыңыз!")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nТоқтатылды")
