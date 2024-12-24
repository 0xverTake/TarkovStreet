import os
import requests
from urllib.parse import urlparse

# Map URLs with fallback to local placeholder
MAPS = {
    'customs': {
        'url': 'https://assets.tarkov.dev/maps/customs.jpg',
        'fallback': './assets/img/map-placeholder.jpg'
    },
    'woods': {
        'url': 'https://assets.tarkov.dev/maps/woods.jpg',
        'fallback': './assets/img/map-placeholder.jpg'
    },
    'factory': {
        'url': 'https://assets.tarkov.dev/maps/factory.jpg',
        'fallback': './assets/img/map-placeholder.jpg'
    },
    'lighthouse': {
        'url': 'https://assets.tarkov.dev/maps/lighthouse.jpg',
        'fallback': './assets/img/map-placeholder.jpg'
    },
    'shoreline': {
        'url': 'https://assets.tarkov.dev/maps/shoreline.jpg',
        'fallback': './assets/img/map-placeholder.jpg'
    },
    'reserve': {
        'url': 'https://assets.tarkov.dev/maps/reserve.jpg',
        'fallback': './assets/img/map-placeholder.jpg'
    },
    'streets': {
        'url': 'https://assets.tarkov.dev/maps/streets.jpg',
        'fallback': './assets/img/map-placeholder.jpg'
    },
    'interchange': {
        'url': 'https://assets.tarkov.dev/maps/interchange.jpg',
        'fallback': './assets/img/map-placeholder.jpg'
    },
    'labs': {
        'url': 'https://assets.tarkov.dev/maps/labs.jpg',
        'fallback': './assets/img/map-placeholder.jpg'
    }
}

def download_map(name, map_info, output_dir):
    try:
        print(f"Downloading {name} map...")
        
        # Try downloading from URL first
        try:
            response = requests.get(map_info['url'], stream=True, timeout=5)
            response.raise_for_status()
            
            output_path = os.path.join(output_dir, f"{name}.jpg")
            with open(output_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"Successfully downloaded {name} map from URL")
            return True
        except Exception as url_error:
            print(f"Error downloading {name} map from URL: {str(url_error)}")
            
            # Fallback to local placeholder
            try:
                import shutil
                fallback_path = map_info['fallback']
                output_path = os.path.join(output_dir, f"{name}.jpg")
                shutil.copy2(fallback_path, output_path)
                print(f"Used placeholder image for {name} map")
                return True
            except Exception as fallback_error:
                print(f"Error using fallback image for {name} map: {str(fallback_error)}")
                return False
    except Exception as e:
        print(f"Unexpected error processing {name} map: {str(e)}")
        return False

def main():
    output_dir = os.path.join('assets', 'img', 'maps')
    os.makedirs(output_dir, exist_ok=True)
    
    success_count = 0
    for name, map_info in MAPS.items():
        if download_map(name, map_info, output_dir):
            success_count += 1
    
    print(f"\nDownload complete: {success_count}/{len(MAPS)} maps processed successfully")

if __name__ == "__main__":
    main()
