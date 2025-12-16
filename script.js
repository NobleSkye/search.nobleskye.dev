document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.querySelector('.search-form');
    searchForm.addEventListener('submit', handleSearch);

    const searchBar = document.querySelector('.search-bar');
    searchBar.addEventListener('input', debounce(checkHealth, 500));

    checkHealth();
});

function handleSearch(event) {
    event.preventDefault();
    const searchBar = document.querySelector('.search-bar');
    const query = searchBar.value.trim();
    if (query) {
        const searchUrl = 'https://meow.skyesearch.cc/search?q=' + encodeURIComponent(query);
        window.location.href = searchUrl;
    }
}

let healthCheckController;

async function checkHealth() {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = 'status: checking...';
    statusDiv.className = '';

    try {
        if (healthCheckController) {
            healthCheckController.abort();
        }
        healthCheckController = new AbortController();
        const signal = healthCheckController.signal;

        await fetch('https://meow.skyesearch.cc/', {
            method: 'HEAD',
            mode: 'no-cors',
            signal: signal
        });

        statusDiv.textContent = 'status: online';
        statusDiv.classList.add('online');

    } catch (error) {
        if (error.name !== 'AbortError') {
            statusDiv.textContent = 'status: offline';
            statusDiv.classList.add('offline');
        }
    }
}

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}
