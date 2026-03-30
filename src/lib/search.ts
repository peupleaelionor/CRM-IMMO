import type { Contact, Property } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function matchesQuery(text: string, query: string): boolean {
  return normalize(text).includes(normalize(query));
}

// ─── Contact Search ──────────────────────────────────────────────────────────

export function searchContacts(contacts: Contact[], query: string): Contact[] {
  if (!query.trim()) return contacts;

  return contacts.filter((contact) => {
    const fullName = `${contact.firstName} ${contact.lastName}`;
    return (
      matchesQuery(fullName, query) ||
      matchesQuery(contact.email, query) ||
      matchesQuery(contact.phone, query) ||
      contact.preferredLocations.some((loc) => matchesQuery(loc, query)) ||
      matchesQuery(contact.notes, query)
    );
  });
}

// ─── Property Search ─────────────────────────────────────────────────────────

export function searchProperties(properties: Property[], query: string): Property[] {
  if (!query.trim()) return properties;

  return properties.filter((property) =>
    matchesQuery(property.title, query) ||
    matchesQuery(property.description, query) ||
    matchesQuery(property.city, query) ||
    matchesQuery(property.location, query) ||
    matchesQuery(property.type, query) ||
    property.features.some((f) => matchesQuery(f, query)),
  );
}

// ─── Property Filters ────────────────────────────────────────────────────────

export interface PropertyFilters {
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  type?: Property['type'];
  minSurface?: number;
  maxSurface?: number;
  rooms?: number;
}

export function filterProperties(properties: Property[], filters: PropertyFilters): Property[] {
  return properties.filter((property) => {
    if (filters.minPrice !== undefined && property.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && property.price > filters.maxPrice) return false;
    if (filters.city && !matchesQuery(property.city, filters.city)) return false;
    if (filters.type && property.type !== filters.type) return false;
    if (filters.minSurface !== undefined && property.surface < filters.minSurface) return false;
    if (filters.maxSurface !== undefined && property.surface > filters.maxSurface) return false;
    if (filters.rooms !== undefined && property.rooms < filters.rooms) return false;
    return true;
  });
}

// ─── Contact Filters ─────────────────────────────────────────────────────────

export interface ContactFilters {
  type?: Contact['type'];
  status?: Contact['status'];
  minScore?: number;
}

export function filterContacts(contacts: Contact[], filters: ContactFilters): Contact[] {
  return contacts.filter((contact) => {
    if (filters.type && contact.type !== filters.type) return false;
    if (filters.status && contact.status !== filters.status) return false;
    if (filters.minScore !== undefined && contact.score < filters.minScore) return false;
    return true;
  });
}
