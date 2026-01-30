import { useState, useEffect, useCallback } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { validateForm, validateEmail, validatePhone } from '../../utils/validation';
import useToastStore from '../../stores/toastStore';
import { todayISO } from '../../utils/dateUtils';

/** Importált adatok  Ingatlan információk rlap értékek (ugyanaz a normalizálás mint a store Excel/CSV import). */
function normalizeImportedToForm(importedData) {
  if (!importedData || typeof importedData !== 'object') return {};
  const out = {};
  const v = (k) => importedData[k];
  // Van jelenleg kiadó ingatlanod  igen_van / hamarosan_lesz / nem
  if (v('van_jelenleg_kiado_ingatlanod_vagy_hamarosan_lesz')) {
    const val = String(v('van_jelenleg_kiado_ingatlanod_vagy_hamarosan_lesz')).toLowerCase().replace(/[,_]/g, ' ');
    if (val.includes('igen') && val.includes('van')) out.hasProperty = 'igen_van';
    else if (val.includes('hamarosan')) out.hasProperty = 'hamarosan_lesz';
    else if (val.includes('nem')) out.hasProperty = 'nem';
  }
  // Jelenleg milyen formában adod ki  airbnb_rövidtáv / hosszútáv / nincs_kiadva_még
  if (v('jelenleg_milyen_formaban_adod_ki')) {
    const val = String(v('jelenleg_milyen_formaban_adod_ki')).toLowerCase().replace(/[/_\s]/g, ' ');
    if (val.includes('airbnb') && (val.includes('rövid') || val.includes('rovid') || val.includes('rovidtav'))) out.currentRentalType = 'airbnb_rövidtáv';
    else if (val.includes('hossz') || val.includes('hosszu')) out.currentRentalType = 'hosszútáv';
    else if (val.includes('nincs')) out.currentRentalType = 'nincs_kiadva_még';
  }
  // Van most aktív üzemeltetd  igen / nincs
  if (v('van_most_aktiv_uzemeltetod')) {
    const val = String(v('van_most_aktiv_uzemeltetod')).toLowerCase();
    out.hasOperator = val.includes('igen') ? 'igen' : 'nincs';
  }
  if (v('miert_szeretnel_uzemeltetot_valtani')) out.whyChangeOperator = v('miert_szeretnel_uzemeltetot_valtani');
  if (v('melyik_varosban_talalhato_az_ingatlan')) out.city = v('melyik_varosban_talalhato_az_ingatlan');
  if (v('jelentkezett')) {
    try {
      const raw = v('jelentkezett');
      const date = raw instanceof Date ? raw : new Date(raw);
      if (!isNaN(date.getTime())) out.applicationDate = date.toISOString().split('T')[0];
      else out.applicationDate = raw;
    } catch (_) {
      out.applicationDate = v('jelentkezett');
    }
  }
  return out;
}

const LeadDetailModal = ({ isOpen, onClose, lead, onSave, onStartWizard, defaultApplicationDate }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    hasProperty: '', // igen_van / hamarosan_lesz / nem
    currentRentalType: '', // airbnb_rövidtáv / hosszútáv / nincs_kiadva_még
    hasOperator: '', // igen / nincs
    whyChangeOperator: '',
    city: '',
    source: 'website',
    applicationDate: todayISO(),
    notes: '',
    photoLink: '', // Fotó link (email/drive)
    importedData: {} // Excel importból származó további adatok
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (lead) {
      const imported = lead.importedData || {};
      const normalized = normalizeImportedToForm(imported);
      const base = {
        name: lead.name || '',
        phone: lead.phone || '',
        email: lead.email || '',
        hasProperty: lead.hasProperty || '',
        currentRentalType: lead.currentRentalType || '',
        hasOperator: lead.hasOperator || '',
        whyChangeOperator: lead.whyChangeOperator || '',
        city: lead.city || '',
        source: lead.source || 'website',
        applicationDate: lead.applicationDate || lead.createdAt || todayISO(),
        notes: lead.notes || '',
        photoLink: lead.photoLink || '',
        importedData: imported
      };
      // Importált adatok egyeztetése az Ingatlan információkkal: ha van import, normalizált értékek felülírják
      if (Object.keys(normalized).length > 0) {
        if (normalized.hasProperty != null) base.hasProperty = normalized.hasProperty;
        if (normalized.currentRentalType != null) base.currentRentalType = normalized.currentRentalType;
        if (normalized.hasOperator != null) base.hasOperator = normalized.hasOperator;
        if (normalized.whyChangeOperator != null) base.whyChangeOperator = normalized.whyChangeOperator;
        if (normalized.city != null) base.city = normalized.city;
        if (normalized.applicationDate != null) base.applicationDate = normalized.applicationDate;
      }
      setFormData(base);
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        hasProperty: '',
        currentRentalType: '',
        hasOperator: '',
        whyChangeOperator: '',
        city: '',
        source: 'website',
        applicationDate: defaultApplicationDate || todayISO(),
        notes: '',
        photoLink: '',
        importedData: {}
      });
    }
    setErrors({});
  }, [lead, isOpen, defaultApplicationDate]);

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [errors]);

  const handleSave = useCallback(() => {
    const validationRules = {
      name: [{ type: 'required' }],
      email: lead ? [] : ['email'],
      phone: []
    };

    const validation = validateForm(formData, validationRules);
    if (!validation.isValid) {
      setErrors(validation.errors);
      useToastStore.getState().error('Kérjük, töltse ki a kötelez mezket!');
      return;
    }

    if (formData.email && !validateEmail(formData.email)) {
      setErrors({ email: 'Érvénytelen email cím' });
      useToastStore.getState().error('Érvénytelen email cím');
      return;
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      setErrors({ phone: 'Érvénytelen telefonszám' });
      useToastStore.getState().error('Érvénytelen telefonszám');
      return;
    }

    onSave(formData);
  }, [formData, lead, onSave]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lead ? 'Lead adatlap' : 'Új lead'}
      size="lg"
    >
      <div className="space-y-6">
        {/* Alapadatok */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Alapadatok</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lead-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Név *
              </label>
              <input
                id="lead-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } dark:bg-gray-700 dark:text-gray-200`}
                required
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="lead-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Telefonszám
              </label>
              <input
                id="lead-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } dark:bg-gray-700 dark:text-gray-200`}
                placeholder="+36 30 123 4567"
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="lead-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                id="lead-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } dark:bg-gray-700 dark:text-gray-200`}
                placeholder="pelda@email.com"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
          </div>
        </div>

        {/* Excel importból származó további adatok */}
        {formData.importedData && Object.keys(formData.importedData).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Importált adatok (Excel)</h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                Az alábbi adatok az Excel importból származnak:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(formData.importedData)
                  .filter(([key]) => !key.startsWith('_') && !key.endsWith('_original'))
                  .map(([key, value]) => {
                    // Eredeti oszlopnév keresése
                    const originalKey = formData.importedData[`_${key}_original`] || key;
                    return (
                      <div key={key} className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          {originalKey}
                        </div>
                        <div className="text-sm text-gray-800 dark:text-gray-200 break-words">
                          {String(value || '-')}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Ingatlan információk */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Ingatlan információk</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Van jelenleg kiadó ingatlanod, vagy hamarosan lesz? *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasProperty"
                    value="igen_van"
                    checked={formData.hasProperty === 'igen_van'}
                    onChange={(e) => handleChange('hasProperty', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Igen, van</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasProperty"
                    value="hamarosan_lesz"
                    checked={formData.hasProperty === 'hamarosan_lesz'}
                    onChange={(e) => handleChange('hasProperty', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Hamarosan lesz</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasProperty"
                    value="nem"
                    checked={formData.hasProperty === 'nem'}
                    onChange={(e) => handleChange('hasProperty', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Nem</span>
                </label>
              </div>
            </div>

            {formData.hasProperty === 'igen_van' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jelenleg milyen formában adod ki?
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="currentRentalType"
                      value="airbnb_rövidtáv"
                      checked={formData.currentRentalType === 'airbnb_rövidtáv'}
                      onChange={(e) => handleChange('currentRentalType', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Airbnb rövidtáv</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="currentRentalType"
                      value="hosszútáv"
                      checked={formData.currentRentalType === 'hosszútáv'}
                      onChange={(e) => handleChange('currentRentalType', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Hosszútáv</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="currentRentalType"
                      value="nincs_kiadva_még"
                      checked={formData.currentRentalType === 'nincs_kiadva_még'}
                      onChange={(e) => handleChange('currentRentalType', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Nincs kiadva még</span>
                  </label>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Van most aktív üzemeltetd?
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasOperator"
                    value="igen"
                    checked={formData.hasOperator === 'igen'}
                    onChange={(e) => handleChange('hasOperator', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Igen</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasOperator"
                    value="nincs"
                    checked={formData.hasOperator === 'nincs'}
                    onChange={(e) => handleChange('hasOperator', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Nincs</span>
                </label>
              </div>
            </div>

            {formData.hasOperator === 'igen' && (
              <div>
                <label htmlFor="lead-why-change" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Miért szeretnél üzemeltett váltani?
                </label>
                <textarea
                  id="lead-why-change"
                  value={formData.whyChangeOperator}
                  onChange={(e) => handleChange('whyChangeOperator', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Rövid leírás..."
                />
              </div>
            )}

            <div>
              <label htmlFor="lead-city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Melyik városban található az ingatlan?
              </label>
              <input
                id="lead-city"
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="pl. Budapest"
              />
            </div>
          </div>
        </div>

        {/* Rendszer adatok */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Rendszer adatok</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lead-source" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hirdetés forrása
              </label>
              <select
                id="lead-source"
                value={formData.source}
                onChange={(e) => handleChange('source', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="website">Weboldal</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="referral">Ajánlás</option>
                <option value="airbnb">Airbnb</option>
                <option value="booking">Booking</option>
                <option value="phone">Telefon</option>
                <option value="email">Email</option>
                <option value="other">Egyéb</option>
              </select>
            </div>
            <div>
              <label htmlFor="lead-application-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Jelentkezés dátuma
              </label>
              <input
                id="lead-application-date"
                type="date"
                value={formData.applicationDate}
                onChange={(e) => handleChange('applicationDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="lead-photo-link" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fotó link (Email/Drive)
              </label>
              <input
                id="lead-photo-link"
                type="url"
                value={formData.photoLink}
                onChange={(e) => handleChange('photoLink', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="https://drive.google.com/... vagy email link"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Fotók emailben vagy Drive-ra töltve, link beillesztése
              </p>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="lead-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Megjegyzések
              </label>
              <textarea
                id="lead-notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="További információk..."
              />
            </div>
          </div>
        </div>

        {/* Mveletek */}
        <div className="flex gap-2 pt-4 border-t dark:border-gray-700">
          <Button
            onClick={handleSave}
            variant="primary"
            className="flex-1"
          >
            Mentés
          </Button>
          {lead && (
            <Button
              onClick={() => onStartWizard && onStartWizard(lead)}
              variant="success"
              className="flex-1"
            >
              Értékesítési folyamat indítása
            </Button>
          )}
          <Button
            onClick={onClose}
            variant="secondary"
          >
            Mégse
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LeadDetailModal;
