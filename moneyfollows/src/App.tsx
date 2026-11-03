import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { User } from "firebase/auth";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  deleteUser,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile
} from "firebase/auth";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  Camera,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Download,
  House,
  Landmark,
  Moon,
  Plus,
  ReceiptText,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sun,
  Tag,
  Trash2,
  UserRound,
  WalletCards,
  X
} from "lucide-react";
import "./App.css";
import { auth, authProviders, isFirebaseConfigured } from "./firebase";

type EntryKind = "income" | "expense" | "transfer";
type ViewTab = "daily" | "calendar" | "monthly" | "total";
type BottomTab = "home" | "trans" | "stats" | "accounts" | "settings";
type FilterTab = "income" | "expenses" | "account";
type CurrencyCode = string;
type CurrencyOption = { code: CurrencyCode; label: string; symbol: string };
type AuthProvider = "Google" | "Email" | "Local";
type ReminderFrequency = "One time" | "Daily" | "Weekly" | "Monthly" | "Yearly";

type UserProfile = {
  name: string;
  provider: AuthProvider;
  email?: string;
  photoURL?: string;
};

type LedgerEntry = {
  id: number;
  kind: EntryKind;
  amount: number;
  category: string;
  account: string;
  toAccount?: string;
  note: string;
  description: string;
  foodPlace?: string;
  foodSource?: string;
  imageUrl?: string;
  splitPaidBy?: string;
  splitPeople?: string[];
  tags: string[];
  date: string;
  createdAt: string;
};

type Reminder = {
  id: number;
  kind: Exclude<EntryKind, "transfer">;
  name: string;
  amount: number;
  frequency: ReminderFrequency;
  account: string;
  category: string;
  autoAdd: boolean;
  date: string;
  time: string;
  createdAt: string;
};

type BudgetItem = {
  id: number;
  name: string;
  amount: number;
  category: string;
  period: "Weekly" | "Monthly" | "Yearly";
  createdAt: string;
};

type GoalItem = {
  id: number;
  name: string;
  amount: number;
  targetDate: string;
  createdAt: string;
};

type DebtItem = {
  id: number;
  kind: "receivable" | "payable";
  name: string;
  amount: number;
  description: string;
  dueDate: string;
  createdAt: string;
};

type CoachMode = "fast" | "balanced" | "deep";
type CoachModel = "argon" | "flash25" | "flash36" | "flash38" | "latest" | "lite";
type CoachAction =
  | { label: string; payload: Omit<GoalItem, "createdAt" | "id">; type: "goal" }
  | { label: string; payload: Omit<BudgetItem, "createdAt" | "id">; type: "budget" }
  | { label: string; payload: Omit<Reminder, "createdAt" | "id">; type: "reminder" };
type CoachMessage = {
  id: number;
  actions?: CoachAction[];
  role: "assistant" | "user";
  text: string;
};

type Category = {
  emoji: string;
  name: string;
  tone: string;
};

const STORAGE_KEY = "moneyfollows-user-transactions";
const CURRENCY_STORAGE_KEY = "moneyfollows-currency";
const BALANCE_STORAGE_KEY = "moneyfollows-opening-balance";
const SAVINGS_TARGET_STORAGE_KEY = "moneyfollows-monthly-savings-target";
const FINANCIAL_AGE_STORAGE_KEY = "moneyfollows-financial-age";
const REMINDERS_STORAGE_KEY = "moneyfollows-reminders";
const BUDGETS_STORAGE_KEY = "moneyfollows-budgets";
const GOALS_STORAGE_KEY = "moneyfollows-goals";
const DEBTS_STORAGE_KEY = "moneyfollows-debts";
const COACH_CHAT_STORAGE_KEY = "moneyfollows-ai-chat-history";
const THEME_KEY = "moneyfollows-theme";
const LAST_AUTHED_PROFILE_KEY = "moneyfollows-last-authed-profile";
const SETUP_STORAGE_KEY = "moneyfollows-setup-complete";
const LOCAL_PROFILE_KEY = "moneyfollows-local-profile";

const incomeCategories: Category[] = [
  { emoji: "💸", name: "Allowance", tone: "#48c78e" },
  { emoji: "💰", name: "Salary", tone: "#f6c85f" },
  { emoji: "💵", name: "Petty cash", tone: "#51a7f9" },
  { emoji: "🏅", name: "Bonus", tone: "#9f8cff" },
  { emoji: "✨", name: "Other", tone: "#aeb4bd" }
];

const expenseCategories: Category[] = [
  { emoji: "🍜", name: "Food", tone: "#ff7068" },
  { emoji: "🛒", name: "Groceries", tone: "#4fd18b" },
  { emoji: "🎉", name: "Social Life", tone: "#ff9f43" },
  { emoji: "🐾", name: "Pets", tone: "#b68cff" },
  { emoji: "🚕", name: "Transport", tone: "#4ea5ff" },
  { emoji: "🎭", name: "Culture", tone: "#6dd5aa" },
  { emoji: "🛋️", name: "Household", tone: "#d9a86c" },
  { emoji: "👕", name: "Apparel", tone: "#ef7fac" },
  { emoji: "💄", name: "Beauty", tone: "#fa6f8e" },
  { emoji: "🩺", name: "Health", tone: "#51d0c4" },
  { emoji: "📚", name: "Education", tone: "#ffcf56" },
  { emoji: "🎁", name: "Gift", tone: "#fb7b6f" },
  { emoji: "🧾", name: "Other", tone: "#aeb4bd" }
];

const accounts = ["UPI", "Cash", "Bank", "Card"];
const foodSources = ["Dine-in", "Takeaway", "Swiggy", "Zomato", "Toing", "Other app"];
const grocerySources = ["Local store", "Zepto", "Blinkit", "Swiggy Instamart", "Amazon Now", "Flipkart Minutes", "BigBasket", "DMart Ready", "Other app"];
const fallbackCurrencyCodes = [
  "AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN", "BAM", "BBD", "BDT", "BGN", "BHD", "BIF",
  "BMD", "BND", "BOB", "BRL", "BSD", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF", "CHF", "CLP", "CNY", "COP", "CRC",
  "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP", "ERN", "ETB", "EUR", "FJD", "FKP", "GBP", "GEL", "GHS",
  "GIP", "GMD", "GNF", "GTQ", "GYD", "HKD", "HNL", "HTG", "HUF", "IDR", "ILS", "INR", "IQD", "IRR", "ISK", "JMD",
  "JOD", "JPY", "KES", "KGS", "KHR", "KMF", "KPW", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR", "LRD", "LSL",
  "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRU", "MUR", "MVR", "MWK", "MXN", "MYR", "MZN", "NAD",
  "NGN", "NIO", "NOK", "NPR", "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG", "QAR", "RON", "RSD",
  "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK", "SGD", "SHP", "SLE", "SOS", "SRD", "SSP", "STN", "SYP", "SZL",
  "THB", "TJS", "TMT", "TND", "TOP", "TRY", "TTD", "TWD", "TZS", "UAH", "UGX", "USD", "UYU", "UZS", "VES", "VND",
  "VUV", "WST", "XAF", "XCD", "XOF", "XPF", "YER", "ZAR", "ZMW", "ZWL"
];
const supportedCurrencyCodes = (() => {
  const supportedValuesOf = (Intl as typeof Intl & { supportedValuesOf?: (key: "currency") => string[] }).supportedValuesOf;
  return supportedValuesOf ? supportedValuesOf("currency") : fallbackCurrencyCodes;
})();
const currencyDisplayNames = typeof Intl.DisplayNames === "function"
  ? new Intl.DisplayNames(["en"], { type: "currency" })
  : null;
const getCurrencySymbol = (code: string) => {
  try {
    return new Intl.NumberFormat("en-IN", {
      currency: code,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 0,
      style: "currency"
    }).formatToParts(0).find((part) => part.type === "currency")?.value ?? code;
  } catch {
    return code;
  }
};

const prepareAuthPersistence = async () => {
  if (!auth) {
    return;
  }

  await setPersistence(auth, browserLocalPersistence);
};

const saveLastAuthedProfile = (user: User) => {
  window.localStorage.setItem(LAST_AUTHED_PROFILE_KEY, JSON.stringify({
    email: user.email,
    name: user.displayName || user.email?.split("@")[0] || "MoneyFollows user",
    photoURL: user.photoURL || undefined,
    provider: user.providerData[0]?.providerId === "google.com" ? "Google" : "Email",
    uid: user.uid
  }));
};

const loadLastAuthedProfile = (): UserProfile | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(LAST_AUTHED_PROFILE_KEY) || "null") as Partial<UserProfile> | null;
    return parsed?.name ? {
      email: typeof parsed.email === "string" ? parsed.email : undefined,
      name: parsed.name,
      photoURL: typeof parsed.photoURL === "string" ? parsed.photoURL : undefined,
      provider: parsed.provider === "Google" ? "Google" : "Email"
    } : null;
  } catch {
    return null;
  }
};

const loadLocalProfile = (): UserProfile | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(LOCAL_PROFILE_KEY) || "null") as Partial<UserProfile> | null;
    return parsed?.name ? {
      email: typeof parsed.email === "string" ? parsed.email : undefined,
      name: parsed.name,
      photoURL: typeof parsed.photoURL === "string" ? parsed.photoURL : undefined,
      provider: "Local"
    } : null;
  } catch {
    return null;
  }
};
const currencyOptions: CurrencyOption[] = [...new Set(["INR", "USD", "EUR", ...supportedCurrencyCodes, ...fallbackCurrencyCodes])]
  .map((code) => ({
    code,
    label: currencyDisplayNames?.of(code) ?? code,
    symbol: getCurrencySymbol(code)
  }))
  .sort((first, second) => first.label.localeCompare(second.label));
const viewTabs: Array<{ key: ViewTab; label: string }> = [
  { key: "daily", label: "Today" },
  { key: "calendar", label: "Map" },
  { key: "monthly", label: "Flow" },
  { key: "total", label: "Vault" }
];
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const bottomTabs: Array<{ key: BottomTab; label: string; icon: typeof ReceiptText }> = [
  { key: "home", label: "Home", icon: House },
  { key: "trans", label: "Ledger", icon: ReceiptText },
  { key: "stats", label: "Insight", icon: BarChart3 },
  { key: "accounts", label: "Wallets", icon: WalletCards },
  { key: "settings", label: "Settings", icon: Settings2 }
];
const coachModelOptions: Array<{ key: CoachModel; label: string; text: string }> = [
  { key: "lite", label: "2.5 Lite", text: "Fastest, low cost" },
  { key: "flash25", label: "2.5 Flash", text: "Most reliable" },
  { key: "flash36", label: "3.6 Flash", text: "Balanced daily chat" },
  { key: "flash38", label: "3.8 Flash", text: "Smart finance coach" },
  { key: "latest", label: "Flash Latest", text: "Google latest alias" },
  { key: "argon", label: "4 Argon", text: "Deep planning, auto fallback" }
];

const spring = { type: "spring", stiffness: 420, damping: 34 } as const;
const formatMoneyAmount = (amount: number, currencyCode: CurrencyCode) => {
  try {
    return new Intl.NumberFormat("en-IN", {
      currency: currencyCode,
      maximumFractionDigits: 0,
      style: "currency"
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  }
};
const defaultMoney = (amount: number) => formatMoneyAmount(amount, "INR");
const MoneyContext = createContext(defaultMoney);
const useMoney = () => useContext(MoneyContext);

const monthLabel = (date: Date) => new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(date);
const yearLabel = (date: Date) => new Intl.DateTimeFormat("en-US", { year: "numeric" }).format(date);
const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const fromDateKey = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
};
const sameMonth = (value: string, date: Date) => {
  const parsed = fromDateKey(value);
  return parsed.getFullYear() === date.getFullYear() && parsed.getMonth() === date.getMonth();
};

const parseAmount = (value: string) => Number(value.replace(/[₹,\s]/g, ""));

const getCategory = (name: string) =>
  [...incomeCategories, ...expenseCategories].find((category) => category.name === name);
const categoryTone = (name: string) => getCategory(name)?.tone ?? "#aeb4bd";
const categoryEmoji = (name: string, kind?: EntryKind) =>
  name === "Transfer" || kind === "transfer" ? "🔁" : getCategory(name)?.emoji ?? (kind === "income" ? "💰" : "🧾");

const normalizeEntry = (raw: unknown): LedgerEntry | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const item = raw as Partial<LedgerEntry> & { type?: EntryKind; title?: string };
  const amount = Number(item.amount);
  const kind = item.kind ?? item.type;

  if (!Number.isFinite(amount) || amount <= 0 || (kind !== "income" && kind !== "expense" && kind !== "transfer")) {
    return null;
  }

  return {
    account: typeof item.account === "string" ? item.account : "Cash",
    amount,
    category: typeof item.category === "string" ? item.category : kind === "income" ? "Salary" : "Food",
    createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
    date: typeof item.date === "string" ? item.date : toDateKey(new Date()),
    description: typeof item.description === "string" ? item.description : "",
    foodPlace: typeof item.foodPlace === "string" ? item.foodPlace : undefined,
    foodSource: typeof item.foodSource === "string" ? item.foodSource : undefined,
    id: typeof item.id === "number" ? item.id : Date.now(),
    imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : undefined,
    kind,
    note: typeof item.note === "string" ? item.note : item.title ?? "",
    splitPaidBy: typeof item.splitPaidBy === "string" ? item.splitPaidBy : undefined,
    splitPeople: Array.isArray(item.splitPeople) ? item.splitPeople.filter((person): person is string => typeof person === "string" && person.trim().length > 0) : undefined,
    tags: Array.isArray(item.tags) ? item.tags.filter((tag): tag is string => typeof tag === "string") : [],
    toAccount: typeof item.toAccount === "string" ? item.toAccount : undefined
  };
};

const normalizeReminder = (raw: unknown): Reminder | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const item = raw as Partial<Reminder>;
  const amount = Number(item.amount);
  const kind = item.kind === "income" ? "income" : "expense";

  if (!item.name || !Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  const frequency: ReminderFrequency =
    item.frequency === "One time" ||
    item.frequency === "Daily" ||
    item.frequency === "Weekly" ||
    item.frequency === "Yearly"
      ? item.frequency
      : "Monthly";
  const time = typeof item.time === "string" && /^\d{2}:\d{2}$/.test(item.time) ? item.time : "21:00";

  return {
    account: typeof item.account === "string" ? item.account : "UPI",
    amount,
    autoAdd: Boolean(item.autoAdd),
    category: typeof item.category === "string" ? item.category : kind === "income" ? "Salary" : "Food",
    createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
    date: typeof item.date === "string" ? item.date : toDateKey(new Date()),
    frequency,
    id: typeof item.id === "number" ? item.id : Date.now(),
    kind,
    name: item.name,
    time
  };
};

const normalizeBudget = (raw: unknown): BudgetItem | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const item = raw as Partial<BudgetItem>;
  const amount = Number(item.amount);
  const name = typeof item.name === "string" ? item.name.trim() : "";

  if (!name || !Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return {
    amount,
    category: typeof item.category === "string" ? item.category : "Food",
    createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
    id: typeof item.id === "number" ? item.id : Date.now(),
    name,
    period: item.period === "Weekly" || item.period === "Yearly" ? item.period : "Monthly"
  };
};

const normalizeGoal = (raw: unknown): GoalItem | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const item = raw as Partial<GoalItem>;
  const amount = Number(item.amount);
  const name = typeof item.name === "string" ? item.name.trim() : "";

  if (!name || !Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return {
    amount,
    createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
    id: typeof item.id === "number" ? item.id : Date.now(),
    name,
    targetDate: typeof item.targetDate === "string" ? item.targetDate : toDateKey(new Date())
  };
};

const normalizeDebt = (raw: unknown): DebtItem | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const item = raw as Partial<DebtItem>;
  const amount = Number(item.amount);
  const name = typeof item.name === "string" ? item.name.trim() : "";

  if (!name || !Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return {
    amount,
    createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
    description: typeof item.description === "string" ? item.description : "",
    dueDate: typeof item.dueDate === "string" ? item.dueDate : toDateKey(new Date()),
    id: typeof item.id === "number" ? item.id : Date.now(),
    kind: item.kind === "payable" ? "payable" : "receivable",
    name
  };
};

const loadArray = <T,>(key: string, normalize: (value: unknown) => T | null): T[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const saved = window.localStorage.getItem(key);
  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved) as unknown[];
    return parsed.map(normalize).filter((item): item is T => Boolean(item));
  } catch {
    return [];
  }
};

const starterCoachMessage: CoachMessage = {
  id: 1,
  role: "assistant",
  text: "Ask me about saving money, setting a monthly target, creating a budget, recurring payments, or what to cut first. I will use your MoneyFollows data and keep it practical."
};

const normalizeCoachMessage = (value: unknown): CoachMessage | null => {
  const item = value as Partial<CoachMessage>;

  if ((item.role !== "assistant" && item.role !== "user") || typeof item.text !== "string" || !item.text.trim()) {
    return null;
  }

  return {
    id: typeof item.id === "number" ? item.id : Date.now(),
    role: item.role,
    text: item.text
  };
};

const loadCoachMessages = () => {
  const saved = loadArray(COACH_CHAT_STORAGE_KEY, normalizeCoachMessage);
  return saved.length ? saved : [starterCoachMessage];
};

const loadCurrency = (): CurrencyCode => {
  if (typeof window === "undefined") {
    return "INR";
  }

  const saved = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
  return currencyOptions.some((option) => option.code === saved) ? saved as CurrencyCode : "INR";
};

const loadOpeningBalance = () => {
  if (typeof window === "undefined") {
    return 0;
  }

  const saved = Number(window.localStorage.getItem(BALANCE_STORAGE_KEY));
  return Number.isFinite(saved) ? saved : 0;
};

const loadSavingsTarget = () => {
  if (typeof window === "undefined") {
    return 10000;
  }

  const saved = Number(window.localStorage.getItem(SAVINGS_TARGET_STORAGE_KEY));
  return Number.isFinite(saved) && saved >= 1000 ? saved : 10000;
};

const loadFinancialAge = () => {
  if (typeof window === "undefined") {
    return 30;
  }

  const saved = Number(window.localStorage.getItem(FINANCIAL_AGE_STORAGE_KEY));
  return Number.isFinite(saved) && saved >= 18 && saved <= 75 ? saved : 30;
};

const getAuthMessage = (error: unknown) => {
  const item = error as { code?: string; message?: string };
  const currentHost = typeof window === "undefined" ? "this domain" : window.location.hostname;

  switch (item.code) {
    case "auth/email-already-in-use":
      return "An account already exists with this email. Use Log in instead.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email or password is incorrect.";
    case "auth/popup-closed-by-user":
      return "The sign-in window was closed before login finished.";
    case "auth/popup-blocked":
      return "The browser blocked the Google sign-in popup. Redirect sign-in is starting instead.";
    case "auth/weak-password":
      return "Use a stronger password with at least 6 characters.";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled in Firebase yet.";
    case "auth/unauthorized-domain":
      return `Firebase is blocking ${currentHost}. Add exactly this domain in Firebase Authentication > Settings > Authorized domains.`;
    default:
      return item.message || "Sign-in failed. Please try again.";
  }
};

const getWeeks = (date: Date) => {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  const weeks: Array<{ start: Date; end: Date; label: string }> = [];

  for (let cursor = new Date(start); cursor <= last || cursor.getDay() !== 0; cursor.setDate(cursor.getDate() + 7)) {
    const weekStart = new Date(cursor);
    const weekEnd = new Date(cursor);
    weekEnd.setDate(weekStart.getDate() + 6);
    weeks.push({
      end: weekEnd,
      label: `${String(weekStart.getDate()).padStart(2, "0")}.${String(weekStart.getMonth() + 1).padStart(2, "0")}  ~  ${String(weekEnd.getDate()).padStart(2, "0")}.${String(weekEnd.getMonth() + 1).padStart(2, "0")}`,
      start: weekStart
    });
  }

  return weeks;
};

const buildCalendar = (date: Date) => {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
};

const buildMonthlyChart = (entries: LedgerEntry[]) => {
  const now = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const inMonth = entries.filter((entry) => sameMonth(entry.date, date));
    const income = inMonth.filter((entry) => entry.kind === "income").reduce((sum, entry) => sum + entry.amount, 0);
    const expenses = inMonth.filter((entry) => entry.kind === "expense").reduce((sum, entry) => sum + entry.amount, 0);
    return {
      expenses,
      income,
      label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(date),
      savings: income - expenses
    };
  });
};

function App() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<LedgerEntry[]>(() => loadArray(STORAGE_KEY, normalizeEntry));
  const [reminders, setReminders] = useState<Reminder[]>(() => loadArray(REMINDERS_STORAGE_KEY, normalizeReminder));
  const [budgets, setBudgets] = useState<BudgetItem[]>(() => loadArray(BUDGETS_STORAGE_KEY, normalizeBudget));
  const [goals, setGoals] = useState<GoalItem[]>(() => loadArray(GOALS_STORAGE_KEY, normalizeGoal));
  const [debts, setDebts] = useState<DebtItem[]>(() => loadArray(DEBTS_STORAGE_KEY, normalizeDebt));
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(Boolean(auth));
  const [authError, setAuthError] = useState("");
  const [fallbackProfile, setFallbackProfile] = useState<UserProfile | null>(loadLocalProfile);
  const [showAuth, setShowAuth] = useState(() => typeof window !== "undefined" && window.localStorage.getItem(SETUP_STORAGE_KEY) !== "done");
  const [showAccount, setShowAccount] = useState(false);
  const [showCoach, setShowCoach] = useState(false);
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(loadCurrency);
  const [openingBalance, setOpeningBalance] = useState(loadOpeningBalance);
  const [monthlySavingsTarget, setMonthlySavingsTarget] = useState(loadSavingsTarget);
  const [financialAge, setFinancialAge] = useState(loadFinancialAge);
  const [activeView, setActiveView] = useState<ViewTab>("daily");
  const [bottomTab, setBottomTab] = useState<BottomTab>("home");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [isDark, setIsDark] = useState(() => typeof window === "undefined" ? true : window.localStorage.getItem(THEME_KEY) !== "light");
  const [showComposer, setShowComposer] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [filterTab, setFilterTab] = useState<FilterTab>("expenses");
  const [query, setQuery] = useState("");
  const [selectedIncome, setSelectedIncome] = useState<string[]>([]);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  const [kind, setKind] = useState<EntryKind>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [account, setAccount] = useState("UPI");
  const [toAccount, setToAccount] = useState("Bank");
  const [note, setNote] = useState("");
  const [description, setDescription] = useState("");
  const [foodPlace, setFoodPlace] = useState("");
  const [foodSource, setFoodSource] = useState("Dine-in");
  const [imageUrl, setImageUrl] = useState("");
  const [tagText, setTagText] = useState("");
  const [formError, setFormError] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [splitPeople, setSplitPeople] = useState("");
  const [splitPaidBy, setSplitPaidBy] = useState("");

  const money = useMemo(() => (amount: number) => formatMoneyAmount(amount, currencyCode), [currencyCode]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    window.localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    window.localStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    window.localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    window.localStorage.setItem(DEBTS_STORAGE_KEY, JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, currencyCode);
  }, [currencyCode]);

  useEffect(() => {
    window.localStorage.setItem(BALANCE_STORAGE_KEY, String(openingBalance));
  }, [openingBalance]);

  useEffect(() => {
    window.localStorage.setItem(SAVINGS_TARGET_STORAGE_KEY, String(monthlySavingsTarget));
  }, [monthlySavingsTarget]);

  useEffect(() => {
    window.localStorage.setItem(FINANCIAL_AGE_STORAGE_KEY, String(financialAge));
  }, [financialAge]);

  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
    window.localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    if (!auth) {
      return undefined;
    }

    void getRedirectResult(auth)
      .then(async (credential) => {
        const pendingName = sessionStorage.getItem("moneyfollows-pending-display-name");
        if (credential?.user) {
          if (pendingName && credential.user.displayName !== pendingName) {
            await updateProfile(credential.user, { displayName: pendingName });
          }
          saveLastAuthedProfile(credential.user);
          setFallbackProfile(null);
          setAuthUser(credential.user);
        }
        sessionStorage.removeItem("moneyfollows-pending-display-name");
      })
      .catch((error: unknown) => {
        sessionStorage.removeItem("moneyfollows-pending-display-name");
        setAuthError(getAuthMessage(error));
      });

    return onAuthStateChanged(auth, (nextUser) => {
      setAuthUser(nextUser);
      if (nextUser) {
        saveLastAuthedProfile(nextUser);
        setFallbackProfile(null);
      }
      setAuthLoading(false);
      setAuthError("");
    });
  }, []);

  useEffect(() => {
    if (!authLoading) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setFallbackProfile(loadLastAuthedProfile());
      setAuthLoading(false);
      setAuthError("MoneyFollows could not restore the login session. Refresh once, then log in again if needed.");
    }, 8000);

    return () => window.clearTimeout(timer);
  }, [authLoading]);

  const userProfile = useMemo<UserProfile | null>(() => {
    if (!authUser) {
      return fallbackProfile;
    }

    const providerId = authUser.providerData[0]?.providerId;
    const provider: AuthProvider = providerId === "google.com"
      ? "Google"
      : "Email";

    return {
      email: authUser.email ?? undefined,
      name: authUser.displayName || authUser.email?.split("@")[0] || "MoneyFollows user",
      photoURL: authUser.photoURL ?? undefined,
      provider
    };
  }, [authUser, fallbackProfile]);
  const effectiveProfile = userProfile ?? { name: "Guest", provider: "Local" as const };

  const monthEntries = useMemo(
    () => entries.filter((entry) => sameMonth(entry.date, selectedDate)),
    [entries, selectedDate]
  );

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return monthEntries.filter((entry) => {
      const matchesSearch = !normalizedQuery || [entry.category, entry.note, entry.description, entry.foodPlace, entry.foodSource, entry.account]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
      const matchesIncome = entry.kind !== "income" || selectedIncome.length === 0 || selectedIncome.includes(entry.category);
      const matchesExpenses = entry.kind !== "expense" || selectedExpenses.length === 0 || selectedExpenses.includes(entry.category);
      const matchesAccount = selectedAccounts.length === 0 || selectedAccounts.includes(entry.account) || Boolean(entry.toAccount && selectedAccounts.includes(entry.toAccount));
      return matchesSearch && matchesIncome && matchesExpenses && matchesAccount;
    });
  }, [monthEntries, query, selectedAccounts, selectedExpenses, selectedIncome]);

  const totals = useMemo(() => {
    const income = filteredEntries.filter((entry) => entry.kind === "income").reduce((sum, entry) => sum + entry.amount, 0);
    const expenses = filteredEntries.filter((entry) => entry.kind === "expense").reduce((sum, entry) => sum + entry.amount, 0);
    const transfers = filteredEntries.filter((entry) => entry.kind === "transfer").reduce((sum, entry) => sum + entry.amount, 0);
    return { expenses, income, total: income - expenses, transfers };
  }, [filteredEntries]);
  const netBalance = openingBalance + totals.total;

  const dayEntries = filteredEntries.filter((entry) => entry.date === toDateKey(selectedDate));
  const calendarDays = buildCalendar(selectedDate);
  const weeks = getWeeks(selectedDate);
  const currentCategories = kind === "income" ? incomeCategories : expenseCategories;
  const visibleCategories = currentCategories.filter((item) => item.name.toLowerCase().includes(categorySearch.trim().toLowerCase()));
  const hasMerchantDetails = kind === "expense" && (category === "Food" || category === "Groceries");
  const merchantSourceOptions = category === "Groceries" ? grocerySources : foodSources;
  const dailySpend = dayEntries.filter((entry) => entry.kind === "expense").reduce((sum, entry) => sum + entry.amount, 0);
  const upiSpend = filteredEntries.filter((entry) => entry.kind === "expense" && entry.account === "UPI").reduce((sum, entry) => sum + entry.amount, 0);
  const randomSpendCount = filteredEntries.filter((entry) => entry.kind === "expense" && entry.amount <= 500).length;

  const updateKind = (nextKind: EntryKind) => {
    setKind(nextKind);
    setCategory(nextKind === "income" ? "Salary" : nextKind === "expense" ? "Food" : "Transfer");
    setFoodPlace("");
    setFoodSource("Dine-in");
    setCategorySearch("");
    setSplitEnabled(false);
    setFormError("");
  };

  const updateCategory = (nextCategory: string) => {
    setCategory(nextCategory);
    if (nextCategory === "Food") {
      setFoodSource("Dine-in");
    } else if (nextCategory === "Groceries") {
      setFoodSource("Local store");
    } else {
      setFoodPlace("");
      setFoodSource("Dine-in");
    }
  };

  const resetComposer = () => {
    setAmount("");
    setCategory(kind === "income" ? "Salary" : kind === "expense" ? "Food" : "Transfer");
    setAccount("UPI");
    setToAccount("Bank");
    setNote("");
    setDescription("");
    setFoodPlace("");
    setFoodSource("Dine-in");
    setImageUrl("");
    setTagText("");
    setCategorySearch("");
    setSplitEnabled(false);
    setSplitPeople("");
    setSplitPaidBy("");
    setFormError("");
  };

  const handleImageUpload = (file: File | undefined) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFormError("Choose an image file for the product or bill.");
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        setImageUrl(reader.result);
        setFormError("");
      }
    });
    reader.readAsDataURL(file);
  };

  const saveEntry = (continueAfterSave: boolean) => {
    const parsedAmount = parseAmount(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormError("Enter an amount greater than 0.");
      return;
    }

    if (kind === "transfer" && account === toAccount) {
      setFormError("Choose two different accounts for a transfer.");
      return;
    }

    const nextEntry: LedgerEntry = {
      account,
      amount: parsedAmount,
      category: kind === "transfer" ? "Transfer" : category,
      createdAt: new Date().toISOString(),
      date: toDateKey(selectedDate),
      description: description.trim(),
      foodPlace: hasMerchantDetails ? foodPlace.trim() || undefined : undefined,
      foodSource: hasMerchantDetails ? foodSource : undefined,
      id: Date.now(),
      imageUrl: imageUrl.trim() || undefined,
      kind,
      note: note.trim() || `${kind === "transfer" ? "Transfer" : category} ${kind}`,
      splitPaidBy: kind === "expense" && splitEnabled ? splitPaidBy.trim() || account : undefined,
      splitPeople: kind === "expense" && splitEnabled ? splitPeople.split(",").map((person) => person.trim()).filter(Boolean) : undefined,
      tags: tagText.split(",").map((tag) => tag.trim()).filter(Boolean),
      toAccount: kind === "transfer" ? toAccount : undefined
    };

    setEntries((current) => [nextEntry, ...current]);
    resetComposer();

    if (!continueAfterSave) {
      setShowComposer(false);
    }
  };

  const saveReminder = (reminder: Omit<Reminder, "createdAt" | "id">) => {
    setReminders((current) => [{ ...reminder, createdAt: new Date().toISOString(), id: Date.now() }, ...current]);
  };

  const saveBudget = (budget: Omit<BudgetItem, "createdAt" | "id">) => {
    setBudgets((current) => [{ ...budget, createdAt: new Date().toISOString(), id: Date.now() }, ...current]);
  };

  const saveGoal = (goal: Omit<GoalItem, "createdAt" | "id">) => {
    setGoals((current) => [{ ...goal, createdAt: new Date().toISOString(), id: Date.now() }, ...current]);
  };

  const saveDebt = (debt: Omit<DebtItem, "createdAt" | "id">) => {
    setDebts((current) => [{ ...debt, createdAt: new Date().toISOString(), id: Date.now() }, ...current]);
  };

  const exportBackup = () => {
    const backup = {
      budgets,
      currencyCode,
      debts,
      entries,
      exportedAt: new Date().toISOString(),
      goals,
      monthlySavingsTarget,
      openingBalance,
      reminders,
      version: 1
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `moneyfollows-backup-${toDateKey(new Date())}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (file: File | undefined) => {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        const data = JSON.parse(String(reader.result || "{}")) as Record<string, unknown>;
        if (Array.isArray(data.entries)) setEntries(data.entries.map(normalizeEntry).filter((item): item is LedgerEntry => Boolean(item)));
        if (Array.isArray(data.reminders)) setReminders(data.reminders.map(normalizeReminder).filter((item): item is Reminder => Boolean(item)));
        if (Array.isArray(data.budgets)) setBudgets(data.budgets.map(normalizeBudget).filter((item): item is BudgetItem => Boolean(item)));
        if (Array.isArray(data.goals)) setGoals(data.goals.map(normalizeGoal).filter((item): item is GoalItem => Boolean(item)));
        if (Array.isArray(data.debts)) setDebts(data.debts.map(normalizeDebt).filter((item): item is DebtItem => Boolean(item)));
        if (typeof data.currencyCode === "string" && currencyOptions.some((option) => option.code === data.currencyCode)) setCurrencyCode(data.currencyCode);
        if (typeof data.openingBalance === "number") setOpeningBalance(data.openingBalance);
        if (typeof data.monthlySavingsTarget === "number") setMonthlySavingsTarget(data.monthlySavingsTarget);
      } catch {
        setFormError("That backup file could not be imported.");
      }
    });
    reader.readAsText(file);
  };

  const applySetupBasics = (name: string, currency: CurrencyCode, balance: number, savingsTarget: number, wantsReminder: boolean) => {
    const cleanName = name.trim() || "MoneyFollows user";
    const safeTarget = Number.isFinite(savingsTarget) && savingsTarget > 0 ? savingsTarget : 10000;
    setCurrencyCode(currency);
    setOpeningBalance(Number.isFinite(balance) ? balance : 0);
    setMonthlySavingsTarget(safeTarget);

    if (wantsReminder && reminders.length === 0) {
      saveReminder({
        account: "UPI",
        amount: Math.max(1, Math.round(safeTarget / 10)),
        autoAdd: false,
        category: "Food",
        date: toDateKey(new Date()),
        frequency: "Daily",
        kind: "expense",
        name: `${cleanName}'s daily money check`,
        time: "21:00"
      });
    }
  };

  const completeSetup = (name: string, currency: CurrencyCode, balance: number, savingsTarget: number, wantsReminder: boolean) => {
    const localProfile: UserProfile = { name: name.trim() || "MoneyFollows user", provider: "Local" };
    setFallbackProfile(localProfile);
    applySetupBasics(name, currency, balance, savingsTarget, wantsReminder);
    window.localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(localProfile));
    window.localStorage.setItem(SETUP_STORAGE_KEY, "done");
    setShowAuth(false);
  };

  const changeMonth = (direction: number) => {
    setSelectedDate((current) => new Date(current.getFullYear(), current.getMonth() + direction, Math.min(current.getDate(), 28)));
  };

  const focusSearch = () => {
    searchInputRef.current?.focus();
    searchInputRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const toggleFilter = (value: string, selected: string[], setSelected: (next: string[]) => void) => {
    setSelected(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  };

  const exportCsv = () => {
    const rows = [
      ["Date", "Type", "Amount", "Category", "Account", "To Account", "Note", "Description", "Place / Store", "Source / App", "Image", "Tags"],
      ...filteredEntries.map((entry) => [
        entry.date,
        entry.kind,
        String(entry.amount),
        entry.category,
        entry.account,
        entry.toAccount ?? "",
        entry.note,
        entry.description,
        entry.foodPlace ?? "",
        entry.foodSource ?? "",
        entry.imageUrl ?? "",
        entry.tags.join(" | ")
      ])
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `moneyfollows-${monthLabel(selectedDate).replace(" ", "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleEmailAuth = async (mode: "login" | "signup", name: string, email: string, password: string, currency: CurrencyCode, balance: number, savingsTarget: number, wantsReminder: boolean) => {
    if (!auth) {
      setAuthError("Firebase is not configured yet. Add the Vercel environment variables first.");
      return;
    }

    try {
      setAuthError("");
      await prepareAuthPersistence();
      const credential = mode === "signup"
        ? await createUserWithEmailAndPassword(auth, email, password)
        : await signInWithEmailAndPassword(auth, email, password);

      if (name.trim() && credential.user.displayName !== name.trim()) {
        await updateProfile(credential.user, { displayName: name.trim() });
      }
      applySetupBasics(name, currency, balance, savingsTarget, wantsReminder);
      saveLastAuthedProfile(credential.user);
      window.localStorage.setItem(SETUP_STORAGE_KEY, "done");
      setFallbackProfile(null);
      setAuthUser(credential.user);
      setShowAuth(false);
    } catch (error) {
      setAuthError(getAuthMessage(error));
    }
  };

  const handleProviderAuth = async (providerName: Exclude<AuthProvider, "Email" | "Local">, name: string, currency: CurrencyCode, balance: number, savingsTarget: number, wantsReminder: boolean) => {
    if (!auth) {
      setAuthError("Firebase is not configured yet. Add the Vercel environment variables first.");
      return;
    }

    try {
      setAuthError("");
      await prepareAuthPersistence();
      const credential = await signInWithPopup(auth, authProviders[providerName]());
      if (name.trim() && credential.user.displayName !== name.trim()) {
        await updateProfile(credential.user, { displayName: name.trim() });
      }
      applySetupBasics(name, currency, balance, savingsTarget, wantsReminder);
      saveLastAuthedProfile(credential.user);
      window.localStorage.setItem(SETUP_STORAGE_KEY, "done");
      setFallbackProfile(null);
      setAuthUser(credential.user);
      setShowAuth(false);
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request") {
        sessionStorage.setItem("moneyfollows-pending-display-name", name.trim());
        await prepareAuthPersistence();
        await signInWithRedirect(auth, authProviders[providerName]());
        return;
      }

      setAuthError(getAuthMessage(error));
    }
  };

  const handleSignOut = async () => {
    if (!auth) {
      setAuthUser(null);
      setFallbackProfile(null);
      window.localStorage.removeItem(LAST_AUTHED_PROFILE_KEY);
      setShowAuth(false);
      return;
    }

    await signOut(auth);
    setFallbackProfile(null);
    window.localStorage.removeItem(LAST_AUTHED_PROFILE_KEY);
    setShowAccount(false);
    setShowAuth(false);
  };

  const handleSaveAccount = async (name: string, photoURL: string) => {
    const cleanName = name.trim() || "MoneyFollows user";
    const cleanPhoto = photoURL.trim();

    if (authUser) {
      await updateProfile(authUser, { displayName: cleanName, photoURL: cleanPhoto || null });
      window.localStorage.setItem(LAST_AUTHED_PROFILE_KEY, JSON.stringify({
        email: authUser.email,
        name: cleanName,
        photoURL: cleanPhoto || undefined,
        provider: authUser.providerData[0]?.providerId === "google.com" ? "Google" : "Email",
        uid: authUser.uid
      }));
      setAuthUser({ ...authUser, displayName: cleanName, photoURL: cleanPhoto || null } as User);
      return;
    }

    const localProfile: UserProfile = { email: effectiveProfile.email, name: cleanName, photoURL: cleanPhoto || undefined, provider: "Local" };
    setFallbackProfile(localProfile);
    window.localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(localProfile));
  };

  const handleDeleteAccount = async () => {
    if (!authUser) {
      throw new Error("Sign in first to delete a Firebase account. Guest mode has no online account to delete.");
    }

    await deleteUser(authUser);
    setAuthUser(null);
    setFallbackProfile(null);
    setEntries([]);
    setReminders([]);
    setBudgets([]);
    setGoals([]);
    setDebts([]);
    setOpeningBalance(0);
    window.localStorage.removeItem(LAST_AUTHED_PROFILE_KEY);
    window.localStorage.removeItem(LOCAL_PROFILE_KEY);
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(REMINDERS_STORAGE_KEY);
    window.localStorage.removeItem(BUDGETS_STORAGE_KEY);
    window.localStorage.removeItem(GOALS_STORAGE_KEY);
    window.localStorage.removeItem(DEBTS_STORAGE_KEY);
    window.localStorage.removeItem(BALANCE_STORAGE_KEY);
    window.localStorage.removeItem(SAVINGS_TARGET_STORAGE_KEY);
    setShowAccount(false);
  };

  return (
    <MoneyContext.Provider value={money}>
    <main className="app-page">
      <section className="money-workspace" aria-label="MoneyFollows money management app">
        <nav className="bottom-nav" aria-label="Main app sections">
          <div className="rail-logo">
            <img alt="MoneyFollows" src="/moneyfollows-icon-192.png" />
          </div>
          {bottomTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                className={bottomTab === tab.key ? "active" : ""}
                key={tab.key}
                onClick={() => setBottomTab(tab.key)}
                type="button"
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.96 }}
              >
                <Icon size={23} />
                <span>{tab.label}</span>
                {bottomTab === tab.key && <motion.i className="rail-active" layoutId="rail-active" transition={spring} />}
              </motion.button>
            );
          })}
        </nav>

        <motion.header className="app-header" initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <div className="brand-row">
            <div className="brand-copy">
              <span>MoneyFollows</span>
              <strong>{totals.total >= 0 ? `Hi ${effectiveProfile.name}, your money is behaving.` : `Hi ${effectiveProfile.name}, your money needs direction.`}</strong>
            </div>
            <div className="brand-actions">
              <button className="theme-toggle" type="button" aria-label="Toggle dark mode" onClick={() => setIsDark((current) => !current)}>
                {isDark ? <Sun size={19} /> : <Moon size={19} />}
                <span>{isDark ? "Light mode" : "Dark mode"}</span>
              </button>
              <button type="button" aria-label="Open account" onClick={() => setShowAccount(true)}>
                {effectiveProfile.photoURL ? <img alt="" className="mini-avatar" src={effectiveProfile.photoURL} /> : <UserRound size={22} />}
              </button>
            </div>
          </div>
          <div className="month-row">
            <button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)}>
              <ChevronLeft size={25} />
            </button>
            <button className="month-button" type="button" onClick={() => setSelectedDate(new Date())}>
              {activeView === "monthly" ? yearLabel(selectedDate) : monthLabel(selectedDate)}
            </button>
            <button type="button" aria-label="Next month" onClick={() => changeMonth(1)}>
              <ChevronRight size={25} />
            </button>
            <span className="header-spacer" />
            <button type="button" aria-label="Open AI coach" onClick={() => setShowCoach(true)}><Bot size={25} /></button>
            <button type="button" aria-label="Search" onClick={focusSearch}><Search size={25} /></button>
          </div>

          <div className="search-row">
            <Search size={16} />
            <input ref={searchInputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search entries, accounts, stores" />
            <button type="button" aria-label="Open filters" onClick={() => setShowFilter(true)}><Settings2 size={16} /></button>
          </div>

          <motion.section className="hero-ledger" layout whileHover={{ y: -3 }} transition={spring}>
            <div>
              <span>Monthly Flow</span>
              <strong>{money(netBalance)}</strong>
              <p>{totals.income > 0 || totals.expenses > 0 ? `${money(totals.income)} in, ${money(totals.expenses)} out` : "Set an opening balance, then add real money events."}</p>
            </div>
            <motion.button
              onClick={() => setShowComposer(true)}
              type="button"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={20} />
              Log money
            </motion.button>
          </motion.section>

          <nav className="view-tabs" aria-label="Transaction views">
            {viewTabs.map((tab) => (
              <motion.button
                className={activeView === tab.key ? "active" : ""}
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveView(tab.key);
                  setBottomTab("trans");
                }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                {tab.label}
                {activeView === tab.key && <motion.i className="tab-active" layoutId="tab-active" transition={spring} />}
              </motion.button>
            ))}
          </nav>

          <Summary totals={totals} />
          <MoneyCoach dailySpend={dailySpend} randomSpendCount={randomSpendCount} totals={totals} upiSpend={upiSpend} />
        </motion.header>

        <AnimatePresence mode="wait">
          <motion.section
            animate={{ opacity: 1, x: 0 }}
            className="content-panel"
            exit={{ opacity: 0, x: -16 }}
            initial={{ opacity: 0, x: 16 }}
            key={`${bottomTab}-${activeView}-${selectedDate.getFullYear()}-${selectedDate.getMonth()}`}
            transition={{ duration: 0.22 }}
          >
            {bottomTab === "home" && (
              <HomeView
                onAddEntry={() => setShowComposer(true)}
                onOpenAccount={() => setShowAccount(true)}
                onOpenCalendar={() => {
                  setBottomTab("trans");
                  setActiveView("calendar");
                }}
                onOpenCoach={() => setShowCoach(true)}
                onOpenLedger={() => {
                  setBottomTab("trans");
                  setActiveView("daily");
                }}
                onOpenStats={() => setBottomTab("stats")}
                onOpenWalletTools={() => setBottomTab("accounts")}
                onOpenWallets={() => setBottomTab("accounts")}
                onSavingsTargetChange={setMonthlySavingsTarget}
                entries={entries}
                budgets={budgets}
                debts={debts}
                goals={goals}
                openingBalance={openingBalance}
                savingsTarget={monthlySavingsTarget}
                profile={effectiveProfile}
                totals={totals}
              />
            )}
            {bottomTab === "trans" && activeView === "daily" && (
              <DailyView date={selectedDate} entries={dayEntries} onDelete={(id) => setEntries((current) => current.filter((entry) => entry.id !== id))} />
            )}
            {bottomTab === "trans" && activeView === "calendar" && (
              <CalendarView days={calendarDays} entries={filteredEntries} selectedDate={selectedDate} onSelect={setSelectedDate} />
            )}
            {bottomTab === "trans" && activeView === "monthly" && (
              <MonthlyView date={selectedDate} entries={filteredEntries} weeks={weeks} />
            )}
            {bottomTab === "trans" && activeView === "total" && (
              <TotalView date={selectedDate} entries={filteredEntries} totals={totals} onBudgetSetting={() => setShowFilter(true)} onExport={exportCsv} />
            )}
            {bottomTab === "stats" && (
              <StatsView
                budgets={budgets}
                debts={debts}
                entries={filteredEntries}
                financialAge={financialAge}
                goals={goals}
                onFinancialAgeChange={setFinancialAge}
                openingBalance={openingBalance}
                reminders={reminders}
                savingsTarget={monthlySavingsTarget}
                totals={totals}
              />
            )}
            {bottomTab === "accounts" && (
              <>
                <AccountsView budgets={budgets} debts={debts} entries={filteredEntries} goals={goals} />
                <MoreView
                budgets={budgets}
                currencyCode={currencyCode}
                debts={debts}
                goals={goals}
                openingBalance={openingBalance}
                onAddBudget={saveBudget}
                onAddDebt={saveDebt}
                onAddGoal={saveGoal}
                onAddReminder={saveReminder}
                onCurrencyChange={setCurrencyCode}
                onDeleteBudget={(id) => setBudgets((current) => current.filter((budget) => budget.id !== id))}
                onDeleteDebt={(id) => setDebts((current) => current.filter((debt) => debt.id !== id))}
                onDeleteGoal={(id) => setGoals((current) => current.filter((goal) => goal.id !== id))}
                onDeleteReminder={(id) => setReminders((current) => current.filter((reminder) => reminder.id !== id))}
                onOpeningBalanceChange={setOpeningBalance}
                onOpenCoach={() => setShowCoach(true)}
                reminders={reminders}
                />
              </>
            )}
            {bottomTab === "settings" && (
              <SettingsView
                currencyCode={currencyCode}
                isDark={isDark}
                onBackup={exportBackup}
                onClear={() => setEntries([])}
                onCurrencyChange={setCurrencyCode}
                onImport={importBackup}
                onOpenAccount={() => setShowAccount(true)}
                onTheme={() => setIsDark((current) => !current)}
                profile={effectiveProfile}
              />
            )}
          </motion.section>
        </AnimatePresence>

        <motion.button
          aria-label="Add transaction"
          className="fab"
          onClick={() => setShowComposer(true)}
          type="button"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
        >
          <Plus size={34} />
          <span>Log money</span>
        </motion.button>
      </section>

      <AnimatePresence>
        {showAuth && (
          <WelcomeGate
            authError={authError}
            authLoading={authLoading}
            currencyCode={currencyCode}
            isConfigured={isFirebaseConfigured}
            openingBalance={openingBalance}
            onClose={() => {
              window.localStorage.setItem(SETUP_STORAGE_KEY, "done");
              setShowAuth(false);
            }}
            onEmailAuth={handleEmailAuth}
            onProviderAuth={handleProviderAuth}
            onSetupComplete={completeSetup}
          />
        )}
        {showAccount && (
          <AccountPage
            authUser={authUser}
            onClose={() => setShowAccount(false)}
            onDeleteAccount={handleDeleteAccount}
            onSave={handleSaveAccount}
            onSignIn={() => {
              setShowAccount(false);
              setShowAuth(true);
            }}
            onSignOut={handleSignOut}
            profile={effectiveProfile}
          />
        )}
        {showCoach && (
          <CoachPanel
            budgets={budgets}
            debts={debts}
            entries={entries}
            goals={goals}
            onAddBudget={saveBudget}
            onAddGoal={saveGoal}
            onAddReminder={saveReminder}
            onClose={() => setShowCoach(false)}
            onOpenWalletTools={() => {
              setShowCoach(false);
              setBottomTab("accounts");
            }}
            reminders={reminders}
            savingsTarget={monthlySavingsTarget}
            totals={totals}
          />
        )}
        {showComposer && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.section
              animate={{ y: 0 }}
              className="composer-sheet"
              exit={{ y: "100%" }}
              initial={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
            >
              <header className="sheet-header">
                <button type="button" aria-label="Close entry form" onClick={() => setShowComposer(false)}><ArrowLeft size={24} /></button>
                <strong>{kind === "income" ? "Income" : kind === "expense" ? "Expense" : "Transfer"}</strong>
                <button type="button" aria-label="Show help" onClick={() => setShowHelp(true)}><CircleHelp size={22} /></button>
              </header>

              <div className="kind-switch">
                {(["income", "expense", "transfer"] as EntryKind[]).map((item) => (
                  <motion.button className={kind === item ? "active" : ""} key={item} type="button" onClick={() => updateKind(item)} whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
                    {item}
                    {kind === item && <motion.i layoutId="kind-active" transition={spring} />}
                  </motion.button>
                ))}
              </div>

              <div className="form-grid">
                <label>
                  Date
                <input type="date" value={toDateKey(selectedDate)} onChange={(event) => setSelectedDate(fromDateKey(event.target.value))} />
                </label>
                <label>
                  Amount
                  <input
                    inputMode="decimal"
                    value={amount}
                    onChange={(event) => {
                      setAmount(event.target.value);
                      setFormError("");
                    }}
                    placeholder="Type amount"
                  />
                </label>

                {kind !== "transfer" ? (
                  <label className="wide">
                    Category
                    <input
                      className="category-search"
                      value={categorySearch}
                      onChange={(event) => setCategorySearch(event.target.value)}
                      placeholder="Search category"
                    />
                    <select value={category} onChange={(event) => updateCategory(event.target.value)}>
                      {(visibleCategories.length ? visibleCategories : currentCategories).map((item) => <option key={item.name} value={item.name}>{item.emoji} {item.name}</option>)}
                    </select>
                  </label>
                ) : (
                  <label className="wide muted-field">
                    Category
                    <input value="Transfer between accounts" readOnly />
                  </label>
                )}

                <label>
                  {kind === "transfer" ? "From" : "Account"}
                  <select value={account} onChange={(event) => setAccount(event.target.value)}>
                    {accounts.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>

                {kind === "transfer" && (
                  <label>
                    To
                    <select value={toAccount} onChange={(event) => setToAccount(event.target.value)}>
                      {accounts.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                )}

                {hasMerchantDetails && (
                  <>
                    <label className="wide food-detail">
                      {category === "Groceries" ? "Store or service" : "Restaurant or place"}
                      <input
                        value={foodPlace}
                        onChange={(event) => setFoodPlace(event.target.value)}
                        placeholder={category === "Groceries" ? "Kirane wala, supermarket, app store" : "Restaurant, cafe, home kitchen, street stall"}
                      />
                    </label>
                    <label>
                      {category === "Groceries" ? "Bought from" : "Ordered from"}
                      <select value={foodSource} onChange={(event) => setFoodSource(event.target.value)}>
                        {merchantSourceOptions.map((source) => <option key={source}>{source}</option>)}
                      </select>
                    </label>
                  </>
                )}

                {kind === "expense" && (
                  <section className="wide split-box">
                    <label className="toggle-row">
                      <input checked={splitEnabled} type="checkbox" onChange={(event) => setSplitEnabled(event.target.checked)} />
                      Split this expense
                    </label>
                    {splitEnabled && (
                      <div>
                        <label>
                          Paid by
                          <input value={splitPaidBy} onChange={(event) => setSplitPaidBy(event.target.value)} placeholder={account} />
                        </label>
                        <label>
                          People
                          <input value={splitPeople} onChange={(event) => setSplitPeople(event.target.value)} placeholder="Siddhant, Ravi, Aman" />
                        </label>
                      </div>
                    )}
                  </section>
                )}

                <label className="wide">
                  Note
                  <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Short note" />
                </label>
                <label className="wide">
                  Description
                  <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" />
                  <Camera className="field-icon" size={19} />
                </label>
                <label className="wide image-field">
                  Product or bill image
                  <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="Paste an image URL" />
                </label>
                <div className="image-tools">
                  <label>
                    <Camera size={18} />
                    Upload image
                    <input accept="image/*" type="file" onChange={(event) => handleImageUpload(event.target.files?.[0])} />
                  </label>
                  {imageUrl && (
                    <button type="button" onClick={() => setImageUrl("")}>
                      Remove image
                    </button>
                  )}
                </div>
                {imageUrl && <img className="image-preview" alt="Selected product or bill" src={imageUrl} />}
                <label className="wide">
                  Tags
                  <input value={tagText} onChange={(event) => setTagText(event.target.value)} placeholder="comma separated tags" />
                  <Tag className="field-icon" size={18} />
                </label>
              </div>

              {formError && <p className="form-error">{formError}</p>}

              <div className="sheet-actions">
                <button type="button" onClick={() => saveEntry(false)}>Save</button>
                <button type="button" onClick={() => saveEntry(true)}>Continue</button>
              </div>

            </motion.section>

            <AnimatePresence>
              {showHelp && (
                <motion.div className="help-card" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}>
                  <h2>{kind === "transfer" ? "Transfer" : kind === "income" ? "Income" : "Expense"}</h2>
                  <p>
                    {kind === "transfer"
                      ? "Use Transfer when money moves between your own accounts. It does not count as income or spending."
                      : kind === "income"
                        ? "Use Income for salary, allowance, bonuses, refunds, or any money received."
                        : "Use Expense for money you actually spent. Pick the category and account yourself."}
                  </p>
                  <button type="button" onClick={() => setShowHelp(false)}>Close</button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFilter && (
          <motion.div className="filter-panel" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 260 }}>
            <header>
              <button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)}><ChevronLeft size={24} /></button>
              <strong>{monthLabel(selectedDate)}</strong>
              <button type="button" aria-label="Next month" onClick={() => changeMonth(1)}><ChevronRight size={24} /></button>
              <button className="close-filter" type="button" aria-label="Close filters" onClick={() => setShowFilter(false)}><X size={26} /></button>
            </header>
            <p>Shape the month by category, wallet, or money direction.</p>
            <div className="filter-rings">
              <Ring label="Income" amount={totals.income} color="#2f82dc" percent={totals.income + totals.expenses ? Math.round((totals.income / (totals.income + totals.expenses)) * 100) : 0} />
              <Ring label="Expenses" amount={totals.expenses} color="#a64043" percent={totals.income + totals.expenses ? Math.round((totals.expenses / (totals.income + totals.expenses)) * 100) : 0} />
              <div className="filter-total"><span>Total</span><strong>{money(totals.total)}</strong></div>
            </div>
            <nav className="filter-tabs">
              {(["income", "expenses", "account"] as FilterTab[]).map((tab) => (
                <button className={filterTab === tab ? "active" : ""} key={tab} type="button" onClick={() => setFilterTab(tab)}>{tab}</button>
              ))}
            </nav>
            <div className="filter-list">
              {filterTab === "income" && (
                <Checklist items={incomeCategories.map((item) => item.name)} selected={selectedIncome} onSelectAll={setSelectedIncome} onToggle={(item) => toggleFilter(item, selectedIncome, setSelectedIncome)} />
              )}
              {filterTab === "expenses" && (
                <Checklist items={expenseCategories.map((item) => item.name)} selected={selectedExpenses} onSelectAll={setSelectedExpenses} onToggle={(item) => toggleFilter(item, selectedExpenses, setSelectedExpenses)} />
              )}
              {filterTab === "account" && (
                <Checklist items={accounts} selected={selectedAccounts} onSelectAll={setSelectedAccounts} onToggle={(item) => toggleFilter(item, selectedAccounts, setSelectedAccounts)} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
    </MoneyContext.Provider>
  );
}

function WelcomeGate({
  authError,
  authLoading,
  currencyCode,
  isConfigured,
  openingBalance,
  onClose,
  onEmailAuth,
  onProviderAuth,
  onSetupComplete
}: {
  authError: string;
  authLoading: boolean;
  currencyCode: CurrencyCode;
  isConfigured: boolean;
  openingBalance: number;
  onClose: () => void;
  onEmailAuth: (mode: "login" | "signup", name: string, email: string, password: string, currency: CurrencyCode, openingBalance: number, savingsTarget: number, wantsReminder: boolean) => Promise<void>;
  onProviderAuth: (provider: Exclude<AuthProvider, "Email" | "Local">, name: string, currency: CurrencyCode, openingBalance: number, savingsTarget: number, wantsReminder: boolean) => Promise<void>;
  onSetupComplete: (name: string, currency: CurrencyCode, openingBalance: number, savingsTarget: number, wantsReminder: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [busyProvider, setBusyProvider] = useState<AuthProvider | "form" | null>(null);
  const [error, setError] = useState("");
  const [setupCurrency, setSetupCurrency] = useState<CurrencyCode>(currencyCode);
  const [setupBalance, setSetupBalance] = useState(openingBalance ? String(openingBalance) : "");
  const [setupTarget, setSetupTarget] = useState("10000");
  const [setupReminder, setSetupReminder] = useState(true);
  const cleanName = name.trim();
  const parsedBalance = parseAmount(setupBalance || "0") || 0;
  const parsedTarget = parseAmount(setupTarget || "0") || 10000;

  const continueSetup = () => {
    if (!cleanName) {
      setError("Add your name first so MoneyFollows can personalize the app.");
      return;
    }

    setError("");
    setStep((current) => Math.min(current + 1, 4));
  };

  const enterDashboard = () => {
    if (!cleanName) {
      setStep(0);
      setError("Add your name first so MoneyFollows can personalize the app.");
      return;
    }

    setError("");
    onSetupComplete(cleanName, setupCurrency, parsedBalance, parsedTarget, setupReminder);
  };

  const runEmailAuth = async () => {
    const cleanEmail = email.trim();

    if (!cleanName && mode === "signup") {
      setError("Add your name first so MoneyFollows can personalize the app.");
      return;
    }

    if (!cleanEmail || !password) {
      setError("Enter your email and password.");
      return;
    }

    setError("");
    setBusyProvider("form");
    await onEmailAuth(mode, cleanName, cleanEmail, password, setupCurrency, parsedBalance, parsedTarget, setupReminder);
    setBusyProvider(null);
  };

  const runProviderAuth = async (provider: Exclude<AuthProvider, "Email" | "Local">) => {
    const cleanName = name.trim();
    if (!cleanName) {
      setError("Add your name first so MoneyFollows can personalize the app.");
      return;
    }

    setError("");
    setBusyProvider(provider);
    await onProviderAuth(provider, cleanName, setupCurrency, parsedBalance, parsedTarget, setupReminder);
    setBusyProvider(null);
  };

  return (
    <main className="welcome-gate">
      <button className="auth-close" type="button" onClick={onClose} aria-label="Close sign in"><X size={22} /></button>
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="welcome-panel"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.42 }}
      >
        <div className="welcome-copy">
          <span><Sparkles size={16} /> MoneyFollows</span>
          <h1>Build a clearer relationship with your money.</h1>
          <p>Answer a few setup questions first. Then track income, expenses, reminders, wallets, and monthly patterns from a dashboard made for daily use.</p>
          <div className="welcome-metrics" aria-label="MoneyFollows setup highlights">
            <span><b>160+</b> currencies</span>
            <span><b>0</b> fake entries</span>
            <span><b>Private</b> local-first</span>
          </div>
          <div className="welcome-feature-strip" aria-label="Setup preview">
            <span><b>01</b> Track real income and expenses</span>
            <span><b>02</b> Set budgets and saving goals</span>
            <span><b>03</b> Back up, restore and get reminders</span>
          </div>
        </div>

        <motion.div className="welcome-meme" whileHover={{ y: -3 }} transition={spring}>
          <img alt="MoneyFollows meme motivation" src="/ravi-kishan-money-follows.png" />
          <div>
            <strong>MoneyFollows reminder</strong>
            <small>Track what matters, keep the rest calm.</small>
          </div>
        </motion.div>

        <form className="welcome-form setup-flow" onSubmit={(event) => {
          event.preventDefault();
          void runEmailAuth();
        }}>
          <div className="auth-heading">
            <span>Step {step + 1} of 5</span>
            <strong>{step === 0 ? "What should we call you?" : step === 1 ? "Set your money basics" : step === 2 ? "Pick a savings target" : step === 3 ? "Daily reminder preference" : mode === "signup" ? "Save your dashboard" : "Log in to MoneyFollows"}</strong>
            <p>{step === 0 ? "Your name appears in the dashboard and account page." : step === 1 ? "Choose your default currency and optional opening balance." : step === 2 ? "This creates the monthly target slider on your home screen." : step === 3 ? "MoneyFollows can prepare a gentle daily check-in reminder." : "Create an account, log in, or continue locally for now."}</p>
          </div>
          <div className="setup-progress" aria-label="Setup progress">
            {[0, 1, 2, 3, 4].map((item) => <span className={item <= step ? "active" : ""} key={item} />)}
          </div>
          {step === 0 && (
            <div className="setup-step">
              <label>
                Your name
                <span>
                  <UserRound size={18} />
                  <input
                    autoFocus
                    maxLength={32}
                    onChange={(event) => {
                      setName(event.target.value);
                      setError("");
                    }}
                    placeholder="Type your name"
                    value={name}
                  />
                </span>
              </label>
              <div className="welcome-actions">
                <motion.button type="button" onClick={continueSetup} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  Continue
                </motion.button>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="setup-step">
              <label>
                Default currency
                <span>
                  <WalletCards size={18} />
                  <select value={setupCurrency} onChange={(event) => setSetupCurrency(event.target.value as CurrencyCode)}>
                    {currencyOptions.map((option) => (
                      <option key={option.code} value={option.code}>{option.symbol} {option.label} ({option.code})</option>
                    ))}
                  </select>
                </span>
              </label>
              <label>
                Opening balance
                <span>
                  <Landmark size={18} />
                  <input
                    inputMode="decimal"
                    onChange={(event) => setSetupBalance(event.target.value)}
                    placeholder="0"
                    value={setupBalance}
                  />
                </span>
              </label>
              <p className="setup-hint">This can be zero. You can edit currency and balance later in Wallets.</p>
              <div className="welcome-actions">
                <motion.button type="button" onClick={continueSetup} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  Next
                </motion.button>
                <button type="button" onClick={() => setStep(0)}>Back</button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="setup-step">
              <label>
                Monthly saving target
                <span>
                  <WalletCards size={18} />
                  <input
                    inputMode="decimal"
                    onChange={(event) => setSetupTarget(event.target.value)}
                    placeholder="10000"
                    value={setupTarget}
                  />
                </span>
              </label>
              <p className="setup-hint">You can change this later from the home screen target slider.</p>
              <div className="welcome-actions">
                <motion.button type="button" onClick={continueSetup} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  Next
                </motion.button>
                <button type="button" onClick={() => setStep(1)}>Back</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="setup-step">
              <div className="setup-question-card">
                <span>⏰</span>
                <div>
                  <strong>Ask me to record transactions daily</strong>
                  <p>A reminder will appear in Wallets. Browser notifications can be allowed later in Settings.</p>
                </div>
                <button className={setupReminder ? "active" : ""} type="button" onClick={() => setSetupReminder((current) => !current)}>{setupReminder ? "On" : "Off"}</button>
              </div>
              <div className="setup-question-card">
                <span>🎯</span>
                <div>
                  <strong>Show planning widgets</strong>
                  <p>Your goals, budgets and health score stay visible in Home and Insight.</p>
                </div>
                <button className="active" type="button">On</button>
              </div>
              <div className="welcome-actions">
                <motion.button type="button" onClick={continueSetup} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  Continue
                </motion.button>
                <button type="button" onClick={() => setStep(2)}>Back</button>
              </div>
            </div>
          )}
          {step === 4 && (
            <>
          <div className="auth-mode">
            <button className={mode === "signup" ? "active" : ""} type="button" onClick={() => {
              setMode("signup");
              setError("");
            }}>Sign up</button>
            <button className={mode === "login" ? "active" : ""} type="button" onClick={() => {
              setMode("login");
              setError("");
            }}>Log in</button>
          </div>
          <label>
            Email
            <span>
              <ShieldCheck size={18} />
              <input
                autoComplete="email"
                inputMode="email"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                placeholder="you@example.com"
                type="email"
                value={email}
              />
            </span>
          </label>
          <label>
            Password
            <span>
              <ShieldCheck size={18} />
              <input
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                minLength={6}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="At least 6 characters"
                type="password"
                value={password}
              />
            </span>
          </label>

          <div className="auth-grid" aria-label="Login and signup options">
            {(["Google"] as Array<Exclude<AuthProvider, "Email" | "Local">>).map((provider) => (
              <motion.button
                className={busyProvider === provider ? "active" : ""}
                disabled={Boolean(busyProvider) || authLoading || !isConfigured}
                key={provider}
                onClick={() => {
                  void runProviderAuth(provider);
                }}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <b>G</b>
                <span>{busyProvider === provider ? "Connecting..." : `Continue with ${provider}`}</span>
              </motion.button>
            ))}
          </div>

          {!isConfigured && (
            <p className="auth-warning">Firebase is not configured yet. Add the Vercel environment variables from `.env.example` to make live auth work.</p>
          )}
          {(error || authError) && <p className="form-error">{error || authError}</p>}

          <div className="welcome-actions">
            <motion.button disabled={Boolean(busyProvider) || authLoading || !isConfigured} type="submit" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <ShieldCheck size={18} />
              {busyProvider === "form" ? "Checking..." : mode === "signup" ? "Create account" : "Log in"}
            </motion.button>
            <button type="button" onClick={enterDashboard}>Continue locally</button>
            <button type="button" onClick={() => setStep(3)}>Back</button>
          </div>
            </>
          )}
          {step !== 4 && (error || authError) && <p className="form-error">{error || authError}</p>}
        </form>
      </motion.section>
    </main>
  );
}

function Summary({ totals }: { totals: { income: number; expenses: number; total: number } }) {
  const money = useMoney();
  return (
    <div className="summary-row">
      <motion.span whileHover={{ y: -3 }} transition={spring}>Income <b className="income-text">{money(totals.income)}</b></motion.span>
      <motion.span whileHover={{ y: -3 }} transition={spring}>Expenses <b className="expense-text">{money(totals.expenses)}</b></motion.span>
      <motion.span whileHover={{ y: -3 }} transition={spring}>Total <b>{money(totals.total)}</b></motion.span>
    </div>
  );
}

function HomeView({
  budgets,
  debts,
  entries,
  goals,
  onAddEntry,
  onOpenAccount,
  onOpenCalendar,
  onOpenCoach,
  onOpenLedger,
  onOpenStats,
  onOpenWalletTools,
  onOpenWallets,
  onSavingsTargetChange,
  openingBalance,
  profile,
  savingsTarget,
  totals
}: {
  budgets: BudgetItem[];
  debts: DebtItem[];
  entries: LedgerEntry[];
  goals: GoalItem[];
  onAddEntry: () => void;
  onOpenAccount: () => void;
  onOpenCalendar: () => void;
  onOpenCoach: () => void;
  onOpenLedger: () => void;
  onOpenStats: () => void;
  onOpenWalletTools: () => void;
  onOpenWallets: () => void;
  onSavingsTargetChange: (value: number) => void;
  openingBalance: number;
  profile: UserProfile;
  savingsTarget: number;
  totals: { income: number; expenses: number; total: number };
}) {
  const money = useMoney();
  const chartData = useMemo(() => buildMonthlyChart(entries), [entries]);
  const maxChartValue = Math.max(...chartData.flatMap((item) => [item.income, item.expenses, Math.max(item.savings, 0)]), savingsTarget, 1);
  const totalBalance = openingBalance + totals.total;
  const realSavings = Math.max(0, totals.income - totals.expenses);
  const savingsProgress = savingsTarget > 0 ? Math.min(100, Math.max(0, Math.round((realSavings / savingsTarget) * 100))) : 0;
  const targetGap = Math.max(0, savingsTarget - realSavings);
  const healthScore = Math.max(0, Math.min(100, Math.round(46 + (totals.income > 0 ? (realSavings / totals.income) * 42 : 0) - (totals.expenses > totals.income && totals.income > 0 ? 20 : 0) + (entries.length > 4 ? 8 : 0))));
  const recentEntries = useMemo(
    () => [...entries].sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt)).slice(0, 5),
    [entries]
  );
  const categoryBreakdown = useMemo(() => {
    const totalsByCategory = entries
      .filter((entry) => entry.kind === "expense")
      .reduce<Record<string, number>>((groups, entry) => {
        groups[entry.category] = (groups[entry.category] || 0) + entry.amount;
        return groups;
      }, {});

    return Object.entries(totalsByCategory)
      .map(([name, amount]) => ({ amount, name }))
      .sort((first, second) => second.amount - first.amount)
      .slice(0, 5);
  }, [entries]);
  const maxCategoryAmount = Math.max(...categoryBreakdown.map((category) => category.amount), 1);
  const receivableTotal = debts.filter((debt) => debt.kind === "receivable").reduce((sum, debt) => sum + debt.amount, 0);
  const payableTotal = debts.filter((debt) => debt.kind === "payable").reduce((sum, debt) => sum + debt.amount, 0);
  const activeBudget = budgets[0];
  const activeBudgetSpent = activeBudget
    ? entries.filter((entry) => entry.kind === "expense" && entry.category === activeBudget.category).reduce((sum, entry) => sum + entry.amount, 0)
    : 0;
  const budgetLeft = activeBudget ? Math.max(0, activeBudget.amount - activeBudgetSpent) : 0;
  const goalProgress = goals[0] ? Math.min(100, Math.max(0, Math.round((realSavings / goals[0].amount) * 100))) : 0;
  const metricCards = [
    { icon: WalletCards, label: "Total balance", tone: "violet", value: money(totalBalance), detail: `${money(openingBalance)} opening + ${money(totals.total)} net` },
    { icon: Landmark, label: "Income", tone: "green", value: money(totals.income), detail: entries.length ? "Logged by you this month" : "Add income to begin" },
    { icon: ReceiptText, label: "Expenses", tone: "coral", value: money(totals.expenses), detail: entries.length ? "Only your real entries" : "No expenses added yet" },
    { icon: BarChart3, label: "Savings", tone: "gold", value: money(realSavings), detail: savingsTarget ? `${savingsProgress}% of target` : "Set a monthly target" }
  ];
  const shortcutCards = [
    { action: onAddEntry, label: "Log money", meta: "Income, expense, transfer", value: "Add", icon: Plus },
    { action: onOpenLedger, label: "Activity", meta: "Search and review entries", value: `${entries.length}`, icon: ReceiptText },
    { action: onOpenWalletTools, label: "Wallet tools", meta: "Budgets, goals, reminders", value: `${budgets.length + goals.length}`, icon: WalletCards },
    { action: onOpenCoach, label: "AI coach", meta: "Ask saving questions", value: "Ask", icon: Bot }
  ];
  const features = [
    { action: onAddEntry, icon: ReceiptText, label: "Fast transaction logging", text: "Record amount, account, category, merchant context, note, and attachment without sample data." },
    { action: onOpenWalletTools, icon: WalletCards, label: "Wallet planning", text: "Budgets, goals, borrowed money, recurring reminders, and quick setup live together." },
    { action: onOpenStats, icon: BarChart3, label: "Readable insights", text: "Financial health, category movement, six-month flow, and target progress stay visible." },
    { action: onOpenAccount, icon: ShieldCheck, label: "Account control", text: "Edit your profile image, review sign-in status, sign out, or manage your account." }
  ];
  const entryTitle = (entry: LedgerEntry) => entry.note || entry.foodPlace || entry.foodSource || entry.category;
  const entryMeta = (entry: LedgerEntry) => {
    const place = [entry.foodPlace, entry.foodSource].filter(Boolean).join(" via ");
    return [entry.category, place, entry.account, entry.toAccount ? `to ${entry.toAccount}` : ""].filter(Boolean).join(" · ");
  };

  return (
    <div className="home-view">
      <section className="home-shell">
        <div className="home-main-column">
          <section className="home-command-bar" aria-label="MoneyFollows home controls">
            <div className="home-brand-lockup">
              <img alt="MoneyFollows piggy logo" src="/moneyfollows-piggy-logo.png" />
              <div>
                <strong>MoneyFollows</strong>
                <span>{profile.name === "Guest" ? "Guest workspace" : `Welcome back, ${profile.name}`}</span>
              </div>
            </div>
            <nav aria-label="Dashboard shortcuts">
              <button type="button" className="active" onClick={onOpenLedger}>Dashboard</button>
              <button type="button" onClick={onOpenWalletTools}>Wallet</button>
              <button type="button" onClick={onOpenStats}>Insights</button>
              <button type="button" onClick={onOpenCoach}>AI Coach</button>
            </nav>
            <div className="home-toolbar">
              <button type="button" aria-label="Open ledger" onClick={onOpenLedger}><Search size={18} /></button>
              <button type="button" aria-label="Open account" onClick={onOpenAccount}>
                {profile.photoURL ? <img alt={`${profile.name} profile`} src={profile.photoURL} /> : <UserRound size={18} />}
              </button>
            </div>
          </section>

          <section className="home-hero-panel">
            <div>
              <h1>{profile.name === "Guest" ? "A real dashboard for the money you actually log." : `${profile.name}, here is your real money picture.`}</h1>
              <p>Track income, expenses, goals, reminders, and borrowed money without sample transactions or fake balances.</p>
            </div>
            <div className="home-actions">
              <button type="button" onClick={onAddEntry}><Plus size={18} /> Add income or expense</button>
              <button type="button" onClick={onOpenCalendar}><ReceiptText size={18} /> Calendar map</button>
            </div>
          </section>

          <section className="home-metric-strip" aria-label="Financial summary">
            {metricCards.map((card) => {
              const Icon = card.icon;
              return (
                <motion.button
                  className={`home-metric-card ${card.tone}`}
                  key={card.label}
                  type="button"
                  onClick={card.label === "Expenses" ? onOpenLedger : card.label === "Savings" ? onOpenWalletTools : onOpenStats}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  transition={spring}
                >
                  <span>{card.label}</span>
                  <Icon size={22} />
                  <strong>{card.value}</strong>
                  <small>{card.detail}</small>
                </motion.button>
              );
            })}
          </section>

          <section className="home-analytics-grid">
            <button className="animated-chart-card balance-trend-panel" type="button" onClick={onOpenStats}>
              <div className="chart-title">
                <div>
                  <span>Balance trend</span>
                  <strong>Six-month money flow</strong>
                </div>
                <small>{entries.length ? "Live from your entries" : "Waiting for entries"}</small>
              </div>
              <div className="flow-chart" aria-label="Animated income expense and savings chart">
                {chartData.map((item, index) => (
                  <motion.div
                    className="flow-chart-month"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: index * 0.04 }}
                    key={item.label}
                  >
                    <div className="flow-bars">
                      <motion.i
                        className="income-bar"
                        initial={{ height: 8 }}
                        animate={{ height: `${Math.max(8, (item.income / maxChartValue) * 100)}%` }}
                        transition={{ ...spring, delay: index * 0.05 }}
                      />
                      <motion.i
                        className="expense-bar"
                        initial={{ height: 8 }}
                        animate={{ height: `${Math.max(8, (item.expenses / maxChartValue) * 100)}%` }}
                        transition={{ ...spring, delay: 0.08 + index * 0.05 }}
                      />
                      <motion.i
                        className="saving-bar"
                        initial={{ height: 8 }}
                        animate={{ height: `${Math.max(8, (Math.max(item.savings, 0) / maxChartValue) * 100)}%` }}
                        transition={{ ...spring, delay: 0.16 + index * 0.05 }}
                      />
                    </div>
                    <b>{item.label}</b>
                  </motion.div>
                ))}
              </div>
              <div className="chart-legend">
                <span><i className="income-dot" /> Income</span>
                <span><i className="expense-dot" /> Expense</span>
                <span><i className="saving-dot" /> Saving</span>
              </div>
            </button>

            <section className="home-cashflow-panel">
              <div className="chart-title">
                <div>
                  <span>Cash flow</span>
                  <strong>This month</strong>
                </div>
              </div>
              <button type="button" onClick={onOpenLedger}>
                <strong>{money(totals.income)}</strong>
                <span>Income</span>
              </button>
              <button type="button" onClick={onOpenLedger}>
                <strong>{money(totals.expenses)}</strong>
                <span>Expenses</span>
              </button>
              <button type="button" onClick={onOpenWalletTools}>
                <strong>{money(realSavings)}</strong>
                <span>Savings</span>
              </button>
            </section>

            <section className="home-growth-panel">
              <div className="chart-title">
                <div>
                  <span>Financial growth</span>
                  <strong>Target progress</strong>
                </div>
                <small>{money(realSavings)} / {money(savingsTarget)}</small>
              </div>
              <div className="growth-track">
                <span style={{ width: `${savingsProgress}%` }} />
                <b>{savingsProgress}%</b>
              </div>
              <label>
                Monthly target
                <input
                  min="1000"
                  max="500000"
                  step="500"
                  type="range"
                  value={savingsTarget}
                  onChange={(event) => onSavingsTargetChange(Number(event.target.value))}
                />
              </label>
              <p>{targetGap > 0 ? `${money(targetGap)} left to reach this month’s target.` : "Target reached from your logged money."}</p>
            </section>
          </section>

          <section className="home-lower-grid">
            <section className="home-history-panel">
              <div className="panel-heading-row">
                <div>
                  <span>Transaction history</span>
                  <strong>Recent activity</strong>
                </div>
                <button type="button" onClick={onOpenLedger}>View all</button>
              </div>
              {recentEntries.length ? (
                <div className="home-transaction-list">
                  {recentEntries.map((entry) => (
                    <button type="button" key={entry.id} onClick={onOpenLedger}>
                      {entry.imageUrl ? (
                        <img className="home-transaction-image" alt={`${entryTitle(entry)} attachment`} src={entry.imageUrl} />
                      ) : (
                        <i className="home-transaction-icon" style={{ "--tone": categoryTone(entry.category) } as CSSProperties}>{categoryEmoji(entry.category, entry.kind)}</i>
                      )}
                      <span>
                        <strong>{entryTitle(entry)}</strong>
                        <small>{entryMeta(entry)}</small>
                      </span>
                      <b className={entry.kind === "income" ? "income-text" : entry.kind === "expense" ? "expense-text" : ""}>
                        {entry.kind === "income" ? "+" : entry.kind === "expense" ? "-" : ""}{money(entry.amount)}
                      </b>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="home-empty-panel">
                  <ReceiptText size={28} />
                  <strong>No real transactions yet</strong>
                  <p>Add your first income or expense to fill this area.</p>
                  <button type="button" onClick={onAddEntry}>Add entry</button>
                </div>
              )}
            </section>

            <section className="home-category-panel">
              <div className="panel-heading-row">
                <div>
                  <span>Spending breakdown</span>
                  <strong>Category movement</strong>
                </div>
                <button type="button" onClick={onOpenStats}>Insights</button>
              </div>
              {categoryBreakdown.length ? (
                <div className="category-movement-list">
                  {categoryBreakdown.map((category) => (
                    <button type="button" key={category.name} onClick={onOpenStats}>
                      <i style={{ "--tone": categoryTone(category.name) } as CSSProperties}>{categoryEmoji(category.name, "expense")}</i>
                      <span>
                        <b>{category.name}</b>
                        <small style={{ width: `${Math.max(8, (category.amount / maxCategoryAmount) * 100)}%` }} />
                      </span>
                      <strong>{money(category.amount)}</strong>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="home-empty-panel compact">
                  <BarChart3 size={24} />
                  <strong>No spending categories yet</strong>
                  <p>Category charts appear after you add expenses.</p>
                </div>
              )}
            </section>
          </section>
        </div>

        <aside className="home-side-column" aria-label="MoneyFollows side dashboard">
          <section className="wallet-card-preview">
            <div className="wallet-card-art">
              <span>MoneyFollows</span>
              <strong>{money(totalBalance)}</strong>
              <small>Total balance</small>
            </div>
            <div className="wallet-card-mini-grid">
              <button type="button" onClick={onOpenWalletTools}>
                <span>Budget</span>
                <strong>{activeBudget ? money(budgetLeft) : "Not set"}</strong>
              </button>
              <button type="button" onClick={onOpenWalletTools}>
                <span>Goal</span>
                <strong>{goals[0] ? `${goalProgress}%` : "None"}</strong>
              </button>
            </div>
            <button type="button" className="wallet-manage-button" onClick={onOpenWallets}>Manage wallets</button>
          </section>

          <section className="health-score-card">
            <button type="button" onClick={onOpenStats}>
              <div>
                <span>Finance score</span>
                <strong>{entries.length ? `${healthScore}/100` : "No score yet"}</strong>
                <p>{entries.length ? "Calculated from logged income, expenses, target progress, and consistency." : "Record transactions to generate your score."}</p>
              </div>
              <i style={{ "--score": `${entries.length ? healthScore : 0}%` } as CSSProperties}><b>{entries.length ? healthScore : 0}</b></i>
            </button>
          </section>

          <section className="home-shortcut-grid">
            {shortcutCards.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button key={item.label} type="button" onClick={item.action} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} transition={spring}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <small>{item.meta}</small>
                </motion.button>
              );
            })}
          </section>

          <section className="home-debt-panel">
            <div>
              <span>You will get</span>
              <strong className="income-text">{money(receivableTotal)}</strong>
            </div>
            <div>
              <span>You will give</span>
              <strong className="expense-text">{money(payableTotal)}</strong>
            </div>
          </section>
        </aside>
      </section>

      <section className="about-section">
        <div>
          <span>About MoneyFollows</span>
          <h2>Built for daily money decisions, not sample dashboards.</h2>
          <p>Every number on this home screen comes from your own setup, transactions, targets, budgets, goals, and wallet tools.</p>
        </div>
        <div className="about-grid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.button key={feature.label} type="button" onClick={feature.action} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }} transition={spring}>
                <Icon size={20} />
                <strong>{feature.label}</strong>
                <p>{feature.text}</p>
              </motion.button>
            );
          })}
        </div>
      </section>

      <section className="platform-section">
        <span>Responsive app</span>
        <div>
          <b>Windows</b>
          <b>macOS</b>
          <b>Android</b>
          <b>iOS</b>
          <b>Every modern browser</b>
        </div>
      </section>
    </div>
  );
}

function AccountPage({
  authUser,
  onClose,
  onDeleteAccount,
  onSave,
  onSignIn,
  onSignOut,
  profile
}: {
  authUser: User | null;
  onClose: () => void;
  onDeleteAccount: () => Promise<void>;
  onSave: (name: string, photoURL: string) => Promise<void>;
  onSignIn: () => void;
  onSignOut: () => void;
  profile: UserProfile;
}) {
  const [name, setName] = useState(profile.name);
  const [photoURL, setPhotoURL] = useState(profile.photoURL || "");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const readImage = (file: File) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setPhotoURL(String(reader.result || ""));
      setStatus("Preview ready. Save changes to keep this image.");
    });
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setBusy(true);
    setStatus("");
    try {
      await onSave(name, photoURL);
      setStatus("Account updated.");
    } catch (error) {
      setStatus(getAuthMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("Delete this MoneyFollows account? This also clears local MoneyFollows data on this browser.")) {
      return;
    }

    setBusy(true);
    setStatus("");
    try {
      await onDeleteAccount();
    } catch (error) {
      setStatus(getAuthMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div className="account-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.section className="account-page" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={spring}>
        <header>
          <div>
            <span>About account</span>
            <strong>Your MoneyFollows profile</strong>
          </div>
          <button type="button" aria-label="Close account page" onClick={onClose}><X size={22} /></button>
        </header>

        <div className="account-profile-panel">
          <div className="account-avatar">
            {photoURL ? <img alt={`${profile.name} profile`} src={photoURL} /> : <span>{name.slice(0, 1).toUpperCase() || "M"}</span>}
          </div>
          <div>
            <small>{profile.provider === "Local" ? "Guest profile" : `${profile.provider} account`}</small>
            <strong>{profile.name}</strong>
            <p>{profile.email || "No email connected yet"}</p>
          </div>
        </div>

        <div className="account-info-grid">
          <span><b>Name</b>{profile.name}</span>
          <span><b>Email</b>{profile.email || "Not signed in"}</span>
          <span><b>Provider</b>{profile.provider}</span>
          <span><b>Created</b>{authUser?.metadata.creationTime || "Local guest session"}</span>
        </div>

        <div className="account-edit-card">
          <label>
            Display name
            <input value={name} maxLength={36} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            Image URL
            <input value={photoURL} onChange={(event) => setPhotoURL(event.target.value)} placeholder="Paste an image URL or upload below" />
          </label>
          <label className="file-picker">
            <Camera size={18} />
            Upload image
            <input accept="image/*" type="file" onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                readImage(file);
              }
            }} />
          </label>
          {status && <p className="account-status">{status}</p>}
          <button type="button" disabled={busy} onClick={save}><ShieldCheck size={18} /> Save account</button>
        </div>

        <div className="account-danger">
          {authUser ? (
            <>
              <button type="button" disabled={busy} onClick={onSignOut}>Sign out</button>
              <button type="button" disabled={busy} onClick={deleteAccount}><Trash2 size={18} /> Delete account</button>
            </>
          ) : (
            <button type="button" onClick={onSignIn}><UserRound size={18} /> Sign in to manage online account</button>
          )}
        </div>
      </motion.section>
    </motion.div>
  );
}

function MoneyCoach({
  dailySpend,
  randomSpendCount,
  totals,
  upiSpend
}: {
  dailySpend: number;
  randomSpendCount: number;
  totals: { income: number; expenses: number; total: number };
  upiSpend: number;
}) {
  const money = useMoney();
  const burnRate = totals.income > 0 ? Math.round((totals.expenses / totals.income) * 100) : 0;

  return (
    <motion.section className="money-coach" layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
      <div>
        <span>Daily reality check</span>
        <strong>{dailySpend > 0 ? `${money(dailySpend)} spent today` : "No spend logged today"}</strong>
        <p>{totals.income > 0 ? `${burnRate}% of this month’s income is already used.` : "Add income once, then every spend gets context."}</p>
      </div>
      <div>
        <span>Random spend radar</span>
        <strong>{randomSpendCount}</strong>
        <p>Small purchases under {money(500)} tracked this month.</p>
      </div>
      <div>
        <span>UPI pulse</span>
        <strong>{money(upiSpend)}</strong>
        <p>UPI spending stays visible instead of vanishing silently.</p>
      </div>
      <div>
        <span>Privacy mode</span>
        <strong>Local-first</strong>
        <p>No bank linking required. Your entries stay in this browser.</p>
      </div>
    </motion.section>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="empty-state">
      <ClipboardList size={28} />
      <strong>Nothing logged yet.</strong>
      <span>{label}</span>
    </div>
  );
}

function EntryRow({ entry, onDelete }: { entry: LedgerEntry; onDelete?: (id: number) => void }) {
  const money = useMoney();
  return (
    <motion.article className="entry-row" layout initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: -16 }} whileHover={{ x: 4, borderColor: "rgba(255, 255, 255, 0.22)" }} transition={spring}>
      {entry.imageUrl ? (
        <img className="entry-thumb" alt={`${entry.note || entry.category} visual`} src={entry.imageUrl} />
      ) : (
        <span className="entry-emoji" style={{ "--tone": categoryTone(entry.category) } as CSSProperties}>
          {categoryEmoji(entry.category, entry.kind)}
        </span>
      )}
      <div>
        <strong>{categoryEmoji(entry.category, entry.kind)} {entry.note || entry.category}</strong>
        <span>
          {entry.category} · {entry.account}{entry.toAccount ? ` -> ${entry.toAccount}` : ""}
          {(entry.category === "Food" || entry.category === "Groceries") && (entry.foodPlace || entry.foodSource) ? ` · ${[entry.foodPlace, entry.foodSource].filter(Boolean).join(" via ")}` : ""}
          {entry.splitPeople?.length ? ` · Split with ${entry.splitPeople.join(", ")}` : ""}
        </span>
      </div>
      <b className={entry.kind === "income" ? "income-text" : entry.kind === "expense" ? "expense-text" : ""}>
        {entry.kind === "income" ? "+" : entry.kind === "expense" ? "-" : ""}{money(entry.amount)}
      </b>
      {onDelete && (
        <button type="button" aria-label="Delete entry" onClick={() => onDelete(entry.id)}>
          <Trash2 size={16} />
        </button>
      )}
    </motion.article>
  );
}

function DailyView({ date, entries, onDelete }: { date: Date; entries: LedgerEntry[]; onDelete: (id: number) => void }) {
  const entriesWithImages = entries.filter((entry) => entry.imageUrl);

  return (
    <div className="view-stack">
      <div className="section-heading">
        <span>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date)}</span>
        <strong>Daily entries</strong>
      </div>
      {entriesWithImages.length > 0 && <AttachmentStrip entries={entriesWithImages} />}
      {entries.length === 0 ? <EmptyState label="Nothing logged for this day." /> : (
        <AnimatePresence initial={false}>
          {entries.map((entry) => <EntryRow entry={entry} key={entry.id} onDelete={onDelete} />)}
        </AnimatePresence>
      )}
    </div>
  );
}

function AttachmentStrip({ entries }: { entries: LedgerEntry[] }) {
  return (
    <section className="attachment-strip" aria-label="Product and bill images">
      <div>
        <span>Proof board</span>
        <strong>Images you attached today</strong>
      </div>
      <div className="attachment-images">
        {entries.slice(0, 5).map((entry) => (
          <motion.img
            alt={`${entry.note || entry.category} attachment`}
            key={entry.id}
            src={entry.imageUrl}
            whileHover={{ y: -5, rotate: -1, scale: 1.04 }}
            transition={spring}
          />
        ))}
      </div>
    </section>
  );
}

function CalendarView({ days, entries, selectedDate, onSelect }: { days: Date[]; entries: LedgerEntry[]; selectedDate: Date; onSelect: (date: Date) => void }) {
  const money = useMoney();
  return (
    <div className="calendar-view">
      <div className="weekday-row">{weekdays.map((day) => <span key={day}>{day}</span>)}</div>
      <div className="calendar-grid">
        {days.map((day) => {
          const dateKey = toDateKey(day);
          const dayEntries = entries.filter((entry) => entry.date === dateKey);
          const income = dayEntries.filter((entry) => entry.kind === "income").reduce((sum, entry) => sum + entry.amount, 0);
          const expenses = dayEntries.filter((entry) => entry.kind === "expense").reduce((sum, entry) => sum + entry.amount, 0);
          const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
          const isSelected = dateKey === toDateKey(selectedDate);
          return (
            <button className={`${isCurrentMonth ? "" : "outside"} ${isSelected ? "selected" : ""}`} key={dateKey} type="button" onClick={() => onSelect(day)}>
              <span>{day.getDate()}</span>
              {(income > 0 || expenses > 0) && (
                <span className="calendar-dots" aria-hidden="true">
                  {income > 0 && <b className="income-dot" />}
                  {expenses > 0 && <b className="expense-dot" />}
                </span>
              )}
              {income > 0 && <small className="income-text">+{money(income)}</small>}
              {expenses > 0 && <small className="expense-text">-{money(expenses)}</small>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MonthlyView({ date, entries, weeks }: { date: Date; entries: LedgerEntry[]; weeks: Array<{ start: Date; end: Date; label: string }> }) {
  const monthNames = Array.from({ length: 12 }, (_, index) => new Date(date.getFullYear(), 11 - index, 1));
  return (
    <div className="monthly-list">
      <div className="month-section">
        <strong>{new Intl.DateTimeFormat("en-US", { month: "short" }).format(date)}</strong>
        <span>01.{String(date.getMonth() + 1).padStart(2, "0")} ~ {new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()}.{String(date.getMonth() + 1).padStart(2, "0")}</span>
      </div>
      {weeks.map((week) => {
        const inWeek = entries.filter((entry) => {
          const parsed = fromDateKey(entry.date);
          return parsed >= week.start && parsed <= week.end;
        });
        const income = inWeek.filter((entry) => entry.kind === "income").reduce((sum, entry) => sum + entry.amount, 0);
        const expenses = inWeek.filter((entry) => entry.kind === "expense").reduce((sum, entry) => sum + entry.amount, 0);
        return <TotalLine key={week.label} label={week.label} income={income} expenses={expenses} />;
      })}
      {monthNames.slice(1).map((month) => (
        <TotalLine key={month.toISOString()} label={new Intl.DateTimeFormat("en-US", { month: "short" }).format(month)} income={0} expenses={0} />
      ))}
    </div>
  );
}

function TotalLine({ label, income, expenses }: { label: string; income: number; expenses: number }) {
  const money = useMoney();
  return (
    <div className="total-line">
      <strong>{label}</strong>
      <span className="income-text">{money(income)}</span>
      <span className="expense-text">{money(expenses)} <small>Total {money(income - expenses)}</small></span>
    </div>
  );
}

function TotalView({
  date,
  entries,
  totals,
  onBudgetSetting,
  onExport
}: {
  date: Date;
  entries: LedgerEntry[];
  totals: { income: number; expenses: number; total: number; transfers: number };
  onBudgetSetting: () => void;
  onExport: () => void;
}) {
  const money = useMoney();
  const cashExpense = entries.filter((entry) => entry.kind === "expense" && entry.account !== "Card").reduce((sum, entry) => sum + entry.amount, 0);
  const cardExpense = entries.filter((entry) => entry.kind === "expense" && entry.account === "Card").reduce((sum, entry) => sum + entry.amount, 0);
  return (
    <div className="view-stack">
      <section className="budget-card">
        <div><BriefcaseBusiness size={28} /><strong>Budget</strong></div>
        <button type="button" onClick={onBudgetSetting}>Budget Setting <ChevronRight size={18} /></button>
      </section>
      <section className="accounts-card">
        <header>
          <div><Landmark size={28} /><strong>Accounts</strong></div>
          <span>01.{String(date.getMonth() + 1).padStart(2, "0")}.{date.getFullYear()} ~ {new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()}.{String(date.getMonth() + 1).padStart(2, "0")}</span>
        </header>
        <div className="account-summary">
          <span>Compared Expenses (Last month) <b>{totals.expenses > 0 ? "100%" : "0%"}</b></span>
          <span>Expenses (Cash, Accounts) <b>{money(cashExpense)}</b></span>
          <span>Expenses (Card) <b>{money(cardExpense)}</b></span>
          <span>Transfer (Cash, Accounts) <b>{money(totals.transfers)}</b></span>
        </div>
        <button className="export-button" type="button" onClick={onExport}><Download size={22} /> Export data to Excel</button>
      </section>
    </div>
  );
}

function StatsView({
  budgets,
  debts,
  entries,
  financialAge,
  goals,
  onFinancialAgeChange,
  openingBalance,
  reminders,
  savingsTarget,
  totals
}: {
  budgets: BudgetItem[];
  debts: DebtItem[];
  entries: LedgerEntry[];
  financialAge: number;
  goals: GoalItem[];
  onFinancialAgeChange: (age: number) => void;
  openingBalance: number;
  reminders: Reminder[];
  savingsTarget: number;
  totals: { income: number; expenses: number; total: number };
}) {
  const money = useMoney();
  const [scoreMonth] = useState(() => new Date());
  const expenseByCategory = expenseCategories.map((category) => ({
    ...category,
    spent: entries.filter((entry) => entry.kind === "expense" && entry.category === category.name).reduce((sum, entry) => sum + entry.amount, 0)
  })).filter((category) => category.spent > 0);
  const max = Math.max(...expenseByCategory.map((category) => category.spent), 1);
  const receivableTotal = debts.filter((debt) => debt.kind === "receivable").reduce((sum, debt) => sum + debt.amount, 0);
  const payableTotal = debts.filter((debt) => debt.kind === "payable").reduce((sum, debt) => sum + debt.amount, 0);
  const topGoal = goals[0];
  const goalProgress = topGoal ? Math.min(100, Math.max(0, (Math.max(totals.total, 0) / topGoal.amount) * 100)) : 0;
  const chartData = buildMonthlyChart(entries);
  const liquidAssets = Math.max(0, openingBalance + totals.total + receivableTotal - payableTotal);
  const savingsRate = totals.income > 0 ? Math.max(0, ((totals.income - totals.expenses) / totals.income) * 100) : 0;
  const monthlyBurn = totals.expenses;
  const runwayMonths = monthlyBurn > 0 ? liquidAssets / monthlyBurn : liquidAssets > 0 ? 12 : 0;
  const budgetAllocated = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const budgetSpent = budgets.reduce((sum, budget) => sum + entries.filter((entry) => entry.kind === "expense" && entry.category === budget.category).reduce((entrySum, entry) => entrySum + entry.amount, 0), 0);
  const cashScore = entries.length ? Math.min(25, Math.round(savingsRate / 4)) : 0;
  const budgetScore = budgets.length ? Math.max(0, Math.min(20, Math.round((budgetAllocated > 0 ? Math.max(0, 1 - budgetSpent / budgetAllocated) : 0.2) * 20))) : 0;
  const debtScore = entries.length || debts.length || openingBalance > 0 ? Math.max(0, Math.min(20, Math.round((1 - Math.min(1, payableTotal / Math.max(liquidAssets + receivableTotal, 1))) * 20))) : 0;
  const runwayScore = Math.min(20, Math.round((Math.min(runwayMonths, 6) / 6) * 20));
  const planningScore = Math.min(15, goals.length * 6 + reminders.length * 3 + (savingsTarget > 0 ? 3 : 0));
  const healthScore = Math.max(0, Math.min(100, cashScore + budgetScore + debtScore + runwayScore + planningScore));
  const pillars = [
    { label: "Cash flow and savings", score: cashScore, total: 25, detail: `${money(totals.income)} in · ${money(totals.expenses)} out · ${savingsRate.toFixed(1)}% saved` },
    { label: "Budget discipline", score: budgetScore, total: 20, detail: `${budgets.length} budgets · ${money(budgetAllocated)} allocated · ${money(budgetSpent)} spent` },
    { label: "Debt and liabilities", score: debtScore, total: 20, detail: `Get ${money(receivableTotal)} · Give ${money(payableTotal)}` },
    { label: "Emergency runway", score: runwayScore, total: 20, detail: `${runwayMonths.toFixed(1)} months using current monthly expense` },
    { label: "Goals and planning", score: planningScore, total: 15, detail: `${goals.length} goals · ${reminders.length} reminders · target ${money(savingsTarget)}` }
  ];
  return (
    <div className="view-stack stats-view">
      <section className="financial-health-panel">
        <header>
          <div>
            <span>Financial health score</span>
            <strong>{monthLabel(scoreMonth)}</strong>
          </div>
          <label>
            Age
            <select value={financialAge} onChange={(event) => onFinancialAgeChange(Number(event.target.value))}>
              {Array.from({ length: 58 }, (_, index) => index + 18).map((age) => <option key={age} value={age}>{age} years old</option>)}
            </select>
          </label>
        </header>
        <div className="score-hero">
          <i style={{ "--score": `${healthScore}%` } as CSSProperties}><b>{healthScore}</b><span>/100</span></i>
          <div>
            <strong>{healthScore > 70 ? "Strong money rhythm" : healthScore > 35 ? "Building a cleaner month" : "Start with real entries"}</strong>
            <p>{entries.length ? "Score uses your income, expenses, budgets, debts, runway, goals and reminders." : "Record income and 5-10 real expenses to make this score useful."}</p>
          </div>
        </div>
        <div className="health-mini-grid">
          <article><span>Savings rate</span><strong>{savingsRate.toFixed(1)}%</strong></article>
          <article><span>Runway</span><strong>{runwayMonths.toFixed(1)} mo</strong></article>
          <article><span>Net worth</span><strong>{money(liquidAssets)}</strong></article>
          <article><span>Age</span><strong>{financialAge}</strong></article>
        </div>
        <div className="pillar-stack">
          {pillars.map((pillar) => (
            <article key={pillar.label}>
              <div>
                <strong>{pillar.label}</strong>
                <span>{pillar.score} / {pillar.total}</span>
              </div>
              <p>{pillar.detail}</p>
              <i><b style={{ width: `${Math.max(5, (pillar.score / pillar.total) * 100)}%` }} /></i>
            </article>
          ))}
        </div>
        <div className="trajectory-card">
          <strong>6-month score trajectory</strong>
          <div>
            {chartData.map((point) => (
              <span key={point.label}>
                <b style={{ height: `${Math.max(8, Math.min(100, (Math.max(point.savings, 0) / Math.max(savingsTarget, 1)) * 100))}%` }} />
                <small>{point.label}</small>
              </span>
            ))}
          </div>
        </div>
      </section>
      <div className="stats-card">
        <span>Monthly balance</span>
        <strong>{money(totals.total)}</strong>
        <p>{money(totals.income)} income · {money(totals.expenses)} expenses</p>
      </div>
      <section className="insight-planning-card">
        <header>
          <div>
            <span>Planning insight</span>
            <strong>Goals, budgets and reminders</strong>
          </div>
          <small>{goals.length + budgets.length + reminders.length + debts.length} active items</small>
        </header>
        <div className="insight-plan-grid">
          <article>
            <span>Next goal</span>
            <strong>{topGoal ? money(topGoal.amount) : money(0)}</strong>
            <p>{topGoal ? `${topGoal.name} · target ${topGoal.targetDate}` : "Add a saving goal from Wallets or AI Chat."}</p>
            {topGoal && <i><b style={{ width: `${Math.max(6, goalProgress)}%` }} /></i>}
          </article>
          <article>
            <span>Budgets</span>
            <strong>{budgets.length}</strong>
            <p>{budgets[0] ? `${budgets[0].name} · ${money(budgets[0].amount)} ${budgets[0].period.toLowerCase()}` : "No spending limit set yet."}</p>
          </article>
          <article>
            <span>Reminders</span>
            <strong>{reminders.length}</strong>
            <p>{reminders[0] ? `${reminders[0].name} · ${reminders[0].frequency}` : "No payment reminder yet."}</p>
          </article>
          <article>
            <span>Borrowed money</span>
            <strong>{money(receivableTotal - payableTotal)}</strong>
            <p>Get {money(receivableTotal)} · Give {money(payableTotal)}</p>
          </article>
        </div>
      </section>
      {expenseByCategory.length === 0 ? <EmptyState label="Spend stats are ready when you add expenses." /> : expenseByCategory.map((category) => (
        <div className="category-bar" key={category.name}>
          <span>{category.emoji} {category.name}</span>
          <i><b style={{ width: `${Math.max(8, (category.spent / max) * 100)}%`, background: category.tone }} /></i>
          <strong>{money(category.spent)}</strong>
        </div>
      ))}
    </div>
  );
}

function AccountsView({ budgets, debts, entries, goals }: { budgets: BudgetItem[]; debts: DebtItem[]; entries: LedgerEntry[]; goals: GoalItem[] }) {
  const money = useMoney();
  const receivableTotal = debts.filter((debt) => debt.kind === "receivable").reduce((sum, debt) => sum + debt.amount, 0);
  const payableTotal = debts.filter((debt) => debt.kind === "payable").reduce((sum, debt) => sum + debt.amount, 0);
  return (
    <div className="view-stack">
      {accounts.map((item) => {
        const income = entries.filter((entry) => entry.kind === "income" && entry.account === item).reduce((sum, entry) => sum + entry.amount, 0);
        const expenses = entries.filter((entry) => entry.kind === "expense" && entry.account === item).reduce((sum, entry) => sum + entry.amount, 0);
        const transferIn = entries.filter((entry) => entry.kind === "transfer" && entry.toAccount === item).reduce((sum, entry) => sum + entry.amount, 0);
        const transferOut = entries.filter((entry) => entry.kind === "transfer" && entry.account === item).reduce((sum, entry) => sum + entry.amount, 0);
        return (
          <section className="account-tile" key={item}>
            <span className="account-emoji">{item === "UPI" ? "📲" : item === "Cash" ? "💵" : item === "Bank" ? "🏦" : "💳"}</span>
            <div><strong>{item}</strong><span>Income, expenses and transfers</span></div>
            <b>{money(income - expenses + transferIn - transferOut)}</b>
          </section>
        );
      })}
      <section className="finance-lists">
        <header>
          <div>
            <span>Planning</span>
            <strong>Budgets, goals and borrowed money</strong>
          </div>
        </header>
        <div className="planning-grid">
          <article>
            <span>Budgets</span>
            <strong>{budgets.length}</strong>
            <p>{budgets[0] ? `${budgets[0].name} · ${money(budgets[0].amount)}` : "No budget added yet."}</p>
          </article>
          <article>
            <span>Goals</span>
            <strong>{goals.length}</strong>
            <p>{goals[0] ? `${goals[0].name} · ${money(goals[0].amount)}` : "No goal added yet."}</p>
          </article>
          <article>
            <span>You will get</span>
            <strong>{money(receivableTotal)}</strong>
            <p>Receivables from people.</p>
          </article>
          <article>
            <span>You will give</span>
            <strong>{money(payableTotal)}</strong>
            <p>Payables you owe.</p>
          </article>
        </div>
        {(goals.length > 0 || budgets.length > 0 || debts.length > 0) && (
          <div className="wallet-plan-list">
            {goals.slice(0, 3).map((goal) => (
              <article key={`goal-${goal.id}`}>
                <span>Goal</span>
                <strong>{goal.name}</strong>
                <p>{money(goal.amount)} · target {goal.targetDate}</p>
              </article>
            ))}
            {budgets.slice(0, 2).map((budget) => (
              <article key={`budget-${budget.id}`}>
                <span>Budget</span>
                <strong>{budget.name}</strong>
                <p>{budget.category} · {money(budget.amount)} · {budget.period}</p>
              </article>
            ))}
            {debts.slice(0, 2).map((debt) => (
              <article key={`debt-${debt.id}`}>
                <span>{debt.kind === "receivable" ? "You will get" : "You will give"}</span>
                <strong>{debt.name}</strong>
                <p>{money(debt.amount)}{debt.description ? ` · ${debt.description}` : ""}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MoreView({
  budgets,
  currencyCode,
  debts,
  goals,
  onAddBudget,
  onAddDebt,
  onAddGoal,
  onAddReminder,
  onCurrencyChange,
  onDeleteBudget,
  onDeleteDebt,
  onDeleteGoal,
  onDeleteReminder,
  onOpeningBalanceChange,
  onOpenCoach,
  openingBalance,
  reminders
}: {
  budgets: BudgetItem[];
  currencyCode: CurrencyCode;
  debts: DebtItem[];
  goals: GoalItem[];
  onAddBudget: (budget: Omit<BudgetItem, "createdAt" | "id">) => void;
  onAddDebt: (debt: Omit<DebtItem, "createdAt" | "id">) => void;
  onAddGoal: (goal: Omit<GoalItem, "createdAt" | "id">) => void;
  onAddReminder: (reminder: Omit<Reminder, "createdAt" | "id">) => void;
  onCurrencyChange: (currency: CurrencyCode) => void;
  onDeleteBudget: (id: number) => void;
  onDeleteDebt: (id: number) => void;
  onDeleteGoal: (id: number) => void;
  onDeleteReminder: (id: number) => void;
  onOpeningBalanceChange: (amount: number) => void;
  onOpenCoach: () => void;
  openingBalance: number;
  reminders: Reminder[];
}) {
  const money = useMoney();
  const [reminderKind, setReminderKind] = useState<Exclude<EntryKind, "transfer">>("expense");
  const [reminderName, setReminderName] = useState("");
  const [reminderAmount, setReminderAmount] = useState("");
  const [reminderFrequency, setReminderFrequency] = useState<Reminder["frequency"]>("Monthly");
  const [reminderTime, setReminderTime] = useState("21:00");
  const [reminderAccount, setReminderAccount] = useState("UPI");
  const [reminderCategory, setReminderCategory] = useState("Food");
  const [autoAdd, setAutoAdd] = useState(false);
  const [reminderError, setReminderError] = useState("");
  const [budgetName, setBudgetName] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetCategory, setBudgetCategory] = useState("Food");
  const [budgetPeriod, setBudgetPeriod] = useState<BudgetItem["period"]>("Monthly");
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [goalDate, setGoalDate] = useState(() => toDateKey(new Date(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())));
  const [debtKind, setDebtKind] = useState<DebtItem["kind"]>("receivable");
  const [debtName, setDebtName] = useState("");
  const [debtAmount, setDebtAmount] = useState("");
  const [debtDescription, setDebtDescription] = useState("");
  const [toolError, setToolError] = useState("");
  const reminderCategories = reminderKind === "income" ? incomeCategories : expenseCategories;

  const createReminder = () => {
    const parsedAmount = parseAmount(reminderAmount);

    if (!reminderName.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setReminderError("Add a name and amount for this reminder.");
      return;
    }

    onAddReminder({
      account: reminderAccount,
      amount: parsedAmount,
      autoAdd,
      category: reminderCategory,
      date: toDateKey(new Date()),
      frequency: reminderFrequency,
      kind: reminderKind,
      name: reminderName.trim(),
      time: reminderTime
    });
    setReminderName("");
    setReminderAmount("");
    setReminderError("");
  };

  const requestNotifications = async () => {
    if (!("Notification" in window)) {
      setReminderError("This browser does not support notification permission.");
      return;
    }

    const permission = await Notification.requestPermission();
    setReminderError(permission === "granted" ? "Notifications are allowed. Your reminders are ready." : "Notifications were not allowed. The reminder is still saved inside Wallets.");
  };

  const createBudget = () => {
    const parsedAmount = parseAmount(budgetAmount);
    if (!budgetName.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setToolError("Add a budget name and amount.");
      return;
    }

    onAddBudget({ amount: parsedAmount, category: budgetCategory, name: budgetName.trim(), period: budgetPeriod });
    setBudgetName("");
    setBudgetAmount("");
    setToolError("");
  };

  const createGoal = () => {
    const parsedAmount = parseAmount(goalAmount);
    if (!goalName.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setToolError("Add a goal name and amount.");
      return;
    }

    onAddGoal({ amount: parsedAmount, name: goalName.trim(), targetDate: goalDate });
    setGoalName("");
    setGoalAmount("");
    setToolError("");
  };

  const createDebt = () => {
    const parsedAmount = parseAmount(debtAmount);
    if (!debtName.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setToolError("Add a person name and amount.");
      return;
    }

    onAddDebt({
      amount: parsedAmount,
      description: debtDescription.trim(),
      dueDate: toDateKey(new Date()),
      kind: debtKind,
      name: debtName.trim()
    });
    setDebtName("");
    setDebtAmount("");
    setDebtDescription("");
    setToolError("");
  };

  return (
    <div className="view-stack">
      <button className="settings-row ai-chat-row" type="button" onClick={onOpenCoach}>
        <Bot size={22} /> AI Chat
        <small>Ask how to save, create goals, and plan budgets</small>
      </button>

      <section className="setup-card">
        <div>
          <span className="setup-coin">💰</span>
          <div>
            <span>Quick setup</span>
            <strong>Default money profile</strong>
          </div>
        </div>
        <label>
          Currency
          <select value={currencyCode} onChange={(event) => onCurrencyChange(event.target.value as CurrencyCode)}>
            {currencyOptions.map((option) => (
              <option key={option.code} value={option.code}>{option.symbol} {option.label} ({option.code})</option>
            ))}
          </select>
        </label>
        <label>
          Opening balance
          <input inputMode="decimal" value={String(openingBalance || "")} onChange={(event) => onOpeningBalanceChange(parseAmount(event.target.value) || 0)} placeholder="Enter main account balance" />
        </label>
      </section>

      <section className="planning-tools">
        <div className="tool-card">
          <div className="reminder-title">
            <span>📊</span>
            <div><small>Spending limits</small><strong>Add budget</strong></div>
          </div>
          <div className="reminder-grid">
            <input value={budgetName} onChange={(event) => setBudgetName(event.target.value)} placeholder="Budget name" />
            <input inputMode="decimal" value={budgetAmount} onChange={(event) => setBudgetAmount(event.target.value)} placeholder="Amount" />
            <select value={budgetCategory} onChange={(event) => setBudgetCategory(event.target.value)}>
              {expenseCategories.map((item) => <option key={item.name} value={item.name}>{item.emoji} {item.name}</option>)}
            </select>
            <select value={budgetPeriod} onChange={(event) => setBudgetPeriod(event.target.value as BudgetItem["period"])}>
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Yearly</option>
            </select>
          </div>
          <button className="create-reminder" type="button" onClick={createBudget}>Save budget</button>
          <CompactList items={budgets.map((item) => ({ id: item.id, label: `${item.name} · ${item.category}`, value: money(item.amount) }))} onDelete={onDeleteBudget} />
        </div>

        <div className="tool-card">
          <div className="reminder-title">
            <span>🎯</span>
            <div><small>Saving targets</small><strong>Add goal</strong></div>
          </div>
          <div className="reminder-grid">
            <input value={goalName} onChange={(event) => setGoalName(event.target.value)} placeholder="Goal name" />
            <input inputMode="decimal" value={goalAmount} onChange={(event) => setGoalAmount(event.target.value)} placeholder="Amount" />
            <input type="date" value={goalDate} onChange={(event) => setGoalDate(event.target.value)} />
          </div>
          <button className="create-reminder" type="button" onClick={createGoal}>Save goal</button>
          <CompactList items={goals.map((item) => ({ id: item.id, label: `${item.name} · ${item.targetDate}`, value: money(item.amount) }))} onDelete={onDeleteGoal} />
        </div>

        <div className="tool-card">
          <div className="reminder-title">
            <span>🤝</span>
            <div><small>Borrowed money</small><strong>Payable / receivable</strong></div>
          </div>
          <div className="reminder-kind">
            {(["receivable", "payable"] as const).map((item) => (
              <button className={debtKind === item ? "active" : ""} key={item} type="button" onClick={() => setDebtKind(item)}>{item}</button>
            ))}
          </div>
          <div className="reminder-grid">
            <input value={debtName} onChange={(event) => setDebtName(event.target.value)} placeholder="Person name" />
            <input inputMode="decimal" value={debtAmount} onChange={(event) => setDebtAmount(event.target.value)} placeholder="Amount" />
            <input value={debtDescription} onChange={(event) => setDebtDescription(event.target.value)} placeholder="What was it for?" />
          </div>
          <button className="create-reminder" type="button" onClick={createDebt}>Save record</button>
          <CompactList items={debts.map((item) => ({ id: item.id, label: `${item.kind === "receivable" ? "Get from" : "Give to"} ${item.name}`, value: money(item.amount) }))} onDelete={onDeleteDebt} />
        </div>
        {toolError && <p className="form-error">{toolError}</p>}
      </section>

      <section className="reminder-card">
        <div className="reminder-title">
          <span>⏰</span>
          <div>
            <small>Payments and income</small>
            <strong>Create reminder</strong>
          </div>
        </div>
        <div className="reminder-kind">
          {(["expense", "income"] as const).map((item) => (
            <button className={reminderKind === item ? "active" : ""} key={item} type="button" onClick={() => {
              setReminderKind(item);
              setReminderCategory(item === "income" ? "Salary" : "Food");
            }}>{item}</button>
          ))}
        </div>
        <div className="reminder-grid">
          <input value={reminderName} onChange={(event) => setReminderName(event.target.value)} placeholder="Payment name" />
          <input inputMode="decimal" value={reminderAmount} onChange={(event) => setReminderAmount(event.target.value)} placeholder="Amount" />
          <select value={reminderFrequency} onChange={(event) => setReminderFrequency(event.target.value as Reminder["frequency"])}>
            <option>One time</option>
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Yearly</option>
          </select>
          <input aria-label="Reminder time" type="time" value={reminderTime} onChange={(event) => setReminderTime(event.target.value)} />
          <select value={reminderAccount} onChange={(event) => setReminderAccount(event.target.value)}>
            {accounts.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={reminderCategory} onChange={(event) => setReminderCategory(event.target.value)}>
            {reminderCategories.map((item) => <option key={item.name} value={item.name}>{item.emoji} {item.name}</option>)}
          </select>
          <label className="auto-add">
            <input checked={autoAdd} type="checkbox" onChange={(event) => setAutoAdd(event.target.checked)} />
            Auto-add
          </label>
        </div>
        {reminderError && <p className={reminderError.startsWith("Notifications are allowed") ? "form-success" : "form-error"}>{reminderError}</p>}
        <div className="reminder-actions">
          <button className="create-reminder" type="button" onClick={createReminder}>Create reminder</button>
          <button type="button" onClick={requestNotifications}>Allow notifications</button>
        </div>
        {reminders.length > 0 && (
          <div className="reminder-list">
            {reminders.map((reminder) => (
              <article key={reminder.id}>
                <span>{categoryEmoji(reminder.category, reminder.kind)}</span>
                <div>
                  <strong>{reminder.name}</strong>
                  <small>{reminder.frequency} · {reminder.time} · {reminder.account} · {money(reminder.amount)}</small>
                </div>
                <button type="button" aria-label="Delete reminder" onClick={() => onDeleteReminder(reminder.id)}><Trash2 size={15} /></button>
              </article>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

function SettingsView({
  currencyCode,
  isDark,
  onBackup,
  onClear,
  onCurrencyChange,
  onImport,
  onOpenAccount,
  onTheme,
  profile
}: {
  currencyCode: CurrencyCode;
  isDark: boolean;
  onBackup: () => void;
  onClear: () => void;
  onCurrencyChange: (currency: CurrencyCode) => void;
  onImport: (file: File | undefined) => void;
  onOpenAccount: () => void;
  onTheme: () => void;
  profile: UserProfile;
}) {
  return (
    <div className="view-stack settings-view">
      <section className="settings-hero">
        <div>
          <span>Settings</span>
          <strong>Make MoneyFollows yours</strong>
          <p>Manage your account, theme, currency, backup, import and privacy controls from one place.</p>
        </div>
        <button type="button" onClick={onOpenAccount}>
          {profile.photoURL ? <img alt="" className="mini-avatar" src={profile.photoURL} /> : <UserRound size={20} />}
          Account
        </button>
      </section>

      <section className="settings-card settings-form-card">
        <span>Display</span>
        <strong>Theme and currency</strong>
        <div className="settings-form-grid">
          <label>
            Default currency
            <select value={currencyCode} onChange={(event) => onCurrencyChange(event.target.value as CurrencyCode)}>
              {currencyOptions.map((option) => (
                <option key={option.code} value={option.code}>{option.symbol} {option.label} ({option.code})</option>
              ))}
            </select>
          </label>
          <button className="settings-row" type="button" onClick={onTheme}>{isDark ? <Sun size={22} /> : <Moon size={22} />} {isDark ? "Switch to light mode" : "Switch to dark mode"}</button>
        </div>
      </section>

      <section className="settings-card backup-card">
        <span>Backup and restore</span>
        <strong>Move your MoneyFollows data safely</strong>
        <p>Export a JSON backup for another browser or device, then import it when needed.</p>
        <div>
          <button type="button" onClick={onBackup}><Download size={18} /> Export backup</button>
          <label>
            Import backup
            <input accept="application/json" type="file" onChange={(event) => onImport(event.target.files?.[0])} />
          </label>
        </div>
      </section>

      <section className="settings-card">
        <span>Privacy</span>
        <strong>No fake sample spending</strong>
        <p>MoneyFollows only shows entries you add, import, or create through your own planning actions.</p>
      </section>

      <button className="settings-row danger-row" type="button" onClick={onClear}><Trash2 size={22} /> Clear all entries</button>
    </div>
  );
}

function CoachPanel({
  budgets,
  debts,
  entries,
  goals,
  onAddBudget,
  onAddGoal,
  onAddReminder,
  onClose,
  onOpenWalletTools,
  reminders,
  savingsTarget,
  totals
}: {
  budgets: BudgetItem[];
  debts: DebtItem[];
  entries: LedgerEntry[];
  goals: GoalItem[];
  onAddBudget: (budget: Omit<BudgetItem, "createdAt" | "id">) => void;
  onAddGoal: (goal: Omit<GoalItem, "createdAt" | "id">) => void;
  onAddReminder: (reminder: Omit<Reminder, "createdAt" | "id">) => void;
  onClose: () => void;
  onOpenWalletTools: () => void;
  reminders: Reminder[];
  savingsTarget: number;
  totals: { income: number; expenses: number; total: number };
}) {
  const money = useMoney();
  const messageId = useRef(1);
  const [coachDates] = useState(() => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    return {
      nextMonth: toDateKey(nextMonth),
      today: toDateKey(now)
    };
  });
  const [mode, setMode] = useState<CoachMode>("balanced");
  const [chatModel, setChatModel] = useState<CoachModel>("flash38");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<CoachMessage[]>(loadCoachMessages);
  const topExpense = useMemo(() => {
    const totalsByCategory = expenseCategories.map((category) => ({
      ...category,
      amount: entries.filter((entry) => entry.kind === "expense" && entry.category === category.name).reduce((sum, entry) => sum + entry.amount, 0)
    })).sort((first, second) => second.amount - first.amount);
    return totalsByCategory[0]?.amount ? totalsByCategory[0] : null;
  }, [entries]);
  const quickPrompts = [
    "How can I save more money this month?",
    "Create a goal to save 5000",
    "Make a food budget for this month",
    "How do I set recurring rent or salary?",
    "What expense should I reduce first?"
  ];

  useEffect(() => {
    messageId.current = Math.max(messageId.current, ...messages.map((message) => message.id));
  }, [messages]);

  useEffect(() => {
    const messagesToSave = messages
      .filter((message) => message.text.trim())
      .map(({ id, role, text }) => ({ id, role, text }));
    window.localStorage.setItem(COACH_CHAT_STORAGE_KEY, JSON.stringify(messagesToSave));
  }, [messages]);

  const contextSummary = () => ({
    activeBudgets: budgets.length,
    activeGoals: goals.length,
    activeReminders: reminders.length,
    borrowedRecords: debts.length,
    income: totals.income,
    expenses: totals.expenses,
    net: totals.total,
    savingsTarget,
    topExpense: topExpense ? `${topExpense.name}: ${topExpense.amount}` : "none",
    transactionCount: entries.length
  });

  const buildActions = (question: string): CoachAction[] => {
    const normalized = question.toLowerCase();
    const amount = parseAmount(question.match(/[\d,.]+/)?.[0] ?? "");
    const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : Math.max(5000, Math.round(Math.max(savingsTarget, totals.expenses * 0.15, 5000)));
    const actions: CoachAction[] = [];

    if (normalized.includes("goal") || normalized.includes("save") || normalized.includes("target")) {
      actions.push({
        label: `Create goal ${money(safeAmount)}`,
        payload: { amount: safeAmount, name: normalized.includes("emergency") ? "Emergency fund" : "Monthly savings goal", targetDate: coachDates.nextMonth },
        type: "goal"
      });
    }

    if (normalized.includes("budget") || normalized.includes("food") || normalized.includes("expense") || normalized.includes("cut")) {
      const category = normalized.includes("food") ? "Food" : topExpense?.name ?? "Food";
      const budgetAmount = amount > 0 ? amount : Math.max(1000, Math.round((topExpense?.amount ?? totals.expenses * 0.35) * 0.85));
      actions.push({
        label: `Create ${category} budget`,
        payload: { amount: budgetAmount, category, name: `${category} control`, period: "Monthly" },
        type: "budget"
      });
    }

    if (normalized.includes("reminder") || normalized.includes("recurring") || normalized.includes("rent") || normalized.includes("salary") || normalized.includes("emi")) {
      actions.push({
        label: "Create monthly reminder",
        payload: {
          account: "UPI",
          amount: safeAmount,
          autoAdd: false,
          category: normalized.includes("salary") ? "Salary" : "Bills",
          date: coachDates.today,
          frequency: "Monthly",
          kind: normalized.includes("salary") ? "income" : "expense",
          name: normalized.includes("salary") ? "Salary reminder" : normalized.includes("rent") ? "Rent reminder" : "Monthly payment reminder",
          time: "21:00"
        },
        type: "reminder"
      });
    }

    return actions.slice(0, 2);
  };

  const askCoach = async (promptText = input) => {
    const question = promptText.trim();
    if (!question || busy) {
      return;
    }

    const userMessage: CoachMessage = { id: ++messageId.current, role: "user", text: question };
    const history = messages
      .filter((message) => message.role === "assistant" || message.role === "user")
      .map(({ role, text }) => ({ role, text }));
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setBusy(true);

    let text = "";
    let shouldAttachActions = false;
    try {
      const response = await fetch("/api/gemini-chat", {
        body: JSON.stringify({ context: contextSummary(), history, mode, model: chatModel, question }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      if (response.ok) {
        const data = await response.json() as { model?: string; text?: string };
        text = data.text
          ? `${data.text}\n\nAnswered by Gemini model: ${data.model || chatModel}`
          : `The selected Gemini model (${data.model || chatModel}) did not return text. Try again or choose 2.5 Flash.`;
        shouldAttachActions = Boolean(data.text);
      } else {
        const data = await response.json().catch(() => null) as { error?: string; detail?: string } | null;
        text = data?.error === "Gemini is not configured."
          ? "Real Gemini AI is not connected yet. Add `GEMINI_API_KEY` in Vercel Environment Variables for the MoneyFollows project, then redeploy. I will not fake an AI answer."
          : `Gemini could not answer right now. ${data?.error || "Try again in a minute or choose 2.5 Flash."}${data?.detail ? ` Details: ${data.detail}` : ""}`;
      }
    } catch {
      text = "Gemini could not be reached from this browser session. Check the Vercel function, API key, and network, then try again.";
    }

    setMessages((current) => [...current, { actions: shouldAttachActions ? buildActions(question) : undefined, id: ++messageId.current, role: "assistant", text }]);
    setBusy(false);
  };

  const clearChat = () => {
    window.localStorage.removeItem(COACH_CHAT_STORAGE_KEY);
    messageId.current = 1;
    setMessages([starterCoachMessage]);
  };

  const runAction = (action: CoachAction) => {
    if (action.type === "goal") {
      onAddGoal(action.payload);
    } else if (action.type === "budget") {
      onAddBudget(action.payload);
    } else {
      onAddReminder(action.payload);
    }
    setMessages((current) => [...current, { id: ++messageId.current, role: "assistant", text: `${action.label} has been added to Wallets.` }]);
    onOpenWalletTools();
  };

  return (
    <motion.div className="modal-backdrop coach-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.section className="coach-panel" initial={{ y: 28, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 28, opacity: 0 }} transition={spring}>
        <header>
          <div>
            <span><Bot size={17} /> MoneyFollows AI</span>
            <strong>Finance coach</strong>
          </div>
          <div className="coach-header-actions">
            <button type="button" aria-label="Delete AI chat history" onClick={clearChat}><Trash2 size={18} /></button>
            <button type="button" aria-label="Close AI chat" onClick={onClose}><X size={22} /></button>
          </div>
        </header>
        <div className="coach-models" aria-label="AI chat model">
          {coachModelOptions.map((item) => (
            <button className={chatModel === item.key ? "active" : ""} key={item.key} type="button" onClick={() => setChatModel(item.key)}>
              <strong>{item.label}</strong>
              <small>{item.text}</small>
            </button>
          ))}
        </div>
        <div className="coach-mode" aria-label="AI response mode">
          {(["fast", "balanced", "deep"] as CoachMode[]).map((item) => (
            <button className={mode === item ? "active" : ""} key={item} type="button" onClick={() => setMode(item)}>{item}</button>
          ))}
        </div>
        <div className="coach-prompts">
          {quickPrompts.map((prompt) => (
            <button key={prompt} type="button" onClick={() => askCoach(prompt)}>{prompt}</button>
          ))}
        </div>
        <div className="coach-messages">
          {messages.map((message) => (
            <article className={message.role} key={message.id}>
              <p>{message.text}</p>
              {message.actions && message.actions.length > 0 && (
                <div>
                  {message.actions.map((action) => (
                    <button key={`${action.type}-${action.label}`} type="button" onClick={() => runAction(action)}>{action.label}</button>
                  ))}
                </div>
              )}
            </article>
          ))}
          {busy && <article className="assistant"><p>Thinking through your money data...</p></article>}
        </div>
        <form className="coach-input" onSubmit={(event) => {
          event.preventDefault();
          askCoach();
        }}>
          <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about saving, goals, budgets, rent, salary..." />
          <button type="submit" disabled={busy || !input.trim()}><Send size={18} /></button>
        </form>
      </motion.section>
    </motion.div>
  );
}

function CompactList({ items, onDelete }: { items: Array<{ id: number; label: string; value: string }>; onDelete: (id: number) => void }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="compact-list">
      {items.slice(0, 3).map((item) => (
        <article key={item.id}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <button type="button" aria-label={`Delete ${item.label}`} onClick={() => onDelete(item.id)}><Trash2 size={14} /></button>
        </article>
      ))}
    </div>
  );
}

function Ring({ label, amount, color, percent }: { label: string; amount: number; color: string; percent: number }) {
  const money = useMoney();
  return (
    <div className="ring">
      <span>{label}</span>
      <i style={{ "--ring": color, "--percent": `${percent}%` } as CSSProperties}><b>{percent}%</b></i>
      <strong>{money(amount)}</strong>
    </div>
  );
}

function Checklist({ items, selected, onSelectAll, onToggle }: { items: string[]; selected: string[]; onSelectAll: (items: string[]) => void; onToggle: (item: string) => void }) {
  const allSelected = items.length > 0 && selected.length === items.length;
  return (
    <>
      <button className="check-row" type="button" onClick={() => onSelectAll(allSelected ? [] : items)}>
        <span className={allSelected ? "box checked" : "box"} /> All <small>{allSelected ? "Clear all" : "Select all"}</small>
      </button>
      {items.map((item) => (
        <button className="check-row" key={item} type="button" onClick={() => onToggle(item)}>
          <span className={selected.includes(item) ? "box checked" : "box"} />
          <i style={{ background: categoryTone(item) }}>{categoryEmoji(item)}</i>
          {item}
        </button>
      ))}
    </>
  );
}

export default App;

