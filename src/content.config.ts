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
      /** Position dans la liste « Ils disent Yesss » */
      ordre: z.number(),
      /** Image de la liste (sinon : première image de la galerie) */
      vignette: image().optional(),
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

// Un fichier JSON par expertise dans src/content/expertises/ : une suite de sections typées
const bouton = z.object({ label: z.string(), href: z.string() });
const expertises = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/expertises" }),
  schema: ({ image }) => {
    const img = z.object({ src: image(), alt: z.string() });
    const section = z.discriminatedUnion("type", [
      z.object({ type: z.literal("intro"), titre: z.string(), paragraphes: z.array(z.string()), image: img }),
      z.object({
        type: z.literal("missions"),
        titre: z.string(),
        sousTitre: z.string(),
        items: z.array(z.object({ titre: z.string(), texte: z.string() })),
        objectif: z.string(),
      }),
      z.object({
        type: z.literal("pictos"),
        intro: z.string(),
        titre: z.string(),
        texte: z.string(),
        items: z.array(z.object({ image: img, texte: z.string() })),
        note: z.string(),
      }),
      z.object({
        type: z.literal("colonnes"),
        titre: z.string(),
        // chaque bloc : un paragraphe (texte) ou une liste (tableau de textes)
        colonnes: z.array(z.object({ titre: z.string(), contenu: z.array(z.union([z.string(), z.array(z.string())])) })),
      }),
      z.object({
        type: z.literal("pourquoi"),
        titre: z.string(),
        paragraphes: z.array(z.string()),
        atoutsLabel: z.string(),
        atouts: z.array(z.string()),
        conclusion: z.string(),
      }),
      z.object({ type: z.literal("cta"), titre: z.string(), texte: z.string(), bouton }),
      z.object({
        type: z.literal("realisations"),
        titre: z.string(),
        projets: z.array(z.object({ projet: z.string(), image: img })),
        bouton,
      }),
    ]);
    return z.object({
      ordre: z.number(),
      nom: z.string(),
      titre: z.string(),
      vignette: img,
      meta: z.object({ titre: z.string(), description: z.string() }),
      sections: z.array(section),
    });
  },
});

export const collections = { projets, expertises };
