import type { Contact, Property, MatchResult } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateMatchId(): string {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function formatPrice(price: number): string {
  return price.toLocaleString('fr-FR') + ' €';
}

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function locationOverlap(preferred: string[], propertyLocation: string, propertyCity: string): boolean {
  const normLoc = normalize(propertyLocation);
  const normCity = normalize(propertyCity);

  return preferred.some((pref) => {
    const normPref = normalize(pref);
    return (
      normLoc.includes(normPref) ||
      normPref.includes(normLoc) ||
      normCity.includes(normPref) ||
      normPref.includes(normCity)
    );
  });
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

function scoreBudget(budget: number | undefined, price: number): { score: number; reason: string | null } {
  if (!budget) return { score: 0, reason: null };

  const ratio = price / budget;

  if (ratio >= 0.8 && ratio <= 1.0) {
    return {
      score: 35,
      reason: `Budget compatible : ${formatPrice(budget)} / ${formatPrice(price)}`,
    };
  }
  if (ratio > 1.0 && ratio <= 1.2) {
    return {
      score: 25,
      reason: `Budget proche : ${formatPrice(budget)} / ${formatPrice(price)} (légèrement au-dessus)`,
    };
  }
  if (ratio >= 0.5 && ratio < 0.8) {
    return {
      score: 15,
      reason: `Budget large : ${formatPrice(budget)} / ${formatPrice(price)}`,
    };
  }
  return { score: 5, reason: `Écart de budget : ${formatPrice(budget)} / ${formatPrice(price)}` };
}

function scoreLocation(
  preferredLocations: string[],
  propertyLocation: string,
  propertyCity: string,
): { score: number; reason: string | null } {
  if (preferredLocations.length === 0) return { score: 0, reason: null };

  if (locationOverlap(preferredLocations, propertyLocation, propertyCity)) {
    return {
      score: 30,
      reason: `Localisation : ${propertyLocation} correspond aux préférences`,
    };
  }

  // Check city-level match
  const normCity = normalize(propertyCity);
  const cityMatch = preferredLocations.some((loc) => normalize(loc).includes(normCity));
  if (cityMatch) {
    return {
      score: 15,
      reason: `Même ville : ${propertyCity}`,
    };
  }

  return { score: 0, reason: null };
}

function scoreType(
  preferredTypes: string[],
  propertyType: string,
): { score: number; reason: string | null } {
  if (preferredTypes.length === 0) return { score: 0, reason: null };

  const typeLabels: Record<string, string> = {
    apartment: 'Appartement',
    house: 'Maison',
    land: 'Terrain',
    commercial: 'Local commercial',
  };

  if (preferredTypes.includes(propertyType)) {
    return {
      score: 20,
      reason: `Type : ${typeLabels[propertyType] ?? propertyType} recherché`,
    };
  }

  return { score: 0, reason: null };
}

function scoreRooms(
  budget: number | undefined,
  propertyRooms: number,
  propertySurface: number,
): { score: number; reason: string | null } {
  if (!budget || propertyRooms === 0) return { score: 0, reason: null };

  // Simple heuristic: higher budget → expect more rooms
  const expectedRooms = budget < 200000 ? 2 : budget < 400000 ? 3 : budget < 600000 ? 4 : 5;
  const diff = Math.abs(expectedRooms - propertyRooms);

  if (diff <= 1) {
    return {
      score: 15,
      reason: `${propertyRooms} pièces / ${propertySurface} m² adapté au profil`,
    };
  }

  return { score: 5, reason: null };
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function matchBuyerToProperties(contact: Contact, properties: Property[]): MatchResult[] {
  if (contact.type === 'seller') return [];

  const availableProperties = properties.filter((p) => p.status === 'available' || p.status === 'under_offer');

  const results: MatchResult[] = availableProperties
    .map((property) => {
      const reasons: string[] = [];
      let totalScore = 0;

      const budget = scoreBudget(contact.budget, property.price);
      totalScore += budget.score;
      if (budget.reason) reasons.push(budget.reason);

      const location = scoreLocation(contact.preferredLocations, property.location, property.city);
      totalScore += location.score;
      if (location.reason) reasons.push(location.reason);

      const type = scoreType(contact.preferredTypes, property.type);
      totalScore += type.score;
      if (type.reason) reasons.push(type.reason);

      const rooms = scoreRooms(contact.budget, property.rooms, property.surface);
      totalScore += rooms.score;
      if (rooms.reason) reasons.push(rooms.reason);

      const clampedScore = Math.min(100, Math.max(0, totalScore));

      return {
        id: generateMatchId(),
        contactId: contact.id,
        propertyId: property.id,
        score: clampedScore,
        reasons,
        createdAt: new Date().toISOString(),
      };
    })
    .filter((m) => m.score > 20);

  results.sort((a, b) => b.score - a.score);
  return results;
}

export function matchPropertyToBuyers(property: Property, contacts: Contact[]): MatchResult[] {
  const buyers = contacts.filter((c) => c.type === 'buyer' || c.type === 'both');

  const results: MatchResult[] = buyers
    .map((contact) => {
      const reasons: string[] = [];
      let totalScore = 0;

      const budget = scoreBudget(contact.budget, property.price);
      totalScore += budget.score;
      if (budget.reason) reasons.push(budget.reason);

      const location = scoreLocation(contact.preferredLocations, property.location, property.city);
      totalScore += location.score;
      if (location.reason) reasons.push(location.reason);

      const type = scoreType(contact.preferredTypes, property.type);
      totalScore += type.score;
      if (type.reason) reasons.push(type.reason);

      const rooms = scoreRooms(contact.budget, property.rooms, property.surface);
      totalScore += rooms.score;
      if (rooms.reason) reasons.push(rooms.reason);

      const clampedScore = Math.min(100, Math.max(0, totalScore));

      return {
        id: generateMatchId(),
        contactId: contact.id,
        propertyId: property.id,
        score: clampedScore,
        reasons,
        createdAt: new Date().toISOString(),
      };
    })
    .filter((m) => m.score > 20);

  results.sort((a, b) => b.score - a.score);
  return results;
}
