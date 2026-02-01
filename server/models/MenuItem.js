const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Menu item name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Appetizer', 'Main Course', 'Dessert', 'Beverage'],
      message: 'Category must be one of: Appetizer, Main Course, Dessert, Beverage'
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    max: [9999.99, 'Price cannot exceed 9999.99']
  },
  ingredients: [{
    type: String,
    trim: true,
    maxlength: [50, 'Ingredient name cannot exceed 50 characters']
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  preparationTime: {
    type: Number,
    min: [1, 'Preparation time must be at least 1 minute'],
    max: [180, 'Preparation time cannot exceed 180 minutes']
  },
  imageUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        // Basic URL validation
        return /^https?:\/\/.+\..+/.test(v);
      },
      message: 'Image URL must be a valid URL'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create text index for search functionality
menuItemSchema.index({ name: 'text', ingredients: 'text' });

// Create compound index for category and availability
menuItemSchema.index({ category: 1, isAvailable: 1 });

// Virtual for formatted price
menuItemSchema.virtual('formattedPrice').get(function() {
  return `$${this.price.toFixed(2)}`;
});

// Pre-save middleware to ensure ingredients array is not empty
menuItemSchema.pre('save', function(next) {
  if (!this.ingredients || this.ingredients.length === 0) {
    this.ingredients = ['Not specified'];
  }
  next();
});

// Static method to find available items
menuItemSchema.statics.findAvailable = function() {
  return this.find({ isAvailable: true });
};

// Static method to find by category
menuItemSchema.statics.findByCategory = function(category) {
  return this.find({ category, isAvailable: true });
};

module.exports = mongoose.model('MenuItem', menuItemSchema);
