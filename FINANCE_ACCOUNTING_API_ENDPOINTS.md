# Finance & Accounting API Endpoints

## 🟦 MODULE 1: PÉNZÜGY (FINANCE) API

### Bankszámlák (Bank Accounts)

```
GET    /api/finance/bank-accounts
POST   /api/finance/bank-accounts
GET    /api/finance/bank-accounts/:id
PUT    /api/finance/bank-accounts/:id
DELETE /api/finance/bank-accounts/:id
POST   /api/finance/bank-accounts/:id/adjust-balance
```

### Forgalmi tételek (Financial Transactions)

```
GET    /api/finance/transactions
POST   /api/finance/transactions
GET    /api/finance/transactions/:id
PUT    /api/finance/transactions/:id
DELETE /api/finance/transactions/:id
```

**Query params for GET /api/finance/transactions:**
- `date_from` - Start date
- `date_to` - End date
- `type` - 'income' | 'expense'
- `category_id` - Filter by category
- `apartment_id` - Filter by apartment
- `partner_id` - Filter by partner
- `bank_account_id` - Filter by bank account
- `currency` - Filter by currency

### Kategóriák (Categories)

```
GET    /api/finance/categories
POST   /api/finance/categories
GET    /api/finance/categories/:id
PUT    /api/finance/categories/:id
DELETE /api/finance/categories/:id
```

### Cashflow Dashboard

```
GET    /api/finance/dashboard
GET    /api/finance/dashboard/monthly?year=2026&month=1
GET    /api/finance/dashboard/yearly?year=2026
GET    /api/finance/dashboard/by-apartment?apartment_id=xxx&year=2026
```

**Response:**
```json
{
  "period": "2026-01",
  "total_income": 1500000,
  "total_expense": 500000,
  "profit": 1000000,
  "by_category": [...],
  "by_apartment": [...],
  "by_month": [...]
}
```

---

## 🟩 MODULE 2: KÖNYVELÉS (ACCOUNTING) API

### Számlafiókok (Invoicing Accounts)

```
GET    /api/accounting/invoicing-accounts
POST   /api/accounting/invoicing-accounts
GET    /api/accounting/invoicing-accounts/:id
PUT    /api/accounting/invoicing-accounts/:id
DELETE /api/accounting/invoicing-accounts/:id
GET    /api/accounting/invoicing-accounts/:id/next-invoice-number
```

### Számlák (Invoices)

```
GET    /api/accounting/invoices
POST   /api/accounting/invoices
GET    /api/accounting/invoices/:id
PUT    /api/accounting/invoices/:id
POST   /api/accounting/invoices/:id/issue
POST   /api/accounting/invoices/:id/mark-paid
POST   /api/accounting/invoices/:id/storno
POST   /api/accounting/invoices/:id/correct
GET    /api/accounting/invoices/:id/pdf
POST   /api/accounting/invoices/:id/send-to-nav
GET    /api/accounting/invoices/:id/nav-status
```

**Query params for GET /api/accounting/invoices:**
- `status` - Filter by status
- `invoice_type` - Filter by type
- `date_from` - Start date
- `date_to` - End date
- `partner_id` - Filter by partner
- `apartment_id` - Filter by apartment
- `invoicing_account_id` - Filter by invoicing account

### Díjbekérők (Proforma Invoices)

```
GET    /api/accounting/proforma-invoices
POST   /api/accounting/proforma-invoices
GET    /api/accounting/proforma-invoices/:id
PUT    /api/accounting/proforma-invoices/:id
DELETE /api/accounting/proforma-invoices/:id
POST   /api/accounting/proforma-invoices/:id/convert-to-invoice
POST   /api/accounting/proforma-invoices/:id/send
POST   /api/accounting/proforma-invoices/:id/mark-paid
```

### Számlatükör (Chart of Accounts)

```
GET    /api/accounting/chart-of-accounts
POST   /api/accounting/chart-of-accounts
GET    /api/accounting/chart-of-accounts/:id
PUT    /api/accounting/chart-of-accounts/:id
DELETE /api/accounting/chart-of-accounts/:id
```

### Főkönyv (General Ledger)

```
GET    /api/accounting/ledger-entries
POST   /api/accounting/ledger-entries
GET    /api/accounting/ledger-entries/:id
GET    /api/accounting/ledger-entries/period/:period
POST   /api/accounting/ledger-entries/period/:period/lock
POST   /api/accounting/ledger-entries/period/:period/unlock
```

**Query params:**
- `period` - YYYY-MM format
- `account_id` - Filter by account
- `date_from` - Start date
- `date_to` - End date

### ÁFA Regiszterek (VAT Registers)

```
GET    /api/accounting/vat-entries
GET    /api/accounting/vat-entries/period/:period
GET    /api/accounting/vat-entries/summary?period=2026-01
POST   /api/accounting/vat-entries/period/:period/lock
```

**Response for summary:**
```json
{
  "period": "2026-01",
  "payable_vat": {
    "27": 270000,
    "18": 18000,
    "5": 5000,
    "0": 0,
    "total": 293000
  },
  "deductible_vat": {
    "27": 135000,
    "18": 9000,
    "5": 2500,
    "0": 0,
    "total": 146500
  },
  "vat_to_pay": 146500
}
```

### NAV Online Számla

```
POST   /api/accounting/nav/send-invoice/:invoice_id
GET    /api/accounting/nav/invoice-status/:invoice_id
GET    /api/accounting/nav/logs?invoice_id=xxx
```

### Exportok

```
GET    /api/accounting/export/ledger?format=csv&period=2026-01
GET    /api/accounting/export/vat?format=csv&period=2026-01
GET    /api/accounting/export/invoices?format=xml&date_from=2026-01-01&date_to=2026-01-31
```

### Audit Log

```
GET    /api/accounting/audit-log
GET    /api/accounting/audit-log/entity/:entity_type/:entity_id
```

**Query params:**
- `entity_type` - Filter by entity type
- `entity_id` - Filter by entity ID
- `user_id` - Filter by user
- `date_from` - Start date
- `date_to` - End date

---

## 🔁 CONNECTION ENDPOINTS

### Auto-create Finance Transaction from Invoice

```
POST   /api/accounting/invoices/:id/mark-paid
→ Automatically creates finance_transaction entry
```

### Auto-create Finance Transaction from Expense Invoice

```
POST   /api/accounting/invoices (when type is expense)
→ Automatically creates finance_transaction entry
```

---

## 📋 REQUEST/RESPONSE EXAMPLES

### Create Finance Transaction

**POST /api/finance/transactions**
```json
{
  "date": "2026-01-23",
  "amount": 50000,
  "currency": "HUF",
  "type": "income",
  "category_id": "cat-123",
  "bank_account_id": "bank-456",
  "apartment_id": "apt-789",
  "partner_id": "partner-abc",
  "description": "Foglalási bevétel",
  "notes": "Airbnb foglalás"
}
```

### Create Invoice

**POST /api/accounting/invoices**
```json
{
  "invoicing_account_id": "inv-acc-123",
  "invoice_type": "normal",
  "issue_date": "2026-01-23",
  "due_date": "2026-02-23",
  "currency": "EUR",
  "partner_id": "partner-abc",
  "apartment_id": "apt-789",
  "items": [
    {
      "description": "Foglalási díj",
      "quantity": 5,
      "unit_price": 10000,
      "vat_rate": 27
    }
  ],
  "notes": "Invoice notes"
}
```

### Convert Proforma to Invoice

**POST /api/accounting/proforma-invoices/:id/convert-to-invoice**
```json
{
  "invoicing_account_id": "inv-acc-123",
  "issue_date": "2026-01-23",
  "due_date": "2026-02-23"
}
```

---

## 🔐 PERMISSIONS

### Finance Module
- `finance.view` - View finance data
- `finance.edit` - Create/edit transactions, bank accounts
- `finance.delete` - Delete transactions (soft delete)

### Accounting Module
- `accounting.view` - View invoices, ledger
- `accounting.edit` - Create/edit invoices, proforma
- `accounting.issue` - Issue invoices
- `accounting.nav` - Send to NAV
- `accounting.export` - Export data
- `accounting.admin` - Full access, period locking

---

## 📝 NOTES

1. **Finance transactions** can be deleted (soft delete)
2. **Accounting documents** cannot be deleted, only corrected/storno
3. **Period locking** prevents modification of closed periods
4. **Audit log** tracks all accounting changes
5. **NAV integration** requires valid credentials per invoicing account
6. **Multi-currency** with automatic MNB exchange rate lookup
7. **Invoice numbering** is automatic per invoicing account
