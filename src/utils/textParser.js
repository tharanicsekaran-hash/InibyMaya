/**
 * Converts Markdown and HTML rich text markup into clean, styled HTML
 */
export function renderRichTextHtml(markdownOrHtml) {
  if (!markdownOrHtml) return '';

  let text = String(markdownOrHtml).trim();

  // If it's pure HTML tags without markdown, return cleaned HTML
  if (/<(h[1-6]|p|div|span|ul|ol|li|blockquote|strong|b|em|i|img)\b[^>]*>/i.test(text) && !text.includes('# ') && !text.includes('**')) {
    return text;
  }

  // Normalize line breaks
  text = text.replace(/\r\n/g, '\n');

  // Headers
  text = text
    .replace(/^# (.*$)/gim, '<h1 class="rich-h1">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="rich-h2">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="rich-h3">$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4 class="rich-h4">$1</h4>');

  // Bold & Italic
  text = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>');

  // Blockquotes
  text = text.replace(/^> (.*$)/gim, '<blockquote class="rich-quote">$1</blockquote>');

  // Bullet Lists
  text = text.replace(/^\s*[\-\*] (.*$)/gim, '<li class="rich-li">$1</li>');

  // Images: ![alt](url)
  text = text.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="rich-img" />');

  // Links: [text](url)
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener" class="rich-link">$1</a>');

  // Group adjacent <li> into <ul>
  text = text.replace(/(<li class="rich-li">[\s\S]*?<\/li>)+/g, (match) => `<ul class="rich-ul">${match}</ul>`);

  // Split into paragraphs by double newlines
  const blocks = text.split(/\n{2,}/);
  const formattedBlocks = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (
      trimmed.startsWith('<h1') || 
      trimmed.startsWith('<h2') || 
      trimmed.startsWith('<h3') || 
      trimmed.startsWith('<h4') || 
      trimmed.startsWith('<ul') || 
      trimmed.startsWith('<ol') || 
      trimmed.startsWith('<blockquote') || 
      trimmed.startsWith('<img')
    ) {
      return trimmed;
    }
    return `<p class="rich-p">${trimmed.replace(/\n/g, '<br />')}</p>`;
  });

  return formattedBlocks.join('');
}
