import jsPDF from 'jspdf';
import type { Itinerary } from './types';

/**
 * Sanitize text for PDF export - removes/replaces characters that jsPDF can't render
 * jsPDF's default Helvetica font only supports Latin-1 characters
 */
function sanitizeTextForPDF(text: string | undefined | null): string {
  if (!text) return '';

  return text
    // First, try to extract Latin text from mixed scripts
    // This handles cases like "مطعم الرومانسية Al romansiah" -> "Al romansiah"
    .replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+/g, '') // Remove Arabic
    .replace(/[\u4E00-\u9FFF\u3400-\u4DBF]+/g, '') // Remove Chinese
    .replace(/[\u3040-\u309F\u30A0-\u30FF]+/g, '') // Remove Japanese
    .replace(/[\uAC00-\uD7AF]+/g, '') // Remove Korean
    .replace(/[\u0400-\u04FF]+/g, '') // Remove Cyrillic
    .replace(/[\u0370-\u03FF]+/g, '') // Remove Greek
    .replace(/[\u0590-\u05FF]+/g, '') // Remove Hebrew
    .replace(/[\u0900-\u097F]+/g, '') // Remove Devanagari
    .replace(/[\u0E00-\u0E7F]+/g, '') // Remove Thai
    // Replace common Unicode punctuation with ASCII equivalents
    .replace(/[''`]/g, "'")
    .replace(/[""„]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[•·]/g, '-')
    .replace(/[©®™]/g, '')
    .replace(/[°]/g, ' deg')
    // Replace accented characters with ASCII equivalents
    .replace(/[àáâãäå]/gi, (m) => m.toLowerCase() === m ? 'a' : 'A')
    .replace(/[èéêë]/gi, (m) => m.toLowerCase() === m ? 'e' : 'E')
    .replace(/[ìíîï]/gi, (m) => m.toLowerCase() === m ? 'i' : 'I')
    .replace(/[òóôõö]/gi, (m) => m.toLowerCase() === m ? 'o' : 'O')
    .replace(/[ùúûü]/gi, (m) => m.toLowerCase() === m ? 'u' : 'U')
    .replace(/[ñ]/gi, (m) => m.toLowerCase() === m ? 'n' : 'N')
    .replace(/[ç]/gi, (m) => m.toLowerCase() === m ? 'c' : 'C')
    .replace(/[ß]/g, 'ss')
    .replace(/[æ]/gi, 'ae')
    .replace(/[œ]/gi, 'oe')
    .replace(/[ø]/gi, 'o')
    // Remove any remaining non-ASCII characters
    .replace(/[^\x20-\x7E\n\r\t]/g, '')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Get the best displayable name from restaurant data
 * Prefers English name, falls back to sanitized original
 */
function getDisplayName(name: string | undefined | null): string {
  if (!name) return 'Restaurant';

  const sanitized = sanitizeTextForPDF(name);

  // If nothing left after sanitization, return generic name
  if (!sanitized || sanitized.length < 2) {
    return 'Local Restaurant';
  }

  return sanitized;
}

export async function generateItineraryPDF(itinerary: Itinerary): Promise<Blob> {
  const doc = new jsPDF();

  // Page setup
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);
  let yPosition = margin;

  // Helper function to check if we need a new page
  const checkPageBreak = (spaceNeeded: number = 10) => {
    if (yPosition + spaceNeeded > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper function to add wrapped text
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 11) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return lines.length * (fontSize * 0.4); // Approximate line height
  };

  // Header
  doc.setFillColor(59, 130, 246); // Blue background
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Planora Itinerary', margin, 20);

  // Destination
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(sanitizeTextForPDF(itinerary.prefs.destination), margin, 32);

  yPosition = 55;

  // Trip Details Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Trip Details', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Dates: ${itinerary.prefs.startDate} - ${itinerary.prefs.endDate}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Budget: ${itinerary.prefs.budget}`, margin, yPosition);
  yPosition += 6;

  if (itinerary.prefs.interests && itinerary.prefs.interests.length > 0) {
    doc.text(`Interests: ${sanitizeTextForPDF(itinerary.prefs.interests.join(', '))}`, margin, yPosition);
    yPosition += 6;
  }

  // Dietary preferences
  if (itinerary.prefs.dietaryPreferences) {
    const prefs = itinerary.prefs.dietaryPreferences;
    const activePrefs: string[] = [];
    if (prefs.halal) activePrefs.push('Halal');
    if (prefs.vegetarian) activePrefs.push('Vegetarian');
    if (prefs.vegan) activePrefs.push('Vegan');
    if (prefs.nutAllergy) activePrefs.push('Nut Allergy');
    if (prefs.seafoodAllergy) activePrefs.push('Seafood Allergy');
    if (prefs.wheelchairAccessible) activePrefs.push('Wheelchair Accessible');

    if (activePrefs.length > 0) {
      doc.text(`Dietary: ${activePrefs.join(', ')}`, margin, yPosition);
      yPosition += 6;
    }
  }

  yPosition += 10;

  // Iterate through days
  itinerary.days.forEach((day, dayIndex) => {
    checkPageBreak(20);

    // Day header
    doc.setFillColor(243, 244, 246); // Light gray background
    doc.rect(margin, yPosition - 5, contentWidth, 12, 'F');

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Day ${day.day}`, margin + 5, yPosition + 3);
    yPosition += 15;

    if (day.summary) {
      checkPageBreak(10);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(75, 85, 99);
      const summaryHeight = addWrappedText(sanitizeTextForPDF(day.summary), margin, yPosition, contentWidth, 10);
      yPosition += summaryHeight + 5;
    }

    // Activities
    day.activities.forEach((activity, actIndex) => {
      const titleX = margin + 45; // Start title after time column
      const titleMaxWidth = contentWidth - 50; // Leave space for time column

      // Pre-calculate total activity height to avoid page breaks mid-activity
      const calculateActivityHeight = () => {
        let height = 10; // Initial padding

        // Title height
        doc.setFontSize(11);
        const titleText = sanitizeTextForPDF(activity.title);
        const titleLines = doc.splitTextToSize(titleText, titleMaxWidth);
        height += Math.max(titleLines.length * 5, 6);

        // Location height
        const locationText = sanitizeTextForPDF(activity.location);
        if (locationText) {
          doc.setFontSize(9);
          const locationLines = doc.splitTextToSize(locationText, titleMaxWidth);
          height += locationLines.length * 4 + 3;
        }

        // Description height
        if (activity.description) {
          doc.setFontSize(9);
          const descLines = doc.splitTextToSize(sanitizeTextForPDF(activity.description), titleMaxWidth);
          height += descLines.length * 4 + 3;
        }

        // Restaurant options height
        if (activity.restaurantOptions && activity.restaurantOptions.length > 0) {
          height += 5; // "Suggested Restaurants:" header
          activity.restaurantOptions.slice(0, 2).forEach((restaurant) => {
            height += 4; // Restaurant name
            const vicinityText = sanitizeTextForPDF(restaurant.vicinity) || 'Nearby';
            doc.setFontSize(9);
            const vicinityLines = doc.splitTextToSize(vicinityText, titleMaxWidth - 10);
            height += vicinityLines.length * 3.5 + 2;
          });
        }

        // Transportation height
        if (activity.transportToNext && activity.transportToNext.modeName && actIndex < day.activities.length - 1) {
          height += 8;
        }

        height += 10; // Bottom padding
        return height;
      };

      const activityHeight = calculateActivityHeight();

      // Check if entire activity fits on current page, if not start new page
      if (yPosition + activityHeight > pageHeight - margin - 20) {
        doc.addPage();
        yPosition = margin;
      }

      const activityStartY = yPosition;
      yPosition += 5;

      // Activity time (on the left, like a timeline)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(59, 130, 246); // Blue color for time
      doc.text(activity.time, margin + 5, yPosition);

      // Activity title (after time, with wrapping to avoid overlap)
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      const titleText = sanitizeTextForPDF(activity.title);
      const titleLines = doc.splitTextToSize(titleText, titleMaxWidth);
      doc.text(titleLines, titleX, yPosition);
      const titleHeight = titleLines.length * 5;
      yPosition += Math.max(titleHeight, 6);

      // Location (indented to align with title)
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      const locationText = sanitizeTextForPDF(activity.location);
      if (locationText) {
        doc.text('Location:', titleX, yPosition);
        const locationLines = doc.splitTextToSize(locationText, titleMaxWidth);
        doc.text(locationLines, titleX + 22, yPosition);
        yPosition += locationLines.length * 4 + 3;
      }

      // Description for meals (indented to align with title)
      if (activity.description) {
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        const descLines = doc.splitTextToSize(sanitizeTextForPDF(activity.description), titleMaxWidth);
        doc.text(descLines, titleX, yPosition);
        yPosition += descLines.length * 4 + 3;
      }

      // Restaurant options for meals (indented to align with title)
      if (activity.restaurantOptions && activity.restaurantOptions.length > 0) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(34, 197, 94); // Green for restaurant section
        doc.text('Suggested Restaurants:', titleX, yPosition);
        yPosition += 5;

        doc.setFont('helvetica', 'normal');
        activity.restaurantOptions.slice(0, 2).forEach((restaurant, idx) => {
          doc.setFontSize(9);
          doc.setTextColor(55, 65, 81);
          const restaurantName = getDisplayName(restaurant.name);
          doc.text(`${idx + 1}. ${restaurantName}`, titleX + 5, yPosition);
          yPosition += 4;
          doc.setTextColor(156, 163, 175);
          const vicinityText = sanitizeTextForPDF(restaurant.vicinity) || 'Nearby';
          const vicinityLines = doc.splitTextToSize(vicinityText, titleMaxWidth - 10);
          doc.text(vicinityLines, titleX + 10, yPosition);
          yPosition += vicinityLines.length * 3.5 + 2;
        });
      }

      // Transportation to next activity
      if (activity.transportToNext && activity.transportToNext.modeName && actIndex < day.activities.length - 1) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(59, 130, 246); // Blue for transport
        const transport = activity.transportToNext;
        const modeName = sanitizeTextForPDF(transport.modeName) || 'Transit';
        const duration = sanitizeTextForPDF(transport.duration) || '';
        const distance = sanitizeTextForPDF(transport.distance) || '';
        doc.text(`>> ${modeName} - ${duration} (${distance})`, titleX, yPosition);
        yPosition += 5;
      }

      // Draw activity card border (entire activity is now guaranteed to be on same page)
      const finalActivityHeight = yPosition - activityStartY + 5;
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, activityStartY, contentWidth, finalActivityHeight, 2, 2, 'S');

      yPosition += 8; // Space after activity card
    });

    yPosition += 10; // Space after day
  });

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Generated by Planora - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return doc.output('blob');
}
