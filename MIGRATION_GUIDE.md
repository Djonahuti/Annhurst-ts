# Database Migration Guide: From cpanel_db.sql to Prisma

This guide will help you migrate your existing data from the cpanel_db.sql file to your Prisma-managed database.

## Prerequisites

1. Ensure your Prisma schema is set up correctly
2. Have your database connection string configured in `.env`
3. Run `npx prisma generate` to generate the Prisma client

## Step 1: Set up your database

```bash
# Generate Prisma client
npx prisma generate

# Push your schema to the database (this creates the tables)
npx prisma db push

# Or if you prefer migrations:
npx prisma migrate dev --name init
```

## Step 2: Create a migration script

Create a file called `migrate-data.js` in your project root:

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function migrateData() {
  try {
    console.log('Starting data migration...');

    // 1. Migrate Admins
    console.log('Migrating admins...');
    const adminData = [
      {
        id: 1,
        email: 'admin@annhurst-gsl.com',
        role: 'admin',
        name: 'Administrator',
        password: await bcrypt.hash('123', 10),
        banned: false,
      },
      {
        id: 2,
        email: 'dutibe@annhurst-gsl.com',
        role: 'editor',
        name: 'David',
        password: await bcrypt.hash('123', 10),
        banned: false,
      },
      {
        id: 3,
        email: 'deboraheidehen@gmail.com',
        role: 'viewer',
        name: 'Deborah',
        password: await bcrypt.hash('123', 10),
        banned: false,
      }
    ];

    for (const admin of adminData) {
      await prisma.admins.upsert({
        where: { id: admin.id },
        update: admin,
        create: admin,
      });
    }

    // 2. Migrate Coordinators
    console.log('Migrating coordinators...');
    const coordinatorData = [
      {
        id: 1,
        email: 'chuksmanny97@gmail.com',
        password: await bcrypt.hash('123', 10),
        name: 'Emmanuel',
        phone: ['09054257289'],
        user_id: '8f05ba64-005d-4c56-b426-3badd4596c0f',
        banned: false,
      },
      {
        id: 2,
        email: 'abisomukailaabiso@gmail.com',
        password: await bcrypt.hash('123', 10),
        name: 'Mukaila',
        phone: ['09063750685'],
        user_id: '646ee4e2-f49f-4789-bb75-0bec72a64d60',
        banned: false,
      },
      {
        id: 3,
        email: 'rolandogbaisi75@gmail.com',
        password: await bcrypt.hash('123', 10),
        name: 'Roland',
        phone: ['08122574825'],
        user_id: 'd74e5de5-02e4-4bd1-9249-92ca931012f5',
        banned: false,
      },
      {
        id: 4,
        email: 'cereoah@annhurst-gsl.com',
        password: await bcrypt.hash('123', 10),
        name: 'Cleophas',
        phone: ['07065226741'],
        user_id: '1a145b44-0dc3-41d1-b024-36fbca710578',
        banned: false,
      }
    ];

    for (const coordinator of coordinatorData) {
      await prisma.coordinators.upsert({
        where: { id: coordinator.id },
        update: coordinator,
        create: coordinator,
      });
    }

    // 3. Migrate Drivers (first 10 as example)
    console.log('Migrating drivers...');
    const driverData = [
      {
        id: 1,
        email: 'taiwo@annhurst-gsl.com',
        password: await bcrypt.hash('123456', 10),
        name: 'Taiwo Tola Seun',
        dob: '1990-01-01',
        nin: 1234567890,
        phone: ['08164645709', '09116140644'],
        address: ['AGBEDE TRANSFORMER, LAST BUS STOP, BALE OLOMI HOUSE, OFF AGRIC, IKORODU, LAGOS'],
        kyc: true,
        banned: false,
      },
      {
        id: 2,
        email: 'oladayo@annhurst-gsl.com',
        password: await bcrypt.hash('123456', 10),
        name: 'OLADAYO CHRISTOPHER SUNDAY',
        dob: '1990-01-02',
        nin: 1234567890,
        phone: ['09038065002'],
        address: ['4, TRANSIT VILLAGE, ADETOKUNBO ADEMOLA, VICTORIA ISLAND'],
        kyc: false,
        banned: false,
      },
      // Add more drivers as needed...
    ];

    for (const driver of driverData) {
      await prisma.driver.upsert({
        where: { id: driver.id },
        update: driver,
        create: driver,
      });
    }

    // 4. Migrate Subjects
    console.log('Migrating subjects...');
    const subjectData = [
      { id: 1, subject: 'Transaction Complaint' },
      { id: 2, subject: 'Bus Down (Engine Issue)' },
      { id: 3, subject: 'Bus Down (Accident)' },
      { id: 4, subject: 'Bus Down (Gear Issue)' },
      { id: 5, subject: 'Bus Seized (LASTMA/Police)' }
    ];

    for (const subject of subjectData) {
      await prisma.subject.upsert({
        where: { id: subject.id },
        update: subject,
        create: subject,
      });
    }

    // 5. Migrate Settings
    console.log('Migrating settings...');
    const settingsData = {
      id: 1,
      phone: ['+234 809 318 3556'],
      email: ['customerservices@annhurst-gsl.com'],
      address: '13B Obafemi Anibaba\nAdmiralty Way Lekki\nLagos, Nigeria',
      logo: 'settings/1759583109440-ats1.png',
      footer_write: 'Your trusted partner in bus higher purchase solutions. We provide comprehensive financing options for transportation businesses across the globe.',
      footer_head: 'Quick Links',
      footer_head2: 'Our Services',
      services: ['Bus Financing', 'Higher Purchase', 'Lease Options', 'Fleet Management', 'Insurance Solutions'],
      bottom_left: 'Annhurst Transport Service Limited. All rights reserved.',
      bottom_right: ['Privacy Policy', 'Terms of Service'],
      logo_blk: 'settings/1759582964099-ats.png'
    };

    await prisma.settings.upsert({
      where: { id: settingsData.id },
      update: settingsData,
      create: settingsData,
    });

    // 6. Migrate Pages
    console.log('Migrating pages...');
    const pagesData = [
      {
        id: 1,
        title: 'About Us',
        slug: 'about',
        text: 'Our impact in numbers',
        meta_description: 'Learn about our company mission and values',
        is_published: true,
        views: 10,
        // Add all other page fields from your SQL data
      },
      // Add other pages...
    ];

    for (const page of pagesData) {
      await prisma.pages.upsert({
        where: { id: page.id },
        update: page,
        create: page,
      });
    }

    console.log('Data migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateData();
```

## Step 3: Run the migration

```bash
# Install bcryptjs if not already installed
npm install bcryptjs

# Run the migration script
node migrate-data.js
```

## Step 4: Migrate Buses and Payments

For buses and payments, you'll need to be more careful about foreign key relationships. Here's a sample for buses:

```javascript
// Add this to your migration script
async function migrateBuses() {
  const busesData = [
    {
      id: 1,
      bus_code: 'L07',
      driver: 3, // Reference to driver ID
      letter: false,
      e_payment: 60000,
      contract_date: new Date('2025-04-07'),
      agreed_date: new Date('2027-01-03'),
      date_collected: new Date('2025-04-12'),
      start_date: new Date('2025-04-14'),
      first_pay: new Date('2025-04-20'),
      initial_owe: 5600000,
      deposited: 250000,
      t_income: 2350000,
      plate_no: 'KTU 724 YK',
      coordinator: 4, // Reference to coordinator ID
    },
    // Add more buses...
  ];

  for (const bus of busesData) {
    await prisma.buses.upsert({
      where: { id: bus.id },
      update: bus,
      create: bus,
    });
  }
}
```

## Step 5: Verify the migration

```bash
# Check your data
npx prisma studio
```

## Step 6: Update your environment variables

Make sure your `.env` file has the correct database URL:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## Important Notes:

1. **Password Hashing**: All passwords in your SQL file are plain text. The migration script hashes them using bcryptjs.

2. **Foreign Keys**: Make sure to migrate tables in the correct order (admins, coordinators, drivers first, then buses, then payments).

3. **Data Types**: Some fields might need type conversion (e.g., BigInt for IDs, Date objects for dates).

4. **File Paths**: Update any Supabase storage URLs to point to your local `/uploads/` directory.

5. **Testing**: Test thoroughly after migration to ensure all relationships work correctly.

## Alternative: Direct SQL Import

If you prefer, you can also modify your SQL file to work directly with Prisma:

1. Remove the `OVERRIDING SYSTEM VALUE` clauses
2. Update the sequence values
3. Import directly into your PostgreSQL database
4. Run `npx prisma db pull` to sync your schema

Choose the method that works best for your setup!
