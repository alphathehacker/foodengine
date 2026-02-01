import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Grid, List, AlertCircle, Loader2, DollarSign, IndianRupee } from 'lucide-react';
import { menuAPI } from '../api/axios';
import { useDebounce } from '../hooks/useDebounce';
import { useFetch } from '../hooks/useFetch';
import MenuCard from '../components/MenuCard';
import MenuForm from '../components/MenuForm';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [togglingItem, setTogglingItem] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  
  // UI states
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [currentPage, setCurrentPage] = useState(1);
  
  // Currency state
  const [currency, setCurrency] = useState('USD'); // 'USD' or 'INR'
  
  // Pagination
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Currency conversion rates (approximate)
  const conversionRates = {
    USD: 1,
    INR: 83.12 // 1 USD = 83.12 INR (approximate)
  };

  const currencySymbols = {
    USD: '$',
    INR: '₹'
  };

  // Convert price to selected currency
  const convertPrice = (priceInUSD, targetCurrency) => {
    return (priceInUSD * conversionRates[targetCurrency]).toFixed(2);
  };

  // Format price with currency symbol
  const formatPrice = (price, targetCurrency = currency) => {
    const convertedPrice = convertPrice(price, targetCurrency);
    return `${currencySymbols[targetCurrency]}${convertedPrice}`;
  };

  // Toggle currency
  const toggleCurrency = () => {
    setCurrency(prev => prev === 'USD' ? 'INR' : 'USD');
  };

  // Fetch menu items
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(categoryFilter && { category: categoryFilter }),
        ...(availabilityFilter !== '' && { availability: availabilityFilter }),
        ...(priceRange.min && { minPrice: parseFloat(priceRange.min) }),
        ...(priceRange.max && { maxPrice: parseFloat(priceRange.max) }),
      };

      console.log('Fetching menu items with params:', params);
      const response = await menuAPI.getMenuItems(params);
      let items = response.data.data;
      
      // Client-side price filtering as fallback
      if (priceRange.min || priceRange.max) {
        items = items.filter(item => {
          const price = parseFloat(item.price);
          const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
          const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
          return price >= minPrice && price <= maxPrice;
        });
      }
      
      setMenuItems(response.data.data);
      setFilteredItems(items);
      setTotalPages(response.data.pagination.pages);
    } catch (err) {
      setError(err.message || 'Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  // Search menu items
  const searchMenuItems = async () => {
    if (!debouncedSearchQuery.trim()) {
      fetchMenuItems();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await menuAPI.searchMenuItems(debouncedSearchQuery);
      setFilteredItems(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to search menu items');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and when filters change
  useEffect(() => {
    if (debouncedSearchQuery) {
      searchMenuItems();
    } else {
      fetchMenuItems();
    }
  }, [currentPage, categoryFilter, availabilityFilter, priceRange, debouncedSearchQuery]);

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    try {
      if (editingItem) {
        await menuAPI.updateMenuItem(editingItem._id, formData);
      } else {
        await menuAPI.createMenuItem(formData);
      }
      
      setShowForm(false);
      setEditingItem(null);
      fetchMenuItems();
    } catch (err) {
      setError(err.message || `Failed to ${editingItem ? 'update' : 'create'} menu item`);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await menuAPI.deleteMenuItem(id);
      fetchMenuItems();
    } catch (err) {
      setError(err.message || 'Failed to delete menu item');
    }
  };

  // Handle toggle availability with optimistic UI
  const handleToggleAvailability = async (id) => {
    const originalItems = [...menuItems];
    
    // Optimistic update
    setMenuItems(prev => 
      prev.map(item => 
        item._id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
    setFilteredItems(prev => 
      prev.map(item => 
        item._id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
    
    setTogglingItem(id);
    
    try {
      await menuAPI.toggleAvailability(id);
    } catch (err) {
      // Rollback on error
      setMenuItems(originalItems);
      setFilteredItems(originalItems);
      setError(err.message || 'Failed to update availability');
    } finally {
      setTogglingItem(null);
    }
  };

  // Handle edit
  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setAvailabilityFilter('');
    setPriceRange({ min: '', max: '' });
    setCurrentPage(1);
  };

  const categories = ['Appetizer', 'Main Course', 'Dessert', 'Beverage'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Menu Management</h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1 hidden sm:block">Manage your restaurant menu items</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Currency Toggle */}
              <button
                onClick={toggleCurrency}
                className="btn btn-secondary btn-sm flex items-center gap-2 px-3 py-2 text-xs sm:text-sm"
                title="Toggle Currency (USD/INR)"
              >
                {currency === 'USD' ? (
                  <>
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium hidden sm:inline">USD</span>
                    <span className="font-medium sm:hidden">$</span>
                  </>
                ) : (
                  <>
                    <IndianRupee className="w-4 h-4" />
                    <span className="font-medium hidden sm:inline">INR</span>
                    <span className="font-medium sm:hidden">₹</span>
                  </>
                )}
              </button>
              
              {/* Add Item Button */}
              <button
                onClick={() => {
                  setEditingItem(null);
                  setShowForm(true);
                }}
                className="btn btn-primary flex items-center gap-2 px-3 py-2 text-xs sm:text-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Item</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          {/* Mobile Filter Toggle */}
          <div className="flex items-center justify-between mb-4 sm:hidden">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
          
          {/* Filters Grid - Always visible on desktop, toggle on mobile */}
          <div className={`${showMobileFilters ? 'block' : 'hidden'} sm:block space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 sm:gap-4`}>
            {/* Search */}
            <div className="relative sm:col-span-1 lg:col-span-2">
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input w-full pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="form-select w-full"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="form-select w-full"
              >
                <option value="">All Items</option>
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>
            </div>

            {/* Price Range - Full width on mobile */}
            <div className="sm:col-span-1 lg:col-span-2 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Min Price ({currency})</label>
                <input
                  type="number"
                  placeholder={`Min ${currencySymbols[currency]}`}
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="form-input w-full"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Max Price ({currency})</label>
                <input
                  type="number"
                  placeholder={`Max ${currencySymbols[currency]}`}
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="form-input w-full"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Clear Filters and View Mode */}
            <div className="sm:col-span-1 lg:col-span-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <button
                onClick={clearFilters}
                className="btn btn-outline btn-sm w-full sm:w-auto"
              >
                Clear Filters
              </button>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="bg-error-50 border border-error-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-error-600" />
            <span className="text-error-800">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-error-600 hover:text-error-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            <span className="ml-2 text-gray-600">Loading menu items...</span>
          </div>
        </div>
      )}

      {/* Menu Items */}
      {!loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">No menu items found</div>
              <p className="text-gray-600 mt-2">Try adjusting your filters or add new items</p>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredItems.map(item => (
                    <MenuCard
                      key={item._id}
                      item={item}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleAvailability={handleToggleAvailability}
                      isToggling={togglingItem === item._id}
                      currency={currency}
                      formatPrice={formatPrice}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price ({currency})</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map(item => (
                        <tr key={item._id}>
                          <td className="font-medium">{item.name}</td>
                          <td>
                            <span className="badge badge-primary">{item.category}</span>
                          </td>
                          <td className="font-semibold">{formatPrice(item.price)}</td>
                          <td>
                            <span className={`badge ${item.isAvailable ? 'badge-success' : 'badge-error'}`}>
                              {item.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleAvailability(item._id)}
                                disabled={togglingItem === item._id}
                                className="btn btn-outline btn-sm"
                              >
                                {togglingItem === item._id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  item.isAvailable ? 'Disable' : 'Enable'
                                )}
                              </button>
                              <button
                                onClick={() => handleEdit(item)}
                                className="btn btn-outline btn-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="btn btn-error btn-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="btn btn-outline btn-sm"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="btn btn-outline btn-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Menu Form Modal */}
      {showForm && (
        <MenuForm
          item={editingItem}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          isLoading={loading}
          currency={currency}
        />
      )}
    </div>
  );
};

export default MenuManagement;
