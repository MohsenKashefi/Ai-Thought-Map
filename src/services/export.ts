/**
 * Export utilities for mind maps
 */
export class MindMapExporter {
  /**
   * Export mind map as PNG image
   */
  static async exportAsPNG(
    element: HTMLElement,
    filename: string = "mindmap"
  ): Promise<void> {
    try {
      // Dynamically import html2canvas (client-side only)
      const html2canvas = (await import("html2canvas")).default;

      // Capture the element as canvas
      const canvas = await html2canvas(element, {
        backgroundColor: "#f8f9fa",
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error("Failed to create image blob");
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch (error) {
      console.error("Failed to export as PNG:", error);
      throw new Error("Failed to export mind map as PNG");
    }
  }

  /**
   * Export mind map as PDF
   */
  static async exportAsPDF(
    element: HTMLElement,
    filename: string = "mindmap"
  ): Promise<void> {
    try {
      // Dynamically import libraries (client-side only)
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      // Capture the element as canvas
      const canvas = await html2canvas(element, {
        backgroundColor: "#f8f9fa",
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");

      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4");
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download PDF
      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error("Failed to export as PDF:", error);
      throw new Error("Failed to export mind map as PDF");
    }
  }

  /**
   * Copy mind map as image to clipboard (modern browsers only)
   */
  static async copyToClipboard(element: HTMLElement): Promise<void> {
    try {
      if (!navigator.clipboard || !window.ClipboardItem) {
        throw new Error("Clipboard API not supported");
      }

      // Dynamically import html2canvas (client-side only)
      const html2canvas = (await import("html2canvas")).default;

      const canvas = await html2canvas(element, {
        backgroundColor: "#f8f9fa",
        scale: 2,
        logging: false,
        useCORS: true,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error("Failed to create image blob");
        }

        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
      }, "image/png");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      throw new Error("Failed to copy mind map to clipboard");
    }
  }

  /**
   * Generate a filename based on the mind map's central idea
   */
  static generateFilename(centralIdea: string): string {
    const sanitized = centralIdea
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 50);

    const timestamp = new Date().toISOString().split("T")[0];
    return `${sanitized}-${timestamp}`;
  }
}
