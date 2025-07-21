
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

declare global {
  interface Window {
    google: typeof google;
  }
}

interface GoogleMapPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  apiKey?: string;
}

// Global loader instance to prevent multiple loaders
let globalLoader: Loader | null = null;
let currentApiKey: string | null = null;

const GoogleMapPicker: React.FC<GoogleMapPickerProps> = ({
  onLocationSelect,
  initialLat = 17.4482947,
  initialLng = 78.3753447,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState({ lat: initialLat, lng: initialLng });
  const [address, setAddress] = useState('');
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Default API key for demonstration purposes
  const defaultApiKey = 'AIzaSyBDaeWicvigtP9xPv919E-RNoxfvC-Hqik';

  const waitForMapContainer = async (maxAttempts = 10): Promise<boolean> => {
    for (let i = 0; i < maxAttempts; i++) {
      console.log(`🔍 Checking map container (attempt ${i + 1}/${maxAttempts})`);
      
      if (mapRef.current) {
        console.log('✅ Map container found!');
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.error('❌ Map container not found after all attempts');
    return false;
  };

  const loadMap = async (key: string) => {
    const trimmedKey = key.trim();
    
    if (!trimmedKey) {
      setError('Please enter a valid Google Maps API key');
      return;
    }

    // Validate API key format (basic check)
    if (trimmedKey.length < 30 || !trimmedKey.startsWith('AIza')) {
      setError('Invalid API key format. Google Maps API keys should start with "AIza" and be longer than 30 characters.');
      return;
    }

    console.log('🗺️ Loading map with API key:', trimmedKey.substring(0, 10) + '...');
    console.log('🔍 API Key length:', trimmedKey.length);
    setIsLoading(true);
    setError('');

    try {
      // Wait for the map container to be available
      const containerReady = await waitForMapContainer();
      
      if (!containerReady) {
        setError('Map container failed to load. Please try refreshing the page.');
        return;
      }

      // Check if we need to create a new loader or can reuse existing one
      if (!globalLoader || currentApiKey !== trimmedKey) {
        console.log('🔄 Creating new Google Maps loader...');
        
        // Clear any existing loader
        globalLoader = null;
        currentApiKey = null;
        
        // Create new loader with consistent library configuration
        globalLoader = new Loader({
          apiKey: trimmedKey,
          version: 'weekly',
          libraries: ['places', 'geometry']
        });
        
        currentApiKey = trimmedKey;
      } else {
        console.log('♻️ Reusing existing Google Maps loader...');
      }

      console.log('⏳ Loading Google Maps API...');
      await globalLoader.load();
      console.log('✅ Google Maps API loaded successfully');

      // Final check that the map container is still available
      if (!mapRef.current) {
        console.error('❌ Map container ref became null after loading');
        setError('Map container was lost during loading. Please try again.');
        return;
      }
      
      console.log('🗺️ Creating map instance...');
      const googleMap = new google.maps.Map(mapRef.current, {
        center: { lat: selectedLocation.lat, lng: selectedLocation.lng },
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      });

      console.log('📍 Creating marker...');
      const googleMarker = new google.maps.Marker({
        position: { lat: selectedLocation.lat, lng: selectedLocation.lng },
        map: googleMap,
        draggable: true,
        title: 'Selected Location'
      });

      // Add click listener to map
      googleMap.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          console.log('🖱️ Map clicked at:', lat, lng);
          updateLocation(lat, lng, googleMap, googleMarker);
        }
      });

      // Add drag listener to marker
      googleMarker.addListener('dragend', () => {
        const position = googleMarker.getPosition();
        if (position) {
          const lat = position.lat();
          const lng = position.lng();
          console.log('🔄 Marker dragged to:', lat, lng);
          updateLocation(lat, lng, googleMap, googleMarker);
        }
      });

      setMap(googleMap);
      setMarker(googleMarker);
      setIsMapLoaded(true);
      setError('');
      
      console.log('🎯 Getting initial address...');
      // Get initial address
      getAddressFromCoordinates(selectedLocation.lat, selectedLocation.lng);
      
    } catch (err) {
      console.error('❌ Error loading Google Maps:', err);
      
      // Clear global loader on error
      globalLoader = null;
      currentApiKey = null;
      
      // Provide more specific error messages
      if (err instanceof Error) {
        if (err.message.includes('Loader must not be called again')) {
          setError('Multiple map instances detected. Please refresh the page and try again.');
        } else if (err.message.includes('API key')) {
          setError('API key error: Please check that your Google Maps API key is valid and has the necessary permissions (Maps JavaScript API, Places API).');
        } else if (err.message.includes('quota') || err.message.includes('billing')) {
          setError('Quota exceeded or billing issue: Please check your Google Cloud Console billing and quota settings.');
        } else if (err.message.includes('referer') || err.message.includes('origin')) {
          setError('Domain restriction: Please add this domain to your API key restrictions in Google Cloud Console.');
        } else {
          setError(`Failed to load Google Maps: ${err.message}`);
        }
      } else {
        setError('Failed to load Google Maps. Please check your API key and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateLocation = (lat: number, lng: number, googleMap: google.maps.Map, googleMarker: google.maps.Marker) => {
    const newPosition = { lat, lng };
    setSelectedLocation(newPosition);
    googleMarker.setPosition(newPosition);
    googleMap.setCenter(newPosition);
    getAddressFromCoordinates(lat, lng);
    onLocationSelect(lat, lng, address);
  };

  const getAddressFromCoordinates = (lat: number, lng: number) => {
    if (!window.google || !window.google.maps) {
      console.error('Google Maps not loaded');
      return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      console.log('🔍 Geocoding status:', status);
      if (status === 'OK' && results && results[0]) {
        const formattedAddress = results[0].formatted_address;
        console.log('📍 Address found:', formattedAddress);
        setAddress(formattedAddress);
        onLocationSelect(lat, lng, formattedAddress);
      } else {
        console.warn('⚠️ Geocoding failed:', status);
        // Fallback to coordinates if geocoding fails
        const coordinateAddress = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
        setAddress(coordinateAddress);
        onLocationSelect(lat, lng, coordinateAddress);
      }
    });
  };

  const handleConfirmLocation = () => {
    onLocationSelect(selectedLocation.lat, selectedLocation.lng, address);
  };

  // Auto-load map on component mount
  useEffect(() => {
    if (!isMapLoaded && !isLoading) {
      console.log('🚀 Auto-loading map with default API key');
      loadMap(defaultApiKey);
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Map container with overlay */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-64 rounded-lg border border-gray-300 shadow-sm"
          style={{ minHeight: '256px' }}
        />
        
        {/* Loading overlay */}
        {!isMapLoaded && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 rounded-lg">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">Loading map...</p>
                </>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 max-w-sm">
                  <p className="text-red-800 text-sm font-medium">Error:</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                  <Button 
                    onClick={() => loadMap(defaultApiKey)} 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                  >
                    Retry Loading Map
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Initializing map...</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Map controls - only show when map is loaded */}
      {isMapLoaded && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Latitude</Label>
              <Input 
                value={selectedLocation.lat.toFixed(6)} 
                readOnly 
                className="bg-gray-50 font-mono text-sm"
              />
            </div>
            <div>
              <Label>Longitude</Label>
              <Input 
                value={selectedLocation.lng.toFixed(6)} 
                readOnly 
                className="bg-gray-50 font-mono text-sm"
              />
            </div>
          </div>

          {address && (
            <div>
              <Label>Selected Address</Label>
              <Input 
                value={address} 
                readOnly 
                className="bg-gray-50 mt-1 text-sm"
              />
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-blue-800 text-sm">
              💡 <strong>Tip:</strong> Click on the map or drag the marker to select a location
            </p>
          </div>

          <Button onClick={handleConfirmLocation} className="w-full">
            Confirm Location
          </Button>
        </>
      )}
    </div>
  );
};

export default GoogleMapPicker;
