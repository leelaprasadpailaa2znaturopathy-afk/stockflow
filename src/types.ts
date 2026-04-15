import { Timestamp } from 'firebase/firestore';

export type ProductStatus = 'In Stock' | 'Out of Stock' | 'Newly Added' | 'Back in Stock';

export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number | null;
  status: ProductStatus;
  size: string;
  price: number;
  imageUrl: string;
  websiteUrl?: string;
  launchDate: string | null;
  tags: string[];
  ribbon: string | null;
  releasedBatch: string | null;
  updatedAt: Timestamp;
  updatedBy: string;
}

export type ActivityAction = 'create' | 'update' | 'delete';

export interface ActivityLog {
  id: string;
  action: ActivityAction;
  productId: string;
  productName: string;
  timestamp: Timestamp;
  userEmail: string;
  details?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  isAdmin: boolean;
}
