// EstateFlow CRM - Core Types

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: 'buyer' | 'seller' | 'both';
  budget?: number;
  preferredLocations: string[];
  preferredTypes: string[];
  notes: string;
  score: number;
  status: 'new' | 'active' | 'negotiating' | 'closed' | 'lost';
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: 'apartment' | 'house' | 'land' | 'commercial';
  price: number;
  surface: number;
  rooms: number;
  bedrooms: number;
  location: string;
  city: string;
  zipCode: string;
  images: string[];
  features: string[];
  status: 'available' | 'under_offer' | 'sold' | 'off_market';
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  aiDescription?: string;
}

export interface Deal {
  id: string;
  title: string;
  propertyId: string;
  buyerId: string;
  sellerId: string;
  status: 'lead' | 'viewing' | 'offer' | 'negotiation' | 'closing' | 'won' | 'lost';
  value: number;
  commission: number;
  notes: string;
  stage: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  contactId?: string;
  propertyId?: string;
  dealId?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'ai_suggestion';
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface MatchResult {
  id: string;
  contactId: string;
  propertyId: string;
  score: number;
  reasons: string[];
  createdAt: string;
}

export interface DashboardStats {
  totalContacts: number;
  totalProperties: number;
  activeDeals: number;
  revenue: number;
  conversionRate: number;
  hotLeads: number;
}
