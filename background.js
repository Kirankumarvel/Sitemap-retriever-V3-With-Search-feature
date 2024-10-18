// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchSitemap') {
        fetchSitemap(request.url)
            .then(data => {
                sendResponse({ success: true, data });
            })
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep the message channel open for sendResponse
    }
});

async function fetchSitemap(url) {
    const sitemapUrl = `${url}/sitemap.xml`;
    
    const response = await fetch(sitemapUrl);
    
    if (!response.ok) {
        throw new Error('Failed to fetch sitemap');
    }
    
    return await response.text(); // Return raw XML text for parsing
}