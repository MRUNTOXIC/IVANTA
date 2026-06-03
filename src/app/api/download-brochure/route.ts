import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, degrees } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brochureUrl = searchParams.get('url');
    const propertyTitle = searchParams.get('title') || 'Property';

    if (!brochureUrl) {
      return NextResponse.json({ error: 'Brochure URL is required' }, { status: 400 });
    }

    // Convert relative URL to absolute URL
    const absoluteUrl = brochureUrl.startsWith('http') 
      ? brochureUrl 
      : `${request.nextUrl.origin}${brochureUrl}`;

    // Fetch the original PDF
    const pdfResponse = await fetch(absoluteUrl);
    if (!pdfResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch brochure' }, { status: 500 });
    }

    const pdfBytes = await pdfResponse.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Load watermark image
    const logoPath = path.join(process.cwd(), 'public', 'IvantaLogo.png');
    const logoImageBytes = fs.readFileSync(logoPath);
    
    // Try to embed as PNG, if fails try as JPG
    let logoImage;
    try {
      logoImage = await pdfDoc.embedPng(logoImageBytes);
    } catch (e) {
      logoImage = await pdfDoc.embedJpg(logoImageBytes);
    }

    // Add watermark to each page
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const { width, height } = page.getSize();
      
      // Calculate diagonal dimensions
      const diagonal = Math.sqrt(width * width + height * height);
      const angleRadians = Math.atan2(height, width); // Angle from bottom-left to top-right
      const angleDegrees = (angleRadians * 180) / Math.PI; // Convert to degrees
      
      // Scale logo to fit diagonally across page (adjust 0.6 for size)
      const logoWidth = diagonal * 0.6;
      const aspectRatio = logoImage.height / logoImage.width;
      const logoHeight = logoWidth * aspectRatio;
      
      // Center the watermark
      const x = (width - logoWidth * Math.cos(angleRadians)) / 2;
      const y = (height - logoWidth * Math.sin(angleRadians)) / 2;

      page.drawImage(logoImage, {
        x,
        y,
        width: logoWidth,
        height: logoHeight,
        rotate: degrees(angleDegrees),
        opacity: 0.15,
      });
    }

    // Save the modified PDF
    const modifiedPdfBytes = await pdfDoc.save();

    // Create filename from property title
    const filename = `${propertyTitle} - Ivanta Property.pdf`;

    // Return the PDF with appropriate headers
    return new NextResponse(Buffer.from(modifiedPdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Error adding watermark:', error);
    return NextResponse.json({ error: 'Failed to process brochure', details: error.message }, { status: 500 });
  }
}
