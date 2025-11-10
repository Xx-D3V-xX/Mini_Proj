import { Prisma, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function seedUsers() {
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const userPassword = await bcrypt.hash('User123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@local.test' },
    update: {},
    create: { email: 'admin@local.test', password_hash: adminPassword, name: 'Admin', role: 'ADMIN' },
  });
  await prisma.user.upsert({
    where: { email: 'user@local.test' },
    update: {},
    create: { email: 'user@local.test', password_hash: userPassword, name: 'Explorer', role: 'USER' },
  });
}

async function seedPois() {
  const repoRoot = path.resolve(__dirname, '..', '..', '..');
  const csvCandidates = [
    path.resolve(repoRoot, 'pois.csv'),
    path.resolve(repoRoot, 'pois_extra_20.csv'),
    path.resolve(__dirname, '../../seed/pois.csv'),
  ];

  const datasets: PoiCsvRow[] = [];
  const loadedFiles: string[] = [];
  for (const candidate of csvCandidates) {
    if (!fs.existsSync(candidate)) {
      continue;
    }
    const buffer = fs.readFileSync(candidate);
    const rows = parse<PoiCsvRow>(buffer, { columns: true, skip_empty_lines: true });
    datasets.push(...rows);
    console.log(`Loaded ${rows.length} POIs from ${path.relative(repoRoot, candidate)}`);
    loadedFiles.push(candidate);
  }

  if (!datasets.length) {
    throw new Error('No POI CSV files found');
  }

  const merged = new Map<string, PoiCsvRow>();
  for (const row of datasets) {
    merged.set(row.id, row);
  }

  for (const row of merged.values()) {
    await prisma.poi.upsert({
      where: { id: row.id },
      update: mapRow(row),
      create: mapRow(row),
    });
  }
  console.log(
    `Imported ${merged.size} unique POIs from ${datasets.length} rows across ${loadedFiles.length} file(s)`,
  );
}

function mapRow(row: PoiCsvRow) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    rating: row.rating ? Number(row.rating) : null,
    price_level: row.price_level ? Number(row.price_level) : null,
    tags: (row.tags || '')
      .split('|')
      .map((tag: string) => tag.trim())
      .filter(Boolean),
    image_url: row.image_url,
    opening_hours: safeJson(row.opening_hours) ?? Prisma.JsonNull,
  };
}

function safeJson(payload?: string | null): Prisma.InputJsonValue | null {
  try {
    return payload ? (JSON.parse(payload) as Prisma.InputJsonValue) : null;
  } catch (err) {
    return null;
  }
}

type PoiCsvRow = {
  id: string;
  name: string;
  description: string;
  category: string;
  latitude: string;
  longitude: string;
  rating?: string;
  price_level?: string;
  tags?: string;
  opening_hours?: string;
  image_url?: string;
};

async function main() {
  await seedUsers();
  await seedPois();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
