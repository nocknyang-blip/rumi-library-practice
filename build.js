const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'firebase-config.template.js');
const configPath = path.join(__dirname, 'firebase-config.js');

let content = fs.readFileSync(templatePath, 'utf8');

// Environment variables to replace, with local defaults
const envs = {
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || "AIzaSyDZTm6qxFiDh--aTMCrHx51snchnUTg7sY",
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || "rumi-library-23b2a.firebaseapp.com",
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "rumi-library-23b2a",
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || "rumi-library-23b2a.firebasestorage.app",
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || "377660803375",
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || "1:377660803375:web:52433a4e8d1401ec2579da",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "jmfzubc1",
  CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET || "rumi_uploads"
};

for (const [key, value] of Object.entries(envs)) {
  content = content.replace(new RegExp(`%%${key}%%`, 'g'), value);
}

fs.writeFileSync(configPath, content, 'utf8');
console.log('Build completed! firebase-config.js has been generated with environment variables.');
