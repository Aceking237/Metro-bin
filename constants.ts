
import { HotelPlan, Neighborhood, User, UserType } from './types';

export const HOTEL_PLANS: HotelPlan[] = [
  {
    id: 'plan1',
    label: '2 times a week - 5000XAF',
    details: 'Wednesdays and Saturdays, 6-7 AM',
    price: 5000,
  },
  {
    id: 'plan2',
    label: '3 times a week - 7000XAF',
    details: 'Tuesdays, Thursdays and Sundays, 8-9 PM',
    price: 7000,
  },
];

export const NEIGHBORHOODS: Neighborhood[] = [
    { id: 'n1', name: 'Mayor Street', days: 'Tuesday and Fridays', time: '8-9 PM' },
    { id: 'n2', name: 'Tarred Malingo Street', days: 'Wednesdays and Saturdays', time: '5-7 AM' },
    { id: 'n3', name: 'Clerks Quarters', days: 'Mondays and Thursdays', time: '6-7 PM' },
    { id: 'n4', name: 'Federal Quarters', days: 'Tuesdays and Fridays', time: '6-7 AM' },
];

// FIX: Explicitly type ALL_USERS as User[] to avoid overly strict type inference.
// This allows adding new User objects which have optional properties.
export const ALL_USERS: User[] = [
    { 
        id: 'user1', userType: UserType.HOTEL, name: 'Grand Hotel', tel: '123-456-7890', location: 'Downtown', plan: HOTEL_PLANS[1], collectionStatus: 'pending',
        paymentHistory: [
            { id: 'p1', date: '2026-01-15', amount: 7000, method: 'MTN MoMo', status: 'completed' },
            { id: 'p2', date: '2026-02-15', amount: 7000, method: 'MTN MoMo', status: 'completed' }
        ]
    },
    { 
        id: 'user2', userType: UserType.INDIVIDUAL, name: 'John Doe', tel: '987-654-3210', address: 'Mayor Street', plan: NEIGHBORHOODS[0], roomNumber: 'A-101', hostelCiteName: 'University Hostel', collectionStatus: 'pending',
        paymentHistory: [
            { id: 'p3', date: '2026-02-01', amount: 2000, method: 'Orange Money', status: 'completed' }
        ]
    },
    { 
        id: 'user3', userType: UserType.INDIVIDUAL, name: 'Jane Smith', tel: '555-555-5555', address: 'Tarred Malingo Street', plan: NEIGHBORHOODS[1], hostelCiteName: 'Cité des Palmiers', collectionStatus: 'pending',
        paymentHistory: [
            { id: 'p4', date: '2026-02-10', amount: 2000, method: 'MTN MoMo', status: 'completed' }
        ]
    },
    { 
        id: 'user4', userType: UserType.GUEST_HOUSE, name: 'Cozy Inn', tel: '111-222-3333', location: 'Uptown', plan: HOTEL_PLANS[0], collectionStatus: 'pending',
        paymentHistory: [
            { id: 'p5', date: '2026-01-20', amount: 5000, method: 'Orange Money', status: 'completed' }
        ]
    },
    { 
        id: 'user5', userType: UserType.INDIVIDUAL, name: 'Peter Jones', tel: '444-333-2222', address: 'Mayor Street', plan: NEIGHBORHOODS[0], hostelCiteName: 'University Hostel', collectionStatus: 'pending',
        paymentHistory: []
    },
];
