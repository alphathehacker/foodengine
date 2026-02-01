import React, { useState, useEffect } from 'react';
import { Filter, Loader2, AlertCircle, TrendingUp, DollarSign, ShoppingCart, Users, IndianRupee } from 'lucide-react';
import { orderAPI } from '../api/axios';
import OrderRow from '../components/OrderRow';
import StatusBadge from '../components/StatusBadge';

const OrdersDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ordersPerPage = 10;

  // Currency state
  const [currency, setCurrency] = useState('USD'); // 'USD' or 'INR'
  
  // Currency conversion rates (same as MenuManagement)
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

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: ordersPerPage,
        sortBy,
        sortOrder,
        ...(statusFilter && { status: statusFilter }),
      };

      const response = await orderAPI.getOrders(params);
      setOrders(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await orderAPI.getOrderStats();
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [currentPage, statusFilter, sortBy, sortOrder]);

  // Handle status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    
    try {
      await orderAPI.updateOrderStatus(orderId, newStatus);
      fetchOrders(); // Refresh orders
      fetchStats(); // Refresh stats
    } catch (err) {
      setError(err.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Toggle order expansion
  const handleToggleExpand = (orderId, isExpanded) => {
    const newExpanded = new Set(expandedOrders);
    if (isExpanded) {
      newExpanded.add(orderId);
    } else {
      newExpanded.delete(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const statusOptions = ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];
  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'totalAmount', label: 'Total Amount' },
    { value: 'customerName', label: 'Customer Name' },
    { value: 'orderNumber', label: 'Order Number' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Orders Dashboard</h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1 hidden sm:block">Manage and track restaurant orders</p>
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
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Orders */}
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                  </div>
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <ShoppingCart className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Orders */}
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.todayOrders}</p>
                  </div>
                  <div className="p-3 bg-success-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-success-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue ({currency})</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
                  </div>
                  <div className="p-3 bg-warning-100 rounded-lg">
                    {currency === 'INR' ? (
                      <IndianRupee className="w-6 h-6 text-warning-600" />
                    ) : (
                      <DollarSign className="w-6 h-6 text-warning-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Revenue */}
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Revenue ({currency})</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.todayRevenue)}</p>
                  </div>
                  <div className="p-3 bg-success-100 rounded-lg">
                    {currency === 'INR' ? (
                      <IndianRupee className="w-6 h-6 text-success-600" />
                    ) : (
                      <DollarSign className="w-6 h-6 text-success-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
            {Object.entries(stats.byStatus).map(([status, data]) => (
              <div key={status} className="card">
                <div className="card-body text-center">
                  <StatusBadge status={status} size="lg" />
                  <p className="text-2xl font-bold text-gray-900 mt-2">{data.count}</p>
                  <p className="text-sm text-gray-600">{formatPrice(data.totalRevenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="form-select"
            >
              <option value="">All Statuses</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="form-select"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-600">
              {orders.length} orders found
            </span>
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

      {/* Orders Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              <span className="ml-2 text-gray-600">Loading orders...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">No orders found</div>
              <p className="text-gray-600 mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total ({currency})</th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="hidden sm:table-cell px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <OrderRow
                      key={order._id}
                      order={order}
                      onStatusUpdate={handleStatusUpdate}
                      isUpdating={updatingOrderId === order._id}
                      expanded={expandedOrders.has(order._id)}
                      onToggleExpand={handleToggleExpand}
                      currency={currency}
                      formatPrice={formatPrice}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

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
      </div>
    </div>
  );
};

export default OrdersDashboard;
