const MenuItem = require('../models/MenuItem');
const { validationResult } = require('express-validator');

// @desc    Get all menu items with filters
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req, res) => {
  try {
    const {
      category,
      availability,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = {};

    if (category) {
      query.category = category;
    }

    if (availability !== undefined) {
      query.isAvailable = availability === 'true';
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const menuItems = await MenuItem.find(query)
      .sort({ category: 1, name: 1 })
      .skip(skip)
      .limit(limitNum);

    const total = await MenuItem.countDocuments(query);

    res.status(200).json({
      success: true,
      data: menuItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error in getMenuItems:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching menu items'
    });
  }
};

// @desc    Search menu items using text search
// @route   GET /api/menu/search
// @access  Public
const searchMenuItems = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Use MongoDB text search
    const menuItems = await MenuItem.find(
      { $text: { $search: q.trim() } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limitNum);

    const total = await MenuItem.countDocuments(
      { $text: { $search: q.trim() } }
    );

    res.status(200).json({
      success: true,
      data: menuItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error in searchMenuItems:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching menu items'
    });
  }
};

// @desc    Get single menu item by ID
// @route   GET /api/menu/:id
// @access  Public
const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error('Error in getMenuItemById:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu item ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching menu item'
    });
  }
};

// @desc    Create new menu item
// @route   POST /api/menu
// @access  Public
const createMenuItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      description,
      category,
      price,
      ingredients,
      isAvailable,
      preparationTime,
      imageUrl
    } = req.body;

    const menuItem = await MenuItem.create({
      name,
      description,
      category,
      price,
      ingredients,
      isAvailable,
      preparationTime,
      imageUrl
    });

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: menuItem
    });
  } catch (error) {
    console.error('Error in createMenuItem:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Menu item with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating menu item'
    });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Public
const updateMenuItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    const updatedMenuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: updatedMenuItem
    });
  } catch (error) {
    console.error('Error in updateMenuItem:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu item ID format'
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Menu item with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating menu item'
    });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Public
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    await MenuItem.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteMenuItem:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu item ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while deleting menu item'
    });
  }
};

// @desc    Toggle menu item availability
// @route   PATCH /api/menu/:id/availability
// @access  Public
const toggleAvailability = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    menuItem.isAvailable = !menuItem.isAvailable;
    await menuItem.save();

    res.status(200).json({
      success: true,
      message: `Menu item marked as ${menuItem.isAvailable ? 'available' : 'unavailable'}`,
      data: menuItem
    });
  } catch (error) {
    console.error('Error in toggleAvailability:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu item ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating availability'
    });
  }
};

module.exports = {
  getMenuItems,
  searchMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability
};
