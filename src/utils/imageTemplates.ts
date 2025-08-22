/**
 * Image Import Templates and Guidelines
 * Provides guidance for AI-powered product extraction from images
 */

export interface ImageProductData {
  name?: string;
  category?: string;
  brand?: string;
  weight?: string;
  price?: number;
  barcode?: string;
  description?: string;
  origin?: string;
  halal_certified?: boolean;
  expiry_date?: string;
}

export const IMAGE_CAPTURE_GUIDELINES = {
  lighting: [
    "Use good lighting - natural daylight is best",
    "Avoid shadows on the product label",
    "Ensure text is clearly visible and not blurry"
  ],
  positioning: [
    "Hold the camera steady to avoid blur",
    "Position the product label facing the camera",
    "Fill most of the frame with the product",
    "Keep the camera parallel to the label for best text recognition"
  ],
  quality: [
    "Use high resolution (at least 1080p)",
    "Ensure the image is in focus",
    "Avoid reflections on glossy packaging",
    "Clean the camera lens before taking photos"
  ],
  content: [
    "Capture the front label with product name clearly visible",
    "Include nutritional information panel if available",
    "Show barcode if present",
    "Capture expiry date if visible on packaging"
  ]
};

export const EXTRACTABLE_INFORMATION = {
  "Product Name": {
    description: "Main product name from the label",
    tips: ["Usually the largest text on the package", "May include brand name"],
    example: "Coca Cola Classic 330ml"
  },
  "Brand": {
    description: "Brand or manufacturer name",
    tips: ["Often appears as a logo or prominent text", "May be separate from product name"],
    example: "Coca Cola"
  },
  "Category": {
    description: "Product category (AI will suggest based on product type)",
    tips: ["Determined by product appearance and text", "Can be manually corrected"],
    example: "Beverages"
  },
  "Weight/Size": {
    description: "Product weight, volume, or quantity",
    tips: ["Look for ml, L, g, kg, oz, pieces", "Usually near product name"],
    example: "330ml, 1kg, 500g"
  },
  "Price": {
    description: "Product price if visible on packaging",
    tips: ["May appear as stickers or printed price", "Not always available"],
    example: "$2.99, RM 5.50"
  },
  "Barcode": {
    description: "Product barcode number",
    tips: ["Usually 12-13 digits", "Found on back or side of package"],
    example: "123456789012"
  },
  "Expiry Date": {
    description: "Best before or expiry date",
    tips: ["Look for 'EXP', 'Best Before', 'Use By'", "Various date formats"],
    example: "2025-12-31, 31/12/2025"
  },
  "Origin": {
    description: "Country of origin or manufacture",
    tips: ["Look for 'Made in', 'Product of'", "May be in small text"],
    example: "Made in Malaysia"
  },
  "Halal Certification": {
    description: "Halal certification logos or text",
    tips: ["Look for JAKIM, MUI, or other halal logos", "May say 'Halal Certified'"],
    example: "JAKIM Halal logo"
  }
};

export const COMMON_ISSUES_AND_SOLUTIONS = {
  "Blurry Text": {
    problem: "AI cannot read blurry or unclear text",
    solutions: [
      "Retake the photo with better focus",
      "Move closer to the product",
      "Ensure adequate lighting",
      "Hold the camera steady"
    ]
  },
  "Poor Lighting": {
    problem: "Dark images or harsh shadows affect recognition",
    solutions: [
      "Use natural daylight when possible",
      "Turn on room lights",
      "Avoid direct flash which creates glare",
      "Position light source behind the camera"
    ]
  },
  "Partial Information": {
    problem: "AI only extracts some product details",
    solutions: [
      "Take multiple photos from different angles",
      "Capture both front and back labels",
      "Manually fill in missing information",
      "Use the manual entry form for complete data"
    ]
  },
  "Wrong Category": {
    problem: "AI suggests incorrect product category",
    solutions: [
      "Manually select the correct category",
      "Provide clearer product context in the image",
      "Include packaging that shows product type"
    ]
  },
  "Missing Expiry Date": {
    problem: "Expiry date not detected or visible",
    solutions: [
      "Look for date stamps on packaging",
      "Check bottom or sides of package",
      "Manually enter the expiry date",
      "Use a reasonable future date if unknown"
    ]
  }
};

export const PHOTO_EXAMPLES = {
  good: [
    {
      title: "Clear Front Label",
      description: "Product name, brand, and size clearly visible",
      tips: ["Good lighting", "Sharp focus", "Full label in frame"]
    },
    {
      title: "Barcode Visible",
      description: "Barcode numbers are readable",
      tips: ["Straight angle", "No shadows", "High contrast"]
    },
    {
      title: "Nutritional Panel",
      description: "Back panel with detailed information",
      tips: ["All text readable", "No glare", "Complete panel visible"]
    }
  ],
  poor: [
    {
      title: "Blurry Image",
      description: "Text is not readable due to motion blur",
      fix: "Hold camera steady and ensure good focus"
    },
    {
      title: "Poor Lighting",
      description: "Dark image with shadows obscuring text",
      fix: "Use better lighting or move to brighter location"
    },
    {
      title: "Partial View",
      description: "Important information cut off from frame",
      fix: "Include complete label in the photo"
    }
  ]
};

export const SUPPORTED_LANGUAGES = [
  "English",
  "Malay (Bahasa Malaysia)",
  "Chinese (Simplified & Traditional)",
  "Arabic",
  "Tamil",
  "Hindi"
];

export const AI_PROCESSING_STEPS = [
  {
    step: 1,
    title: "Image Analysis",
    description: "AI analyzes the uploaded image for text and visual elements"
  },
  {
    step: 2,
    title: "Text Recognition",
    description: "Optical Character Recognition (OCR) extracts text from the image"
  },
  {
    step: 3,
    title: "Information Extraction",
    description: "AI identifies and categorizes product information"
  },
  {
    step: 4,
    title: "Data Validation",
    description: "Extracted data is validated and formatted for the system"
  },
  {
    step: 5,
    title: "Manual Review",
    description: "You can review and edit the extracted information before saving"
  }
];

/**
 * Generates a comprehensive image import guide
 */
export function generateImageImportGuide(): string {
  let guide = "IMAGE IMPORT GUIDE FOR PRODUCT SCANNING\n";
  guide += "==========================================\n\n";
  
  guide += "PHOTO CAPTURE GUIDELINES:\n";
  guide += "------------------------\n";
  
  Object.entries(IMAGE_CAPTURE_GUIDELINES).forEach(([category, tips]) => {
    guide += `\n${category.toUpperCase()}:\n`;
    tips.forEach(tip => guide += `• ${tip}\n`);
  });
  
  guide += "\nEXTRACTABLE INFORMATION:\n";
  guide += "-----------------------\n";
  
  Object.entries(EXTRACTABLE_INFORMATION).forEach(([field, info]) => {
    guide += `\n${field}:\n`;
    guide += `  Description: ${info.description}\n`;
    guide += `  Example: ${info.example}\n`;
    guide += `  Tips:\n`;
    info.tips.forEach(tip => guide += `    • ${tip}\n`);
  });
  
  guide += "\nCOMMON ISSUES & SOLUTIONS:\n";
  guide += "-------------------------\n";
  
  Object.entries(COMMON_ISSUES_AND_SOLUTIONS).forEach(([issue, details]) => {
    guide += `\n${issue}:\n`;
    guide += `  Problem: ${details.problem}\n`;
    guide += `  Solutions:\n`;
    details.solutions.forEach(solution => guide += `    • ${solution}\n`);
  });
  
  guide += "\nSUPPORTED LANGUAGES:\n";
  guide += "-------------------\n";
  SUPPORTED_LANGUAGES.forEach(lang => guide += `• ${lang}\n`);
  
  guide += "\nAI PROCESSING STEPS:\n";
  guide += "-------------------\n";
  AI_PROCESSING_STEPS.forEach(step => {
    guide += `${step.step}. ${step.title}: ${step.description}\n`;
  });
  
  guide += "\nTIPS FOR BEST RESULTS:\n";
  guide += "---------------------\n";
  guide += "• Take multiple photos if the first attempt doesn't capture all information\n";
  guide += "• Always review and verify the extracted data before saving\n";
  guide += "• Manually enter missing required fields (cost_price, selling_price, etc.)\n";
  guide += "• Use consistent category names for better organization\n";
  guide += "• Check expiry dates carefully as they're critical for inventory management\n";
  
  return guide;
}

/**
 * Validates extracted image data
 */
export function validateImageData(data: ImageProductData): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for minimum required information
  if (!data.name || data.name.trim() === '') {
    errors.push('Product name is required');
  }
  
  if (!data.category || data.category.trim() === '') {
    warnings.push('Category not detected - please select manually');
  }
  
  if (!data.expiry_date) {
    warnings.push('Expiry date not found - please enter manually');
  }
  
  if (!data.price && !data.barcode) {
    warnings.push('Neither price nor barcode detected - consider retaking the photo');
  }
  
  // Validate data formats
  if (data.expiry_date) {
    const date = new Date(data.expiry_date);
    if (isNaN(date.getTime())) {
      errors.push('Invalid expiry date format detected');
    }
  }
  
  if (data.price && (isNaN(data.price) || data.price <= 0)) {
    errors.push('Invalid price detected');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}