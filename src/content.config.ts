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

// Sections typées, communes aux expertises et aux pages « agence »
const bouton = z.object({ label: z.string(), href: z.string() });
const meta = z.object({ titre: z.string(), description: z.string() });

function sectionSchema(image: () => z.ZodTypeAny) {
  const img = z.object({ src: image(), alt: z.string() });
  return z.discriminatedUnion("type", [
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
    z.object({ type: z.literal("chapo"), surtitre: z.string(), paragraphes: z.array(z.string()) }),
    z.object({ type: z.literal("texte"), titre: z.string().optional(), paragraphes: z.array(z.string()) }),
    z.object({
      type: z.literal("faq"),
      // media : chemin d'une vidéo (.mp4) ou d'une image animée (.webp, avec sa version « -fixe.webp ») dans public/
      items: z.array(z.object({ question: z.string(), reponse: z.string(), media: z.string().nullable() })),
    }),
    z.object({ type: z.literal("partenaire"), image: img, texte: z.string(), nom: z.string(), bouton }),
    z.object({ type: z.literal("telechargement"), bouton, format: z.string() }),
    z.object({
      type: z.literal("manifeste"),
      texte: z.string(),
      image: img,
      duo: z.tuple([z.string(), z.string()]),
      liaison: z.string(),
      conclusion: z.string(),
    }),
    z.object({ type: z.literal("appel"), fond: z.enum(["bleu-clair", "bleu-fonce"]), titre: z.string(), bouton }),
    z.object({ type: z.literal("valeurs"), items: z.array(z.object({ titre: z.string(), texte: z.string(), image: img })) }),
    z.object({
      type: z.literal("engagements"),
      items: z.array(
        z.object({
          titre: z.string(),
          sousTitre: z.string(),
          image: img,
          accordeon: z.array(z.object({ question: z.string(), reponse: z.string() })),
          liste: z.array(z.string()),
        }),
      ),
    }),
    z.object({
      type: z.literal("equipe"),
      titre: z.string(),
      membres: z.array(z.object({ nom: z.string(), role: z.string(), linkedin: z.string().url(), photo: img })),
      postuler: z.object({ texte: z.string(), label: z.string(), href: z.string(), image: img }),
    }),
    z.object({ type: z.literal("photos"), titre: z.string(), images: z.array(img) }),
  ]);
}

// Un fichier JSON par expertise dans src/content/expertises/
const expertises = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/expertises" }),
  schema: ({ image }) =>
    z.object({
      ordre: z.number(),
      nom: z.string(),
      titre: z.string(),
      vignette: z.object({ src: image(), alt: z.string() }),
      meta,
      sections: z.array(sectionSchema(image)),
    }),
});

// Pages composées de sections (raison d'être, engagements, valeurs, nous, politique de confidentialité, CGV) :
// un JSON par page dans src/content/agence/
const agence = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/agence" }),
  schema: ({ image }) => z.object({ meta, titre: z.string(), sections: z.array(sectionSchema(image)) }),
});

// Pages de texte long en Markdown (mentions légales) : src/content/legal/
const legal = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/legal" }),
  schema: z.object({ titre: z.string(), meta }),
});

export const collections = { projets, expertises, agence, legal };
