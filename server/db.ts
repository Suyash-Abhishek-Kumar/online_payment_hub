import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';

// Get database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

// Setup for pooled connections
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: true,
});

// Create drizzle instance with our schema
export const db = drizzle(pool, { schema });

// Export pool for potential direct SQL queries
export { pool };

// Initialize database by creating schema and populating initial data
export async function initializeDatabase() {
  console.log("Initializing database...");
  
  try {
    // Create a client from pool for setup tasks
    const client = await pool.connect();
    
    try {
      // Create tables based on schema
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          phone TEXT,
          address TEXT,
          balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS cards (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          card_number TEXT NOT NULL,
          cardholder_name TEXT NOT NULL,
          expiry_date TEXT NOT NULL,
          cvv TEXT NOT NULL,
          card_type TEXT NOT NULL,
          is_default BOOLEAN DEFAULT FALSE
        );

        CREATE TABLE IF NOT EXISTS transactions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          amount DECIMAL(10, 2) NOT NULL,
          type TEXT NOT NULL,
          description TEXT NOT NULL,
          category TEXT NOT NULL,
          recipient_name TEXT,
          status TEXT NOT NULL,
          date TIMESTAMP NOT NULL DEFAULT NOW(),
          payment_method TEXT,
          card_id INTEGER REFERENCES cards(id)
        );

        CREATE TABLE IF NOT EXISTS qr_codes (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          qr_string TEXT NOT NULL UNIQUE,
          active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS contacts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          contact_user_id INTEGER NOT NULL REFERENCES users(id),
          last_paid TIMESTAMP
        );
      `);
      
      console.log("Database schema created successfully");
      
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}