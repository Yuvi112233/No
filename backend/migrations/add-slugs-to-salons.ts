import { SalonModel, connectDB } from '../db';

// Helper function to generate slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Migration to add slugs to existing salons
async function addSlugsToSalons() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Connected successfully!');
    
    console.log('Starting migration: Adding slugs to existing salons...');
    
    const salons = await SalonModel.find({ slug: { $exists: false } });
    console.log(`Found ${salons.length} salons without slugs`);
    
    if (salons.length === 0) {
      console.log('No salons need slug migration. All done!');
      return;
    }
    
    const slugCounts = new Map<string, number>();
    
    for (const salon of salons) {
      let baseSlug = generateSlug(salon.name);
      let slug = baseSlug;
      
      // Ensure uniqueness
      const count = slugCounts.get(baseSlug) || 0;
      if (count > 0) {
        slug = `${baseSlug}-${count}`;
      }
      slugCounts.set(baseSlug, count + 1);
      
      // Check if slug already exists in database
      let counter = count;
      while (await SalonModel.findOne({ slug })) {
        counter++;
        slug = `${baseSlug}-${counter}`;
      }
      
      await SalonModel.updateOne(
        { id: salon.id },
        { $set: { slug } }
      );
      
      console.log(`✓ Added slug "${slug}" to salon "${salon.name}"`);
    }
    
    console.log(`\n✅ Migration completed successfully! Updated ${salons.length} salons.`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
addSlugsToSalons()
  .then(() => {
    console.log('\n🎉 All done! You can now use SEO-friendly URLs.');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
