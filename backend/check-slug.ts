import { SalonModel, connectDB } from './db';

async function checkSlug() {
  await connectDB();
  const salon = await SalonModel.findOne({ id: '8fd240fd-1246-4c2c-8d08-40f001c70102' });
  console.log('Salon name:', salon?.name);
  console.log('Slug:', salon?.slug);
  process.exit(0);
}

checkSlug();
