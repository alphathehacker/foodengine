import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, DollarSign, IndianRupee } from 'lucide-react';

const MenuForm = ({ 
  item = null, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  currency = 'USD'
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Appetizer',
    price: '',
    ingredients: [''],
    isAvailable: true,
    preparationTime: '',
    imageUrl: ''
  });

  const [errors, setErrors] = useState({});

  const categories = ['Appetizer', 'Main Course', 'Dessert', 'Beverage'];

  // Initialize form with item data if editing
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        category: item.category || 'Appetizer',
        price: item.price ? item.price.toString() : '',
        ingredients: item.ingredients && item.ingredients.length > 0 ? item.ingredients : [''],
        isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
        preparationTime: item.preparationTime ? item.preparationTime.toString() : '',
        imageUrl: item.imageUrl || ''
      });
    }
  }, [item]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (formData.price && parseFloat(formData.price) > 9999.99) {
      newErrors.price = 'Price cannot exceed 9999.99';
    }

    if (formData.preparationTime && (parseInt(formData.preparationTime) < 1 || parseInt(formData.preparationTime) > 180)) {
      newErrors.preparationTime = 'Preparation time must be between 1 and 180 minutes';
    }

    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'Please enter a valid URL';
    }

    const validIngredients = formData.ingredients.filter(ing => ing.trim());
    if (validIngredients.length === 0) {
      newErrors.ingredients = 'At least one ingredient is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients
    }));

    // Clear ingredient error when user starts typing
    if (errors.ingredients) {
      setErrors(prev => ({
        ...prev,
        ingredients: ''
      }));
    }
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        ingredients: newIngredients
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      ingredients: formData.ingredients.filter(ing => ing.trim()),
      preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : undefined
    };

    onSubmit(submitData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="card-header border-b border-secondary-200 bg-gradient-to-r from-secondary-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-secondary-900">
                {item ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <p className="text-sm text-secondary-600 mt-1">
                {item ? 'Update the menu item details' : 'Add a new item to your menu'}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-xl transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card-body">
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="form-label" htmlFor="name">
                Item Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`form-input ${errors.name ? 'border-error-500 ring-error-500' : ''}`}
                placeholder="e.g., Grilled Salmon"
                maxLength={100}
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="form-label" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Describe the dish, ingredients, and preparation method"
                rows={3}
                maxLength={500}
              />
            </div>

            {/* Category and Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label" htmlFor="category">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`form-select ${errors.category ? 'border-error-500 ring-error-500' : ''}`}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="form-error">{errors.category}</p>}
              </div>

              <div>
                <label className="form-label" htmlFor="price">
                  Price ({currency}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-500 font-medium">
                    {currency === 'INR' ? '₹' : '$'}
                  </span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`form-input pl-8 ${errors.price ? 'border-error-500 ring-error-500' : ''}`}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    max="9999.99"
                  />
                </div>
                {errors.price && <p className="form-error">{errors.price}</p>}
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <label className="form-label">
                Ingredients *
              </label>
              <div className="space-y-3">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={ingredient}
                        onChange={(e) => handleIngredientChange(index, e.target.value)}
                        className="form-input pr-10"
                        placeholder="e.g., Fresh salmon, lemon, herbs"
                        maxLength={50}
                      />
                      {index === 0 && (
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 text-xs">
                          Main ingredient
                        </span>
                      )}
                    </div>
                    {formData.ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="p-2.5 text-secondary-400 hover:text-error-600 hover:bg-error-50 rounded-xl transition-all duration-200"
                        title="Remove ingredient"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addIngredient}
                  className="btn btn-secondary btn-sm w-full justify-center"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Ingredient
                </button>
              </div>
              {errors.ingredients && <p className="form-error">{errors.ingredients}</p>}
            </div>

            {/* Preparation Time and Image URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label" htmlFor="preparationTime">
                  Preparation Time (minutes)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="preparationTime"
                    name="preparationTime"
                    value={formData.preparationTime}
                    onChange={handleInputChange}
                    className={`form-input pr-12 ${errors.preparationTime ? 'border-error-500 ring-error-500' : ''}`}
                    placeholder="15"
                    min="1"
                    max="180"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-500 text-sm">
                    min
                  </span>
                </div>
                {errors.preparationTime && <p className="form-error">{errors.preparationTime}</p>}
              </div>

              <div>
                <label className="form-label" htmlFor="imageUrl">
                  Image URL
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className={`form-input ${errors.imageUrl ? 'border-error-500 ring-error-500' : ''}`}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.imageUrl && <p className="form-error">{errors.imageUrl}</p>}
              </div>
            </div>

            {/* Available Checkbox */}
            <div className="bg-secondary-50 rounded-xl p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleInputChange}
                  className="form-checkbox w-5 h-5"
                />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-secondary-900">
                    Available for order
                  </span>
                  <p className="text-xs text-secondary-600 mt-1">
                    Customers can order this item when checked
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Form Actions - Inside the form */}
          <div className="card-footer bg-gradient-to-r from-secondary-50 to-white border-t border-secondary-200 mt-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-secondary"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {item ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    {item ? 'Update Item' : 'Add Item'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuForm;
