
export enum UserType {
  HOTEL = 'hotel',
  GUEST_HOUSE = 'guest-house',
  INDIVIDUAL = 'individual',
}

export enum IndividualType {
  HOSTEL = 'hostel',
  PRIVATE_HOME = 'private-home',
}

export interface HotelPlan {
  id: string;
  label: string;
  details: string;
  price: number;
}

export interface Neighborhood {
  id: string;
  name: string;
  days: string;
  time: string;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface MissedCollectionReport {
  id: string;
  userId: string;
  userName: string;
  userTel: string;
  location: string;
  schedule: string;
  timestamp: string;
  status: 'pending' | 'resolved';
}

export interface User {
  id: string;
  userType: UserType;
  name: string;
  tel: string;
  location?: string; // For hotels/guest houses
  address?: string; // For individuals
  hostelCiteName?: string; // For individuals
  plan: HotelPlan | Neighborhood;
  roomNumber?: string;
  directions?: string;
  image?: File;
  collectionStatus?: 'pending' | 'completed';
  lastCollectionDate?: string;
  latitude?: number;
  longitude?: number;
  paymentHistory?: Payment[];
}
