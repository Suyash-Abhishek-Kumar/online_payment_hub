import { 
  users, User, InsertUser, 
  cards, Card, InsertCard,
  transactions, Transaction, InsertTransaction,
  qrCodes, QrCode, InsertQrCode,
  contacts, Contact, InsertContact
} from "@shared/schema";

// Storage interface with CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;

  // Card operations
  getCards(userId: number): Promise<Card[]>;
  getCard(id: number): Promise<Card | undefined>;
  createCard(card: InsertCard): Promise<Card>;
  updateCard(id: number, cardData: Partial<Card>): Promise<Card | undefined>;
  deleteCard(id: number): Promise<boolean>;
  setDefaultCard(userId: number, cardId: number): Promise<boolean>;

  // Transaction operations
  getTransactions(userId: number, limit?: number): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // QR Code operations
  getQrCode(userId: number): Promise<QrCode | undefined>;
  createQrCode(qrCode: InsertQrCode): Promise<QrCode>;
  
  // Contact operations
  getContacts(userId: number): Promise<(Contact & { contactUser: User })[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContactLastPaid(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cards: Map<number, Card>;
  private transactions: Map<number, Transaction>;
  private qrCodes: Map<number, QrCode>;
  private contacts: Map<number, Contact>;
  
  private userIdCounter: number;
  private cardIdCounter: number;
  private transactionIdCounter: number;
  private qrCodeIdCounter: number;
  private contactIdCounter: number;

  constructor() {
    this.users = new Map();
    this.cards = new Map();
    this.transactions = new Map();
    this.qrCodes = new Map();
    this.contacts = new Map();
    
    this.userIdCounter = 1;
    this.cardIdCounter = 1;
    this.transactionIdCounter = 1;
    this.qrCodeIdCounter = 1;
    this.contactIdCounter = 1;
    
    // Add some initial data for testing
    this.seedData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      balance: "1000.00", // Starting balance for testing
      createdAt: now 
    };
    this.users.set(id, user);
    
    // Create a QR code for the user
    const qrString = `payhub:user:${id}:${now.getTime()}`;
    await this.createQrCode({
      userId: id,
      qrString,
      active: true
    });
    
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Card operations
  async getCards(userId: number): Promise<Card[]> {
    return Array.from(this.cards.values()).filter(
      (card) => card.userId === userId
    );
  }

  async getCard(id: number): Promise<Card | undefined> {
    return this.cards.get(id);
  }

  async createCard(card: InsertCard): Promise<Card> {
    const id = this.cardIdCounter++;
    const newCard: Card = { ...card, id };
    
    // If isDefault is true, set all other cards to false
    if (newCard.isDefault) {
      for (const [cardId, existingCard] of this.cards.entries()) {
        if (existingCard.userId === newCard.userId && existingCard.isDefault) {
          this.cards.set(cardId, { ...existingCard, isDefault: false });
        }
      }
    }
    
    this.cards.set(id, newCard);
    return newCard;
  }

  async updateCard(id: number, cardData: Partial<Card>): Promise<Card | undefined> {
    const card = this.cards.get(id);
    if (!card) return undefined;
    
    const updatedCard = { ...card, ...cardData };
    this.cards.set(id, updatedCard);
    return updatedCard;
  }

  async deleteCard(id: number): Promise<boolean> {
    return this.cards.delete(id);
  }

  async setDefaultCard(userId: number, cardId: number): Promise<boolean> {
    // Find the card and make sure it belongs to the user
    const card = this.cards.get(cardId);
    if (!card || card.userId !== userId) return false;
    
    // Set all cards of this user to not default
    for (const [existingCardId, existingCard] of this.cards.entries()) {
      if (existingCard.userId === userId) {
        this.cards.set(existingCardId, { 
          ...existingCard, 
          isDefault: existingCardId === cardId 
        });
      }
    }
    
    return true;
  }

  // Transaction operations
  async getTransactions(userId: number, limit?: number): Promise<Transaction[]> {
    const userTransactions = Array.from(this.transactions.values())
      .filter((transaction) => transaction.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return limit ? userTransactions.slice(0, limit) : userTransactions;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const newTransaction: Transaction = { 
      ...transaction, 
      id, 
      date: new Date() 
    };
    this.transactions.set(id, newTransaction);
    
    // Update user balance
    const user = this.users.get(transaction.userId);
    if (user) {
      const currentBalance = parseFloat(user.balance.toString());
      let newBalance: number;
      
      if (transaction.type === 'credit') {
        newBalance = currentBalance + parseFloat(transaction.amount.toString());
      } else {
        newBalance = currentBalance - parseFloat(transaction.amount.toString());
      }
      
      this.users.set(user.id, {
        ...user,
        balance: newBalance.toFixed(2)
      });
    }
    
    // If this is a payment to another user, update the last paid timestamp
    if (transaction.recipientName && transaction.category === 'payment') {
      const contactEntries = Array.from(this.contacts.entries());
      for (const [contactId, contact] of contactEntries) {
        if (contact.userId === transaction.userId) {
          const contactUser = this.users.get(contact.contactUserId);
          if (contactUser && contactUser.firstName + ' ' + contactUser.lastName === transaction.recipientName) {
            this.updateContactLastPaid(contactId);
            break;
          }
        }
      }
    }
    
    return newTransaction;
  }

  // QR Code operations
  async getQrCode(userId: number): Promise<QrCode | undefined> {
    return Array.from(this.qrCodes.values()).find(
      (qrCode) => qrCode.userId === userId && qrCode.active
    );
  }

  async createQrCode(qrCode: InsertQrCode): Promise<QrCode> {
    // Deactivate any existing QR codes for this user
    for (const [qrId, existingQR] of this.qrCodes.entries()) {
      if (existingQR.userId === qrCode.userId && existingQR.active) {
        this.qrCodes.set(qrId, { ...existingQR, active: false });
      }
    }
    
    const id = this.qrCodeIdCounter++;
    const newQrCode: QrCode = { 
      ...qrCode, 
      id, 
      createdAt: new Date() 
    };
    this.qrCodes.set(id, newQrCode);
    return newQrCode;
  }

  // Contact operations
  async getContacts(userId: number): Promise<(Contact & { contactUser: User })[]> {
    const contacts = Array.from(this.contacts.values())
      .filter((contact) => contact.userId === userId);
      
    return contacts.map(contact => {
      const contactUser = this.users.get(contact.contactUserId);
      if (!contactUser) throw new Error(`Contact user not found: ${contact.contactUserId}`);
      
      return {
        ...contact,
        contactUser
      };
    });
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const id = this.contactIdCounter++;
    const newContact: Contact = { ...contact, id, lastPaid: null };
    this.contacts.set(id, newContact);
    return newContact;
  }

  async updateContactLastPaid(id: number): Promise<boolean> {
    const contact = this.contacts.get(id);
    if (!contact) return false;
    
    this.contacts.set(id, { ...contact, lastPaid: new Date() });
    return true;
  }

  // Helper to seed data for testing
  private seedData() {
    // Create test users
    this.createUser({
      username: "johndoe",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "(123) 456-7890",
      address: "123 Main St, Anytown, CA 12345"
    });

    this.createUser({
      username: "sarahjohnson",
      password: "password123",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@example.com",
      phone: "(234) 567-8901",
      address: "456 Oak St, Somewhere, NY 67890"
    });

    this.createUser({
      username: "michaelbrown",
      password: "password123",
      firstName: "Michael",
      lastName: "Brown",
      email: "michael.brown@example.com",
      phone: "(345) 678-9012",
      address: "789 Pine St, Elsewhere, TX 54321"
    });

    // Create cards for user 1
    this.createCard({
      userId: 1,
      cardNumber: "4111111111114582",
      cardholderName: "John Doe",
      expiryDate: "09/25",
      cvv: "123",
      cardType: "visa",
      isDefault: true
    });

    this.createCard({
      userId: 1,
      cardNumber: "5555555555557591",
      cardholderName: "John Doe",
      expiryDate: "12/26",
      cvv: "456",
      cardType: "mastercard",
      isDefault: false
    });

    // Create contacts
    this.createContact({
      userId: 1,
      contactUserId: 2
    });

    this.createContact({
      userId: 1,
      contactUserId: 3
    });

    // Create transactions
    this.createTransaction({
      userId: 1,
      amount: "25.00",
      type: "credit",
      description: "Payment Received",
      category: "payment",
      recipientName: "Michael Brown",
      status: "completed",
      paymentMethod: "bank",
      cardId: null
    });

    this.createTransaction({
      userId: 1,
      amount: "39.99",
      type: "debit",
      description: "Online Purchase",
      category: "shopping",
      recipientName: "Amazon.com",
      status: "completed",
      paymentMethod: "card",
      cardId: 1
    });

    this.createTransaction({
      userId: 1,
      amount: "85.50",
      type: "debit",
      description: "Bill Payment",
      category: "bill",
      recipientName: "Electric Company",
      status: "completed",
      paymentMethod: "card",
      cardId: 1
    });

    this.createTransaction({
      userId: 1,
      amount: "5.75",
      type: "debit",
      description: "QR Payment",
      category: "shopping",
      recipientName: "Coffee Shop",
      status: "completed",
      paymentMethod: "qr",
      cardId: null
    });

    this.createTransaction({
      userId: 1,
      amount: "24.99",
      type: "debit",
      description: "QR Payment",
      category: "shopping",
      recipientName: "Bookstore",
      status: "completed",
      paymentMethod: "qr",
      cardId: null
    });

    this.createTransaction({
      userId: 1,
      amount: "15.50",
      type: "credit",
      description: "QR Payment Received",
      category: "payment",
      recipientName: "Michael Brown",
      status: "completed",
      paymentMethod: "qr",
      cardId: null
    });

    this.createTransaction({
      userId: 1,
      amount: "50.00",
      type: "debit",
      description: "Money Sent",
      category: "payment",
      recipientName: "Sarah Johnson",
      status: "completed",
      paymentMethod: "direct",
      cardId: null
    });

    this.createTransaction({
      userId: 1,
      amount: "200.00",
      type: "debit",
      description: "Bank Transfer",
      category: "transfer",
      recipientName: "Linked Account",
      status: "processing",
      paymentMethod: "bank",
      cardId: null
    });

    // Update contact last paid dates based on transactions
    const contacts = Array.from(this.contacts.values());
    for (const contact of contacts) {
      if (contact.userId === 1 && contact.contactUserId === 2) {
        // User 1 paid User 2 (Sarah Johnson)
        this.contacts.set(contact.id, { ...contact, lastPaid: new Date(Date.now() - 86400000) }); // 1 day ago
      } else if (contact.userId === 1 && contact.contactUserId === 3) {
        // User 1 paid User 3 (Michael Brown)
        this.contacts.set(contact.id, { ...contact, lastPaid: new Date(Date.now() - 172800000) }); // 2 days ago
      }
    }
  }
}

export const storage = new MemStorage();
