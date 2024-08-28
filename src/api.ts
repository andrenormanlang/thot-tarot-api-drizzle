import express from "express";
import { db } from "./db";
import { tarotCards } from "./schema";
import { eq } from "drizzle-orm";

const app = express();
app.use(express.json());

/**
 * Get all cards
 */
app.get("/cards", async (_req, res) => {
  try {
    const cards = await db.select().from(tarotCards);
    res.json(cards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Get a card by ID
 */
app.get("/cards/:id", async (req, res) => {
  try {
    const card = await db
      .select()
      .from(tarotCards)
      .where(eq(tarotCards.id, parseInt(req.params.id, 10)))
      .limit(1);
    if (card.length === 0) {
      res.status(404).json({ message: "Card not found" });
    } else {
      res.json(card[0]);
    }
  } catch (error) {
    console.error("Error fetching card:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Create a new card
 */
app.post("/cards", async (req, res) => {
  try {
    const newCard = await db.insert(tarotCards).values(req.body).returning();
    res.status(201).json(newCard[0]);
  } catch (error) {
    console.error("Error creating card:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Bulk insert cards
 */
app.post("/cards/bulk", async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res
        .status(400)
        .json({ message: "Request body should be an array of cards" });
    }

    const newCards = await db.insert(tarotCards).values(req.body).returning();
    res.status(201).json(newCards);
  } catch (error) {
    console.error("Error bulk inserting cards:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/**
 * Update a card by ID
 */
app.put("/cards/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedCard = await db
      .update(tarotCards)
      .set(req.body)
      .where(eq(tarotCards.id, id))
      .returning();

    if (updatedCard.length === 0) {
      res.status(404).json({ message: "Card not found" });
    } else {
      res.json(updatedCard[0]);
    }
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Delete a card by ID
 */
app.delete("/cards/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deletedCard = await db
      .delete(tarotCards)
      .where(eq(tarotCards.id, id))
      .returning();

    if (deletedCard.length === 0) {
      res.status(404).json({ message: "Card not found" });
    } else {
      res.json(deletedCard[0]);
    }
  } catch (error) {
    console.error("Error deleting card:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
