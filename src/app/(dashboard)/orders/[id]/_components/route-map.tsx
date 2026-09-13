"use client";

import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";
import { MapPinOff } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

import { EmptyState, Skeleton } from "@/components/kit";
import { useAdminPrefs } from "@/components/kit/prefs";
import { GOOGLE_MAP_API_KEY } from "@/constant";
import type { OrderStop } from "@/lib/admin/api";

import { sortedStops, stopLatLng } from "../../lib";

/**
 * The delivery route: pickup(s) first, then drop-offs, lettered to match the
 * stops list. Draws the real driving route and falls back to straight lines
 * when directions fail. A styled map cannot use a cloud mapId, so this is a
 * raw google.maps.Map rather than the <Map> component.
 */
const LIGHT_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
];

const DARK_STYLE: google.maps.MapTypeStyle[] = [
  ...LIGHT_STYLE,
  { elementType: "geometry", stylers: [{ color: "#1c2128" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8b949e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1c2128" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2d333b" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#22272e" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0d1117" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#22272e" }] },
];

function token(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function RouteCanvas({ stops }: { stops: OrderStop[] }) {
  const mapsLib = useMapsLibrary("maps");
  const routesLib = useMapsLibrary("routes");
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useAdminPrefs();

  const points = useMemo(
    () =>
      sortedStops({ locations: stops })
        .map((stop) => ({ stop, point: stopLatLng(stop) }))
        .filter((entry): entry is { stop: OrderStop; point: { lat: number; lng: number } } => Boolean(entry.point)),
    [stops],
  );
  const pointsKey = points.map(({ point }) => `${point.lat},${point.lng}`).join("|");

  useEffect(() => {
    if (!mapsLib || !ref.current || points.length === 0) return;
    const brand = token("--brand", "#3fa49f");
    const info = token("--info", "#3b6fd6");
    const danger = token("--danger", "#d64545");

    const map = new google.maps.Map(ref.current, {
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: "cooperative",
      zoom: 13,
      center: points[0].point,
      styles: resolvedTheme === "dark" ? DARK_STYLE : LIGHT_STYLE,
      backgroundColor: resolvedTheme === "dark" ? "#1c2128" : "#f3f4f6",
    });

    const bounds = new google.maps.LatLngBounds();
    points.forEach(({ stop, point }, index) => {
      bounds.extend(point);
      const done = stop.status === "COMPLETED";
      const cancelled = stop.status === "CANCELLED";
      new google.maps.Marker({
        position: point,
        map,
        title: stop.address,
        label: { text: String.fromCharCode(65 + index), color: "#ffffff", fontSize: "12px", fontWeight: "700" },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 11,
          fillColor: cancelled ? danger : stop.type === "PICKUP" ? info : brand,
          fillOpacity: done || cancelled ? 0.55 : 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
      });
    });

    const path = points.map(({ point }) => point);
    let fallback: google.maps.Polyline | null = null;
    let renderer: google.maps.DirectionsRenderer | null = null;
    if (routesLib && path.length > 1) {
      renderer = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        preserveViewport: true,
        polylineOptions: { strokeColor: brand, strokeWeight: 5, strokeOpacity: 0.9 },
      });
      new google.maps.DirectionsService().route(
        {
          origin: path[0],
          destination: path[path.length - 1],
          waypoints: path.slice(1, -1).map((location) => ({ location, stopover: true })),
          optimizeWaypoints: false,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) renderer?.setDirections(result);
          else fallback = new google.maps.Polyline({ path, map, strokeColor: brand, strokeWeight: 4, strokeOpacity: 0.85 });
        },
      );
    }

    if (path.length === 1) map.setCenter(path[0]);
    else map.fitBounds(bounds, 56);

    return () => {
      renderer?.setMap(null);
      fallback?.setMap(null);
    };
    // The points key captures every coordinate; the array identity changes on each refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapsLib, routesLib, pointsKey, resolvedTheme]);

  if (!points.length) {
    return <EmptyState compact icon={MapPinOff} title="No coordinates on this order" description="The stops were saved without a position, so there is nothing to plot." />;
  }
  if (!mapsLib) return <Skeleton className="h-full w-full" />;
  return <div ref={ref} className="h-full w-full" aria-label="Delivery route map" />;
}

export function RouteMap({ stops }: { stops: OrderStop[] }) {
  if (!GOOGLE_MAP_API_KEY) {
    return <EmptyState compact icon={MapPinOff} title="Map unavailable" description="Set NEXT_PUBLIC_GOOGLE_MAP_API_KEY to draw the route." />;
  }
  return (
    <APIProvider apiKey={GOOGLE_MAP_API_KEY}>
      <RouteCanvas stops={stops} />
    </APIProvider>
  );
}
