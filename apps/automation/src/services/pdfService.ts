import { marked } from 'marked';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { Readable } from 'stream';

/**
 * AVPG PDF SERVICE (Production Optimized)
 * Uses Puppeteer + Chromium for stable high-fidelity rendering in Vercel Serverless environments.
 */

export async function generateBriefPDF(markdown: string): Promise<Buffer | Readable> {
    // Configure marked for HTML generation
    const htmlBody = await marked(markdown);

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <style>
            @page {
                size: A4;
                margin: 20mm;
            }
            body {
                font-family: 'Helvetica', 'Arial', sans-serif;
                color: #2c3e50;
                line-height: 1.5;
                margin: 0;
                padding: 0;
                font-size: 11pt;
            }
            .container {
                width: 100%;
            }
            header {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                border-bottom: 3px solid #1B4B8A;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            .logo-text {
                font-size: 28pt;
                font-weight: 900;
                color: #1B4B8A;
                letter-spacing: -1px;
            }
            .brief-title {
                font-size: 14pt;
                color: #7f8c8d;
                text-transform: uppercase;
                font-weight: bold;
            }
            h1, h2, h3 {
                color: #1B4B8A;
                text-transform: uppercase;
            }
            h1 { font-size: 20pt; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            h2 { font-size: 16pt; margin-top: 25px; }
            h3 { font-size: 14pt; margin-top: 20px; }
            
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                font-size: 10pt;
            }
            th {
                background-color: #1B4B8A;
                color: white;
                text-align: left;
                padding: 10px;
                text-transform: uppercase;
            }
            td {
                border-bottom: 1px solid #ecf0f1;
                padding: 10px;
            }
            tr:nth-child(even) {
                background-color: #f9f9f9;
            }

            p {
                margin-bottom: 15px;
                text-align: justify;
            }
            a {
                color: #1B4B8A;
                text-decoration: none;
                font-weight: bold;
            }
            .footer {
                position: fixed;
                bottom: -10mm;
                left: 0;
                right: 0;
                height: 10mm;
                text-align: center;
                font-size: 8pt;
                color: #bdc3c7;
                border-top: 1px solid #eee;
                padding-top: 5px;
            }
            .page-break {
                page-break-before: always;
            }
            ul {
                list-style-type: none;
                padding-left: 0;
            }
            ul li {
                padding: 5px 0;
                border-bottom: 1px dashed #eee;
            }
            ul li:before {
                content: "• ";
                color: #1B4B8A;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <div class="logo-text">AVPG</div>
                <div class="brief-title">Resumen de Prensa</div>
            </header>
            <div class="content">
                ${htmlBody}
            </div>
        </div>
        <div class="footer">
            AVPG Press Brief Automation — Grounded Intelligence Delivery — May 15, 2026
        </div>
    </body>
    </html>
    `;

    let browser;
    try {
        console.log("[PDF] Launching browserless chromium instance...");
        browser = await puppeteer.launch({
            args: [...chromium.args, '--disable-dev-shm-usage', '--no-sandbox'],
            executablePath: await chromium.executablePath(),
            headless: true,
        });

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
        
        console.log("[PDF] Rendering high-fidelity PDF buffer...");
        const pdf = await page.pdf({
            format: 'A4',
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '25mm',
                left: '20mm'
            },
            printBackground: true
        });

        const buffer = Buffer.from(pdf);
        
        // Vercel Payload Limit Guardrail (4.5MB)
        if (buffer.length > 4.5 * 1024 * 1024) {
            console.warn(`[PDF] Large PDF detected (${(buffer.length / 1024 / 1024).toFixed(2)}MB). Implementing stream-based response.`);
            return Readable.from(buffer);
        }

        return buffer;
    } catch (error) {
        console.error("[PDF] Service Error:", error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
