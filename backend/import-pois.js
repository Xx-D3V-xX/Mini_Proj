const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importPOIs() {
  try {
    console.log('🚀 Starting POI import...');
    
    // Read CSV file
    const csvPath = path.join(__dirname, 'seed', 'pois.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.trim().split('\n');
    
    // Skip header
    const dataLines = lines.slice(1);
    
    console.log(`📊 Found ${dataLines.length} POIs to import`);
    
    let imported = 0;
    let skipped = 0;
    
    for (const line of dataLines) {
      try {
        // Parse CSV line (basic parsing, handles quoted fields)
        const fields = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g).map(f => f.replace(/^"|"$/g, '').trim());
        
        if (fields.length < 11) {
          console.log(`⚠️  Skipping invalid line: ${line.substring(0, 50)}...`);
          skipped++;
          continue;
        }
        
        const [id, name, description, category, lat, lng, rating, priceLevel, tags, imageUrl, openingHours] = fields;
        
        // Create slug from id
        const slug = id;
        
        // Parse tags
        const tagArray = tags ? tags.split('|').map(t => t.trim()).filter(t => t) : [];
        
        // Create or get category
        const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
        await prisma.category.upsert({
          where: { slug: categorySlug },
          update: {},
          create: {
            slug: categorySlug,
            display_name: category,
          },
        });
        
        // Create POI without relations first
        const poi = await prisma.poi.create({
          data: {
            id: id,
            slug: slug,
            name: name,
            description: description,
            latitude: parseFloat(lat),
            longitude: parseFloat(lng),
            rating: parseFloat(rating) || 4.0,
            price_level: parseInt(priceLevel) || 1,
            image_url: imageUrl && imageUrl !== 'https://placehold.co/600x400?text=' ? imageUrl : null,
          },
        });
        
        // Link category
        const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
        if (cat) {
          await prisma.poiCategory.create({
            data: {
              poi_id: poi.id,
              category_id: cat.id,
            },
          }).catch(() => {}); // Ignore if already exists
        }
        
        // Create and link tags
        for (const tagName of tagArray) {
          const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-');
          const tag = await prisma.tag.upsert({
            where: { slug: tagSlug },
            update: {},
            create: {
              slug: tagSlug,
              display_name: tagName,
            },
          });
          
          await prisma.poiTag.create({
            data: {
              poi_id: poi.id,
              tag_id: tag.id,
            },
          }).catch(() => {}); // Ignore if already exists
        }
        
        imported++;
        if (imported % 10 === 0) {
          console.log(`✅ Imported ${imported} POIs...`);
        }
      } catch (error) {
        console.error(`❌ Error importing POI: ${error.message}`);
        skipped++;
      }
    }
    
    console.log(`\n✨ Import complete!`);
    console.log(`   Imported: ${imported}`);
    console.log(`   Skipped: ${skipped}`);
    
    // Verify
    const count = await prisma.poi.count();
    console.log(`\n📊 Total POIs in database: ${count}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importPOIs();
