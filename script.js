document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.querySelector('.search-form');
    searchForm.addEventListener('submit', handleSearch);

    const searchBar = document.querySelector('.search-bar');
    searchBar.addEventListener('input', debounce(checkHealth, 500));
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
    const errorMessage = document.getElementById('error-message');
    try {
        if (healthCheckController) {
            healthCheckController.abort();
        }
        healthCheckController = new AbortController();
        const signal = healthCheckController.signal;

        const response = await fetch('https://meow.skyesearch.cc/', {
            method: 'HEAD',
            mode: 'no-cors',
            signal: signal
        });

        // no-cors requests will have a status of 0, so we can't check for a 200
        // instead, we'll assume that if the request doesn't throw an error, the service is online.
        errorMessage.style.display = 'none';

    } catch (error) {
        if (error.name !== 'AbortError') {
            errorMessage.style.display = 'block';
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
