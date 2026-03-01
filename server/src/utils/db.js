const { Pool } = require('pg');
const config = require('../config/database');
const dbConfig = config.dbConfig || config;

class Database {
  constructor() {
    this.pool = null;
  }

  async initialize() {
    if (!this.pool) {
      try {
        this.pool = new Pool(dbConfig);
        console.log('PostgreSQL connection pool created successfully');
      } catch (error) {
        console.error('Failed to create database connection pool:', error);
        throw error;
      }
    }
    return this.pool;
  }

  async query(sql, values = []) {
    if (!this.pool) {
      await this.initialize();
    }
    
    try {
      const result = await this.pool.query(sql, values);
      return result.rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async queryOne(sql, values = []) {
    const results = await this.query(sql, values);
    return results.length > 0 ? results[0] : null;
  }

  async insert(sql, values = []) {
    if (!this.pool) {
      await this.initialize();
    }
    
    try {
      const result = await this.pool.query(sql, values);
      return {
        insertId: result.rows[0]?.id,
        affectedRows: result.rowCount,
        rows: result.rows
      };
    } catch (error) {
      console.error('Database insert error:', error);
      throw error;
    }
  }

  async update(sql, values = []) {
    if (!this.pool) {
      await this.initialize();
    }
    
    try {
      const result = await this.pool.query(sql, values);
      return {
        affectedRows: result.rowCount,
        changedRows: result.rowCount
      };
    } catch (error) {
      console.error('Database update error:', error);
      throw error;
    }
  }

  async delete(sql, values = []) {
    if (!this.pool) {
      await this.initialize();
    }
    
    try {
      const result = await this.pool.query(sql, values);
      return {
        affectedRows: result.rowCount
      };
    } catch (error) {
      console.error('Database delete error:', error);
      throw error;
    }
  }

  async transaction(callback) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('Database connection pool closed');
    }
  }

  getPool() {
    return this.pool;
  }
}

module.exports = new Database();
