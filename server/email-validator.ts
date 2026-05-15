import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface EmailValidationResult {
  isValid: boolean;
  message: string;
}

export class EmailValidator {
  private static emails: Set<string> | null = null;

  private static loadEmails(): Set<string> {
    if (this.emails) {
      return this.emails;
    }

    try {
      // Path to the Excel file in public/avatars
      const filePath = path.join(__dirname, '..', 'client', 'public', 'avatars', 'file.xls');
      
      // Read the Excel file
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      // Find email column (assuming first row has headers)
      const headers = data[0] as string[];
      const emailColumnIndex = headers.findIndex(header => 
        header && header.toLowerCase().includes('email')
      );

      if (emailColumnIndex === -1) {
        console.error('Email column not found in Excel file');
        this.emails = new Set();
        return this.emails;
      }

      // Extract emails from the column (skip header row)
      const emails = new Set<string>();
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row && row[emailColumnIndex]) {
          const email = String(row[emailColumnIndex]).toLowerCase().trim();
          if (email && email.includes('@')) {
            emails.add(email);
          }
        }
      }

      console.log(`Loaded ${emails.size} emails from Excel file`);
      this.emails = emails;
      return this.emails;
      
    } catch (error) {
      console.error('Error loading emails from Excel file:', error);
      this.emails = new Set();
      return this.emails;
    }
  }

  static validateEmail(email: string): EmailValidationResult {
    const emails = this.loadEmails();
    const normalizedEmail = email.toLowerCase().trim();
    
    if (emails.has(normalizedEmail)) {
      return {
        isValid: true,
        message: 'Email válido! Complete o cadastro com nome e senha.'
      };
    } else {
      return {
        isValid: false,
        message: 'Este email não está cadastrado em nossa base de dados. Se não lembra qual seu email do DevQuest, entre em contato com nosso suporte pelo WhatsApp.'
      };
    }
  }

  // Method to refresh the cache if needed
  static refreshCache(): void {
    this.emails = null;
  }
}