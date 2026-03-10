export type Listing = {
  id: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
  lease_start: string; // ISO date (YYYY-MM-DD)
  lease_end: string; // ISO date (YYYY-MM-DD)
  description: string;
  contact_email: string;
  image_urls?: string[] | null;
  created_at: string; // ISO timestamp
};

export type ListingInsert = Omit<Listing, "id" | "created_at">;

