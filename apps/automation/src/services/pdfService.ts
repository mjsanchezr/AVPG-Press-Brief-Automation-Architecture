import { marked } from 'marked';
const html_to_pdf = require('html-pdf-node');

/**
 * AVPG PDF SERVICE
 * Converts Markdown intelligence reports into high-fidelity, corporate-branded PDFs.
 */

export async function generateBriefPDF(markdown: string): Promise<Buffer> {
    // Configure marked for custom rendering if needed
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
            
            /* Market Data Table Styles */
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

            /* Content Styling */
            p {
                margin-bottom: 15px;
                text-align: justify;
            }
            a {
                color: #1B4B8A;
                text-decoration: none;
                font-weight: bold;
            }
            .source-link {
                font-size: 9pt;
                color: #7f8c8d;
                display: block;
                margin-top: -10px;
                margin-bottom: 20px;
            }
            .nav-link {
                font-size: 8pt;
                color: #bdc3c7;
                text-decoration: none;
                font-style: italic;
            }

            /* Footer */
            footer {
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

            /* Force page breaks for major sections */
            .page-break {
                page-break-before: always;
            }

            /* Headline list styling */
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

        <footer>
            AVPG Press Brief Automation — Grounded Intelligence Delivery — May 15, 2026
        </footer>
    </body>
    </html>
    `;

    const options = { 
        format: 'A4',
        margin: {
            top: '20mm',
            right: '20mm',
            bottom: '25mm',
            left: '20mm'
        },
        printBackground: true
    };

    const file = { content: htmlContent };

    return new Promise((resolve, reject) => {
        html_to_pdf.generatePdf(file, options, (err: any, buffer: Buffer) => {
            if (err) {
                console.error("PDF Generation Error:", err);
                reject(err);
            } else {
                resolve(buffer);
            }
        });
    });
}
