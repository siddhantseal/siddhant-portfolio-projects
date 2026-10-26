import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { User } from "firebase/auth";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
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
  BriefcaseBusiness,
  Camera,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Download,
  Landmark,
  Moon,
  MoreHorizontal,
  Plus,
  ReceiptText,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
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
type ViewTab = "daily" | "calendar" | "monthly" | "total" | "note";
type BottomTab = "trans" | "stats" | "accounts" | "more";
type FilterTab = "income" | "expenses" | "account";
type CurrencyCode = string;
type CurrencyOption = { code: CurrencyCode; label: string; symbol: string };
type AuthProvider = "Google" | "Email";

type UserProfile = {
  name: string;
  provider: AuthProvider;
  email?: string;
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
  tags: string[];
  date: string;
  createdAt: string;
};

type MoneyNote = {
  id: number;
  title: string;
  body: string;
  date: string;
  createdAt: string;
};

type Reminder = {
  id: number;
  kind: Exclude<EntryKind, "transfer">;
  name: string;
  amount: number;
  frequency: "Weekly" | "Monthly" | "Yearly";
  account: string;
  category: string;
  autoAdd: boolean;
  date: string;
  createdAt: string;
};

type Category = {
  emoji: string;
  name: string;
  tone: string;
};

const STORAGE_KEY = "moneyfollows-user-transactions";
const NOTES_STORAGE_KEY = "moneyfollows-user-notes";
const CURRENCY_STORAGE_KEY = "moneyfollows-currency";
const BALANCE_STORAGE_KEY = "moneyfollows-opening-balance";
const REMINDERS_STORAGE_KEY = "moneyfollows-reminders";
const THEME_KEY = "moneyfollows-theme";

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
  { key: "total", label: "Vault" },
  { key: "note", label: "Notes" }
];
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const memeLines = [
  "Money follows people who write it down.",
  "Budget tight? Track first, flex later.",
  "Every receipt has a plot twist."
];
const bottomTabs: Array<{ key: BottomTab; label: string; icon: typeof ReceiptText }> = [
  { key: "trans", label: "Ledger", icon: ReceiptText },
  { key: "stats", label: "Insight", icon: BarChart3 },
  { key: "accounts", label: "Wallets", icon: WalletCards },
  { key: "more", label: "Studio", icon: MoreHorizontal }
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
    tags: Array.isArray(item.tags) ? item.tags.filter((tag): tag is string => typeof tag === "string") : [],
    toAccount: typeof item.toAccount === "string" ? item.toAccount : undefined
  };
};

const normalizeNote = (raw: unknown): MoneyNote | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const item = raw as Partial<MoneyNote>;
  const body = typeof item.body === "string" ? item.body.trim() : "";
  const title = typeof item.title === "string" ? item.title.trim() : "";

  if (!body && !title) {
    return null;
  }

  return {
    body,
    createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
    date: typeof item.date === "string" ? item.date : toDateKey(new Date()),
    id: typeof item.id === "number" ? item.id : Date.now(),
    title: title || "Money note"
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

  return {
    account: typeof item.account === "string" ? item.account : "UPI",
    amount,
    autoAdd: Boolean(item.autoAdd),
    category: typeof item.category === "string" ? item.category : kind === "income" ? "Salary" : "Food",
    createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
    date: typeof item.date === "string" ? item.date : toDateKey(new Date()),
    frequency: item.frequency === "Weekly" || item.frequency === "Yearly" ? item.frequency : "Monthly",
    id: typeof item.id === "number" ? item.id : Date.now(),
    kind,
    name: item.name
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

function App() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<LedgerEntry[]>(() => loadArray(STORAGE_KEY, normalizeEntry));
  const [notes, setNotes] = useState<MoneyNote[]>(() => loadArray(NOTES_STORAGE_KEY, normalizeNote));
  const [reminders, setReminders] = useState<Reminder[]>(() => loadArray(REMINDERS_STORAGE_KEY, normalizeReminder));
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(Boolean(auth));
  const [authError, setAuthError] = useState("");
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(loadCurrency);
  const [openingBalance, setOpeningBalance] = useState(loadOpeningBalance);
  const [activeView, setActiveView] = useState<ViewTab>("daily");
  const [bottomTab, setBottomTab] = useState<BottomTab>("trans");
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
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");

  const money = useMemo(() => (amount: number) => formatMoneyAmount(amount, currencyCode), [currencyCode]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    window.localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, currencyCode);
  }, [currencyCode]);

  useEffect(() => {
    window.localStorage.setItem(BALANCE_STORAGE_KEY, String(openingBalance));
  }, [openingBalance]);

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
        if (credential?.user && pendingName && credential.user.displayName !== pendingName) {
          await updateProfile(credential.user, { displayName: pendingName });
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
      setAuthLoading(false);
      setAuthError("");
    });
  }, []);

  useEffect(() => {
    if (!authLoading) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setAuthLoading(false);
      setAuthError("MoneyFollows could not restore the login session. Refresh once, then log in again if needed.");
    }, 8000);

    return () => window.clearTimeout(timer);
  }, [authLoading]);

  const userProfile = useMemo<UserProfile | null>(() => {
    if (!authUser) {
      return null;
    }

    const providerId = authUser.providerData[0]?.providerId;
    const provider: AuthProvider = providerId === "google.com"
      ? "Google"
      : "Email";

    return {
      email: authUser.email ?? undefined,
      name: authUser.displayName || authUser.email?.split("@")[0] || "MoneyFollows user",
      provider
    };
  }, [authUser]);

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

  const appendAmountKey = (key: string) => {
    setFormError("");
    setAmount((current) => {
      if (key === "backspace") {
        return current.slice(0, -1);
      }

      if (key === "clear") {
        return "";
      }

      if (key === ".") {
        return current.includes(".") ? current : `${current || "0"}.`;
      }

      if (key === "-") {
        return current.startsWith("-") ? current.slice(1) : `-${current}`;
      }

      return current === "0" ? key : `${current}${key}`;
    });
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
      tags: tagText.split(",").map((tag) => tag.trim()).filter(Boolean),
      toAccount: kind === "transfer" ? toAccount : undefined
    };

    setEntries((current) => [nextEntry, ...current]);
    resetComposer();

    if (!continueAfterSave) {
      setShowComposer(false);
    }
  };

  const saveNote = () => {
    const title = noteTitle.trim();
    const body = noteBody.trim();

    if (!title && !body) {
      return;
    }

    const nextNote: MoneyNote = {
      body,
      createdAt: new Date().toISOString(),
      date: toDateKey(selectedDate),
      id: Date.now(),
      title: title || "Money note"
    };

    setNotes((current) => [nextNote, ...current]);
    setNoteTitle("");
    setNoteBody("");
  };

  const saveReminder = (reminder: Omit<Reminder, "createdAt" | "id">) => {
    setReminders((current) => [{ ...reminder, createdAt: new Date().toISOString(), id: Date.now() }, ...current]);
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

  const handleEmailAuth = async (mode: "login" | "signup", name: string, email: string, password: string) => {
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
        setAuthUser(credential.user);
      }
    } catch (error) {
      setAuthError(getAuthMessage(error));
    }
  };

  const handleProviderAuth = async (providerName: Exclude<AuthProvider, "Email">, name: string) => {
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
        setAuthUser(credential.user);
      }
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
      return;
    }

    await signOut(auth);
  };

  return (
    <MoneyContext.Provider value={money}>
    {authLoading ? (
      <AuthStatusScreen />
    ) : !userProfile ? (
      <WelcomeGate
        authError={authError}
        authLoading={authLoading}
        isConfigured={isFirebaseConfigured}
        onEmailAuth={handleEmailAuth}
        onProviderAuth={handleProviderAuth}
      />
    ) : (
    <main className="app-page">
      <section className="money-workspace" aria-label="MoneyFollows money management app">
        <nav className="bottom-nav" aria-label="Main app sections">
          <div className="rail-logo">
            <WalletCards size={24} />
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
            <div>
              <span>MoneyFollows</span>
              <strong>{totals.total >= 0 ? `Hi ${userProfile.name}, your money is behaving.` : `Hi ${userProfile.name}, your money needs direction.`}</strong>
            </div>
            <button type="button" aria-label="Open filters" onClick={() => setShowFilter(true)}><Settings2 size={22} /></button>
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
            <button type="button" aria-label="Money follows motivation" onClick={() => setBottomTab("more")}><Star size={25} /></button>
            <button type="button" aria-label="Search" onClick={focusSearch}><Search size={25} /></button>
            <button type="button" aria-label="Toggle dark mode" onClick={() => setIsDark((current) => !current)}>
              {isDark ? <Sun size={22} /> : <Moon size={22} />}
            </button>
          </div>

          <div className="search-row">
            <Search size={16} />
            <input ref={searchInputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search entries, notes, accounts" />
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
            {bottomTab === "trans" && activeView === "note" && (
              <NoteView
                body={noteBody}
                notes={notes}
                onBodyChange={setNoteBody}
                onDelete={(id) => setNotes((current) => current.filter((note) => note.id !== id))}
                onSave={saveNote}
                onTitleChange={setNoteTitle}
                query={query}
                title={noteTitle}
              />
            )}
            {bottomTab === "stats" && <StatsView entries={filteredEntries} totals={totals} />}
            {bottomTab === "accounts" && <AccountsView entries={filteredEntries} />}
            {bottomTab === "more" && (
              <MoreView
                currencyCode={currencyCode}
                openingBalance={openingBalance}
                isDark={isDark}
                onAddReminder={saveReminder}
                onClear={() => setEntries([])}
                onCurrencyChange={setCurrencyCode}
                onDeleteReminder={(id) => setReminders((current) => current.filter((reminder) => reminder.id !== id))}
                onOpeningBalanceChange={setOpeningBalance}
                onSignOut={handleSignOut}
                onTheme={() => setIsDark((current) => !current)}
                reminders={reminders}
                userProfile={userProfile}
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
                  <output>{amount || "0"}</output>
                </label>

                {kind !== "transfer" ? (
                  <label className="wide">
                    Category
                    <select value={category} onChange={(event) => updateCategory(event.target.value)}>
                      {currentCategories.map((item) => <option key={item.name} value={item.name}>{item.emoji} {item.name}</option>)}
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

              <div className="keypad" aria-label="Amount keypad">
                {["1", "2", "3", "backspace", "4", "5", "6", "-", "7", "8", "9", "clear", "0", ".", "done"].map((key) => (
                  <button
                    className={key === "done" ? "done-key" : ""}
                    key={key}
                    type="button"
                    onClick={() => key === "done" ? saveEntry(false) : appendAmountKey(key)}
                  >
                    {key === "backspace" ? "⌫" : key === "clear" ? "C" : key === "done" ? "Done" : key}
                  </button>
                ))}
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
                <Checklist items={incomeCategories.map((item) => item.name)} selected={selectedIncome} onToggle={(item) => toggleFilter(item, selectedIncome, setSelectedIncome)} />
              )}
              {filterTab === "expenses" && (
                <Checklist items={expenseCategories.map((item) => item.name)} selected={selectedExpenses} onToggle={(item) => toggleFilter(item, selectedExpenses, setSelectedExpenses)} />
              )}
              {filterTab === "account" && (
                <Checklist items={accounts} selected={selectedAccounts} onToggle={(item) => toggleFilter(item, selectedAccounts, setSelectedAccounts)} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
    )}
    </MoneyContext.Provider>
  );
}

function AuthStatusScreen() {
  return (
    <main className="auth-status-screen">
      <motion.section animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 12 }} transition={spring}>
        <WalletCards size={34} />
        <strong>Opening MoneyFollows</strong>
        <p>Restoring your secure session and loading the dashboard.</p>
        <button type="button" onClick={() => window.location.reload()}>Refresh app</button>
      </motion.section>
    </main>
  );
}

function WelcomeGate({
  authError,
  authLoading,
  isConfigured,
  onEmailAuth,
  onProviderAuth
}: {
  authError: string;
  authLoading: boolean;
  isConfigured: boolean;
  onEmailAuth: (mode: "login" | "signup", name: string, email: string, password: string) => Promise<void>;
  onProviderAuth: (provider: Exclude<AuthProvider, "Email">, name: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [busyProvider, setBusyProvider] = useState<AuthProvider | "form" | null>(null);
  const [error, setError] = useState("");

  const runEmailAuth = async () => {
    const cleanName = name.trim();
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
    await onEmailAuth(mode, cleanName, cleanEmail, password);
    setBusyProvider(null);
  };

  const runProviderAuth = async (provider: Exclude<AuthProvider, "Email">) => {
    const cleanName = name.trim();
    if (!cleanName) {
      setError("Add your name first so MoneyFollows can personalize the app.");
      return;
    }

    setError("");
    setBusyProvider(provider);
    await onProviderAuth(provider, cleanName);
    setBusyProvider(null);
  };

  return (
    <main className="welcome-gate">
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="welcome-panel"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.42 }}
      >
        <div className="welcome-copy">
          <span><Sparkles size={16} /> MoneyFollows</span>
          <h1>Build a clearer relationship with your money.</h1>
          <p>Set up your profile once. Track income, expenses, notes, reminders, wallets, and monthly patterns from a dashboard made for daily use.</p>
          <div className="welcome-metrics" aria-label="MoneyFollows setup highlights">
            <span><b>160+</b> currencies</span>
            <span><b>0</b> fake entries</span>
            <span><b>Private</b> local-first</span>
          </div>
        </div>

        <motion.div className="welcome-meme" whileHover={{ y: -3 }} transition={spring}>
          <img alt="MoneyFollows meme motivation" src="/ravi-kishan-money-follows.png" />
          <div>
            <strong>MoneyFollows reminder</strong>
            <small>Track what matters, keep the rest calm.</small>
          </div>
        </motion.div>

        <form className="welcome-form" onSubmit={(event) => {
          event.preventDefault();
          void runEmailAuth();
        }}>
          <div className="auth-heading">
            <span>Secure access</span>
            <strong>{mode === "signup" ? "Create your account" : "Log in to MoneyFollows"}</strong>
            <p>{mode === "signup" ? "Sign up with email or Google." : "Use your email or continue with Google."}</p>
          </div>
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
            {(["Google"] as Array<Exclude<AuthProvider, "Email">>).map((provider) => (
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
          </div>
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

function NoteView({
  body,
  notes,
  onBodyChange,
  onDelete,
  onSave,
  onTitleChange,
  query,
  title
}: {
  body: string;
  notes: MoneyNote[];
  onBodyChange: (value: string) => void;
  onDelete: (id: number) => void;
  onSave: () => void;
  onTitleChange: (value: string) => void;
  query: string;
  title: string;
}) {
  const normalizedQuery = query.trim().toLowerCase();
  const visibleNotes = notes.filter((note) => {
    if (!normalizedQuery) {
      return true;
    }

    return `${note.title} ${note.body}`.toLowerCase().includes(normalizedQuery);
  });

  return (
    <div className="view-stack notes-view">
      <section className="notes-composer">
        <div>
          <span className="note-emoji">📝</span>
          <strong>Money notes</strong>
        </div>
        <input value={title} onChange={(event) => onTitleChange(event.target.value)} placeholder="Title, idea, reminder" />
        <textarea value={body} onChange={(event) => onBodyChange(event.target.value)} placeholder="Write anything: payday plan, EMI reminder, wishlist, cash owed, shopping thought..." />
        <button type="button" onClick={onSave}><Plus size={18} /> Save note</button>
      </section>
      {visibleNotes.length === 0 ? (
        <EmptyState label={notes.length === 0 ? "Write your first note above." : "No notes match your search."} />
      ) : (
        <AnimatePresence initial={false}>
          {visibleNotes.map((note) => (
            <motion.article className="note-card" key={note.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -16 }} transition={spring}>
              <div>
                <span>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(fromDateKey(note.date))}</span>
                <strong>💡 {note.title}</strong>
                {note.body && <p>{note.body}</p>}
              </div>
              <button type="button" aria-label="Delete note" onClick={() => onDelete(note.id)}><Trash2 size={16} /></button>
            </motion.article>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}

function StatsView({ entries, totals }: { entries: LedgerEntry[]; totals: { income: number; expenses: number; total: number } }) {
  const money = useMoney();
  const expenseByCategory = expenseCategories.map((category) => ({
    ...category,
    spent: entries.filter((entry) => entry.kind === "expense" && entry.category === category.name).reduce((sum, entry) => sum + entry.amount, 0)
  })).filter((category) => category.spent > 0);
  const max = Math.max(...expenseByCategory.map((category) => category.spent), 1);
  return (
    <div className="view-stack stats-view">
      <div className="stats-card">
        <span>Monthly balance</span>
        <strong>{money(totals.total)}</strong>
        <p>{money(totals.income)} income · {money(totals.expenses)} expenses</p>
      </div>
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

function AccountsView({ entries }: { entries: LedgerEntry[] }) {
  const money = useMoney();
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
    </div>
  );
}

function MoreView({
  currencyCode,
  isDark,
  onAddReminder,
  onClear,
  onCurrencyChange,
  onDeleteReminder,
  onOpeningBalanceChange,
  onSignOut,
  onTheme,
  openingBalance,
  reminders,
  userProfile
}: {
  currencyCode: CurrencyCode;
  isDark: boolean;
  onAddReminder: (reminder: Omit<Reminder, "createdAt" | "id">) => void;
  onClear: () => void;
  onCurrencyChange: (currency: CurrencyCode) => void;
  onDeleteReminder: (id: number) => void;
  onOpeningBalanceChange: (amount: number) => void;
  onSignOut: () => void;
  onTheme: () => void;
  openingBalance: number;
  reminders: Reminder[];
  userProfile: UserProfile;
}) {
  const money = useMoney();
  const [reminderKind, setReminderKind] = useState<Exclude<EntryKind, "transfer">>("expense");
  const [reminderName, setReminderName] = useState("");
  const [reminderAmount, setReminderAmount] = useState("");
  const [reminderFrequency, setReminderFrequency] = useState<Reminder["frequency"]>("Monthly");
  const [reminderAccount, setReminderAccount] = useState("UPI");
  const [reminderCategory, setReminderCategory] = useState("Food");
  const [autoAdd, setAutoAdd] = useState(false);
  const [reminderError, setReminderError] = useState("");
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
      name: reminderName.trim()
    });
    setReminderName("");
    setReminderAmount("");
    setReminderError("");
  };

  return (
    <div className="view-stack">
      <section className="profile-card">
        <div>
          <span>{userProfile.name.slice(0, 1).toUpperCase()}</span>
          <div>
            <small>Signed in with {userProfile.provider}</small>
            <strong>{userProfile.name}</strong>
          </div>
        </div>
        <button type="button" onClick={onSignOut}>Change profile</button>
      </section>

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
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Yearly</option>
          </select>
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
        {reminderError && <p className="form-error">{reminderError}</p>}
        <button className="create-reminder" type="button" onClick={createReminder}>Create reminder</button>
        {reminders.length > 0 && (
          <div className="reminder-list">
            {reminders.map((reminder) => (
              <article key={reminder.id}>
                <span>{categoryEmoji(reminder.category, reminder.kind)}</span>
                <div>
                  <strong>{reminder.name}</strong>
                  <small>{reminder.frequency} · {reminder.account} · {money(reminder.amount)}</small>
                </div>
                <button type="button" aria-label="Delete reminder" onClick={() => onDeleteReminder(reminder.id)}><Trash2 size={15} /></button>
              </article>
            ))}
          </div>
        )}
      </section>

      <motion.section className="meme-card" drag dragConstraints={{ left: -14, right: 14, top: -14, bottom: 14 }} whileDrag={{ scale: 1.02, rotate: -1 }}>
        <img alt="Ravi Kishan Money Follows meme" src="/ravi-kishan-money-follows.png" />
        <div>
          <span>Daily motivation</span>
          <strong>Money follows, my brother.</strong>
          <p>Track it cleanly, spend it consciously, let the numbers follow you.</p>
        </div>
      </motion.section>
      <MemeStrip />
      <section className="meme-gallery" aria-label="Money meme gallery">
        <div>
          <span>Money moodboard</span>
          <strong>Spend less boringly.</strong>
        </div>
        <div>
          <img alt="Money flying meme" src="/money-throw-meme.png" />
          <img alt="Counting happiness money meme" src="/happiness-money-meme.png" />
          <img alt="Using MoneyFollows and saving money meme" src="/moneyfollows-saving-meme.png" />
        </div>
      </section>
      <section className="settings-card">
        <strong>MoneyFollows</strong>
        <span>Professional money management without fake sample spending.</span>
      </section>
      <button className="settings-row" type="button" onClick={onTheme}>{isDark ? <Sun size={22} /> : <Moon size={22} />} {isDark ? "Switch to light mode" : "Switch to dark mode"}</button>
      <button className="settings-row danger-row" type="button" onClick={onClear}><Trash2 size={22} /> Clear all entries</button>
    </div>
  );
}

function MemeStrip({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "meme-strip compact" : "meme-strip"}>
      {memeLines.map((line, index) => (
        <motion.span key={line} whileHover={{ y: -3, scale: 1.02 }} transition={{ type: "spring", stiffness: 280, damping: 18 }}>
          <b>{index + 1}</b>
          {line}
        </motion.span>
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

function Checklist({ items, selected, onToggle }: { items: string[]; selected: string[]; onToggle: (item: string) => void }) {
  return (
    <>
      <button className="check-row" type="button" onClick={() => items.forEach((item) => !selected.includes(item) && onToggle(item))}>
        <span className={selected.length === items.length ? "box checked" : "box"} /> All <small>This month</small>
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

