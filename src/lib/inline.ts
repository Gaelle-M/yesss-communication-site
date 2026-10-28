/**
 * Balisage léger utilisé dans les fichiers de contenu (JSON) :
 *   **gras**   *italique*   [lien](/adresse/)   \ (retour à la ligne)
 *   {bleu:mot}   {jaune:mot}   {script:mot}   {script jaune:mot}
 * Le texte est d'abord échappé : aucun HTML ne peut être injecté depuis le contenu.
 */
const echapper = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function inline(texte: string): string {
  let s = echapper(texte);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
    const externe = /^https?:\/\//.test(href);
    return `<a href="${href}"${externe ? ' target="_blank" rel="noopener"' : ""}>${label}</a>`;
  });
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // {marques:texte}, du plus intérieur au plus extérieur
  let avant;
  do {
    avant = s;
    s = s.replace(/\{([a-z ]+):([^{}]*)\}/g, (_, marques: string, contenu) => {
      const classes = marques.trim().split(/\s+/).map((m) => `txt-${m}`).join(" ");
      return `<span class="${classes}">${contenu}</span>`;
    });
  } while (s !== avant);
  return s.replace(/\s*\\\s*/g, "<br />");
}

/** Version texte brut (pour un attribut alt, un title…) */
export function texteBrut(texte: string): string {
  return texte
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*?(.+?)\*\*?/g, "$1")
    .replace(/\{[a-z ]+:([^{}]*)\}/g, "$1")
    .replace(/\s*\\\s*/g, " ")
    .trim();
}
