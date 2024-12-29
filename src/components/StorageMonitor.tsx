// StorageStatus.js
import React from 'react';

const StorageStatus = ({ usedStorage, maxStorage }) => {
  const storagePercentage = (usedStorage / maxStorage) * 100;

  return (
    <div className="mt-4">
      <p>
        Used Storage: {usedStorage.toFixed(2)} MB / {maxStorage} MB
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-gray-300 rounded h-4 mt-2">
        <div
          className={`h-4 rounded ${
            storagePercentage >= 80 ? 'bg-red-500' : 'bg-indigo-600'
          }`}
          style={{ width: `${Math.min(storagePercentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StorageStatus;
