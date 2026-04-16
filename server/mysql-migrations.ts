import mysql from 'mysql2/promise';

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('[DB] No DATABASE_URL');
    return;
  }

  const pool = mysql.createPool({
    uri: connectionString,
    waitForConnections: true,
    connectionLimit: 10
  });

  const query = async (sql: string, params?: any[]) => {
    const [rows] = await pool.execute(sql, params);
    return { rows };
  };

  try {
    console.log('[DB] Running MySQL migrations...');

    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(200) NOT NULL,
        email VARCHAR(200) UNIQUE NOT NULL,
        phone VARCHAR(30),
        password_hash TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        sub_role VARCHAR(30),
        avatar_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('[DB] users table created');

    // Properties table
    await query(`
      CREATE TABLE IF NOT EXISTS properties (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(300),
        title_ar VARCHAR(300),
        description TEXT,
        description_ar TEXT,
        type VARCHAR(50),
        purpose VARCHAR(20) DEFAULT 'sale',
        price DECIMAL(15,2),
        area DECIMAL(10,2),
        rooms INT,
        bedrooms INT,
        bathrooms INT,
        floor INT,
        address TEXT,
        district VARCHAR(100),
        city VARCHAR(100),
        contact_phone VARCHAR(20) DEFAULT '01100111618',
        owner_id INT,
        status VARCHAR(20) DEFAULT 'pending',
        is_featured BOOLEAN DEFAULT false,
        down_payment DECIMAL(15,2),
        delivery_status VARCHAR(50),
        finishing_type VARCHAR(50),
        google_maps_url TEXT,
        purpose VARCHAR(20) DEFAULT 'sale',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('[DB] properties table created');

    // Property images
    await query(`
      CREATE TABLE IF NOT EXISTS property_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        property_id INT NOT NULL,
        url TEXT NOT NULL,
        is_primary BOOLEAN DEFAULT false,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Saved properties
    await query(`
      CREATE TABLE IF NOT EXISTS saved_properties (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        property_id INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_property (user_id, property_id)
      )
    `);

    // Notifications
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        title VARCHAR(200),
        message TEXT,
        type VARCHAR(50),
        is_read BOOLEAN DEFAULT false,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Payment requests
    await query(`
      CREATE TABLE IF NOT EXISTS payment_requests (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        property_id INT,
        amount DECIMAL(15,2),
        payment_method VARCHAR(50),
        status VARCHAR(20) DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Support tickets
    await query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        subject VARCHAR(300),
        status VARCHAR(20) DEFAULT 'open',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Support messages
    await query(`
      CREATE TABLE IF NOT EXISTS support_messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        ticket_id INT NOT NULL,
        sender_id INT NOT NULL,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Property chat
    await query(`
      CREATE TABLE IF NOT EXISTS property_chat_messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        property_id INT NOT NULL,
        user_id INT NOT NULL,
        message TEXT,
        is_from_admin BOOLEAN DEFAULT false,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Contact messages
    await query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(200),
        email VARCHAR(200),
        phone VARCHAR(30),
        subject VARCHAR(300),
        message TEXT,
        is_read BOOLEAN DEFAULT false,
        ip_address VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // OTP codes
    await query(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        identifier VARCHAR(200) NOT NULL,
        code VARCHAR(10) NOT NULL,
        type VARCHAR(20) NOT NULL,
        user_data JSON,
        device_id VARCHAR(200),
        expires_at DATETIME,
        attempts INT DEFAULT 0,
        locked_until DATETIME,
        used BOOLEAN DEFAULT false,
        last_sent_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_identifier (identifier),
        INDEX idx_type (type)
      )
    `);

    // Trusted devices
    await query(`
      CREATE TABLE IF NOT EXISTS trusted_devices (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        device_id VARCHAR(200) NOT NULL,
        device_name VARCHAR(200),
        last_used DATETIME,
        UNIQUE KEY unique_user_device (user_id, device_id)
      )
    `);

    // Email verification
    await query(`
      CREATE TABLE IF NOT EXISTS email_verification (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        is_verified BOOLEAN DEFAULT false,
        verified_at DATETIME,
        UNIQUE KEY unique_user (user_id)
      )
    `);

    // Admin emails
    await query(`
      CREATE TABLE IF NOT EXISTS admin_emails (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(200) UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('[DB] All migrations complete!');
    
    // Seed default admin
    await query(`
      INSERT IGNORE INTO admin_emails (email) VALUES ('admin@greatsociety.com')
    `);
    
    await pool.end();
  } catch (err) {
    console.error('[DB MIGRATION ERROR]', err);
    throw err;
  }
}

export default runMigrations;
