import React from 'react';
import { Edit, Trash2, ToggleLeft, ToggleRight, Clock, Users, DollarSign, IndianRupee } from 'lucide-react';

const MenuCard = ({ 
  item, 
  onEdit, 
  onDelete, 
  onToggleAvailability, 
  isToggling = false,
  currency = 'USD',
  formatPrice = (price) => `$${price.toFixed(2)}`
}) => {
  const {
    _id,
    name,
    description,
    category,
    price,
    ingredients,
    isAvailable,
    preparationTime,
    imageUrl
  } = item;

  const getCategoryColor = (category) => {
    const colors = {
      'Appetizer': 'bg-blue-100 text-blue-800',
      'Main Course': 'bg-green-100 text-green-800',
      'Dessert': 'bg-pink-100 text-pink-800',
      'Beverage': 'bg-purple-100 text-purple-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const handleEdit = () => onEdit(item);
  const handleDelete = () => onDelete(_id);
  const handleToggleAvailability = () => onToggleAvailability(_id);

  // Get the appropriate currency icon
  const CurrencyIcon = currency === 'INR' ? IndianRupee : DollarSign;

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="card-body">
        {/* Header with title and actions */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
            <div className="flex items-center gap-2">
              <span className={`badge ${getCategoryColor(category)}`}>
                {category}
              </span>
              <span className={`badge ${isAvailable ? 'badge-success' : 'badge-error'}`}>
                {isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleAvailability}
              disabled={isToggling}
              className="p-2 text-gray-500 hover:text-primary-600 transition-colors disabled:opacity-50"
              title={isAvailable ? 'Mark as unavailable' : 'Mark as available'}
            >
              {isAvailable ? (
                <ToggleRight className="w-5 h-5" />
              ) : (
                <ToggleLeft className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={handleEdit}
              className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
              title="Edit item"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-500 hover:text-error-600 transition-colors"
              title="Delete item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {/* Image */}
        {imageUrl && (
          <div className="mb-3">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-32 object-cover rounded-md"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Details */}
        <div className="space-y-2">
          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-gray-600">
              <CurrencyIcon className="w-4 h-4" />
              <span className="text-sm">Price ({currency})</span>
            </div>
            <span className="font-semibold text-gray-900">
              {formatPrice(price)}
            </span>
          </div>

          {/* Preparation Time */}
          {preparationTime && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Prep Time</span>
              </div>
              <span className="text-sm text-gray-900">
                {preparationTime} min
              </span>
            </div>
          )}

          {/* Ingredients */}
          {ingredients && ingredients.length > 0 && (
            <div>
              <div className="text-sm text-gray-600 mb-1">Ingredients:</div>
              <div className="flex flex-wrap gap-1">
                {ingredients.slice(0, 3).map((ingredient, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {ingredient}
                  </span>
                ))}
                {ingredients.length > 3 && (
                  <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    +{ingredients.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
