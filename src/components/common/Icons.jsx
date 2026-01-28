/**
 * Simple icon components (emoji-based, matching monolith)
 * These are lightweight emoji-based icons for consistency across the application
 */

export const Plus = () => <span>+</span>;
export const Edit2 = () => <span>✏</span>;
export const Trash2 = () => <span>🗑</span>;
export const X = () => <span>✕</span>;
export const ChevronLeft = () => <span>‹</span>;
export const ChevronRight = () => <span>›</span>;
export const ChevronDown = () => <span>▼</span>;
export const ChevronUp = () => <span>▲</span>;
export const Check = () => <span>✓</span>;
export const RefreshCw = () => <span>🔄</span>;
export const LogOut = () => <span>🚪</span>;
export const Search = () => <span>🔍</span>;
export const Filter = () => <span>🔽</span>;
export const Sun = () => <span>☀️</span>;
export const Moon = () => <span>🌙</span>;
export const Calendar = ({ size, className = '' }) => <span className={className} style={size ? { fontSize: `${size}px` } : {}}>📅</span>;
export const Sync = ({ size, className = '' }) => <span className={className} style={size ? { fontSize: `${size}px` } : {}}>🔄</span>;
export const Copy = ({ size, className = '' }) => <span className={className} style={size ? { fontSize: `${size}px` } : {}}>📋</span>;
export const FileText = ({ size, className = '' }) => <span className={className} style={size ? { fontSize: `${size}px` } : {}}>📄</span>;
export const Receipt = ({ size, className = '' }) => <span className={className} style={size ? { fontSize: `${size}px` } : {}}>🧾</span>;
export const Calculator = ({ size, className = '' }) => <span className={className} style={size ? { fontSize: `${size}px` } : {}}>🔢</span>;
export const Database = ({ size, className = '' }) => <span className={className} style={size ? { fontSize: `${size}px` } : {}}>💾</span>;
export const Package = ({ size, className = '' }) => <span className={className} style={size ? { fontSize: `${size}px` } : {}}>📦</span>;
export const Users = ({ size, className = '' }) => <span className={className} style={size ? { fontSize: `${size}px` } : {}}>👥</span>;
export const Home = ({ size, className = '' }) => <span className={className} style={size ? { fontSize: `${size}px` } : {}}>🏠</span>;
export const Download = ({ size, className = '' }) => <span className={className} style={size ? { fontSize: `${size}px` } : {}}>⬇️</span>;
export const Upload = ({ size, className = '' }) => <span className={className} style={size ? { fontSize: `${size}px` } : {}}>⬆️</span>;
export const Folder = ({ size, className = '' }) => <span className={className} style={size ? { fontSize: `${size}px` } : {}}>📁</span>;

