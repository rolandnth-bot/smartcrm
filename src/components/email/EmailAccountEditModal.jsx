import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

/**
 * Megosztott Email fiók szerkesztés / új fiók modal.
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {{ id, email, password?, imapServer?, imapPort?, smtpServer?, smtpPort? } | null} account – null = új fiók
 * @param {{ imapServer?: string, imapPort?: number, smtpServer?: string, smtpPort?: number }} defaults – alapértelmezések új fióknál / hiányzó mezőknél
 * @param {(data: object) => void} onSave – { email, password, imapServer, imapPort, smtpServer, smtpPort }
 * @param {(id: number) => void} [onDelete] – csak szerkesztésnél; ha megadva, Törlés gomb megjelenik
 */
const EmailAccountEditModal = ({
  isOpen,
  onClose,
  account,
  defaults = {},
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    imapServer: '',
    imapPort: '',
    smtpServer: '',
    smtpPort: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const imapServer = defaults.imapServer ?? 'imap.rackhost.hu';
  const imapPort = defaults.imapPort ?? 993;
  const smtpServer = defaults.smtpServer ?? 'smtp.rackhost.hu';
  const smtpPort = defaults.smtpPort ?? 587;

  useEffect(() => {
    if (!isOpen) return;
    if (account) {
      setFormData({
        email: account.email || '',
        password: account.password || '',
        imapServer: account.imapServer || imapServer,
        imapPort: account.imapPort ?? imapPort,
        smtpServer: account.smtpServer || smtpServer,
        smtpPort: account.smtpPort ?? smtpPort,
      });
    } else {
      setFormData({
        email: '',
        password: '',
        imapServer,
        imapPort,
        smtpServer,
        smtpPort,
      });
    }
    setFormErrors({});
  }, [isOpen, account, imapServer, imapPort, smtpServer, smtpPort]);

  const handleClose = () => {
    setFormData({ email: '', password: '', imapServer: '', imapPort: '', smtpServer: '', smtpPort: '' });
    setFormErrors({});
    onClose();
  };

  const handleSave = () => {
    const err = {};
    if (!formData.email) err.email = 'Email cím kötelező';
    if (!formData.password) err.password = 'Jelszó kötelező';
    if (!formData.imapServer) err.imapServer = 'IMAP szerver kötelező';
    if (!formData.imapPort) err.imapPort = 'IMAP port kötelező';
    if (!formData.smtpServer) err.smtpServer = 'SMTP szerver kötelező';
    if (!formData.smtpPort) err.smtpPort = 'SMTP port kötelező';
    if (Object.keys(err).length) {
      setFormErrors(err);
      return;
    }
    onSave({
      email: formData.email,
      password: formData.password,
      imapServer: formData.imapServer,
      imapPort: Number(formData.imapPort) || 993,
      smtpServer: formData.smtpServer,
      smtpPort: Number(formData.smtpPort) || 587,
    });
    handleClose();
  };

  const handleDelete = () => {
    if (!account?.id || !onDelete) return;
    if (window.confirm('Biztosan törölni szeretnéd ezt az email fiókot?')) {
      onDelete(account.id);
      handleClose();
    }
  };

  const inputCls = (field) =>
    `w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 ${
      formErrors[field] ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
    }`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={account ? 'Email fiók szerkesztése' : 'Új email fiók'}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email cím *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData((p) => ({ ...p, email: e.target.value }));
              if (formErrors.email) setFormErrors((p) => ({ ...p, email: '' }));
            }}
            className={inputCls('email')}
          />
          {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IMAP Szerver *</label>
          <input
            type="text"
            value={formData.imapServer}
            onChange={(e) => {
              setFormData((p) => ({ ...p, imapServer: e.target.value }));
              if (formErrors.imapServer) setFormErrors((p) => ({ ...p, imapServer: '' }));
            }}
            className={inputCls('imapServer')}
          />
          {formErrors.imapServer && <p className="text-red-500 text-xs mt-1">{formErrors.imapServer}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IMAP Port *</label>
          <input
            type="number"
            value={formData.imapPort}
            onChange={(e) => {
              setFormData((p) => ({ ...p, imapPort: e.target.value }));
              if (formErrors.imapPort) setFormErrors((p) => ({ ...p, imapPort: '' }));
            }}
            className={inputCls('imapPort')}
          />
          {formErrors.imapPort && <p className="text-red-500 text-xs mt-1">{formErrors.imapPort}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SMTP Szerver *</label>
          <input
            type="text"
            value={formData.smtpServer}
            onChange={(e) => {
              setFormData((p) => ({ ...p, smtpServer: e.target.value }));
              if (formErrors.smtpServer) setFormErrors((p) => ({ ...p, smtpServer: '' }));
            }}
            className={inputCls('smtpServer')}
          />
          {formErrors.smtpServer && <p className="text-red-500 text-xs mt-1">{formErrors.smtpServer}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SMTP Port *</label>
          <input
            type="number"
            value={formData.smtpPort}
            onChange={(e) => {
              setFormData((p) => ({ ...p, smtpPort: e.target.value }));
              if (formErrors.smtpPort) setFormErrors((p) => ({ ...p, smtpPort: '' }));
            }}
            className={inputCls('smtpPort')}
          />
          {formErrors.smtpPort && <p className="text-red-500 text-xs mt-1">{formErrors.smtpPort}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jelszó *</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => {
              setFormData((p) => ({ ...p, password: e.target.value }));
              if (formErrors.password) setFormErrors((p) => ({ ...p, password: '' }));
            }}
            className={inputCls('password')}
            placeholder="Email fiók jelszava"
          />
          {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Az email fiók jelszava az SMTP/IMAP kapcsolathoz
          </p>
        </div>
        <div className="flex gap-3 justify-end flex-wrap">
          {account && onDelete && (
            <Button variant="ghost" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleDelete}>
              Törlés
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="ghost" onClick={handleClose}>Mégse</Button>
            <Button variant="primary" onClick={handleSave}>Mentés</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EmailAccountEditModal;
