const destinationImages: Record<string, string> = {
  penang: 'https://images.unsplash.com/photo-1751704316216-624074fb1176?w=800',
  langkawi: 'https://images.unsplash.com/photo-1703855467870-ec01a3853872?w=800',
  melaka: 'https://images.unsplash.com/photo-1589733000502-225e3f26fb8f?w=800',
  sabah: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',

  tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
  'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
  barcelona: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',

  bangkok: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800',
  hanoi: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
  'chiang mai': 'https://images.unsplash.com/photo-1725107223095-93176a2bb4ef?w=800',
  'siem reap': 'https://images.unsplash.com/photo-1562602833-0f4ab2fc46e3?w=800',
};

export function getUnsplashImage(city: string): string {
  const normalized = city.toLowerCase();
  return destinationImages[normalized] || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop`;
}
