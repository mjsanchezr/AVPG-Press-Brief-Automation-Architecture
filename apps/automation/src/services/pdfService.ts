import puppeteer from 'puppeteer';
import { marked } from 'marked';

/**
 * Service to render the Markdown intelligence brief into a high-fidelity PDF.
 * Optimized for Google Cloud Run environments.
 */
export async function generatePDF(markdown: string): Promise<Buffer> {
  const htmlContent = await marked.parse(markdown);

  const styledHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        
        body {
          font-family: 'Helvetica', 'Arial', sans-serif;
          color: #333;
          line-height: 1.6;
          padding: 40px;
          background: #fff;
        }
        
        h1 { 
          color: #1B4B8A; 
          font-size: 28px; 
          border-bottom: 3px solid #1B4B8A; 
          padding-bottom: 10px;
          text-transform: uppercase;
          margin-top: 40px;
        }
        
        h2 { 
          color: #1B4B8A; 
          font-size: 20px; 
          margin-top: 30px; 
          text-transform: uppercase;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 12px;
        }
        
        th {
          background-color: #1B4B8A;
          color: white;
          text-align: left;
          padding: 12px;
          text-transform: uppercase;
        }
        
        td {
          padding: 10px;
          border-bottom: 1px solid #eee;
        }
        
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        .page-break {
          page-break-after: always;
        }
        
        footer {
          position: fixed;
          bottom: 20px;
          width: 100%;
          text-align: center;
          font-size: 10px;
          color: #888;
          border-top: 1px solid #eee;
          padding-top: 10px;
        }
        
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }
        
        .logo-text {
          font-weight: 900;
          font-size: 24px;
          color: #1B4B8A;
          letter-spacing: -1px;
        }
      </style>
    </head>
    <body>
      <div class="header-top">
        <div class="logo-text">AVPG INTELLIGENCE</div>
        <div style="text-align: right; font-size: 12px; font-weight: bold; color: #666;">
          15 DE MAYO DE 2026<br>PRODUCCIÓN EJECUTIVA
        </div>
      </div>
      
      <div class="content">
        ${htmlContent}
      </div>

      <footer>
        © 2026 Asociación Venezolana de Procesadores de Gas (AVPG) - Confidencial
      </footer>
    </body>
    </html>
  `;

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ],
      headless: true
    });

    const page = await browser.newPage();
    await page.setContent(styledHtml, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm'
      }
    });

    return Buffer.from(pdfBuffer);
  } catch (error: any) {
    console.error("Puppeteer Rendering Error:", error);
    throw new Error(`PDF Generation Failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
