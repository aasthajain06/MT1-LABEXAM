// Import required modules
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get current folder location
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create shopping cart array
let cart = [
  {
    id: 1,
    productName: "Mouse",
    price: 799,
    quantity: 2,
  },
  {
    id: 2,
    productName: "Keyboard",
    price: 1200,
    quantity: 1,
  },
  {
    id: 3,
    productName: "USB Cable",
    price: 299,
    quantity: 3,
  },
];

// Function to send JSON response
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
  });

  res.end(JSON.stringify(data));
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // GET /
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, {
      "Content-Type": "text/html",
    });

    res.end("<h1>Welcome to Shopping Cart Application</h1>");
  }

  // GET /cart
  else if (req.method === "GET" && req.url === "/cart") {
    sendJSON(res, 200, cart);
  }

  // GET /about
  else if (req.method === "GET" && req.url === "/about") {
    res.writeHead(200, {
      "Content-Type": "text/html",
    });

    res.end("<h1>About Shopping Cart Application</h1>");
  }

  // GET /home
  else if (req.method === "GET" && req.url === "/home") {
    const filePath = path.join(__dirname, "public", "index.html");

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        sendJSON(res, 500, {
          message: "Unable to read HTML file",
        });

        return;
      }

      res.writeHead(200, {
        "Content-Type": "text/html",
      });

      res.end(data);
    });
  }

  // POST /add-to-cart
  else if (req.method === "POST" && req.url === "/add-to-cart") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const product = JSON.parse(body);

        // Validate product details
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
          product.quantity <= 0
        ) {
          sendJSON(res, 400, {
            message: "Invalid product details",
          });

          return;
        }

        // Check duplicate ID
        const exists = cart.find((item) => item.id === product.id);

        if (exists) {
          sendJSON(res, 409, {
            message: "Product ID already exists",
          });

          return;
        }

        // Add product
        cart.push(product);

        sendJSON(res, 201, {
          message: "Product added successfully",
          product: product,
        });
      } catch (error) {
        sendJSON(res, 400, {
          message: "Invalid JSON data",
        });
      }
    });
  }

  // Invalid route
  else {
    sendJSON(res, 404, {
      message: "404 - Route Not Found",
    });
  }
});

// Start server
server.listen(3000, () => {
  console.log("HTTP Server running at http://localhost:3000");
});
