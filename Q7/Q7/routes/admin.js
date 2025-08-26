const express = require("express");
const { body, validationResult } = require("express-validator");
const Category = require("../models/Category");
const Product = require("../models/Product");

const router = express.Router();

// Show all categories
router.get("/categories", async (req, res) => {
    const categories = await Category.find();
    res.render("admin/categories", { categories });
});

// Add category form
router.get("/add-category", (req, res) => {
    res.render("admin/addCategory", { errors: [] });
});

// Save category
router.post("/add-category",
    body("name").notEmpty().withMessage("Category name is required"),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render("admin/addCategory", { errors: errors.array() });
        }
        const category = new Category({
            name: req.body.name,
            description: req.body.description
        });
        await category.save();
        res.redirect("/admin/categories");
    }
);

// Show products
router.get("/products", async (req, res) => {
    const products = await Product.find().populate("category");
    res.render("admin/products", { products });
});

// Add product form
router.get("/add-product", async (req, res) => {
    const categories = await Category.find();
    res.render("admin/addProduct", { categories, errors: [] });
});

// Save product
router.post("/add-product",
    body("name").notEmpty().withMessage("Product name required"),
    body("price").isNumeric().withMessage("Price must be a number"),
    body("stock").isInt({ min: 1 }).withMessage("Stock must be at least 1"),
    async (req, res) => {
        const errors = validationResult(req);
        const categories = await Category.find();
        if (!errors.isEmpty()) {
            return res.render("admin/addProduct", { categories, errors: errors.array() });
        }
        const product = new Product({
            name: req.body.name,
            price: req.body.price,
            stock: req.body.stock,
            category: req.body.category
        });
        await product.save();
        res.redirect("/admin/products");
    }
);

module.exports = router;
