/**
 * SmartCRM Backend API client (smartcrm-cpanel).
 * Base URL: VITE_API_BASE_URL (pl. https://smartcrm.hu/api vagy http://localhost/smartcrm-cpanel/api)
 * OFFLINE MODE: Ha nincs API URL beállítva, localStorage-t használ
 */

import { retry } from '../utils/retry';

// OFFLINE MODE: Ha nincs API beállítva, nem hívunk meg semmi API-t
const baseURL = import.meta.env.VITE_API_BASE_URL || '';
const isOfflineMode = !baseURL;

function buildUrl(path, params = {}) {
  const p = path.replace(/^\//, '');
  const base = baseURL || window.location.origin;
  const url = new URL(p, base.endsWith('/') ? base : base + '/');
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') url.searchParams.set(k, String(v));
  });
  return url.toString();
}

async function request(method, path, { params, body, token, timeout = 30000, retries = 0 } = {}) {
  const performRequest = async () => {
    const url = buildUrl(path.startsWith('/') ? path : `/${path}`, params);
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // Timeout kezelés
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: body != null ? JSON.stringify(body) : undefined,
        credentials: 'include',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        throw new Error(res.ok ? 'Invalid JSON response' : text || res.statusText);
      }

      if (!res.ok) {
        const err = new Error(data?.error || data?.message || res.statusText);
        err.status = res.status;
        err.data = data;
        throw err;
      }
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Network error kezelés
      if (error.name === 'AbortError') {
        const timeoutErr = new Error('A kérés túllépte az idkorlátot. Kérjük, próbálja újra.');
        timeoutErr.status = 408;
        timeoutErr.isTimeout = true;
        throw timeoutErr;
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkErr = new Error('Hálózati hiba. Ellenrizze az internetkapcsolatot.');
        networkErr.status = 0;
        networkErr.isNetworkError = true;
        throw networkErr;
      }
      
      // Egyéb hibák továbbadása
      throw error;
    }
  };

  // Retry mechanizmus (ha retries > 0)
  if (retries > 0) {
    return retry(performRequest, {
      maxRetries: retries,
      delay: 1000,
      shouldRetry: (error) => {
        // Ne próbáljuk újra 4xx hibákat (kivéve 408 timeout és 429 rate limit)
        if (error?.status >= 400 && error?.status < 500) {
          return error?.status === 408 || error?.status === 429;
        }
        // Próbáljuk újra 5xx hibákat és network hibákat
        return true;
      }
    });
  }

  return performRequest();
}

export const api = {
  isConfigured: () => !isOfflineMode,

  get: (path, params, opts) => {
    if (isOfflineMode) {
      // Offline mode: return empty data, app uses localStorage
      return Promise.resolve([]);
    }
    return request('GET', path, { ...opts, params });
  },

  post: (path, body, opts) => {
    if (isOfflineMode) {
      // Offline mode: don't make API calls
      return Promise.resolve({ success: true });
    }
    return request('POST', path, { ...opts, body });
  },

  put: (path, body, opts) => {
    if (isOfflineMode) {
      // Offline mode: don't make API calls
      return Promise.resolve({ success: true });
    }
    return request('PUT', path, { ...opts, body });
  },

  delete: (path, opts) => {
    if (isOfflineMode) {
      // Offline mode: don't make API calls
      return Promise.resolve({ success: true });
    }
    return request('DELETE', path, opts);
  }
};

/** Auth */
export async function authLogin(email, password) {
  return api.post('auth/login', { email, password });
}

export async function authRegister(data) {
  return api.post('auth/register', data);
}

export async function authCheck() {
  return api.get('auth/check');
}

export async function authLogout() {
  return api.post('auth/logout');
}

export async function getMyPermissions() {
  return api.get('me/permissions');
}

/** Apartments */
export async function apartmentsList(params = {}) {
  const res = await api.get('apartments', params);
  return res?.apartments ?? res;
}

export async function apartmentsCreate(body) {
  return api.post('apartments', body);
}

export async function apartmentsUpdate(id, body) {
  return api.put(`apartments/${id}`, body);
}

export async function apartmentsDelete(id) {
  return api.delete(`apartments/${id}`);
}

/** iCal Sync */
export async function icalSync(apartmentId, feedId = null) {
  return api.post('ical/sync', { apartmentId, feedId });
}

export async function icalStatus(apartmentId) {
  return api.get(`ical/status/${apartmentId}`);
}

/** Bookings */
export async function bookingsList(params = {}) {
  const res = await api.get('bookings', params);
  return res?.bookings ?? res;
}

export async function bookingsCreate(body) {
  return api.post('bookings', body);
}

export async function bookingsUpdate(id, body) {
  return api.put(`bookings/${id}`, body);
}

export async function bookingsDelete(id) {
  return api.delete(`bookings/${id}`);
}

/** Stats overview */
export async function statsOverview(params = {}) {
  return api.get('stats/overview', params);
}

export async function statsWorkers(params = {}) {
  return api.get('stats/workers', params);
}

export async function statsApartments(params = {}) {
  return api.get('stats/apartments', params);
}

/** Leads */
export async function leadsList(params = {}) {
  const res = await api.get('leads', params);
  return res?.leads ?? res;
}

export async function leadsCreate(body) {
  return api.post('leads', body);
}

export async function leadsUpdate(id, body) {
  return api.put(`leads/${id}`, body);
}

export async function leadsDelete(id) {
  return api.delete(`leads/${id}`);
}

/** Marketing Campaigns */
export async function campaignsList(params = {}) {
  const res = await api.get('campaigns', params);
  return res?.campaigns ?? res;
}

export async function campaignsCreate(body) {
  return api.post('campaigns', body);
}

export async function campaignsUpdate(id, body) {
  return api.put(`campaigns/${id}`, body);
}

export async function campaignsDelete(id) {
  return api.delete(`campaigns/${id}`);
}

/** Mappers: API (snake_case)  frontend (camelCase) */
export function apartmentFromApi(a) {
  if (!a) return null;
  return {
    id: a.id,
    name: a.name,
    address: a.address,
    city: a.city ?? '',
    zipCode: a.zip_code ?? '',
    clientId: a.partner_id ?? '',
    clientName: a.partner_id ?? '',
    gateCode: a.door_code ?? '',
    timeFrame: a.time_frame ?? 2,
    cleaningFeeEur: a.cleaning_fee ?? 0,
    monthlyFeeEur: a.monthly_fee ?? 0,
    managementFee: a.management_fee ?? 25,
    tourismTaxType: a.tourism_tax_type ?? 'percent',
    tourismTaxPercent: a.tourism_tax_value ?? 4,
    tourismTaxFixed: 0,
    status: a.status ?? 'active',
    notes: a.notes ?? '',
    amenities: Array.isArray(a.amenities) ? a.amenities : (a.amenities ? JSON.parse(a.amenities) : []),
    inventory: Array.isArray(a.inventory) ? a.inventory.map((inv) => ({
      id: inv.id,
      itemType: inv.item_type ?? '',
      itemSize: inv.item_size ?? '',
      quantity: inv.quantity ?? 0,
      brand: inv.brand ?? '',
      notes: inv.notes ?? ''
    })) : [],
    icalAirbnb: a.ical_airbnb ?? '',
    icalBooking: a.ical_booking ?? '',
    icalSzallas: a.ical_szallas ?? '',
    icalOwn: a.ical_own ?? '',
    createdAt: a.created_at,
    updatedAt: a.updated_at
  };
}

export function apartmentToApi(a) {
  return {
    name: a.name,
    address: a.address,
    city: a.city ?? '',
    zip_code: a.zipCode ?? '',
    door_code: a.gateCode ?? '',
    ntak_number: a.ntakNumber ?? '',
    tax_number: a.taxNumber ?? '',
    size_sqm: a.sizeSqm != null ? Number(a.sizeSqm) : null,
    wifi_name: a.wifiName ?? '',
    wifi_password: a.wifiPassword ?? '',
    wifi_speed_mbps: a.wifiSpeedMbps != null ? Number(a.wifiSpeedMbps) : null,
    check_in_instructions: a.checkInInstructions ?? '',
    cleaning_fee: Number(a.cleaningFeeEur) || 0,
    management_fee: Number(a.managementFee) || 25,
    monthly_fee: Number(a.monthlyFeeEur) || 0,
    service_package: a.servicePackage ?? 'basic',
    parking_revenue_eur: Number(a.parkingRevenueEur) || 0,
    revenue_handling: a.revenueHandling ?? 'partner',
    annual_revenue_plan_min_eur: a.annualRevenuePlanMinEur != null ? Number(a.annualRevenuePlanMinEur) : null,
    annual_revenue_plan_expected_eur: a.annualRevenuePlanExpectedEur != null ? Number(a.annualRevenuePlanExpectedEur) : null,
    cost_plan_percent: a.costPlanPercent != null ? Number(a.costPlanPercent) : null,
    time_frame: Number(a.timeFrame) || 2,
    tourism_tax_type: a.tourismTaxType ?? 'percent',
    tourism_tax_value: Number(a.tourismTaxPercent) || 4,
    double_beds: Number(a.doubleBeds) || 0,
    sofa_bed_single: Number(a.sofaBedSingle) || 0,
    sofa_bed_double: Number(a.sofaBedDouble) || 0,
    other_double_beds: Number(a.otherDoubleBeds) || 0,
    max_guests: Number(a.maxGuests) || 0,
    guest_parking: a.guestParking ?? 'none',
    status: a.status ?? 'active',
    notes: a.notes ?? '',
    amenities: Array.isArray(a.amenities) ? a.amenities : [],
    inventory: Array.isArray(a.inventory) ? a.inventory.map((inv) => ({
      item_type: inv.itemType ?? '',
      item_size: inv.itemSize ?? '',
      quantity: Number(inv.quantity) || 0,
      brand: inv.brand ?? '',
      notes: inv.notes ?? ''
    })) : [],
    ical_airbnb: a.icalAirbnb ?? '',
    ical_booking: a.icalBooking ?? '',
    ical_szallas: a.icalSzallas ?? '',
    ical_own: a.icalOwn ?? ''
  };
}

export function bookingFromApi(b) {
  if (!b) return null;
  return {
    id: b.id,
    apartmentId: b.apartment_id,
    apartmentName: b.apartment_name,
    platform: b.platform ?? 'airbnb',
    guestName: b.guest_name ?? '',
    guestCount: b.guest_count ?? 1,
    dateFrom: b.check_in,
    dateTo: b.check_out,
    checkIn: b.check_in,
    checkOut: b.check_out,
    checkInTime: b.check_in_time ?? '15:00',
    checkOutTime: b.check_out_time ?? '11:00',
    nights: b.nights ?? 1,
    payoutFt: b.payout_ft ?? b.net_revenue ?? 0,
    payoutEur: b.payout_eur ?? null,
    netRevenue: b.net_revenue ?? 0,
    accommodationFt: b.accommodation_ft ?? null,
    cleaningFt: b.cleaning_ft ?? null,
    ifaFt: b.ifa_ft ?? null,
    otherFt: b.other_ft ?? null,
    status: b.status ?? 'confirmed',
    notes: b.notes ?? '',
    createdAt: b.created_at
  };
}

const API_PLATFORMS = ['airbnb', 'booking', 'direct', 'other'];
function platformToApi(p) {
  if (!p) return 'airbnb';
  const s = String(p).toLowerCase();
  return API_PLATFORMS.includes(s) ? s : 'other';
}

export function bookingToApi(b, forUpdate = false) {
  const dateFrom = b.dateFrom || b.checkIn;
  const dateTo = b.dateTo || b.checkOut;
  const fmt = (d) => (typeof d === 'string' ? d : d?.toISOString?.()?.split?.('T')[0] ?? '');
  const out = {
    apartment_id: b.apartmentId,
    check_in: fmt(dateFrom),
    check_out: fmt(dateTo),
    platform: platformToApi(b.platform),
    guest_name: b.guestName ?? '',
    guest_count: Number(b.guestCount) || 1,
    notes: b.notes ?? ''
  };
  const addNum = (key, val) => {
    if (val != null && val !== '') {
      out[key] = Number(val);
    }
  };
  addNum('payout_ft', b.payoutFt);
  addNum('payout_eur', b.payoutEur);
  addNum('accommodation_ft', b.accommodationFt);
  addNum('cleaning_ft', b.cleaningFt);
  addNum('ifa_ft', b.ifaFt);
  addNum('other_ft', b.otherFt);
  if (b.checkInTime != null && b.checkInTime !== '') out.check_in_time = b.checkInTime;
  if (b.checkOutTime != null && b.checkOutTime !== '') out.check_out_time = b.checkOutTime;
  if (forUpdate && (b.payoutFt != null || b.netRevenue != null)) {
    out.net_revenue = Number(b.payoutFt ?? b.netRevenue ?? 0);
  }
  return out;
}

/** Lead mappers: API (snake_case)  frontend (camelCase) */
export function leadFromApi(l) {
  if (!l) return null;
  return {
    id: l.id,
    name: l.name ?? '',
    email: l.email ?? '',
    phone: l.phone ?? '',
    source: l.source ?? 'website',
    status: l.status ?? 'new',
    rating: l.rating ?? 'warm',
    notes: l.notes ?? '',
    apartmentInterest: l.apartment_interest ?? '',
    budget: l.budget ?? '',
    assignedTo: l.assigned_to ?? '',
    createdAt: l.created_at ?? new Date().toISOString().split('T')[0],
    leadColor: l.lead_color ?? l.leadColor ?? null
  };
}

export function leadToApi(l) {
  return {
    name: l.name ?? '',
    email: l.email ?? '',
    phone: l.phone ?? '',
    source: l.source ?? 'website',
    status: l.status ?? 'uj_erdeklodo',
    rating: l.rating ?? 'warm',
    notes: l.notes ?? '',
    apartment_interest: l.apartmentInterest ?? '',
    budget: l.budget ?? '',
    assigned_to: l.assignedTo ?? '',
    has_property: l.hasProperty ?? '',
    current_rental_type: l.currentRentalType ?? '',
    has_operator: l.hasOperator ?? '',
    why_change_operator: l.whyChangeOperator ?? '',
    city: l.city ?? '',
    application_date: l.applicationDate ?? l.createdAt ?? new Date().toISOString().split('T')[0],
    lead_color: l.leadColor ?? l.lead_color ?? null
  };
}

/** Campaign mappers: API (snake_case)  frontend (camelCase) */
export function campaignFromApi(c) {
  if (!c) return null;
  return {
    id: c.id,
    name: c.name ?? '',
    channel: c.channel ?? 'website',
    status: c.status ?? 'draft',
    startDate: c.start_date ?? '',
    endDate: c.end_date ?? '',
    budget: Number(c.budget) || 0,
    spent: Number(c.spent) || 0,
    notes: c.notes ?? '',
    createdAt: c.created_at ?? new Date().toISOString().split('T')[0],
    updatedAt: c.updated_at
  };
}

export function campaignToApi(c) {
  return {
    name: c.name ?? '',
    channel: c.channel ?? 'website',
    status: c.status ?? 'draft',
    start_date: c.startDate ?? '',
    end_date: c.endDate ?? '',
    budget: Number(c.budget) || 0,
    spent: Number(c.spent) || 0,
    notes: c.notes ?? ''
  };
}

/** Users */
export async function usersList(params = {}) {
  const res = await api.get('users', params);
  return res?.users ?? res?.data ?? res;
}

export async function usersCreate(body) {
  return api.post('users', body);
}

export async function usersUpdate(id, body) {
  return api.put(`users/${id}`, body);
}

export async function usersGet(id) {
  return api.get(`users/${id}`);
}

/** Roles */
export async function rolesList() {
  return api.get('roles');
}

/** Settings */
export async function settingsGet() {
  const res = await api.get('settings');
  return res?.settings ?? res;
}

export async function settingsUpdate(body) {
  return api.put('settings', body);
}

/** Cleanings */
export async function cleaningsList(params = {}) {
  const res = await api.get('cleanings', params);
  return res?.cleanings ?? res?.data ?? res;
}

export async function cleaningsCreate(body) {
  return api.post('cleanings', body);
}

export async function cleaningsUpdate(id, body) {
  return api.put(`cleanings/${id}`, body);
}

export async function cleaningsDelete(id) {
  return api.delete(`cleanings/${id}`);
}

export async function cleaningsSummary(params = {}) {
  return api.get('cleanings/summary', params);
}

export async function cleaningsGenerateFromBookings(body) {
  return api.post('cleanings/generate-from-bookings', body);
}

/** Workers */
export async function workersList(params = {}) {
  const res = await api.get('workers', params);
  return res?.workers ?? res;
}

export async function workersCreate(body) {
  return api.post('workers', body);
}

export async function workersUpdate(id, body) {
  return api.put(`workers/${id}`, body);
}

export async function workersDelete(id) {
  return api.delete(`workers/${id}`);
}

export async function workersGet(id) {
  return api.get(`workers/${id}`);
}

export function workerFromApi(w) {
  if (!w) return null;
  return {
    id: w.id ?? '',
    userId: w.user_id ?? null,
    name: w.name ?? '',
    phone: w.phone ?? null,
    email: w.email ?? null,
    hourlyRate: w.hourly_rate != null ? Number(w.hourly_rate) : 2500,
    textileRate: w.textile_rate != null ? Number(w.textile_rate) : 600,
    status: w.status ?? 'active',
    notes: w.notes ?? null,
    createdAt: w.created_at ?? null,
    updatedAt: w.updated_at ?? null
  };
}

export function workerToApi(w) {
  return {
    user_id: w.userId ?? null,
    name: w.name ?? '',
    phone: w.phone ?? null,
    email: w.email ?? null,
    hourly_rate: Number(w.hourlyRate) || 2500,
    textile_rate: Number(w.textileRate) || 600,
    status: w.status ?? 'active',
    notes: w.notes ?? null
  };
}

/** Laundry Orders */
export async function laundryList(params = {}) {
  const res = await api.get('laundry', params);
  return res?.orders ?? res?.laundry ?? res;
}

export async function laundryCreate(body) {
  return api.post('laundry', body);
}

export async function laundryUpdate(id, body) {
  return api.put(`laundry/${id}`, body);
}

export async function laundryDelete(id) {
  return api.delete(`laundry/${id}`);
}

export async function laundryGet(id) {
  return api.get(`laundry/${id}`);
}

export function laundryFromApi(l) {
  if (!l) return null;
  return {
    id: l.id ?? '',
    apartmentId: l.apartment_id ?? '',
    apartmentName: l.apartment_name ?? null,
    orderDate: l.order_date ?? '',
    pickupDate: l.pickup_date ?? null,
    deliveryDate: l.delivery_date ?? null,
    bagCount: l.bag_count != null ? Number(l.bag_count) : 1,
    weightKg: l.weight_kg != null ? Number(l.weight_kg) : null,
    cost: l.cost != null ? Number(l.cost) : 0,
    status: l.status ?? 'pending',
    notes: l.notes ?? null,
    createdAt: l.created_at ?? null,
    updatedAt: l.updated_at ?? null
  };
}

export function laundryToApi(l) {
  return {
    apartment_id: l.apartmentId,
    order_date: l.orderDate ?? new Date().toISOString().split('T')[0],
    pickup_date: l.pickupDate ?? null,
    delivery_date: l.deliveryDate ?? null,
    bag_count: Number(l.bagCount) || 1,
    weight_kg: l.weightKg != null ? Number(l.weightKg) : null,
    cost: Number(l.cost) || 0,
    status: l.status ?? 'pending',
    notes: l.notes ?? null
  };
}

/** Cleaning mappers: API (snake_case)  frontend (camelCase) */
export function cleaningFromApi(c) {
  if (!c) return null;
  return {
    id: c.id,
    apartmentId: c.apartment_id,
    apartmentName: c.apartment_name ?? '',
    bookingId: c.booking_id ?? null,
    date: c.date ?? '',
    amount: Number(c.amount) || 0,
    currency: c.currency ?? 'HUF',
    status: c.status ?? 'planned',
    assigneeUserId: c.assignee_user_id ?? null,
    assigneeName: c.assignee_name ?? null,
    notes: c.notes ?? null,
    cleaningHours: c.cleaning_hours != null ? Number(c.cleaning_hours) : null,
    hasTextile: !!c.has_textile,
    textileEarnings: Number(c.textile_earnings) || 0,
    textileDeliveryMode: c.textile_delivery_mode ?? null,
    laundryTimeSlot: c.laundry_time_slot ?? null,
    textileWorkerFee: Number(c.textile_worker_fee) || 0,
    laundryCost: Number(c.laundry_cost) || 0,
    assignedWorkerCount: Number(c.assigned_worker_count) || 0,
    expenses: Number(c.expenses) || 0,
    expenseNote: c.expense_note ?? null,
    checkinTime: c.checkin_time ?? null,
    checkoutTime: c.checkout_time ?? null,
    booking: c.booking ? {
      guestName: c.booking.guest_name ?? '',
      checkIn: c.booking.check_in ?? '',
      checkOut: c.booking.check_out ?? ''
    } : null,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    createdBy: c.created_by ?? ''
  };
}

export function cleaningToApi(c) {
  const out = {
    apartment_id: c.apartmentId,
    booking_id: c.bookingId ?? null,
    date: c.date,
    amount: Number(c.amount) || 0,
    currency: c.currency ?? 'HUF',
    status: c.status ?? 'planned',
    assignee_user_id: c.assigneeUserId ?? null,
    notes: c.notes ?? null
  };
  if (c.cleaningHours != null) out.cleaning_hours = Number(c.cleaningHours);
  if (c.hasTextile != null) out.has_textile = !!c.hasTextile;
  if (c.textileEarnings != null) out.textile_earnings = Number(c.textileEarnings) || 0;
  if (c.textileDeliveryMode != null) out.textile_delivery_mode = c.textileDeliveryMode;
  if (c.laundryTimeSlot != null) out.laundry_time_slot = c.laundryTimeSlot;
  if (c.textileWorkerFee != null) out.textile_worker_fee = Number(c.textileWorkerFee) || 0;
  if (c.laundryCost != null) out.laundry_cost = Number(c.laundryCost) || 0;
  if (c.assignedWorkerCount != null) out.assigned_worker_count = Number(c.assignedWorkerCount) || 0;
  if (c.expenses != null) out.expenses = Number(c.expenses) || 0;
  if (c.expenseNote != null) out.expense_note = c.expenseNote;
  if (c.checkinTime != null) out.checkin_time = c.checkinTime;
  if (c.checkoutTime != null) out.checkout_time = c.checkoutTime;
  return out;
}

/** Test Data */
export async function loadTestData() {
  return api.post('test/load-seed-data');
}

/** Revenue Plan/Fact */
export async function revenueCreate(body) {
  return api.post('revenue/create', body);
}

/** AI Assistant - Chat */
export async function chatWithAI(body) {
  return api.post('chat', body);
}

/** AI Assistant - Knowledge Search */
export async function searchKnowledge(params) {
  return api.get('knowledge', params);
}

/** AI Assistant - Agent */
export async function startAgent(body) {
  return api.post('agent/start', body);
}

export async function getAgentStatus() {
  return api.get('agent/status');
}

/** AI Assistant - Voice */
export async function sendVoiceInput(body) {
  try {
    return await api.post('voice', body);
  } catch (error) {
    // Ha az API nem elérhet (fejlesztési környezetben), mock válasszal térünk vissza
    if (import.meta.env.DEV && (error.isNetworkError || error.status === 0 || error.status >= 500)) {
      console.log('Voice API not available, returning mock response');
      return {
        success: true,
        text: 'Köszönöm a kérdésedet. Segíthetek a SmartCRM rendszer használatában. Miben segíthetek?',
        message: 'Köszönöm a kérdésedet. Segíthetek a SmartCRM rendszer használatában. Miben segíthetek?'
      };
    }
    // Éles környezetben vagy valódi hibánál dobjuk a hibát
    throw error;
  }
}

/** AI Assistant - Calls */
export async function initiateCall(body) {
  return api.post('call/outgoing', body);
}

export default api;

