export function tokenizer(s: string) {
  return (
    s
      // .replace(/([a-z])([A-Z])/g, "$1 $2") // Break CamelCase / pascalCase words
      .split(/[\W_+]/g) // Break on non-word chars
      .filter(Boolean) // Remove empty tokens
  );
}

export type Token = {
  text: string;
  start: number;
  end: number;
};

export type Match = {
  text: string;
  start: number;
  end: number;
};
