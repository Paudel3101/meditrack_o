import { useState, useEffect } from 'react';
import { patientsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

/** Allowed blood type options */
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
/** Allowed gender options */
const GENDERS = ['Male', 'Female', 'Other'];

/** Blank form used when opening the Add modal */
const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  date_of_birth: '',
  gender: 'Male',
  phone: '',
  email: '',
  address: '',
  blood_group: '',
  allergies: '',
  medical_notes: '',
};

/**
 * PatientsPage — protected page at /patients.
 * Supports full CRUD: list all patients, search (debounced),
 * add via modal, edit via modal, and archive (soft-delete).
 * The list auto-refreshes after every create / update / archive action.
 */
function PatientsPage() {
  // Patient list data
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search input
  const [searchQuery, setSearchQuery] = useState('');

  // Add/Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editPatient, setEditPatient] = useState(null); // null → "add" mode
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch full patient list on mount
  useEffect(() => {
    fetchPatients();
  }, []);

  /**
   * Debounced search: waits 400 ms after the user stops typing.
   * Falls back to full list when query is cleared.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchPatients(searchQuery.trim());
      } else if (searchQuery.trim() === '') {
        fetchPatients();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchPatients = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await patientsAPI.getAll();
      setPatients(res.data.data || []);
    } catch {
      setError('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const searchPatients = async (q) => {
    setLoading(true);
    try {
      const res = await patientsAPI.search(q);
      setPatients(res.data.data || []);
    } catch {
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  /** Open modal in "add" mode with a blank form */
  const openAddModal = () => {
    setEditPatient(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setShowModal(true);
  };

  /** Open modal in "edit" mode, pre-filling form with existing patient data */
  const openEditModal = (patient) => {
    setEditPatient(patient);
    setFormData({
      first_name: patient.first_name || '',
      last_name: patient.last_name || '',
      date_of_birth: patient.date_of_birth
        ? new Date(patient.date_of_birth).toISOString().split('T')[0]
        : '',
      gender: patient.gender || 'Male',
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
      blood_group: patient.blood_group || '',
      allergies: patient.allergies || '',
      medical_notes: patient.medical_notes || '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditPatient(null);
  };

  /** Clear individual field error on change */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  /** Required field validation before API call */
  const validate = () => {
    const errs = {};
    if (!formData.first_name.trim()) errs.first_name = 'First name is required';
    if (!formData.last_name.trim()) errs.last_name = 'Last name is required';
    if (!formData.date_of_birth) errs.date_of_birth = 'Date of birth is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Enter a valid email address';
    }
    return errs;
  };

  /** Handles both create and update submission */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }

    setSubmitting(true);
    try {
      if (editPatient) {
        await patientsAPI.update(editPatient.id, formData);
        flashSuccess('Patient updated successfully!');
      } else {
        await patientsAPI.create(formData);
        flashSuccess('Patient added successfully!');
      }
      closeModal();
      fetchPatients(); // Auto-refresh list after mutation
    } catch (err) {
      setFormErrors({ api: err.response?.data?.message || 'Operation failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  /** Soft-delete: archives patient record (preserves history) */
  const handleArchive = async (patient) => {
    if (!window.confirm(`Archive ${patient.first_name} ${patient.last_name}? They will be hidden from active lists.`)) return;
    try {
      await patientsAPI.archive(patient.id);
      flashSuccess('Patient archived successfully.');
      fetchPatients(); // Auto-refresh list after archive
    } catch {
      setError('Failed to archive patient. Please try again.');
    }
  };

  /** Shows a success toast that auto-dismisses after 3 seconds */
  const flashSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  // Show spinner on initial load (no data yet)
  if (loading && patients.length === 0) return <LoadingSpinner message="Loading patients…" />;

  return (
    <div>
      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="page-subtitle">{patients.length} record{patients.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {/* Debounced search input */}
          <div className="search-bar">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: '#94a3b8', flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, MRN…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search patients"
            />
          </div>
          <button className="btn btn-primary" onClick={openAddModal}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Patient
          </button>
        </div>
      </div>

      {/* Status messages */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* ── Patient table ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <LoadingSpinner message="Searching…" />
        ) : patients.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <strong>No patients found</strong>
            <p>{searchQuery ? 'Try a different search term.' : 'Add your first patient to get started.'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>MRN</th>
                  <th>Gender</th>
                  <th>Date of Birth</th>
                  <th>Phone</th>
                  <th>Blood</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={cellStyles.nameRow}>
                        <div style={cellStyles.avatar}>
                          {p.first_name?.[0]}{p.last_name?.[0]}
                        </div>
                        <span className="font-semibold">{p.first_name} {p.last_name}</span>
                      </div>
                    </td>
                    <td className="text-muted text-sm">{p.medical_record_number || `#${p.id}`}</td>
                    <td>{p.gender}</td>
                    <td className="text-muted">
                      {p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td>{p.phone}</td>
                    <td>
                      {p.blood_group
                        ? <span style={cellStyles.bloodBadge}>{p.blood_group}</span>
                        : <span className="text-faint">—</span>}
                    </td>
                    <td>
                      <span className={`badge ${p.is_archived ? 'badge-archived' : 'badge-active'}`}>
                        {p.is_archived ? 'Archived' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(p)}>
                          Edit
                        </button>
                        {!p.is_archived && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleArchive(p)}>
                            Archive
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Patient Modal ── */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
          role="dialog"
          aria-modal="true"
          aria-label={editPatient ? 'Edit Patient' : 'Add New Patient'}
        >
          <div className="modal">
            <div className="modal-header">
              <h3>{editPatient ? 'Edit Patient' : 'Add New Patient'}</h3>
              <button className="modal-close" onClick={closeModal} aria-label="Close">✕</button>
            </div>

            {formErrors.api && <div className="alert alert-error">{formErrors.api}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    name="first_name"
                    type="text"
                    className={`form-control${formErrors.first_name ? ' error' : ''}`}
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="John"
                  />
                  {formErrors.first_name && <span className="form-error">{formErrors.first_name}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input
                    name="last_name"
                    type="text"
                    className={`form-control${formErrors.last_name ? ' error' : ''}`}
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Doe"
                  />
                  {formErrors.last_name && <span className="form-error">{formErrors.last_name}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date of Birth *</label>
                  <input
                    name="date_of_birth"
                    type="date"
                    className={`form-control${formErrors.date_of_birth ? ' error' : ''}`}
                    value={formData.date_of_birth}
                    onChange={handleChange}
                  />
                  {formErrors.date_of_birth && <span className="form-error">{formErrors.date_of_birth}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select name="gender" className="form-control" value={formData.gender} onChange={handleChange}>
                    {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input
                    name="phone"
                    type="tel"
                    className={`form-control${formErrors.phone ? ' error' : ''}`}
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="555-0100"
                  />
                  {formErrors.phone && <span className="form-error">{formErrors.phone}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select name="blood_group" className="form-control" value={formData.blood_group} onChange={handleChange}>
                    <option value="">Unknown</option>
                    {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  name="email"
                  type="email"
                  className={`form-control${formErrors.email ? ' error' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="patient@email.com"
                />
                {formErrors.email && <span className="form-error">{formErrors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input
                  name="address"
                  type="text"
                  className="form-control"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Main St"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Known Allergies</label>
                <input
                  name="allergies"
                  type="text"
                  className="form-control"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="Penicillin, Peanuts…"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Medical Notes</label>
                <textarea
                  name="medical_notes"
                  className="form-control"
                  value={formData.medical_notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Additional clinical notes…"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving…' : editPatient ? 'Update Patient' : 'Add Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const cellStyles = {
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #dbeafe, #ede9fe)',
    color: '#1e40af',
    fontSize: '0.7rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    textTransform: 'uppercase',
  },
  bloodBadge: {
    display: 'inline-block',
    padding: '0.15rem 0.5rem',
    borderRadius: '6px',
    background: '#fee2e2',
    color: '#991b1b',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
};

export default PatientsPage;
