/**
 * Passport Google OAuth Configuration
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.users.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy - Only configure if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/v1/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('🔐 Google OAuth Profile:', {
            id: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
          });

          // Check if user already exists
          let user = await prisma.users.findUnique({
            where: { email: profile.emails[0].value },
          });

          if (user) {
            // User exists, update googleId if not set
            if (!user.googleId) {
              user = await prisma.users.update({
                where: { id: user.id },
                data: { googleId: profile.id },
              });
            }
            console.log('✅ Existing user logged in via Google:', user.email);
          } else {
            // Create new user from Google profile
            user = await prisma.users.create({
              data: {
                id: crypto.randomUUID(),
                email: profile.emails[0].value,
                name: profile.displayName,
                googleId: profile.id,
                emailVerified: true, // Google emails are verified
                emailVerifiedAt: new Date(),
                status: 'ACTIVE',
                role: 'BUYER', // Default role for Google users
                password: '', // No password for OAuth users
              },
            });
            console.log('✅ New user created via Google:', user.email);
          }

          return done(null, user);
        } catch (error) {
          console.error('❌ Google OAuth Error:', error);
          return done(error, null);
        }
      }
    )
  );
  console.log('✅ Google OAuth configured');
} else {
  console.log('ℹ️ Google OAuth not configured - skipping');
}

module.exports = passport;
