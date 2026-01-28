/**
 * Email / Levelező Page
 * Email kezelés, SMTP beállítások, sablonok, küldött emailek
 */

import { useState, useEffect } from 'react';
import { sendEmail, isEmailConfigured } from '../services/emailService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import useToastStore from '../stores/toastStore';
import useEmailAccountsStore from '../stores/emailAccountsStore';
import EmailAccountEditModal from '../components/email/EmailAccountEditModal';
import { formatDate } from '../utils/dateUtils';

const EmailPage = () => {
  const { success, error } = useToastStore();
  const { accounts: emailAccounts, loadFromStorage, updateAccount, addAccount, removeAccount } = useEmailAccountsStore();

  const [editingAccount, setEditingAccount] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedAccountId, setSelectedAccountId] = useState(1);
  const [currentFolder, setCurrentFolder] = useState('inbox'); // 'inbox' | 'sent' | 'drafts' | 'trash'
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveTargetAccountId, setMoveTargetAccountId] = useState('');

  const [quickEmail, setQuickEmail] = useState({
    from: 'sales@smartproperties.hu',
    to: '',
    subject: '',
    body: '',
  });
  const [quickEmailErrors, setQuickEmailErrors] = useState({});
  const [showCompose, setShowCompose] = useState(false);

  const [sending, setSending] = useState(false);
  const [sentEmails, setSentEmails] = useState([
    { id: 1, date: new Date().toISOString(), to: 'partner@example.com', subject: 'Üdvözlés', sender: 'sales@smartproperties.hu', status: 'sent' },
    { id: 2, date: new Date(Date.now() - 86400000).toISOString(), to: 'lead@example.com', subject: 'Foglalás visszaigazolás', sender: 'info@smartproperties.hu', status: 'sent' },
  ]);

  const [templates, setTemplates] = useState([
    { id: 1, name: 'Partner üdvözlés', subject: 'Üdvözöljük a SmartProperties csapatában!', body: 'Kedves Partner!\n\nÜdvözöljük a SmartProperties csapatában...' },
    { id: 2, name: 'Foglalás visszaigazolás', subject: 'Foglalás visszaigazolás', body: 'Kedves Vendég!\n\nKöszönjük a foglalását...' },
    { id: 3, name: 'Számla emlékeztető', subject: 'Számla emlékeztető', body: 'Kedves Partner!\n\nEmlékeztetjük, hogy...' },
    { id: 4, name: 'Lead followup', subject: 'Következő lépések', body: 'Kedves Érdeklődő!\n\nKöszönjük az érdeklődését...' },
  ]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateForm, setTemplateForm] = useState({ name: '', subject: '', body: '' });

  useEffect(() => {
    document.title = 'Email / Levelező - SmartCRM';
  }, []);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const handleSendEmail = async () => {
    const errors = {};
    if (!quickEmail.to) errors.to = 'Címzett kötelező';
    if (!quickEmail.subject) errors.subject = 'Tárgy kötelező';
    if (!quickEmail.body) errors.body = 'Üzenet kötelező';

    if (Object.keys(errors).length > 0) {
      setQuickEmailErrors(errors);
      error('Kérjük, töltse ki az összes kötelező mezőt!');
      return;
    }

    setQuickEmailErrors({});

    setSending(true);
    try {
      const result = await sendEmail({
        to: quickEmail.to,
        subject: quickEmail.subject,
        body: quickEmail.body,
      });

      if (result.success) {
        success('Email sikeresen elküldve!');
        setSentEmails([
          {
            id: Date.now(),
            date: new Date().toISOString(),
            to: quickEmail.to,
            subject: quickEmail.subject,
            sender: quickEmail.from,
            status: 'sent',
          },
          ...sentEmails,
        ]);
        setQuickEmail({ ...quickEmail, to: '', subject: '', body: '' });
        setShowCompose(false);
      } else {
        error(result.error || 'Hiba történt az email küldése során');
      }
    } catch (err) {
      error('Hiba történt az email küldése során');
    } finally {
      setSending(false);
    }
  };

  const handleUseTemplate = (template) => {
    setQuickEmail({
      ...quickEmail,
      subject: template.subject,
      body: template.body,
    });
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateForm({ name: template.name, subject: template.subject, body: template.body });
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;
    const { name, subject, body } = templateForm;
    if (!name?.trim() || !subject?.trim() || !body?.trim()) {
      error('Név, tárgy és üzenet kötelező.');
      return;
    }
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === editingTemplate.id
          ? { ...t, name: name.trim(), subject: subject.trim(), body: body.trim() }
          : t
      )
    );
    setShowTemplateModal(false);
    setEditingTemplate(null);
    setTemplateForm({ name: '', subject: '', body: '' });
    success('Sablon mentve.');
  };

  const [smtpConfig, setSmtpConfig] = useState({
    server: 'smtp.rackhost.hu',
    port: 587,
    user: 'info@smartproperties.hu',
    webmail: 'https://webmail.rackhost.hu',
  });

  const [imapConfig, setImapConfig] = useState({
    server: 'imap.rackhost.hu',
    port: 993,
    secure: true,
  });

  const [pop3Config, setPop3Config] = useState({
    server: 'pop3.rackhost.hu',
    port: 995,
    secure: true,
  });

  const [showServerSettingsModal, setShowServerSettingsModal] = useState(false);
  const [serverSettingsForm, setServerSettingsForm] = useState({});
  const [serverSettingsErrors, setServerSettingsErrors] = useState({});

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setShowEditModal(true);
  };

  const handleAddAccount = () => {
    setEditingAccount(null);
    setShowEditModal(true);
  };

  const handleSaveAccount = (data) => {
    if (editingAccount) {
      updateAccount(editingAccount.id, data);
      success('Email fiók sikeresen frissítve!');
    } else {
      addAccount(data);
      success('Új email fiók hozzáadva.');
    }
  };

  const handleDeleteAccount = (id) => {
    removeAccount(id);
    success('Email fiók törölve!');
  };

  const handleEditServerSettings = () => {
    setServerSettingsForm({
      smtpServer: smtpConfig.server,
      smtpPort: smtpConfig.port,
      imapServer: imapConfig.server,
      imapPort: imapConfig.port,
      pop3Server: pop3Config.server,
      pop3Port: pop3Config.port,
      webmail: smtpConfig.webmail,
    });
    setServerSettingsErrors({});
    setShowServerSettingsModal(true);
  };

  const handleSaveServerSettings = () => {
    const errors = {};
    if (!serverSettingsForm.smtpServer) errors.smtpServer = 'SMTP szerver kötelező';
    if (!serverSettingsForm.smtpPort) errors.smtpPort = 'SMTP port kötelező';
    if (!serverSettingsForm.imapServer) errors.imapServer = 'IMAP szerver kötelező';
    if (!serverSettingsForm.imapPort) errors.imapPort = 'IMAP port kötelező';
    if (!serverSettingsForm.pop3Server) errors.pop3Server = 'POP3 szerver kötelező';
    if (!serverSettingsForm.pop3Port) errors.pop3Port = 'POP3 port kötelező';

    if (Object.keys(errors).length > 0) {
      setServerSettingsErrors(errors);
      return;
    }

    setSmtpConfig({
      ...smtpConfig,
      server: serverSettingsForm.smtpServer,
      port: serverSettingsForm.smtpPort,
      webmail: serverSettingsForm.webmail || smtpConfig.webmail,
    });
    setImapConfig({
      ...imapConfig,
      server: serverSettingsForm.imapServer,
      port: serverSettingsForm.imapPort,
    });
    setPop3Config({
      ...pop3Config,
      server: serverSettingsForm.pop3Server,
      port: serverSettingsForm.pop3Port,
    });
    setShowServerSettingsModal(false);
    setServerSettingsForm({});
    setServerSettingsErrors({});
    success('Szerver beállítások sikeresen frissítve!');
  };

  const selectedAccount = emailAccounts.find((a) => a.id === selectedAccountId) || emailAccounts[0];
  const folderLabels = {
    inbox: 'Beérkezett',
    sent: 'Elküldött',
    drafts: 'Piszkozat',
    trash: 'Kuka',
    archived: 'Archivált',
    all: 'Összes levél',
  };

  const handleMoveToAccount = () => {
    if (!moveTargetAccountId || selectedMessageIds.length === 0) return;
    success(`Áthelyezve ${selectedMessageIds.length} üzenet a kiválasztott fiókba.`);
    setShowMoveModal(false);
    setMoveTargetAccountId('');
    setSelectedMessageIds([]);
  };

  const toggleSelectMessage = (id) => {
    setSelectedMessageIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Email / Levelező</h1>
      </div>

      {/* Fölül: emailfiók választó */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email fiók:</label>
        <select
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm min-w-[220px]"
          aria-label="Email fiók választása"
        >
          {emailAccounts.map((acc) => (
            <option key={acc.id} value={acc.id}>{acc.email}</option>
          ))}
        </select>
        <Button size="sm" onClick={() => { setQuickEmail({ ...quickEmail, from: selectedAccount?.email || quickEmail.from }); setShowCompose(true); }}>
          Új üzenet
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowMoveModal(true)}
          disabled={selectedMessageIds.length === 0}
          title="Áthelyezés másik fiókba"
        >
          Áthelyezés
        </Button>
      </div>

      {/* Levelező portál: mappák + üzenetlista */}
      <Card className="p-4 min-h-[360px]">
        <div className="flex gap-4">
          <aside className="w-40 flex-shrink-0 space-y-1">
            {(['inbox', 'sent', 'drafts', 'trash', 'archived', 'all']).map((folder) => (
              <button
                key={folder}
                type="button"
                onClick={() => setCurrentFolder(folder)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                  currentFolder === folder
                    ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {folderLabels[folder]}
              </button>
            ))}
          </aside>
          <div className="flex-1 min-w-0">
            {showCompose ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">Új üzenet</h3>
                  <Button size="sm" variant="ghost" onClick={() => setShowCompose(false)}>Mégse</Button>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Feladó</label>
                  <select
                    value={quickEmail.from}
                    onChange={(e) => setQuickEmail({ ...quickEmail, from: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-800 dark:text-gray-200"
                  >
                    {emailAccounts.map((acc) => (
                      <option key={acc.id} value={acc.email}>{acc.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Címzett</label>
                  <input
                    type="email"
                    value={quickEmail.to}
                    onChange={(e) => { setQuickEmail({ ...quickEmail, to: e.target.value }); if (quickEmailErrors.to) setQuickEmailErrors({ ...quickEmailErrors, to: '' }); }}
                    className={`w-full px-2 py-1.5 border rounded text-sm ${quickEmailErrors.to ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-800 dark:text-gray-200`}
                    placeholder="email@example.com"
                  />
                  {quickEmailErrors.to && <p className="text-red-500 text-xs mt-0.5">{quickEmailErrors.to}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tárgy</label>
                  <input
                    type="text"
                    value={quickEmail.subject}
                    onChange={(e) => { setQuickEmail({ ...quickEmail, subject: e.target.value }); if (quickEmailErrors.subject) setQuickEmailErrors({ ...quickEmailErrors, subject: '' }); }}
                    className={`w-full px-2 py-1.5 border rounded text-sm ${quickEmailErrors.subject ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-800 dark:text-gray-200`}
                    placeholder="Tárgy"
                  />
                  {quickEmailErrors.subject && <p className="text-red-500 text-xs mt-0.5">{quickEmailErrors.subject}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Üzenet</label>
                  <textarea
                    value={quickEmail.body}
                    onChange={(e) => { setQuickEmail({ ...quickEmail, body: e.target.value }); if (quickEmailErrors.body) setQuickEmailErrors({ ...quickEmailErrors, body: '' }); }}
                    rows={4}
                    className={`w-full px-2 py-1.5 border rounded text-sm ${quickEmailErrors.body ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-800 dark:text-gray-200`}
                    placeholder="Üzenet"
                  />
                  {quickEmailErrors.body && <p className="text-red-500 text-xs mt-0.5">{quickEmailErrors.body}</p>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSendEmail} disabled={sending}>{sending ? 'Küldés...' : 'Küldés'}</Button>
                  {templates.slice(0, 2).map((t) => (
                    <Button key={t.id} size="sm" variant="outline" onClick={() => handleUseTemplate(t)}>{t.name}</Button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">{folderLabels[currentFolder]}</h3>
                  {(currentFolder === 'inbox' || currentFolder === 'sent' || currentFolder === 'all') && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {currentFolder === 'sent' || currentFolder === 'all' ? sentEmails.length : 0} üzenet
                    </span>
                  )}
                  {currentFolder === 'archived' && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">0 üzenet</span>
                  )}
                </div>
                {currentFolder === 'inbox' && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">Nincsenek bejövő üzenetek.</p>
                )}
                {currentFolder === 'sent' && (
                  <div className="space-y-1 overflow-y-auto max-h-[280px]">
                    {sentEmails.map((email) => (
                      <div
                        key={email.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${
                          selectedMessageIds.includes(email.id)
                            ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-600'
                            : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => toggleSelectMessage(email.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedMessageIds.includes(email.id)}
                          onChange={() => toggleSelectMessage(email.id)}
                          className="rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 w-20">{formatDate(email.date)}</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate flex-1">{email.subject}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{email.to}</span>
                      </div>
                    ))}
                  </div>
                )}
                {currentFolder === 'all' && (
                  <div className="space-y-1 overflow-y-auto max-h-[280px]">
                    {sentEmails.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">Nincsenek üzenetek.</p>
                    ) : (
                      sentEmails.map((email) => (
                        <div
                          key={email.id}
                          className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${
                            selectedMessageIds.includes(email.id)
                              ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-600'
                              : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                          onClick={() => toggleSelectMessage(email.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedMessageIds.includes(email.id)}
                            onChange={() => toggleSelectMessage(email.id)}
                            className="rounded"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 w-20">{formatDate(email.date)}</span>
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate flex-1">{email.subject}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{email.to}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
                {currentFolder === 'drafts' && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">Nincsenek piszkozatok.</p>
                )}
                {currentFolder === 'trash' && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">A kuka üres.</p>
                )}
                {currentFolder === 'archived' && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">Nincsenek archivált üzenetek.</p>
                )}
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Email fiókok kezelése (kompakt) */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Email fiókok</h3>
          <div className="flex gap-1.5 flex-wrap items-center">
            {emailAccounts.map((acc) => (
              <span
                key={acc.id}
                className={`text-xs px-2 py-1 rounded ${
                  acc.id === selectedAccountId ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {acc.email}
              </span>
            ))}
            <Button size="sm" variant="ghost" onClick={handleAddAccount}>Új fiók</Button>
            <Button size="sm" variant="ghost" onClick={() => handleEditAccount(selectedAccount)}>Szerkesztés</Button>
          </div>
        </div>
      </Card>

      {/* Email sablonok – szerkeszthető */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Email sablonok</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {templates.map((t) => (
            <div key={t.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1 text-sm">{t.name}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{t.subject}</p>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => handleUseTemplate(t)}>Használat</Button>
                <Button size="sm" variant="ghost" onClick={() => handleEditTemplate(t)}>Szerkesztés</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Szerver beállítások – legalul, kompakt */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Szerver beállítások</h3>
          <Button size="sm" variant="outline" onClick={handleEditServerSettings}>Szerkesztés</Button>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
          <span className="text-gray-600 dark:text-gray-400">SMTP:</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">{smtpConfig.server}:{smtpConfig.port}</span>
          <span className="text-gray-600 dark:text-gray-400">IMAP:</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">{imapConfig.server}:{imapConfig.port} (SSL)</span>
          <span className="text-gray-600 dark:text-gray-400">POP3:</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">{pop3Config.server}:{pop3Config.port} (SSL)</span>
          <a href={smtpConfig.webmail} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{smtpConfig.webmail}</a>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
            isEmailConfigured() ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {isEmailConfigured() ? '✓ Aktív' : '✗ Inaktív'}
          </span>
        </div>
      </Card>

      {/* Sablon szerkesztés modal */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => { setShowTemplateModal(false); setEditingTemplate(null); setTemplateForm({ name: '', subject: '', body: '' }); }}
        title="Sablon szerkesztése"
        size="md"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Név *</label>
            <input
              type="text"
              value={templateForm.name}
              onChange={(e) => setTemplateForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-gray-200 text-sm"
              placeholder="pl. Partner üdvözlés"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tárgy *</label>
            <input
              type="text"
              value={templateForm.subject}
              onChange={(e) => setTemplateForm((p) => ({ ...p, subject: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-gray-200 text-sm"
              placeholder="Email tárgya"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Üzenet *</label>
            <textarea
              value={templateForm.body}
              onChange={(e) => setTemplateForm((p) => ({ ...p, body: e.target.value }))}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-gray-200 text-sm resize-y"
              placeholder="Email tartalma"
            />
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="ghost" size="sm" onClick={() => { setShowTemplateModal(false); setEditingTemplate(null); setTemplateForm({ name: '', subject: '', body: '' }); }}>Mégse</Button>
            <Button size="sm" onClick={handleSaveTemplate}>Mentés</Button>
          </div>
        </div>
      </Modal>

      {/* Áthelyezés modal */}
      <Modal
        isOpen={showMoveModal}
        onClose={() => { setShowMoveModal(false); setMoveTargetAccountId(''); }}
        title="Áthelyezés másik fiókba"
        size="sm"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selectedMessageIds.length} üzenet áthelyezése a kiválasztott fiókba.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cél fiók</label>
            <select
              value={moveTargetAccountId}
              onChange={(e) => setMoveTargetAccountId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-gray-200 text-sm"
            >
              <option value="">Válassz fiókot...</option>
              {emailAccounts.filter((a) => a.id !== selectedAccountId).map((acc) => (
                <option key={acc.id} value={acc.id}>{acc.email}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => { setShowMoveModal(false); setMoveTargetAccountId(''); }}>Mégse</Button>
            <Button size="sm" onClick={handleMoveToAccount} disabled={!moveTargetAccountId}>Áthelyezés</Button>
          </div>
        </div>
      </Modal>

      <EmailAccountEditModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingAccount(null); }}
        account={editingAccount}
        defaults={{
          imapServer: imapConfig.server,
          imapPort: imapConfig.port,
          smtpServer: smtpConfig.server,
          smtpPort: smtpConfig.port,
        }}
        onSave={handleSaveAccount}
        onDelete={editingAccount ? handleDeleteAccount : undefined}
      />

      {/* Szerver beállítások szerkesztés modal */}
      <Modal
        isOpen={showServerSettingsModal}
        onClose={() => {
          setShowServerSettingsModal(false);
          setServerSettingsForm({});
          setServerSettingsErrors({});
        }}
        title="Szerver beállítások szerkesztése"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                SMTP Szerver *
              </label>
              <input
                type="text"
                value={serverSettingsForm.smtpServer || ''}
                onChange={(e) => {
                  setServerSettingsForm({ ...serverSettingsForm, smtpServer: e.target.value });
                  if (serverSettingsErrors.smtpServer) setServerSettingsErrors({ ...serverSettingsErrors, smtpServer: '' });
                }}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 ${
                  serverSettingsErrors.smtpServer 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {serverSettingsErrors.smtpServer && (
                <p className="text-red-500 text-xs mt-1">{serverSettingsErrors.smtpServer}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                SMTP Port *
              </label>
              <input
                type="number"
                value={serverSettingsForm.smtpPort || ''}
                onChange={(e) => {
                  setServerSettingsForm({ ...serverSettingsForm, smtpPort: e.target.value });
                  if (serverSettingsErrors.smtpPort) setServerSettingsErrors({ ...serverSettingsErrors, smtpPort: '' });
                }}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 ${
                  serverSettingsErrors.smtpPort 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {serverSettingsErrors.smtpPort && (
                <p className="text-red-500 text-xs mt-1">{serverSettingsErrors.smtpPort}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                IMAP Szerver *
              </label>
              <input
                type="text"
                value={serverSettingsForm.imapServer || ''}
                onChange={(e) => {
                  setServerSettingsForm({ ...serverSettingsForm, imapServer: e.target.value });
                  if (serverSettingsErrors.imapServer) setServerSettingsErrors({ ...serverSettingsErrors, imapServer: '' });
                }}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 ${
                  serverSettingsErrors.imapServer 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {serverSettingsErrors.imapServer && (
                <p className="text-red-500 text-xs mt-1">{serverSettingsErrors.imapServer}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                IMAP Port *
              </label>
              <input
                type="number"
                value={serverSettingsForm.imapPort || ''}
                onChange={(e) => {
                  setServerSettingsForm({ ...serverSettingsForm, imapPort: e.target.value });
                  if (serverSettingsErrors.imapPort) setServerSettingsErrors({ ...serverSettingsErrors, imapPort: '' });
                }}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 ${
                  serverSettingsErrors.imapPort 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {serverSettingsErrors.imapPort && (
                <p className="text-red-500 text-xs mt-1">{serverSettingsErrors.imapPort}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                POP3 Szerver *
              </label>
              <input
                type="text"
                value={serverSettingsForm.pop3Server || ''}
                onChange={(e) => {
                  setServerSettingsForm({ ...serverSettingsForm, pop3Server: e.target.value });
                  if (serverSettingsErrors.pop3Server) setServerSettingsErrors({ ...serverSettingsErrors, pop3Server: '' });
                }}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 ${
                  serverSettingsErrors.pop3Server 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {serverSettingsErrors.pop3Server && (
                <p className="text-red-500 text-xs mt-1">{serverSettingsErrors.pop3Server}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                POP3 Port *
              </label>
              <input
                type="number"
                value={serverSettingsForm.pop3Port || ''}
                onChange={(e) => {
                  setServerSettingsForm({ ...serverSettingsForm, pop3Port: e.target.value });
                  if (serverSettingsErrors.pop3Port) setServerSettingsErrors({ ...serverSettingsErrors, pop3Port: '' });
                }}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 ${
                  serverSettingsErrors.pop3Port 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {serverSettingsErrors.pop3Port && (
                <p className="text-red-500 text-xs mt-1">{serverSettingsErrors.pop3Port}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Webmail URL
              </label>
              <input
                type="url"
                value={serverSettingsForm.webmail || ''}
                onChange={(e) => {
                  setServerSettingsForm({ ...serverSettingsForm, webmail: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                placeholder="https://webmail.example.com"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setShowServerSettingsModal(false);
                setServerSettingsForm({});
                setServerSettingsErrors({});
              }}
            >
              Mégse
            </Button>
            <Button onClick={handleSaveServerSettings}>
              Mentés
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmailPage;
