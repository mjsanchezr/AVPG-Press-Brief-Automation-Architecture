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
            font-family: 'Helvetica', Arial, sans-serif; 
            color: #333; 
            line-height: 1.5; 
            margin: 0; 
            padding: 0; 
            background-color: #fff;
          }
          header { 
            border-bottom: 4px solid #1B4B8A; 
            padding-bottom: 15px; 
            margin-bottom: 30px; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
          }
          .logo-container {
            display: flex;
            align-items: center;
          }
          .logo { 
            font-size: 38px; 
            font-weight: 800; 
            color: #1B4B8A; 
            letter-spacing: -1px;
          }
          .date-box { 
            text-align: right;
          }
          .date-label {
            font-size: 12px;
            text-transform: uppercase;
            color: #1B4B8A;
            font-weight: bold;
            display: block;
          }
          .date-value {
            font-size: 18px;
            color: #444;
          }
          h1, h2, h3 { 
            color: #1B4B8A; 
            border-bottom: 1px solid #eee;
            padding-bottom: 8px;
            margin-top: 25px;
          }
          h1 { font-size: 26px; text-transform: uppercase; }
          h2 { font-size: 20px; }
          
          /* Titulares Section Styling */
          .titulares-list {
            background-color: #f8f9fa;
            border-left: 5px solid #1B4B8A;
            padding: 20px;
            margin-bottom: 30px;
          }
          .titulares-list ul {
            list-style-type: none;
            padding: 0;
          }
          .titulares-list li {
            margin-bottom: 12px;
            font-weight: 500;
            display: flex;
          }
          .titulares-list li::before {
            content: "•";
            color: #1B4B8A;
            font-weight: bold;
            display: inline-block;
            width: 1em;
            margin-left: -1em;
          }

          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 15px; 
            font-size: 13px;
          }
          th, td { 
            border: 1px solid #e0e0e0; 
            padding: 10px; 
            text-align: left; 
          }
          th { 
            background-color: #1B4B8A; 
            color: #ffffff; 
            font-weight: bold;
          }
          tr:nth-child(even) { background-color: #fcfcfc; }
          
          .page-break { page-break-after: always; }
          
          a { 
            color: #1B4B8A; 
            text-decoration: none; 
            font-weight: bold; 
          }
          
          .footer { 
            position: fixed; 
            bottom: 0; 
            width: 100%; 
            text-align: center; 
            font-size: 10px; 
            color: #777; 
            border-top: 1px solid #eee; 
            padding-top: 8px;
            background-color: #fff;
          }
          .legal {
            font-style: italic;
            margin-top: 4px;
          }
        </style>
      </head>
      <body>
        <header>
          <div class="logo-container">
            <div class="logo">AVPG</div>
          </div>
          <div class="date-box">
            <span class="date-label">Resumen de Inteligencia</span>
            <span class="date-value">15 de Mayo de 2026</span>
          </div>
        </header>
        
        <div class="content">
          ${htmlBody}
        </div>
        
        <div class="footer">
          <strong>AVPG Intelligence Division</strong> | Contact: <a href="mailto:venezuelagas@gmail.com">venezuelagas@gmail.com</a>
          <div class="legal">
            PROPIEDAD DE AVPG. PROHIBIDA SU REPRODUCCIÓN TOTAL O PARCIAL SIN AUTORIZACIÓN.
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
