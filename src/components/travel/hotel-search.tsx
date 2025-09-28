import React from 'react';
import { EnhancedHotelSearch } from './enhanced-hotel-search';

export const HotelSearch = () => {
  console.log('HotelSearch component is rendering');
  return (
    <div className="hotel-search-wrapper">
      <EnhancedHotelSearch />
    </div>
  );
};