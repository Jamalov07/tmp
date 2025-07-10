import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma'
import { SellingFindOneData } from '../../selling'
import * as puppeteer from 'puppeteer'

@Injectable()
export class PdfService {
	private readonly prisma: PrismaService
	constructor(prisma: PrismaService) {
		this.prisma = prisma
	}

	async generateInvoicePdfBuffer(selling: SellingFindOneData): Promise<Buffer> {
		const browser = await puppeteer.launch({
			headless: true, // yoki 'new'
		})
		const page = await browser.newPage()

		const html = this.getHtmlTemplate()

		await page.setContent(html, { waitUntil: 'networkidle0' })
		const pdfBuffer = await page.pdf({
			format: 'A4',
			printBackground: true,
			margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
		})

		await browser.close()
		return Buffer.from(pdfBuffer)
	}

	private getHtmlTemplate(): string {
		return `
      <html>
      <head>
        <style>
          body {
            font-family: sans-serif;
            font-size: 12px;
          }
          h2 {
            margin: 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #000;
            padding: 5px;
            text-align: center;
          }
          th {
            background-color: #f0f0f0;
          }
          .footer {
            margin-top: 10px;
            text-align: right;
          }
        </style>
      </head>
      <body>
        <h2>SAS IDEAL</h2>
        <p><strong>Дата продажа:</strong> 07.07.2025 16:50</p>
        <p><strong>Харидор:</strong> AQUANT JAXONGIR AKA &nbsp;&nbsp;&nbsp;&nbsp; 97 719 80 88</p>

        <table>
          <thead>
            <tr>
              <th>№</th>
              <th>Маҳсулот номи</th>
              <th>Сони</th>
              <th>Нархи</th>
              <th>Суммаси</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>1</td><td>GUSAK PLOSKIY 40 SM (200SHT)</td><td>5</td><td>1.3</td><td>6.5</td></tr>
            <tr><td>2</td><td>KREPLENA UNITAZ</td><td>10</td><td>0.14</td><td>1.4</td></tr>
            <tr><td>3</td><td>ID-80 LEKA TAXOROT ARZON 500SHT</td><td>5</td><td>0.7</td><td>3.5</td></tr>
            <tr><td>4</td><td>DUSH SHLANG IDEAL 1.2M (50SHT)</td><td>5</td><td>1.3</td><td>6.5</td></tr>
            <tr><td>5</td><td>805-12 PAPLOVOK NIJNIY PLASMAS XITOY (100SHT)</td><td>5</td><td>0.7</td><td>3.5</td></tr>
            <tr><td>6</td><td>805-11 PAPLOVOK NIJNIY TEMIR (100SHT)</td><td>5</td><td>1.4</td><td>7</td></tr>
            <tr><td>7</td><td>JOYSTIK KUK KATTA [500SHT]</td><td>5</td><td>0.45</td><td>2.25</td></tr>
            <tr><td>8</td><td>KREPLENA RAKVINA XITOY 200 (SHT)</td><td>10</td><td>0.28</td><td>2.8</td></tr>
            <tr><td>9</td><td>GUSAK PLOSKIY 35SM (200SHT)</td><td>5</td><td>1.3</td><td>6.5</td></tr>
            <tr><td>10</td><td>805-8 MEXANIZM KICHIK NERSI KNOKA (40SHT)</td><td>5</td><td>2.2</td><td>11</td></tr>
            <tr><td>11</td><td>GUSAK RANGLI LOLA XAR XIL</td><td>8</td><td>2.2</td><td>17.6</td></tr>
          </tbody>
        </table>

        <div class="footer">
          <p><strong>Жами сумма:</strong> 68.55</p>
          <p><strong>Тўлов қилинди:</strong> 0</p>
        </div>
      </body>
      </html>
    `
	}
}
