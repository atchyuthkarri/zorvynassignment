/**
 * Seed script to populate database with sample data.
 * Run with: npm run db:seed
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./pool');

async function seedDB() {
  try {
    console.log('🌱 Seeding database...');

    // Clear existing data (in order due to foreign keys)
    await pool.query('DELETE FROM records');
    await pool.query('DELETE FROM users');
    await pool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE records_id_seq RESTART WITH 1');

    // Hash password for all users (password: "password123")
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Insert users
    const usersSQL = `
      INSERT INTO users (name, email, password, role, status) VALUES
        ('Admin User', 'admin@example.com', $1, 'ADMIN', 'ACTIVE'),
        ('Analyst User', 'analyst@example.com', $1, 'ANALYST', 'ACTIVE'),
        ('Viewer User', 'viewer@example.com', $1, 'VIEWER', 'ACTIVE'),
        ('Inactive User', 'inactive@example.com', $1, 'VIEWER', 'INACTIVE')
      RETURNING id, name, email, role;
    `;
    const usersResult = await pool.query(usersSQL, [hashedPassword]);
    console.log('👥 Users seeded:', usersResult.rows.map(u => `${u.name} (${u.role})`).join(', '));

    // Insert financial records (created by admin user, id=1)
    const recordsSQL = `
      INSERT INTO records (amount, type, category, date, notes, created_by) VALUES
        (5000.00, 'income', 'Salary', '2024-01-15', 'Monthly salary', 1),
        (1200.00, 'income', 'Freelance', '2024-01-20', 'Web design project', 1),
        (800.00, 'expense', 'Rent', '2024-01-01', 'Monthly rent payment', 1),
        (150.00, 'expense', 'Utilities', '2024-01-05', 'Electricity bill', 1),
        (200.00, 'expense', 'Food', '2024-01-10', 'Grocery shopping', 1),
        (50.00, 'expense', 'Transport', '2024-01-12', 'Gas refill', 1),
        (3000.00, 'income', 'Investment', '2024-02-01', 'Stock dividends', 1),
        (500.00, 'expense', 'Entertainment', '2024-02-05', 'Concert tickets', 1),
        (750.00, 'expense', 'Rent', '2024-02-01', 'Storage unit', 1),
        (100.00, 'expense', 'Food', '2024-02-15', 'Restaurant dinner', 1),
        (4500.00, 'income', 'Salary', '2024-02-15', 'Monthly salary', 1),
        (300.00, 'expense', 'Utilities', '2024-02-20', 'Internet + phone', 1),
        (2000.00, 'income', 'Freelance', '2024-03-01', 'Mobile app project', 1),
        (120.00, 'expense', 'Transport', '2024-03-05', 'Uber rides', 1),
        (600.00, 'expense', 'Food', '2024-03-10', 'Weekly groceries batch', 1),
        (8000.00, 'income', 'Salary', '2024-03-15', 'Monthly salary + bonus', 1),
        (1500.00, 'expense', 'Rent', '2024-03-01', 'Monthly rent payment', 1),
        (250.00, 'expense', 'Entertainment', '2024-03-20', 'Streaming subscriptions', 1),
        (400.00, 'income', 'Investment', '2024-03-25', 'Bond interest', 1),
        (75.00, 'expense', 'Utilities', '2024-03-28', 'Water bill', 1)
      RETURNING id;
    `;
    const recordsResult = await pool.query(recordsSQL);
    console.log(`📊 ${recordsResult.rowCount} financial records seeded`);

    console.log('\\n✅ Database seeded successfully!');
    console.log('\\n📋 Login credentials:');
    console.log('   Admin:   admin@example.com   / password123');
    console.log('   Analyst: analyst@example.com / password123');
    console.log('   Viewer:  viewer@example.com  / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  } finally {
    await pool.end();
  }
}

seedDB();
