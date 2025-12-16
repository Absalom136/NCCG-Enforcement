import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { EnforcementRecord } from '../types';

const formatDate = (dateStr: string) => {
    if(!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

const formatDateForTitle = (dateStr: string) => {
    if(!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' }).toUpperCase();
    const year = date.getFullYear();
    
    // Add ordinal suffix
    const j = day % 10,
        k = day % 100;
    let suffix = "TH";
    if (j == 1 && k != 11) {
        suffix = "ST";
    }
    if (j == 2 && k != 12) {
        suffix = "ND";
    }
    if (j == 3 && k != 13) {
        suffix = "RD";
    }

    return `${day}${suffix} ${month} ${year}`;
};

export const generateWeeklyReport = async (
  records: EnforcementRecord[],
  startDate: string,
  endDate: string,
  subCounty: string,
  officers: string[]
) => {
  const doc = new jsPDF('l'); // Landscape orientation to fit columns better

  // Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const title = `${subCounty.toUpperCase()} SUB-COUNTY`;
  const textWidth = doc.getTextWidth(title);
  doc.text(title, (doc.internal.pageSize.width - textWidth) / 2, 20);

  // Subtitle
  doc.setFontSize(11);
  const subtitle = `WEEKLY REPORT ${formatDateForTitle(startDate)} - ${formatDateForTitle(endDate)}`;
  const subtitleWidth = doc.getTextWidth(subtitle);
  doc.text(subtitle, (doc.internal.pageSize.width - subtitleWidth) / 2, 28);

  // Table Data
  const tableBody = records.map((record, index) => [
    index + 1,
    formatDate(record.dateIssued),
    record.noticeNumber.split('-').slice(-1)[0], // Extract just the number for brevity
    `${record.plotNumber}; ${record.location}`,
    record.issueOfConcern,
    `${record.processTaken}\n(attached)`, 
    record.recommendations
  ]);

  // Table
  autoTable(doc, {
    startY: 35,
    head: [[
      'NO', 
      'Date issued', 
      'Notice s/No', 
      'Plot No/ street/ Road', 
      'Issue of concern', 
      'Process', 
      'Recommendations'
    ]],
    body: tableBody,
    theme: 'grid', // Use grid theme to look like the Excel/Table screenshot
    headStyles: {
      fillColor: [255, 255, 255], // White background
      textColor: [0, 0, 0], // Black text
      lineColor: [0, 0, 0], // Black border
      lineWidth: 0.1,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: {
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      textColor: [0, 0, 0],
      valign: 'middle'
    },
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 3,
      overflow: 'linebreak',
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' }, // NO
      1: { cellWidth: 25, halign: 'center' }, // Date
      2: { cellWidth: 20, halign: 'center' }, // Notice No
      3: { cellWidth: 50 }, // Plot/Street
      4: { cellWidth: 60 }, // Issue
      5: { cellWidth: 40 }, // Process
      6: { cellWidth: 'auto' }, // Recommendations
    }
  });

  // Footer: Prepared by
  const finalY = (doc as any).lastAutoTable.finalY || 40;
  
  if (finalY < doc.internal.pageSize.height - 40) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Prepared by', 14, finalY + 10);
      
      officers.forEach((officer, index) => {
        if (officer.trim()) {
          doc.text(`${index + 1}   ${officer}`, 14, finalY + 16 + (index * 5));
        }
      });
  } else {
      // Add a new page if not enough space
      doc.addPage();
      doc.text('Prepared by', 14, 20);
      officers.forEach((officer, index) => {
        if (officer.trim()) {
          doc.text(`${index + 1}   ${officer}`, 14, 26 + (index * 5));
        }
      });
  }

  const fileName = `${subCounty.replace(/\s+/g, '_')}_Weekly_Report_${startDate}_${endDate}.pdf`;

  if (Capacitor.isNativePlatform()) {
    try {
        const base64PDF = doc.output('datauristring').split(',')[1];
        
        // Write file to documents
        const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64PDF,
            directory: Directory.Cache, // Use Cache for temporary sharing
        });

        // Share the file
        await Share.share({
            title: 'Weekly Enforcement Report',
            text: `Weekly report for ${subCounty}`,
            url: savedFile.uri,
            dialogTitle: 'Export Report'
        });
        
    } catch (e) {
        console.error("Native export failed", e);
        alert("Failed to export PDF on device. Please check permissions.");
    }
  } else {
    // Browser fallback
    doc.save(fileName);
  }
};