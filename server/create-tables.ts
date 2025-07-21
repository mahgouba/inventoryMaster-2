import { pool } from './db';

async function createTables() {
  const client = await pool.connect();
  
  try {
    console.log('Creating database tables...');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'seller',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create manufacturers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS manufacturers (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        logo TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create companies table
    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT,
        phone TEXT,
        email TEXT,
        registration_number TEXT,
        tax_number TEXT,
        license_number TEXT,
        website TEXT,
        logo TEXT,
        stamp TEXT,
        primary_color TEXT DEFAULT '#0f766e',
        secondary_color TEXT DEFAULT '#0f766e',
        accent_color TEXT DEFAULT '#0f766e',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create inventory_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory_items (
        id SERIAL PRIMARY KEY,
        manufacturer TEXT NOT NULL,
        category TEXT NOT NULL,
        trim_level TEXT,
        engine_capacity TEXT,
        year INTEGER,
        exterior_color TEXT,
        interior_color TEXT,
        chassis_number TEXT UNIQUE,
        status TEXT DEFAULT 'متوفر',
        import_type TEXT,
        location TEXT,
        price DECIMAL(15,2),
        buyer TEXT,
        sale_price DECIMAL(15,2),
        profit DECIMAL(15,2),
        engineer TEXT,
        arrival_date DATE,
        sale_date DATE,
        reservation_date DATE,
        reserved_by TEXT,
        reservation_notes TEXT,
        notes TEXT,
        images TEXT[],
        is_sold BOOLEAN DEFAULT FALSE,
        detailed_specifications TEXT,
        ownership_type TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create specifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS specifications (
        id SERIAL PRIMARY KEY,
        manufacturer TEXT NOT NULL,
        category TEXT NOT NULL,
        trim_level TEXT NOT NULL,
        year INTEGER NOT NULL,
        engine_capacity TEXT NOT NULL,
        engine_type TEXT,
        transmission TEXT,
        drivetrain TEXT,
        fuel_type TEXT,
        seating_capacity INTEGER,
        acceleration TEXT,
        top_speed TEXT,
        fuel_economy TEXT,
        safety_features TEXT[],
        comfort_features TEXT[],
        technology_features TEXT[],
        warranty_info TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(manufacturer, category, trim_level, year, engine_capacity)
      );
    `);
    
    // Create trim_levels table
    await client.query(`
      CREATE TABLE IF NOT EXISTS trim_levels (
        id SERIAL PRIMARY KEY,
        manufacturer TEXT NOT NULL,
        category TEXT NOT NULL,
        trim_level TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(manufacturer, category, trim_level)
      );
    `);
    
    // Create quotations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS quotations (
        id SERIAL PRIMARY KEY,
        quote_number TEXT UNIQUE NOT NULL,
        inventory_item_id INTEGER,
        manufacturer TEXT,
        category TEXT,
        trim_level TEXT,
        year INTEGER,
        exterior_color TEXT,
        interior_color TEXT,
        chassis_number TEXT,
        engine_capacity TEXT,
        specifications TEXT,
        base_price TEXT,
        final_price TEXT,
        customer_name TEXT,
        customer_phone TEXT,
        customer_email TEXT,
        customer_title TEXT,
        notes TEXT,
        status TEXT DEFAULT 'مسودة',
        valid_until DATE,
        created_by TEXT,
        company_data TEXT,
        representative_data TEXT,
        pricing_details TEXT,
        qr_code_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create locations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        address TEXT,
        capacity INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create appearance_settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS appearance_settings (
        id SERIAL PRIMARY KEY,
        theme_color TEXT DEFAULT '#0f766e',
        secondary_color TEXT DEFAULT '#0f766e',
        accent_color TEXT DEFAULT '#0f766e',
        logo TEXT,
        company_name TEXT,
        favicon TEXT,
        dark_mode_enabled BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create system_settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        setting_key TEXT PRIMARY KEY,
        setting_value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Database tables created successfully!');
    
    // Insert default admin user if not exists
    await client.query(`
      INSERT INTO users (username, password, role) 
      VALUES ('admin', '$2b$10$K4N/V9Pf7LoMGQYU2c2gzOE5j3nYZ8wFY2P.QVH8X9zL1mM3nN5eG', 'admin')
      ON CONFLICT (username) DO NOTHING;
    `);
    
    // Insert default seller user if not exists
    await client.query(`
      INSERT INTO users (username, password, role) 
      VALUES ('seller', '$2b$10$K4N/V9Pf7LoMGQYU2c2gzOE5j3nYZ8wFY2P.QVH8X9zL1mM3nN5eG', 'seller')
      ON CONFLICT (username) DO NOTHING;
    `);
    
    console.log('Default users created (admin/admin123, seller/seller123)');
    
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

createTables().then(() => {
  console.log('Database initialization complete');
  process.exit(0);
}).catch(error => {
  console.error('Database initialization failed:', error);
  process.exit(1);
});