
// Role          Email                          Password
// Admin         admin@meditrack.com            Admin@1234!
// Doctor        doctor@meditrack.com           Doctor@1234!
// Nurse         nurse@meditrack.com            Nurse@1234!
// Receptionist  receptionist@meditrack.com     Reception@1234!


const { Client } = require('pg');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DB_CONFIG = {
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     parseInt(process.env.DB_PORT, 10) || 5432,
  ssl:      { rejectUnauthorized: false },
};

const STAFF = [
  {
    email:      'admin@meditrack.com',
    password:   'Admin@1234!',
    first_name: 'Alex',
    last_name:  'Johnson',
    phone:      '555-001-0001',
    role:       'Admin',
  },
  {
    email:      'doctor@meditrack.com',
    password:   'Doctor@1234!',
    first_name: 'Dr. Sarah',
    last_name:  'Williams',
    phone:      '555-001-0002',
    role:       'Doctor',
    specialization: 'General Practice',
  },
  {
    email:      'nurse@meditrack.com',
    password:   'Nurse@1234!',
    first_name: 'Emily',
    last_name:  'Davis',
    phone:      '555-001-0003',
    role:       'Nurse',
  },
  {
    email:      'receptionist@meditrack.com',
    password:   'Reception@1234!',
    first_name: 'James',
    last_name:  'Brown',
    phone:      '555-001-0004',
    role:       'Receptionist',
  },
];

const PATIENTS = [
  { mrn:'MRN-0001', first:'Robert',    last:'Davis',    dob:'1985-03-15', gender:'Male',   phone:'555-201-0001', email:'robert.davis@example.com',   blood_group:'O+', allergies:'Penicillin', address:'123 Maple St, Springfield IL' },
  { mrn:'MRN-0002', first:'Jennifer',  last:'Wilson',   dob:'1992-07-22', gender:'Female', phone:'555-201-0002', email:'jennifer.wilson@example.com', blood_group:'A+', allergies:'None',       address:'456 Oak Ave, Springfield IL'  },
  { mrn:'MRN-0003', first:'Michael',   last:'Miller',   dob:'1978-11-30', gender:'Male',   phone:'555-201-0003', email:'michael.miller@example.com',  blood_group:'B-', allergies:'Aspirin',    address:'789 Elm St, Springfield IL'   },
  { mrn:'MRN-0004', first:'Lisa',      last:'Anderson', dob:'1988-05-18', gender:'Female', phone:'555-201-0004', email:'lisa.anderson@example.com',   blood_group:'AB+',allergies:'None',       address:'321 Pine Rd, Springfield IL'  },
  { mrn:'MRN-0005', first:'David',     last:'Taylor',   dob:'1995-09-12', gender:'Male',   phone:'555-201-0005', email:'david.taylor@example.com',    blood_group:'O-', allergies:'Latex',      address:'654 Cedar Ln, Springfield IL' },
  { mrn:'MRN-0006', first:'Sarah',     last:'Thomas',   dob:'1982-01-25', gender:'Female', phone:'555-201-0006', email:'sarah.thomas@example.com',    blood_group:'A-', allergies:'None',       address:'987 Birch Dr, Springfield IL' },
  { mrn:'MRN-0007', first:'James',     last:'Jackson',  dob:'1990-06-08', gender:'Male',   phone:'555-201-0007', email:'james.jackson@example.com',   blood_group:'B+', allergies:'Sulfa',      address:'147 Spruce Ct, Springfield IL'},
  { mrn:'MRN-0008', first:'Patricia',  last:'White',    dob:'1987-04-14', gender:'Female', phone:'555-201-0008', email:'patricia.white@example.com',  blood_group:'O+', allergies:'None',       address:'258 Walnut Blvd, Springfield IL'},
  { mrn:'MRN-0009', first:'William',   last:'Harris',   dob:'1993-08-03', gender:'Male',   phone:'555-201-0009', email:'william.harris@example.com',  blood_group:'A+', allergies:'Iodine',     address:'369 Poplar Ave, Springfield IL'},
  { mrn:'MRN-0010', first:'Susan',     last:'Martin',   dob:'1980-12-20', gender:'Female', phone:'555-201-0010', email:'susan.martin@example.com',    blood_group:'B-', allergies:'None',       address:'741 Hickory St, Springfield IL'},
];

async function run() {
  const client = new Client(DB_CONFIG);
  console.log('\n🔄  Connecting to PostgreSQL…');
  await client.connect();
  console.log('✅  Connected\n');

  try {
    // ── Step 1: Drop everything and recreate schema ──────────────────────────
    console.log('🔄  Applying schema (this drops existing tables)…');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');

    // Execute schema statements one at a time so we can skip already-exists errors
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      try {
        await client.query(stmt);
      } catch (err) {
        if (!err.message.includes('already exists')) throw err;
      }
    }
    console.log('✅  Schema ready\n');

    // ── Step 2: Seed staff (one per role) ────────────────────────────────────
    console.log('🔄  Seeding staff accounts…');
    const staffIds = {};

    for (const s of STAFF) {
      const hash = await bcrypt.hash(s.password, 10);
      const res = await client.query(
        `INSERT INTO staff (email, password_hash, first_name, last_name, phone, role, specialization, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,TRUE)
         ON CONFLICT (email) DO UPDATE
           SET password_hash=$2, first_name=$3, last_name=$4, phone=$5,
               role=$6, specialization=$7, is_active=TRUE
         RETURNING id`,
        [s.email, hash, s.first_name, s.last_name, s.phone, s.role, s.specialization || null]
      );
      staffIds[s.role] = res.rows[0].id;
      console.log(`   ✅  ${s.role.padEnd(14)} ${s.email}  →  password: ${s.password}`);
    }

    console.log('\n🔄  Seeding patients…');
    const patientIds = [];

    for (const p of PATIENTS) {
      const res = await client.query(
        `INSERT INTO patients (medical_record_number, first_name, last_name, date_of_birth, gender, phone, email, address, blood_group, allergies)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (medical_record_number) DO UPDATE
           SET first_name=$2, last_name=$3, date_of_birth=$4, gender=$5,
               phone=$6, email=$7, address=$8, blood_group=$9, allergies=$10
         RETURNING id`,
        [p.mrn, p.first, p.last, p.dob, p.gender, p.phone, p.email, p.address, p.blood_group, p.allergies]
      );
      patientIds.push(res.rows[0].id);
    }
    console.log(`   ✅  ${patientIds.length} patients inserted`);

    console.log('\n🔄  Seeding appointments…');
    const doctorId = staffIds['Doctor'];

    const APPOINTMENTS = [
      { patIdx:0, date:'2026-04-23', time:'09:00', reason:'Annual checkup',              status:'scheduled'  },
      { patIdx:1, date:'2026-04-23', time:'10:00', reason:'Migraine evaluation',          status:'scheduled'  },
      { patIdx:2, date:'2026-04-24', time:'14:00', reason:'Cardiac consultation',         status:'scheduled'  },
      { patIdx:3, date:'2026-04-24', time:'15:30', reason:'Diabetes management review',   status:'scheduled'  },
      { patIdx:4, date:'2026-04-25', time:'11:00', reason:'Post-illness check-up',        status:'scheduled'  },
      { patIdx:5, date:'2026-04-21', time:'09:30', reason:'Annual physical follow-up',    status:'completed'  },
      { patIdx:6, date:'2026-04-20', time:'13:00', reason:'Physical therapy discussion',  status:'completed'  },
      { patIdx:7, date:'2026-04-19', time:'10:30', reason:'Thyroid medication adjustment',status:'completed'  },
      { patIdx:8, date:'2026-04-18', time:'14:00', reason:'General check-up',             status:'cancelled', cancel_reason:'Patient requested reschedule' },
      { patIdx:9, date:'2026-04-26', time:'11:30', reason:'Initial consultation',         status:'scheduled'  },
    ];

    for (const a of APPOINTMENTS) {
      await client.query(
        `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status, cancellation_reason, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          patientIds[a.patIdx], doctorId,
          a.date, a.time, a.reason, a.status,
          a.cancel_reason || null,
          staffIds['Receptionist']
        ]
      );
    }
    console.log(`   ✅  ${APPOINTMENTS.length} appointments inserted`);

    console.log('\n' + '═'.repeat(60));
    console.log('✨  MediTrack database seeded successfully!\n');
    console.log('  Demo Login Credentials');
    console.log('  ' + '─'.repeat(56));
    console.log('  Role            Email                           Password');
    console.log('  ' + '─'.repeat(56));
    for (const s of STAFF) {
      console.log(`  ${s.role.padEnd(16)}${s.email.padEnd(32)}${s.password}`);
    }
    console.log('  ' + '─'.repeat(56));
    console.log('\n  All accounts are active and ready to use.');
    console.log('═'.repeat(60) + '\n');

  } catch (err) {
    console.error('\n❌  Seed failed:', err.message);
    throw err;
  } finally {
    await client.end();
  }
}

run().catch(() => process.exit(1));
