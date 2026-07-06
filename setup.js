const fs = require('fs');
const path = require('path');

console.log('🍎 Setting up NutriSuite - Diet Management Web App');
console.log('================================================\n');

// Create environment files if they don't exist
const backendEnvPath = path.join(__dirname, 'backend', '.env');
const frontendEnvPath = path.join(__dirname, 'frontend', '.env.local');

if (!fs.existsSync(backendEnvPath)) {
  const backendEnvContent = `NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dietience
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
UPLOAD_PATH=../uploads`;
  
  fs.writeFileSync(backendEnvPath, backendEnvContent);
  console.log('✅ Created backend/.env file');
} else {
  console.log('ℹ️  backend/.env already exists');
}

if (!fs.existsSync(frontendEnvPath)) {
  const frontendEnvContent = `NEXT_PUBLIC_API_URL=http://localhost:5000/api`;
  
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log('✅ Created frontend/.env.local file');
} else {
  console.log('ℹ️  frontend/.env.local already exists');
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
} else {
  console.log('ℹ️  uploads directory already exists');
}

console.log('\n🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Install dependencies:');
console.log('   npm install');
console.log('   cd backend && npm install');
console.log('   cd ../frontend && npm install');
console.log('\n2. Start MongoDB (if not already running)');
console.log('\n3. Seed the database:');
console.log('   cd backend && npm run seed');
console.log('\n4. Start the development servers:');
console.log('   npm run dev');
console.log('\n5. Open http://localhost:3000 in your browser');
console.log('\nDemo accounts:');
console.log('   Admin: admin@dietience.com / admin123');
console.log('   Client: john@example.com / password123');
