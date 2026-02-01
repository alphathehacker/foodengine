require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');

// Sample menu items data
const menuItems = [
  // Appetizers
  {
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with parmesan cheese, croutons, and our signature Caesar dressing',
    category: 'Appetizer',
    price: 8.99,
    ingredients: ['romaine lettuce', 'parmesan cheese', 'croutons', 'caesar dressing', 'anchovies'],
    isAvailable: true,
    preparationTime: 10,
    imageUrl: 'https://example.com/caesar-salad.jpg'
  },
  {
    name: 'Garlic Bread',
    description: 'Toasted bread with garlic butter and herbs, served with marinara sauce',
    category: 'Appetizer',
    price: 5.99,
    ingredients: ['bread', 'garlic', 'butter', 'herbs', 'marinara sauce'],
    isAvailable: true,
    preparationTime: 8,
    imageUrl: 'https://example.com/garlic-bread.jpg'
  },
  {
    name: 'Bruschetta',
    description: 'Grilled bread topped with fresh tomatoes, basil, garlic, and olive oil',
    category: 'Appetizer',
    price: 7.99,
    ingredients: ['bread', 'tomatoes', 'basil', 'garlic', 'olive oil'],
    isAvailable: true,
    preparationTime: 12,
    imageUrl: 'https://example.com/bruschetta.jpg'
  },
  {
    name: 'Mozzarella Sticks',
    description: 'Breaded mozzarella cheese sticks served with marinara sauce',
    category: 'Appetizer',
    price: 6.99,
    ingredients: ['mozzarella cheese', 'bread crumbs', 'marinara sauce'],
    isAvailable: true,
    preparationTime: 15,
    imageUrl: 'https://example.com/mozzarella-sticks.jpg'
  },

  // Main Courses
  {
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon grilled to perfection, served with lemon butter sauce and seasonal vegetables',
    category: 'Main Course',
    price: 18.99,
    ingredients: ['salmon', 'lemon', 'butter', 'vegetables', 'herbs'],
    isAvailable: true,
    preparationTime: 25,
    imageUrl: 'https://example.com/grilled-salmon.jpg'
  },
  {
    name: 'Ribeye Steak',
    description: '12oz ribeye steak cooked to your preference, served with mashed potatoes and grilled asparagus',
    category: 'Main Course',
    price: 24.99,
    ingredients: ['ribeye steak', 'potatoes', 'asparagus', 'butter', 'herbs'],
    isAvailable: true,
    preparationTime: 30,
    imageUrl: 'https://example.com/ribeye-steak.jpg'
  },
  {
    name: 'Chicken Parmesan',
    description: 'Breaded chicken breast topped with marinara sauce and melted mozzarella, served with pasta',
    category: 'Main Course',
    price: 16.99,
    ingredients: ['chicken breast', 'mozzarella', 'marinara sauce', 'pasta', 'bread crumbs'],
    isAvailable: true,
    preparationTime: 28,
    imageUrl: 'https://example.com/chicken-parmesan.jpg'
  },
  {
    name: 'Vegetable Stir Fry',
    description: 'Fresh vegetables stir-fried with tofu in a savory soy-ginger sauce, served with steamed rice',
    category: 'Main Course',
    price: 13.99,
    ingredients: ['mixed vegetables', 'tofu', 'soy sauce', 'ginger', 'rice'],
    isAvailable: true,
    preparationTime: 20,
    imageUrl: 'https://example.com/vegetable-stir-fry.jpg'
  },
  {
    name: 'Beef Tacos',
    description: 'Three soft tacos filled with seasoned ground beef, lettuce, tomatoes, and cheese',
    category: 'Main Course',
    price: 12.99,
    ingredients: ['ground beef', 'tortillas', 'lettuce', 'tomatoes', 'cheese', 'sour cream'],
    isAvailable: true,
    preparationTime: 18,
    imageUrl: 'https://example.com/beef-tacos.jpg'
  },

  // Desserts
  {
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with a molten center, served with vanilla ice cream',
    category: 'Dessert',
    price: 7.99,
    ingredients: ['chocolate', 'flour', 'butter', 'eggs', 'vanilla ice cream'],
    isAvailable: true,
    preparationTime: 15,
    imageUrl: 'https://example.com/chocolate-lava-cake.jpg'
  },
  {
    name: 'Tiramisu',
    description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone cream',
    category: 'Dessert',
    price: 6.99,
    ingredients: ['ladyfingers', 'mascarpone', 'coffee', 'cocoa powder', 'sugar'],
    isAvailable: true,
    preparationTime: 5,
    imageUrl: 'https://example.com/tiramisu.jpg'
  },
  {
    name: 'Apple Pie',
    description: 'Traditional apple pie with cinnamon-spiced apples, served with a scoop of vanilla ice cream',
    category: 'Dessert',
    price: 5.99,
    ingredients: ['apples', 'flour', 'butter', 'cinnamon', 'sugar', 'vanilla ice cream'],
    isAvailable: true,
    preparationTime: 12,
    imageUrl: 'https://example.com/apple-pie.jpg'
  },
  {
    name: 'Cheesecake',
    description: 'New York style cheesecake with a graham cracker crust and berry compote',
    category: 'Dessert',
    price: 6.99,
    ingredients: ['cream cheese', 'graham crackers', 'sugar', 'eggs', 'berries'],
    isAvailable: true,
    preparationTime: 5,
    imageUrl: 'https://example.com/cheesecake.jpg'
  },

  // Beverages
  {
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice',
    category: 'Beverage',
    price: 3.99,
    ingredients: ['oranges'],
    isAvailable: true,
    preparationTime: 5,
    imageUrl: 'https://example.com/orange-juice.jpg'
  },
  {
    name: 'Cappuccino',
    description: 'Espresso with steamed milk foam',
    category: 'Beverage',
    price: 4.99,
    ingredients: ['espresso', 'milk', 'foam'],
    isAvailable: true,
    preparationTime: 8,
    imageUrl: 'https://example.com/cappuccino.jpg'
  },
  {
    name: 'Iced Tea',
    description: 'Refreshing iced tea with lemon',
    category: 'Beverage',
    price: 2.99,
    ingredients: ['tea', 'lemon', 'ice', 'sugar'],
    isAvailable: true,
    preparationTime: 3,
    imageUrl: 'https://example.com/iced-tea.jpg'
  },
  {
    name: 'Craft Beer',
    description: 'Local craft beer selection',
    category: 'Beverage',
    price: 5.99,
    ingredients: ['beer', 'hops', 'malt', 'yeast'],
    isAvailable: true,
    preparationTime: 2,
    imageUrl: 'https://example.com/craft-beer.jpg'
  }
];

// Sample orders data
const generateOrders = async (menuItems) => {
  const customerNames = [
    'John Smith', 'Emily Johnson', 'Michael Brown', 'Sarah Davis', 'David Wilson',
    'Lisa Anderson', 'Robert Taylor', 'Jennifer Thomas', 'William Martinez', 'Patricia Garcia'
  ];

  const orderStatuses = ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];
  
  const orders = [];

  for (let i = 0; i < 10; i++) {
    const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
    const items = [];
    
    for (let j = 0; j < numItems; j++) {
      const randomItem = menuItems[Math.floor(Math.random() * menuItems.length)];
      const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
      
      items.push({
        menuItem: randomItem._id,
        quantity: quantity,
        price: randomItem.price
      });
    }

    orders.push({
      items: items,
      customerName: customerNames[i],
      tableNumber: Math.floor(Math.random() * 20) + 1, // Tables 1-20
      status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)]
    });
  }

  return orders;
};

// Seed function
const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await MenuItem.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing data');

    // Insert menu items
    const createdMenuItems = await MenuItem.insertMany(menuItems);
    console.log(`Created ${createdMenuItems.length} menu items`);

    // Generate and insert orders
    const orders = await generateOrders(createdMenuItems);
    
    // Create orders one by one to trigger pre-save middleware
    const createdOrders = [];
    for (const orderData of orders) {
      const order = new Order(orderData);
      await order.save(); // This triggers pre-save middleware
      createdOrders.push(order);
    }
    
    console.log(`Created ${createdOrders.length} orders`);

    console.log('Database seeded successfully!');
    
    // Display some statistics
    const menuCount = await MenuItem.countDocuments();
    const orderCount = await Order.countDocuments();
    const availableItems = await MenuItem.countDocuments({ isAvailable: true });
    
    console.log('\n📊 Database Statistics:');
    console.log(`Total Menu Items: ${menuCount}`);
    console.log(`Available Items: ${availableItems}`);
    console.log(`Total Orders: ${orderCount}`);
    
    // Display menu items by category
    const categories = ['Appetizer', 'Main Course', 'Dessert', 'Beverage'];
    console.log('\n🍽️ Menu Items by Category:');
    for (const category of categories) {
      const count = await MenuItem.countDocuments({ category });
      console.log(`${category}: ${count} items`);
    }

    // Display orders by status
    const statusStats = await Order.getStats();
    console.log('\n📋 Orders by Status:');
    Object.entries(statusStats).forEach(([status, data]) => {
      console.log(`${status}: ${data.count} orders`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seed function
seedDatabase();
