document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.querySelector('.search-form');
    searchForm.addEventListener('submit', handleSearch);
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
