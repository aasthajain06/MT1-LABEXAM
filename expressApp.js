import express from "express";

const app = express();

app.use(express.json());

let cart = [
  {
    id: 1,
    productName: "Wireless Mouse",
    price: 799,
    quantity: 2,
    category: "Electronics",
  },
  {
    id: 2,
    productName: "Keyboard",
    price: 1200,
    quantity: 1,
    category: "Electronics",
  },
  {
    id: 3,
    productName: "USB Cable",
    price: 299,
    quantity: 3,
    category: "Accessories",
  },
];


app.get("/cart", (req, res) => {
  res.status(200).json(cart);
});


app.get("/cart/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid product ID",
    });
  }

  const product = cart.find((item) => item.id === id);

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  const totalPrice = product.price * product.quantity;

  res.status(200).json({
    ...product,
    totalPrice: totalPrice,
  });
});


app.post("/cart", (req, res) => {
  const product = req.body;


  if (
    !product ||
    Array.isArray(product) ||
    typeof product !== "object" ||
    !Number.isInteger(product.id) ||
    product.id <= 0 ||
    typeof product.productName !== "string" ||
    product.productName.trim() === "" ||
    typeof product.price !== "number" ||
    !Number.isFinite(product.price) ||
    product.price < 0 ||
    !Number.isInteger(product.quantity) ||
    product.quantity <= 0 ||
    typeof product.category !== "string" ||
    product.category.trim() === ""
  ) {
    return res.status(400).json({
      message: "Invalid product details",
    });
  }

  // Check duplicate ID
  const exists = cart.find((item) => item.id === product.id);

  if (exists) {
    return res.status(409).json({
      message: "Product ID already exists",
    });
  }

  // Add product to array
  cart.push(product);

  res.status(201).json({
    message: "Product added successfully",
    product: product,
  });
});

// PUT /cart/:id
// Update product details
app.put("/cart/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid product ID",
    });
  }

  const product = cart.find((item) => item.id === id);

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  const data = req.body;

  const allowedFields = ["productName", "price", "quantity", "category"];

  const fields = Object.keys(data || {});

  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data) ||
    fields.length === 0 ||
    fields.some((field) => !allowedFields.includes(field)) ||
    ("productName" in data &&
      (typeof data.productName !== "string" ||
        data.productName.trim() === "")) ||
    ("price" in data &&
      (typeof data.price !== "number" ||
        !Number.isFinite(data.price) ||
        data.price < 0)) ||
    ("quantity" in data &&
      (!Number.isInteger(data.quantity) || data.quantity <= 0)) ||
    ("category" in data &&
      (typeof data.category !== "string" || data.category.trim() === ""))
  ) {
    return res.status(400).json({
      message: "Invalid product details",
    });
  }

  // Update product
  Object.assign(product, data);

  res.status(200).json({
    message: "Product updated successfully",
    product: {
      ...product,
      totalPrice: product.price * product.quantity,
    },
  });
});

// DELETE /cart/:id
// Delete product
app.delete("/cart/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid product ID",
    });
  }

  const index = cart.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  const deletedProduct = cart.splice(index, 1);

  res.status(200).json({
    message: "Product deleted successfully",
    product: deletedProduct[0],
  });
});

// Handle invalid JSON and other errors
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.status || 500;

  res.status(statusCode).json({
    message:
      statusCode === 400
        ? "Invalid JSON request body"
        : "Internal server error",
  });
});

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({
    message: "404 - Route Not Found",
  });
});

// Start server
app.listen(4000, () => {
  console.log("Express Server running at http://localhost:4000");
});
