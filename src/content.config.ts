import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const couleur = z.string().regex(/^#[0-9a-f]{6}$/i, "Couleur au format #rrggbb");

// Un fichier Markdown par projet dans src/content/projets/ (le nom du fichier donne l'adresse de la page)
const projets = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/projets" }),
  schema: ({ image }) =>
    z.object({
      nom: z.string(),
      type: z.string(),
      tags: z.array(z.string()).default([]),
      lien: z.string().url().optional(),
      /** Meta description (sinon : texte par défaut de src/content/pages/projet.json) */
      description: z.string().optional(),
      galerie: z.array(z.object({ src: image(), alt: z.string() })).min(1),
      theme: z.object({
        fond: couleur,
        texte: couleur,
        bouton: z.object({ fond: couleur, texte: couleur }).optional(),
        bandeau: image().optional(),
      }),
    }),
});

export const collections = { projets };
