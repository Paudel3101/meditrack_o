import { useState, useEffect } from 'react';
import { appointmentsAPI, patientsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const STATUSES = ['scheduled', 'completed', 'cancelled', 'no-show'];

const EMPTY_FORM = {
  patient_id: '',
  appointment_date: '',
  appointment_time: '',
  reason: '',
  notes: '',
  status: 'scheduled',
};

function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter state
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editAppt, setEditAppt] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Status update modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAppt, setStatusAppt] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [filterDate, filterStatus]);

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
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await patientsAPI.getAll();
      setPatients(res.data.data || []);
    } catch {
      // silently fail
    }
  };

  const openAddModal = () => {
    setEditAppt(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setShowModal(true);
  };

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.patient_id) errs.patient_id = 'Patient is required';
    if (!formData.appointment_date) errs.appointment_date = 'Date is required';
    if (!formData.appointment_time) errs.appointment_time = 'Time is required';
    if (!formData.reason.trim()) errs.reason = 'Reason is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setSubmitting(true);
    try {
      if (editAppt) {
        await appointmentsAPI.update(editAppt.id, formData);
        showSuccess('Appointment updated!');
      } else {
        await appointmentsAPI.create(formData);
        showSuccess('Appointment scheduled!');
      }
      closeModal();
      fetchAppointments();
    } catch (err) {
      setFormErrors({ api: err.response?.data?.message || 'Operation failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const openStatusModal = (appt) => {
    setStatusAppt(appt);
    setNewStatus(appt.status);
    setCancelReason('');
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    try {
      await appointmentsAPI.updateStatus(statusAppt.id, newStatus, cancelReason);
      setShowStatusModal(false);
      showSuccess('Status updated!');
      fetchAppointments();
    } catch {
      setError('Failed to update status.');
    }
  };

  const handleDelete = async (appt) => {
    if (!window.confirm(`Delete appointment for ${appt.patient_name || 'this patient'}?`)) return;
    try {
      await appointmentsAPI.delete(appt.id);
      showSuccess('Appointment deleted.');
      fetchAppointments();
    } catch {
      setError('Failed to delete appointment.');
    }
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const clearFilters = () => { setFilterDate(''); setFilterStatus(''); };

  if (loading && appointments.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Appointments</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          + Schedule Appointment
        </button>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
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
            Clear Filters
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <LoadingSpinner />
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <strong>No appointments found</strong>
            <p>Schedule your first appointment to get started.</p>
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
                    <td className="font-medium">{appt.patient_name || `Patient #${appt.patient_id}`}</td>
                    <td>{appt.appointment_date ? new Date(appt.appointment_date).toLocaleDateString() : '—'}</td>
                    <td>{appt.appointment_time || '—'}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {appt.reason || '—'}
                    </td>
                    <td>
                      <span className={`badge badge-${appt.status}`}>{appt.status}</span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(appt)}>
                          Edit
                        </button>
                        <button className="btn btn-success btn-sm" onClick={() => openStatusModal(appt)}
                          style={{ background: '#7c3aed', color: 'white', border: 'none' }}>
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

      {/* Appointment Form Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editAppt ? 'Edit Appointment' : 'Schedule Appointment'}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
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
                  <option value="">Select a patient...</option>
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
                  {formErrors.appointment_date && (
                    <span className="form-error">{formErrors.appointment_date}</span>
                  )}
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
                  {formErrors.appointment_time && (
                    <span className="form-error">{formErrors.appointment_time}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Reason *</label>
                <input
                  name="reason"
                  type="text"
                  className={`form-control${formErrors.reason ? ' error' : ''}`}
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="e.g., Annual checkup"
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
                  placeholder="Additional notes..."
                />
              </div>

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
                  {submitting ? 'Saving...' : editAppt ? 'Update' : 'Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && statusAppt && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowStatusModal(false)}>
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Update Status</h3>
              <button className="modal-close" onClick={() => setShowStatusModal(false)}>✕</button>
            </div>
            <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>
              Appointment for: <strong>{statusAppt.patient_name || `Patient #${statusAppt.patient_id}`}</strong>
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
            {newStatus === 'cancelled' && (
              <div className="form-group">
                <label className="form-label">Cancellation Reason</label>
                <input
                  type="text"
                  className="form-control"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Patient request, emergency..."
                />
              </div>
            )}
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowStatusModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleStatusUpdate}>
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  filters: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    marginBottom: '1.5rem',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '1rem',
  },
};

export default AppointmentsPage;
