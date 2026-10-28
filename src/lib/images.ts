import type { ImageMetadata } from "astro";

// Les fichiers de contenu (JSON) désignent les images par leur chemin
// relatif à src/assets/images/, ex. "accueil/hero-fond.webp".
const images = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/images/**/*.{webp,png,jpg,jpeg,svg}",
  { eager: true },
);

export function getImage(path: string): ImageMetadata {
  const image = images[`/src/assets/images/${path}`];
  if (!image) throw new Error(`Image introuvable : src/assets/images/${path}`);
  return image.default;
}
