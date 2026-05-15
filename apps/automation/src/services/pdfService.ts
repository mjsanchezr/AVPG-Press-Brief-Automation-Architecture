import { marked } from 'marked';
import puppeteer from 'puppeteer';

export class PDFService {
  async generatePDF(markdown: string, date: string, log: (msg: string) => void): Promise<Buffer> {
    log('Generating HTML template from Markdown');
    
    // Configure marked for anchor links and GFM
    const htmlBody = await marked(markdown, { 
      gfm: true,
      breaks: true
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page { 
            size: A4; 
            margin: 20mm; 
            @bottom-right {
              content: counter(page) " / " counter(pages);
              font-size: 10px;
              color: #999;
            }
          }
          body { 
            font-family: 'Helvetica', 'Arial', sans-serif; 
            color: #1a1a1a; 
            line-height: 1.6; 
            margin: 0; 
            padding: 0; 
            background-color: #fff;
          }
          header { 
            border-bottom: 5px solid #1B4B8A; 
            padding-bottom: 20px; 
            margin-bottom: 40px; 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-end; 
          }
          .logo { 
            font-size: 42px; 
            font-weight: 900; 
            color: #1B4B8A; 
            letter-spacing: -2px;
            line-height: 1;
          }
          .date-box { 
            text-align: right;
          }
          .date-label {
            font-size: 10px;
            text-transform: uppercase;
            color: #1B4B8A;
            font-weight: 800;
            display: block;
            letter-spacing: 1px;
            margin-bottom: 4px;
          }
          .date-value {
            font-size: 16px;
            color: #333;
            font-weight: 400;
          }
          h1, h2, h3 { 
            color: #1B4B8A; 
            font-weight: 800;
            margin-top: 35px;
            margin-bottom: 15px;
          }
          h1 { 
            font-size: 28px; 
            text-transform: uppercase; 
            border-bottom: 2px solid #1B4B8A;
            padding-bottom: 10px;
          }
          h2 { 
            font-size: 22px; 
            border-left: 8px solid #1B4B8A;
            padding-left: 15px;
          }
          
          .titulares-list {
            background-color: #f4f7fa;
            padding: 30px;
            margin-bottom: 40px;
            border-radius: 4px;
          }
          
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 25px 0; 
            font-size: 12px;
          }
          th, td { 
            border: 1px solid #e0e0e0; 
            padding: 12px; 
            text-align: left; 
          }
          th { 
            background-color: #1B4B8A; 
            color: #ffffff; 
            font-weight: bold;
            text-transform: uppercase;
          }
          tr:nth-child(even) { background-color: #f9f9f9; }
          
          .page-break { page-break-after: always; }
          
          a { 
            color: #1B4B8A; 
            text-decoration: underline; 
          }
          
          .footer { 
            position: fixed; 
            bottom: 0; 
            width: 100%; 
            text-align: center; 
            font-size: 9px; 
            color: #666; 
            border-top: 1px solid #eee; 
            padding: 15px 0;
            background-color: #fff;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .legal-stamp {
            font-weight: bold;
            color: #1B4B8A;
            margin-top: 5px;
          }
        </style>
      </head>
      <body>
        <header>
          <div class="logo">AVPG</div>
          <div class="date-box">
            <span class="date-label">Intelligence Briefing</span>
            <span class="date-value">Friday, May 15, 2026</span>
          </div>
        </header>
        
        <div class="content">
          ${htmlBody}
        </div>
        
        <div class="footer">
          AVPG Intelligence Division | Confidential Industrial Report
          <div class="legal-stamp">
            AVPG - Depósito Legal Nro. pp200602DC2401
          </div>
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
