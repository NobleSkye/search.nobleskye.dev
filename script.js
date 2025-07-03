function isValidUrl(string) {
    try {
        // Check if it looks like a domain name
        return /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(string) ||
               /^https?:\/\//i.test(string);
    } catch (_) {
        return false;
    }
}

function handleSearch(event) {
    event.preventDefault();
    let searchBar = document.getElementById('search-bar');
    let query = searchBar.value.trim();
    
    if (isValidUrl(query)) {
        // If it looks like a URL, add https:// if needed
        if (!/^https?:\/\//i.test(query)) {
            query = 'https://' + query;
        }
        navigate(query);
    } else {
        // If it's not a URL, search using SearXNG
        let searxSearchUrl = 'https://meow.skyesearch.cc/search?q=' + encodeURIComponent(query);
        navigate(searxSearchUrl);
    }
}

// Trigger the search when Enter is pressed
document.getElementById('search-bar').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        handleSearch(event);
    }
});

function navigate(url) {
    window.location.href = url;
}

// Cookie functions
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = name + '=' + encodeURIComponent(JSON.stringify(value)) + ';expires=' + expires.toUTCString() + ';path=/';
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
            try {
                return JSON.parse(decodeURIComponent(c.substring(nameEQ.length, c.length)));
            } catch(e) {
                return null;
            }
        }
    }
    return null;
}

// Default shortcuts
const defaultShortcuts = [
    { title: 'YouTube', url: 'https://youtube.com' },
    { title: 'Discord', url: 'https://www.discord.com/' },
    { title: 'Pyro Host', url: 'https://pyro.host/' },
    { title: 'GitHub', url: 'https://github.com/' },
    { title: 'Stack Overflow', url: 'https://stackoverflow.com/' },
    { title: 'T3 Chat', url: 'https://t3.chat/' }
];

let shortcuts = getCookie('shortcuts') || defaultShortcuts;
let editingIndex = -1;

function getFaviconUrl(url) {
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
        return '';
    }
}

function renderShortcuts() {
    const container = document.getElementById('shortcuts-grid');
    container.innerHTML = '';

    shortcuts.forEach((shortcut, index) => {
        const item = document.createElement('div');
        item.className = 'shortcut-item';
        item.innerHTML = `
            <div class="shortcut-favicon" style="background-image: url('${getFaviconUrl(shortcut.url)}')"></div>
            <div class="shortcut-title">${shortcut.title}</div>
        `;
        
        item.addEventListener('click', (e) => {
            // Prevent click when in editing mode or clicking on controls
            if (editingIndex === -1 && !e.target.closest('.shortcut-controls') && !e.target.closest('.shortcut-btn')) {
                window.open(shortcut.url, '_blank');
            }
        });

        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (editingIndex === -1) { // Only allow editing if not already editing
                editShortcut(index);
            }
        });

        container.appendChild(item);
    });

    // Add "Add new" button
    if (shortcuts.length < 12) {
        const addItem = document.createElement('div');
        addItem.className = 'shortcut-item add-new';
        addItem.innerHTML = '<div style="font-size: 24px;">+</div><div class="shortcut-title">Add New</div>';
        addItem.addEventListener('click', () => {
            if (editingIndex === -1) {
                addNewShortcut();
            }
        });
        container.appendChild(addItem);
    }
}

function editShortcut(index) {
    if (editingIndex !== -1) return;
    
    editingIndex = index;
    const container = document.getElementById('shortcuts-grid');
    const item = container.children[index];
    const shortcut = shortcuts[index];
    
    item.className = 'shortcut-item editing';
    item.innerHTML = `
        <input type="text" class="shortcut-title-input" value="${shortcut.title}" placeholder="Title">
        <input type="text" class="shortcut-input" value="${shortcut.url}" placeholder="URL">
        <div class="shortcut-controls show">
            <button class="shortcut-btn save" onclick="saveShortcut(${index})">Save</button>
            <button class="shortcut-btn cancel" onclick="cancelEdit()">Cancel</button>
            <button class="shortcut-btn delete" onclick="deleteShortcut(${index})">Delete</button>
        </div>
    `;
}

function addNewShortcut() {
    if (editingIndex !== -1) return;
    
    const newShortcut = { title: '', url: '' };
    shortcuts.push(newShortcut);
    editingIndex = shortcuts.length - 1;
    renderShortcuts();
    
    const container = document.getElementById('shortcuts-grid');
    const item = container.children[editingIndex];
    
    item.className = 'shortcut-item editing';
    item.innerHTML = `
        <input type="text" class="shortcut-title-input" value="" placeholder="Title">
        <input type="text" class="shortcut-input" value="" placeholder="URL">
        <div class="shortcut-controls show">
            <button class="shortcut-btn save" onclick="saveShortcut(${editingIndex})">Save</button>
            <button class="shortcut-btn cancel" onclick="cancelEdit()">Cancel</button>
        </div>
    `;
}

function saveShortcut(index) {
    const container = document.getElementById('shortcuts-grid');
    const item = container.children[index];
    const titleInput = item.querySelector('.shortcut-title-input');
    const urlInput = item.querySelector('.shortcut-input');
    
    const title = titleInput.value.trim();
    const url = urlInput.value.trim();
    
    if (!title || !url) {
        alert('Please enter both title and URL');
        return;
    }
    
    // Add protocol if missing
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        finalUrl = 'https://' + url;
    }
    
    shortcuts[index] = { title, url: finalUrl };
    setCookie('shortcuts', shortcuts, 365);
    editingIndex = -1;
    renderShortcuts();
}

function deleteShortcut(index) {
    if (confirm('Are you sure you want to delete this shortcut?')) {
        shortcuts.splice(index, 1);
        setCookie('shortcuts', shortcuts, 365);
        editingIndex = -1;
        renderShortcuts();
    }
}

function cancelEdit() {
    if (editingIndex === shortcuts.length - 1 && !shortcuts[editingIndex].title && !shortcuts[editingIndex].url) {
        shortcuts.pop();
    }
    editingIndex = -1;
    renderShortcuts();
}

function autoFocusSearch() {
    const searchBar = document.getElementById('search-bar');
    
    // Focus on page load
    searchBar.focus();
    
    // Re-focus when window gains focus
    window.addEventListener('focus', () => {
        setTimeout(() => {
            searchBar.focus();
        }, 100);
    });
    
    // Re-focus when clicking anywhere on the page (except on interactive elements)
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.shortcut-item') && 
            !e.target.closest('.search-button') && 
            !e.target.closest('.about-button') &&
            !e.target.closest('a') &&
            !e.target.closest('input') &&
            !e.target.closest('button') &&
            !e.target.closest('.greeting') &&
            !e.target.closest('.weather')) {
            searchBar.focus();
        }
    });
    
    // Re-focus when pressing Escape (only if command popup is not open)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.getElementById('command-overlay').style.display !== 'flex') {
            document.getElementById('search-bar').focus();
            document.getElementById('search-bar').select();
        }
    });
}

// Clock functionality
function initializeClock() {
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('clock').textContent = timeString;
    }
    
    updateClock();
    setInterval(updateClock, 1000);
}

// Greeting functionality
function initializeGreeting() {
    const now = new Date();
    const hour = now.getHours();
    let greeting;
    
    if (hour < 12) {
        greeting = "Good morning";
    } else if (hour < 18) {
        greeting = "Good afternoon";
    } else {
        greeting = "Good evening";
    }
    
    // Try to get user's name from localStorage
    const userName = localStorage.getItem('userName');
    if (userName) {
        greeting += `, ${userName}`;
    }
    
    document.getElementById('greeting').textContent = greeting;
    
    // Allow user to set their name by clicking on greeting
    document.getElementById('greeting').addEventListener('click', () => {
        const name = prompt('What\'s your name?');
        if (name && name.trim()) {
            localStorage.setItem('userName', name.trim());
            initializeGreeting();
        }
    });
}

// Weather functionality (placeholder)
function initializeWeather() {
    const weatherElement = document.getElementById('weather');
    const savedLocation = localStorage.getItem('weatherLocation');
    
    if (savedLocation) {
        weatherElement.innerHTML = `🌤️ ${savedLocation}<br><small>Weather updates</small>`;
    } else {
        weatherElement.innerHTML = '🌤️ Weather<br><small>Click to set location</small>';
    }
    
    weatherElement.addEventListener('click', () => {
        const location = prompt('Enter your city for weather updates:');
        if (location && location.trim()) {
            localStorage.setItem('weatherLocation', location.trim());
            initializeWeather();
        }
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape to open command popup (unless search bar is focused)
    if (e.key === 'Escape') {
        e.preventDefault();
        if (document.getElementById('command-overlay').style.display === 'flex') {
            closeCommandPopup();
        } else {
            openCommandPopup();
        }
        return;
    }
    
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-bar').focus();
        document.getElementById('search-bar').select();
    }
    
    // Alt + 1-9 to open shortcuts
    if (e.altKey && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (shortcuts[index]) {
            window.open(shortcuts[index].url, '_blank');
        }
    }
});

// Command Popup functionality
const aiProviders = [
    { name: 'Claude', url: 'https://claude.ai/', icon: '🤖' },
    { name: 'ChatGPT', url: 'https://chatgpt.com/', icon: '💬' },
    { name: 'T3 Chat', url: 'https://t3.chat/', icon: '🚀' },
    { name: 'Perplexity', url: 'https://perplexity.ai/', icon: '🔍' },
    { name: 'Gemini', url: 'https://gemini.google.com/', icon: '✨' },
    { name: 'Character.AI', url: 'https://character.ai/', icon: '🎭' },
    { name: 'Poe', url: 'https://poe.com/', icon: '🧠' },
    { name: 'You.com', url: 'https://you.com/', icon: '🌐' },
    { name: 'Bing Chat', url: 'https://bing.com/chat', icon: '🔷' },
    { name: 'HuggingFace Chat', url: 'https://huggingface.co/chat/', icon: '🤗' }
];

const commands = [
    { name: 'Open AI Chat', icon: '🤖', action: 'ai-chat', subtitle: 'Choose an AI provider' },
    { name: 'Add Custom AI Provider', icon: '➕', action: 'add-provider', subtitle: 'Add your own AI chat service' },
    { name: 'Reset Privacy Settings', icon: '🔄', action: 'reset-privacy', subtitle: 'Reset AI privacy acknowledgment' },
    { name: 'Focus Search', icon: '🔍', action: 'focus-search', subtitle: 'Focus on the search bar' },
    { name: 'Add New Shortcut', icon: '📌', action: 'add-shortcut', subtitle: 'Add a new quick access shortcut' },
    { name: 'Settings', icon: '⚙️', action: 'settings', subtitle: 'Manage your preferences' }
];

let selectedCommandIndex = 0;
let currentCommands = [];
let isAIProviderSelection = false;

function openCommandPopup() {
    document.getElementById('command-overlay').style.display = 'flex';
    document.getElementById('command-input').focus();
    document.getElementById('command-input').value = '';
    isAIProviderSelection = false;
    updateCommandResults('');
}

function closeCommandPopup() {
    document.getElementById('command-overlay').style.display = 'none';
    document.getElementById('privacy-warning').style.display = 'none';
    document.getElementById('search-bar').focus();
}

function updateCommandResults(query) {
    const resultsContainer = document.getElementById('command-results');
    selectedCommandIndex = 0;
    
    if (isAIProviderSelection) {
        // Show AI providers
        currentCommands = aiProviders.filter(provider => 
            provider.name.toLowerCase().includes(query.toLowerCase())
        );
        
        resultsContainer.innerHTML = currentCommands.map((provider, index) => `
            <div class="command-item ${index === selectedCommandIndex ? 'selected' : ''}" onclick="selectAIProvider('${provider.url}', '${provider.name}')">
                <div class="command-icon">${provider.icon}</div>
                <div class="command-text">
                    <div class="command-title">${provider.name}</div>
                    <div class="command-subtitle">Open ${provider.name} in iframe</div>
                </div>
            </div>
        `).join('');
        
        // Check if user has already acknowledged privacy
        const privacyAcknowledged = localStorage.getItem('aiPrivacyAcknowledged') === 'true';
        if (!privacyAcknowledged) {
            document.getElementById('privacy-warning').style.display = 'block';
            document.getElementById('privacy-checkbox').checked = false;
        } else {
            document.getElementById('privacy-warning').style.display = 'none';
        }
    } else {
        // Show regular commands
        currentCommands = commands.filter(cmd => 
            cmd.name.toLowerCase().includes(query.toLowerCase()) ||
            cmd.subtitle.toLowerCase().includes(query.toLowerCase())
        );
        
        resultsContainer.innerHTML = currentCommands.map((cmd, index) => `
            <div class="command-item ${index === selectedCommandIndex ? 'selected' : ''}" onclick="executeCommand('${cmd.action}')">
                <div class="command-icon">${cmd.icon}</div>
                <div class="command-text">
                    <div class="command-title">${cmd.name}</div>
                    <div class="command-subtitle">${cmd.subtitle}</div>
                </div>
            </div>
        `).join('');
        
        document.getElementById('privacy-warning').style.display = 'none';
    }
}

function executeCommand(action) {
    switch(action) {
        case 'ai-chat':
            isAIProviderSelection = true;
            document.getElementById('command-input').value = '';
            updateCommandResults('');
            break;
        case 'add-provider':
            addCustomAIProvider();
            break;
        case 'reset-privacy':
            resetPrivacySettings();
            break;
        case 'focus-search':
            closeCommandPopup();
            document.getElementById('search-bar').focus();
            break;
        case 'add-shortcut':
            closeCommandPopup();
            addNewShortcut();
            break;
        case 'settings':
            alert('Settings panel coming soon!');
            closeCommandPopup();
            break;
    }
}

function selectAIProvider(url, name) {
    const privacyAcknowledged = localStorage.getItem('aiPrivacyAcknowledged') === 'true';
    
    if (!privacyAcknowledged) {
        const checkbox = document.getElementById('privacy-checkbox');
        if (!checkbox.checked) {
            alert('Please acknowledge the privacy warning before proceeding.');
            return;
        }
        // Save privacy acknowledgment and hide the warning
        localStorage.setItem('aiPrivacyAcknowledged', 'true');
    }
    
    closeCommandPopup();
    openAIChat(url, name);
}

function resetPrivacySettings() {
    localStorage.removeItem('aiPrivacyAcknowledged');
    closeCommandPopup();
    alert('Privacy settings have been reset. You will see the privacy warning again when accessing AI providers.');
}

function addCustomAIProvider() {
    const name = prompt('Enter the name of the AI provider:');
    if (!name) return;
    
    const url = prompt('Enter the URL of the AI provider:');
    if (!url) return;
    
    const icon = prompt('Enter an emoji icon for the provider:') || '🤖';
    
    // Add to providers list
    aiProviders.push({ name, url, icon });
    
    // Save to localStorage
    localStorage.setItem('customAIProviders', JSON.stringify(aiProviders.slice(3))); // Save only custom ones
    
    closeCommandPopup();
    alert(`Added ${name} to AI providers!`);
}

function openAIChat(url, name) {
    document.getElementById('ai-iframe-container').style.display = 'flex';
    document.getElementById('ai-iframe').src = url;
    document.getElementById('ai-iframe-title').textContent = name;
}

function closeAIChat() {
    document.getElementById('ai-iframe-container').style.display = 'none';
    document.getElementById('ai-iframe').src = '';
    document.getElementById('search-bar').focus();
}

// Command popup input handling
document.getElementById('command-input').addEventListener('input', (e) => {
    updateCommandResults(e.target.value);
});

document.getElementById('command-input').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedCommandIndex = Math.min(selectedCommandIndex + 1, currentCommands.length - 1);
        updateCommandResults(document.getElementById('command-input').value);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedCommandIndex = Math.max(selectedCommandIndex - 1, 0);
        updateCommandResults(document.getElementById('command-input').value);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (currentCommands[selectedCommandIndex]) {
            if (isAIProviderSelection) {
                const provider = currentCommands[selectedCommandIndex];
                selectAIProvider(provider.url, provider.name);
            } else {
                executeCommand(currentCommands[selectedCommandIndex].action);
            }
        }
    }
});

// Click outside to close
document.getElementById('command-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('command-overlay')) {
        closeCommandPopup();
    }
});

document.getElementById('ai-iframe-container').addEventListener('click', (e) => {
    if (e.target === document.getElementById('ai-iframe-container')) {
        closeAIChat();
    }
});

// Commit info functionality
async function loadCommitInfo() {
    try {
        // Try to fetch from GitHub API
        const response = await fetch('https://api.github.com/repos/YOUR_USERNAME/search.nobleskye.dev/commits?per_page=1');
        
        if (response.ok) {
            const commits = await response.json();
            if (commits.length > 0) {
                const latestCommit = commits[0];
                const shortHash = latestCommit.sha.substring(0, 7);
                const date = new Date(latestCommit.commit.author.date);
                const timeAgo = getTimeAgo(date);
                
                document.getElementById('commit-hash').textContent = shortHash;
                document.getElementById('commit-date').textContent = timeAgo;
                
                // Store full commit info for details
                window.latestCommitInfo = {
                    hash: latestCommit.sha,
                    shortHash: shortHash,
                    message: latestCommit.commit.message,
                    author: latestCommit.commit.author.name,
                    date: date,
                    url: latestCommit.html_url
                };
                return;
            }
        }
    } catch (error) {
        console.log('Could not fetch from GitHub API, using fallback');
    }
    
    // Fallback: Use a manual commit info or build timestamp
    const buildDate = new Date('2025-06-27T12:00:00Z'); // Update this when deploying
    const buildHash = 'local-' + Math.random().toString(36).substr(2, 7);
    
    document.getElementById('commit-hash').textContent = buildHash;
    document.getElementById('commit-date').textContent = getTimeAgo(buildDate);
    
    window.latestCommitInfo = {
        hash: buildHash,
        shortHash: buildHash,
        message: 'Local development build',
        author: 'Developer',
        date: buildDate,
        url: '#'
    };
}

function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
}

function showCommitDetails() {
    if (window.latestCommitInfo) {
        const info = window.latestCommitInfo;
        const message = `Latest Commit Details:
        
Hash: ${info.hash}
Author: ${info.author}
Date: ${info.date.toLocaleString()}
Message: ${info.message}

Click OK to view on GitHub (if available)`;
        
        if (confirm(message) && info.url !== '#') {
            window.open(info.url, '_blank');
        }
    } else {
        alert('Commit information not yet loaded.');
    }
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
    renderShortcuts();
    initializeClock();
    initializeGreeting();
    initializeWeather();
    autoFocusSearch();
    loadCommitInfo();
    
    // Load custom AI providers
    const customProviders = localStorage.getItem('customAIProviders');
    if (customProviders) {
        try {
            const providers = JSON.parse(customProviders);
            aiProviders.push(...providers);
        } catch (e) {
            console.error('Failed to load custom AI providers:', e);
        }
    }
});
