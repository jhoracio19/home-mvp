import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Gestión doméstica',
    short_name: 'Hogar',
    description: 'Refri y tareas compartidas del hogar.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#F5F1EA',
    theme_color: '#4A342A',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
