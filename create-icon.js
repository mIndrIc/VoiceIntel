const sharp = require('sharp');
const fs = require('fs');

// Erstelle ein einfaches oranges Icon mit "VI" Text
const svgContent = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="80" fill="#f97316"/>
  <text x="256" y="340" font-family="Arial Black, sans-serif" font-size="260" font-weight="bold" fill="white" text-anchor="middle">VI</text>
</svg>
`;

sharp(Buffer.from(svgContent))
  .resize(512, 512)
  .png()
  .toFile('./src-tauri/icon.png')
  .then(() => {
    console.log('PNG icon created!');
  })
  .catch(err => {
    console.error('Error:', err);
  });
