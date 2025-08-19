import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const DATABASE_URL = "postgresql://neondb_owner:npg_E9MhlZt2CTGz@ep-dry-night-afnnpvw9-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function checkUsers() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    // Check if users exist
    const result = await client.query('SELECT id, username, role, password FROM users LIMIT 10');
    console.log('Found users:', result.rows.length);
    
    for (const user of result.rows) {
      console.log(`User: ${user.username}, Role: ${user.role}`);
      
      // Test if password is already hashed or plain text
      const testPassword = 'admin123';
      const isHashed = await bcrypt.compare(testPassword, user.password).catch(() => false);
      console.log(`  Password is hashed: ${isHashed}`);
      
      if (!isHashed) {
        console.log(`  Current password: ${user.password}`);
        // Hash the password if it's not already hashed
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await client.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, user.id]);
        console.log(`  Updated password for ${user.username}`);
      }
    }
    
    client.release();
    console.log('User check completed!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkUsers();