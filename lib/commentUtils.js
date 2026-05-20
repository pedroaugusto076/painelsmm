/**
 * Cada linha não vazia = um comentário.
 */
export function parseCommentLines(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function validateCommentLines(text, expectedQuantity) {
  const lines = parseCommentLines(text);
  const qty = Number(expectedQuantity);

  if (!Number.isFinite(qty) || qty < 1) {
    return { valid: false, message: 'Quantidade de comentários inválida', lines };
  }

  if (lines.length === 0) {
    return {
      valid: false,
      message: 'Informe os comentários, um por linha',
      lines,
      count: 0,
      expected: qty,
    };
  }

  if (lines.length !== qty) {
    return {
      valid: false,
      message: `Você deve escrever exatamente ${qty} comentário(s), um por linha. Você informou ${lines.length}.`,
      lines,
      count: lines.length,
      expected: qty,
    };
  }

  return {
    valid: true,
    lines,
    payload: lines.join('\n'),
    count: lines.length,
    expected: qty,
  };
}

/** Payload para API do fornecedor (Custom Comments) */
export function buildCommentsPayload(commentText) {
  return parseCommentLines(commentText).join('\n');
}
