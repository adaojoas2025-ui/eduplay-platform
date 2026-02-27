/**
 * Firebase Admin Configuration
 * Used for Firebase Storage (APK uploads)
 */

const admin = require('firebase-admin');

let bucket = null;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT && process.env.FIREBASE_STORAGE_BUCKET) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    }

    bucket = admin.storage().bucket();
  }
} catch (err) {
  console.error('Firebase init error:', err.message);
}

module.exports = { bucket };
