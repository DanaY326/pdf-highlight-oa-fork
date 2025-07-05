// app/utils/sqliteUtils.ts

import sqlite3 from "sqlite3";
import path from "path";
import { StoredPdf } from "./types";

class SQLiteDatabase {
  private db: sqlite3.Database;
  private tableName: string = "pdfs";
  private migrationPromise: Promise<void>;

  constructor() {
    this.db = new sqlite3.Database(
      path.join(process.cwd(), "pdfs.db"),
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (error) => {
        if (error) {
          console.error("Error opening database:", error.message);
        } else {
          console.log("Connected to pdfs db!");
        }
      }
    );
    this.migrationPromise = this.migrate();
  }

  private migrate(): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = `
        CREATE TABLE IF NOT EXISTS ${this.tableName} (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          numPages INTEGER NOT NULL,
          file BLOB NOT NULL
        )
      `;
      this.db.run(sql, (err) => {
        if (err) {
          console.error("Error creating table:", err.message);
          reject(err);
        } else {
          console.log("pdfs table created or already exists");
          resolve();
        }
      });
    });
  }

  private async ensureMigrated(): Promise<void> {
    await this.migrationPromise;
  }

  async savePdf(file: StoredPdf): Promise<void> {
    await this.ensureMigrated();
    const sql = `INSERT OR REPLACE INTO ${this.tableName} (id, name, numPages, file) VALUES (?, ?, ?, ?)`;
    return new Promise((resolve, reject) => {
      this.db.run(sql, Object.values(file), (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  async saveBulkPdfs(files: StoredPdf[]): Promise<void> {
    await this.ensureMigrated();
    const sql = `INSERT OR REPLACE INTO ${this.tableName} (id, name, numPages, file) VALUES (?, ?, ?, ?)`;
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run("BEGIN TRANSACTION");
        const stmt = this.db.prepare(sql);
        files.forEach((file) => {
          stmt.run(Object.values(file));
        });
        stmt.finalize((error) => {
          if (error) {
            this.db.run("ROLLBACK");
            reject(error);
          } else {
            this.db.run("COMMIT", (commitError) => {
              if (commitError) reject(commitError);
              else resolve();
            });
          }
        });
      });
    });
  }

  async getPdf(id: string): Promise<StoredPdf[]> {
    await this.ensureMigrated();
    const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    return new Promise((resolve, reject) => {
      this.db.all(sql, [id], (error, rows) => {
        if (error) reject(error);
        else resolve(rows as StoredPdf[]);
      });
    });
  }

  async deletePdf(id: string): Promise<void> {
    await this.ensureMigrated();
    const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
    return new Promise((resolve, reject) => {
      this.db.run(sql, [id], (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  async close(): Promise<void> {
    await this.ensureMigrated();
    return new Promise((resolve, reject) => {
      this.db.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}

export default SQLiteDatabase;
