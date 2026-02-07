import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ReportSettings {
  leftLogoUrl?: string | null;
  rightLogoUrl?: string | null;
  schoolName: string;
  branchName: string;
  mainTitle: string;
  address: string;
  contactInfo: string;
  principalName?: string | null;
  vicePrincipalName?: string | null;
}

/**
 * Generate letterhead at the top of PDF
 */
export async function generateLetterhead(
  doc: jsPDF,
  settings: ReportSettings
): Promise<number> {
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 15;

  // Adjust logo size based on page width (smaller for portrait)
  const maxLogoSize = pageWidth > 250 ? 25 : 20; // 20mm for portrait, 25mm for landscape
  const logoY = yPosition;

  // Helper function to get image dimensions and add with aspect ratio
  const addLogoWithAspectRatio = async (
    imageData: string,
    x: number,
    y: number,
    maxSize: number
  ): Promise<void> => {
    return new Promise((resolve) => {
      try {
        const img = new Image();

        img.onload = () => {
          try {
            const imgWidth = img.width;
            const imgHeight = img.height;

            // Calculate aspect ratio
            const aspectRatio = imgWidth / imgHeight;

            let finalWidth = maxSize;
            let finalHeight = maxSize;

            // Maintain aspect ratio
            if (aspectRatio > 1) {
              // Landscape - width is limiting
              finalHeight = maxSize / aspectRatio;
            } else {
              // Portrait - height is limiting
              finalWidth = maxSize * aspectRatio;
            }

            // Center vertically within box
            const yOffset = (maxSize - finalHeight) / 2;

            doc.addImage(imageData, 'PNG', x, y + yOffset, finalWidth, finalHeight);
            resolve();
          } catch (e) {
            console.warn('Failed to calculate, using square', e);
            doc.addImage(imageData, 'PNG', x, y, maxSize, maxSize);
            resolve();
          }
        };

        img.onerror = () => {
          console.warn('Failed to load image, using square');
          doc.addImage(imageData, 'PNG', x, y, maxSize, maxSize);
          resolve();
        };

        img.src = imageData;
      } catch (e) {
        console.warn('Failed to add logo', e);
        doc.addImage(imageData, 'PNG', x, y, maxSize, maxSize);
        resolve();
      }
    });
  };

  // Add logos if available with aspect ratio preservation
  if (settings.leftLogoUrl) {
    await addLogoWithAspectRatio(settings.leftLogoUrl, 15, logoY, maxLogoSize);
  }

  if (settings.rightLogoUrl) {
    await addLogoWithAspectRatio(
      settings.rightLogoUrl,
      pageWidth - 15 - maxLogoSize,
      logoY,
      maxLogoSize
    );
  }

  // Start text at proper position (text starts vertically aligned with middle/bottom of logo)
  const textStartY = logoY + 2; // Start slightly below logo top

  // Center text area
  const centerX = pageWidth / 2;

  // Main title - BOLD
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.mainTitle, centerX, textStartY, { align: 'center', maxWidth: pageWidth - 90 });
  yPosition = textStartY + 5;

  // Branch name - BOLD
  doc.setFontSize(9);
  doc.text(settings.branchName, centerX, yPosition, { align: 'center', maxWidth: pageWidth - 90 });
  yPosition += 4;

  // School name - BOLD
  doc.setFontSize(13);
  doc.text(settings.schoolName, centerX, yPosition, { align: 'center', maxWidth: pageWidth - 90 });
  yPosition += 6;

  // Address - Normal
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(settings.address, centerX, yPosition, { align: 'center', maxWidth: pageWidth - 90 });
  yPosition += 4;

  // Contact info - Normal
  doc.setFontSize(7);
  doc.text(settings.contactInfo, centerX, yPosition, { align: 'center' });
  yPosition += 6;

  // Horizontal line
  doc.setLineWidth(0.8);
  doc.line(15, yPosition, pageWidth - 15, yPosition);
  yPosition += 1;
  doc.setLineWidth(0.3);
  doc.line(15, yPosition, pageWidth - 15, yPosition);
  yPosition += 8;

  return yPosition;
}

/**
 * Generate signature section
 * Returns the Y position after signatures
 */
export function generateSignatureSection(
  doc: jsPDF,
  yPosition: number,
  settings: ReportSettings,
  city: string = 'Satui'
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Check if we have space, otherwise add new page
  const spaceNeeded = 50;
  if (yPosition + spaceNeeded > pageHeight - 20) {
    doc.addPage();
    yPosition = 20;
  }

  // Date and location
  const today = new Date().toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${city}, ${today}`, pageWidth - 15, yPosition, { align: 'right' });
  yPosition += 10;

  // Center-aligned signature section (2 columns side by side)
  const centerX = pageWidth / 2;
  const leftColX = centerX - 50; // 50mm left of center
  const rightColX = centerX + 50; // 50mm right of center

  // Titles
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Wakasek Sarpas', leftColX, yPosition, { align: 'center' });
  doc.text('Kepala Sekolah', rightColX, yPosition, { align: 'center' });
  yPosition += 25;

  // Names
  doc.setFont('helvetica', 'bold');
  if (settings.vicePrincipalName) {
    doc.text(settings.vicePrincipalName, leftColX, yPosition, { align: 'center' });
  } else {
    doc.text('(_______________)', leftColX, yPosition, { align: 'center' });
  }

  if (settings.principalName) {
    doc.text(settings.principalName, rightColX, yPosition, { align: 'center' });
  } else {
    doc.text('(_______________)', rightColX, yPosition, { align: 'center' });
  }

  yPosition += 5;

  return yPosition;
}

/**
 * Decide orientation based on column count
 */
export function decideOrientation(columnCount: number): 'portrait' | 'landscape' {
  return columnCount >= 8 ? 'landscape' : 'portrait';
}

/**
 * Generate PDF report with table
 */
export async function generatePDFReport(config: {
  title: string;
  settings: ReportSettings;
  columns: string[];
  data: any[][];
  orientation?: 'portrait' | 'landscape';
}): Promise<jsPDF> {
  const { title, settings, columns, data, orientation } = config;

  const finalOrientation = orientation || decideOrientation(columns.length);

  const doc = new jsPDF({
    orientation: finalOrientation,
    unit: 'mm',
    format: 'a4',
  });

  // Add letterhead
  let yPos = await generateLetterhead(doc, settings);

  // Report title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.text(title, pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Generate table
  autoTable(doc, {
    startY: yPos,
    head: [columns],
    body: data,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      halign: 'center',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [71, 85, 105], // slate-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    margin: { left: 15, right: 15 },
    didDrawPage: function (data) {
      // Add page numbers using internal properties
      const pageCount = (doc as any).internal.getNumberOfPages();
      const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Halaman ${currentPage} dari ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    },
  });

  // Get final Y position after table
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 20;

  // Add signature section
  generateSignatureSection(doc, finalY + 10, settings);

  return doc;
}
