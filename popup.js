document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('fetch-sitemap').addEventListener('click', () => {
        const url = document.getElementById('url-input').value.trim();

        if (!url) {
            alert("Please enter a valid URL.");
            return;
        }

        // Validate URL format
        if (!isValidUrl(url)) {
            alert("Please enter a properly formatted URL.");
            return;
        }

        document.getElementById('loading-message').style.display = 'block';
        
        chrome.runtime.sendMessage({ action: 'fetchSitemap', url }, (response) => {
            document.getElementById('loading-message').style.display = 'none';

            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                alert("Error communicating with background script.");
                return;
            }

            if (response && response.success) {
                displayUrls(response.data);
                document.getElementById('download-btn').style.display = 'block';
                document.getElementById('download-btn').onclick = () => downloadExcel(response.data);
            } else {
                alert("Error fetching sitemap: " + (response ? response.error : "Unknown error"));
            }
        });
    });

    // Search functionality
    document.getElementById('search-input').addEventListener('input', function() {
        const filter = this.value.toLowerCase();
        const urlListDiv = document.getElementById('url-list');
        
        Array.from(urlListDiv.children).forEach(div => {
            if (div.textContent.toLowerCase().includes(filter)) {
                div.style.display = "";
            } else {
                div.style.display = "none";
            }
        });
    });
});

// Function to validate URL format
function isValidUrl(string) {
    const res = string.match(/(https?:\/\/[^\s]+)/g);
    return (res !== null);
}

// Function to display URLs from sitemap XML data
function displayUrls(data) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, 'text/xml');

    const urls = Array.from(xmlDoc.getElementsByTagName('loc')).map(loc => loc.textContent);
    
    const urlListDiv = document.getElementById('url-list');
    urlListDiv.innerHTML = '<h2>URLs:</h2>';
    
    urls.forEach(url => {
        const div = document.createElement('div');
        
        // Create a link element for each URL
        const link = document.createElement('a');
        link.href = url;
        link.textContent = url;
        link.target = "_blank"; // Open in new tab
        
        // Add event listener for status check on hover
        link.addEventListener('mouseover', () => checkStatus(url, div));
        
        div.appendChild(link);
        
        urlListDiv.appendChild(div);
    });
}

// Function to check HTTP status code of a URL
async function checkStatus(url, div) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        
        if (response.ok) {
            div.innerHTML += ` <span style='color: green;'>[Status: ${response.status}]</span>`;
        } else {
            div.innerHTML += ` <span style='color: red;'>[Status: ${response.status}]</span>`;
        }
        
    } catch (error) {
        div.innerHTML += ` <span style='color: red;'>[Error: Unable to fetch]</span>`;
    }
}

// Function to download URLs as CSV
function downloadExcel(data) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, 'text/xml');

    const urls = Array.from(xmlDoc.getElementsByTagName('loc')).map(loc => loc.textContent);

    let csvContent = 'data:text/csv;charset=utf-8,URL\n';
    
    urls.forEach(url => {
        csvContent += `${url}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'sitemap_urls.csv');
    
    document.body.appendChild(link);
    
    link.click();
    
    document.body.removeChild(link);
}