"use client";

import React from "react";
import { MAP_ID } from "@/constant";
import { Order } from "@/services";
import { coordsToLatLng } from "@/utils";
import { Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";

interface MapProps {
  order?: Order;
}

type RoutePoint = {
  lat: number;
  lng: number;
  type: "PICKUP" | "DROPOFF";
  address: string;
  key: string;
};

// Draws the delivery route (a line through the ordered stops) over the map and
// fits the viewport to show every stop. Kept as a child of <Map> so it can grab
// the map instance via useMap().
const RouteOverlay: React.FC<{ points: RoutePoint[] }> = ({ points }) => {
  const map = useMap();
  const mapsLib = useMapsLibrary("maps");

  React.useEffect(() => {
    if (!map || !mapsLib || points.length < 2) return;
    const line = new mapsLib.Polyline({
      path: points.map((p) => ({ lat: p.lat, lng: p.lng })),
      geodesic: true,
      strokeColor: "#7C3AED",
      strokeOpacity: 0.9,
      strokeWeight: 4,
    });
    line.setMap(map);

    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);
    map.fitBounds(
      {
        north: Math.max(...lats),
        south: Math.min(...lats),
        east: Math.max(...lngs),
        west: Math.min(...lngs),
      },
      60,
    );

    return () => line.setMap(null);
  }, [map, mapsLib, points]);

  return null;
};

export const MapView: React.FC<MapProps> = ({ order }) => {
  // Route order: pickup(s) first, then drop-offs, so the line reads pickup -> drops.
  const points = React.useMemo<RoutePoint[]>(() => {
    const locations = order?.locations ?? [];
    return [...locations]
      .sort((a, b) => (a.type === "PICKUP" ? 0 : 1) - (b.type === "PICKUP" ? 0 : 1))
      .map((location, index) => {
        const { latitude, longitude } = coordsToLatLng(location.position?.coordinates);
        return {
          lat: latitude,
          lng: longitude,
          type: location.type,
          address: location.address,
          key: location._id ?? `${location.type}-${index}`,
        };
      })
      .filter((p) => p.lat !== 0 || p.lng !== 0);
  }, [order]);

  const defaultCenter = points[0] ?? { lat: 6.5244, lng: 3.3792 };

  return (
    <div className="mt-2 h-[28rem] sm:h-[32rem] lg:h-full w-full">
      <Map
        className="h-full w-full overflow-hidden rounded-lg"
        defaultZoom={13}
        mapId={MAP_ID}
        defaultCenter={{ lat: defaultCenter.lat, lng: defaultCenter.lng }}
      >
        {points.map((point) => (
          <AdvancedMarker key={point.key} title={point.address} clickable position={{ lat: point.lat, lng: point.lng }}>
            <Pin
              background={point.type === "PICKUP" ? "#16A34A" : "#DC2626"}
              borderColor="#ffffff"
              glyphColor="#ffffff"
            />
          </AdvancedMarker>
        ))}
        <RouteOverlay points={points} />
      </Map>
    </div>
  );
};
