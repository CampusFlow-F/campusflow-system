
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Loader } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    title: string;
    info?: string;
  }>;
}

const GoogleMap = ({ center, zoom = 15, markers = [] }: GoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default campus location (you can customize this)
  const defaultCenter = center || { lat: -28.749074808736683, lng: 24.764687436813688 };
  

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (window.google && mapRef.current) {
      initializeMap();
    } else {
      loadGoogleMapsScript();
    }
  }, [userLocation]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
          toast({
            title: "Location Access",
            description: "Unable to access your location. Using default campus location.",
            variant: "default"
          });
        }
      );
    }
  };

  const loadGoogleMapsScript = () => {
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      initializeMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDFoCMVMXy7OpiF9VkM6Lb2oKpl2oeAv9k&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initializeMap;
    script.onerror = () => {
      setError('Failed to load Google Maps. Please check your API key configuration.');
      setIsLoading(false);
    };
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    try {
      const mapCenter = userLocation || defaultCenter;
      
      const newMap = new google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: zoom,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ]
      });

      setMap(newMap);

      // Add user location marker if available
      if (userLocation) {
        new google.maps.Marker({
          position: userLocation,
          map: newMap,
          title: 'Your Location',
          icon: {
            url: 'data:image/svg+xml;base64,' + btoa(`
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="4"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(24, 24)
          }
        });
      }

      // Add campus building markers
      const campusMarkers = [
        { id: 'lib', position: { lat: defaultCenter.lat + 0.001, lng: defaultCenter.lng + 0.001 }, title: 'Library', info: 'Open 24/7 during finals' },
        { id: 'nas', position: { lat: defaultCenter.lat - 0.001, lng: defaultCenter.lng + 0.002 }, title: 'Mathematical Computational Building', info: 'Labs and research facilities' },
        { id: 'ncam', position: { lat: defaultCenter.lat + 0.002, lng: defaultCenter.lng - 0.001 }, title: 'North Campus', info: 'Finance Office' },
        { id: 'hall', position: { lat: defaultCenter.lat, lng: defaultCenter.lng + 0.003 }, title: 'Great Hall', info: 'Dining, events, and services' },
        { id: 'clinic', position: { lat: defaultCenter.lat, lng: defaultCenter.lng + 0.003 }, title: 'Health Clinic', info: 'Medical services and support' }
      ];

      // Add building markers
      campusMarkers.forEach(marker => {
        const mapMarker = new google.maps.Marker({
          position: marker.position,
          map: newMap,
          title: marker.title,
          icon: {
            url: 'data:image/svg+xml;base64,' + btoa(`
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="red" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 32)
          }
        });

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
          content: `<div style="padding: 8px;"><h3 style="margin: 0 0 4px 0; font-weight: bold;">${marker.title}</h3><p style="margin: 0; color: #666;">${marker.info}</p></div>`
        });

        mapMarker.addListener('click', () => {
          infoWindow.open(newMap, mapMarker);
        });
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing map:', error);
      setError('Failed to initialize map');
      setIsLoading(false);
    }
  };

  const centerOnUser = () => {
    if (map && userLocation) {
      map.setCenter(userLocation);
      map.setZoom(18);
    } else {
      getCurrentLocation();
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Map Unavailable</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">
            Please ensure you have a valid Google Maps API key configured.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={centerOnUser} variant="outline" className="gap-2">
          <Navigation className="h-4 w-4" />
          Center on My Location
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="relative">
            <div 
              ref={mapRef} 
              className="w-full h-64 md:h-80 lg:h-96 rounded-lg"
              style={{ minHeight: '300px' }}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
                <div className="text-center">
                  <Loader className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading map...</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleMap;
