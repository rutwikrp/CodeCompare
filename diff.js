function createDiff(oldText, newText) {
  if (!oldText && !newText) return { 
      left: { content: '', lineNumbers: '' }, 
      right: { content: '', lineNumbers: '' }
  };
  
  const oldLines = (oldText || '').split('\n');
  const newLines = (newText || '').split('\n');
  
  let leftContent = [], rightContent = [];
  let leftLineNumbers = [], rightLineNumbers = [];

  // Find the max number of lines to compare
  const maxLines = Math.max(oldLines.length, newLines.length);
  
  for (let i = 0; i < maxLines; i++) {
      // Line numbers (1-based)
      leftLineNumbers.push(`${i + 1}`);
      rightLineNumbers.push(`${i + 1}`);

      const oldLine = i < oldLines.length ? oldLines[i] : '';
      const newLine = i < newLines.length ? newLines[i] : '';

      if (oldLine !== newLine) {
          leftContent.push(`<div class="diff-removed">${highlightDiff(oldLine, newLine, 'removed')}</div>`);
          rightContent.push(`<div class="diff-added">${highlightDiff(newLine, oldLine, 'added')}</div>`);
      } else {
          leftContent.push(`<div>${escapeHtml(oldLine)}</div>`);
          rightContent.push(`<div>${escapeHtml(newLine)}</div>`);
      }
  }
  
  return { 
      left: { content: leftContent.join(''), lineNumbers: leftLineNumbers.join('<br>') }, 
      right: { content: rightContent.join(''), lineNumbers: rightLineNumbers.join('<br>') }
  };
}

// Highlights character-level differences
function highlightDiff(text1, text2, type) {
  const maxLength = Math.max(text1.length, text2.length);
  let result = '';

  for (let i = 0; i < maxLength; i++) {
      if (text1[i] !== text2[i]) {
          result += `<span class="diff-change">${escapeHtml(text1[i] || '')}</span>`;
      } else {
          result += escapeHtml(text1[i] || '');
      }
  }
  
  return result || '&nbsp;'; // Preserve empty lines
}

// Escapes HTML to prevent XSS
function escapeHtml(text) {
  return (text || '')
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}
