// app/utils/PdfStorage.ts
// Bonus challenge.

import { StoredPdf } from "./types";
import SQLiteDatabase from "./sqliteUtils";

// TODO: Import necessary types and libraries
// Consider importing types from your PDF highlighting library
// import { IHighlight } from "react-pdf-highlighter";

// TODO: Import a database library (e.g., SQLite, Postgres, or a Key-Value Store)
// import { Database } from "your-chosen-database-library";

// TODO: Define an interface for the highlight data we want to store
// interface StoredPdf {
//   id: string;
//   name: string;
//   file: Blob;
// }

// TODO: Define a class to handle highlight storage operations

class PdfStorage {
  private db: SQLiteDatabase;

  constructor() {
    this.db = new SQLiteDatabase();
  }

  async savePdf(file: StoredPdf): Promise<void> {
    await this.db.savePdf(file);
  }

  async saveBulkPdfs(files: StoredPdf[]): Promise<void> {
    const validPdfs = files.map((file) => ({
      ...file,
    }));
    await this.db.saveBulkPdfs(validPdfs);
  }

  async getPdf(pdfId: string): Promise<StoredPdf[]> {
    return await this.db.getPdf(pdfId);
  }

  async deletePdf(id: string): Promise<void> {
    await this.db.deletePdf(id);
  }
/*
  async indexWords(
    id: string,
    words: {
      keyword: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }[]
  ): Promise<void> {
    const StoredPdfs = words.map((word) => ({
      ...word,
      id: Math.random().toString(36).substr(2, 9),
      pdfId,
      width: 0,
      height: 0,
      pageNumber: -1,
      text: "",
      image: undefined,
    }));
    await this.saveBulkPdfs(StoredPdfs);
  }*/

  async close(): Promise<void> {
    await this.db.close();
  }

  // TODO: Implement updateHighlight method
  // async updateHighlight(id: string, updatedData: Partial<StoredPdf>): Promise<void> {
  //   // Implement update logic
  // }

  // BONUS CHALLENGE: Implement export/import methods
  // async exportToJson(pdfId: string, filePath: string): Promise<void> {
  //   // Implement export logic
  // }

  // async importFromJson(filePath: string): Promise<void> {
  //   // Implement import logic
  // }
}

// TODO: Consider implementing a caching layer for frequently accessed highlights
// CHALLENGE: Design a caching strategy that balances performance and memory usage

// TODO: Implement error handling and logging throughout the class

// BONUS CHALLENGE: Implement a method to export highlights to a JSON file
// async exportToJson(pdfId: string, filePath: string): Promise<void> {
//   // Retrieve highlights and write to a JSON file
// }

// BONUS CHALLENGE: Implement a method to import highlights from a JSON file
// async importFromJson(filePath: string): Promise<void> {
//   // Read from JSON file and insert highlights into the database
// }

// Export the PdfStorage class for use in other parts of the application
export default PdfStorage;

// FINAL CHALLENGE: Consider how you would scale this solution for large numbers of PDFs and highlights
// Think about indexing, partitioning, and potential cloud-based solutions
