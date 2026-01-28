import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Calendar, Copy, Upload, Download, Plus } from '../common/Icons';
import './BookingsToolbar.css';

const BookingsToolbar = ({ view, setView, onImport, onExport, onNewBooking, canEdit }) => {
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const importRef = useRef(null);
  const exportRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (importRef.current && !importRef.current.contains(e.target)) {
        setImportOpen(false);
      }
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bookings-toolbar">
      {/* View Toggle - KÜLÖN GOMBOK */}
      <div className="toolbar-group view-toggle">
        <button
          type="button"
          className={`toolbar-btn ${view === 'calendar' ? 'active' : ''}`}
          onClick={() => setView('calendar')}
          aria-pressed={view === 'calendar'}
          aria-label="Naptár nézet"
        >
          <Calendar /> Naptár
        </button>
        <button
          type="button"
          className={`toolbar-btn ${view === 'list' ? 'active' : ''}`}
          onClick={() => setView('list')}
          aria-pressed={view === 'list'}
          aria-label="Lista nézet"
        >
          <Copy /> Lista
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Import Dropdown */}
      {canEdit && (
        <div className="dropdown-wrapper" ref={importRef}>
          <button
            type="button"
            className="toolbar-btn dropdown-trigger"
            onClick={() => {
              setImportOpen(!importOpen);
              setExportOpen(false);
            }}
            aria-expanded={importOpen}
            aria-haspopup="true"
            aria-label="Import menü"
          >
            <Upload /> Import
            <span className={importOpen ? 'rotated' : ''}><ChevronDown /></span>
          </button>

          {importOpen && (
            <div className="dropdown-menu" role="menu">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onImport('csv');
                  setImportOpen(false);
                }}
              >
                CSV import
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onImport('excel');
                  setImportOpen(false);
                }}
              >
                Excel import
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onImport('ical');
                  setImportOpen(false);
                }}
              >
                iCal import
              </button>
            </div>
          )}
        </div>
      )}

      {/* Export Dropdown */}
      <div className="dropdown-wrapper" ref={exportRef}>
        <button
          type="button"
          className="toolbar-btn dropdown-trigger"
          onClick={() => {
            setExportOpen(!exportOpen);
            setImportOpen(false);
          }}
          aria-expanded={exportOpen}
          aria-haspopup="true"
          aria-label="Export menü"
        >
          <Download /> Export
          <span className={exportOpen ? 'rotated' : ''}><ChevronDown /></span>
        </button>

        {exportOpen && (
          <div className="dropdown-menu" role="menu">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onExport('csv');
                setExportOpen(false);
              }}
            >
              CSV export
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onExport('excel');
                setExportOpen(false);
              }}
            >
              Excel export
            </button>
            <div className="dropdown-divider" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onExport('pdf');
                setExportOpen(false);
              }}
            >
              Nyomtatás / PDF
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onExport('ical');
                setExportOpen(false);
              }}
            >
              iCal export
            </button>
          </div>
        )}
      </div>

      <div className="toolbar-divider" />

      {/* New Booking - Primary */}
      {canEdit && (
        <button type="button" className="toolbar-btn primary" onClick={onNewBooking}>
          <Plus /> Új foglalás
        </button>
      )}
    </div>
  );
};

export default BookingsToolbar;
