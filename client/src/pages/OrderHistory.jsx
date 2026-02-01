import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Filter, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  IndianRupee, 
  Users, 
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { orderAPI } from '../api/axios';
import StatusBadge from '../components/StatusBadge';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currency, setCurrency] = useState('USD');
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ordersPerPage = 20;

  // Currency conversion
  const conversionRates = {
    USD: 1,
    INR: 83.12
  };

  const currencySymbols = {
    USD: '$',
    INR: '₹'
  };

  const convertPrice = (priceInUSD, targetCurrency) => {
    return (priceInUSD * conversionRates[targetCurrency]).toFixed(2);
  };

  const formatPrice = (price, targetCurrency = currency) => {
    const convertedPrice = convertPrice(price, targetCurrency);
    return `${currencySymbols[targetCurrency]}${convertedPrice}`;
  };

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
        ...(dateFilter && { date: dateFilter }),
        ...(customerFilter && { customerName: customerFilter }),
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

  // Search orders
  const searchOrders = async () => {
    if (!searchQuery.trim()) {
      fetchOrders();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // For now, we'll filter on client side since there's no search endpoint for orders
      const response = await orderAPI.getOrders({ limit: 100 });
      const filteredOrders = response.data.data.filter(order => 
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => 
          item.menuItem?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      
      setOrders(filteredOrders);
      setTotalPages(1);
    } catch (err) {
      setError(err.message || 'Failed to search orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      searchOrders();
    } else {
      fetchOrders();
    }
  }, [currentPage, statusFilter, dateFilter, customerFilter, sortBy, sortOrder, searchQuery]);

  const handleToggleExpand = (orderId, isExpanded) => {
    const newExpanded = new Set(expandedOrders);
    if (isExpanded) {
      newExpanded.add(orderId);
    } else {
      newExpanded.delete(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setDateFilter('');
    setCustomerFilter('');
    setCurrentPage(1);
  };

  const statusOptions = ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];
  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'totalAmount', label: 'Total Amount' },
    { value: 'customerName', label: 'Customer Name' },
    { value: 'orderNumber', label: 'Order Number' }
  ];

  // Calculate statistics
  const calculateStats = () => {
    if (orders.length === 0) return null;
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const deliveredOrders = orders.filter(order => order.status === 'Delivered').length;
    const cancelledOrders = orders.filter(order => order.status === 'Cancelled').length;
    const avgOrderValue = totalRevenue / orders.length;
    
    return {
      totalRevenue,
      deliveredOrders,
      cancelledOrders,
      avgOrderValue,
      totalOrders: orders.length
    };
  };

  const stats = calculateStats();

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Order History</h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1 hidden sm:block">View complete order history and analytics</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
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

            {/* Total Revenue */}
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue ({currency})</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
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

            {/* Delivered Orders */}
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Delivered</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.deliveredOrders}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Cancelled Orders */}
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cancelled</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.cancelledOrders}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Average Order Value */}
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Order ({currency})</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.avgOrderValue)}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input w-full pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
            >
              <option value="">All Statuses</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            {/* Date Filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="form-input"
            />

            {/* Customer Filter */}
            <input
              type="text"
              placeholder="Filter by customer..."
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {orders.length} orders found
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select text-sm"
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
                className="form-select text-sm"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>

              <button
                onClick={clearFilters}
                className="btn btn-outline btn-sm text-xs"
              >
                Clear Filters
              </button>
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
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <React.Fragment key={order._id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {order.orderNumber}
                            </span>
                            <button
                              onClick={() => handleToggleExpand(order._id, !expandedOrders.has(order._id))}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded"
                              title={expandedOrders.has(order._id) ? 'Collapse details' : 'Expand details'}
                            >
                              {expandedOrders.has(order._id) ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.customerName}</div>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.itemCount || order.items?.length || 0} items
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatPrice(order.totalAmount)}
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleToggleExpand(order._id, !expandedOrders.has(order._id))}
                            className="btn btn-outline btn-sm text-xs"
                          >
                            {expandedOrders.has(order._id) ? 'Hide' : 'View'}
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded Details Row */}
                      {expandedOrders.has(order._id) && (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 bg-gray-50">
                            <div className="space-y-4">
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">Order Details</h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600">Order ID: {order._id}</p>
                                  <p className="text-sm text-gray-600">Table: {order.tableNumber}</p>
                                  <p className="text-sm text-gray-600">Created: {formatDate(order.createdAt)}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-600">Status:</p>
                                  <StatusBadge status={order.status} />
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <h5 className="text-sm font-medium text-gray-900">Items:</h5>
                                {order.items?.map((item, index) => (
                                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                                    <div className="flex items-center gap-3">
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

                              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                <div></div>
                                <div className="text-lg font-bold text-gray-900">
                                  Total: {formatPrice(order.totalAmount)}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
