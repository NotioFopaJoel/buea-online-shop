/**
 * Seeds MongoDB with demo data for BUEA ONLINE SHOP.
 * Run with: npm run seed  (from /backend)
 *
 * Creates:
 *  - Categories (+ subcategories)
 *  - Buea delivery zones
 *  - Platform settings (WhatsApp number, thresholds)
 *  - 1 admin, 3 sellers, 10 customers
 *  - 50+ products across all categories, realistic FCFA prices
 *  - A handful of demo orders in different statuses
 */
require('dotenv').config();
const mongoose = require('mongoose');
const slugify = require('slugify');
const env = require('../config/environment');

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const DeliveryZone = require('../models/DeliveryZone');
const Settings = require('../models/Settings');
const Order = require('../models/Order');
const generateOrderNumber = require('../utils/generateOrderNumber');

const placeholderImage = (seed) => `https://picsum.photos/seed/${seed}/600/600`;

async function seed() {
  // Same dbName override as database.js - guarantees the seed always
  // populates "buea_online_shop" regardless of what's in MONGO_URI's path.
  await mongoose.connect(env.MONGO_URI, { dbName: 'buea_online_shop' });
  console.log(`[seed] Connected to MongoDB: ${mongoose.connection.host}/${mongoose.connection.name}`);

  console.log('[seed] Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    DeliveryZone.deleteMany({}),
    Settings.deleteMany({}),
    Order.deleteMany({}),
  ]);

  // ---------- Settings ----------
  await Settings.create({
    whatsappBusinessNumber: env.WHATSAPP_BUSINESS_NUMBER,
    deliveryFreeThreshold: env.DELIVERY_FREE_THRESHOLD,
    deliveryFeeStandard: env.DELIVERY_FEE_STANDARD,
    activeDeliveryCity: env.DEFAULT_DELIVERY_CITY,
    supportEmail: 'support@bueaonlineshop.com',
    supportPhone: `+${env.WHATSAPP_BUSINESS_NUMBER}`,
    socialLinks: { facebook: '', instagram: '', tiktok: '' },
  });
  console.log('[seed] Settings created');

  // ---------- Delivery Zones (Buea neighborhoods) ----------
  const neighborhoods = [
    'Molyko', 'Mile 16', 'Mile 17', 'Muea', 'Bonduma', 'Great Soppo',
    'Buea Town', 'Clerks Quarters', 'Bokwango', 'Small Soppo',
  ];
  await DeliveryZone.insertMany(
    neighborhoods.map((n, i) => ({ city: 'Buea', neighborhood: n, isActive: true, sortOrder: i }))
  );
  console.log(`[seed] ${neighborhoods.length} delivery zones created`);

  // ---------- Categories ----------
  const categoryDefs = [
    { name: 'Clothing', nameFr: 'Vêtements', subs: ["Men's Clothing", "Women's Clothing", 'Kids', 'Shoes', 'Bags', 'Accessories', "Men's Underwear", "Women's Lingerie"] },
    { name: 'Jewelry', nameFr: 'Bijoux', subs: ['Necklaces', 'Rings', 'Bracelets', 'Earrings', 'Watches'] },
    { name: 'Electronics', nameFr: 'Électronique', subs: ['Smartphones', 'Headphones', 'Earbuds', 'Laptops', 'Smart Watches', 'TVs', 'Speakers', 'Accessories'] },
    { name: 'Home Decor', nameFr: 'Maison & Déco', subs: ['Furniture', 'Decoration', 'Lighting', 'Kitchen', 'Bedroom', 'Bathroom', 'Appliances'] },
    { name: 'Beauty & Makeup', nameFr: 'Beauté & Maquillage', subs: ['Makeup', 'Skincare', 'Hair', 'Perfumes', 'Accessories'] },
    { name: 'Sports', nameFr: 'Sport', subs: ['Shoes', 'Clothes', 'Equipment'] },
    { name: 'Kids & Toys', nameFr: 'Enfants & Jouets', subs: [] },
    { name: 'Automotive', nameFr: 'Automobile', subs: [] },
    { name: 'Books & Education', nameFr: 'Livres & Éducation', subs: [] },
  ];

  const categoryMap = {};
  const usedSlugs = new Set();
  let catSortOrder = 0;

  /**
   * Returns a slug guaranteed unique across the whole Category collection.
   * Subcategory names like "Accessories" or "Shoes" repeat under multiple
   * parents (Clothing/Electronics/Beauty & Makeup, Clothing/Sports), so the
   * plain slugify(name) would collide. When that happens, prefix with the
   * parent category name instead (e.g. "electronics-accessories").
   */
  function uniqueSlug(label, parentLabel) {
    const base = slugify(label, { lower: true, strict: true });
    if (!usedSlugs.has(base)) {
      usedSlugs.add(base);
      return base;
    }
    const disambiguated = slugify(`${parentLabel}-${label}`, { lower: true, strict: true });
    usedSlugs.add(disambiguated);
    return disambiguated;
  }

  for (const def of categoryDefs) {
    const parent = await Category.create({
      name: def.name,
      nameFr: def.nameFr,
      slug: uniqueSlug(def.name, ''),
      description: `${def.name} for everyone in Buea`,
      image: placeholderImage(`cat-${def.name}`),
      sortOrder: catSortOrder,
    });
    catSortOrder += 1;

    categoryMap[def.name] = { doc: parent, subs: {} };

    for (const subName of def.subs) {
      const sub = await Category.create({
        name: subName,
        slug: uniqueSlug(subName, def.name),
        parentCategory: parent._id,
        image: placeholderImage(`sub-${def.name}-${subName}`),
      });
      categoryMap[def.name].subs[subName] = sub;
    }
  }
  console.log(`[seed] ${categoryDefs.length} categories (+ subcategories) created`);

  // ---------- Users ----------
  await User.create({
    name: 'BUEA ONLINE SHOP Admin',
    email: 'admin@bueaonlineshop.com',
    phone: '+237670000001',
    whatsappNumber: '+237670000001',
    password: 'Admin@12345',
    role: 'admin',
    preferredLanguage: 'en',
  });

  const sellerDefs = [
    { name: 'Ngwa Fashion Store', email: 'seller1@bueaonlineshop.com', shopName: 'Ngwa Fashion Store' },
    { name: 'Molyko Electronics Hub', email: 'seller2@bueaonlineshop.com', shopName: 'Molyko Electronics Hub' },
    { name: 'Buea Beauty Corner', email: 'seller3@bueaonlineshop.com', shopName: 'Buea Beauty Corner' },
  ];
  const sellers = [];
  for (let i = 0; i < sellerDefs.length; i += 1) {
    const s = await User.create({
      name: sellerDefs[i].name,
      email: sellerDefs[i].email,
      phone: `+23767000001${i}`,
      password: 'Seller@12345',
      role: 'seller',
      sellerProfile: { shopName: sellerDefs[i].shopName, isApproved: true, description: 'Trusted local seller.' },
    });
    sellers.push(s);
  }

  const customers = [];
  for (let i = 1; i <= 10; i += 1) {
    const c = await User.create({
      name: `Customer ${i}`,
      email: `customer${i}@example.com`,
      phone: `+23769000${String(i).padStart(4, '0')}`,
      password: 'Customer@123',
      role: 'customer',
      addresses: [
        {
          label: 'Home',
          city: 'Buea',
          neighborhood: neighborhoods[i % neighborhoods.length],
          address: `House ${i}, near landmark`,
          phone: `+23769000${String(i).padStart(4, '0')}`,
          isDefault: true,
        },
      ],
    });
    customers.push(c);
  }
  console.log(`[seed] 1 admin, ${sellers.length} sellers, ${customers.length} customers created`);

  // ---------- Products ----------
  // [name, categoryName, subName, price, comparePrice(0 = no discount), flags]
  const productDefs = [
    ['Men\u2019s Hoodie Comfort Fit', 'Clothing', "Men's Clothing", 18000, 0, {}],
    ['Casual Slim Shirt', 'Clothing', "Men's Clothing", 15000, 0, {}],
    ['Denim Jacket For Men', 'Clothing', "Men's Clothing", 25000, 32000, { isNewArrival: true }],
    ['Women\u2019s Elegant Dress', 'Clothing', "Women's Clothing", 22000, 28000, { isFeatured: true }],
    ['Classic Cotton T-Shirt', 'Clothing', "Men's Clothing", 8000, 0, {}],
    ['Kids Cozy Hoodie', 'Clothing', 'Kids', 12000, 15000, { isDealOfTheDay: true }],
    ['Kids Summer Set', 'Clothing', 'Kids', 14000, 0, {}],
    ['Men\u2019s Sneakers Comfort & Style', 'Clothing', 'Shoes', 32000, 40000, { isBestSeller: true, isDealOfTheDay: true }],
    ['Women\u2019s Leather Sandals', 'Clothing', 'Shoes', 17000, 0, {}],
    ['Canvas Tote Bag', 'Clothing', 'Bags', 11000, 0, {}],
    ['Leather Handbag', 'Clothing', 'Bags', 28000, 34000, { isFeatured: true }],
    ['Unisex Cap', 'Clothing', 'Accessories', 5000, 0, {}],

    ['Gold Chain Necklace Elegant & Durable', 'Jewelry', 'Necklaces', 18500, 21800, { isDealOfTheDay: true, isBestSeller: true }],
    ['Silver Pendant Necklace', 'Jewelry', 'Necklaces', 14000, 0, {}],
    ['Classic Gold Ring', 'Jewelry', 'Rings', 12500, 0, {}],
    ['Engagement Ring Set', 'Jewelry', 'Rings', 45000, 55000, { isFeatured: true }],
    ['Beaded Bracelet', 'Jewelry', 'Bracelets', 6000, 0, {}],
    ['Charm Bracelet', 'Jewelry', 'Bracelets', 9500, 0, {}],
    ['Pearl Drop Earrings', 'Jewelry', 'Earrings', 8500, 0, {}],
    ['Men\u2019s Watch Water Resistant', 'Jewelry', 'Watches', 15000, 20000, { isBestSeller: true, isDealOfTheDay: true }],
    ['Classic Leather Watch', 'Jewelry', 'Watches', 21000, 0, { isNewArrival: true }],

    ['Wireless Headphones High Sound Quality', 'Electronics', 'Headphones', 25000, 27800, { isDealOfTheDay: true, isBestSeller: true }],
    ['Noise Cancelling Headphones', 'Electronics', 'Headphones', 38000, 45000, { isFeatured: true }],
    ['Bluetooth Earbuds Pro', 'Electronics', 'Earbuds', 15000, 0, { isNewArrival: true }],
    ['Sport Earbuds', 'Electronics', 'Earbuds', 11000, 0, {}],
    ['Smartphone 128GB Dual SIM', 'Electronics', 'Smartphones', 145000, 160000, { isFeatured: true }],
    ['Budget Smartphone 64GB', 'Electronics', 'Smartphones', 85000, 0, { isNewArrival: true }],
    ['Slim Laptop 8GB RAM', 'Electronics', 'Laptops', 320000, 0, {}],
    ['Business Laptop 16GB RAM', 'Electronics', 'Laptops', 480000, 520000, { isFeatured: true }],
    ['Smart Watch Fitness Tracker', 'Electronics', 'Smart Watches', 28000, 34000, { isBestSeller: true }],
    ['Kids Smart Watch', 'Electronics', 'Smart Watches', 19000, 0, {}],
    ['32-inch Smart TV', 'Electronics', 'TVs', 135000, 0, {}],
    ['43-inch Smart TV', 'Electronics', 'TVs', 210000, 240000, { isFeatured: true }],
    ['Portable Bluetooth Speaker', 'Electronics', 'Speakers', 18000, 0, {}],
    ['Home Theater Speaker Set', 'Electronics', 'Speakers', 65000, 75000, { isNewArrival: true }],
    ['Fast Charging Cable Pack', 'Electronics', 'Accessories', 3500, 0, {}],
    ['20000mAh Power Bank', 'Electronics', 'Accessories', 12000, 0, { isBestSeller: true }],

    ['Modern Sofa Set', 'Home Decor', 'Furniture', 250000, 0, {}],
    ['Wooden Coffee Table', 'Home Decor', 'Furniture', 65000, 0, {}],
    ['Decorative Wall Art', 'Home Decor', 'Decoration', 15000, 0, { isNewArrival: true }],
    ['Ceramic Vase Set', 'Home Decor', 'Decoration', 12000, 15000, {} ],
    ['LED Table Lamp', 'Home Decor', 'Lighting', 9000, 0, {}],
    ['Pendant Ceiling Light', 'Home Decor', 'Lighting', 22000, 0, {}],
    ['Non-Stick Cookware Set', 'Home Decor', 'Kitchen', 32000, 38000, { isBestSeller: true }],
    ['Bedding Set Queen Size', 'Home Decor', 'Bedroom', 28000, 0, {}],
    ['Bathroom Storage Rack', 'Home Decor', 'Bathroom', 11000, 0, {}],

    ['Makeup Set For Perfect Look', 'Beauty & Makeup', 'Makeup', 12000, 16000, { isDealOfTheDay: true, isBestSeller: true }],
    ['Lipstick Collection', 'Beauty & Makeup', 'Makeup', 8500, 0, {}],
    ['Hydrating Face Serum', 'Beauty & Makeup', 'Skincare', 9500, 0, { isNewArrival: true }],
    ['Natural Hair Oil', 'Beauty & Makeup', 'Hair', 6000, 0, {}],
    ['Signature Perfume 100ml', 'Beauty & Makeup', 'Perfumes', 25000, 30000, { isFeatured: true }],

    ['Running Shoes Pro', 'Sports', 'Shoes', 29000, 0, { isBestSeller: true }],
    ['Sports Tracksuit', 'Sports', 'Clothes', 21000, 0, {}],
    ['Yoga Mat', 'Sports', 'Equipment', 9000, 0, {}],
    ['Adjustable Dumbbells Set', 'Sports', 'Equipment', 45000, 50000, { isNewArrival: true }],

    ['Building Blocks Set', 'Kids & Toys', null, 13000, 0, {}],
    ['Remote Control Car', 'Kids & Toys', null, 17000, 0, { isNewArrival: true }],

    ['Car Phone Holder', 'Automotive', null, 5000, 0, {}],
    ['Car Seat Cover Set', 'Automotive', null, 24000, 0, {}],

    ['Bestselling Novel Collection', 'Books & Education', null, 8000, 0, {}],
    ['Kids Educational Book Set', 'Books & Education', null, 11000, 0, {}],

    ['Men\u2019s Cotton Boxer Briefs (3-Pack)', 'Clothing', "Men's Underwear", 7500, 0, { isBestSeller: true }],
    ['Men\u2019s Classic Trunks (3-Pack)', 'Clothing', "Men's Underwear", 6500, 0, {}],
    ['Men\u2019s Thermal Undershirt', 'Clothing', "Men's Underwear", 5000, 0, {}],
    ['Women\u2019s Lace Lingerie Set', 'Clothing', "Women's Lingerie", 14000, 18000, { isFeatured: true }],
    ['Women\u2019s Cotton Bra & Panty Set (3-Pack)', 'Clothing', "Women's Lingerie", 9500, 0, { isBestSeller: true }],
    ['Women\u2019s Seamless Everyday Bra', 'Clothing', "Women's Lingerie", 7000, 0, {}],
    ['Women\u2019s Comfort Nightwear Set', 'Clothing', "Women's Lingerie", 12500, 15000, { isNewArrival: true }],
  ];

  const colorsBank = ['Black', 'White', 'Blue', 'Red', 'Grey'];
  const sizesBank = ['S', 'M', 'L', 'XL'];
  const underwearCats = ["Men's Underwear", "Women's Lingerie"];

  let skuCounter = 1000;
  const createdProducts = [];

  for (const def of productDefs) {
    const [name, catName, subName, price, comparePrice, flags] = def;
    const catEntry = categoryMap[catName];
    if (!catEntry) continue; // eslint-disable-line no-continue

    const subDoc = subName ? catEntry.subs[subName] : null;
    const seller = sellers[skuCounter % sellers.length];

    const product = await Product.create({
      name,
      description: `${name} - quality product available for delivery in Buea. ${catName} category.`,
      price,
      comparePrice: comparePrice || 0,
      images: [placeholderImage(`p-${skuCounter}-a`), placeholderImage(`p-${skuCounter}-b`)],
      category: catEntry.doc._id,
      subcategory: subDoc ? subDoc._id : null,
      brand: 'BUEA ONLINE SHOP',
      stock: 20 + (skuCounter % 30),
      sku: `BOS-SKU-${skuCounter}`,
      colors: catName === 'Clothing' || catName === 'Electronics' ? colorsBank.slice(0, 3) : [],
      sizes: catName === 'Clothing' && (subName === "Men's Clothing" || subName === "Women's Clothing" || subName === 'Kids' || underwearCats.includes(subName)) ? sizesBank : [],
      sellerId: catName === 'Electronics' || catName === 'Clothing' || catName === 'Beauty & Makeup' ? seller._id : null,
      isFeatured: !!flags.isFeatured,
      isBestSeller: !!flags.isBestSeller,
      isNewArrival: !!flags.isNewArrival,
      isDealOfTheDay: !!flags.isDealOfTheDay,
      rating: 3.5 + ((skuCounter % 15) / 10),
      reviewCount: 20 + (skuCounter % 120),
    });

    createdProducts.push(product);
    skuCounter += 1;
  }
  console.log(`[seed] ${createdProducts.length} products created`);

  // ---------- Real-photo products ----------
  // Sourced from supplier reference photos. Product names are deliberately
  // descriptive/style-based (not brand names) since these are unbranded/
  // unofficial stock photos - avoids implying an unauthorized trademark claim.
  const localImage = (filename) => `/images/products/${filename}`;
  const shoeSizesBank = ['37', '38', '39', '40', '41', '42', '43', '44'];

  const realPhotoProducts = [
    {
      name: 'Enceinte Bluetooth Portable X-311', catName: 'Electronics', subName: 'Speakers',
      price: 12000, comparePrice: 15000, flags: { isDealOfTheDay: true, isBestSeller: true },
      images: ['speaker-x311.jpg'], colors: ['Blue', 'Red', 'Green', 'Black'], sizes: [],
      description: 'Enceinte Bluetooth portable X-311 avec dragonne, disponible en plusieurs coloris. Autonomie longue durée, son clair pour un usage quotidien.',
    },
    {
      name: 'Baskets Sport Fashion Blanches', catName: 'Clothing', subName: 'Shoes',
      price: 18000, comparePrice: 0, flags: {}, images: ['sneakers-white-sportfashion.jpg'],
      colors: ['White'], sizes: shoeSizesBank,
      description: 'Baskets tout-blanc au design sport chunky, semelle épaisse confortable, parfaites pour un look casual.',
    },
    {
      name: 'Baskets Noires Semelle Épaisse', catName: 'Clothing', subName: 'Kids',
      price: 12000, comparePrice: 0, flags: {}, images: ['sneakers-black-thicksole.jpg'],
      colors: ['Black'], sizes: ['28', '29', '30', '31', '32', '33'],
      description: 'Baskets montantes noires pour enfant, semelle épaisse et confortable, lacets classiques.',
    },
    {
      name: 'Sac à Dos Astronaute Bleu Marine - Enfant', catName: 'Clothing', subName: 'Bags',
      price: 15000, comparePrice: 0, flags: { isNewArrival: true }, images: ['backpack-astronaut-navy.jpg'],
      colors: ['Navy'], sizes: [],
      description: 'Sac à dos scolaire bleu marine à motif astronaute, plusieurs compartiments et poches latérales.',
    },
    {
      name: 'Baskets Montantes Multicolores Enfant', catName: 'Clothing', subName: 'Kids',
      price: 13000, comparePrice: 0, flags: {}, images: ['sneakers-kids-black-hightop.jpg'],
      colors: ['Black'], sizes: ['26', '27', '28', '29', '30'],
      description: 'Baskets montantes pour enfant avec fermeture scratch et lacets, semelle légère.',
    },
    {
      name: 'Baskets CAMPUS Noir & Or', catName: 'Clothing', subName: 'Shoes',
      price: 17000, comparePrice: 21000, flags: { isBestSeller: true }, images: ['sneakers-black-campus-gold.jpg'],
      colors: ['Black'], sizes: shoeSizesBank,
      description: 'Baskets basses noires à bandes dorées, style campus, semelle plate confortable.',
    },
    {
      name: 'Baskets Sport Bleu Roi', catName: 'Clothing', subName: 'Shoes',
      price: 22000, comparePrice: 0, flags: { isFeatured: true }, images: ['sneakers-blue-royal.jpg'],
      colors: ['Blue'], sizes: shoeSizesBank,
      description: 'Baskets basses en suède bleu roi avec semelle plateforme blanche, look sport premium.',
    },
    {
      name: 'Machine à Laver Semi-Automatique 2 Bacs', catName: 'Home Decor', subName: 'Appliances',
      price: 85000, comparePrice: 0, flags: { isFeatured: true }, images: ['washing-machine-midea.jpg'],
      colors: [], sizes: [],
      description: 'Machine à laver semi-automatique double bac, lavage et essorage séparés, idéale pour un usage domestique.',
    },
    {
      name: 'Baskets CAMPUS Noir & Blanc Suède', catName: 'Clothing', subName: 'Shoes',
      price: 19000, comparePrice: 23000, flags: { isBestSeller: true, isDealOfTheDay: true },
      images: ['sneakers-black-white-campus-1.jpg', 'sneakers-black-white-campus-2.jpg'],
      colors: ['Black'], sizes: shoeSizesBank,
      description: 'Baskets basses noires et blanches en suède, semelle gomme, style campus classique.',
    },
    {
      name: 'Mocassins Cuir Nubuck Noir à Pampilles', catName: 'Clothing', subName: 'Shoes',
      price: 25000, comparePrice: 0, flags: { isNewArrival: true }, images: ['loafers-black-nubuck.jpg'],
      colors: ['Black'], sizes: shoeSizesBank,
      description: 'Mocassins en cuir nubuck noir avec pampilles, semelle épaisse crantée, look habillé-décontracté.',
    },
    {
      name: 'Baskets Montantes Noires Style Rétro', catName: 'Clothing', subName: 'Shoes',
      price: 30000, comparePrice: 35000, flags: { isDealOfTheDay: true }, images: ['sneakers-black-retro-hightop.jpg'],
      colors: ['Black'], sizes: shoeSizesBank,
      description: 'Baskets montantes noires tout-terrain, coussin d\u2019air visible au talon, style rétro basketball.',
    },
    {
      name: 'Baskets Enfant Basketball Multicolore', catName: 'Clothing', subName: 'Kids',
      price: 11000, comparePrice: 0, flags: {}, images: ['sneakers-kids-multicolor.jpg'],
      colors: ['Blue', 'Orange'], sizes: ['26', '27', '28', '29', '30'],
      description: 'Baskets scratch multicolores pour enfant, motifs basketball, semelle légère et flexible.',
    },
    {
      name: 'Coque MagSafe Silicone pour iPhone - Bleu Gris', catName: 'Electronics', subName: 'Accessories',
      price: 6000, comparePrice: 0, flags: {}, images: ['phone-case-magsafe-blue.jpg'],
      colors: ['Grey'], sizes: [],
      description: 'Coque silicone compatible charge magnétique, finition douce, protection complète des angles.',
    },
    {
      name: 'Cartable Bleu Marine & Rouge - École', catName: 'Clothing', subName: 'Bags',
      price: 16000, comparePrice: 0, flags: {}, images: ['backpack-navy-red-stripe.jpg'],
      colors: ['Navy', 'Red'], sizes: [],
      description: 'Cartable scolaire bleu marine et rouge avec bandes réfléchissantes, plusieurs compartiments.',
    },
    {
      name: 'Ensemble Sac à Dos Motif Écossais Beige (3 pièces)', catName: 'Clothing', subName: 'Bags',
      price: 22000, comparePrice: 27000, flags: { isFeatured: true }, images: ['backpack-check-pattern-set.jpg'],
      colors: ['Beige'], sizes: [],
      description: 'Ensemble 3 pièces sac à dos, mini sac et trousse assortie, motif écossais tendance, finitions dorées.',
    },
    {
      name: 'Baskets de Sport Noires - Look Urbain', catName: 'Clothing', subName: 'Shoes',
      price: 16000, comparePrice: 0, flags: {}, images: ['sneakers-black-urban.jpg'],
      colors: ['Black'], sizes: shoeSizesBank,
      description: 'Baskets de sport tout-noir, empiècements suède, semelle running légère.',
    },
    {
      name: 'Cartable Violet Enfant', catName: 'Clothing', subName: 'Bags',
      price: 17000, comparePrice: 0, flags: { isNewArrival: true }, images: ['backpack-purple-kids.jpg'],
      colors: ['Purple', 'Pink'], sizes: [],
      description: 'Cartable rigide violet et rose pour enfant, dos ergonomique, trousse assortie incluse.',
    },
    {
      name: 'Canapé 3 Places Cuir Bordeaux', catName: 'Home Decor', subName: 'Furniture',
      price: 180000, comparePrice: 0, flags: { isFeatured: true }, images: ['sofa-burgundy-leather.jpg'],
      colors: [], sizes: [],
      description: 'Canapé 3 places en simili-cuir bordeaux, assise confortable, pieds dorés.',
    },
  ];

  for (const item of realPhotoProducts) {
    const catEntry = categoryMap[item.catName];
    if (!catEntry) continue; // eslint-disable-line no-continue
    const subDoc = item.subName ? catEntry.subs[item.subName] : null;
    const seller = sellers[skuCounter % sellers.length];

    const product = await Product.create({
      name: item.name,
      description: item.description,
      price: item.price,
      comparePrice: item.comparePrice || 0,
      images: item.images.map(localImage),
      category: catEntry.doc._id,
      subcategory: subDoc ? subDoc._id : null,
      brand: 'BUEA ONLINE SHOP',
      stock: 15 + (skuCounter % 25),
      sku: `BOS-SKU-${skuCounter}`,
      colors: item.colors,
      sizes: item.sizes,
      sellerId: item.catName === 'Electronics' || item.catName === 'Clothing' ? seller._id : null,
      isFeatured: !!item.flags.isFeatured,
      isBestSeller: !!item.flags.isBestSeller,
      isNewArrival: !!item.flags.isNewArrival,
      isDealOfTheDay: !!item.flags.isDealOfTheDay,
      rating: 3.8 + ((skuCounter % 12) / 10),
      reviewCount: 15 + (skuCounter % 90),
    });

    createdProducts.push(product);
    skuCounter += 1;
  }
  console.log(`[seed] ${realPhotoProducts.length} real-photo products created (${createdProducts.length} total)`);

  // ---------- Demo Orders ----------
  const demoStatuses = ['PENDING_CONFIRMATION', 'WHATSAPP_CONTACTED', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  for (let i = 0; i < 6; i += 1) {
    const customer = customers[i];
    const product1 = createdProducts[i * 3 % createdProducts.length];
    const product2 = createdProducts[(i * 3 + 1) % createdProducts.length];
    const subtotal = product1.price + product2.price * 2;
    const deliveryFee = subtotal >= env.DELIVERY_FREE_THRESHOLD ? 0 : env.DELIVERY_FEE_STANDARD;
    const total = subtotal + deliveryFee;
    const orderNumber = await generateOrderNumber();
    const status = demoStatuses[i % demoStatuses.length];

    await Order.create({
      orderNumber,
      user: customer._id,
      isGuestOrder: false,
      items: [
        {
          product: product1._id, name: product1.name, image: product1.images[0],
          price: product1.price, quantity: 1, sellerId: product1.sellerId,
        },
        {
          product: product2._id, name: product2.name, image: product2.images[0],
          price: product2.price, quantity: 2, sellerId: product2.sellerId,
        },
      ],
      shippingAddress: {
        fullName: customer.name,
        phone: customer.phone,
        whatsappNumber: customer.phone,
        city: 'Buea',
        neighborhood: customer.addresses[0].neighborhood,
        address: customer.addresses[0].address,
        deliveryInstructions: 'Call on arrival.',
      },
      subtotal,
      deliveryFee,
      discount: 0,
      total,
      paymentMethod: i % 2 === 0 ? 'MTN_MOBILE_MONEY' : 'ORANGE_MONEY',
      paymentStatus: status === 'DELIVERED' ? 'PAID' : 'PENDING',
      orderStatus: status,
      deliveredAt: status === 'DELIVERED' ? new Date() : null,
      paidAt: status === 'DELIVERED' ? new Date() : null,
    });
  }
  console.log('[seed] 6 demo orders created');

  console.log('\n[seed] Done! Demo credentials:');
  console.log('  Admin:    admin@bueaonlineshop.com / Admin@12345');
  console.log('  Seller:   seller1@bueaonlineshop.com / Seller@12345');
  console.log('  Customer: customer1@example.com / Customer@123');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
