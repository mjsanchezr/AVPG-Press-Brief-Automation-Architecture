import { marked } from 'marked';
import puppeteer from 'puppeteer';

export class PDFService {
  async generatePDF(markdown: string, date: string, log: (msg: string) => void): Promise<Buffer> {
    log('Generating HTML template from Markdown');
    const htmlBody = await marked(markdown);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: 'Helvetica', Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; }
          header { border-bottom: 4px solid #1B4B8A; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: baseline; }
          .logo { font-size: 32px; font-weight: bold; color: #1B4B8A; }
          .date { font-size: 16px; color: #666; }
          h1, h2, h3 { color: #1B4B8A; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; color: #1B4B8A; }
          .page-break { page-break-after: always; }
          a { color: #1B4B8A; text-decoration: none; font-weight: bold; }
          .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 5px; }
        </style>
      </head>
      <body>
        <header>
          <div class="logo">AVPG</div>
          <div class="date">Resumen de Prensa — ${date}</div>
        </header>
        <div class="content">
          ${htmlBody}
        </div>
        <div class="footer">
          Confidencial — AVPG Intelligence Division
        </div>
      </body>
      </html>
    `;

    log('Launching Puppeteer (Chromium)');
    const browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    try {
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      log('Creating PDF Buffer');
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
      });

      return Buffer.from(pdf);
    } catch (error: any) {
      log(`PDF Generation Error: ${error.message}`);
      throw error;
    } finally {
      await browser.close();
    }
  }
}

export const pdfService = new PDFService();
