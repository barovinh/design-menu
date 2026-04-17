import type { Category, CanvasElement } from './types';

export const starterCategories: Category[] = [
  {
    id: 'savory',
    title: 'Ăn vặt mặn',
    items: [
      { name: 'Bánh tráng trộn mỡ hành', price: '20k' },
      { name: 'Bánh tráng chấm sa tế', price: '15k' },
      { name: 'Cá viên chiên' },
      { name: 'Khoai tây lắc' },
      { name: 'Phô mai que' },
    ],
  },
  {
    id: 'sweet',
    title: 'Ăn vặt ngọt và tráng miệng',
    items: [
      { name: 'Chè Thái', price: '20k' },
      { name: 'Bánh flan', price: '5k' },
      { name: 'Khoai dẻo', price: '15k' },
    ],
  },
  {
    id: 'fruit',
    title: 'Trái cây',
    items: [
      { name: 'Bưởi', price: '15k' },
      { name: 'Trái cây tô', price: '25k' },
      { name: 'Khoai môn', price: '15k' },
    ],
  },
  {
    id: 'tea',
    title: 'Trà trái cây',
    items: [
      { name: 'Trà đào', price: '20k' },
      { name: 'Trà vải', price: '20k' },
      { name: 'Trà lài đác thơm', price: '20k' },
      { name: 'Trà dâu', price: '20k' },
      { name: 'Trà dâu tằm', price: '20k' },
    ],
  },
  {
    id: 'smoothie',
    title: 'Sinh tố và nước xay',
    items: [
      { name: 'Sinh tố dâu', price: '20k' },
      { name: 'Sinh tố bơ', price: '20k' },
      { name: 'Sinh tố xoài', price: '15k' },
      { name: 'Sinh tố mãng cầu', price: '20k' },
    ],
  },
  {
    id: 'coffee',
    title: 'Cà phê',
    items: [
      { name: 'Cà phê pha phin' },
      { name: 'Bạc xỉu', price: '15k' },
      { name: 'Cà phê muối', price: '15k' },
      { name: 'Cà phê đen', price: '10k' },
    ],
  },
];

export const starterElements: CanvasElement[] = [
  {
    id: 'hero-title',
    type: 'text',
    x: 80,
    y: 60,
    width: 420,
    height: 120,
    rotation: 0,
    opacity: 1,
    zIndex: 10,
    text: 'MENU TỰ THIẾT KẾ',
    fontSize: 36,
    accent: '#202020',
    textColor: '#202020',
    fontFamily: 'Georgia, serif',
  },
  {
    id: 'hero-subtitle',
    type: 'text',
    x: 80,
    y: 135,
    width: 460,
    height: 70,
    rotation: 0,
    opacity: 1,
    zIndex: 10,
    text: 'Kéo thả món ăn, thêm sticker, ảnh và sắp xếp lớp như Figma',
    fontSize: 16,
    accent: '#5f574f',
    textColor: '#5f574f',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: 'sticker-sun',
    type: 'sticker',
    x: 1040,
    y: 60,
    width: 120,
    height: 120,
    rotation: -8,
    opacity: 1,
    zIndex: 4,
    emoji: '✨',
    fontSize: 60,
  },
];
