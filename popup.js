document.addEventListener('DOMContentLoaded', function() {
    const codeInput = document.getElementById('code-input');
    const inputLineNumbers = document.getElementById('input-line-numbers');
    const versionName = document.getElementById('version-name');
    const saveBtn = document.getElementById('save-btn');
    const compareBtn = document.getElementById('compare-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const clearBtn = document.getElementById('clear-btn');
    const savedVersions = document.getElementById('saved-versions');
    const diffScroll = document.getElementById('diff-scroll');
    const leftContent = document.getElementById('left-content');
    const rightContent = document.getElementById('right-content');
    const leftLineNumbers = document.getElementById('left-line-numbers');
    const rightLineNumbers = document.getElementById('right-line-numbers');
    const statusMessage = document.getElementById('status-message');
    
    const leftPanel = document.querySelector(".diff-panel:first-child");
    const rightPanel = document.querySelector(".diff-panel:last-child");

    let selectedVersions = [];  

    // Initialize line numbers for input area
    updateInputLineNumbers();

    // Code input events for line numbers
    codeInput.addEventListener('input', updateInputLineNumbers);
    codeInput.addEventListener('scroll', function() {
      inputLineNumbers.scrollTop = this.scrollTop;
    });

    // Synchronize scrolling for the diff panels
    function syncScroll(event) {
        if (event.target === leftPanel) {
            rightPanel.scrollTop = leftPanel.scrollTop;
            rightPanel.scrollLeft = leftPanel.scrollLeft;
        } else {
            leftPanel.scrollTop = rightPanel.scrollTop;
            leftPanel.scrollLeft = rightPanel.scrollLeft;
        }
    }

    leftPanel.addEventListener("scroll", syncScroll);
    rightPanel.addEventListener("scroll", syncScroll);

    // Synchronize line number scrolling with diff view
    diffScroll.addEventListener('scroll', function() {
      leftLineNumbers.style.top = -this.scrollTop + 'px';
      rightLineNumbers.style.top = -this.scrollTop + 'px';
    });

    function updateInputLineNumbers() {
      const lines = codeInput.value.split('\n').length;
      let lineNumbersHTML = '';
      
      for (let i = 1; i <= lines; i++) {
        lineNumbersHTML += i + '<br>';
      }
      
      // Always show at least one line number
      if (lines === 0) {
        lineNumbersHTML = '1<br>';
      }
      
      inputLineNumbers.innerHTML = lineNumbersHTML;
    }

    // Load saved code versions
    loadCodeVersions();

    saveBtn.addEventListener('click', function() {
      const code = codeInput.value.trim();
      if (!code) {
        showMessage("Please enter some code to save.");
        return;
      }
      
      let name = versionName.value.trim();
      if (!name) {
        name = "Untitled - " + new Date().toLocaleTimeString();
      }
      
      saveCodeVersion(code, name);
      showMessage("Code saved successfully!");
      codeInput.value = '';
      versionName.value = '';
      updateInputLineNumbers();
    });

    clearBtn.addEventListener('click', function() {
      if (confirm("Are you sure you want to delete all saved versions?")) {
        chrome.storage.local.set({codeVersions: []}, function() {
          loadCodeVersions();
          leftContent.innerHTML = '';
          rightContent.innerHTML = '';
          leftLineNumbers.innerHTML = '';
          rightLineNumbers.innerHTML = '';
          updateButtonStates();
          showMessage("All versions cleared!");
        });
      }
    });

    compareBtn.addEventListener('click', function() {
      if (selectedVersions.length !== 2) {
        showMessage("Please select exactly 2 versions to compare.");
        return;
      }
      
      chrome.storage.local.get(['codeVersions'], function(result) {
        const versions = result.codeVersions || [];
        const code1 = versions.find(v => v.id === selectedVersions[0])?.code || '';
        const code2 = versions.find(v => v.id === selectedVersions[1])?.code || '';
        
        const diff = createDiff(code1, code2);
        leftContent.innerHTML = diff.left.content;
        rightContent.innerHTML = diff.right.content;
        leftLineNumbers.innerHTML = diff.left.lineNumbers;
        rightLineNumbers.innerHTML = diff.right.lineNumbers;
        
        // Reset scroll position
        diffScroll.scrollTop = 0;
      });
    });

    deleteBtn.addEventListener('click', function() {
      if (selectedVersions.length === 0) {
        showMessage("Please select at least one version to delete.");
        return;
      }
      
      if (confirm(`Are you sure you want to delete ${selectedVersions.length} selected version(s)?`)) {
        chrome.storage.local.get(['codeVersions'], function(result) {
          let versions = result.codeVersions || [];
          versions = versions.filter(v => !selectedVersions.includes(v.id));
          
          chrome.storage.local.set({codeVersions: versions}, function() {
            loadCodeVersions();
            leftContent.innerHTML = '';
            rightContent.innerHTML = '';
            leftLineNumbers.innerHTML = '';
            rightLineNumbers.innerHTML = '';
            selectedVersions = [];
            updateButtonStates();
            showMessage("Selected versions deleted!");
          });
        });
      }
    });

    function loadCodeVersions() {
      chrome.storage.local.get(['codeVersions'], function(result) {
        const versions = result.codeVersions || [];
        savedVersions.innerHTML = '';
        selectedVersions = [];
        
        if (versions.length === 0) {
          const emptyMsg = document.createElement('div');
          emptyMsg.className = 'version-item';
          emptyMsg.textContent = 'No saved versions yet. Paste code and click "Save Current Code".';
          emptyMsg.style.fontStyle = 'italic';
          emptyMsg.style.color = '#777';
          savedVersions.appendChild(emptyMsg);
        } else {
          versions.forEach(function(version) {
            const versionElement = document.createElement('div');
            versionElement.className = 'version-item';
            versionElement.dataset.id = version.id;
            versionElement.innerHTML = `
              <strong>${version.name}</strong><br>
              <small>${version.timestamp} (${version.code.length} chars, ${version.code.split('\n').length} lines)</small>
            `;
            
            versionElement.addEventListener('click', function() {
              toggleVersionSelection(version.id, versionElement);
            });
            
            savedVersions.appendChild(versionElement);
          });
        }
        
        updateButtonStates();
      });
    }

    function toggleVersionSelection(id, element) {
      const index = selectedVersions.indexOf(id);
      
      if (index === -1) {
        // If we already have 2 selected versions, deselect the first one
        if (selectedVersions.length >= 2) {
          const oldElement = document.querySelector(`.version-item[data-id="${selectedVersions[0]}"]`);
          if (oldElement) {
            oldElement.classList.remove('selected');
          }
          selectedVersions.shift();
        }
        
        selectedVersions.push(id);
        element.classList.add('selected');
      } else {
        selectedVersions.splice(index, 1);
        element.classList.remove('selected');
      }
      
      updateButtonStates();
    }

    function updateButtonStates() {
      compareBtn.disabled = selectedVersions.length !== 2;
      deleteBtn.disabled = selectedVersions.length === 0;
      
      compareBtn.textContent = `Compare Selected (${selectedVersions.length})`;
      deleteBtn.textContent = `Delete Selected (${selectedVersions.length})`;
    }

    function saveCodeVersion(code, name) {
      chrome.storage.local.get(['codeVersions'], function(result) {
        const versions = result.codeVersions || [];
        const newVersion = {
          id: Date.now().toString(),
          name: name,
          timestamp: new Date().toLocaleString(),
          code: code
        };
        
        versions.push(newVersion);
        chrome.storage.local.set({codeVersions: versions}, function() {
          loadCodeVersions();
        });
      });
    }

    function showMessage(message) {
      statusMessage.textContent = message;
      setTimeout(() => { statusMessage.textContent = ""; }, 3000);
    }
});
