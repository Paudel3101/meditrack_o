import { useState, useEffect } from 'react';
import { patientsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['Male', 'Female', 'Other'];

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

function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchPatients(searchQuery);
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
    } catch (err) {
      setError('Failed to load patients.');
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

  // Open add modal
  const openAddModal = () => {
    setEditPatient(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setShowModal(true);
  };

  // Open edit modal
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.first_name.trim()) errs.first_name = 'First name is required';
    if (!formData.last_name.trim()) errs.last_name = 'Last name is required';
    if (!formData.date_of_birth) errs.date_of_birth = 'Date of birth is required';
    if (!formData.phone.trim()) errs.phone = 'Phone is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Enter a valid email';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setSubmitting(true);
    try {
      if (editPatient) {
        await patientsAPI.update(editPatient.id, formData);
        showSuccess('Patient updated successfully!');
      } else {
        await patientsAPI.create(formData);
        showSuccess('Patient added successfully!');
      }
      closeModal();
      fetchPatients();
    } catch (err) {
      setFormErrors({ api: err.response?.data?.message || 'Operation failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (patient) => {
    if (!window.confirm(`Archive patient ${patient.first_name} ${patient.last_name}?`)) return;
    try {
      await patientsAPI.archive(patient.id);
      showSuccess('Patient archived.');
      fetchPatients();
    } catch {
      setError('Failed to archive patient.');
    }
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  if (loading && patients.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Patients</h1>
        <div className="flex gap-2 items-center" style={{ flexWrap: 'wrap' }}>
          {/* Search */}
          <div className="search-bar">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#94a3b8', flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={openAddModal}>
            + Add Patient
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <LoadingSpinner />
        ) : patients.length === 0 ? (
          <div className="empty-state">
            <strong>No patients found</strong>
            <p>{searchQuery ? 'Try a different search.' : 'Add your first patient to get started.'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>MRN</th>
                  <th>Gender</th>
                  <th>DOB</th>
                  <th>Phone</th>
                  <th>Blood</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.first_name} {p.last_name}</td>
                    <td className="text-muted text-sm">{p.medical_record_number || `#${p.id}`}</td>
                    <td>{p.gender}</td>
                    <td>{p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString() : '—'}</td>
                    <td>{p.phone}</td>
                    <td>{p.blood_group || '—'}</td>
                    <td>
                      <span className={`badge ${p.is_archived ? 'badge-cancelled' : 'badge-completed'}`}>
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

      {/* Patient Form Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editPatient ? 'Edit Patient' : 'Add New Patient'}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
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
                <label className="form-label">Allergies</label>
                <input
                  name="allergies"
                  type="text"
                  className="form-control"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="Penicillin, Peanuts..."
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
                  placeholder="Additional notes..."
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editPatient ? 'Update Patient' : 'Add Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientsPage;
