let replacements = [
  [/\*/g, "\\*"],
  [/#/g, "\\#"],
  [/\//g, "\\/"],
  [/\(/g, "\\("],
  [/\)/g, "\\)"],
  [/\[/g, "\\["],
  [/\]/g, "\\]"],
  [/</g, "&lt;"],
  [/>/g, "&gt;"],
  [/_/g, "\\_"],
  [/`/g, "\\`"],
  [/\$/g, "\\$"],
] as [RegExp, string][];

export function escapeMarkdown(string: string) {
  return replacements.reduce(
    (string: string, replacement) =>
      string.replace(replacement[0], replacement[1]),
    string
  );
}

let replacementsCode = [[/`/g, "\\`"]] as [RegExp, string][];

export function escapeMarkdownCode(string: string) {
  return replacementsCode.reduce(
    (string: string, replacement) =>
      string.replace(replacement[0], replacement[1]),
    string
  );
}
