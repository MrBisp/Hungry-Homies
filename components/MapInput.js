'use client';

import React, { memo, useRef, useState, useCallback, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import ProfileImage from '@/components/ProfileImage';

const MapInput = dynamic(() => Promise.resolve(({ onLocationSelect, userImage = '/default-avatar.png', emoji = '😋' }) => {
    const [marker, setMarker] = useState(null);
    const [customIcon, setCustomIcon] = useState(null);

    useEffect(() => {
        setCustomIcon(createCustomIcon(emoji, { image: userImage }));
    }, [emoji, userImage]);

    const handleMapClick = useCallback((e) => {
        const coords = { lat: e.latlng.lat, lng: e.latlng.lng };
        setMarker(coords);
        onLocationSelect(coords);
    }, [onLocationSelect]);

    return (
        <div className="h-[400px] relative">
            <MapContainer
                center={[55.6761, 12.5683]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
            >
                <SearchControl onLocationSelect={(coords, name) => {
                    setMarker(coords);
                    onLocationSelect(coords, name);
                }} />
                
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {marker && customIcon && (
                    <Marker 
                        position={[marker.lat, marker.lng]} 
                        icon={customIcon}
                    />
                )}

                <MapEvents onClick={handleMapClick} />
            </MapContainer>
        </div>
    );
}), {
    ssr: false,
    loading: () => <div>Loading map...</div>
});

function SearchControl({ onLocationSelect }) {
    const map = useMap();
    const [searchValue, setSearchValue] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchContainerRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside, true);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside, true);
        };
    }, []);

    const handleSearch = useCallback(async (searchTerm = searchValue) => {
        if (!searchTerm.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsSearching(true);
        try {
            const bounds = map.getBounds();
            const viewbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
            
            const url = `https://nominatim.openstreetmap.org/search?` + 
                `format=json&` +
                `q=${encodeURIComponent(searchTerm)}&` +
                `viewbox=${viewbox}&` +
                `bounded=0&` +
                `limit=5`;
            console.log('Search URL:', url);

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'YourAppName/1.0',
                    'Accept-Language': 'en'
                }
            });
            
            const data = await response.json();
            console.log('Search response:', data);
            
            if (data && data.length > 0) {
                const mappedSuggestions = data.map(item => ({
                    name: item.display_name,
                    coordinates: {
                        lat: parseFloat(item.lat),
                        lng: parseFloat(item.lon)
                    }
                }));
                console.log('Mapped suggestions:', mappedSuggestions);
                setSuggestions(mappedSuggestions);
                setShowSuggestions(true);
            } else {
                console.log('No suggestions found');
                setSuggestions([]);
                setShowSuggestions(false);
            }
        } catch (error) {
            console.error('Search error:', error);
            setSuggestions([]);
            setShowSuggestions(false);
        } finally {
            setIsSearching(false);
        }
    }, [map, searchValue]);

    const handleSuggestionClick = (suggestion) => {
        setSearchValue(suggestion.name.split(',')[0]);
        setSuggestions([]);
        setShowSuggestions(false);
        setTimeout(() => {
            map.setView([suggestion.coordinates.lat, suggestion.coordinates.lng], 16);
            onLocationSelect(suggestion.coordinates, suggestion.name.split(',')[0]);
        }, 0);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchValue.trim().length >= 3) {
                handleSearch();
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchValue, handleSearch]);

    return (
        <div 
            className="absolute top-2 left-2 right-2 md:left-12 md:right-12 z-[1002]"
            ref={searchContainerRef}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
        >
            <div className="relative">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSearch();
                            }
                            if (e.key === 'Escape') {
                                setShowSuggestions(false);
                            }
                        }}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (searchValue.trim().length >= 3) {
                                setShowSuggestions(true);
                            }
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                        placeholder="Search for a location..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSearch();
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                        disabled={isSearching}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {isSearching ? 'Searching...' : 'Search'}
                    </button>
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div 
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onMouseUp={(e) => e.stopPropagation()}
                    >
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSuggestionClick(suggestion);
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                onMouseUp={(e) => e.stopPropagation()}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            >
                                <div className="font-medium">
                                    {suggestion.name.split(',')[0]}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {suggestion.name.split(',').slice(1, 3).join(',')}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const createCustomIcon = (emoji = '📍', user = null) => {
    if (typeof window === 'undefined') {
        return {
            iconSize: [40, 40],
            className: 'custom-marker-wrapper'
        };
    }

    try {
        const markerHtml = `
            <div class="marker-container">
                <div class="profile-image">
                    ${user ? `<div class="w-full h-full">${ReactDOMServer.renderToString(<ProfileImage user={user} size="sm" />)}</div>` : ''}
                </div>
                <div class="emoji-overlay">${emoji || '📍'}</div>
            </div>
        `;
        return new L.DivIcon({
            html: markerHtml,
            iconSize: new L.Point(40, 40),
            className: 'custom-marker-wrapper',
        });
    } catch (error) {
        console.error('Error creating custom icon:', error);
        return null;
    }
};

// Add MapEvents component to handle map clicks
const MapEvents = ({ onClick }) => {
    const map = useMapEvents({
        click: onClick
    });
    return null;
};

MapInput.displayName = 'MapInput';

export default MapInput;