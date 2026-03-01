const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'meditrack_db',
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false
  }
};

async function initializeDatabase() {
  const client = new Client(dbConfig);
  try {
    console.log('🔄 Connecting to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'database.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('🔄 Creating tables and indexes...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      
      // Split by semicolons
      const statements = schemaSql
        .split(';')
        .map((statement) => statement.trim())
        .filter((statement) => statement.length > 0);

      let statementCount = 0;
      for (const statement of statements) {
        try {
          await client.query(statement);
          statementCount++;
          console.log(`   ✅ Statement ${statementCount} executed`);
        } catch (error) {
          // Ignore "already exists" errors
          if (error.message.includes('already exists') || error.message.includes('already exists')) {
            console.log(`   ⏭️ Skipped: already exists`);
          } else {
            console.error(`   ❌ Error: ${error.message}`);
            throw error;
          }
        }
      }
      console.log(`✅ Tables created successfully (${statementCount} statements executed)`);
    } else {
      console.error('❌ database.sql file not found');
      process.exit(1);
    }

    // Read and execute data insertion file
    const dataPath = path.join(__dirname, 'insert_data.sql');
    if (fs.existsSync(dataPath)) {
      console.log('🔄 Inserting sample data...');
      const dataSql = fs.readFileSync(dataPath, 'utf8');
      
      // Split by semicolons
      const statements = dataSql
        .split(';')
        .map((statement) => statement.trim())
        .filter((statement) => statement.length > 0);

      let insertCount = 0;
      for (const statement of statements) {
        try {
          await client.query(statement);
          insertCount++;
        } catch (error) {
          // Might have duplicate entries, log but continue
          if (error.message.includes('duplicate') || error.message.includes('Duplicate')) {
            console.warn(`   ⚠️  Duplicate entry skipped`);
          } else {
            console.warn(`   ⚠️  Warning: ${error.message}`);
          }
        }
      }
      console.log(`✅ Sample data inserted successfully (${insertCount} statements executed)`);
    } else {
      console.warn('⚠️  insert_data.sql not found at', dataPath);
    }

    console.log('\n✨ Database initialization completed successfully!');
    console.log('\n📋 Default Admin Credentials:');
    console.log('   Email: admin@meditrack.com');
    console.log('   Password: Password123!');
    console.log('\n⚠️  Please change these credentials after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run initialization
initializeDatabase();
