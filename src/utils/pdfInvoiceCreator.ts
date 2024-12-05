import PDFDocument from 'pdfkit'
import { Order } from '@/types/order'
import fs from 'fs'

function formatDate(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, '0') // Month is 0-based
  const day = date.getDate().toString().padStart(2, '0')
  const year = date.getFullYear()

  return `${month}/${day}/${year}`
}

const date = new Date() // Current date
console.log(formatDate(date)) // Output: MM/DD/YYYY

export function createInvoice(order: Order): Buffer {
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  const buffers: Buffer[] = []
  doc.on('data', buffers.push.bind(buffers))
  doc.on('end', () => {})

  // Header Section
  doc.fontSize(18).font('Helvetica-Bold').text('INVOICE', { align: 'center' })
  doc.moveDown(1) // Add a small space after the title

  // Invoice Details (ID, Date, Customer, Address)
  doc.fontSize(12).font('Helvetica')
  doc.text(`Invoice ID: ${order.id}`, { align: 'left' }).moveDown(0.5)
  doc
    .text(`Date: ${formatDate(order.createdAt)}`, { align: 'left' })
    .moveDown(0.5)
  doc
    .text(`Customer: ${order.address.fullname}`, { align: 'left' })
    .moveDown(0.5)
  doc
    .text(
      `Address: ${order.address.address}, ${order.address.district}, ${order.address.city}, ${order.address.country}`,
      { align: 'left' }
    )
    .moveDown(1) // Add a larger space after the address section

  // Line Separator
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke()

  // Items Table
  let startY = doc.y + 20
  doc.fontSize(12).font('Helvetica-Bold')
  doc.text('Item', 50, startY, { width: 200, align: 'left' })
  doc.text('Qty', 250, startY, { width: 50, align: 'center' })
  doc.text('Price', 300, startY, { width: 100, align: 'right' })
  doc.text('Total', 400, startY, { width: 100, align: 'right' })

  // Line Separator
  startY += 20
  doc.moveTo(50, startY).lineTo(550, startY).stroke()

  // Add each item row
  order.orderItems.forEach((orderItem) => {
    startY += 20
    doc
      .fontSize(12)
      .font('Helvetica')
      .text(orderItem.name, 50, startY, { width: 200, align: 'left' })
    doc.text(orderItem.quantity.toString(), 250, startY, {
      width: 50,
      align: 'center'
    })
    doc.text(`$${orderItem.price.toFixed(2)}`, 300, startY, {
      width: 100,
      align: 'right'
    })
    doc.text(
      `$${(orderItem.quantity * orderItem.price).toFixed(2)}`,
      400,
      startY,
      { width: 100, align: 'right' }
    )
  })

  // Line Separator
  startY += 20
  doc.moveTo(50, startY).lineTo(550, startY).stroke()

  // Add Subtotal, Tax, Shipping, and Total
  startY += 20
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Subtotal', 300, startY, { width: 100, align: 'right' })
  doc
    .fontSize(12)
    .font('Helvetica')
    .text(
      `$${order.orderItems.reduce((total, item) => total + item.quantity * item.price, 0).toFixed(2)}`,
      400,
      startY,
      { width: 100, align: 'right' }
    )

  startY += 20
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Ship Method', 300, startY, { width: 100, align: 'right' })
  doc
    .fontSize(12)
    .font('Helvetica')
    .text(`$${order.shipMethod.price.toFixed(2)}`, 400, startY, {
      width: 100,
      align: 'right'
    })

  startY += 20
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Total', 300, startY, { width: 100, align: 'right' })
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text(`$${order.total.toFixed(2)}`, 400, startY, {
      width: 100,
      align: 'right'
    })

  // Final Line Separator
  startY += 30
  doc.moveTo(50, startY).lineTo(550, startY).stroke()

  // Finalize the PDF
  doc.end()
  doc.pipe(fs.createWriteStream(`invoices/${order.id}.pdf`))

  // Return the PDF as a buffer
  return Buffer.concat(buffers)
}
