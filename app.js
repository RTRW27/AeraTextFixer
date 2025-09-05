class TextFormatter {
    constructor() {
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeTheme();
        this.updateCharCount();
    }

    initializeElements() {
        // Theme toggle
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = this.themeToggle.querySelector('.theme-icon');
        
        // Text areas
        this.inputText = document.getElementById('inputText');
        this.outputText = document.getElementById('outputText');
        
        // Buttons
        this.processBtn = document.getElementById('processBtn');
        this.clearInput = document.getElementById('clearInput');
        this.copyResult = document.getElementById('copyResult');
        
        // File upload
        this.fileInput = document.getElementById('fileInput');
        this.fileUploadArea = document.getElementById('fileUploadArea');

        // Options
        this.formatOption = document.getElementById('formatOption');
        
        // Character counts
        this.inputCharCount = document.getElementById('inputCharCount');
        this.outputCharCount = document.getElementById('outputCharCount');
        
        // Toast
        this.toast = document.getElementById('toast');
        this.toastMessage = this.toast.querySelector('.toast-message');
    }

    initializeEventListeners() {
        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Text processing
        this.processBtn.addEventListener('click', () => this.processText());
        this.inputText.addEventListener('input', () => this.updateCharCount());
        
        // Clear functionality
        this.clearInput.addEventListener('click', () => this.clearAll());
        
        // Copy
        this.copyResult.addEventListener('click', () => this.copyToClipboard());
        
        // File upload
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.fileUploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.fileUploadArea.addEventListener('drop', (e) => this.handleFileDrop(e));
        this.fileUploadArea.addEventListener('dragleave', () => this.handleDragLeave());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Output text changes
        this.outputText.addEventListener('input', () => this.updateCharCount());
    }

    initializeTheme() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const defaultTheme = prefersDark ? 'dark' : 'light';
        this.setTheme(defaultTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-color-scheme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-color-scheme', theme);
        document.body.setAttribute('data-color-scheme', theme);
        this.themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
    }

    processText() {
        const inputValue = this.inputText.value.trim();
        
        if (!inputValue) {
            this.showToast('Please enter some text to process', 'error');
            return;
        }

        this.processBtn.classList.add('processing');
        this.processBtn.disabled = true;

        setTimeout(() => {
            const option = this.formatOption.value;
            let processedText;

            switch(option) {
                case 'single-to-double':
                    processedText = this.fixSingleToDouble(inputValue);
                    break;
                case 'double-to-single':
                    processedText = this.fixDoubleToSingle(inputValue);
                    break;
                default:
                    processedText = inputValue;
            }

            this.outputText.value = processedText;
            this.updateCharCount();
            
            this.processBtn.classList.remove('processing');
            this.processBtn.disabled = false;
            
            this.showToast('Text processed successfully!', 'success');
        }, 300);
    }

    fixSingleToDouble(text) {
        // 1. It first collapses any existing double newlines into single newlines.
        // 2. Then, it replaces every single newline with a double newline.
        return text.trim().replace(/\n\s*\n/g, '\n').replace(/\n/g, '\n\n');
    }
    
    fixDoubleToSingle(text) {
        // This collapses two or more newlines into a single newline.
        return text.replace(/\n\s*\n/g, '\n').trim();
    }

    updateCharCount() {
        const inputCount = this.inputText.value.length;
        const outputCount = this.outputText.value.length;
        
        this.inputCharCount.textContent = `${inputCount.toLocaleString()} characters`;
        this.outputCharCount.textContent = `${outputCount.toLocaleString()} characters`;
    }

    clearAll() {
        this.inputText.value = '';
        this.outputText.value = '';
        this.fileInput.value = '';
        this.updateCharCount();
        this.showToast('All text cleared', 'info');
    }

    async copyToClipboard() {
        const text = this.outputText.value;
        
        if (!text) {
            this.showToast('No text to copy', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Text copied to clipboard!', 'info');
        } catch (err) {
            this.showToast('Copy failed - please copy manually', 'error');
        }
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.readFile(file);
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        this.fileUploadArea.classList.add('dragover');
    }

    handleFileDrop(event) {
        event.preventDefault();
        this.fileUploadArea.classList.remove('dragover');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            this.readFile(files[0]);
        }
    }

    handleDragLeave() {
        this.fileUploadArea.classList.remove('dragover');
    }

    readFile(file) {
        if (!file.type.match('text.*') && !file.name.endsWith('.txt')) {
            this.showToast('Please select a text file (.txt)', 'error');
            return;
        }

        this.fileUploadArea.classList.add('loading');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.inputText.value = e.target.result;
            this.updateCharCount();
            this.fileUploadArea.classList.remove('loading');
            this.showToast('File loaded successfully!', 'info');
        };
        
        reader.onerror = () => {
            this.fileUploadArea.classList.remove('loading');
            this.showToast('Error reading file', 'error');
        };
        
        reader.readAsText(file, 'UTF-8');
    }

    handleKeyboardShortcuts(event) {
        if (event.ctrlKey && event.key === 'Enter') {
            event.preventDefault();
            this.processText();
            return;
        }
        
        if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'c') {
            event.preventDefault();
            this.copyToClipboard();
            return;
        }

        if (event.ctrlKey && event.key === 'r' && 
            !['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
            event.preventDefault();
            this.clearAll();
            return;
        }
    }

    showToast(message, type = 'info') {
        clearTimeout(this.toastTimeout);
        this.toast.className = 'toast';
        
        if (type) {
            this.toast.classList.add(type);
        }
        
        this.toastMessage.textContent = message;
        this.toast.classList.add('show');
        
        this.toastTimeout = setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TextFormatter();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}