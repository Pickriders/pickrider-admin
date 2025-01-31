import { ImageLoader } from "next/image";

export const imageLoader: ImageLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}`;
};
