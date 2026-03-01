#!/usr/bin/env node
/**
 * PostgreSQL Query Converter
 * Converts MySQL ? placeholders to PostgreSQL $1, $2, $3... placeholders
 */

const fs = require('fs');
const path = require('path');

function convertQuery(query, params) {
  let converted = query;
  let paramIndex = 1;
  
  // Replace each ? with $1, $2, $3, etc.
  while (converted.includes('?')) {
    converted = converted.replace('?', `$${paramIndex}`);
    paramIndex++;
  }
  
  // Replace MySQL-specific syntax
  converted = converted.replace(/= 1\b/g, '= true');
  converted = converted.replace(/= 0\b/g, '= false');
  converted = converted.replace(/TRUE/g, 'true');
  converted = converted.replace(/FALSE/g, 'false');
  converted = converted.replace(/NOW\(\)/g, 'NOW()');
  
  return converted;
}

// Files to update
const controllers = [
  'src/controllers/auth.controller.js',
  'src/controllers/patient.controller.js',
  'src/controllers/staff.controller.js',
  'src/controllers/appointment.controller.js',
  'src/controllers/dashboard.controller.js'
];

controllers.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    // Count and replace query placeholders
    const matches = content.match(/\?/g);
    if (matches) {
      console.log(`Processing ${file}: ${matches.length} replacements needed`);
      
      // Use regex to find and replace query definitions with placeholders
      content = content.replace(/'SELECT[^']*FROM[^']*WHERE[^']*\?[^']*'/g, (match) => {
        return convertQuery(match);
      });
      
      content = content.replace(/'INSERT[^']*VALUES[^']*\?[^']*'/g, (match) => {
        return convertQuery(match);
      });
      
      content = content.replace(/'UPDATE[^']*SET[^']*\?[^']*'/g, (match) => {
        return convertQuery(match);
      });
      
      content = content.replace(/`[^`]*\?[^`]*`/g, (match) => {
        return '"' + convertQuery(match.slice(1, -1)) + '"';
      });
      
      if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated ${file}`);
      } else {
        console.log(`⚠️  No changes made to ${file}`);
      }
    }
  } else {
    console.log(`❌ File not found: ${file}`);
  }
});

console.log('Migration complete!');
