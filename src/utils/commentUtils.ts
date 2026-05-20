export function parseCommentLines(text: string): string[] {
  if (!text) return [];
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function countCommentLines(text: string): number {
  return parseCommentLines(text).length;
}

export function validateCommentLines(text: string, expectedQuantity: number): {
  valid: boolean;
  message?: string;
  lines: string[];
  count: number;
  expected: number;
} {
  const lines = parseCommentLines(text);

  if (lines.length === 0) {
    return {
      valid: false,
      message: 'Informe os comentários, um por linha',
      lines,
      count: 0,
      expected: expectedQuantity,
    };
  }

  if (lines.length !== expectedQuantity) {
    return {
      valid: false,
      message: `Você deve escrever exatamente ${expectedQuantity} comentário(s), um por linha. Você informou ${lines.length}.`,
      lines,
      count: lines.length,
      expected: expectedQuantity,
    };
  }

  return { valid: true, lines, count: lines.length, expected: expectedQuantity };
}

/** Impede digitar mais linhas que o limite do pacote */
export function limitCommentTextInput(value: string, maxLines: number): string {
  const parts = value.split('\n');
  if (parts.length <= maxLines) return value;
  return parts.slice(0, maxLines).join('\n');
}
