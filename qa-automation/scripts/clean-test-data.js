import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from local qa-automation/.env, or fallback to server/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../server/.env') });

const dbUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/pern_todo';

// -------------------------------------------------------------
// STRICT SAFETY GUARDS: Zero-Bypass Local Test Database Validation
// -------------------------------------------------------------

// 1. Strict URL parsing
let parsedUrl;
try {
  parsedUrl = new URL(dbUrl);
} catch {
  console.error('\n❌ SAFETY ERROR: Malformed or unparseable DATABASE_URL.');
  process.exit(1);
}

const hostname = (parsedUrl.hostname || '').toLowerCase();
const dbName = (parsedUrl.pathname || '').replace(/^\//, '').toLowerCase();

// 2. Prohibit non-local hosts (NO bypass flag permitted)
const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
if (!isLocalHost) {
  console.error(`\n❌ SAFETY ERROR: Cleanup is strictly restricted to local machines. Host detected: "${hostname}".`);
  console.error('Remote execution is prohibited.');
  process.exit(1);
}

// 3. Prohibit production environment flags and hostnames
if (process.env.NODE_ENV === 'production' || hostname.includes('neon.tech') || dbUrl.includes('neon.tech')) {
  console.error('\n❌ SAFETY ERROR: Test data cleanup is strictly prohibited in production or Neon environments.');
  process.exit(1);
}

// 4. Explicit Database Name Validation
if (!dbName) {
  console.error('\n❌ SAFETY ERROR: No database name specified in DATABASE_URL.');
  process.exit(1);
}

if (dbName.includes('prod') || dbName.includes('live') || dbName.includes('production')) {
  console.error(`\n❌ SAFETY ERROR: Database name "${dbName}" indicates a production or live database. Aborting.`);
  process.exit(1);
}

// -------------------------------------------------------------
// Scoped Test Data Deletion (Selective Purge, No Truncate)
// -------------------------------------------------------------
async function cleanTestData() {
  const pool = new Pool({ connectionString: dbUrl });

  try {
    console.log(`🔍 Verified local target: host="${hostname}", database="${dbName}".`);
    console.log('🔍 Identifying automation-created records...');

    // Purge ONLY users matching dedicated automation test prefixes
    const query = `
      DELETE FROM users
      WHERE email LIKE 'auto_%@example.com'
         OR email LIKE 'user_%@example.com'
         OR email LIKE 'testuser_%@example.com'
      RETURNING id, email;
    `;

    const result = await pool.query(query);

    console.log(`\n✅ Cleaned up ${result.rowCount} automated test user(s).`);
    console.log('ℹ️  Associated Todos were automatically cleaned via PostgreSQL ON DELETE CASCADE.');

    if (result.rowCount > 0 && result.rowCount <= 10) {
      console.log('Deleted test accounts:', result.rows.map((r) => r.email).join(', '));
    }
  } catch (err) {
    console.error('❌ Failed to clean test data:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

cleanTestData();
