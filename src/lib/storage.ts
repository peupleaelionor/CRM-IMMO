import type {
  Contact,
  Property,
  Deal,
  Task,
  Notification,
  MatchResult,
} from '../types';
import {
  demoContacts,
  demoProperties,
  demoDeals,
  demoTasks,
  demoNotifications,
  demoMatches,
} from '../data/demo';

const PREFIX = 'estateflow_';

const KEYS = {
  contacts: `${PREFIX}contacts`,
  properties: `${PREFIX}properties`,
  deals: `${PREFIX}deals`,
  tasks: `${PREFIX}tasks`,
  notifications: `${PREFIX}notifications`,
  matches: `${PREFIX}matches`,
  initialized: `${PREFIX}initialized`,
} as const;

// ─── Generic helpers ─────────────────────────────────────────────────────────

function getItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save to localStorage (key: ${key}):`, error);
  }
}

// ─── Contacts ────────────────────────────────────────────────────────────────

export function getContacts(): Contact[] {
  return getItem<Contact[]>(KEYS.contacts) ?? [];
}

export function saveContacts(contacts: Contact[]): void {
  setItem(KEYS.contacts, contacts);
}

// ─── Properties ──────────────────────────────────────────────────────────────

export function getProperties(): Property[] {
  return getItem<Property[]>(KEYS.properties) ?? [];
}

export function saveProperties(properties: Property[]): void {
  setItem(KEYS.properties, properties);
}

// ─── Deals ───────────────────────────────────────────────────────────────────

export function getDeals(): Deal[] {
  return getItem<Deal[]>(KEYS.deals) ?? [];
}

export function saveDeals(deals: Deal[]): void {
  setItem(KEYS.deals, deals);
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export function getTasks(): Task[] {
  return getItem<Task[]>(KEYS.tasks) ?? [];
}

export function saveTasks(tasks: Task[]): void {
  setItem(KEYS.tasks, tasks);
}

// ─── Notifications ───────────────────────────────────────────────────────────

export function getNotifications(): Notification[] {
  return getItem<Notification[]>(KEYS.notifications) ?? [];
}

export function saveNotifications(notifications: Notification[]): void {
  setItem(KEYS.notifications, notifications);
}

// ─── Matches ─────────────────────────────────────────────────────────────────

export function getMatches(): MatchResult[] {
  return getItem<MatchResult[]>(KEYS.matches) ?? [];
}

export function saveMatches(matches: MatchResult[]): void {
  setItem(KEYS.matches, matches);
}

// ─── Initialization ──────────────────────────────────────────────────────────

export function initializeDemoData(): void {
  const alreadyInitialized = localStorage.getItem(KEYS.initialized);
  if (alreadyInitialized) return;

  saveContacts(demoContacts);
  saveProperties(demoProperties);
  saveDeals(demoDeals);
  saveTasks(demoTasks);
  saveNotifications(demoNotifications);
  saveMatches(demoMatches);

  localStorage.setItem(KEYS.initialized, 'true');
}
