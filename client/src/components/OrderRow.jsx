import React, { useState } from 'react';
import { ChevronDown, ChevronUp, User, Calendar, DollarSign, IndianRupee } from 'lucide-react';
import StatusBadge from './StatusBadge';

const OrderRow = ({ 
  order, 
  onStatusUpdate, 
  isUpdating = false,
  expanded = false,
  onToggleExpand,
  currency = 'USD',
  formatPrice = (price) => `$${price.toFixed(2)}`
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  const {
    _id,
    orderNumber,
    items,
    totalAmount,
    status,
    customerName,
    tableNumber,
    createdAt,
    itemCount
  } = order;

  const handleStatusChange = (newStatus) => {
    onStatusUpdate && onStatusUpdate(_id, newStatus);
  };

  const handleToggleExpand = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onToggleExpand && onToggleExpand(_id, newExpanded);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusOptions = ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors">
        {/* Order Number */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {orderNumber}
            </span>
            {/* Expand/Collapse Indicator */}
            <button
              onClick={handleToggleExpand}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded"
              title={isExpanded ? 'Collapse details' : 'Expand details'}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </td>

        {/* Customer & Table */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-900">
                {customerName}
              </div>
              <div className="text-sm text-gray-500">
                Table {tableNumber}
              </div>
            </div>
          </div>
        </td>

        {/* Items Count */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            {itemCount || items.length} {items.length === 1 ? 'item' : 'items'}
          </div>
        </td>

        {/* Total Amount */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-1">
            {currency === 'INR' ? (
              <IndianRupee className="w-4 h-4 text-gray-400" />
            ) : (
              <DollarSign className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-sm font-semibold text-gray-900">
              {formatPrice(totalAmount)}
            </span>
          </div>
        </td>

        {/* Status */}
        <td className="px-6 py-4 whitespace-nowrap">
          <StatusBadge status={status} />
        </td>

        {/* Date */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            {formatDate(createdAt)}
          </div>
        </td>

        {/* Actions */}
        <td className="px-8 py-4 whitespace-nowrap text-right text-sm font-medium min-w-[150px]">
          <div className="flex items-center justify-end gap-2">
            {/* Status Update Dropdown */}
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdating || status === 'Delivered' || status === 'Cancelled'}
              className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
            >
              {statusOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            {/* Expand/Collapse Button */}
            <button
              onClick={handleToggleExpand}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              title={isExpanded ? 'Collapse details' : 'Expand details'}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded Details Row */}
      {isExpanded && (
        <tr>
          <td colSpan="7" className="px-6 py-4 bg-gray-50">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Order Details</h4>
              
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-center gap-3">
                      {/* Item Image */}
                      {item.menuItem?.imageUrl && (
                        <img
                          src={item.menuItem.imageUrl}
                          alt={item.menuItem.name}
                          className="w-12 h-12 object-cover rounded-md"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.menuItem?.name || 'Unknown Item'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.menuItem?.category}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <div>Order ID: {_id}</div>
                  <div>Created: {formatDate(createdAt)}</div>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  Total: {formatPrice(totalAmount)}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default OrderRow;
