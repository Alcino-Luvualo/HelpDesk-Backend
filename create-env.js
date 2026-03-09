const fs = require('fs');

const env = `HOST=${process.env.HOST || '0.0.0.0'}
PORT=${process.env.PORT || '3333'}
NODE_ENV=${process.env.NODE_ENV || 'production'}
APP_URL=${process.env.APP_URL || ''}
CACHE_VIEWS=${process.env.CACHE_VIEWS || 'true'}
APP_KEY=${process.env.APP_KEY || ''}
DB_CONNECTION=${process.env.DB_CONNECTION || 'pg'}
DATABASE_URL=${process.env.DATABASE_URL || ''}
SESSION_DRIVER=${process.env.SESSION_DRIVER || 'cookie'}
HASH_DRIVER=${process.env.HASH_DRIVER || 'bcrypt'}
CLOUDINARY_URL=${process.env.CLOUDINARY_URL || ''}
`;

fs.writeFileSync('.env', env);
console.log('.env file created successfully');
