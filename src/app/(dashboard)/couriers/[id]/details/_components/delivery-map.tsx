"use client";

import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";
import { MapPinOff } from "lucide-react";
import { useEffect, useRef } from "react";

import { EmptyState } from "@/components/kit";
import { useAdminPrefs } from "@/components/kit/prefs";
import { GOOGLE_MAP_API_KEY } from "@/constant";
import type { RiderDeliveryMap } from "@/lib/admin/api";

/**
 * Every completed stop in the window as a dot — pickups in brand teal, drop-offs in orange — so staff
 * see the rider's patch of the city at a glance. Styled like the order route map.
 */
const STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];
const DARK: google.maps.MapTypeStyle[] = [
  ...STYLE,
  { elementType: "geometry", stylers: [{ color: "#1c2128" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8b949e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1c2128" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2d333b" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0d1117" }] },
];

function token(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function Canvas({ points }: { points: RiderDeliveryMap["points"] }) {
  const mapsLib = useMapsLibrary("maps");
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useAdminPrefs();
  const key = points.map((p) => `${p.latitude},${p.longitude},${p.type}`).join("|");

  useEffect(() => {
    if (!mapsLib || !ref.current || !points.length) return;
    const pickup = token("--brand", "#3fa49f");
    const dropoff = "#f08a24";
    const map = new google.maps.Map(ref.current, {
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: "cooperative",
      center: { lat: points[0].latitude, lng: points[0].longitude },
      zoom: 12,
      styles: resolvedTheme === "dark" ? DARK : STYLE,
      backgroundColor: resolvedTheme === "dark" ? "#1c2128" : "#f3f4f6",
    });
    const bounds = new google.maps.LatLngBounds();
    points.forEach((p) => {
      const position = { lat: p.latitude, lng: p.longitude };
      bounds.extend(position);
      new google.maps.Marker({
        map,
        position,
        clickable: false,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 5,
          fillColor: p.type === "PICKUP" ? pickup : dropoff,
          fillOpacity: 0.75,
          strokeColor: "#ffffff",
          strokeWeight: 1,
        },
      });
    });
    if (points.length > 1) map.fitBounds(bounds, 32);
    // `key` stands in for `points`: redraw when the stops change, not on every new array identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapsLib, key, resolvedTheme]);

  return <div ref={ref} className="h-full w-full rounded-xl" />;
}

export function DeliveryMap({ points }: { points: RiderDeliveryMap["points"] }) {
  if (!GOOGLE_MAP_API_KEY) {
    return (
      <EmptyState
        compact
        icon={MapPinOff}
        title="Map unavailable"
        description="Set NEXT_PUBLIC_GOOGLE_MAP_API_KEY to draw the map."
      />
    );
  }
  return (
    <APIProvider apiKey={GOOGLE_MAP_API_KEY}>
      <Canvas points={points} />
    </APIProvider>
  );
}
