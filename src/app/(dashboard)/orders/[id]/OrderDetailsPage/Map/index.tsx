"use client";

import React from "react";
import { MAP_ID } from "@/constant";
import { Order } from "@/services";
import { coordsToLatLng } from "@/utils";
import { Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { SVG } from "@/components/svg";

interface MapProps {
  order?: Order;
}

export const MapView: React.FC<MapProps> = ({ order }) => {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = React.useState(false);
  const defaultLocation =
    order?.type === "BULK"
      ? order.locations?.find((location) => location.type === "PICKUP")
      : order?.locations?.find((location) => location.type === "DROPOFF");
  const defaultCenter = defaultLocation
    ? coordsToLatLng(defaultLocation.position.coordinates)
    : coordsToLatLng(order?.locations?.[0].position.coordinates);

  return (
    <div className="mt-2 h-full bg-gray-50  w-full">
      <Map
        className="h-full w-full overflow-hidden"
        defaultZoom={16}
        mapId={MAP_ID}
        defaultCenter={{ lat: defaultCenter.latitude, lng: defaultCenter.longitude }}
      >
        {order?.locations?.map((location) => {
          const { latitude, longitude } = coordsToLatLng(location.position.coordinates);
          return (
            <AdvancedMarker
              key={location._id}
              title={location.address}
              clickable
              position={{ lat: latitude, lng: longitude }}
            />
          );
        })}
      </Map>
    </div>
  );
};
