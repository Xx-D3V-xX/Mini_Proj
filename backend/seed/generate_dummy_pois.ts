import * as fs from 'fs';
import * as path from 'path';

const categories = ['Waterfront', 'Heritage', 'Park', 'Cafe', 'Museum', 'Fort', 'Market'];
const neighbourhoods = [
  { name: 'Colaba', lat: 18.907, lng: 72.814 },
  { name: 'Bandra', lat: 19.059, lng: 72.829 },
  { name: 'Juhu', lat: 19.102, lng: 72.826 },
  { name: 'Powai', lat: 19.117, lng: 72.906 },
  { name: 'Fort', lat: 18.932, lng: 72.835 },
  { name: 'Worli', lat: 19.003, lng: 72.817 },
];

const header = 'id,name,description,category,latitude,longitude,rating,price_level,tags,image_url,opening_hours\n';

function generateRow(index: number) {
  const hood = neighbourhoods[index % neighbourhoods.length];
  const category = categories[index % categories.length];
  const lat = hood.lat + Math.random() * 0.02;
  const lng = hood.lng + Math.random() * 0.02;
  const id = `synthetic-${index}`;
  const name = `${hood.name} ${category} Spot ${index}`;
  const description = `Curated ${category.toLowerCase()} spot in ${hood.name} with local experiences.`;
  const rating = (3.5 + Math.random() * 1.5).toFixed(1);
  const price = Math.floor(Math.random() * 4);
  const tags = ['family', 'photo', 'food', 'sunset', 'culture'];
  const openingHours = JSON.stringify({
    mon: [['09:00', '18:00']],
    tue: [['09:00', '18:00']],
    wed: [['09:00', '18:00']],
    thu: [['09:00', '18:00']],
    fri: [['09:00', '22:00']],
    sat: [['09:00', '22:00']],
    sun: [['09:00', '20:00']],
  });
  return [
    id,
    name,
    description,
    category,
    lat.toFixed(6),
    lng.toFixed(6),
    rating,
    price,
    tags.slice(0, 3).join('|'),
    'https://placehold.co/600x400',
    openingHours,
  ].join(',');
}

function run() {
  const outPath = path.resolve(__dirname, 'generated_pois.csv');
  const rows = Array.from({ length: 30 }, (_, i) => generateRow(i + 1));
  fs.writeFileSync(outPath, header + rows.join('\n'));
  console.log(`Generated ${rows.length} rows at ${outPath}`);
}

run();
