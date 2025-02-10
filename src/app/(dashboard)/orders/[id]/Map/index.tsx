"use client";

import { UI } from "@/components/ui";
import React from "react";
import { Loader } from "@googlemaps/js-api-loader";

export const Map = () => {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  const mapOptions = {
    center: {
      lat: 6.5244,
      lng: 7.5101,
    },
    zoom: 4,
  };

  React.useEffect(() => {
    const loader = new Loader({
      apiKey: "",
      version: "weekly",
      libraries: ["places"],
    });

    loader.importLibrary("maps").then(() => {
      if (mapRef.current) {
        new google.maps.Map(mapRef.current, {
          center: mapOptions.center,
          zoom: mapOptions.zoom,
        });
      }
    });
  }, [mapOptions.center, mapOptions.zoom]);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="mt-2 h-full bg-gray-50  w-full">
      {isMounted && (
        <div ref={mapRef} className="h-full w-full overflow-hidden "></div>
      )}
    </div>
  );
};
