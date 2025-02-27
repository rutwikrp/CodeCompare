function createDiff(oldText, newText) {
    if (!oldText && !newText) return { 
      left: { content: '', lineNumbers: '' }, 
      right: { content: '', lineNumbers: '' }
    };
    
    const oldLines = (oldText || '').split('\n');
    const newLines = (newText || '').split('\n');
    
    let leftContent = '';
    let rightContent = '';
    let leftLineNumbers = '';
    let rightLineNumbers = '';
    
    // Simple line-by-line diff
    const maxLines = Math.max(oldLines.length, newLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      // Line numbers (1-based)
      leftLineNumbers += `${i + 1}<br>`;
      rightLineNumbers += `${i + 1}<br>`;
      
      const oldLine = i < oldLines.length ? oldLines[i] : '';
      const newLine = i < newLines.length ? newLines[i] : '';
      
      if (oldLine !== newLine) {
        leftContent += `<div class="diff-removed">${escapeHtml(oldLine)}</div>`;
        rightContent += `<div class="diff-added">${escapeHtml(newLine)}</div>`;
      } else {
        leftContent += `<div>${escapeHtml(oldLine)}</div>`;
        rightContent += `<div>${escapeHtml(newLine)}</div>`;
      }
    }
    
    return { 
      left: { content: leftContent, lineNumbers: leftLineNumbers }, 
      right: { content: rightContent, lineNumbers: rightLineNumbers }
    };
  }
  
  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }