export type PropertyType = 'apartment' | 'villa' | 'duplex' | 'office' | 'chalet';
export type PropertyStatus = 'for-sale' | 'for-rent' | 'sold' | 'rented';
export type RequestStatus = 'pending' | 'under-review' | 'approved' | 'rejected' | 'completed';

export type PaymentType = 'cash' | 'installment';

export interface PaymentOptions {
  type: PaymentType;
  downPayment?: number;
  installmentMonths?: number;
  monthlyPayment?: number;
}

export interface Property {
  id: string;
  title: string;
  titleAr: string;
  type: PropertyType;
  status: PropertyStatus;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  floor?: number;
  location: string;
  address: string;
  description: string;
  descriptionAr: string;
  image: string;
  images: string[];
  featured: boolean;
  createdAt: string;
  sellerId?: string;
  adminId?: string;
  adCode?: string;
  paymentOptions?: PaymentOptions[];
  priceHistory?: { date: string; price: number }[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  propertyId?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'super-admin' | 'admin' | 'user';
  avatar: string;
  createdAt: string;
  isSuperAdmin?: boolean;
}

export interface Request {
  id: string;
  type: 'buy' | 'sell' | 'inquiry';
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  propertyId?: string;
  propertyTitle?: string;
  message: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export const PROPERTIES: Property[] = [
  {
    id: 'p1',
    title: 'Suez Road 3-Room Apartment',
    titleAr: 'شقة 3 غرف على طريق السويس',
    type: 'apartment',
    status: 'for-sale',
    price: 3200000,
    area: 140,
    bedrooms: 3,
    bathrooms: 2,
    floor: 2,
    location: 'طريق السويس، القاهرة',
    address: 'طريق السويس مباشرة، جمب أول جامعة ومستشفى بريطانية في مصر',
    description: 'شقة 3 غرف متشطبة بالكامل بمقدم 750 ألف جنيه',
    descriptionAr: 'شقة 3 غرف متشطبة بالكامل بمقدم 750 ألف في أقوى لوكيشن على طريق السويس مباشرة، مبنية بنسبة انشاءات 40%',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    ],
    featured: true,
    createdAt: '2024-01-15',
    adminId: 'u1',
    adCode: 'GS-001',
    paymentOptions: [
      { type: 'cash' },
      { type: 'installment', downPayment: 750000, installmentMonths: 48, monthlyPayment: 58333 }
    ],
    priceHistory: [
      { date: '2023-12-01', price: 3100000 },
      { date: '2024-01-01', price: 3200000 }
    ]
  },
  {
    id: 'p2',
    title: 'Fifth Settlement Villa',
    titleAr: 'فيلات وشقق التجمع الخامس',
    type: 'villa',
    status: 'for-sale',
    price: 20000000,
    area: 400,
    bedrooms: 5,
    bathrooms: 4,
    location: 'التجمع الخامس، القاهرة',
    address: 'قلب التجمع الخامس - قريب من النادي الأهلي والتسعين الجنوبي',
    description: 'فيلات وشقق استلام فوري في قلب التجمع الخامس',
    descriptionAr: 'فيلات بمقدم 2 مليون جنيه ومتوسط أسعار 20 مليون جنيه، فخامة وخصوصية وتصميم عصري مع واجهات مميزة وفيو مفتوح',
    image: 'https://images.unsplash.com/photo-1761158494764-bbf2a2e2a70d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: [
      'https://images.unsplash.com/photo-1761158494764-bbf2a2e2a70d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    ],
    featured: true,
    createdAt: '2024-01-20',
    adminId: 'u5',
    adCode: 'GS-002',
    paymentOptions: [
      { type: 'cash' },
      { type: 'installment', downPayment: 2000000, installmentMonths: 60, monthlyPayment: 300000 }
    ],
    priceHistory: [
      { date: '2023-11-15', price: 19000000 },
      { date: '2024-01-15', price: 20000000 }
    ]
  },
  {
    id: 'p3',
    title: 'Fifth Settlement Apartment',
    titleAr: 'شقة 3 غرف التجمع الخامس',
    type: 'apartment',
    status: 'for-sale',
    price: 12000000,
    area: 160,
    bedrooms: 3,
    bathrooms: 2,
    floor: 5,
    location: 'التجمع الخامس، القاهرة',
    address: 'قلب التجمع الخامس - قريب من جميع الخدمات والمحاور',
    description: 'شقة 3 غرف مع استلام فوري والتقسيط بيوصل ل 10 سنوات',
    descriptionAr: 'شقة 3 غرم ماستر في قلب التجمع الخامس بمقدم 1.2 مليون، متوسط أسعار 12 مليون جنيه، استلام فوري و خلال 6 شهور',
    image: 'https://images.unsplash.com/photo-1662749518398-1b429b4fee67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: [
      'https://images.unsplash.com/photo-1662749518398-1b429b4fee67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    ],
    featured: true,
    createdAt: '2024-02-01',
    adminId: 'u6',
    adCode: 'GS-003',
    paymentOptions: [
      { type: 'cash' },
      { type: 'installment', downPayment: 1200000, installmentMonths: 120, monthlyPayment: 90000 }
    ]
  },
  {
    id: 'p4',
    title: 'Golden Square Property',
    titleAr: 'عقار جولدن سكوير',
    type: 'apartment',
    status: 'for-sale',
    price: 8000000,
    area: 200,
    bedrooms: 3,
    bathrooms: 2,
    floor: 8,
    location: 'جولدن سكوير، القاهرة',
    address: 'قلب جولدن سكوير - قريب من الفيوزون وشارع النوادي و600 متر للنادي الأهلي',
    description: 'فرصة سكن واستثمار في موقع لا يتكرر في قلب الجولدن سكوير',
    descriptionAr: 'فرصة سكن واستثمار في موقع لا يتكرر في قلب جولدن سكوير، مقدم يبدأ من 1.8 مليون، تقسيط مريح على 5 سنوات',
    image: 'https://images.unsplash.com/photo-1760611656071-a8bef0578874?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: [
      'https://images.unsplash.com/photo-1760611656071-a8bef0578874?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    ],
    featured: true,
    createdAt: '2024-02-05',
    adminId: 'u1',
    adCode: 'GS-004',
    paymentOptions: [
      { type: 'cash' },
      { type: 'installment', downPayment: 1800000, installmentMonths: 60, monthlyPayment: 103333 }
    ],
    priceHistory: [
      { date: '2023-12-01', price: 7500000 },
      { date: '2024-02-01', price: 8000000 }
    ]
  },
  {
    id: 'p5',
    title: 'New Cairo Properties',
    titleAr: 'عقارات مصر الجديدة',
    type: 'apartment',
    status: 'for-sale',
    price: 4000000,
    area: 180,
    bedrooms: 3,
    bathrooms: 2,
    floor: 3,
    location: 'النرجس الجديدة، مصر الجديدة',
    address: 'أفضل المواقع في النرجس الجديدة والنورث هاوس وبيت الوطن وشمال الرحاب',
    description: 'أسعار تبدأ من 4 مليون في أفضل مواقع مصر الجديدة',
    descriptionAr: 'أسعار تبدأ من 4 مليون جنيه في أفضل المواقع في النرجس الجديدة والنورث هاوس وبيت الوطن وشمال الرحاب',
    image: 'https://images.unsplash.com/photo-1656646424531-cc9041d3e5ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: [
      'https://images.unsplash.com/photo-1656646424531-cc9041d3e5ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    ],
    featured: false,
    createdAt: '2024-02-10',
    adminId: 'u5',
    adCode: 'GS-005',
    paymentOptions: [
      { type: 'cash' },
      { type: 'installment', downPayment: 800000, installmentMonths: 48, monthlyPayment: 66666 }
    ]
  },
  {
    id: 'p6',
    title: 'R8 New Capital Villa',
    titleAr: 'فيلا R8 العاصمة الإدارية',
    type: 'villa',
    status: 'for-sale',
    price: 6000000,
    area: 250,
    bedrooms: 4,
    bathrooms: 3,
    floor: 1,
    location: 'R8، العاصمة الإدارية',
    address: 'R8، قلب العاصمة الإدارية - مع أقوى مطور',
    description: 'فيلتك بسعر شقة في قلب R8 بمقدم 10% و قسط شهري 60 ألف',
    descriptionAr: 'فيلتك بسعر شقة في قلب R8 بمقدم 10% وقسط شهري 60 ألف جنيه بخصم وسعر الطرح الأول مع أقوى مطور في العاصمة الإدارية',
    image: 'https://images.unsplash.com/photo-1688469625388-e6f8d43df357?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: [
      'https://images.unsplash.com/photo-1688469625388-e6f8d43df357?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    ],
    featured: false,
    createdAt: '2024-02-15',
    adminId: 'u6',
    adCode: 'GS-006',
    paymentOptions: [
      { type: 'cash' },
      { type: 'installment', downPayment: 600000, installmentMonths: 60, monthlyPayment: 60000 }
    ]
  },
  {
    id: 'p7',
    title: 'Sixth Settlement Apartment',
    titleAr: 'شقة التجمع السادس',
    type: 'apartment',
    status: 'for-sale',
    price: 3500000,
    area: 140,
    bedrooms: 1,
    bathrooms: 1,
    floor: 2,
    location: 'التجمع السادس، القاهرة',
    address: 'أمام كمبوند الكازار - 10 دقايق من الجامعة الأمريكية، 5 دقايق من طريق السويس',
    description: 'شقة 1 غرفة بسعر 3 مليون في التجمع السادس',
    descriptionAr: 'شقة 1 غرفة بسعر 3 مليون جنيه، وشقه 2 غرفة بسعر 4.5 مليون في أفضل موقع بالتجمع السادس بمقدم 300 ألف',
    image: 'https://images.unsplash.com/photo-1761688145251-3745c842d766?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: [
      'https://images.unsplash.com/photo-1761688145251-3745c842d766?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    ],
    featured: false,
    createdAt: '2024-03-01',
    adminId: 'u1',
    adCode: 'GS-007',
    paymentOptions: [
      { type: 'cash' },
      { type: 'installment', downPayment: 300000, installmentMonths: 48, monthlyPayment: 58333 }
    ]
  },
  {
    id: 'p8',
    title: 'Sixth Settlement 2-Room Apartment',
    titleAr: 'شقة 2 غرفة التجمع السادس',
    type: 'apartment',
    status: 'for-sale',
    price: 4500000,
    area: 180,
    bedrooms: 2,
    bathrooms: 2,
    location: 'التجمع السادس، القاهرة',
    address: 'التجمع السادس - أمام كمبوند الكازار',
    description: 'شقة 2 غرفة بسعر 4.5 مليون في أفضل موقع بالتجمع السادس',
    descriptionAr: 'شقة 2 غرفة بسعر 4.5 مليون جنيه في أفضل موقع في التجمع السادس، قريب من جميع الخدمات والمحاور الرئيسية',
    image: 'https://images.unsplash.com/photo-1762059976893-e73c45e867e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: [
      'https://images.unsplash.com/photo-1762059976893-e73c45e867e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    ],
    featured: false,
    createdAt: '2024-03-05',
    adminId: 'u5',
    adCode: 'GS-008',
    paymentOptions: [
      { type: 'cash' },
      { type: 'installment', downPayment: 300000, installmentMonths: 60, monthlyPayment: 70000 }
    ]
  },
  {
    id: 'p9',
    title: 'Narges New City Villa',
    titleAr: 'فيلا النرجس الجديدة',
    type: 'villa',
    status: 'for-sale',
    price: 3500000,
    area: 200,
    bedrooms: 3,
    bathrooms: 2,
    floor: 1,
    location: 'النرجس الجديدة، القاهرة',
    address: 'النرجس الجديدة - أفضل المواقع السكنية',
    description: 'فيلا فاخرة في قلب النرجس الجديدة',
    descriptionAr: 'فيلا فاخرة في أفضل موقع بالنرجس الجديدة مع تصميم عصري وحديقة واسعة',
    image: 'https://images.unsplash.com/photo-1761158494764-bbf2a2e2a70d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: ['https://images.unsplash.com/photo-1761158494764-bbf2a2e2a70d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'],
    featured: false,
    createdAt: '2024-03-10',
    adminId: 'u1',
    adCode: 'GS-009',
    paymentOptions: [
      { type: 'cash' },
      { type: 'installment', downPayment: 700000, installmentMonths: 48, monthlyPayment: 70000 }
    ]
  },
  {
    id: 'p10',
    title: 'North House Cairo',
    titleAr: 'شقة النورث هاوس',
    type: 'apartment',
    status: 'for-sale',
    price: 5000000,
    area: 200,
    bedrooms: 3,
    bathrooms: 2,
    floor: 6,
    location: 'النورث هاوس، مصر الجديدة',
    address: 'النورث هاوس - موقع متميز بين الأحياء الراقية',
    description: 'شقة راقية في النورث هاوس بإطلالة رائعة',
    descriptionAr: 'شقة 3 غرف في النورث هاوس بموقع استراتيجي قريب من جميع الخدمات والمحاور الرئيسية',
    image: 'https://images.unsplash.com/photo-1662749518398-1b429b4fee67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: ['https://images.unsplash.com/photo-1662749518398-1b429b4fee67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'],
    featured: false,
    createdAt: '2024-03-11',
    adminId: 'u5',
    adCode: 'GS-010',
    paymentOptions: [
      { type: 'cash' },
      { type: 'installment', downPayment: 1000000, installmentMonths: 60, monthlyPayment: 66666 }
    ]
  },
  {
    id: 'p11',
    title: 'Beit El-Watan Property',
    titleAr: 'عقار بيت الوطن',
    type: 'apartment',
    status: 'for-sale',
    price: 6500000,
    area: 220,
    bedrooms: 3,
    bathrooms: 2,
    floor: 4,
    location: 'بيت الوطن، مصر الجديدة',
    address: 'بيت الوطن - مجمع سكني متميز مع خدمات شاملة',
    description: 'شقة فاخرة في بيت الوطن مع مرافق حديثة',
    descriptionAr: 'شقة 3 غرف في بيت الوطن بتصميم حديث وموقع ممتاز بالقرب من جميع الخدمات',
    image: 'https://images.unsplash.com/photo-1760611656071-a8bef0578874?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: ['https://images.unsplash.com/photo-1760611656071-a8bef0578874?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'],
    featured: false,
    createdAt: '2024-03-12',
    adminId: 'u6',
    adCode: 'GS-011',
    paymentOptions: [
      { type: 'cash' },
      { type: 'installment', downPayment: 1300000, installmentMonths: 60, monthlyPayment: 88333 }
    ]
  },
  {
    id: 'p12',
    title: 'North Heliopolis Properties',
    titleAr: 'عقارات شمال الرحاب',
    type: 'apartment',
    status: 'for-sale',
    price: 7500000,
    area: 250,
    bedrooms: 4,
    bathrooms: 3,
    floor: 5,
    location: 'شمال الرحاب، مصر الجديدة',
    address: '��مال الرحاب - موقع متقدم بين المناطق الراقية',
    description: 'شقة 4 غرف فاخرة في شمال الرحاب',
    descriptionAr: 'شقة 4 غرف بتصميم فاخر في شمال الرحاب مع إطلالات رائعة وموقع استثماري ممتاز',
    image: 'https://images.unsplash.com/photo-1656646424531-cc9041d3e5ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: ['https://images.unsplash.com/photo-1656646424531-cc9041d3e5ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'],
    featured: false,
    createdAt: '2024-03-13',
    adminId: 'u1',
    adCode: 'GS-012',
    paymentOptions: [
      { type: 'cash' },
      { type: 'installment', downPayment: 1500000, installmentMonths: 72, monthlyPayment: 83333 }
    ]
  },
  {
    id: 'p13',
    title: 'Suez Road Apartment',
    titleAr: 'شقة 3 غرف طريق السويس',
    type: 'apartment',
    status: 'for-sale',
    price: 3200000,
    area: 150,
    bedrooms: 3,
    bathrooms: 2,
    floor: 3,
    location: 'طريق السويس، القاهرة',
    address: 'طريق السويس مباشرة جمب أول جامعة ومستشفى بريطانية في مصر',
    description: 'شقة 3 غرف متشطبة بالكامل في أقوى لوكيشن',
    descriptionAr: 'شقة 3 غرف متشطبة بالكامل بمقدم 750 ألف في أقوى لوكيشن على طريق السويس. مبنية بنسبة إنشاءات 40% على أرض الواقع. قريبة جداً من أول جامعة ومستشفى بريطانية في مصر.',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'],
    featured: true,
    createdAt: '2024-03-14',
    adminId: 'u1',
    adCode: 'GS-013',
    paymentOptions: [
      { type: 'cash' },
      { type: 'installment', downPayment: 750000, installmentMonths: 60, monthlyPayment: 53333 }
    ]
  },
  {
    id: 'p14',
    title: 'Fifth Settlement Villas & Apartments',
    titleAr: 'فيلات وشقق التجمع الخامس',
    type: 'villa',
    status: 'for-sale',
    price: 18000000,
    area: 200,
    bedrooms: 3,
    bathrooms: 2,
    floor: 1,
    location: 'التجمع الخامس، القاهرة',
    address: 'قلب التجمع الخامس - موقع استثماري متميز',
    description: 'فيلات وشقق استلام فوري في قلب التجمع الخامس',
    descriptionAr: 'فيلات وشقق استلام فوري في قلب التجمع الخامس بمقدم 1.8 مليون وأقساط تصل إلى 10 سنوات. موقع فريد بدقائق من التسعين الجنوبي ومطار القاهرة.',
    image: 'https://images.unsplash.com/photo-1512917774080-9ac466fb0635?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9ac466fb0635?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    ],
    featured: true,
    createdAt: '2024-03-15',
    adminId: 'u5',
    adCode: 'GS-014',
    paymentOptions: [
      { type: 'cash' },
      { type: 'installment', downPayment: 1800000, installmentMonths: 120, monthlyPayment: 135000 }
    ]
  },
  {
    id: 'p15',
    title: 'Fifth Settlement 3BR Apartments',
    titleAr: 'شقق 3 غرف التجمع الخامس',
    type: 'apartment',
    status: 'for-sale',
    price: 12000000,
    area: 150,
    bedrooms: 3,
    bathrooms: 2,
    floor: 4,
    location: 'التجمع الخامس، القاهرة',
    address: 'قلب التجمع الخامس - موقع راقي وآمن',
    description: 'شقق وفيلات استلام فوري في التجمع الخامس',
    descriptionAr: 'شقق وفيلات استلام فوري في قلب التجمع الخامس. مقدم 1.2 مليون لشقق الـ 3 غرف بمتوسط أسعار 12 مليون جنيه وتقسيط بيصل لـ 10 سنين.',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: ['https://images.unsplash.com/photo-1492684223066-81342ee5ff30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'],
    featured: true,
    createdAt: '2024-03-16',
    adminId: 'u1',
    adCode: 'GS-015',
    paymentOptions: [
      { type: 'cash' },
      { type: 'installment', downPayment: 1200000, installmentMonths: 120, monthlyPayment: 90000 }
    ]
  },
  {
    id: 'p16',
    title: 'Fifth Settlement Premium Villas',
    titleAr: 'فيلات فاخرة التجمع الخامس',
    type: 'villa',
    status: 'for-sale',
    price: 20000000,
    area: 250,
    bedrooms: 4,
    bathrooms: 3,
    floor: 1,
    location: 'التجمع الخامس، القاهرة',
    address: 'التجمع الخامس - موقع استراتيجي متميز',
    description: 'فيلات فاخرة مع خدمات عالية المستوى',
    descriptionAr: 'المشروع يضم فيلات بمقدم 2 مليون جنيه ومتوسط أسعار 20 مليون جنيه. في لوكيشن مميز دقائق من التسعين الجنوبي ومطار القاهرة.',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'],
    featured: true,
    createdAt: '2024-03-17',
    adminId: 'u5',
    adCode: 'GS-016',
    paymentOptions: [
      { type: 'cash' },
      { type: 'installment', downPayment: 2000000, installmentMonths: 120, monthlyPayment: 150000 }
    ]
  },
  {
    id: 'p17',
    title: 'Fifth Settlement Master 3BR',
    titleAr: 'شقة 3 غرف ماستر التجمع الخامس',
    type: 'apartment',
    status: 'for-sale',
    price: 13500000,
    area: 160,
    bedrooms: 3,
    bathrooms: 2,
    floor: 5,
    location: 'التجمع الخامس، القاهرة',
    address: 'قلب التجمع الخامس - فيو مفتوح وفخامة',
    description: 'شقة 3 غرف ماستر في موقع لا يتكرر',
    descriptionAr: 'شقة 3 غرف ماستر في قلب التجمع الخامس. فرصة سكن واستثمار في موقع لا يتكرر دقائق من التسعين الجنوبي وخطوات من النادي الأهلي. مقدم يبدأ من 1.8 مليون وتقسيط مريح على 5 سنوات.',
    image: 'https://images.unsplash.com/photo-1493857671505-72967e2e2760?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: ['https://images.unsplash.com/photo-1493857671505-72967e2e2760?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'],
    featured: true,
    createdAt: '2024-03-18',
    adminId: 'u1',
    adCode: 'GS-017',
    paymentOptions: [
      { type: 'cash' },
      { type: 'installment', downPayment: 1800000, installmentMonths: 60, monthlyPayment: 195000 }
    ]
  },
  {
    id: 'p18',
    title: 'Golden Square Premium Property',
    titleAr: 'عقار فاخر في الجولدن سكوير',
    type: 'apartment',
    status: 'for-sale',
    price: 15000000,
    area: 170,
    bedrooms: 3,
    bathrooms: 2,
    floor: 6,
    location: 'الجولدن سكوير، القاهرة',
    address: 'قريب جداً من كل حاجة - الفيوزون وشارع النوادي',
    description: 'فرصة استثمارية متميزة في الجولدن سكوير',
    descriptionAr: 'فرصة مش هتتعوض في لوكيشن في قلب الجولدن سكوير. قريب جداً من كل حاجة الفيوزون وشارع النوادي و600 متر للنادي الأهلي ومحور بن زايد الجنوبي.',
    image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: ['https://images.unsplash.com/photo-1554995207-c18c203602cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'],
    featured: true,
    createdAt: '2024-03-19',
    adminId: 'u5',
    adCode: 'GS-018',
    paymentOptions: [
      { type: 'cash' },
      { type: 'installment', downPayment: 3000000, installmentMonths: 120, monthlyPayment: 100000 }
    ]
  },
  {
    id: 'p19',
    title: 'Fifth Settlement Immediate Handover',
    titleAr: 'استلم فوراً التجمع الخامس',
    type: 'apartment',
    status: 'for-sale',
    price: 13000000,
    area: 155,
    bedrooms: 3,
    bathrooms: 2,
    floor: 2,
    location: 'التجمع الخامس، القاهرة',
    address: 'التجمع الخامس - استلم فوراً بمقدم 50%',
    description: 'شقة 3 غرف استلام فوري',
    descriptionAr: 'استلم فورا في قلب التجمع الخامس بمقدم 50% شقه 3 غرف. مفروشة ومجهزة بالكامل مع جميع الخدمات والمرافق الفاخرة.',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'],
    featured: false,
    createdAt: '2024-03-20',
    adminId: 'u1',
    adCode: 'GS-019',
    paymentOptions: [
      { type: 'cash' },
      { type: 'installment', downPayment: 6500000, installmentMonths: 60, monthlyPayment: 108333 }
    ]
  },
  {
    id: 'p20',
    title: 'R8 Villa Investment',
    titleAr: 'فيلا R8 فرصة استثمارية',
    type: 'villa',
    status: 'for-sale',
    price: 6000000,
    area: 180,
    bedrooms: 3,
    bathrooms: 2,
    floor: 1,
    location: 'R8 العاصمة الإدارية',
    address: 'R8 - مع أقوى مطور في العاصمة الإدارية',
    description: 'فيلتك بسعر شقة في قلب R8',
    descriptionAr: 'فيلتك بسعر شقة في قلب ال R8 بمقدم 10% وقسط شهري 60 ألف جنيه بخصم وسعر الطرح الأول مع أقوي مطور في العاصمة الإدارية.',
    image: 'https://images.unsplash.com/photo-1564399579883-451a5b44a0f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: ['https://images.unsplash.com/photo-1564399579883-451a5b44a0f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'],
    featured: true,
    createdAt: '2024-03-21',
    adminId: 'u5',
    adCode: 'GS-020',
    paymentOptions: [
      { type: 'cash' },
      { type: 'installment', downPayment: 600000, installmentMonths: 120, monthlyPayment: 60000 }
    ]
  },
  {
    id: 'p21',
    title: 'Sixth Settlement Prime Location',
    titleAr: 'التجمع السادس - أمام الكازار',
    type: 'apartment',
    status: 'for-sale',
    price: 3000000,
    area: 90,
    bedrooms: 1,
    bathrooms: 1,
    floor: 3,
    location: 'التجمع السادس، القاهرة',
    address: 'التجمع السادس أمام كمبوند الكازار',
    description: 'شقة غرفة واحدة في موقع فريد',
    descriptionAr: 'في التجمع السادس أمام كمبوند الكازار بسعر 3 مليون للشقة الغرفة الواحدة بمقدم 300 ألف. في أفضل لوكيشن بالقرب من الخدمات والمحاور الرئيسية.',
    image: 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: ['https://images.unsplash.com/photo-1480074568708-e7b720bb3f3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'],
    featured: false,
    createdAt: '2024-03-22',
    adminId: 'u1',
    adCode: 'GS-021',
    paymentOptions: [
      { type: 'cash' },
      { type: 'installment', downPayment: 300000, installmentMonths: 60, monthlyPayment: 45000 }
    ]
  },
  {
    id: 'p22',
    title: 'Sixth Settlement 2BR Apartment',
    titleAr: 'شقة 2 غرفة التجمع السادس',
    type: 'apartment',
    status: 'for-sale',
    price: 4500000,
    area: 120,
    bedrooms: 2,
    bathrooms: 1,
    floor: 4,
    location: 'التجمع السادس، القاهرة',
    address: 'التجمع السادس أمام الكازار - موقع متميز',
    description: 'شقة 2 غرفة في أفضل موقع بالتجمع السادس',
    descriptionAr: 'شقة غرفتين في التجمع السادس أمام كمبوند الكازار بسعر 4.5 مليون جنيه بمقدم 300 ألف. في أفضل لوكيشن في التجمع السادس 10 دقائق من الجامعة الأمريكية.',
    image: 'https://images.unsplash.com/photo-1565183938294-7563f3ff68ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: ['https://images.unsplash.com/photo-1565183938294-7563f3ff68ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800'],
    featured: false,
    createdAt: '2024-03-23',
    adminId: 'u5',
    adCode: 'GS-022',
    paymentOptions: [
      { type: 'cash' },
      { type: 'installment', downPayment: 300000, installmentMonths: 60, monthlyPayment: 70000 }
    ]
  },
];

export const USERS: User[] = [
  {
    id: 'u1',
    name: 'عمرو أحمد',
    email: 'admin@estate.com',
    phone: '+20 1281378331',
    role: 'super-admin',
    avatar: 'EA',
    createdAt: '2024-01-01',
    isSuperAdmin: true,
  },
  {
    id: 'u5',
    name: 'خالد محمود',
    email: 'khaled@estate.com',
    phone: '+20 1234567890',
    role: 'admin',
    avatar: 'KM',
    createdAt: '2024-01-05',
  },
  {
    id: 'u6',
    name: 'فاطمة حسن',
    email: 'fatma@estate.com',
    phone: '+20 1098765432',
    role: 'admin',
    avatar: 'FH',
    createdAt: '2024-01-08',
  },
  {
    id: 'u2',
    name: 'أحمد محمد',
    email: 'user@example.com',
    phone: '+20 1001234567',
    role: 'user',
    avatar: 'AM',
    createdAt: '2024-01-10',
  },
  {
    id: 'u3',
    name: 'سارة علي',
    email: 'sara@example.com',
    phone: '+20 1112345678',
    role: 'user',
    avatar: 'SA',
    createdAt: '2024-01-15',
  },
  {
    id: 'u4',
    name: 'محمد حسين',
    email: 'mhossein@example.com',
    phone: '+20 1223456789',
    role: 'user',
    avatar: 'MH',
    createdAt: '2024-02-01',
  },
];

export const REQUESTS: Request[] = [
  {
    id: 'r1',
    type: 'buy',
    userId: 'u2',
    userName: 'أحمد محمد',
    userEmail: 'user@example.com',
    userPhone: '+20 1001234567',
    propertyId: 'p1',
    propertyTitle: 'شقة فاخرة - سيدي جابر',
    message: 'أرغب في شراء هذه الشقة، أرجو التواصل معي',
    status: 'under-review',
    createdAt: '2024-03-01',
    updatedAt: '2024-03-02',
  },
  {
    id: 'r2',
    type: 'inquiry',
    userId: 'u3',
    userName: 'سارة علي',
    userEmail: 'sara@example.com',
    userPhone: '+20 1112345678',
    propertyId: 'p3',
    propertyTitle: 'شقة إطلالة بحر - ستانلي',
    message: 'هل الشقة متاحة للإيجار الصيفي؟ وما هي الشروط؟',
    status: 'pending',
    createdAt: '2024-03-05',
    updatedAt: '2024-03-05',
  },
  {
    id: 'r3',
    type: 'sell',
    userId: 'u4',
    userName: 'محمد حسين',
    userEmail: 'mhossein@example.com',
    userPhone: '+20 1223456789',
    message: 'لدي شقة 150 متر في الإبراهيمية للبيع، 3 غرف، الطابق الثاني، تشطيب ممتاز',
    status: 'approved',
    createdAt: '2024-02-20',
    updatedAt: '2024-02-25',
  },
  {
    id: 'r4',
    type: 'buy',
    userId: 'u2',
    userName: 'أحمد محمد',
    userEmail: 'user@example.com',
    userPhone: '+20 1001234567',
    propertyId: 'p4',
    propertyTitle: 'بنتهاوس فاخر - جليم',
    message: 'مهتم بالبنتهاوس، هل يمكن تقسيط الثمن؟',
    status: 'pending',
    createdAt: '2024-03-08',
    updatedAt: '2024-03-08',
  },
];

export const CONTACT_MESSAGES: ContactMessage[] = [
  {
    id: 'c1',
    name: 'كريم عبدالله',
    email: 'karim@example.com',
    phone: '+20 1001111111',
    subject: 'استفسار عن عقارات في الإبراهيمية',
    message: 'أريد معرفة المزيد عن الشقق المتاحة في منطقة الإبراهيمية',
    createdAt: '2024-03-10',
    read: false,
  },
  {
    id: 'c2',
    name: 'منى سليم',
    email: 'mona@example.com',
    phone: '+20 1122222222',
    subject: 'طلب تقييم عقار',
    message: 'أحتاج تقييم لشقتي قبل البيع، كيف يمكنني الحصول على ذلك؟',
    createdAt: '2024-03-09',
    read: true,
  },
];

export const STATS = {
  totalProperties: 127,
  soldProperties: 43,
  activeClients: 289,
  yearsExperience: 12,
};



export const formatPrice = (price: number, status: PropertyStatus): string => {
  if (status === 'for-rent') {
    return `${price.toLocaleString('ar-EG')} جنيه/شهر`;
  }
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} مليون جنيه`;
  }
  return `${price.toLocaleString('ar-EG')} جنيه`;
};

export const getStatusLabel = (status: PropertyStatus): string => {
  const labels = {
    'for-sale': 'للبيع',
    'for-rent': 'للإيجار',
    'sold': 'تم البيع',
    'rented': 'تم التأجير',
  };
  return labels[status];
};

export const getTypeLabel = (type: PropertyType): string => {
  const labels = {
    'apartment': 'شقة',
    'villa': 'فيلا',
    'duplex': 'دوبلكس',
    'office': 'مكتب',
    'chalet': 'شاليه',
  };
  return labels[type];
};

export const getRequestStatusLabel = (status: RequestStatus): string => {
  const labels = {
    'pending': 'قيد الانتظار',
    'under-review': 'تحت المراجعة',
    'approved': 'تمت الموافقة',
    'rejected': 'مرفوض',
    'completed': 'مكتمل',
  };
  return labels[status];
};

export const getRequestTypeLabel = (type: 'buy' | 'sell' | 'inquiry'): string => {
  const labels = {
    'buy': 'طلب شراء',
    'sell': 'طلب بيع',
    'inquiry': 'استعلام',
  };
  return labels[type];
};

export const TASKS: Task[] = [
  {
    id: 't1',
    title: 'مراجعة عقار في سيدي جابر',
    description: 'القيام بمراجعة شاملة للعقار AD-2024-001 والتأكد من جميع الأوراق',
    assignedTo: 'u5',
    assignedBy: 'u1',
    propertyId: 'p1',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2024-03-15',
    updatedAt: '2024-03-16',
    dueDate: '2024-03-20'
  },
  {
    id: 't2',
    title: 'تصوير فوتوغرافي للفيلا',
    description: 'ترتيب جلسة تصوير احترافية للفيلا في سموحة',
    assignedTo: 'u6',
    assignedBy: 'u1',
    propertyId: 'p2',
    status: 'pending',
    priority: 'medium',
    createdAt: '2024-03-16',
    updatedAt: '2024-03-16',
    dueDate: '2024-03-22'
  },
  {
    id: 't3',
    title: 'متابعة عملية البيع',
    description: 'التواصل مع العميل لإتمام إجراءات البيع للبنتهاوس',
    assignedTo: 'u5',
    assignedBy: 'u1',
    propertyId: 'p4',
    status: 'completed',
    priority: 'high',
    createdAt: '2024-03-10',
    updatedAt: '2024-03-14',
    dueDate: '2024-03-15'
  }
];

export function generateAdCode(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return `AD-${year}-${randomNum}`;
}

export function getSimilarProperties(currentProperty: Property, allProperties: Property[]): Property[] {
  return allProperties
    .filter(p =>
      p.id !== currentProperty.id &&
      (p.type === currentProperty.type ||
       Math.abs(p.price - currentProperty.price) / currentProperty.price < 0.3 ||
       p.location === currentProperty.location)
    )
    .slice(0, 4);
}
