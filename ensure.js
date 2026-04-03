const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, '');
  console.log('.env file created successfully');
} else {
  console.log('.env file already existsOO');
}
