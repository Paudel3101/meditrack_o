-- Insert Sample Data into MediTrack Database

-- Insert Staff Members (passwords are hashed with bcrypt)
-- Admin user: admin@meditrack.com / Password123!
INSERT INTO staff (email, password_hash, first_name, last_name, phone, role, is_active) VALUES
('admin@meditrack.com', '$2b$10$GVIPQszy4ZHDPxb8nkWlaeMwGRThpyBNN.lPw1cvpisHUkcISuiTy', 'Admin', 'User', '1234567890', 'Admin', TRUE),
('dr.john@meditrack.com', '$2b$10$GVIPQszy4ZHDPxb8nkWlaeMwGRThpyBNN.lPw1cvpisHUkcISuiTy', 'John', 'Smith', '9876543210', 'Doctor', TRUE),
('dr.sarah@meditrack.com', '$2b$10$GVIPQszy4ZHDPxb8nkWlaeMwGRThpyBNN.lPw1cvpisHUkcISuiTy', 'Sarah', 'Johnson', '8765432109', 'Doctor', TRUE),
('nurse.emily@meditrack.com', '$2b$10$GVIPQszy4ZHDPxb8nkWlaeMwGRThpyBNN.lPw1cvpisHUkcISuiTy', 'Emily', 'Williams', '7654321098', 'Nurse', TRUE),
('receptionist.jane@meditrack.com', '$2b$10$GVIPQszy4ZHDPxb8nkWlaeMwGRThpyBNN.lPw1cvpisHUkcISuiTy', 'Jane', 'Brown', '6543210987', 'Receptionist', TRUE);

-- Insert Patients
INSERT INTO patients (medical_record_number, first_name, last_name, date_of_birth, gender, phone, email, address, city, state, zip_code, allergies, blood_type, emergency_contact_name, emergency_contact_phone, is_archived) VALUES
('MRN001', 'Robert', 'Davis', '1985-03-15', 'Male', '5551234567', 'robert.davis@example.com', '123 Main St', 'Springfield', 'IL', '62701', 'Penicillin', 'O+', 'Mary Davis', '5559876543', FALSE),
('MRN002', 'Jennifer', 'Wilson', '1992-07-22', 'Female', '5551234568', 'jennifer.w@example.com', '456 Oak Ave', 'Springfield', 'IL', '62702', 'None', 'A+', 'Michael Wilson', '5559876544', FALSE),
('MRN003', 'Michael', 'Miller', '1978-11-30', 'Male', '5551234569', 'michael.m@example.com', '789 Elm St', 'Springfield', 'IL', '62703', 'Aspirin', 'B-', 'Lisa Miller', '5559876545', FALSE),
('MRN004', 'Lisa', 'Anderson', '1988-05-18', 'Female', '5551234570', 'lisa.a@example.com', '321 Pine Rd', 'Springfield', 'IL', '62704', 'None', 'AB+', 'David Anderson', '5559876546', FALSE),
('MRN005', 'David', 'Taylor', '1995-09-12', 'Male', '5551234571', 'david.t@example.com', '654 Maple Dr', 'Springfield', 'IL', '62705', 'Latex', 'O-', 'Sarah Taylor', '5559876547', FALSE),
('MRN006', 'Sarah', 'Thomas', '1982-01-25', 'Female', '5551234572', 'sarah.t@example.com', '987 Cedar Ln', 'Springfield', 'IL', '62706', 'None', 'A-', 'James Thomas', '5559876548', FALSE),
('MRN007', 'James', 'Jackson', '1990-06-08', 'Male', '5551234573', 'james.j@example.com', '147 Birch St', 'Springfield', 'IL', '62707', 'Sulfa drugs', 'B+', 'Patricia Jackson', '5559876549', FALSE),
('MRN008', 'Patricia', 'White', '1987-04-14', 'Female', '5551234574', 'patricia.w@example.com', '258 Spruce Rd', 'Springfield', 'IL', '62708', 'None', 'O+', 'William White', '5559876550', FALSE),
('MRN009', 'William', 'Harris', '1993-08-03', 'Male', '5551234575', 'william.h@example.com', '369 Poplar Ave', 'Springfield', 'IL', '62709', 'Iodine', 'A+', 'Susan Harris', '5559876551', FALSE),
('MRN010', 'Susan', 'Martin', '1980-12-20', 'Female', '5551234576', 'susan.m@example.com', '741 Walnut St', 'Springfield', 'IL', '62710', 'None', 'B-', 'Charles Martin', '5559876552', FALSE);

-- Insert Medical Records
INSERT INTO medical_records (patient_id, visit_date, chief_complaint, diagnosis, treatment, notes, doctor_id) VALUES
(1, '2026-01-15', 'High blood pressure', 'Hypertension', 'Lisinopril 10mg daily', 'Patient advised to reduce salt intake', 2),
(2, '2026-01-18', 'Headache', 'Tension headache', 'Ibuprofen 400mg as needed', 'Follow up in 2 weeks if persists', 3),
(3, '2026-01-20', 'Chest pain', 'Angina', 'Nitroglycerin sublingual', 'Referred to cardiology', 2),
(4, '2026-01-22', 'Diabetes check-up', 'Type 2 Diabetes', 'Metformin 500mg twice daily', 'Blood sugar levels improving', 3),
(5, '2026-01-25', 'Cough and fever', 'Common cold', 'Rest, fluids, and over-the-counter cough syrup', 'Symptoms should improve in 5-7 days', 2),
(6, '2026-01-28', 'Annual physical', 'No issues found', 'Continue current lifestyle', 'Everything looks good', 3),
(7, '2026-02-01', 'Back pain', 'Lumbar strain', 'Physical therapy and pain relief', 'Avoid heavy lifting', 2),
(8, '2026-02-02', 'Thyroid check', 'Hypothyroidism', 'Levothyroxine 50mcg daily', 'Monitor TSH levels monthly', 3);

-- Insert Appointments
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, duration_minutes, status, notes, created_by) VALUES
(1, 2, '2026-02-05', '09:00:00', 30, 'Scheduled', 'Follow-up for blood pressure', 5),
(2, 3, '2026-02-05', '10:00:00', 30, 'Scheduled', 'Migraine evaluation', 5),
(3, 2, '2026-02-06', '14:00:00', 45, 'Scheduled', 'Cardiac consultation', 5),
(4, 3, '2026-02-06', '15:30:00', 30, 'Scheduled', 'Diabetes management review', 5),
(5, 2, '2026-02-10', '11:00:00', 30, 'Scheduled', 'Post-illness check-up', 5),
(6, 3, '2026-02-12', '09:30:00', 30, 'Scheduled', 'Annual physical follow-up', 5),
(7, 2, '2026-02-15', '13:00:00', 45, 'Scheduled', 'Physical therapy discussion', 5),
(8, 3, '2026-02-17', '10:30:00', 30, 'Scheduled', 'Thyroid medication adjustment', 5),
(1, 3, '2026-02-20', '14:00:00', 30, 'Scheduled', 'General check-up', 5),
(9, 2, '2026-02-22', '11:30:00', 30, 'Scheduled', 'Initial consultation', 5);-- Insert Sessions (initially empty - will be populated on login)
