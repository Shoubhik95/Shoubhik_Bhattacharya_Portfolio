import os
import sys
from PIL import Image

def remove_background(img_path, out_path):
    print(f"Processing {img_path}...")
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # We will perform a BFS flood fill from the borders.
    # A pixel is considered background if it is close to white or grey.
    # From inspection, standard background colors are:
    # (255, 255, 255) and (238, 238, 238)
    
    def is_bg_color(color):
        r, g, b, a = color
        if a == 0:
            return True
        # Check if it's very close to pure white or very light neutral grey
        if r > 220 and g > 220 and b > 220:
            if abs(r - g) < 10 and abs(g - b) < 10 and abs(r - b) < 10:
                return True
        return False

    visited = set()
    queue = []
    
    # Add all border pixels to queue
    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
        visited.add((x, 0))
        visited.add((x, height - 1))
        
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))
        visited.add((0, y))
        visited.add((width - 1, y))
        
    # BFS
    head = 0
    while head < len(queue):
        x, y = queue[head]
        head += 1
        
        color = pixels[x, y]
        if is_bg_color(color):
            # Make transparent
            pixels[x, y] = (0, 0, 0, 0)
            
            # Add neighbors
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height:
                    if (nx, ny) not in visited:
                        visited.add((nx, ny))
                        queue.append((nx, ny))
                        
    # Save output
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    img.save(out_path, "PNG")
    print(f"Saved transparent image to {out_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python remove_background.py <input_img> <output_img>")
        sys.exit(1)
    remove_background(sys.argv[1], sys.argv[2])
