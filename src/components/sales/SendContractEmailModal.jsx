import { useState, useCallback, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { X } from '../common/Icons';
import { sendEmail } from '../../services/emailService';
import useToastStore from '../../stores/toastStore';

const SendContractEmailModal = ({ isOpen, onClose, lead, onSuccess }) => {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('Szerződés és regisztráció - SmartProperties');
  const [emailBody, setEmailBody] = useState('');
  const [selectedContract, setSelectedContract] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [includeRegistrationLink, setIncludeRegistrationLink] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Inicializálás lead adatokkal
  useEffect(() => {
    if (lead && isOpen) {
      setRecipient(lead.email || '');

      // Alapértelmezett email szöveg
      const defaultBody = `Kedves ${lead.name}!

Köszönjük az érdeklődését a SmartProperties szolgáltatásai iránt!

Mellékletben megtalálja a szerződést és a részletes információkat.

${includeRegistrationLink ? '\nPartner regisztrációs link: https://partners.smartproperties.hu\n' : ''}
Kérem, töltse ki a regisztrációs adatlapot és küldje vissza aláírva a szerződést.

Ha bármilyen kérdése van, bátran keressen minket!

Üdvözlettel,
SmartProperties csapata`;

      setEmailBody(defaultBody);
    }
  }, [lead, isOpen, includeRegistrationLink]);

  // Szerződés sablon változtatásakor
  useEffect(() => {
    if (selectedContract) {
      const contractAttachment = {
        id: `contract-${selectedContract}`,
        name: `Szerződés - ${selectedContract}.pdf`,
        type: 'contract',
        size: '245 KB'
      };

      // Frissítjük a csatolmányok listáját
      setAttachments(prev => {
        const filtered = prev.filter(att => att.type !== 'contract');
        return [...filtered, contractAttachment];
      });
    }
  }, [selectedContract]);

  // Lead adatlap automatikus hozzáadása
  useEffect(() => {
    if (lead && isOpen) {
      const leadDataAttachment = {
        id: 'lead-data',
        name: `${lead.name} - Adatlap.pdf`,
        type: 'lead-data',
        size: '128 KB'
      };

      setAttachments(prev => {
        const filtered = prev.filter(att => att.type !== 'lead-data');
        return [...filtered, leadDataAttachment];
      });
    }
  }, [lead, isOpen]);

  const handleRemoveAttachment = useCallback((attachmentId) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    if (attachmentId.startsWith('contract-')) {
      setSelectedContract('');
    }
  }, []);

  const handleSendEmail = useCallback(async () => {
    if (!recipient) {
      useToastStore.getState().error('Kérem, adja meg a címzett email címét!');
      return;
    }

    if (!subject) {
      useToastStore.getState().error('Kérem, adja meg az email tárgyát!');
      return;
    }

    if (!emailBody) {
      useToastStore.getState().error('Kérem, írja meg az email szövegét!');
      return;
    }

    setIsSending(true);

    try {
      // Email küldése
      const emailContent = includeRegistrationLink
        ? `${emailBody}\n\nPartner regisztrációs link: https://partners.smartproperties.hu`
        : emailBody;

      const result = await sendEmail({
        to: recipient,
        subject: subject,
        body: emailContent,
        html: emailContent.replace(/\n/g, '<br>')
      });

      if (result.success) {
        useToastStore.getState().success('Email sikeresen elküldve!');

        // Callback a sikeres küldés után
        if (onSuccess) {
          await onSuccess({
            lead,
            recipient,
            subject,
            body: emailContent,
            attachments,
            sentAt: new Date().toISOString()
          });
        }

        onClose();
      } else {
        useToastStore.getState().error(`Email küldése sikertelen: ${result.error || 'Ismeretlen hiba'}`);
      }
    } catch (error) {
      console.error('Email küldési hiba:', error);
      useToastStore.getState().error(`Email küldése sikertelen: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  }, [recipient, subject, emailBody, includeRegistrationLink, attachments, lead, onSuccess, onClose]);

  const handleClose = useCallback(() => {
    if (!isSending) {
      onClose();
    }
  }, [isSending, onClose]);

  // Szerződés sablonok (példa adatok - később lehet dinamikusan tölteni)
  const contractTemplates = [
    { id: 'alap', name: 'Alap csomag szerződés' },
    { id: 'pro', name: 'Pro csomag szerződés' },
    { id: 'max', name: 'Max csomag szerződés' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Szerződés küldése emailben"
      size="lg"
      showCloseButton={!isSending}
    >
      <div className="space-y-6">
        {/* Címzett */}
        <div>
          <label htmlFor="recipient-email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Címzett <span className="text-red-500">*</span>
          </label>
          <input
            id="recipient-email"
            type="email"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="partner@example.com"
            disabled={isSending}
          />
        </div>

        {/* Tárgy */}
        <div>
          <label htmlFor="email-subject" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Tárgy <span className="text-red-500">*</span>
          </label>
          <input
            id="email-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Email tárgya"
            disabled={isSending}
          />
        </div>

        {/* Email szöveg */}
        <div>
          <label htmlFor="email-body" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Email szövege <span className="text-red-500">*</span>
          </label>
          <textarea
            id="email-body"
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            rows={10}
            className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-y"
            placeholder="Írja ide az email szövegét..."
            disabled={isSending}
          />
        </div>

        {/* Csatolmányok */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Csatolmányok
          </label>

          {/* Szerződés sablon választó */}
          <div className="mb-4">
            <label htmlFor="contract-template" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Szerződés sablon
            </label>
            <select
              id="contract-template"
              value={selectedContract}
              onChange={(e) => setSelectedContract(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              disabled={isSending}
            >
              <option value="">Válasszon szerződés sablont...</option>
              {contractTemplates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Csatolt fájlok listája */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                Csatolt fájlok:
              </p>
              <div className="flex flex-wrap gap-2">
                {attachments.map(attachment => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg text-sm"
                  >
                    <span className="text-blue-700 dark:text-blue-300">📄</span>
                    <span className="font-medium text-blue-800 dark:text-blue-200">
                      {attachment.name}
                    </span>
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      ({attachment.size})
                    </span>
                    <button
                      onClick={() => handleRemoveAttachment(attachment.id)}
                      className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition"
                      aria-label={`${attachment.name} eltávolítása`}
                      disabled={isSending}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Partner regisztrációs link */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeRegistrationLink}
              onChange={(e) => setIncludeRegistrationLink(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              disabled={isSending}
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Partner regisztrációs link hozzáadása az emailhez
            </span>
          </label>
          {includeRegistrationLink && (
            <p className="mt-2 ml-8 text-xs text-gray-500 dark:text-gray-400">
              Link: <a href="https://partners.smartproperties.hu" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                https://partners.smartproperties.hu
              </a>
            </p>
          )}
        </div>

        {/* Gombok */}
        <div className="flex gap-3 justify-end pt-4 border-t dark:border-gray-700">
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={isSending}
          >
            Mégse
          </Button>
          <Button
            onClick={handleSendEmail}
            variant="primary"
            disabled={isSending || !recipient || !subject || !emailBody}
            className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
          >
            {isSending ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Küldés...
              </>
            ) : (
              <>
                📧 Email küldése
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SendContractEmailModal;
