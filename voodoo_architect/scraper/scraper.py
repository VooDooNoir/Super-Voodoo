import requests
from bs4 import BeautifulSoup
import json

class VoodooScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'VoodooArchitect/1.0 (AI Website Builder)'
        }

    def scrape_website(self, url):
        print(f"Scraping {url}...")
        try:
            response = requests.get(url, headers=self.headers, timeout=10, verify=False)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            data = {
                'title': soup.title.string if soup.title else "No Title",
                'meta_description': self._get_meta_description(soup),
                'headings': self._get_headings(soup),
                'content': self._get_main_content(soup),
                'links': self._get_links(soup),
                'url': url
            }
            return data
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            return None

    def _get_meta_description(self, soup):
        meta = soup.find('meta', attrs={'name': 'description'})
        return meta['content'] if meta else ""

    def _get_headings(self, soup):
        headings = []
        for h in soup.find_all(['h1', 'h2', 'h3']):
            headings.append({'tag': h.name, 'text': h.get_text().strip()})
        return headings

    def _get_main_content(self, soup):
        # Simple heuristic: get text from main, article, or body
        main = soup.find('main') or soup.find('article') or soup.find('body')
        return main.get_text(separator='\n', strip=True) if main else ""

    def _get_links(self, soup):
        links = []
        for a in soup.find_all('a', href=True):
            links.append({'text': a.get_text().strip(), 'href': a['href']})
        return links

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        scraper = VoodooScraper()
        result = scraper.scrape_website(sys.argv[1])
        print(json.dumps(result, indent=2))
    else:
        print("Usage: python scraper.py <url>")
