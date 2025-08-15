'use client'
import React from 'react';

const MapDebug: React.FC = () => {
    return (
        <div className="p-4 bg-gray-100 rounded-lg text-sm">
            <h3 className="font-semibold mb-2">Map Debug Information:</h3>
            <p>Google Maps API Key: {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Available' : 'Not available'}</p>
            <p>Map ID: {process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'Not set'}</p>
            <p>Environment: {process.env.NODE_ENV}</p>
            {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
                <p>API Key (first 10 chars): {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.substring(0, 10)}...</p>
            )}
        </div>
    );
};

export default MapDebug; 