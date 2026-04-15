/**
 * Local Product Enrichment Service
 * Generates realistic product details based on category without requiring API keys
 */

export interface EnrichedProductData {
  size: string;
  price: number;
  imageUrl: string;
  launchDate: string;
}

// Category-based data for realistic product suggestions
const categoryData: Record<string, { sizes: string[]; priceRange: [number, number]; imageKeywords: string[]; yearRange: [number, number] }> = {
  'Electronics': {
    sizes: ['Standard', 'Compact', 'Large', '4.5-6 inches', '150g', '500ml'],
    priceRange: [19.99, 999.99],
    imageKeywords: ['electronics', 'gadget', 'tech', 'device'],
    yearRange: [2020, 2026]
  },
  'Clothing': {
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    priceRange: [9.99, 129.99],
    imageKeywords: ['fashion', 'clothing', 'apparel', 'wear'],
    yearRange: [2022, 2026]
  },
  'Home & Garden': {
    sizes: ['Small', 'Medium', 'Large', '10x10 inches', '500ml', '1L'],
    priceRange: [14.99, 299.99],
    imageKeywords: ['home', 'garden', 'decor', 'furniture'],
    yearRange: [2021, 2026]
  },
  'Sports': {
    sizes: ['OneSize', 'S', 'M', 'L', '500ml', '1000ml'],
    priceRange: [24.99, 299.99],
    imageKeywords: ['sports', 'athletic', 'fitness', 'equipment'],
    yearRange: [2021, 2026]
  },
  'Food & Beverage': {
    sizes: ['200g', '500g', '1kg', '250ml', '500ml', '1L'],
    priceRange: [2.99, 49.99],
    imageKeywords: ['food', 'beverage', 'drink', 'snack'],
    yearRange: [2023, 2026]
  },
  'Books': {
    sizes: ['Hardcover', 'Paperback', 'eBook', '200 pages', '300 pages'],
    priceRange: [9.99, 34.99],
    imageKeywords: ['book', 'reading', 'fiction', 'literature'],
    yearRange: [2020, 2026]
  }
};

// Unsplash image URLs for different categories
const imageSuggestions: Record<string, string[]> = {
  'Electronics': [
    'https://images.unsplash.com/photo-1505228395891-9a51e7e86e81?w=400',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400',
  ],
  'Clothing': [
    'https://images.unsplash.com/photo-1505289077519-66d282ceaea0?w=400',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
  ],
  'Home & Garden': [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400',
    'https://images.unsplash.com/photo-1565636192335-14f8d1ce1e1b?w=400',
  ],
  'Sports': [
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    'https://images.unsplash.com/photo-1520444881298-1aa500764cbd?w=400',
  ],
  'Food & Beverage': [
    'https://images.unsplash.com/photo-1504674900629-048f7153a34e?w=400',
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
  ],
  'Books': [
    'https://images.unsplash.com/photo-1507842072343-583f20270319?w=400',
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400',
    'https://images.unsplash.com/photo-1507842591411-b06f506a21dd?w=400',
  ]
};

/**
 * Generates random but realistic product data based on the category
 * No API calls required - everything is local
 */
export async function enrichProductData(name: string, category: string): Promise<EnrichedProductData | null> {
  try {
    // Normalize category
    const normalizedCategory = Object.keys(categoryData).find(
      key => key.toLowerCase() === category.toLowerCase()
    ) || 'Electronics';

    const data = categoryData[normalizedCategory];
    const images = imageSuggestions[normalizedCategory] || imageSuggestions['Electronics'];

    // Generate random but realistic values
    const randomSize = data.sizes[Math.floor(Math.random() * data.sizes.length)];
    const randomPrice = Math.round(
      (Math.random() * (data.priceRange[1] - data.priceRange[0]) + data.priceRange[0]) * 100
    ) / 100;
    const randomImage = images[Math.floor(Math.random() * images.length)];
    const randomYear = Math.floor(Math.random() * (data.yearRange[1] - data.yearRange[0] + 1)) + data.yearRange[0];
    const randomMonth = Math.floor(Math.random() * 12) + 1;
    const randomDay = Math.floor(Math.random() * 28) + 1;
    const launchDate = `${randomYear}-${String(randomMonth).padStart(2, '0')}-${String(randomDay).padStart(2, '0')}`;

    return {
      size: randomSize,
      price: randomPrice,
      imageUrl: randomImage,
      launchDate
    };
  } catch (error) {
    console.error("Local enrichment failed:", error);
    return null;
  }
}
