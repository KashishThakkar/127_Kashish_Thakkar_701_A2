const express = require("express");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

const router = express.Router();

// Show categories
router.get("/", async (req, res) => {
    const categories = await Category.find();
    res.render("user/categories", { categories });
});

// Show products by category
router.get("/products/:catId", async (req, res) => {
    const products = await Product.find({ category: req.params.catId });
    res.render("user/products", { products });
});

// View cart
router.get("/cart", async (req, res) => {
    let cart = await Cart.findOne().populate("items.product");
    if (!cart) cart = new Cart({ items: [], totalPrice: 0 });
    res.render("user/cart", { cart });
});

// Add to cart
router.get("/add-to-cart/:prodId", async (req, res) => {
    let cart = await Cart.findOne();
    if (!cart) cart = new Cart({ items: [], totalPrice: 0 });

    const product = await Product.findById(req.params.prodId);
    if (!product) return res.redirect("/");

    const item = cart.items.find(i => i.product.toString() === product._id.toString());
    if (item) {
        item.quantity++;
    } else {
        cart.items.push({ product: product._id, quantity: 1 });
    }

    cart.totalPrice = 0;
    cart.items.forEach(i => {
        cart.totalPrice += i.quantity * product.price;
    });

    await cart.save();
    res.redirect("/cart");
});

module.exports = router;
