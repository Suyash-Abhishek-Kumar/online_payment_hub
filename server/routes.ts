import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { pgStorage } from "./storage-pg";
import express from "express";
import session from "express-session";
import { 
  loginSchema, 
  insertUserSchema, 
  insertCardSchema, 
  insertTransactionSchema,
  User
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { verifyRecaptcha } from "./recaptcha";

// For TypeScript to recognize session user
declare module "express-session" {
  interface SessionData {
    user: User;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Use express session middleware
  app.use(
    session({
      secret: "payhub-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production" }
    })
  );

  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Error handling helper
  const handleZodError = (err: unknown, res: Response) => {
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({ message: validationError.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  };

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      
      // Only verify reCAPTCHA if token is provided
      if (credentials.recaptchaToken) {
        const recaptchaVerified = await verifyRecaptcha(credentials.recaptchaToken);
        if (!recaptchaVerified) {
          return res.status(400).json({ message: "CAPTCHA verification failed. Please try again." });
        }
      }
      
      const user = await pgStorage.getUserByUsername(credentials.username);
      
      if (!user || user.password !== credentials.password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Store user in session (excluding password)
      const { password, ...userWithoutPassword } = user;
      req.session.user = user;
      
      res.status(200).json({ user: userWithoutPassword });
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Only verify reCAPTCHA if token is provided
      const recaptchaToken = req.body.recaptchaToken;
      if (recaptchaToken) {
        const recaptchaVerified = await verifyRecaptcha(recaptchaToken);
        if (!recaptchaVerified) {
          return res.status(400).json({ message: "CAPTCHA verification failed. Please try again." });
        }
      }
      
      // Check if username already exists
      const existingUsername = await pgStorage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Check if email already exists
      const existingEmail = await pgStorage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const user = await pgStorage.createUser(userData);
      
      // Store user in session (excluding password)
      const { password, ...userWithoutPassword } = user;
      req.session.user = user;
      
      res.status(201).json({ user: userWithoutPassword });
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/session", (req, res) => {
    if (req.session.user) {
      const { password, ...userWithoutPassword } = req.session.user;
      return res.status(200).json({ user: userWithoutPassword });
    }
    res.status(401).json({ message: "Not authenticated" });
  });

  // Card routes
  app.get("/api/cards", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const cards = await pgStorage.getCards(userId);
      
      // Hide sensitive card information
      const safeCards = cards.map(card => ({
        ...card,
        cardNumber: `•••• •••• •••• ${card.cardNumber.slice(-4)}`,
        cvv: "•••"
      }));
      
      res.status(200).json(safeCards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cards" });
    }
  });

  app.post("/api/cards", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const cardData = insertCardSchema.parse({
        ...req.body,
        userId
      });
      
      const card = await pgStorage.createCard(cardData);
      
      // Return card with masked details
      const safeCard = {
        ...card,
        cardNumber: `•••• •••• •••• ${card.cardNumber.slice(-4)}`,
        cvv: "•••"
      };
      
      res.status(201).json(safeCard);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.delete("/api/cards/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const cardId = parseInt(req.params.id);
      
      // Check if card exists and belongs to user
      const card = await pgStorage.getCard(cardId);
      if (!card || card.userId !== userId) {
        return res.status(404).json({ message: "Card not found" });
      }
      
      const success = await pgStorage.deleteCard(cardId);
      if (success) {
        res.status(200).json({ message: "Card deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete card" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/cards/:id/default", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const cardId = parseInt(req.params.id);
      
      // Check if card exists and belongs to user
      const card = await pgStorage.getCard(cardId);
      if (!card || card.userId !== userId) {
        return res.status(404).json({ message: "Card not found" });
      }
      
      const success = await pgStorage.setDefaultCard(userId, cardId);
      if (success) {
        res.status(200).json({ message: "Default card updated successfully" });
      } else {
        res.status(500).json({ message: "Failed to update default card" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const transactions = await pgStorage.getTransactions(userId, limit);
      res.status(200).json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const transactionData = insertTransactionSchema.parse({
        ...req.body,
        userId
      });
      
      const transaction = await pgStorage.createTransaction(transactionData);
      
      // Get updated user data (for balance)
      const updatedUser = await pgStorage.getUser(userId);
      if (updatedUser) {
        req.session.user = updatedUser;
      }
      
      res.status(201).json(transaction);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // QR code routes
  app.get("/api/qr-code", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const qrCode = await pgStorage.getQrCode(userId);
      
      if (!qrCode) {
        return res.status(404).json({ message: "QR code not found" });
      }
      
      res.status(200).json(qrCode);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch QR code" });
    }
  });

  // Profile routes
  app.get("/api/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const user = await pgStorage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put("/api/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      
      // Validate only allowed fields
      const allowedUpdates = ["firstName", "lastName", "email", "phone", "address"];
      const updates: Partial<User> = {};
      
      for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
          updates[key as keyof typeof updates] = req.body[key];
        }
      }
      
      const updatedUser = await pgStorage.updateUser(userId, updates);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update session
      req.session.user = updatedUser;
      
      // Don't return password
      const { password, ...userWithoutPassword } = updatedUser;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Contacts routes
  app.get("/api/contacts", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const contacts = await pgStorage.getContacts(userId);
      
      // Transform to return only needed data
      const formattedContacts = contacts.map(contact => {
        const { contactUser, ...contactData } = contact;
        return {
          ...contactData,
          name: `${contactUser.firstName} ${contactUser.lastName}`,
          email: contactUser.email,
          lastPaid: contact.lastPaid
        };
      });
      
      res.status(200).json(formattedContacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
