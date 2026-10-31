const { getPool, isDbConnected, getMemoryStore } = require('../config/db');

class UserModel {
  /**
   * Find user by email
   * @param {string} email 
   * @returns {Promise<Object|null>}
   */
  static async findByEmail(email) {
    const normalizedEmail = (email || '').trim().toLowerCase();

    if (isDbConnected()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
      return rows[0] || null;
    }

    const memStore = getMemoryStore();
    return memStore.users.find(u => (u.email || '').toLowerCase() === normalizedEmail) || null;
  }

  /**
   * Find user by ID (excludes password_hash by default)
   * @param {number|string} id 
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    if (isDbConnected()) {
      const pool = getPool();
      const [rows] = await pool.query(
        'SELECT id, name, email, phone, address, city, state, pincode, created_at FROM users WHERE id = ? LIMIT 1',
        [id]
      );
      return rows[0] || null;
    }

    const memStore = getMemoryStore();
    const user = memStore.users.find(u => String(u.id) === String(id));
    if (!user) return null;

    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Create a new user
   * @param {Object} userData 
   * @returns {Promise<Object>}
   */
  static async create(userData) {
    const {
      name,
      email,
      password_hash,
      phone = '',
      address = '',
      city = '',
      state = '',
      pincode = ''
    } = userData;

    const normalizedEmail = (email || '').trim().toLowerCase();

    if (isDbConnected()) {
      const pool = getPool();
      const insertSql = `
        INSERT INTO users (name, email, password_hash, phone, address, city, state, pincode)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await pool.query(insertSql, [
        name,
        normalizedEmail,
        password_hash,
        phone,
        address,
        city,
        state,
        pincode
      ]);

      return {
        id: result.insertId,
        name,
        email: normalizedEmail,
        phone,
        address,
        city,
        state,
        pincode
      };
    }

    const memStore = getMemoryStore();
    const newId = memStore.users.length + 1;
    const memUser = {
      id: newId,
      name,
      email: normalizedEmail,
      password_hash,
      phone,
      address,
      city,
      state,
      pincode,
      created_at: new Date().toISOString()
    };
    memStore.users.push(memUser);

    const { password_hash: _pass, ...safeUser } = memUser;
    return safeUser;
  }

  /**
   * Update an existing user's profile
   * @param {number|string} id 
   * @param {Object} updates 
   * @returns {Promise<Object|null>}
   */
  static async update(id, updates) {
    const { name, phone, address, city, state, pincode } = updates;

    if (isDbConnected()) {
      const pool = getPool();
      await pool.query(
        `UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address), city = COALESCE(?, city), state = COALESCE(?, state), pincode = COALESCE(?, pincode) WHERE id = ?`,
        [name, phone, address, city, state, pincode, id]
      );
      return this.findById(id);
    }

    const memStore = getMemoryStore();
    const index = memStore.users.findIndex(u => String(u.id) === String(id));
    if (index === -1) return null;

    memStore.users[index] = {
      ...memStore.users[index],
      name: name ?? memStore.users[index].name,
      phone: phone ?? memStore.users[index].phone,
      address: address ?? memStore.users[index].address,
      city: city ?? memStore.users[index].city,
      state: state ?? memStore.users[index].state,
      pincode: pincode ?? memStore.users[index].pincode
    };

    const { password_hash, ...safeUser } = memStore.users[index];
    return safeUser;
  }
}

module.exports = UserModel;
