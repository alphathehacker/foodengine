const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: [true, 'Menu item reference is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    max: [99, 'Quantity cannot exceed 99']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    trim: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'],
      message: 'Status must be one of: Pending, Preparing, Ready, Delivered, Cancelled'
    },
    default: 'Pending'
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  tableNumber: {
    type: Number,
    required: [true, 'Table number is required'],
    min: [1, 'Table number must be at least 1'],
    max: [99, 'Table number cannot exceed 99']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes for efficient queries
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ customerName: 1 });

// Virtual for formatted total amount
orderSchema.virtual('formattedTotal').get(function() {
  return `$${this.totalAmount.toFixed(2)}`;
});

// Virtual for item count
orderSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Pre-save middleware to generate order number and calculate total amount
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generate unique order number: ORD-YYYYMMDD-XXXX
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.constructor.countDocuments({
      orderNumber: { $regex: `^ORD-${date}` }
    });
    this.orderNumber = `ORD-${date}-${String(count + 1).padStart(4, '0')}`;
  }
  
  // Calculate total amount
  if (this.isModified('items') || this.isNew) {
    this.totalAmount = this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }
  
  next();
});

// Static method to find orders by status
orderSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('items.menuItem', 'name price category');
};

// Static method to get order statistics
orderSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' }
      }
    }
  ]);
  
  return stats.reduce((acc, stat) => {
    acc[stat._id] = {
      count: stat.count,
      totalRevenue: stat.totalRevenue
    };
    return acc;
  }, {});
};

// Instance method to update status with validation
orderSchema.methods.updateStatus = function(newStatus) {
  const validTransitions = {
    'Pending': ['Preparing', 'Ready', 'Cancelled'], // Allow direct to Ready for flexibility
    'Preparing': ['Ready', 'Delivered', 'Cancelled'], // Allow direct to Delivered for flexibility
    'Ready': ['Delivered', 'Cancelled'],
    'Delivered': [], // Final state
    'Cancelled': [] // Final state
  };

  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`Cannot change status from ${this.status} to ${newStatus}`);
  }

  this.status = newStatus;
  return this.save();
};

module.exports = mongoose.model('Order', orderSchema);
