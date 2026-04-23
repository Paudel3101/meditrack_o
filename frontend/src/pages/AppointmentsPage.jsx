import { useState, useEffect } from 'react';
import { appointmentsAPI, patientsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

/** All possible appointment status values */
const STATUSES = ['scheduled', 'completed', 'cancelled', 'no-show'];

/** CSS class map for status badges */
const STATUS_BADGE = {
  scheduled: 'badge-scheduled',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
  'no-show': 'badge-no-show',
};

/** Blank appointment form — declared outside component to avoid re-creation */
const EMPTY_FORM = {
  patient_id: '',
  appointment_date: '',
  appointment_time: '',
  reason: '',
  notes: '',
  status: 'scheduled',
};

/**
 * AppointmentsPage — protected page at /appointments.
 * Supports full CRUD: list, filter by date/status, schedule,
 * edit, update status (with cancellation reason), and delete.
 * The list auto-refreshes after every mutation.
 */
function AppointmentsPage() {
  // Appointment list data
  const [appointments, setAppointments] = useState([]);
  // Patients list (for the patient dropdown in the form)
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter controls — changes trigger automatic re-fetch via useEffect
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Add/Edit appointment modal
  const [showModal, setShowModal] = useState(false);
  const [editAppt, setEditAppt] = useState(null); // null → "add" mode
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Status-only update mini-modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAppt, setStatusAppt] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  // Fetch both appointments and patients on mount
  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, []);

  // Re-fetch appointments whenever a filter changes
  useEffect(() => {
    fetchAppointments();
  }, [filterDate, filterStatus]);

  /** Fetches appointments, applying active date and status filters */
  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterDate) params.date = filterDate;
      if (filterStatus) params.status = filterStatus;
      const res = await appointmentsAPI.getAll(params);
      setAppointments(res.data.data || []);
    } catch {
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /** Fetches non-archived patients for the appointment form dropdown */
  const fetchPatients = async () => {
    try {
      const res = await patientsAPI.getAll();
      setPatients(res.data.data || []);
    } catch {
      // Non-critical: the dropdown will be empty but the page still works
    }
  };

  /** Open modal in "add" mode */
  const openAddModal = () => {
    setEditAppt(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setShowModal(true);
  };

  /** Open modal in "edit" mode, pre-filled with existing appointment data */
  const openEditModal = (appt) => {
    setEditAppt(appt);
    setFormData({
      patient_id: appt.patient_id || '',
      appointment_date: appt.appointment_date
        ? new Date(appt.appointment_date).toISOString().split('T')[0]
        : '',
      appointment_time: appt.appointment_time || '',
      reason: appt.reason || '',
      notes: appt.notes || '',
      status: appt.status || 'scheduled',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditAppt(null); };

  /** Clear individual field error when user changes input */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  /** Required field validation before API call */
  const validate = () => {
    const errs = {};
    if (!formData.patient_id) errs.patient_id = 'Please select a patient';
    if (!formData.appointment_date) errs.appointment_date = 'Date is required';
    if (!formData.appointment_time) errs.appointment_time = 'Time is required';
    if (!formData.reason.trim()) errs.reason = 'Reason for visit is required';
    return errs;
  };

  /** Handles both create and update submission */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }

    setSubmitting(true);
    try {
      if (editAppt) {
        await appointmentsAPI.update(editAppt.id, formData);
        flashSuccess('Appointment updated successfully!');
      } else {
        await appointmentsAPI.create(formData);
        flashSuccess('Appointment scheduled successfully!');
      }
      closeModal();
      fetchAppointments(); // Auto-refresh list after mutation
    } catch (err) {
      setFormErrors({ api: err.response?.data?.message || 'Operation failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  /** Opens the quick status-change mini-modal */
  const openStatusModal = (appt) => {
    setStatusAppt(appt);
    setNewStatus(appt.status);
    setCancelReason('');
    setShowStatusModal(true);
  };

  /** Sends a status-only PATCH and auto-refreshes the list */
  const handleStatusUpdate = async () => {
    try {
      await appointmentsAPI.updateStatus(statusAppt.id, newStatus, cancelReason);
      setShowStatusModal(false);
      flashSuccess('Appointment status updated!');
      fetchAppointments();
    } catch {
      setError('Failed to update appointment status.');
    }
  };

  /** Permanently deletes an appointment after confirmation */
  const handleDelete = async (appt) => {
    if (!window.confirm(`Delete the appointment for ${appt.patient_name || 'this patient'}? This cannot be undone.`)) return;
    try {
      await appointmentsAPI.delete(appt.id);
      flashSuccess('Appointment deleted.');
      fetchAppointments(); // Auto-refresh list after delete
    } catch {
      setError('Failed to delete appointment.');
    }
  };

  /** Shows a success banner that auto-dismisses after 3 seconds */
  const flashSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const clearFilters = () => { setFilterDate(''); setFilterStatus(''); };

  if (loading && appointments.length === 0) return <LoadingSpinner message="Loading appointments…" />;

  return (
    <div>
      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">{appointments.length} appointment{appointments.length !== 1 ? 's' : ''} found</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Schedule Appointment
        </button>
      </div>

      {/* ── Filter bar ── */}
      <div style={styles.filterBar}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Filter by Date</label>
          <input
            type="date"
            className="form-control"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={{ width: '180px' }}
          />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Filter by Status</label>
          <select
            className="form-control"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        {(filterDate || filterStatus) && (
          <button className="btn btn-secondary btn-sm" onClick={clearFilters} style={{ alignSelf: 'flex-end' }}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filters
          </button>
        )}
      </div>

      {/* Status messages */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* ── Appointments table ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <LoadingSpinner message="Filtering appointments…" />
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <strong>No appointments found</strong>
            <p>{filterDate || filterStatus ? 'Try clearing your filters.' : 'Schedule your first appointment to get started.'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td className="font-semibold">{appt.patient_name || `Patient #${appt.patient_id}`}</td>
                    <td className="text-muted">
                      {appt.appointment_date
                        ? new Date(appt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="text-muted">{appt.appointment_time || '—'}</td>
                    <td className="truncate" style={{ maxWidth: '200px' }}>{appt.reason || '—'}</td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[appt.status] || 'badge-scheduled'}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(appt)}>
                          Edit
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={() => openStatusModal(appt)}
                          style={styles.statusBtn}
                        >
                          Status
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(appt)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Appointment Modal ── */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
          role="dialog"
          aria-modal="true"
          aria-label={editAppt ? 'Edit Appointment' : 'Schedule Appointment'}
        >
          <div className="modal">
            <div className="modal-header">
              <h3>{editAppt ? 'Edit Appointment' : 'Schedule Appointment'}</h3>
              <button className="modal-close" onClick={closeModal} aria-label="Close">✕</button>
            </div>

            {formErrors.api && <div className="alert alert-error">{formErrors.api}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label">Patient *</label>
                <select
                  name="patient_id"
                  className={`form-control${formErrors.patient_id ? ' error' : ''}`}
                  value={formData.patient_id}
                  onChange={handleChange}
                >
                  <option value="">Select a patient…</option>
                  {patients
                    .filter((p) => !p.is_archived)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.first_name} {p.last_name}
                      </option>
                    ))}
                </select>
                {formErrors.patient_id && <span className="form-error">{formErrors.patient_id}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    name="appointment_date"
                    type="date"
                    className={`form-control${formErrors.appointment_date ? ' error' : ''}`}
                    value={formData.appointment_date}
                    onChange={handleChange}
                  />
                  {formErrors.appointment_date && <span className="form-error">{formErrors.appointment_date}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Time *</label>
                  <input
                    name="appointment_time"
                    type="time"
                    className={`form-control${formErrors.appointment_time ? ' error' : ''}`}
                    value={formData.appointment_time}
                    onChange={handleChange}
                  />
                  {formErrors.appointment_time && <span className="form-error">{formErrors.appointment_time}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Visit *</label>
                <input
                  name="reason"
                  type="text"
                  className={`form-control${formErrors.reason ? ' error' : ''}`}
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="e.g., Annual checkup, Follow-up"
                />
                {formErrors.reason && <span className="form-error">{formErrors.reason}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  name="notes"
                  className="form-control"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Additional clinical notes…"
                />
              </div>

              {/* Status field only shown in edit mode */}
              {editAppt && (
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select name="status" className="form-control" value={formData.status} onChange={handleChange}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving…' : editAppt ? 'Update Appointment' : 'Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Quick Status Update Modal ── */}
      {showStatusModal && statusAppt && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowStatusModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Update Appointment Status"
        >
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Update Status</h3>
              <button className="modal-close" onClick={() => setShowStatusModal(false)} aria-label="Close">✕</button>
            </div>
            <p className="text-sm text-muted" style={{ marginBottom: '1.25rem' }}>
              Appointment for:{' '}
              <strong>{statusAppt.patient_name || `Patient #${statusAppt.patient_id}`}</strong>
            </p>
            <div className="form-group">
              <label className="form-label">New Status</label>
              <select
                className="form-control"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            {/* Cancellation reason — only required when setting to cancelled */}
            {newStatus === 'cancelled' && (
              <div className="form-group">
                <label className="form-label">Cancellation Reason</label>
                <input
                  type="text"
                  className="form-control"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Patient request, emergency…"
                />
              </div>
            )}
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowStatusModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleStatusUpdate}>
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  filterBar: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    marginBottom: '1.5rem',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.125rem 1.25rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  statusBtn: {
    background: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 2px 6px rgba(124,58,237,0.3)',
  },
};

export default AppointmentsPage;
