import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useToastStore from '../stores/toastStore';
import { validateForm, validateEmail, validatePhone } from '../utils/validation';
import { authRegister } from '../services/api';
import { sendEmail, isEmailConfigured } from '../services/emailService';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const TOTAL_STEPS = 11;

const stepTitles = {
  1: 'Személyes adatok',
  2: 'Lakás adatai',
  3: 'IFA',
  4: 'Kiadásra hirdetett lakás',
  5: 'Ágyak',
  6: 'Platformok',
  7: 'WiFi',
  8: 'Csomag',
  9: 'Díjak',
  10: 'Összegzés',
  11: 'Piactér'
};

const PartnerRegistrationPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Form state - összes lépés adatai
  const [formData, setFormData] = useState({
    // 1. Személyes adatok
    lastName: '',
    firstName: '',
    email: '',
    phone: '',
    password: '',
    taxNumber: '',
    idType: 'szemelyi', // 'szemelyi' | 'utlevel' | 'jogositvany'
    idNumber: '',
    // Lakcím
    zipCode: '',
    city: '',
    street: '',
    floor: '',
    door: '',
    // Számlázási adatok
    billingSameAsAddress: true,
    billingZipCode: '',
    billingCity: '',
    billingStreet: '',
    billingFloor: '',
    billingDoor: '',
    billingTaxNumber: '',
    billingCompanyName: '',
    // 2. Lakás adatai
    apartmentName: '',
    apartmentAddress: '',
    apartmentCity: '',
    apartmentZipCode: '',
    apartmentGateCode: '',
    apartmentNotes: '',
    // 3. IFA
    ifaNumber: '',
    ifaType: '', // 'szemely' | 'ceg'
    // 4. Kiadásra hirdetett lakás
    isAdvertised: false,
    // 5. Ágyak
    beds: [],
    // 6. Platformok
    platforms: [], // ['airbnb', 'booking', 'szallas', 'other']
    // 7. WiFi
    wifiName: '',
    wifiPassword: '',
    // 8. Csomag
    packageType: '', // 'basic' | 'premium' | 'enterprise'
    // 9. Díjak
    cleaningFeeEur: 25,
    monthlyFeeEur: 30,
    managementFee: 25,
    tourismTaxType: 'percent', // 'percent' | 'fixed'
    tourismTaxPercent: 4,
    tourismTaxFixed: 0,
    // 10. Összegzés (nincs mező, csak megjelenítés)
    // 11. Piactér
    marketplaceAgreement: false
  });

  useEffect(() => {
    document.title = `Partner regisztráció - ${currentStep}. lépés a ${TOTAL_STEPS}-ből - SmartCRM`;
  }, [currentStep]);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Töröljük a hibaüzenetet, ha a mezőt kitöltik
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [fieldErrors]);

  const handleNext = useCallback(() => {
    // Validáció az aktuális lépéshez
    if (currentStep === 1) {
      const validation = validateForm(formData, {
        lastName: ['required', { type: 'length', min: 2, max: 100 }],
        firstName: ['required', { type: 'length', min: 2, max: 100 }],
        email: ['required', 'email'],
        password: ['required', { type: 'length', min: 6, max: 100 }],
        zipCode: ['required'],
        city: ['required'],
        street: ['required']
      });

      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        useToastStore.getState().error(firstError);
        return;
      }

      if (formData.email && !validateEmail(formData.email)) {
        useToastStore.getState().error('Érvényes email cím szükséges');
        return;
      }

      if (formData.phone && !validatePhone(formData.phone)) {
        useToastStore.getState().error('Érvényes telefonszám szükséges');
        return;
      }

      // Számlázási adatok másolása, ha ugyanaz
      if (formData.billingSameAsAddress) {
        setFormData((prev) => ({
          ...prev,
          billingZipCode: prev.zipCode,
          billingCity: prev.city,
          billingStreet: prev.street,
          billingFloor: prev.floor,
          billingDoor: prev.door
        }));
      }
    } else if (currentStep === 2) {
      const validation = validateForm(formData, {
        apartmentName: ['required', { type: 'length', min: 2, max: 200 }],
        apartmentAddress: ['required'],
        apartmentCity: ['required'],
        apartmentZipCode: ['required']
      });

      if (!validation.isValid) {
        setFieldErrors(validation.errors);
        const firstError = Object.values(validation.errors)[0];
        useToastStore.getState().error(firstError);
        return;
      }
      setFieldErrors({});
    } else if (currentStep === 11) {
      if (!formData.marketplaceAgreement) {
        useToastStore.getState().error('Az Általános Szerződési Feltételek elfogadása kötelező!');
        return;
      }
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, formData]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    // Utolsó validáció
    if (!formData.marketplaceAgreement) {
      useToastStore.getState().error('Az Általános Szerződési Feltételek elfogadása kötelező!');
      return;
    }

    setIsSubmitting(true);
    try {
      // API hívás a regisztrációhoz
      const registrationData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || '',
        company_name: formData.billingCompanyName || '',
        tax_number: formData.taxNumber || formData.billingTaxNumber || '',
        address: `${formData.zipCode} ${formData.city}, ${formData.street}${formData.floor ? ` ${formData.floor}. em.` : ''}${formData.door ? ` ${formData.door}. ajtó` : ''}`,
        // Lakás adatok
        apartment: formData.apartmentName ? {
          name: formData.apartmentName,
          address: formData.apartmentAddress,
          city: formData.apartmentCity,
          zipCode: formData.apartmentZipCode,
          gateCode: formData.apartmentGateCode,
          notes: formData.apartmentNotes,
          cleaningFeeEur: formData.cleaningFeeEur,
          monthlyFeeEur: formData.monthlyFeeEur,
          managementFee: formData.managementFee,
          tourismTaxType: formData.tourismTaxType,
          tourismTaxPercent: formData.tourismTaxPercent,
          tourismTaxFixed: formData.tourismTaxFixed,
          platforms: formData.platforms,
          beds: formData.beds,
          wifiName: formData.wifiName,
          wifiPassword: formData.wifiPassword,
          isAdvertised: formData.isAdvertised,
          ifaNumber: formData.ifaNumber,
          ifaType: formData.ifaType
        } : null,
        packageType: formData.packageType,
        // Teljes form adatok (backup)
        formData: formData
      };
      
      await authRegister(registrationData);
      
      // Email küldése a regisztrációról
      if (isEmailConfigured()) {
        try {
          const emailBody = `
Kedves ${formData.firstName} ${formData.lastName}!

Köszönjük, hogy regisztráltál a SmartCRM partner portálra.

Regisztrációs adataid:
- Név: ${formData.firstName} ${formData.lastName}
- Email: ${formData.email}
${formData.apartmentName ? `- Lakás: ${formData.apartmentName}` : ''}

A fiókod jóváhagyásra vár. Hamarosan értesítünk, amikor aktívvá válik.

Üdvözlettel,
SmartCRM csapat
          `.trim();
          
          const emailHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #2563eb;">Köszönjük a regisztrációt!</h2>
  <p>Kedves <strong>${formData.firstName} ${formData.lastName}</strong>!</p>
  <p>Köszönjük, hogy regisztráltál a SmartCRM partner portálra.</p>
  
  <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0;">Regisztrációs adataid:</h3>
    <p><strong>Név:</strong> ${formData.firstName} ${formData.lastName}</p>
    <p><strong>Email:</strong> ${formData.email}</p>
    ${formData.apartmentName ? `<p><strong>Lakás:</strong> ${formData.apartmentName}</p>` : ''}
  </div>
  
  <p>A fiókod jóváhagyásra vár. Hamarosan értesítünk, amikor aktívvá válik.</p>
  
  <p style="margin-top: 30px; color: #6b7280;">
    Üdvözlettel,<br>
    <strong>SmartCRM csapat</strong>
  </p>
</div>
          `.trim();
          
          await sendEmail({
            to: formData.email,
            subject: 'Sikeres regisztráció - SmartCRM Partner Portál',
            body: emailBody,
            html: emailHtml
          });
        } catch (emailError) {
          // Email hiba nem akadályozza meg a regisztrációt
          if (import.meta.env.DEV) {
            console.warn('[PartnerRegistration] Email küldési hiba:', emailError);
          }
        }
      }
      
      useToastStore.getState().success('Sikeres regisztráció! A fiók jóváhagyásra vár.');
      navigate('/login');
    } catch (error) {
      const errorMessage = error?.message || error?.data?.error || 'Hiba a regisztráció során. Kérjük, próbálja újra.';
      useToastStore.getState().error(errorMessage);
      if (import.meta.env.DEV) {
        console.error('Regisztrációs hiba:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, navigate]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <span>👤</span> Személyes adatok
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Vezetéknév *
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      fieldErrors.lastName ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Kovács"
                    required
                  />
                  {fieldErrors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.lastName}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Keresztnév *
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      fieldErrors.firstName ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="János"
                    required
                  />
                  {fieldErrors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.firstName}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      fieldErrors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="pelda@email.com"
                    required
                  />
                  {fieldErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Telefonszám
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+36 30 123 4567"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Jelszó (visszalépéshez) *
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      fieldErrors.password ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Válasszon jelszót a belépéshez"
                    required
                  />
                  {fieldErrors.password && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Ezzel a jelszóval tud majd bejelentkezni a partner portálra
                  </p>
                </div>
                
                <div>
                  <label htmlFor="taxNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Adószám
                  </label>
                  <input
                    id="taxNumber"
                    type="text"
                    value={formData.taxNumber}
                    onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                    className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="12345678-1-41"
                  />
                </div>
                
                <div>
                  <label htmlFor="idType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Igazolvány típusa
                  </label>
                  <select
                    id="idType"
                    value={formData.idType}
                    onChange={(e) => handleInputChange('idType', e.target.value)}
                    className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="szemelyi">Személyi igazolvány</option>
                    <option value="utlevel">Útlevél</option>
                    <option value="jogositvany">Jogosítvány</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Személyi ig. szám
                  </label>
                  <input
                    id="idNumber"
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) => handleInputChange('idNumber', e.target.value)}
                    className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123456AB"
                  />
                </div>
              </div>
              
              {/* Lakcím */}
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <span>📍</span> Lakcím
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Irányítószám *
                    </label>
                    <input
                      id="zipCode"
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      className={`w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        fieldErrors.zipCode ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="1051"
                      required
                    />
                    {fieldErrors.zipCode && (
                      <p className="text-red-500 text-xs mt-1">{fieldErrors.zipCode}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Város *
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        fieldErrors.city ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Budapest"
                      required
                    />
                    {fieldErrors.city && (
                      <p className="text-red-500 text-xs mt-1">{fieldErrors.city}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Utca, házszám *
                    </label>
                    <input
                      id="street"
                      type="text"
                      value={formData.street}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                      className={`w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        fieldErrors.street ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Váci utca 12."
                      required
                    />
                    {fieldErrors.street && (
                      <p className="text-red-500 text-xs mt-1">{fieldErrors.street}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="floor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Emelet
                    </label>
                    <input
                      id="floor"
                      type="text"
                      value={formData.floor}
                      onChange={(e) => handleInputChange('floor', e.target.value)}
                      className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="3"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="door" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ajtó
                    </label>
                    <input
                      id="door"
                      type="text"
                      value={formData.door}
                      onChange={(e) => handleInputChange('door', e.target.value)}
                      className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="12"
                    />
                  </div>
                </div>
              </div>
              
              {/* Számlázási adatok */}
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <span>🧾</span> Számlázási adatok
                </h4>
                
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.billingSameAsAddress}
                      onChange={(e) => {
                        handleInputChange('billingSameAsAddress', e.target.checked);
                        if (e.target.checked) {
                          setFormData((prev) => ({
                            ...prev,
                            billingZipCode: prev.zipCode,
                            billingCity: prev.city,
                            billingStreet: prev.street,
                            billingFloor: prev.floor,
                            billingDoor: prev.door
                          }));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Ugyanaz, mint a lakcím</span>
                  </label>
                </div>
                
                {!formData.billingSameAsAddress && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="billingZipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Irányítószám
                      </label>
                      <input
                        id="billingZipCode"
                        type="text"
                        value={formData.billingZipCode}
                        onChange={(e) => handleInputChange('billingZipCode', e.target.value)}
                        className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1051"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Város
                      </label>
                      <input
                        id="billingCity"
                        type="text"
                        value={formData.billingCity}
                        onChange={(e) => handleInputChange('billingCity', e.target.value)}
                        className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Budapest"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="billingStreet" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Utca, házszám
                      </label>
                      <input
                        id="billingStreet"
                        type="text"
                        value={formData.billingStreet}
                        onChange={(e) => handleInputChange('billingStreet', e.target.value)}
                        className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Váci utca 12."
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="billingFloor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Emelet
                      </label>
                      <input
                        id="billingFloor"
                        type="text"
                        value={formData.billingFloor}
                        onChange={(e) => handleInputChange('billingFloor', e.target.value)}
                        className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="3"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="billingDoor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Ajtó
                      </label>
                      <input
                        id="billingDoor"
                        type="text"
                        value={formData.billingDoor}
                        onChange={(e) => handleInputChange('billingDoor', e.target.value)}
                        className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="12"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="billingTaxNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Adószám
                      </label>
                      <input
                        id="billingTaxNumber"
                        type="text"
                        value={formData.billingTaxNumber}
                        onChange={(e) => handleInputChange('billingTaxNumber', e.target.value)}
                        className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="12345678-1-42"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="billingCompanyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Cégnév (opcionális)
                      </label>
                      <input
                        id="billingCompanyName"
                        type="text"
                        value={formData.billingCompanyName}
                        onChange={(e) => handleInputChange('billingCompanyName', e.target.value)}
                        className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Kovács Kft."
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <span>🏠</span> Lakás adatai
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="apartmentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lakás neve *
                </label>
                <input
                  id="apartmentName"
                  type="text"
                  value={formData.apartmentName}
                  onChange={(e) => handleInputChange('apartmentName', e.target.value)}
                  className={`w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.apartmentName ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Pl. Modern lakás a belvárosban"
                  required
                />
                {fieldErrors.apartmentName && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.apartmentName}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="apartmentZipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Irányítószám *
                </label>
                <input
                  id="apartmentZipCode"
                  type="text"
                  value={formData.apartmentZipCode}
                  onChange={(e) => handleInputChange('apartmentZipCode', e.target.value)}
                  className={`w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.apartmentZipCode ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="1051"
                  required
                />
                {fieldErrors.apartmentZipCode && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.apartmentZipCode}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="apartmentCity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Város *
                </label>
                <input
                  id="apartmentCity"
                  type="text"
                  value={formData.apartmentCity}
                  onChange={(e) => handleInputChange('apartmentCity', e.target.value)}
                  className={`w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.apartmentCity ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Budapest"
                  required
                />
                {fieldErrors.apartmentCity && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.apartmentCity}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="apartmentAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cím (utca, házszám) *
                </label>
                <input
                  id="apartmentAddress"
                  type="text"
                  value={formData.apartmentAddress}
                  onChange={(e) => handleInputChange('apartmentAddress', e.target.value)}
                  className={`w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.apartmentAddress ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Váci utca 12."
                  required
                />
                {fieldErrors.apartmentAddress && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.apartmentAddress}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="apartmentGateCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kapukód
                </label>
                <input
                  id="apartmentGateCode"
                  type="text"
                  value={formData.apartmentGateCode}
                  onChange={(e) => handleInputChange('apartmentGateCode', e.target.value)}
                  className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1234"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="apartmentNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Megjegyzések
                </label>
                <textarea
                  id="apartmentNotes"
                  value={formData.apartmentNotes}
                  onChange={(e) => handleInputChange('apartmentNotes', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="További információk a lakásról..."
                />
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <span>📋</span> IFA
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ifaType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  IFA típusa
                </label>
                <select
                  id="ifaType"
                  value={formData.ifaType}
                  onChange={(e) => handleInputChange('ifaType', e.target.value)}
                  className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Válasszon...</option>
                  <option value="szemely">Személy</option>
                  <option value="ceg">Cég</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="ifaNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  IFA szám
                </label>
                <input
                  id="ifaNumber"
                  type="text"
                  value={formData.ifaNumber}
                  onChange={(e) => handleInputChange('ifaNumber', e.target.value)}
                  className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12345678"
                />
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <span>📢</span> Kiadásra hirdetett lakás
            </h3>
            
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isAdvertised}
                  onChange={(e) => handleInputChange('isAdvertised', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  A lakás jelenleg kiadásra van hirdetve
                </span>
              </label>
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <span>🛏️</span> Ágyak
            </h3>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Adja meg a lakásban található ágyak számát és típusát
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Egyágyas', 'Kétágyas', 'Franciaágy', 'Kanapéágy'].map((bedType) => (
                  <div key={bedType} className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={formData.beds.find(b => b.type === bedType)?.count || 0}
                      onChange={(e) => {
                        const count = parseInt(e.target.value) || 0;
                        setFormData((prev) => {
                          const beds = [...prev.beds];
                          const index = beds.findIndex(b => b.type === bedType);
                          if (count > 0) {
                            if (index >= 0) {
                              beds[index] = { type: bedType, count };
                            } else {
                              beds.push({ type: bedType, count });
                            }
                          } else if (index >= 0) {
                            beds.splice(index, 1);
                          }
                          return { ...prev, beds };
                        });
                      }}
                      className="w-20 px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                    <label className="text-sm text-gray-700 dark:text-gray-300">{bedType}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <span>🌐</span> Platformok
            </h3>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Válassza ki, hogy mely platformokon szeretné hirdetni a lakást
              </p>
              
              <div className="space-y-2">
                {[
                  { id: 'airbnb', label: 'Airbnb', icon: '🏠' },
                  { id: 'booking', label: 'Booking.com', icon: '📅' },
                  { id: 'szallas', label: 'Szallas.hu', icon: '🏨' },
                  { id: 'other', label: 'Egyéb', icon: '🔗' }
                ].map((platform) => (
                  <label key={platform.id} className="flex items-center gap-2 cursor-pointer p-3 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.platforms.includes(platform.id)}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          platforms: e.target.checked
                            ? [...prev.platforms, platform.id]
                            : prev.platforms.filter(p => p !== platform.id)
                        }));
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-lg">{platform.icon}</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{platform.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 7:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <span>📶</span> WiFi
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="wifiName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  WiFi hálózat neve
                </label>
                <input
                  id="wifiName"
                  type="text"
                  value={formData.wifiName}
                  onChange={(e) => handleInputChange('wifiName', e.target.value)}
                  className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="WiFi-Network"
                />
              </div>
              
              <div>
                <label htmlFor="wifiPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  WiFi jelszó
                </label>
                <input
                  id="wifiPassword"
                  type="password"
                  value={formData.wifiPassword}
                  onChange={(e) => handleInputChange('wifiPassword', e.target.value)}
                  className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
        );
      
      case 8:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <span>📦</span> Csomag
            </h3>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Válassza ki a kívánt csomagot
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'basic', label: 'Alap', price: 'Ingyenes', features: ['Alapvető funkciók', '1 lakás'] },
                  { id: 'premium', label: 'Prémium', price: '9,990 Ft/hó', features: ['Összes funkció', '5 lakás', 'Prioritás támogatás'] },
                  { id: 'enterprise', label: 'Enterprise', price: 'Egyedi ár', features: ['Összes funkció', 'Korlátlan lakás', 'Dedikált támogatás'] }
                ].map((pkg) => (
                  <label
                    key={pkg.id}
                    className={`flex flex-col p-4 border-2 rounded-lg cursor-pointer transition ${
                      formData.packageType === pkg.id
                        ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="packageType"
                      value={pkg.id}
                      checked={formData.packageType === pkg.id}
                      onChange={(e) => handleInputChange('packageType', e.target.value)}
                      className="sr-only"
                    />
                    <div className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-1">{pkg.label}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">{pkg.price}</div>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx}>• {feature}</li>
                      ))}
                    </ul>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 9:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <span>💰</span> Díjak
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cleaningFeeEur" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Takarítási díj (EUR) *
                </label>
                <input
                  id="cleaningFeeEur"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cleaningFeeEur}
                  onChange={(e) => handleInputChange('cleaningFeeEur', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="monthlyFeeEur" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Havi díj (EUR) *
                </label>
                <input
                  id="monthlyFeeEur"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monthlyFeeEur}
                  onChange={(e) => handleInputChange('monthlyFeeEur', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="managementFee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kezelési díj (%) *
                </label>
                <input
                  id="managementFee"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.managementFee}
                  onChange={(e) => handleInputChange('managementFee', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="tourismTaxType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Idegenforgalmi adó típusa
                </label>
                <select
                  id="tourismTaxType"
                  value={formData.tourismTaxType}
                  onChange={(e) => handleInputChange('tourismTaxType', e.target.value)}
                  className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="percent">Százalék</option>
                  <option value="fixed">Fix összeg</option>
                </select>
              </div>
              
              {formData.tourismTaxType === 'percent' ? (
                <div>
                  <label htmlFor="tourismTaxPercent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Idegenforgalmi adó (%)
                  </label>
                  <input
                    id="tourismTaxPercent"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.tourismTaxPercent}
                    onChange={(e) => handleInputChange('tourismTaxPercent', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="tourismTaxFixed" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Idegenforgalmi adó (EUR)
                  </label>
                  <input
                    id="tourismTaxFixed"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.tourismTaxFixed}
                    onChange={(e) => handleInputChange('tourismTaxFixed', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>
        );
      
      case 10:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <span>📄</span> Összegzés
            </h3>
            
            <div className="space-y-4">
              <Card className="p-4">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Személyes adatok</h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p><strong>Név:</strong> {formData.firstName} {formData.lastName}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Telefon:</strong> {formData.phone || 'Nincs megadva'}</p>
                </div>
              </Card>
              
              {formData.apartmentName && (
                <Card className="p-4">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Lakás adatai</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p><strong>Név:</strong> {formData.apartmentName}</p>
                    <p><strong>Cím:</strong> {formData.apartmentZipCode} {formData.apartmentCity}, {formData.apartmentAddress}</p>
                  </div>
                </Card>
              )}
              
              {formData.platforms.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Platformok</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formData.platforms.map(p => {
                      const labels = { airbnb: 'Airbnb', booking: 'Booking.com', szallas: 'Szallas.hu', other: 'Egyéb' };
                      return labels[p] || p;
                    }).join(', ')}
                  </div>
                </Card>
              )}
              
              {formData.packageType && (
                <Card className="p-4">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Csomag</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formData.packageType === 'basic' ? 'Alap' : formData.packageType === 'premium' ? 'Prémium' : 'Enterprise'}
                  </div>
                </Card>
              )}
            </div>
          </div>
        );
      
      case 11:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <span>🛒</span> Piactér
            </h3>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A regisztráció befejezéséhez kérjük, fogadja el az Általános Szerződési Feltételeket és az Adatvédelmi Szabályzatot.
              </p>
              
              <div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.marketplaceAgreement}
                    onChange={(e) => handleInputChange('marketplaceAgreement', e.target.checked)}
                    className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    required
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Elfogadom az <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Általános Szerződési Feltételeket</a> és az <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Adatvédelmi Szabályzatot</a> *
                  </span>
                </label>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {stepTitles[currentStep]} lépés - hamarosan elérhető
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Új lakás regisztrálása
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {currentStep}. lépés a {TOTAL_STEPS}-ből
            </p>
          </div>
          
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
                <div
                  key={step}
                  className={`flex-1 h-2 mx-1 rounded ${
                    step <= currentStep
                      ? 'bg-blue-600 dark:bg-blue-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  aria-label={`${step}. lépés: ${stepTitles[step]}`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{stepTitles[currentStep]}</span>
            </div>
          </div>
          
          {/* Step selector dropdown */}
          <div className="mb-6">
            <select
              value={currentStep}
              onChange={(e) => setCurrentStep(Number(e.target.value))}
              className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Lépés kiválasztása"
            >
              {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
                <option key={step} value={step}>
                  {step}. {stepTitles[step]}
                </option>
              ))}
            </select>
          </div>
          
          {/* Step content */}
          <div className="mb-8">
            {renderStepContent()}
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between gap-4">
            <Button
              onClick={handlePrevious}
              variant="secondary"
              disabled={currentStep === 1}
            >
              ← Vissza
            </Button>
            
            {currentStep < TOTAL_STEPS ? (
              <Button
                onClick={handleNext}
                variant="primary"
                className="ml-auto"
              >
                Tovább →
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                variant="success"
                className="ml-auto"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Regisztráció elküldése
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PartnerRegistrationPage;

