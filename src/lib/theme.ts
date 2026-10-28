// Transforme le thème d'un projet (fichier Markdown) en variables CSS
// qui remplacent, sur sa page uniquement, celles de src/styles/tokens.css.

interface Theme {
  fond: string;
  texte: string;
  bouton?: { fond: string; texte: string };
}

/** true si la couleur est claire (pour choisir les logos adaptés au fond) */
export function estClair(hex: string): boolean {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.6;
}

export function themeVars({ fond, texte, bouton }: Theme): string {
  const vars = {
    "--header-fond": fond,
    "--header-fond-scroll": fond,
    "--header-texte": texte,
    "--header-bordure": texte,
    "--nav-survol": texte,
    "--logo-couleur": texte,
    "--logo-accent": texte,
    "--footer-fond": fond,
    "--footer-texte": texte,
    "--footer-lien": texte,
    "--footer-survol": texte,
    "--projet-fond": fond,
    "--projet-texte": texte,
    // Le bandeau d'appel à l'action inverse les couleurs de la page
    "--bandeau-fond": texte,
    "--bandeau-texte": fond,
    "--bouton-fond": bouton?.fond ?? fond,
    "--bouton-texte": bouton?.texte ?? texte,
  };
  return Object.entries(vars)
    .map(([k, v]) => `${k}: ${v}`)
    .join("; ");
}

/** "référencementnaturel" → "referencementnaturel" (pour les adresses de tri) */
export function slugTag(tag: string): string {
  return tag
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}
