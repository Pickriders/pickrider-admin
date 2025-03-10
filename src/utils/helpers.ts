import { ImageLoader } from "next/image";

export const imageLoader: ImageLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}`;
};

export const coordsToLatLng = (coords?: number[]) => {
  return {
    latitude: coords?.[1] ?? 0,
    longitude: coords?.[0] ?? 0,
  };
};
