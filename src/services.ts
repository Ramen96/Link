export type Service = {
  name: string;
  description: string;
  url: string;
  icon: string;
  category: 'network' | 'services' | 'media' | 'dev';
};

export const services: Service[] = [
  {
    name: 'Pi-hole',
    description: 'Network-wide ad blocking',
    url: 'https://pihole.the404.page/admin',
    icon: 'shield',
    category: 'network',
  },
  {
    name: 'Router',
    description: 'Network administration',
    url: 'https://router.the404.page',
    icon: 'router',
    category: 'network',
  },
  {
    name: 'Open WebUI',
    description: 'Local AI interface',
    url: 'https://openwebui.the404.page',
    icon: 'bot',
    category: 'services',
  },
  {
    name: 'Filesync',
    description: 'File synchronization',
    url: 'https://filesync.the404.page',
    icon: 'folder-sync',
    category: 'services',
  },
];

export const categories: Record<Service['category'], string> = {
  network: 'Network',
  services: 'Services',
  media: 'Media',
  dev: 'Dev',
};
