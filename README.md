# ShopEasy – Simple E-Commerce Mobile Application

**ShopEasy** is a complete, beginner-friendly modern E-Commerce mobile application built with **React Native (Expo)**, a **Node.js & Express.js** REST API backend following the **MVC architecture**, and a **MySQL** database.

---

## 📱 Features Overview

### 1. Product Catalog & Management
- **Public API Integration**: Fetches real catalog data from `https://dummyjson.com/products`.
- **Database Synchronization**: Backend endpoint `POST /api/products/sync` imports, formats prices to **Indian Rupees (INR ₹)**, and saves them into MySQL.
- **Responsive 2-Column Grid**: Dynamic layout adapting to different mobile device screens.
- **Product Information**: Displays product image, title, INR price, category badge, and star rating.
- **Product Search**: Real-time keyword search across title, description, and category.
- **Category Filter**: Interactive horizontal pills (`All`, `Beauty`, `Fragrances`, `Furniture`, `Groceries`, etc.).
- **Pull-to-Refresh**: Seamless gesture to re-fetch the latest catalog from the backend.
- **Loading & Error Handling**: Beautiful activity spinners and network error state with a "Try Again" retry action.

### 2. Product Details
- Full-screen product view displaying high-resolution image, category pill, rating, price inclusive of taxes, and comprehensive product description.
- Buyer trust badges (100% Genuine, 7 Days Return, Fast Delivery).
- Quantity stepper with sticky bottom action bar.
- "Add to Cart" and "View Cart" instant navigation.

### 3. Shopping Cart (`CartContext` & `AsyncStorage`)
- **React Context API**: Centralized state management for the shopping cart.
- **Duplicate Prevention**: Adding an existing item increases its quantity instead of creating duplicates.
- **Quantity Controls**: Increment and decrement buttons.
- **Safe Removal**: Confirmation dialog (`Alert.alert` on mobile, modal confirm on web) before deleting an item.
- **Dynamic Billing Calculation**:
  - **Subtotal**: Dynamic sum of all item totals.
  - **Delivery Charge**: **FREE** on orders of ₹500 or more; ₹49 standard shipping for smaller orders.
  - **Final Total**: Subtotal + Delivery Charge.
- **Persistent Storage**: Saved to `AsyncStorage` and restored automatically when the application restarts.
- **Cart Badge**: Real-time badge counter on the bottom navigation tab.

### 4. Order Summary & Checkout
- 3-step progress indicator (`Cart` ➔ `Review` ➔ `Confirmation`).
- Customer delivery address card.
- Itemized summary table with item counts and line totals.
- Transparent price breakdown.
- Cash on Delivery (COD) / Doorstep UPI payment option.
- "Confirm & Place Order" calls backend `POST /api/orders` to store orders in the MySQL database.
- Order confirmed receipt modal with unique order reference number.

### 5. User Authentication & Profile (Login & Logout)
- **User Login & Session Persistence**: Secure sign-in with email and password, persisted in `AsyncStorage` via JWT token.
- **One-Tap Quick Demo Login**: Instant login with pre-configured demo account (`demo@shopeasy.com` / `password123`).
- **User Registration**: Register new accounts with full name, email, phone, and delivery address.
- **My Account & Profile Screen**: Displays customer details, delivery address, membership badge, and cart quick stats.
- **Confirmation Log Out**: Prompts the user with a confirmation alert before safely clearing local credentials and session state.
- **Header Profile Integration**: Displays logged-in user's first name (`Welcome, Rahul 👋`) and quick account navigation.
- **Seamless Checkout Auto-Fill**: Automatically fills customer delivery address on the Order Summary screen for authenticated users.

### 6. Design & Currency
- **Color Palette**: Clean white background (`#FFFFFF`), professional royal blue accent (`#2563EB`), subtle card borders, and slate typography.
- **Currency**: All prices are displayed in **Indian Rupees (INR ₹)** with standard Indian number formatting (e.g. `₹1,499`, `₹24,999`).

---

## 🏗️ Project Architecture

```
ShopEasy/
├── backend/                        # Node.js & Express REST API (MVC)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # MySQL connection pool & auto-init
│   │   ├── controllers/
│   │   │   ├── authController.js   # Login, registration, profile & logout
│   │   │   ├── productController.js# Product logic & DummyJSON sync
│   │   │   └── orderController.js  # Order creation and retrieval
│   │   ├── models/
│   │   │   ├── userModel.js        # MySQL & in-memory queries for users
│   │   │   ├── productModel.js     # MySQL queries for products
│   │   │   └── orderModel.js       # MySQL queries for orders & items
│   │   ├── routes/
│   │   │   ├── authRoutes.js       # /api/auth endpoints (login, register, profile)
│   │   │   ├── productRoutes.js    # /api/products endpoints
│   │   │   └── orderRoutes.js      # /api/orders endpoints
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js   # JWT authentication verification
│   │   │   └── errorHandler.js     # 404 and global error handlers
│   │   ├── utils/
│   │   │   ├── authUtils.js        # PBKDF2 password hashing & JWT handling
│   │   │   └── seedData.js         # Auto-sync on fresh launch (products & demo user)
│   │   └── server.js               # Express application entry
│   ├── .env.example                # Environment variables template
│   ├── .env                        # Local configuration
│   ├── database.sql                # MySQL Database schema script
│   ├── test-endpoints.js           # Integration test script
│   └── package.json
│
└── frontend/                       # React Native Mobile Application (Expo)
    ├── src/
    │   ├── api/
    │   │   ├── authApi.js          # Authentication API calls
    │   │   └── productApi.js       # Axios client for products & orders
    │   ├── components/
    │   │   ├── CartItemCard.js     # Cart item with stepper & delete
    │   │   ├── CategoryPills.js    # Horizontal category chips
    │   │   ├── EmptyState.js       # Empty cart & no search results
    │   │   ├── Header.js           # App header with cart badge & login pill
    │   │   ├── LoadingView.js      # Spinners and network retry screen
    │   │   ├── PriceBreakdown.js   # Subtotal, delivery & total card
    │   │   ├── ProductCard.js      # 2-column grid card with INR price
    │   │   └── SearchBar.js        # Search input with clear button
    │   ├── config/
    │   │   └── api.js              # Configurable API base URL
    │   ├── constants/
    │   │   ├── colors.js           # White & Blue theme palette
    │   │   └── theme.js            # Spacing, shadows, border radii
    │   ├── context/
    │   │   ├── AuthContext.js      # User session, login, logout & token storage
    │   │   └── CartContext.js      # React Context + AsyncStorage
    │   ├── navigation/
    │   │   └── AppNavigator.js     # Bottom Tabs (Home, Cart, Account) & Stack
    │   ├── screens/
    │   │   ├── HomeScreen.js       # 2-column product grid with search
    │   │   ├── ProductDetailsScreen.js # Full product view
    │   │   ├── CartScreen.js       # Cart with calculations & remove
    │   │   ├── OrderSummaryScreen.js # Checkout & receipt modal
    │   │   ├── LoginScreen.js      # Login form with quick demo access
    │   │   ├── RegisterScreen.js   # Account registration form
    │   │   └── ProfileScreen.js    # User profile & logout screen
    │   └── utils/
    │       └── formatters.js       # Indian Currency (INR) formatting
    ├── App.js                      # Root React Native component
    ├── app.json                    # Expo configuration
    └── package.json
```

---

## 🗄️ Database Setup (MySQL)

### Database Name: `shopeasy_db`

The schema is defined in [backend/database.sql](file:///c:/Users/vishw/OneDrive/Desktop/New%20folder/backend/database.sql).

You can import it into MySQL using MySQL Workbench, phpMyAdmin, or the MySQL command line:

```bash
# Log in to MySQL
mysql -u root -p < backend/database.sql
```

The database contains:
1. `products`:
   - `id`: Primary key
   - `title`: Product name
   - `description`: Detailed description
   - `price`: Product price in INR
   - `image`: Image URL
   - `category`: Category name
   - `rating`: Customer rating (out of 5.0)
2. `orders`: Demonstration orders table with `order_number`, `customer_name`, `delivery_address`, `subtotal`, `delivery_charge`, `total_amount`, `status`, `created_at`.
3. `order_items`: Demonstration order items linked via foreign key to `orders(id)`.

> **Note**: The backend also includes auto-initialization in `src/config/db.js` which automatically creates the database and tables if your MySQL user has create privileges. If MySQL is temporarily offline, the backend features an in-memory cache so you can test the frontend immediately without getting blocked.

---

## 🚀 Running the Project

### 1. Start the Backend Server

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Check or update backend/.env with your MySQL password:
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=your_mysql_password
# DB_NAME=shopeasy_db

# 3. Start the server (runs on http://localhost:5000)
npm start
# or for auto-reloading during development:
npm run dev
```

#### Run Endpoint Tests:
To verify all REST API endpoints and DummyJSON sync:
```bash
npm test
```

### Backend Endpoints:
- `GET  /api/products` - Retrieve all products (supports `?category=...&search=...`)
- `GET  /api/products/search?q=phone` - Search products by keyword
- `GET  /api/products/:id` - Fetch single product by ID
- `POST /api/products/sync` - Fetch from DummyJSON, convert prices to INR, and upsert to MySQL
- `POST /api/orders` - Place demonstration order
- `GET  /api/orders` - List all orders
- `POST /api/auth/register` - Create a new user account (name, email, password, phone, address)
- `POST /api/auth/login` - Authenticate user with email and password, returns JWT token
- `GET  /api/auth/profile` - Fetch authenticated user profile (requires `Bearer <token>`)
- `PUT  /api/auth/profile` - Update profile information (requires `Bearer <token>`)
- `POST /api/auth/logout` - Invalidate session / server logout

#### Pre-configured Demo Account:
- **Email**: `demo@shopeasy.com`
- **Password**: `password123`
*(You can also click the "⚡ One-Tap Demo Login" button directly on the Login screen!)*

---

### 2. Start the Frontend Application (React Native)

```bash
# 1. Open a new terminal and navigate to frontend:
cd frontend

# 2. Start the Expo development server:
npm start
```

#### Running on Devices / Simulators:
- **Web Browser**: Press `w` in the terminal to view in your web browser.
- **Android Device / Emulator**: Press `a` in the terminal (or run `npm run android`).
- **iOS Simulator**: Press `i` in the terminal (macOS only).
- **Physical Phone**: Install the free **Expo Go** app from Google Play Store or iOS App Store, then scan the QR code displayed in the terminal.

> **Tip for Physical Mobile Devices**: When testing on a physical phone via Expo Go, open [frontend/src/config/api.js](file:///c:/Users/vishw/OneDrive/Desktop/New%20folder/frontend/src/config/api.js) and set `API_BASE_URL` to your machine's Wi-Fi IP address (e.g. `http://192.168.1.5:5000/api`) so your phone can reach the backend over your local network.

---

## 🔐 Testing Login & Logout

1. **Access Login**:
   - Tap the **Login / Account** tab in the bottom bar, or tap the **Login** pill in the top header.
2. **One-Tap Demo Login**:
   - On the Login screen, tap **One-Tap Demo Login** (or manually enter `demo@shopeasy.com` and `password123`).
   - Notice the header now greets you (`Welcome, Rahul 👋`) and the bottom tab label updates to **Account**.
3. **Inspect Account / Profile**:
   - Tap into the **Account** tab to view your initials avatar, verified member badge, phone number, and delivery address.
4. **Log Out**:
   - Tap the **Log Out** button at the bottom of the Account screen.
   - An alert confirms your decision ("Are you sure you want to log out of your ShopEasy account?").
   - Upon confirming, the session and token are cleared from `AsyncStorage`, returning to the clean guest view.
5. **Create a New Account**:
   - Tap **Create New Account** or **Sign Up** to test registering a brand new user with custom name, password, and address.

---

## 🧪 Testing Cart Persistence (AsyncStorage)

1. Launch the mobile app and browse the products.
2. Tap the `+` button on any product card or tap into **Product Details** and click **Add to Cart**.
3. Go to the **Cart** tab (notice the live badge counter on the bottom bar).
4. Increase or decrease product quantities.
5. Notice that the **Subtotal**, **Delivery Charges** (FREE above ₹500), and **Total** update instantly.
6. Close or reload the app (press `r` in the terminal).
7. Notice that your cart items and quantities are completely restored from `AsyncStorage`.
8. Click **Proceed to Buy** ➔ Review your order ➔ Click **Confirm & Place Order** to complete the demonstration purchase!
