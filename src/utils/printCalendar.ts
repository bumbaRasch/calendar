import type { CalendarApi } from '@fullcalendar/core';
import type { PrintOptions } from '../components/Calendar/PrintDialog';

export interface PrintCalendarParams {
  calendarApi: CalendarApi;
  options: PrintOptions;
  dateRange: {
    start: Date;
    end: Date;
    title: string;
  };
  currentView: string;
}

/**
 * Utility class for handling calendar printing functionality
 */
export class CalendarPrinter {
  private static printWindow: Window | null = null;

  /**
   * Print the calendar with the specified options
   */
  static async printCalendar({
    calendarApi,
    options,
    dateRange,
    currentView,
  }: PrintCalendarParams): Promise<void> {
    try {
      // Prepare print content
      const printContent = await this.preparePrintContent({
        calendarApi,
        options,
        dateRange,
        currentView,
      });

      // Apply print styles temporarily
      this.applyPrintStyles();

      // Create print-specific DOM modifications
      this.createPrintLayout(printContent);

      // Trigger browser print dialog
      setTimeout(() => {
        window.print();
        this.cleanupPrintStyles();
      }, 500); // Small delay to ensure styles are applied
    } catch (_error) {
      // Error is re-thrown, no console needed
      throw new Error('Failed to print calendar');
    }
  }

  /**
   * Preview the calendar print layout
   */
  static async previewCalendar({
    calendarApi,
    options,
    dateRange,
    currentView,
  }: PrintCalendarParams): Promise<void> {
    try {
      const printContent = await this.preparePrintContent({
        calendarApi,
        options,
        dateRange,
        currentView,
      });

      this.openPrintPreview(printContent);
    } catch (_error) {
      // Error is re-thrown, no console needed
      throw new Error('Failed to preview calendar');
    }
  }

  /**
   * Prepare the print content based on options
   */
  private static async preparePrintContent({
    calendarApi,
    options,
    dateRange,
    currentView,
  }: PrintCalendarParams): Promise<string> {
    // Save current state
    const originalView = calendarApi.view.type;
    const originalDate = calendarApi.getDate();

    try {
      // Switch to desired view if different from current
      if (options.view !== 'current') {
        const viewMap: Record<string, string> = {
          month: 'dayGridMonth',
          week: 'timeGridWeek',
          day: 'timeGridDay',
          list: 'listWeek',
        };

        if (options.view in viewMap) {
          calendarApi.changeView(viewMap[options.view]);
        }
      }

      // Generate print header
      const headerContent = options.showHeader
        ? this.generatePrintHeader({
            title: dateRange.title,
            viewType: this.getViewDisplayName(
              options.view === 'current' ? currentView : options.view,
            ),
            dateRange,
          })
        : '';

      // Generate print footer
      const footerContent = options.showFooter
        ? this.generatePrintFooter()
        : '';

      // Get calendar HTML content
      const calendarContent = await this.getCalendarHTML(calendarApi);

      // Apply content filters based on options
      const filteredContent = this.applyContentFilters(
        calendarContent,
        options,
      );

      return `
        ${headerContent}
        ${filteredContent}
        ${footerContent}
      `;
    } finally {
      // Restore original state
      if (originalView !== calendarApi.view.type) {
        calendarApi.changeView(originalView);
      }
      calendarApi.gotoDate(originalDate);
    }
  }

  /**
   * Generate print header HTML
   */
  private static generatePrintHeader({
    title,
    viewType,
    dateRange,
  }: {
    title: string;
    viewType: string;
    dateRange: { start: Date; end: Date };
  }): string {
    const formattedDateRange = this.formatDateRange(
      dateRange.start,
      dateRange.end,
    );

    return `
      <div class="print-header print-only">
        <h1>${title}</h1>
        <p class="print-date-range">${formattedDateRange}</p>
        <p class="print-view-type">${viewType} View</p>
      </div>
    `;
  }

  /**
   * Generate print footer HTML
   */
  private static generatePrintFooter(): string {
    const printDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return `
      <div class="print-footer print-only">
        <p>Printed on ${printDate}</p>
      </div>
    `;
  }

  /**
   * Get calendar HTML content
   */
  private static async getCalendarHTML(
    _calendarApi: CalendarApi,
  ): Promise<string> {
    // Wait for calendar to render
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Find the calendar element in the DOM
    const calendarEl = document.querySelector('.fc');
    if (!calendarEl) {
      throw new Error('Calendar element not found');
    }

    return calendarEl.outerHTML;
  }

  /**
   * Apply content filters based on print options
   */
  private static applyContentFilters(
    content: string,
    options: PrintOptions,
  ): string {
    let filteredContent = content;

    // Filter by event categories
    if (options.eventCategories.length > 0) {
      // This would require more complex DOM manipulation
      // For now, we'll apply category-based styling through CSS
      const categoryClasses = options.eventCategories
        .map((cat) => `.category-${cat}`)
        .join(', ');
      filteredContent = `<style>
        .fc-event:not(${categoryClasses}) { display: none !important; }
      </style>${filteredContent}`;
    }

    // Apply color options
    if (!options.includeColors) {
      filteredContent = `<style>
        .fc-event { 
          background: #fff !important; 
          border-color: #333 !important; 
          color: #000 !important; 
        }
      </style>${filteredContent}`;
    }

    // Remove weekend columns if not included
    if (!options.includeWeekends) {
      filteredContent = `<style>
        .fc-day-sat, .fc-day-sun { display: none !important; }
        .fc-col-header-cell[data-date*="Saturday"], 
        .fc-col-header-cell[data-date*="Sunday"] { display: none !important; }
      </style>${filteredContent}`;
    }

    return filteredContent;
  }

  /**
   * Apply print-specific styles to the document
   */
  private static applyPrintStyles(): void {
    // Create print stylesheet if it doesn't exist
    const existingStyle = document.getElementById('calendar-print-styles');
    if (existingStyle) return;

    const styleElement = document.createElement('style');
    styleElement.id = 'calendar-print-styles';
    styleElement.textContent = `
      @media print {
        body * { visibility: hidden; }
        .calendar-container, 
        .calendar-container * { visibility: visible; }
        .calendar-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 100% !important;
          height: auto !important;
          overflow: visible !important;
        }
      }
    `;
    document.head.appendChild(styleElement);
  }

  /**
   * Clean up print styles
   */
  private static cleanupPrintStyles(): void {
    const styleElement = document.getElementById('calendar-print-styles');
    if (styleElement) {
      styleElement.remove();
    }
  }

  /**
   * Create print layout modifications
   */
  private static createPrintLayout(content: string): void {
    // Add print-specific elements to the DOM
    const printContainer = document.createElement('div');
    printContainer.id = 'print-content';
    printContainer.className = 'print-only';
    printContainer.innerHTML = content;

    document.body.appendChild(printContainer);

    // Clean up after print
    const afterPrint = () => {
      const container = document.getElementById('print-content');
      if (container) {
        container.remove();
      }
      window.removeEventListener('afterprint', afterPrint);
    };

    window.addEventListener('afterprint', afterPrint);
  }

  /**
   * Open print preview in new window
   */
  private static openPrintPreview(content: string): void {
    // Close existing preview window if open
    if (this.printWindow && !this.printWindow.closed) {
      this.printWindow.close();
    }

    // Create new preview window
    const printWindow = window.open(
      '',
      '_blank',
      'width=800,height=600,scrollbars=yes',
    );
    if (!printWindow) {
      throw new Error('Failed to open print preview window');
    }

    this.printWindow = printWindow;

    // Load print styles
    const printStyles = this.getPrintStylesheet();

    // Create preview document
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Calendar Print Preview</title>
          <style>${printStyles}</style>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              margin: 20px;
              background: #f5f5f5;
            }
            .preview-container {
              background: white;
              padding: 20px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
              max-width: 8.5in;
              margin: 0 auto;
            }
            .preview-header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #333;
            }
            .preview-footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 10px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="preview-container">
            ${content}
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px;">
              Print This Preview
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; font-size: 14px; margin-left: 10px;">
              Close Preview
            </button>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
  }

  /**
   * Get print stylesheet content
   */
  private static getPrintStylesheet(): string {
    // Return CSS content from the print stylesheet
    // This would typically be loaded from the CSS file
    return `
      @media print {
        @page { margin: 0.5in; }
        body { font-size: 12px; line-height: 1.4; }
        .fc { border: 1px solid #ddd; }
        .fc-event { border: 1px solid #333; background: #fff; color: #000; }
        .fc-day-header { background: #f8f9fa; font-weight: bold; }
        .fc-day-today { background: #f5f5f5; }
      }
    `;
  }

  /**
   * Format date range for display
   */
  private static formatDateRange(start: Date, end: Date): string {
    const formatOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString('en-US', formatOptions);
    }

    return `${start.toLocaleDateString('en-US', formatOptions)} - ${end.toLocaleDateString('en-US', formatOptions)}`;
  }

  /**
   * Get display name for view type
   */
  private static getViewDisplayName(view: string): string {
    const viewNames: Record<string, string> = {
      current: 'Current',
      month: 'Month',
      dayGridMonth: 'Month',
      week: 'Week',
      timeGridWeek: 'Week',
      day: 'Day',
      timeGridDay: 'Day',
      list: 'List',
      listWeek: 'List',
    };

    return viewNames[view] || 'Calendar';
  }

  /**
   * Check if browser supports printing
   */
  static isPrintSupported(): boolean {
    return typeof window !== 'undefined' && 'print' in window;
  }

  /**
   * Get recommended print settings based on view type
   */
  static getRecommendedSettings(viewType: string): Partial<PrintOptions> {
    const recommendations: Record<string, Partial<PrintOptions>> = {
      dayGridMonth: {
        orientation: 'landscape',
        paperSize: 'A4',
        includeWeekends: true,
        fontSize: 'small',
      },
      timeGridWeek: {
        orientation: 'portrait',
        paperSize: 'A4',
        includeWeekends: true,
        fontSize: 'normal',
      },
      timeGridDay: {
        orientation: 'portrait',
        paperSize: 'A4',
        includeWeekends: false,
        fontSize: 'normal',
      },
      listWeek: {
        orientation: 'portrait',
        paperSize: 'A4',
        includeWeekends: true,
        fontSize: 'normal',
        includeEventDetails: true,
      },
    };

    return recommendations[viewType] || {};
  }
}
