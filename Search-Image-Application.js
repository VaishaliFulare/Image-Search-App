const ACCESS_KEY = 'VuzWL2kZGfTgjHtGkZEiD2yYIsy5-cLClVPQ6jirr98';
const BASE_URL = 'https://api.unsplash.com/search/photos';
const RESULTS_PER_PAGE = 30;
const MAX_PAGES = 34;

let currentQuery = '';
let currentPage = 1;
let totalPages = 1;
const seenImageIds = new Set();

const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const gallery = document.getElementById('gallery');
const spinner = document.getElementById('spinner');
const messageDiv = document.getElementById('message');
const loadMoreBtn = document.getElementById('load-more');

function showSpinner() {
    spinner.style.display = 'flex';
}

function hideSpinner() {
    spinner.style.display = 'none';
}

function showMessage(msg) {
    messageDiv.textContent = msg;
    messageDiv.style.display = 'block';
}

function hideMessage() {
    messageDiv.textContent = '';
    messageDiv.style.display = 'none';
}

function enableLoadMore() {
    loadMoreBtn.style.display = 'block';
}

function disableLoadMore() {
    loadMoreBtn.style.display = 'none';
}

function clearResults() {
    gallery.innerHTML = '';
    seenImageIds.clear();
    hideMessage();
    disableLoadMore();
}

function buildCard(imageData) {
    const card = document.createElement('div');
    card.className = 'card';

    const img = document.createElement('img');
    img.src = imageData.urls.small;
    img.alt = imageData.alt_description || 'Unsplash Image';
    img.loading = 'lazy';
    card.appendChild(img);

    const info = document.createElement('div');
    info.className = 'info';

    const alt = document.createElement('div');
    alt.className = 'alt';
    alt.textContent = imageData.alt_description || 'No description';
    info.appendChild(alt);

    const credit = document.createElement('div');
    credit.className = 'credit';
    const link = document.createElement('a');
    link.href = imageData.user.links.html + '?utm_source=YourAppName&utm_medium=referral';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = imageData.user.name;
    credit.innerHTML = 'Photo by ';
    credit.appendChild(link);
    credit.innerHTML += ' on Unsplash';
    info.appendChild(credit);

    card.appendChild(info);
    return card;
}

async function searchImages(query, page = 1) {
    if (!query.trim()) {
        showMessage('Please enter a search term.');
        return;
    }

    hideMessage();
    showSpinner();
    disableLoadMore();

    try {
        const url = `${BASE_URL}?query=${encodeURIComponent(query)}&page=${page}&per_page=${RESULTS_PER_PAGE}&client_id=${ACCESS_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        totalPages = Math.min(MAX_PAGES, data.total_pages);

        if (page === 1 && data.results.length === 0) {
            clearResults();
            showMessage(`No images found for “${query}.”`);
            return;
        }

        let newImagesCount = 0;
        data.results.forEach((imgData) => {
            if (!seenImageIds.has(imgData.id)) {
                seenImageIds.add(imgData.id);
                gallery.appendChild(buildCard(imgData));
                newImagesCount++;
            }
        });

        if (newImagesCount === 0 && page === 1) {
            clearResults();
            showMessage(`No unique images found for “${query}.”`);
            return;
        }

        if (page < totalPages) {
            enableLoadMore();
        } else {
            disableLoadMore();
        }
    } catch (err) {
        clearResults();
        showMessage(err.message || 'An unexpected error occurred.');
    } finally {
        hideSpinner();
    }
}

function handleSearch(e) {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query === '') return;

    currentQuery = query;
    currentPage = 1;
    clearResults();

    searchImages(currentQuery, currentPage);
}

function handleEnterKey(e) {
    if (e.key === 'Enter') {
        handleSearch(e);
    }
}

function handleLoadMore() {
    if (currentPage < totalPages) {
        currentPage++;
        searchImages(currentQuery, currentPage);
    }
}


searchButton.addEventListener('click', handleSearch);
searchInput.addEventListener('keydown', handleEnterKey);
loadMoreBtn.addEventListener('click', handleLoadMore);