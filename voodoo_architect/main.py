import sys
import os

# Add current directory and voodoo_architect to path
sys.path.append(os.path.abspath(os.getcwd()))

from voodoo_architect.scraper.scraper import VoodooScraper
from voodoo_architect.generator.generator import VoodooGenerator
import json

def main():
    url = input("Enter the URL of the website to architect: ")
    if not url:
        print("No URL provided.")
        return

    # Initialize components
    scraper = VoodooScraper()
    generator = VoodooGenerator()

    # Step 1: Scrape
    print("\n[1/2] Scraping target website...")
    scraped_data = scraper.scrape_website(url)
    if not scraped_data:
        print("Scraping failed.")
        return

    # Step 2: Generate
    print("[2/2] Generating new website blueprint...")
    output_path = "voodoo_site_output.html"
    generator.generate_html(scraped_data, output_path)

    print(f"\nSuccess! Your Voodoo Architect site has been generated: {output_path}")

if __name__ == "__main__":
    main()
