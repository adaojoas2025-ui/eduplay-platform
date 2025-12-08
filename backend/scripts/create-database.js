/**
 * Script to create the database if it doesn't exist
 */

const { Client } = require('pg');

async function createDatabase() {
  // Connect to default postgres database first
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'Asa122448@',
    database: 'postgres', // Connect to default database
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Check if database exists
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'eduplay'"
    );

    if (result.rows.length === 0) {
      // Create database
      await client.query('CREATE DATABASE eduplay');
      console.log('✅ Database "eduplay" created successfully');
    } else {
      console.log('ℹ️  Database "eduplay" already exists');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabase();
