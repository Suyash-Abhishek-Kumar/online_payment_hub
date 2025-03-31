import { IStorage } from "./storage";
import { 
  User, InsertUser, 
  Card, InsertCard, 
  Transaction, InsertTransaction,
  QrCode, InsertQrCode,
  Contact, InsertContact
} from "@shared/schema";
import { db, pool } from "./db";
import { desc, eq, and } from "drizzle-orm";
import * as schema from "@shared/schema";

/**
 * PostgreSQL implementation of the storage interface
 */
export class PgStorage implements IStorage {
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const users = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return users.length > 0 ? users[0] : undefined;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return users.length > 0 ? users[0] : undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return users.length > 0 ? users[0] : undefined;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const result = await db.update(schema.users)
      .set(userData)
      .where(eq(schema.users.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  // Card operations
  async getCards(userId: number): Promise<Card[]> {
    return await db.select()
      .from(schema.cards)
      .where(eq(schema.cards.userId, userId));
  }
  
  async getCard(id: number): Promise<Card | undefined> {
    const cards = await db.select()
      .from(schema.cards)
      .where(eq(schema.cards.id, id));
    return cards.length > 0 ? cards[0] : undefined;
  }
  
  async createCard(card: InsertCard): Promise<Card> {
    // If this card is set as default, unset any other default cards for this user
    if (card.isDefault) {
      await db.update(schema.cards)
        .set({ isDefault: false })
        .where(eq(schema.cards.userId, card.userId));
    }
    
    const result = await db.insert(schema.cards).values(card).returning();
    return result[0];
  }
  
  async updateCard(id: number, cardData: Partial<Card>): Promise<Card | undefined> {
    // If this card is being set as default, unset any other default cards for this user
    if (cardData.isDefault) {
      const card = await this.getCard(id);
      if (card) {
        await db.update(schema.cards)
          .set({ isDefault: false })
          .where(eq(schema.cards.userId, card.userId));
      }
    }
    
    const result = await db.update(schema.cards)
      .set(cardData)
      .where(eq(schema.cards.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  async deleteCard(id: number): Promise<boolean> {
    const result = await db.delete(schema.cards)
      .where(eq(schema.cards.id, id))
      .returning({ id: schema.cards.id });
    return result.length > 0;
  }
  
  async setDefaultCard(userId: number, cardId: number): Promise<boolean> {
    // Start a transaction to ensure atomicity
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Unset all default cards for this user
      await client.query(
        'UPDATE cards SET is_default = FALSE WHERE user_id = $1',
        [userId]
      );
      
      // Set the specified card as default
      const result = await client.query(
        'UPDATE cards SET is_default = TRUE WHERE id = $1 AND user_id = $2 RETURNING id',
        [cardId, userId]
      );
      
      await client.query('COMMIT');
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error setting default card:', error);
      return false;
    } finally {
      client.release();
    }
  }
  
  // Transaction operations
  async getTransactions(userId: number, limit?: number): Promise<Transaction[]> {
    if (limit) {
      // Use raw query with limit for type safety
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC LIMIT $2',
          [userId, limit]
        );
        return result.rows;
      } finally {
        client.release();
      }
    } else {
      // Use drizzle ORM without limit
      return await db.select()
        .from(schema.transactions)
        .where(eq(schema.transactions.userId, userId))
        .orderBy(desc(schema.transactions.date));
    }
  }
  
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const transactions = await db.select()
      .from(schema.transactions)
      .where(eq(schema.transactions.id, id));
    return transactions.length > 0 ? transactions[0] : undefined;
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    // Start a transaction to ensure atomicity
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Create the transaction
      const transactionResult = await client.query(
        `INSERT INTO transactions 
         (user_id, amount, type, description, category, recipient_name, status, payment_method, card_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING *`,
        [
          transaction.userId, 
          transaction.amount, 
          transaction.type, 
          transaction.description,
          transaction.category,
          transaction.recipientName,
          transaction.status,
          transaction.paymentMethod,
          transaction.cardId
        ]
      );
      
      // Update user balance
      if (transaction.type === 'credit') {
        await client.query(
          'UPDATE users SET balance = balance + $1 WHERE id = $2',
          [transaction.amount, transaction.userId]
        );
      } else if (transaction.type === 'debit') {
        await client.query(
          'UPDATE users SET balance = balance - $1 WHERE id = $2',
          [transaction.amount, transaction.userId]
        );
      }
      
      // If this is a payment to a contact, update last_paid timestamp
      if (transaction.recipientName && transaction.status === 'completed') {
        // Find contact by name
        const contactResult = await client.query(
          `SELECT c.id FROM contacts c
           JOIN users u ON c.contact_user_id = u.id
           WHERE c.user_id = $1 AND CONCAT(u.first_name, ' ', u.last_name) = $2`,
          [transaction.userId, transaction.recipientName]
        );
        
        if (contactResult.rows.length > 0) {
          await client.query(
            'UPDATE contacts SET last_paid = NOW() WHERE id = $1',
            [contactResult.rows[0].id]
          );
        }
      }
      
      await client.query('COMMIT');
      return transactionResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating transaction:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  // QR Code operations
  async getQrCode(userId: number): Promise<QrCode | undefined> {
    const qrCodes = await db.select()
      .from(schema.qrCodes)
      .where(and(
        eq(schema.qrCodes.userId, userId),
        eq(schema.qrCodes.active, true)
      ));
    return qrCodes.length > 0 ? qrCodes[0] : undefined;
  }
  
  async createQrCode(qrCode: InsertQrCode): Promise<QrCode> {
    // Deactivate existing QR codes for this user
    await db.update(schema.qrCodes)
      .set({ active: false })
      .where(eq(schema.qrCodes.userId, qrCode.userId));
    
    // Create new QR code
    const result = await db.insert(schema.qrCodes).values(qrCode).returning();
    return result[0];
  }
  
  // Contact operations
  async getContacts(userId: number): Promise<(Contact & { contactUser: User })[]> {
    // For this complex query with a join, use raw SQL with the pool
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT c.*, u.* 
         FROM contacts c
         JOIN users u ON c.contact_user_id = u.id
         WHERE c.user_id = $1`,
        [userId]
      );
      
      // Map the result to the expected format
      return result.rows.map(row => {
        // Extract contact fields
        const contact: Contact = {
          id: row.id,
          userId: row.user_id,
          contactUserId: row.contact_user_id,
          lastPaid: row.last_paid
        };
        
        // Extract user fields
        const contactUser: User = {
          id: row.id,
          username: row.username,
          password: row.password,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          phone: row.phone,
          address: row.address,
          balance: row.balance,
          createdAt: row.created_at
        };
        
        return { ...contact, contactUser };
      });
    } finally {
      client.release();
    }
  }
  
  async createContact(contact: InsertContact): Promise<Contact> {
    const result = await db.insert(schema.contacts).values(contact).returning();
    return result[0];
  }
  
  async updateContactLastPaid(id: number): Promise<boolean> {
    const result = await db.update(schema.contacts)
      .set({ lastPaid: new Date() })
      .where(eq(schema.contacts.id, id))
      .returning({ id: schema.contacts.id });
    return result.length > 0;
  }
}

// Export a singleton instance
export const pgStorage = new PgStorage();