const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { validationResult } = require('express-validator');

// @desc    Get all orders with pagination and status filter
// @route   GET /api/orders
// @access  Public
const getOrders = async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(query)
      .populate('items.menuItem', 'name price category imageUrl')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error in getOrders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Public
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.menuItem', 'name price category ingredients imageUrl');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error in getOrderById:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching order'
    });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { items, customerName, tableNumber } = req.body;

    // Validate that all menu items exist and get current prices
    const validatedItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      
      if (!menuItem) {
        return res.status(400).json({
          success: false,
          message: `Menu item with ID ${item.menuItem} not found`
        });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Menu item ${menuItem.name} is not available`
        });
      }

      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        menuItem: menuItem._id,
        quantity: item.quantity,
        price: menuItem.price
      });
    }

    const order = await Order.create({
      items: validatedItems,
      totalAmount,
      customerName,
      tableNumber
    });

    // Populate menu item details for response
    const populatedOrder = await Order.findById(order._id)
      .populate('items.menuItem', 'name price category imageUrl');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    });
  } catch (error) {
    console.error('Error in createOrder:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate order number generated'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating order'
    });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Public
const updateOrderStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    try {
      await order.updateStatus(status);
      
      // Populate menu item details for response
      const updatedOrder = await Order.findById(order._id)
        .populate('items.menuItem', 'name price category imageUrl');

      res.status(200).json({
        success: true,
        message: `Order status updated to ${status}`,
        data: updatedOrder
      });
    } catch (statusError) {
      return res.status(400).json({
        success: false,
        message: statusError.message
      });
    }
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Public
const getOrderStats = async (req, res) => {
  try {
    const stats = await Order.getStats();
    
    // Get additional stats
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const todayOrders = await Order.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    const todayRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus: stats,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        todayOrders,
        todayRevenue: todayRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Error in getOrderStats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order statistics'
    });
  }
};

// @desc    Get top selling menu items (aggregation)
// @route   GET /api/analytics/top-sellers
// @access  Public
const getTopSellingItems = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const topSellers = await Order.aggregate([
      // Unwind the items array to process each item individually
      { $unwind: '$items' },
      
      // Filter out cancelled orders
      { $match: { status: { $ne: 'Cancelled' } } },
      
      // Group by menu item and calculate total quantity and revenue
      {
        $group: {
          _id: '$items.menuItem',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 }
        }
      },
      
      // Lookup menu item details
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'menuItem'
        }
      },
      
      // Unwind the menuItem array
      { $unwind: '$menuItem' },
      
      // Project the desired fields
      {
        $project: {
          menuItem: {
            _id: '$menuItem._id',
            name: '$menuItem.name',
            category: '$menuItem.category',
            price: '$menuItem.price',
            imageUrl: '$menuItem.imageUrl'
          },
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1
        }
      },
      
      // Sort by total quantity (descending)
      { $sort: { totalQuantity: -1 } },
      
      // Limit to top N items
      { $limit: parseInt(limit) }
    ]);

    res.status(200).json({
      success: true,
      data: topSellers
    });
  } catch (error) {
    console.error('Error in getTopSellingItems:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching top selling items'
    });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getOrderStats,
  getTopSellingItems
};
