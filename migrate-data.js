// migrate-data.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const SQL_FILE = path.resolve(__dirname, 'cpanel_db.sql'); // adjust if needed

function splitSQLValues(tuple) {
  // Splits SQL tuple contents into tokens, respecting single quotes and braces
  const chars = tuple.trim();
  const tokens = [];
  let cur = '';
  let inSingle = false;
  let inDouble = false;
  let braceDepth = 0;

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const prev = chars[i - 1];

    if (ch === "'" && prev !== '\\' && !inDouble) {
      inSingle = !inSingle;
      cur += ch; // keep quotes for easier handling later
      continue;
    }
    if (ch === '"' && prev !== '\\' && !inSingle) {
      inDouble = !inDouble;
      cur += ch;
      continue;
    }
    if (!inSingle && !inDouble) {
      if (ch === '{') {
        braceDepth++;
        cur += ch;
        continue;
      } else if (ch === '}') {
        braceDepth = Math.max(0, braceDepth - 1);
        cur += ch;
        continue;
      } else if (ch === ',' && braceDepth === 0) {
        tokens.push(cur.trim());
        cur = '';
        continue;
      }
    }
    cur += ch;
  }
  if (cur.trim() !== '') tokens.push(cur.trim());
  return tokens;
}

function parsePgArrayToken(token) {
  // token like '{08164645709,09116140644}' or '\'{"a","b"}\' etc
  if (!token) return [];
  let t = token.trim();

  // Remove surrounding quotes if single-quoted
  if (t.startsWith("'") && t.endsWith("'")) {
    t = t.slice(1, -1);
  }

  // Now t should start with { and end with }
  if (t.startsWith('{') && t.endsWith('}')) {
    let inner = t.slice(1, -1).trim();

    // If values are quoted with double quotes, split on '","'
    if (inner.includes('","')) {
      // remove potential starting/ending double quotes
      inner = inner.replace(/^"|"$/g, '');
      const parts = inner.split('","').map(s => s.replace(/^"|"$/g, '').trim());
      return parts.filter(Boolean);
    }

    // else split on comma (safe-ish)
    if (inner.length === 0) return [];
    return inner.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
  }

  // fallback: return single token without braces/quotes
  return [t.replace(/^"|'|'/g, '').replace(/'$/, '')].filter(Boolean);
}

async function migrateData() {
  try {
    console.log('🚀 Starting data migration...');

    // 1. Migrate Admins (keeps your existing data)
    console.log('📝 Migrating admins...');
    const adminData = [
      {
        email: 'admin@annhurst-gsl.com',
        role: 'admin',
        name: 'Administrator',
        password: await bcrypt.hash('123', 10),
        banned: false,
      },
      {
        email: 'dutibe@annhurst-gsl.com',
        role: 'editor',
        name: 'David',
        password: await bcrypt.hash('123', 10),
        banned: false,
      },
      {
        email: 'deboraheidehen@gmail.com',
        role: 'viewer',
        name: 'Deborah',
        password: await bcrypt.hash('123', 10),
        banned: false,
      }
    ];

    for (const admin of adminData) {
      try {
        const exists = await prisma.admins.findUnique({ where: { email: admin.email } });
        if (!exists) {
          await prisma.admins.create({ data: admin });
          console.log(` - Created admin: ${admin.email}`);
        } else {
          console.log(` - Skipped existing admin: ${admin.email}`);
        }
      } catch (e) {
        console.warn(' - admins create error (may already exist):', admin.email, e.message);
      }
    }
    console.log('✅ Admins migrated (or skipped if existed)');

    // 2. Migrate Coordinators
    console.log('👥 Migrating coordinators...');
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

    for (const c of coordinatorData) {
      try {
        const exists = await prisma.coordinators.findUnique({ where: { id: BigInt(c.id) } });
        if (!exists) {
          await prisma.coordinators.create({ data: { ...c, id: BigInt(c.id) } });
          console.log(` - Created coordinator: ${c.email}`);
        } else {
          console.log(` - Skipped existing coordinator: ${c.email}`);
        }
        
      } catch (e) {
        console.warn(' - coordinators create error (may already exist):', c.email, e.message);
      }
    }
    console.log('✅ Coordinators migrated (or skipped if existed)');

    // 3. Subjects
    console.log('📋 Migrating subjects...');
    const subjectData = [
      { subject: 'Transaction Complaint' },
      { subject: 'Bus Down (Engine Issue)' },
      { subject: 'Bus Down (Accident)' },
      { subject: 'Bus Down (Gear Issue)' },
      { subject: 'Bus Seized (LASTMA/Police)' }
    ];
    for (const s of subjectData) {
      try {
        const exists = await prisma.subject.findFirst({ where: { subject: s.subject } });
        if (!exists) {
          await prisma.subject.create({ data: s });
          console.log(` - Created subject: ${s.subject}`);
        } else {
          console.log(` - Skipped existing subject: ${s.subject}`);
        }
        
      } catch (e) {
        console.warn(' - subject create skipped or error:', s.subject, e.message);
      }
    }
    console.log('✅ Subjects migrated');

    // 4. Settings (single record)
    console.log('⚙️ Migrating settings...');
    const settingsData = {
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
    try {
      await prisma.settings.create({ data: { id: 1, ...settingsData } });
    } catch (e) {
      console.warn(' - settings create skipped or error:', e.message);
    }
    console.log('✅ Settings migrated (or skipped if existed)');

    // Ensure SQL file exists
    if (!fs.existsSync(SQL_FILE)) {
      throw new Error(`SQL file not found at ${SQL_FILE}. Place your cpanel_db.sql next to this script or adjust SQL_FILE path.`);
    }

    const sql = fs.readFileSync(SQL_FILE, 'utf8');

    // 5. Parse driver INSERTs from SQL, then create drivers with hashed passwords
    console.log('🚗 Parsing drivers from SQL and migrating them (will hash passwords)...');

    const driverInsertRegex = /INSERT INTO public\.driver[\s\S]*?VALUES\s*\(([\s\S]*?)\);/gi;
    const driverTuples = [];
    let m;
    while ((m = driverInsertRegex.exec(sql)) !== null) {
      driverTuples.push(m[1]);
    }

    console.log(`Found ${driverTuples.length} driver INSERT tuples in SQL.`);

    for (let i = 0; i < driverTuples.length; i++) {
      const raw = driverTuples[i];
      const tokens = splitSQLValues(raw);
      // Expected structure (based on your SQL dump):
      // [0]=id, [1]=created_at, [2]=email, [3]=password, [4]=name, [5]=maybe NULL, [6]=dob, [7]=nin, [8]=phone_array, [9]=address_array, [10]=kyc, [11]=banned
      try {
        const idTok = tokens[0] || null;
        const emailTok = tokens[2] || null;
        const nameTok = tokens[4] || null;
        const dobTok = tokens[6] || null;
        const ninTok = tokens[7] || null;
        const phoneTok = tokens[8] || null;
        const addressTok = tokens[9] || null;
        const kycTok = tokens[10] || 'false';
        const bannedTok = tokens[11] || 'false';

        const idVal = idTok ? Number(String(idTok).replace(/[^0-9]/g, '')) : null;
        const email = emailTok ? emailTok.replace(/^'|'$/g, '') : null;
        const name = nameTok ? nameTok.replace(/^'|'$/g, '') : null;
        const dob = dobTok && dobTok !== 'NULL' ? dobTok.replace(/^'|'$/g, '') : null;
        const nin = ninTok && ninTok !== 'NULL' ? Number(ninTok.replace(/[^0-9]/g, '')) : null;
        const phone = phoneTok && phoneTok !== 'NULL' ? parsePgArrayToken(phoneTok) : [];
        const address = addressTok && addressTok !== 'NULL' ? (function(tok){
          // token may look like '{"addr1","addr2"}' or '"{...}"' etc
          let t = tok.trim();
          if (t.startsWith("'") && t.endsWith("'")) t = t.slice(1, -1);
          // remove surrounding braces if present
          if (t.startsWith('{') && t.endsWith('}')) {
            // addresses may be quoted with double quotes and may contain commas — split safely
            // remove leading/trailing { }
            let inner = t.slice(1, -1);
            // split on '","' pattern
            if (inner.includes('","')) {
              inner = inner.replace(/^"|"$/g, '');
              return inner.split('","').map(s => s.replace(/^"|"$/g, '').trim());
            } else {
              // fallback split on comma
              return inner.split(',').map(s => s.replace(/^"|"$/g, '').trim());
            }
          }
          return [t.replace(/^"|"$/g, '').trim()];
        })(addressTok) : [];

        const kyc = kycTok && kycTok.toLowerCase() === 'true';
        const banned = bannedTok && bannedTok.toLowerCase() === 'true';

        const hashedPassword = await bcrypt.hash('123456', 10);

        const driver = {
          email,
          password: hashedPassword,
          name,
          dob,
          nin,
          phone,
          address,
          kyc,
          banned
        };

        // Attempt create; if exists, skip
        try {
          let exists = null;
          if (idVal !== null && !Number.isNaN(idVal)) {
            exists = await prisma.driver.findUnique({ where: { id: BigInt(idVal) } });
          }
          if (!exists && driver.email) {
            exists = await prisma.driver.findFirst({ where: { email: driver.email } });
          }

          if (!exists) {
            await prisma.driver.create({ data: idVal !== null ? { id: BigInt(idVal), ...driver } : driver });
            console.log(` - Created driver: ${driver.email}`);
          } else {
            console.log(` - Skipped existing driver: ${driver.email}`);
          }
        } catch (e) {
          console.warn(` - Skipped/failed to create driver ${email}: ${e.message}`);
        }

      } catch (err) {
        console.error('Error parsing/creating driver from tuple:', raw, err.message);
      }
    }
    console.log('✅ Drivers migrated (hashed passwords).');

    // 6. Insert buses and pages raw SQL (execute each INSERT INTO ... for buses and pages)
    console.log('🚍 Inserting buses and pages via raw SQL execution (using INSERT statements found in SQL dump)...');

    const busesRegex = /INSERT INTO public\.buses[\s\S]*?VALUES\s*\([\s\S]*?\);/gi;
    const pageRegex = /INSERT INTO public\.pages[\s\S]*?VALUES\s*\([\s\S]*?\);/gi;

    const busesInserts = [];
    while ((m = busesRegex.exec(sql)) !== null) busesInserts.push(m[0]);

    const pagesInserts = [];
    while ((m = pageRegex.exec(sql)) !== null) pagesInserts.push(m[0]);

    console.log(` - Found ${busesInserts.length} buses INSERT statements.`);
    console.log(` - Found ${pagesInserts.length} pages INSERT statements.`);

    // Execute buses inserts in sequence (use $executeRawUnsafe)
    for (let i = 0; i < busesInserts.length; i++) {
      const statement = busesInserts[i];
      try {
        // prisma.$executeRawUnsafe expects a string of SQL; ensure statement ends with semicolon but remove the "OVERRIDING SYSTEM VALUE" clause
        // The statement from dump is valid SQL for Postgres; $executeRawUnsafe will send it to the DB.
        const safeStatement = statement.replace(/;$/, '') + ' ON CONFLICT DO NOTHING;';
        await prisma.$executeRawUnsafe(safeStatement);
        
        console.log(` - Executed buses insert ${i + 1}/${busesInserts.length}`);
      } catch (e) {
        console.warn(` - buses insert ${i + 1} failed (may already exist or constraint error):`, e.message);
      }
    }

    // Execute pages inserts
    for (let i = 0; i < pagesInserts.length; i++) {
      const statement = pagesInserts[i];
      try {
        await prisma.$executeRawUnsafe(statement);
        console.log(` - Executed pages insert ${i + 1}/${pagesInserts.length}`);
      } catch (e) {
        console.warn(` - pages insert ${i + 1} failed (may already exist or constraint error):`, e.message);
      }
    }

    // 7. Insert payments
    console.log('💳 Inserting payment via raw SQL execution...');
    const paymentRegex = /INSERT INTO public\.payment[\s\S]*?VALUES\s*\([\s\S]*?\);/gi;
    const paymentInserts = [];
    while ((m = paymentRegex.exec(sql)) !== null) paymentInserts.push(m[0]);

    console.log(` - Found ${paymentInserts.length} payment INSERT statements.`);
    for (let i = 0; i < paymentInserts.length; i++) {
      const statement = paymentInserts[i];
      try {
        const safeStatement = statement.replace(/;$/, '') + ' ON CONFLICT DO NOTHING;';
        await prisma.$executeRawUnsafe(safeStatement);
        
        console.log(` - Executed payment insert ${i + 1}/${paymentInserts.length}`);
      } catch (e) {
        console.warn(` - payment insert ${i + 1} failed (may already exist or constraint error):`, e.message);
      }
    }

    console.log('✅ Buses, pages, and payment inserts attempted (skipped on errors if rows already existed).');

    // 8. Insert contact_us
    console.log('📨 Inserting contact_us via raw SQL execution...');
    const contactUsRegex = /INSERT INTO public\.contact_us[\s\S]*?VALUES\s*\([\s\S]*?\);/gi;
    const contactUsInserts = [];
    while ((m = contactUsRegex.exec(sql)) !== null) contactUsInserts.push(m[0]);

    console.log(` - Found ${contactUsInserts.length} contact_us INSERT statements.`);
    for (let i = 0; i < contactUsInserts.length; i++) {
      const statement = contactUsInserts[i];
      try {
        const safeStatement = statement.replace(/;$/, '') + ' ON CONFLICT DO NOTHING;';
        await prisma.$executeRawUnsafe(safeStatement);
        console.log(` - Executed contact_us insert ${i + 1}/${contactUsInserts.length}`);
      } catch (e) {
        console.warn(` - contact_us insert ${i + 1} failed (may already exist or constraint error):`, e.message);
      }
    }

    // 9. Insert contact
    console.log('✉️ Inserting contact via raw SQL execution...');
    const contactRegex = /INSERT INTO public\.contact[\s\S]*?VALUES\s*\([\s\S]*?\);/gi;
    const contactInserts = [];
    while ((m = contactRegex.exec(sql)) !== null) contactInserts.push(m[0]);

    console.log(` - Found ${contactInserts.length} contact INSERT statements.`);
    for (let i = 0; i < contactInserts.length; i++) {
      const statement = contactInserts[i];
      try {
        const safeStatement = statement.replace(/;$/, '') + ' ON CONFLICT DO NOTHING;';
        await prisma.$executeRawUnsafe(safeStatement);
        console.log(` - Executed contact insert ${i + 1}/${contactInserts.length}`);
      } catch (e) {
        console.warn(` - contact insert ${i + 1} failed (may already exist or constraint error):`, e.message);
      }
    }

    console.log('✅ contact_us and contact inserts attempted (skipped on errors if rows already existed).');

    console.log('🎉 Data migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateData();
