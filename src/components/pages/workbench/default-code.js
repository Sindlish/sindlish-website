/**
 * The program the editor opens with on `/workbench` (issue #54).
 *
 * `?code=` overrides it: the URL parameter is the preload and share mechanism,
 * so this is only the fallback when no code was shared.
 */
export const DEFAULT_CODE = `# Sindlish Workbench
# Welcome to the first Sindhi programming language!
kaam Salam(naalo) {
  likh("Salam, " + naalo + "!")
}
# Variable declarations
lafz name = "Amanat"
adad version = 1
# Multi-line string
lafz intro = """Sindlish is a powerful language.
It is designed for the Sindhi community.
V0.1.1 is here!"""
Salam(name)
agar version == 1 {
  likh(intro)
} warna {
  likh("Unknown version")
}
`;

export default DEFAULT_CODE;
