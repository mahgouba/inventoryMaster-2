import { Router } from "express";
import { z } from "zod";
import type { DatabaseStorage } from "../database-storage.js";

const router = Router();

// Route to get manufacturers
router.get("/manufacturers", async (req, res) => {
  try {
    const storage = req.app.locals.storage as DatabaseStorage;
    const manufacturers = await storage.getManufacturers();
    res.json(manufacturers);
  } catch (error) {
    console.error("Error fetching manufacturers:", error);
    res.status(500).json({ error: "Failed to fetch manufacturers" });
  }
});

// Route to get categories by manufacturer
router.get("/categories", async (req, res) => {
  try {
    const storage = req.app.locals.storage as DatabaseStorage;
    const { manufacturer } = req.query;
    const categories = await storage.getCategories(manufacturer as string);
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Route to get trim levels
router.get("/trimLevels", async (req, res) => {
  try {
    const storage = req.app.locals.storage as DatabaseStorage;
    const { manufacturer, category } = req.query;
    const trimLevels = await storage.getTrimLevels(manufacturer as string, category as string);
    res.json(trimLevels);
  } catch (error) {
    console.error("Error fetching trim levels:", error);
    res.status(500).json({ error: "Failed to fetch trim levels" });
  }
});

// Route to get colors
router.get("/colors", async (req, res) => {
  try {
    const storage = req.app.locals.storage as DatabaseStorage;
    const colors = await storage.getColors();
    res.json(colors);
  } catch (error) {
    console.error("Error fetching colors:", error);
    res.status(500).json({ error: "Failed to fetch colors" });
  }
});

// Route to get locations
router.get("/locations", async (req, res) => {
  try {
    const storage = req.app.locals.storage as DatabaseStorage;
    const locations = await storage.getLocations();
    res.json(locations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

// Add manufacturer
router.post("/manufacturers", async (req, res) => {
  try {
    const storage = req.app.locals.storage as DatabaseStorage;
    const { id, nameAr, nameEn, logo } = req.body;
    
    await storage.addManufacturer({ id, nameAr, nameEn, logo });
    res.json({ message: "Manufacturer added successfully" });
  } catch (error) {
    console.error("Error adding manufacturer:", error);
    res.status(500).json({ error: "Failed to add manufacturer" });
  }
});

// Add category
router.post("/categories", async (req, res) => {
  try {
    const storage = req.app.locals.storage as DatabaseStorage;
    const { manufacturer, category, description } = req.body;
    
    await storage.addCategory({ manufacturer, category, description });
    res.json({ message: "Category added successfully" });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ error: "Failed to add category" });
  }
});

// Add trim level
router.post("/trimLevels", async (req, res) => {
  try {
    const storage = req.app.locals.storage as DatabaseStorage;
    const { manufacturer, category, trimLevel, description } = req.body;
    
    await storage.addTrimLevel({ manufacturer, category, trimLevel, description });
    res.json({ message: "Trim level added successfully" });
  } catch (error) {
    console.error("Error adding trim level:", error);
    res.status(500).json({ error: "Failed to add trim level" });
  }
});

// Add color
router.post("/colors", async (req, res) => {
  try {
    const storage = req.app.locals.storage as DatabaseStorage;
    const { name, type, colorCode } = req.body;
    
    await storage.addColor({ name, type, colorCode });
    res.json({ message: "Color added successfully" });
  } catch (error) {
    console.error("Error adding color:", error);
    res.status(500).json({ error: "Failed to add color" });
  }
});

// Add location
router.post("/locations", async (req, res) => {
  try {
    const storage = req.app.locals.storage as DatabaseStorage;
    const { name, description, address, manager, phone, capacity } = req.body;
    
    await storage.addLocation({ name, description, address, manager, phone, capacity });
    res.json({ message: "Location added successfully" });
  } catch (error) {
    console.error("Error adding location:", error);
    res.status(500).json({ error: "Failed to add location" });
  }
});

// Delete manufacturer
router.delete("/manufacturers/:id", async (req, res) => {
  try {
    const storage = req.app.locals.storage as DatabaseStorage;
    const { id } = req.params;
    
    await storage.deleteManufacturer(id);
    res.json({ message: "Manufacturer deleted successfully" });
  } catch (error) {
    console.error("Error deleting manufacturer:", error);
    res.status(500).json({ error: "Failed to delete manufacturer" });
  }
});

export default router;