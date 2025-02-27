function getDiff(text1, text2) {
    let dmp = new diff_match_patch();
    let diffs = dmp.diff_main(text1, text2);
    dmp.diff_cleanupSemantic(diffs);
    
    let html = "";
    diffs.forEach(([type, text]) => {
        if (type === 1) {
            html += `<span style="background-color: #a6f3a6;">${text}</span>`; // Added
        } else if (type === -1) {
            html += `<span style="background-color: #f3a6a6; text-decoration: line-through;">${text}</span>`; // Removed
        } else {
            html += text; // Unchanged
        }
    });

    return html;
}
