export interface Product {
  _id: string;
  name: string;
  price: number;
  totalQuantity: number;
  availableQuantity: number;
  description?: string;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  rentedQuantity?: number;
}

export interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  isActive: boolean;
  totalRentals: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface Rental {
  _id: string;
  product: Product;
  customer: Customer;
  quantity: number;
  startDate: string;
  endDate: string;
  dailyRate: number;
  totalAmount: number;
  status: 'active' | 'returned' | 'overdue';
  returnedDate?: string;
  actualDays?: number;
  finalAmount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductStats {
  total: number;
  available: number;
  rented: number;
  outOfStock: number;
}

export interface CustomerStats {
  total: number;
  active: number;
  topCustomers: {
    _id: string;
    name: string;
    totalSpent: number;
    totalRentals: number;
  }[];
}

export interface RentalStats {
  active: number;
  total: number;
  overdue: number;
  returned: number;
  totalRevenue: number;
}

export interface DailyReport {
  date: string;
  newRentals: number;
  returnedRentals: number;
  dailyRevenue: number;
  newRentalsList: Rental[];
  returnedRentalsList: Rental[];
}

export interface MonthlyReport {
  year: number;
  month: number;
  monthName: string;
  totalRentals: number;
  totalRevenue: number;
  dailyBreakdown: any[];
  topProducts: any[];
}

export interface RevenueChartData {
  _id: {
    year: number;
    month: number;
    day?: number;
  };
  revenue: number;
  count: number;
}

export interface BackupData {
  version: string;
  timestamp: string;
  data: {
    products: Product[];
    customers: Customer[];
    rentals: Rental[];
  };
}

export interface BackupInfo {
  totalRecords: number;
  breakdown: {
    products: number;
    customers: number;
    rentals: number;
  };
  lastBackup: string | null;
}