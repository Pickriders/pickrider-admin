"use client";

import React from "react";
import { Order } from "@/services";
import { coordsToLatLng } from "@/utils";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

// Same subtle, on-brand styling as the web-app quote page's RouteMap, so the
// purple driving route is the hero. Styled maps must NOT use a cloud mapId, so we
// create a raw google.maps.Map here instead of the <Map> component.
const MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
];

export const MapView: React.FC<{ order?: Order }> = ({ order }) => {
  const mapsLib = useMapsLibrary("maps");
  const routesLib = useMapsLibrary("routes");
  const ref = React.useRef<HTMLDivElement>(null);

  // Route order: pickup(s) first, then drop-offs, so the line reads pickup -> drops.
  const points = React.useMemo(() => {
    const locations = order?.locations ?? [];
    return [...locations]
      .sort((a, b) => (a.type === "PICKUP" ? 0 : 1) - (b.type === "PICKUP" ? 0 : 1))
      .map((location) => {
        const { latitude, longitude } = coordsToLatLng(location.position?.coordinates);
        return { lat: latitude, lng: longitude };
      })
      .filter((p) => p.lat !== 0 || p.lng !== 0);
  }, [order]);

  const pointsKey = points.map((p) => `${p.lat},${p.lng}`).join("|");

  React.useEffect(() => {
    if (!mapsLib || !ref.current || points.length === 0) return;

    const map = new google.maps.Map(ref.current, {
      disableDefaultUI: true,
      gestureHandling: "cooperative",
      zoom: 13,
      center: points[0],
      styles: MAP_STYLE,
    });

    const bounds = new google.maps.LatLngBounds();
    points.forEach((p, i) => {
      bounds.extend(p);
      new google.maps.Marker({
        position: p,
        map,
        label: { text: String.fromCharCode(65 + i), color: "#fff", fontSize: "12px", fontWeight: "700" },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 11,
          fillColor: i === 0 ? "#5b57c8" : "#3fa49f", // pickup purple, drop-offs teal
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 3,
        },
      });
    });

    // Real driving route (falls back to a straight line if directions fail).
    if (routesLib && points.length > 1) {
      const renderer = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        preserveViewport: true,
        polylineOptions: { strokeColor: "#5b57c8", strokeWeight: 5, strokeOpacity: 0.9 },
      });
      new google.maps.DirectionsService().route(
        {
          origin: points[0],
          destination: points[points.length - 1],
          waypoints: points.slice(1, -1).map((p) => ({ location: p, stopover: true })),
          optimizeWaypoints: false,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (res, status) => {
          if (status === google.maps.DirectionsStatus.OK && res) {
            renderer.setDirections(res);
          } else {
            new google.maps.Polyline({
              path: points,
              map,
              strokeColor: "#5b57c8",
              strokeWeight: 4,
              strokeOpacity: 0.85,
            });
          }
        },
      );
    }

    map.fitBounds(bounds, 56);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapsLib, routesLib, pointsKey]);

  return (
    <div className="mt-2 h-[28rem] sm:h-[32rem] lg:h-full w-full">
      <div ref={ref} className="h-full w-full overflow-hidden rounded-lg bg-muted" aria-label="Delivery route map" />
    </div>
  );
};
