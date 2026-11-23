/** Link do ChatGPT já com a pergunta preenchida. */
export function linkChatGPT(assunto: string): string {
  const pergunta = `Me conte mais sobre isto, de forma simples e com curiosidades: ${assunto}`
  return `https://chatgpt.com/?q=${encodeURIComponent(pergunta)}`
}
