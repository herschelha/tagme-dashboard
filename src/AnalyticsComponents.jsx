/**
 * TagMe Analytics Drill-Down Components
 * 
 * Drop these React components into your project and import them in App.jsx
 * They handle all the interactive drill-down modals and detail views.
 */

import React, { useState, useEffect } from 'react';

// ============================================================================
// VISITOR DETAIL MODAL
// ============================================================================
/**
 * Shows full details of a single visitor/contact
 */
export function VisitorDetailModal({ visitor, onClose }) {
  if (!visitor) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{visitor.name}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="visitor-detail">
            <div className="detail-row">
              <label>Name:</label>
              <span>{visitor.name}</span>
            </div>
            <div className="detail-row">
              <label>Email:</label>
              <span>{visitor.email || '—'}</span>
            </div>
            <div className="detail-row">
              <label>Phone:</label>
              <span>{visitor.phone || '—'}</span>
            </div>
            <div className="detail-row">
              <label>Company:</label>
              <span>{visitor.company || '—'}</span>
            </div>
            <div className="detail-row">
              <label>Tapped:</label>
              <span>{new Date(visitor.created_at).toLocaleString()}</span>
            </div>
          </div>

          <div className="modal-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => {
                // Copy contact details to clipboard
                const text = `${visitor.name}\n${visitor.email}\n${visitor.phone}`;
                navigator.clipboard.writeText(text);
              }}
            >
              Copy Contact
            </button>
            <button className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// VISITORS TABLE MODAL
// ============================================================================
/**
 * Shows a paginated table of visitors with drill-down capability
 */
export function VisitorsTableModal({ 
  title, 
  apiEndpoint, 
  onVisitorSelect,
  onClose 
}) {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const limit = 25;

  useEffect(() => {
    fetchVisitors();
  }, [page]);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${apiEndpoint}?limit=${limit}&offset=${page * limit}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch visitors');
      
      const data = await response.json();
      setVisitors(data.visitors);
      setTotal(data.total);
      setHasMore(data.hasMore);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">Loading visitors...</div>
          ) : error ? (
            <div className="error-state">Error: {error}</div>
          ) : visitors.length === 0 ? (
            <div className="empty-state">No visitors found</div>
          ) : (
            <>
              <table className="visitors-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Tapped</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.map((visitor) => (
                    <tr key={visitor.id} className="visitor-row">
                      <td className="visitor-name">{visitor.name}</td>
                      <td>{visitor.email || '—'}</td>
                      <td>{visitor.company || '—'}</td>
                      <td className="visitor-timestamp">
                        {new Date(visitor.created_at).toLocaleDateString()} {' '}
                        {new Date(visitor.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td>
                        <button
                          className="btn-small btn-details"
                          onClick={() => onVisitorSelect(visitor)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pagination">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="btn btn-small"
                >
                  ← Previous
                </button>
                <span>
                  Page {page + 1} of {Math.ceil(total / limit)} ({total} total)
                </span>
                <button
                  disabled={!hasMore}
                  onClick={() => setPage(page + 1)}
                  className="btn btn-small"
                >
                  Next →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DATE DRILL-DOWN MODAL (for charts)
// ============================================================================
/**
 * Shows visitors for a specific date when clicking on a chart bar
 */
export function DateDrilldownModal({
  date,
  apiEndpoint,
  onVisitorSelect,
  onClose
}) {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVisitorsForDate();
  }, [date]);

  const fetchVisitorsForDate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${apiEndpoint}/by-date/${date}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      setVisitors(data.visitors);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Visitors on {formatDate(date)}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">Loading...</div>
          ) : error ? (
            <div className="error-state">Error: {error}</div>
          ) : visitors.length === 0 ? (
            <div className="empty-state">No visitors on this date</div>
          ) : (
            <>
              <p className="date-summary">
                <strong>{visitors.length}</strong> visitor{visitors.length !== 1 ? 's' : ''} tapped on this date
              </p>
              <table className="visitors-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.map((visitor) => (
                    <tr key={visitor.id} className="visitor-row">
                      <td 
                        className="visitor-name clickable"
                        onClick={() => onVisitorSelect(visitor)}
                      >
                        {visitor.name}
                      </td>
                      <td>{visitor.email || '—'}</td>
                      <td>{visitor.company || '—'}</td>
                      <td>
                        {new Date(visitor.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// INTERACTIVE STAT CARD (with drill-down)
// ============================================================================
/**
 * Stat card that opens a modal when clicked
 */
export function DrilldownStatCard({
  label,
  value,
  icon,
  onClick,
  isClickable = true
}) {
  return (
    <div
      className={`stat-card ${isClickable ? 'clickable' : ''}`}
      onClick={isClickable ? onClick : undefined}
      style={{ cursor: isClickable ? 'pointer' : 'default' }}
    >
      <div className="stat-content">
        <p className="stat-label">{label}</p>
        <div className="stat-value">{value}</div>
      </div>
      {icon && <div className="stat-icon">{icon}</div>}
      {isClickable && <div className="drill-indicator">Click to view →</div>}
    </div>
  );
}

// ============================================================================
// INTERACTIVE CHART BAR (with drill-down)
// ============================================================================
/**
 * Bar chart component that supports drill-down on click
 * Wraps recharts BarChart with drill-down logic
 */
export function InteractiveBarChart({
  data,
  dataKey,
  labelKey,
  onBarClick,
  title,
  tooltip = true
}) {
  const maxValue = Math.max(...data.map((d) => d[dataKey]));
  const padding = maxValue * 0.1;

  return (
    <div className="interactive-chart">
      <div className="chart-header">
        <h3>{title}</h3>
        <p className="chart-hint">Click a bar to see details</p>
      </div>
      <div className="chart-bars">
        {data.map((item, idx) => (
          <div key={idx} className="bar-container">
            <div className="bar-wrapper">
              <div
                className="bar clickable"
                style={{
                  height: `${(item[dataKey] / (maxValue + padding)) * 300}px`,
                  backgroundColor: 'var(--primary-blue, #2563eb)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => onBarClick(item)}
                title={`${item[labelKey]}: ${item[dataKey]} scans`}
              />
              {tooltip && (
                <div className="bar-tooltip">
                  {item[dataKey]}
                </div>
              )}
            </div>
            <label className="bar-label">{item[labelKey]}</label>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// STYLES FOR COMPONENTS
// ============================================================================
/**
 * Add this CSS to your stylesheet (or in a <style> tag in App.jsx)
 */
const analyticsStyles = `
/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  max-height: 80vh;
  overflow-y: auto;
  width: 90%;
  max-width: 500px;
  animation: slideUp 0.3s ease;
}

.modal-content.modal-large {
  max-width: 900px;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background-color: #f3f4f6;
  color: #000;
}

.modal-body {
  padding: 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: flex-end;
}

/* Visitor Details */
.visitor-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  gap: 12px;
}

.detail-row label {
  font-weight: 600;
  color: #374151;
  min-width: 100px;
}

.detail-row span {
  color: #6b7280;
}

/* Table Styles */
.visitors-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

.visitors-table thead {
  background-color: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

.visitors-table th {
  text-align: left;
  padding: 12px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.visitors-table td {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  color: #6b7280;
}

.visitor-row {
  transition: background-color 0.2s ease;
}

.visitor-row:hover {
  background-color: #f9fafb;
}

.visitor-name {
  font-weight: 600;
  color: #1f2937;
}

.visitor-name.clickable {
  cursor: pointer;
  color: #2563eb;
  text-decoration: underline;
}

.visitor-timestamp {
  font-size: 12px;
  color: #9ca3af;
  white-space: nowrap;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.pagination span {
  font-size: 14px;
  color: #6b7280;
}

/* State Displays */
.loading-state,
.error-state,
.empty-state {
  padding: 32px;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
}

.error-state {
  color: #dc2626;
}

.date-summary {
  margin-bottom: 16px;
  font-size: 14px;
  color: #6b7280;
}

.date-summary strong {
  color: #1f2937;
  font-weight: 600;
}

/* Buttons */
.btn-small {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  background-color: #f9fafb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-small:hover {
  background-color: #e5e7eb;
}

.btn-details {
  color: #2563eb;
  border-color: #2563eb;
}

.btn-details:hover {
  background-color: #eff6ff;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #1f2937;
}

.btn-secondary:hover {
  background-color: #d1d5db;
}

/* Stat Card */
.stat-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
}

.stat-card.clickable:hover {
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
  transform: translateY(-2px);
}

.stat-content {
  flex: 1;
}

.stat-label {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  margin: 8px 0 0;
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  border-radius: 8px;
  font-size: 24px;
  margin-left: 16px;
}

.drill-indicator {
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 11px;
  color: #9ca3af;
  font-weight: 500;
}

/* Interactive Chart */
.interactive-chart {
  margin-top: 16px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.chart-hint {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

.chart-bars {
  display: flex;
  gap: 16px;
  padding: 20px 0;
  align-items: flex-end;
  height: 300px;
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 20px;
}

.bar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bar-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
}

.bar {
  width: 100%;
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  position: relative;
}

.bar:hover {
  filter: brightness(0.9);
}

.bar-tooltip {
  position: absolute;
  bottom: 100%;
  background-color: #1f2937;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 4px;
  white-space: nowrap;
}

.bar-label {
  font-size: 12px;
  color: #6b7280;
  text-align: center;
  margin-top: 8px;
}
`;

export { analyticsStyles };
