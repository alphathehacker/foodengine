# Food engine Admin Dashboard - Eatoes Intern Assessment

A production-ready Restaurant Admin Dashboard built with the MERN stack (MongoDB, Express.js, React, Node.js) for managing restaurant menu items and orders.

## 🚀 Features

### Menu Management
- ✅ Full CRUD operations for menu items
- ✅ Advanced search with 300ms debouncing
- ✅ Category and availability filters
- ✅ Price range filtering
- ✅ Grid and list view modes
- ✅ Optimistic UI updates for availability toggle
- ✅ Image support with fallback handling
- ✅ Pagination with 20 items per page
- ✅ Responsive design for all screen sizes

### Orders Dashboard
- ✅ Real-time order statistics
- ✅ Order status management with validation
- ✅ Expandable order details
- ✅ Customer and table information
- ✅ Revenue tracking (total and daily)
- ✅ Status-based filtering
- ✅ Sorting by multiple criteria
- ✅ Pagination with 10 orders per page

### Advanced Features
- ✅ MongoDB text search on menu items
- ✅ MongoDB aggregation for analytics
- ✅ Top 5 selling items API
- ✅ Optimistic UI updates with rollback
- ✅ Comprehensive error handling
- ✅ Loading skeletons and states
- ✅ Toast notifications
- ✅ Form validation with real-time feedback
- ✅ Context API for state management
- ✅ Custom hooks (useDebounce, useFetch)

## 🛠 Tech Stack

### Frontend
- **React 18+** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Database (MongoDB)
- **Mongoose** - ODM for MongoDB
- **express-validator** - Input validation
- **Helmet** - Security headers
- **Morgan** - HTTP request logger
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
food engine/
├── server/
│   ├── config/
│   │   └── db.js                    # Database configuration
│   ├── models/
│   │   ├── MenuItem.js              # Menu item schema
│   │   └── Order.js                 # Order schema
│   ├── controllers/
│   │   ├── menuController.js        # Menu API logic
│   │   └── orderController.js       # Order API logic
│   ├── routes/
│   │   ├── menuRoutes.js            # Menu API routes
│   │   └── orderRoutes.js           # Order API routes
│   ├── middleware/
│   │   └── errorHandler.js         # Error handling middleware
│   ├── scripts/
│   │   └── seed.js                  # Database seeding script
│   ├── .env.example                 # Environment variables template
│   ├── server.js                    # Express server entry point
│   └── package.json                 # Backend dependencies
│
└── client/
    ├── src/
    │   ├── api/
    │   │   └── axios.js              # API client configuration
    │   ├── components/
    │   │   ├── MenuCard.jsx          # Menu item card component
    │   │   ├── MenuForm.jsx          # Menu item form modal
    │   │   ├── OrderRow.jsx          # Order table row component
    │   │   └── StatusBadge.jsx       # Order status badge
    │   ├── hooks/
    │   │   ├── useDebounce.js        # Debounce custom hook
    │   │   └── useFetch.js           # API fetch custom hook
    │   ├── context/
    │   │   └── MenuContext.jsx       # Menu state management
    │   ├── pages/
    │   │   ├── MenuManagement.jsx    # Menu management page
    │   │   └── OrdersDashboard.jsx   # Orders dashboard page
    │   ├── App.jsx                   # Main App component
    │   ├── main.jsx                  # React entry point
    │   └── index.css                 # Global styles
    ├── .env.example                  # Environment variables template
    ├── package.json                  # Frontend dependencies
    ├── vite.config.js                # Vite configuration
    ├── tailwind.config.js            # Tailwind CSS configuration
    └── index.html                    # HTML template
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Git installed

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "food engine"
```

### 2. Backend Setup

#### Navigate to server directory
```bash
cd server
```

#### Install dependencies
```bash
npm install
```

#### Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` and add your MongoDB connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/restaurant-db?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### Seed the database
```bash
npm run seed
```

#### Start the backend server
```bash
npm run dev
```

The backend will be running on `http://localhost:5000`

### 3. Frontend Setup

#### Navigate to client directory
```bash
cd ../client
```

#### Install dependencies
```bash
npm install
```

#### Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` if needed:
```env
VITE_API_URL=http://localhost:5000/api
```

#### Start the frontend development server
```bash
npm run dev
```

The frontend will be running on `http://localhost:5173`

## 📊 API Documentation

### Menu Endpoints

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| GET | `/api/menu` | Get all menu items | `category`, `availability`, `minPrice`, `maxPrice`, `page`, `limit` |
| GET | `/api/menu/search` | Search menu items | `q` (search query), `page`, `limit` |
| GET | `/api/menu/:id` | Get single menu item | - |
| POST | `/api/menu` | Create new menu item | - |
| PUT | `/api/menu/:id` | Update menu item | - |
| DELETE | `/api/menu/:id` | Delete menu item | - |
| PATCH | `/api/menu/:id/availability` | Toggle availability | - |

### Order Endpoints

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| GET | `/api/orders` | Get all orders | `status`, `page`, `limit`, `sortBy`, `sortOrder` |
| GET | `/api/orders/stats` | Get order statistics | - |
| GET | `/api/orders/:id` | Get single order | - |
| POST | `/api/orders` | Create new order | - |
| PATCH | `/api/orders/:id/status` | Update order status | - |

### Analytics Endpoints

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| GET | `/api/analytics/top-sellers` | Get top selling items | `limit` (default: 5) |

## 🗄 Database Schema

### MenuItem Collection
```javascript
{
  name: String (required, indexed + text index),
  description: String,
  category: Enum ['Appetizer', 'Main Course', 'Dessert', 'Beverage'],
  price: Number (required),
  ingredients: Array of Strings,
  isAvailable: Boolean (default: true),
  preparationTime: Number,
  imageUrl: String,
  timestamps: true
}
```

### Order Collection
```javascript
{
  orderNumber: String (auto-generated, unique),
  items: [{
    menuItem: ObjectId,
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: Enum ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'],
  customerName: String,
  tableNumber: Number,
  timestamps: true
}
```

## 🌱 Database Seeding

The seed script creates:
- **15+ menu items** across all categories (Appetizer, Main Course, Dessert, Beverage)
- **10+ orders** with mixed statuses and realistic data
- **Proper relationships** between orders and menu items

Run the seed script:
```bash
cd server
npm run seed
```

## 🚀 Deployment

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on push to main branch

### Frontend (Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard
4. Configure redirects for SPA routing

## 🎯 Key Features Implemented

### 1. Debounced Search (300ms)
- Custom `useDebounce` hook
- Loading states during search
- Handles empty and special characters safely

### 2. Optimistic UI Updates
- Instant availability toggle
- Automatic rollback on API failure
- Toast error notifications

### 3. MongoDB Aggregation
- Top 5 selling menu items API
- Uses `$unwind`, `$group`, `$lookup`, `$sort`, `$limit`
- Exposed at `/api/analytics/top-sellers`

### 4. Advanced Validation
- Backend validation with express-validator
- Frontend form validation with real-time feedback
- Type checking and sanitization

### 5. Error Handling
- Global error boundary in React
- Centralized error handling middleware
- User-friendly error messages

## 🔧 Environment Variables

### Backend (.env)
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📱 Responsive Design

- **Mobile-first approach** with Tailwind CSS
- **Responsive grid layouts** for menu items
- **Mobile-friendly tables** for orders
- **Touch-friendly interactions**
- **Optimized for all screen sizes**

## 🧪 Testing & Quality

- **Clean, commented code** following industry best practices
- **Consistent error handling** across all components
- **Type-safe API calls** with proper error handling
- **Optimistic updates** with rollback mechanisms
- **Loading states** for better UX
- **Form validation** with real-time feedback

## 🎨 UI/UX Features

- **Modern, clean interface** with Tailwind CSS
- **Smooth animations** and transitions
- **Loading skeletons** for better perceived performance
- **Status badges** with visual indicators
- **Expandable rows** for detailed information
- **Toast notifications** for user feedback
- **Modal forms** for data entry
- **Search and filtering** with instant results

## 📈 Performance Optimizations

- **Debounced search** to reduce API calls
- **Pagination** for large datasets
- **Optimistic updates** for instant feedback
- **Image lazy loading** with fallback handling
- **Component-level state management**
- **Efficient re-renders** with React hooks

## 🔒 Security Features

- **Helmet.js** for security headers
- **CORS** configuration
- **Input validation** and sanitization
- **Error message sanitization**
- **Environment-based configuration**

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your MONGODB_URI in .env
   - Ensure MongoDB Atlas IP whitelist includes your IP
   - Verify database user credentials

2. **Port Already in Use**
   - Change PORT in .env or kill existing process
   - Use `netstat -ano | findstr :5000` to find process

3. **CORS Issues**
   - Verify FRONTEND_URL matches your frontend URL
   - Check API proxy configuration in vite.config.js

4. **Build Errors**
   - Run `npm install` in both server and client directories
   - Clear node_modules and reinstall if needed

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API documentation
3. Examine browser console and network tabs
4. Check server logs for backend errors

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏆 Project Highlights

- **Production-ready code** with comprehensive error handling
- **Industry best practices** throughout the codebase
- **Scalable architecture** with proper separation of concerns
- **Modern tech stack** with latest versions
- **Complete CRUD operations** with validation
- **Real-time features** with optimistic updates
- **Analytics and reporting** capabilities
- **Responsive design** for all devices
- **Deployment-ready** configuration
- **Comprehensive documentation** for easy maintenance

---

**Built with ❤️ for the Eatoes Intern Technical Assessment**
