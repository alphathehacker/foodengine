import React from 'react';

const StatusBadge = ({ status, size = 'md' }) => {
  const getStatusConfig = (status) => {
    const configs = {
      'Pending': {
        bgColor: 'bg-warning-100',
        textColor: 'text-warning-800',
        borderColor: 'border-warning-200',
        icon: '⏳'
      },
      'Preparing': {
        bgColor: 'bg-primary-100',
        textColor: 'text-primary-800',
        borderColor: 'border-primary-200',
        icon: '👨‍🍳'
      },
      'Ready': {
        bgColor: 'bg-success-100',
        textColor: 'text-success-800',
        borderColor: 'border-success-200',
        icon: '✅'
      },
      'Delivered': {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        borderColor: 'border-gray-200',
        icon: '🚚'
      },
      'Cancelled': {
        bgColor: 'bg-error-100',
        textColor: 'text-error-800',
        borderColor: 'border-error-200',
        icon: '❌'
      }
    };

    return configs[status] || configs['Pending'];
  };

  const getSizeClasses = (size) => {
    const sizes = {
      'sm': 'px-2 py-0.5 text-xs',
      'md': 'px-2.5 py-0.5 text-xs',
      'lg': 'px-3 py-1 text-sm'
    };

    return sizes[size] || sizes['md'];
  };

  const config = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size);

  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        border ${sizeClasses}
      `}
    >
      <span className="text-xs">{config.icon}</span>
      {status}
    </span>
  );
};

export default StatusBadge;
