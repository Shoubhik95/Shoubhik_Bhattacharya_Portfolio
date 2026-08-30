from PIL import Image
from collections import Counter

def inspect_colors(img_path):
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # Collect border pixel colors
    border_colors = []
    for x in range(width):
        border_colors.append(pixels[x, 0])
        border_colors.append(pixels[x, height - 1])
    for y in range(height):
        border_colors.append(pixels[0, y])
        border_colors.append(pixels[width - 1, y])
        
    c = Counter(border_colors)
    print("Most common border colors (RGBA):")
    for color, count in c.most_common(10):
        print(f"{color}: {count}")

if __name__ == "__main__":
    import sys
    inspect_colors(sys.argv[1])
