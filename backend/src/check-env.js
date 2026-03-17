// check-env.js
import fs from 'fs';
import path from 'path';

const requiredKeys = ['DATABASE_URL', 'PORT', 'JWT_SECRET']; // Adicione as suas chaves aqui
const envPath = path.resolve(process.cwd(), '.env');

if (!fs.existsSync(envPath)) {
  console.error('\x1b[31m%s\x1b[0m', 'ERROR: .env file missing!');
  console.log('Please copy .env.example to .env before proceeding.');
  process.exit(1);
}

console.log('\x1b[32m%s\x1b[0m', '✓ .env file found.');