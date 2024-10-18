// content.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'parseSitemap') {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(request.data, 'text/xml');

        const urls = Array.from(xmlDoc.getElementsByTagName('loc')).map(loc => loc.textContent);
        
        sendResponse({ success: true, urls });
    }
});