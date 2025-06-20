
// Simple skin color detection in RGB space
export const isSkinColor = (r: number, g: number, b: number): boolean => {
  return (
    r > 95 && g > 40 && b > 20 &&
    r > g && r > b &&
    Math.abs(r - g) > 15 &&
    (r - g) > 15
  );
};

// Check if a region contains skin-like colors
export const isSkinRegion = (
  data: Uint8ClampedArray,
  x: number,
  y: number,
  size: number,
  width: number,
  height: number,
  threshold: number = 0.25
): boolean => {
  let skinPixels = 0;
  let totalPixels = 0;
  
  for (let dy = 0; dy < size && y + dy < height; dy += 3) {
    for (let dx = 0; dx < size && x + dx < width; dx += 3) {
      const index = ((y + dy) * width + (x + dx)) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      
      if (isSkinColor(r, g, b)) {
        skinPixels++;
      }
      totalPixels++;
    }
  }
  
  return skinPixels / totalPixels > threshold;
};
