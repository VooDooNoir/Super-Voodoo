from flask import Flask, request, jsonify
from voodoo_architect.scraper.scraper import VoodooScraper
from voodoo_architect.generator.generator import VoodooGenerator
import os

app = Flask(__name__)

scraper = VoodooScraper()
generator = VoodooGenerator()

@app.route('/build', methods=['POST'])
def build_website():
    data = request.json
    url = data.get('url')
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    
    # 1. Scrape
    scraped_data = scraper.scrape_website(url)
    if not scraped_data:
        return jsonify({'error': 'Failed to scrape website'}), 500
    
    # 2. Generate
    output_filename = f"site_{hash(url)}.html"
    output_path = os.path.join('voodoo_architect/output', output_filename)
    os.makedirs('voodoo_architect/output', exist_ok=True)
    
    generated_file = generator.generate_html(scraped_data, output_path)
    
    return jsonify({
        'status': 'success',
        'url': url,
        'generated_file': generated_file,
        'output_path': output_path
    })

if __name__ == '__main__':
    # Use 0.0.0.0 to be accessible in the environment
    app.run(host='0.0.0.0', port=5000)
