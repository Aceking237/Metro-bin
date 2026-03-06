import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  User as UserIcon, 
  Phone, 
  MapPin, 
  Home, 
  Building2, 
  Calendar, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Camera,
  Info,
  ArrowRight
} from 'lucide-react';
import Button from './components/Button';
import Modal from './components/Modal';
import { UserType, IndividualType, User, Neighborhood, Payment, MissedCollectionReport } from './types';
import { HOTEL_PLANS, NEIGHBORHOODS, ALL_USERS } from './constants';

// Helper components defined outside App to prevent re-rendering issues

const WelcomeScreen: React.FC<{ onGetStarted: () => void; onAdminLogin: () => void; }> = ({ onGetStarted, onAdminLogin }) => (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-blue-600 text-white text-center p-6 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl" />
            <div className="absolute top-1/2 -right-24 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-md rounded-3xl mb-8 border border-white/20 shadow-2xl animate-bounce">
                <img 
                    src="/assets/metrobin-logo.png" 
                    alt="MetroBin Logo" 
                    className="w-20 h-20 object-contain"
                    referrerPolicy="no-referrer"
                />
            </div>
            <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tighter leading-none">
                MetroBin
            </h1>
            <p className="text-xl md:text-2xl font-medium text-blue-100 mb-12 max-w-lg mx-auto leading-relaxed">
                The smarter way to manage your waste. Reliable, scheduled, and professional.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button 
                    onClick={onGetStarted}
                    className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-bold text-xl shadow-xl hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    Get Started <ArrowRight className="w-6 h-6" />
                </button>
                <button 
                    onClick={onAdminLogin}
                    className="px-10 py-5 bg-blue-700/50 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-xl hover:bg-blue-700/70 transition-all flex items-center justify-center gap-3"
                >
                    Trucker Login <Building2 className="w-6 h-6" />
                </button>
            </div>
        </div>
        
        <div className="absolute bottom-8 text-blue-200 text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Trusted by 10,000+ households
        </div>
    </div>
);

const RegistrationScreen: React.FC<{ onRegister: (type: UserType) => void }> = ({ onRegister }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl w-full">
            <div className="text-center mb-16">
                <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Join MetroBin</h2>
                <p className="text-xl text-slate-500 max-w-md mx-auto">Choose the account type that best fits your needs to get started.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {(Object.values(UserType)).map((type) => (
                    <div 
                        key={type} 
                        className="group bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 text-center hover:shadow-2xl hover:border-blue-200 transition-all duration-500 transform hover:-translate-y-2 flex flex-col"
                    >
                        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                            {type === UserType.INDIVIDUAL ? <UserIcon className="w-10 h-10" /> : 
                             type === UserType.HOTEL ? <Building2 className="w-10 h-10" /> : 
                             <Home className="w-10 h-10" />}
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4 capitalize">{type.replace('-', ' ')}</h3>
                        <p className="text-slate-500 mb-10 flex-grow">
                            {type === UserType.INDIVIDUAL ? 'Perfect for households and students living in hostels.' : 
                             type === UserType.HOTEL ? 'Comprehensive waste management for large hospitality businesses.' : 
                             'Tailored services for guest houses and smaller commercial properties.'}
                        </p>
                        <button 
                            onClick={() => onRegister(type)}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 group-hover:gap-3"
                        >
                            Register <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const InputGroup: React.FC<{ label: string; children: React.ReactNode; htmlFor?: string }> = ({ label, children, htmlFor }) => (
    <div>
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        {children}
    </div>
);

const RegistrationForm: React.FC<{ userType: UserType; onComplete: (user: Omit<User, 'id'>) => void; onCancel: () => void; }> = ({ userType, onComplete, onCancel }) => {
    const [step, setStep] = useState(1);
    // ... rest of state
    
    // Add logo to top of form
    const formHeader = (
        <div className="flex flex-col items-center mb-8">
            <img 
                src="/assets/metrobin-logo.png" 
                alt="MetroBin Logo" 
                className="h-12 mb-2 object-contain"
                referrerPolicy="no-referrer"
            />
            <h3 className="text-xl font-bold text-gray-900">Create your account</h3>
        </div>
    );
    const [name, setName] = useState('');
    const [tel, setTel] = useState('');
    const [location, setLocation] = useState(''); // For hotel/guest-house
    const [planId, setPlanId] = useState(HOTEL_PLANS[0].id); // For hotel/guest-house
    const [neighborhoodId, setNeighborhoodId] = useState(NEIGHBORHOODS[0].id); // For individual
    const [hostelCiteName, setHostelCiteName] = useState(''); // For individual
    const [individualType, setIndividualType] = useState<IndividualType>(IndividualType.PRIVATE_HOME);
    const [roomNumber, setRoomNumber] = useState('');
    const [directions, setDirections] = useState('');
    const [image, setImage] = useState<File | undefined>();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    const selectedNeighborhood = useMemo(() => NEIGHBORHOODS.find(n => n.id === neighborhoodId), [neighborhoodId]);

    const totalSteps = userType === UserType.INDIVIDUAL ? 4 : 1;

    const handleNext = () => {
        if (step < totalSteps) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (userType === UserType.INDIVIDUAL && step < totalSteps) {
            handleNext();
            return;
        }

        let user: Omit<User, 'id'>;
        if (userType === UserType.INDIVIDUAL) {
            const neighborhood = NEIGHBORHOODS.find(n => n.id === neighborhoodId)!;
            user = {
                userType, name, tel, address: neighborhood.name, plan: neighborhood, hostelCiteName,
                collectionStatus: 'pending',
                latitude: coords?.lat,
                longitude: coords?.lng,
                ...(individualType === IndividualType.HOSTEL && { roomNumber }),
                ...(individualType === IndividualType.PRIVATE_HOME && { directions, image })
            };
        } else {
            const plan = HOTEL_PLANS.find(p => p.id === planId)!;
            user = { userType, name, tel, location, plan };
        }
        onComplete(user);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    const handleGetLocation = () => {
        setIsLocating(true);
        setLocationError(null);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoords({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setIsLocating(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setLocationError("Could not access your location. Please check your browser permissions.");
                    setIsLocating(false);
                },
                { enableHighAccuracy: true }
            );
        } else {
            setLocationError("Geolocation is not supported by your browser.");
            setIsLocating(false);
        }
    };

    const renderIndividualStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-800 leading-relaxed">
                                Please provide your contact details so we can reach you for collection updates.
                            </p>
                        </div>
                        <InputGroup label="Full Name" htmlFor="name">
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input 
                                    type="text" 
                                    id="name" 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    required 
                                    placeholder="Enter your full name"
                                    className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                                />
                            </div>
                        </InputGroup>
                        <InputGroup label="Telephone Number" htmlFor="tel">
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input 
                                    type="tel" 
                                    id="tel" 
                                    value={tel} 
                                    onChange={e => setTel(e.target.value)} 
                                    required 
                                    placeholder="e.g. 670 000 000"
                                    className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                                />
                            </div>
                        </InputGroup>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">Select Your Neighborhood</label>
                            <div className="grid grid-cols-1 gap-3">
                                {NEIGHBORHOODS.map(n => (
                                    <button
                                        key={n.id}
                                        type="button"
                                        onClick={() => setNeighborhoodId(n.id)}
                                        className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${
                                            neighborhoodId === n.id 
                                            ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-sm' 
                                            : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${neighborhoodId === n.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className={`font-semibold ${neighborhoodId === n.id ? 'text-blue-900' : 'text-gray-900'}`}>{n.name}</p>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {n.days}</span>
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {n.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {neighborhoodId === n.id && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">Where do you live?</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIndividualType(IndividualType.PRIVATE_HOME)}
                                    className={`p-6 border rounded-2xl text-center transition-all flex flex-col items-center gap-3 ${
                                        individualType === IndividualType.PRIVATE_HOME 
                                        ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500 shadow-md' 
                                        : 'bg-white border-gray-200 hover:shadow-lg'
                                    }`}
                                >
                                    <div className={`p-3 rounded-full ${individualType === IndividualType.PRIVATE_HOME ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        <Home className="w-6 h-6" />
                                    </div>
                                    <span className="font-bold">Private Home</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIndividualType(IndividualType.HOSTEL)}
                                    className={`p-6 border rounded-2xl text-center transition-all flex flex-col items-center gap-3 ${
                                        individualType === IndividualType.HOSTEL 
                                        ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500 shadow-md' 
                                        : 'bg-white border-gray-200 hover:shadow-lg'
                                    }`}
                                >
                                    <div className={`p-3 rounded-full ${individualType === IndividualType.HOSTEL ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <span className="font-bold">Hostel / Cité</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <InputGroup label="Hostel / Cité Name" htmlFor="hostelCiteName">
                                <input 
                                    type="text" 
                                    id="hostelCiteName" 
                                    value={hostelCiteName} 
                                    onChange={e => setHostelCiteName(e.target.value)} 
                                    required 
                                    placeholder="Enter building name"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                                />
                            </InputGroup>

                            {individualType === IndividualType.HOSTEL ? (
                                <InputGroup label="Room Number" htmlFor="roomNumber">
                                   <input 
                                        type="text" 
                                        id="roomNumber" 
                                        placeholder="e.g. A-101" 
                                        value={roomNumber} 
                                        onChange={e => setRoomNumber(e.target.value)} 
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                                        required 
                                    />
                                </InputGroup>
                            ) : (
                                <>
                                    <div className="space-y-4 pt-2">
                                        <label className="block text-sm font-medium text-gray-700">Pin Your Exact Location</label>
                                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                                            {!coords ? (
                                                <div className="text-center py-4">
                                                    <p className="text-sm text-slate-500 mb-4">Help our truckers find you faster by pinning your exact GPS coordinates.</p>
                                                    <button
                                                        type="button"
                                                        onClick={handleGetLocation}
                                                        disabled={isLocating}
                                                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                                                    >
                                                        {isLocating ? (
                                                            <>
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                Locating...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <MapPin className="w-5 h-5" /> Pin My Location
                                                            </>
                                                        )}
                                                    </button>
                                                    {locationError && <p className="text-xs text-red-500 mt-2">{locationError}</p>}
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                                                            <CheckCircle2 className="w-4 h-4" /> Location Pinned
                                                        </div>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setCoords(null)}
                                                            className="text-xs text-blue-600 hover:underline"
                                                        >
                                                            Reset
                                                        </button>
                                                    </div>
                                                    <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative">
                                                        <iframe
                                                            width="100%"
                                                            height="100%"
                                                            frameBorder="0"
                                                            style={{ border: 0 }}
                                                            src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`}
                                                            allowFullScreen
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 text-center">
                                                        Lat: {coords.lat.toFixed(6)}, Lng: {coords.lng.toFixed(6)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <InputGroup label="Directions (Optional)" htmlFor="directions">
                                        <textarea 
                                            id="directions" 
                                            value={directions} 
                                            onChange={e => setDirections(e.target.value)} 
                                            placeholder="Describe how to find your house..."
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[100px]" 
                                        />
                                    </InputGroup>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Front Yard Photo (Optional)</label>
                                        <div className="flex items-center justify-center w-full">
                                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all overflow-hidden relative">
                                                {imagePreview ? (
                                                    <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <Camera className="w-8 h-8 text-gray-400 mb-2" />
                                                        <p className="text-xs text-gray-500">Click to upload or drag and drop</p>
                                                    </div>
                                                )}
                                                <input type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
                                            </label>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center mb-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Review Your Details</h3>
                            <p className="text-gray-500">Please confirm your information is correct.</p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-2xl p-6 space-y-4 border border-gray-100">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-400 font-medium uppercase tracking-wider text-[10px]">Full Name</p>
                                    <p className="text-gray-900 font-bold">{name || 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 font-medium uppercase tracking-wider text-[10px]">Telephone</p>
                                    <p className="text-gray-900 font-bold">{tel || 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 font-medium uppercase tracking-wider text-[10px]">Neighborhood</p>
                                    <p className="text-gray-900 font-bold">{selectedNeighborhood?.name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 font-medium uppercase tracking-wider text-[10px]">Residence Type</p>
                                    <p className="text-gray-900 font-bold capitalize">{individualType.replace('-', ' ')}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 font-medium uppercase tracking-wider text-[10px]">Exact Location</p>
                                    <p className={`text-sm font-bold ${coords ? 'text-green-600' : 'text-gray-400'}`}>
                                        {coords ? 'Pinned (GPS Coords)' : 'Not Pinned'}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-gray-400 font-medium uppercase tracking-wider text-[10px]">Building / Cité</p>
                                    <p className="text-gray-900 font-bold">{hostelCiteName || 'Not provided'}</p>
                                </div>
                                {individualType === IndividualType.HOSTEL && (
                                    <div>
                                        <p className="text-gray-400 font-medium uppercase tracking-wider text-[10px]">Room Number</p>
                                        <p className="text-gray-900 font-bold">{roomNumber || 'Not provided'}</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="pt-4 border-t border-gray-200">
                                <div className="flex items-center gap-3 bg-blue-600 text-white p-4 rounded-xl shadow-lg shadow-blue-100">
                                    <Calendar className="w-6 h-6" />
                                    <div>
                                        <p className="text-[10px] uppercase font-bold opacity-80">Collection Schedule</p>
                                        <p className="font-bold">{selectedNeighborhood?.days} at {selectedNeighborhood?.time}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {formHeader}
            {userType === UserType.INDIVIDUAL && (
                <div className="flex items-center justify-between mb-8 px-2">
                    {[1, 2, 3, 4].map((s) => (
                        <React.Fragment key={s}>
                            <div className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                                    step >= s ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400'
                                }`}>
                                    {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
                                </div>
                                <span className={`text-[10px] uppercase tracking-wider font-bold ${step >= s ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {s === 1 ? 'Identity' : s === 2 ? 'Location' : s === 3 ? 'Details' : 'Review'}
                                </span>
                            </div>
                            {s < 4 && (
                                <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-500 ${step > s ? 'bg-blue-600' : 'bg-gray-100'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            )}

            {userType !== UserType.INDIVIDUAL ? (
                <div className="space-y-4">
                    <InputGroup label={`${userType.replace('-', ' ')}'s Name`} htmlFor="name">
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                    </InputGroup>
                    <InputGroup label="Telephone" htmlFor="tel">
                        <input type="tel" id="tel" value={tel} onChange={e => setTel(e.target.value)} required className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                    </InputGroup>
                    <InputGroup label="Location" htmlFor="location">
                        <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)} required className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
                    </InputGroup>
                    <InputGroup label="Select Plan" htmlFor="plan">
                        <select id="plan" value={planId} onChange={e => setPlanId(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500">
                            {HOTEL_PLANS.map(plan => <option key={plan.id} value={plan.id}>{plan.label} ({plan.details})</option>)}
                        </select>
                    </InputGroup>
                </div>
            ) : (
                renderIndividualStep()
            )}
            
            <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                {step > 1 ? (
                    <button 
                        type="button" 
                        onClick={handleBack}
                        className="flex items-center gap-2 px-6 py-3 text-gray-600 font-semibold hover:text-blue-600 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" /> Back
                    </button>
                ) : (
                    <button 
                        type="button" 
                        onClick={onCancel}
                        className="flex items-center gap-2 px-6 py-3 text-gray-600 font-semibold hover:text-blue-600 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" /> Back to Selection
                    </button>
                )}
                
                <div className="flex gap-3">
                    {userType !== UserType.INDIVIDUAL && (
                        <Button type="button" variant="secondary" onClick={() => alert('Calling support...')}>
                            Place a Call
                        </Button>
                    )}
                    <Button type="submit" className="group">
                        {userType === UserType.INDIVIDUAL ? (
                            step === totalSteps ? (
                                <span className="flex items-center gap-2">Finish Registration <CheckCircle2 className="w-5 h-5" /></span>
                            ) : (
                                <span className="flex items-center gap-2">Continue <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                            )
                        ) : (
                            'Make Payment'
                        )}
                    </Button>
                </div>
            </div>
        </form>
    );
};

const PaymentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  user: User;
  paymentMethod: string;
  onPaymentSuccess: (method: string) => void;
}> = ({ isOpen, onClose, user, paymentMethod, onPaymentSuccess }) => {
  type PaymentStatus = 'idle' | 'processing' | 'success' | 'error';
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [paymentNumber, setPaymentNumber] = useState('');

  const handleProceedToPay = () => {
    setPaymentStatus('processing');
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3; // 70% chance of success
      setPaymentStatus(isSuccess ? 'success' : 'error');
    }, 2000);
  };

  const handleTryAgain = () => {
    setPaymentNumber('');
    setPaymentStatus('idle');
  };
  
  const handleCloseAndReset = () => {
      handleTryAgain();
      onClose();
  }

  const renderContent = () => {
    switch(paymentStatus) {
      case 'processing':
        return (
          <div className="flex justify-center items-center flex-col py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-800">Processing payment...</p>
          </div>
        );
      case 'success':
        return (
          <div className="text-center py-8">
            <h3 className="text-2xl font-bold text-green-600 mb-4">Payment done successfully!</h3>
            <Button onClick={() => onPaymentSuccess(paymentMethod)}>Go to Dashboard</Button>
          </div>
        );
      case 'error':
        return (
          <div className="text-center py-8">
            <h3 className="text-2xl font-bold text-red-600 mb-4">Payment unsuccessful.</h3>
            <p className="text-gray-800 mb-6">Something went wrong. Please check the number and try again.</p>
            <Button onClick={handleTryAgain}>Try Again</Button>
          </div>
        );
      case 'idle':
      default:
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-1">
                <p className="text-black"><strong className="font-semibold">Confirming for:</strong> {user.name}</p>
                <p className="text-black"><strong className="font-semibold">Registered Tel:</strong> {user.tel}</p>
            </div>
            <InputGroup label={`Input ${paymentMethod} number`} htmlFor="paymentNumber">
              <input
                type="tel"
                id="paymentNumber"
                value={paymentNumber}
                onChange={(e) => setPaymentNumber(e.target.value)}
                required
                className="w-full p-3 border rounded-md"
                placeholder="e.g., 670000000"
              />
            </InputGroup>
            <div className="flex justify-between items-center pt-2">
              <button 
                onClick={onClose}
                className="text-slate-500 font-bold hover:text-blue-600 transition-colors"
              >
                Back
              </button>
              <Button onClick={handleProceedToPay} disabled={!paymentNumber}>Proceed to Pay</Button>
            </div>
          </div>
        );
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCloseAndReset} title={`Pay with ${paymentMethod}`}>
      {renderContent()}
    </Modal>
  );
};


const PaymentScreen: React.FC<{ user: User; onPaid: (method: string) => void; onBack: () => void; }> = ({ user, onPaid, onBack }) => {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

    const handlePaymentClick = (method: string) => {
        setSelectedPaymentMethod(method);
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSuccess = (method: string) => {
        setIsPaymentModalOpen(false);
        onPaid(method);
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center border border-slate-100">
                    <img 
                        src="/assets/metrobin-logo.png" 
                        alt="MetroBin Logo" 
                        className="h-16 mx-auto mb-6 object-contain"
                        referrerPolicy="no-referrer"
                    />
                    <h2 className="text-3xl font-black text-slate-900 mb-2">Registration Saved</h2>
                    <p className="text-slate-500 mb-8">Choose your preferred payment method to activate your service.</p>
                    
                    <div className="space-y-4 mb-8">
                        <button 
                            onClick={() => handlePaymentClick('MTN')}
                            className="w-full py-4 bg-yellow-400 text-yellow-950 rounded-2xl font-bold hover:bg-yellow-500 transition-all flex items-center justify-center gap-3 shadow-lg shadow-yellow-100"
                        >
                            Pay with MTN MoMo
                        </button>
                        <button 
                            onClick={() => handlePaymentClick('Orange')}
                            className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-orange-100"
                        >
                            Pay with Orange Money
                        </button>
                    </div>

                    <button 
                        onClick={onBack}
                        className="flex items-center justify-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition-colors w-full py-2"
                    >
                        <ChevronLeft className="w-5 h-5" /> Back to Registration
                    </button>
                </div>
            </div>
            {user && (
                 <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    user={user}
                    paymentMethod={selectedPaymentMethod}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            )}
        </>
    );
};

const UserDashboard: React.FC<{ user: User; onReportMissed: () => void }> = ({ user, onReportMissed }) => {
    const schedule = 'details' in user.plan ? user.plan.details : `${(user.plan as Neighborhood).days} | ${(user.plan as Neighborhood).time}`;
    return (
         <div className="p-4 md:p-8 bg-gray-50 min-h-screen overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Welcome, {user.name}!</h2>
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h3 className="text-xl font-semibold text-blue-700 mb-4">Your Collection Timetable</h3>
                    <div className="bg-blue-50 p-4 rounded-md text-center">
                        <p className="text-lg text-blue-800 font-medium">{schedule}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Button onClick={() => alert('Functionality to renew plan.')}>Renew Plan</Button>
                    <Button variant="secondary" onClick={onReportMissed}>Report Missed Collection</Button>
                    <Button variant="secondary" onClick={() => alert('Functionality to change address.')}>Change of Address</Button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Payment History</h3>
                    {user.paymentHistory && user.paymentHistory.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {user.paymentHistory.map((payment) => (
                                        <tr key={payment.id}>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{payment.date}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{payment.amount} XAF</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{payment.method}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                    payment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No payment records found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const AdminDashboard: React.FC<{ 
    users: User[]; 
    onUpdateUser: (userId: string, updates: Partial<User>) => void;
    reports: MissedCollectionReport[];
    onResolveReport: (reportId: string) => void;
}> = ({ users, onUpdateUser, reports, onResolveReport }) => {
    const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all');
    const [selectedUserType, setSelectedUserType] = useState<UserType | 'all'>('all');
    const [activeTab, setActiveTab] = useState<'subscribers' | 'reports'>('subscribers');
    const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });

    const sortedSubscribers = useMemo(() => {
        let subscribers = [...users];

        if (selectedUserType !== 'all') {
            subscribers = subscribers.filter(s => s.userType === selectedUserType);
        }

        if (selectedNeighborhood !== 'all') {
            subscribers = subscribers.filter(s => s.address === selectedNeighborhood);
        }

        if (sortConfig !== null) {
            subscribers.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                
                if (aValue === undefined || aValue === null) return 1;
                if (bValue === undefined || bValue === null) return -1;

                const stringA = String(aValue).toLowerCase();
                const stringB = String(bValue).toLowerCase();

                if (stringA < stringB) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (stringA > stringB) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return subscribers;
    }, [users, selectedNeighborhood, selectedUserType, sortConfig]);

    const requestSort = (key: keyof User) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: keyof User) => {
        if (!sortConfig || sortConfig.key !== key) return <span className="text-gray-400"> ◇</span>;
        return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    };

    const handleToggleCollection = (userId: string, currentStatus?: string) => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
        onUpdateUser(userId, { 
            collectionStatus: newStatus,
            lastCollectionDate: newStatus === 'completed' ? new Date().toLocaleDateString() : undefined
        });
    };

    const handleDoneCollecting = () => {
        if (selectedNeighborhood === 'all') {
            alert('Please select a specific neighborhood to send notifications.');
            return;
        }

        // Mark all filtered users as completed
        sortedSubscribers.forEach(user => {
            if (user.collectionStatus !== 'completed') {
                onUpdateUser(user.id, { 
                    collectionStatus: 'completed',
                    lastCollectionDate: new Date().toLocaleDateString()
                });
            }
        });

        alert(`Push notification sent to all subscribers in ${selectedNeighborhood}! All filtered collections marked as complete.`);
    };

    const SortableTh: React.FC<{ sortKey: keyof User; children: React.ReactNode }> = ({ sortKey, children }) => {
        const isActive = sortConfig?.key === sortKey;
        return (
            <th
                onClick={() => requestSort(sortKey)}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer transition-colors ${isActive ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
            >
                <div className="flex items-center">
                    {children}
                    <span className="ml-1 w-4">{getSortIndicator(sortKey)}</span>
                </div>
            </th>
        );
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Trucker Dashboard</h2>

                <div className="flex space-x-4 mb-6">
                    <button 
                        onClick={() => setActiveTab('subscribers')}
                        className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'subscribers' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        Subscribers
                    </button>
                    <button 
                        onClick={() => setActiveTab('reports')}
                        className={`px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2 ${activeTab === 'reports' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        Missed Collections
                        {reports.filter(r => r.status === 'pending').length > 0 && (
                            <span className="bg-white text-red-600 text-[10px] px-1.5 py-0.5 rounded-full">
                                {reports.filter(r => r.status === 'pending').length}
                            </span>
                        )}
                    </button>
                </div>

                {activeTab === 'subscribers' ? (
                    <>
                        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <InputGroup label="Filter by Neighborhood:" htmlFor="neighborhood-select">
                            <select
                                id="neighborhood-select"
                                value={selectedNeighborhood}
                                onChange={(e) => setSelectedNeighborhood(e.target.value)}
                                className="w-full p-3 border rounded-md bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Neighborhoods</option>
                                {NEIGHBORHOODS.map(n => <option key={n.id} value={n.name}>{n.name}</option>)}
                            </select>
                        </InputGroup>
                        <InputGroup label="Filter by User Type:" htmlFor="usertype-select">
                            <select
                                id="usertype-select"
                                value={selectedUserType}
                                onChange={(e) => setSelectedUserType(e.target.value as UserType | 'all')}
                                className="w-full p-3 border rounded-md bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Types</option>
                                {Object.values(UserType).map(type => (
                                    <option key={type} value={type} className="capitalize">{type.replace('-', ' ')}</option>
                                ))}
                            </select>
                        </InputGroup>
                        <Button 
                            onClick={handleDoneCollecting} 
                            disabled={selectedNeighborhood === 'all'}
                            className="disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            Done Collecting
                        </Button>
                    </div>
                </div>
                
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Active Subscribers <span className="text-base font-normal text-gray-600">({sortedSubscribers.length} found)</span></h3>
                <div className="bg-white rounded-lg shadow-md overflow-auto max-h-[600px] custom-scrollbar">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <SortableTh sortKey="name">Name</SortableTh>
                                <SortableTh sortKey="userType">User Type</SortableTh>
                                <SortableTh sortKey="roomNumber">Room No.</SortableTh>
                                <SortableTh sortKey="tel">Tel</SortableTh>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location / Address</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Details</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                           {sortedSubscribers.length > 0 ? sortedSubscribers.map(user => (
                                <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${user.collectionStatus === 'completed' ? 'bg-green-50/30' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 capitalize">{user.userType.replace('-', ' ')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{user.roomNumber || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{user.tel}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                        <div className="flex flex-col">
                                            <span>{user.location || `${user.address}${user.hostelCiteName ? ` (${user.hostelCiteName})` : ''}`}</span>
                                            {user.latitude && user.longitude && (
                                                <a 
                                                    href={`https://www.google.com/maps/search/?api=1&query=${user.latitude},${user.longitude}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 mt-1"
                                                >
                                                    <MapPin className="w-3 h-3" /> View on Map
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{'details' in user.plan ? user.plan.details : `${user.plan.days} at ${user.plan.time}`}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {user.collectionStatus === 'completed' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <CheckCircle2 className="w-3 h-3" /> Collected
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                <Clock className="w-3 h-3" /> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleToggleCollection(user.id, user.collectionStatus)}
                                            className={`px-4 py-2 rounded-lg font-bold transition-all ${
                                                user.collectionStatus === 'completed'
                                                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-100'
                                            }`}
                                        >
                                            {user.collectionStatus === 'completed' ? 'Undo' : 'Mark Collected'}
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-700">No subscribers match the current filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </>
        ) : (
                    <div className="space-y-4">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Missed Collection Reports</h3>
                        {reports.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {reports.map(report => (
                                    <div key={report.id} className={`bg-white p-6 rounded-xl shadow-md border-l-4 ${report.status === 'pending' ? 'border-red-500' : 'border-green-500'}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-bold text-lg text-gray-900">{report.userName}</h4>
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${report.status === 'pending' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                        {report.status}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {report.userTel}</div>
                                                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {report.location}</div>
                                                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {report.schedule}</div>
                                                    <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Reported: {report.timestamp}</div>
                                                </div>
                                            </div>
                                            {report.status === 'pending' && (
                                                <button 
                                                    onClick={() => onResolveReport(report.id)}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                                                >
                                                    Resolve
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-12 rounded-xl shadow-md text-center">
                                <p className="text-gray-500">No missed collection reports found.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};


const App: React.FC = () => {
    type Screen = 'welcome' | 'registration' | 'payment' | 'userDashboard' | 'adminDashboard';
    const [screen, setScreen] = useState<Screen>('welcome');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [registeringType, setRegisteringType] = useState<UserType | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');
    const [adminError, setAdminError] = useState('');
    const [allUsers, setAllUsers] = useState<User[]>(ALL_USERS);
    const [reports, setReports] = useState<MissedCollectionReport[]>([]);

    const handleGetStarted = () => setScreen('registration');
    
    const handleAdminLoginClick = () => {
        setIsAdminLoginOpen(true);
    };

    const handleAdminLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would be a server-side check
        if (adminPassword === 'metroadmin2026') {
            setAdminPassword('');
            setAdminError('');
            setIsAdminLoginOpen(false);
            setCurrentUser(null);
            setScreen('adminDashboard');
        } else {
            setAdminError('Invalid admin password. Please try again.');
        }
    };

    const handleRegister = (type: UserType) => {
        setRegisteringType(type);
        setIsModalOpen(true);
    };

    const handleRegistrationComplete = (user: Omit<User, 'id'>) => {
        const newUser: User = { ...user, id: `user-${Date.now()}`, collectionStatus: 'pending' };
        setCurrentUser(newUser);
        setAllUsers(prev => [...prev, newUser]);
        setIsModalOpen(false);
        setRegisteringType(null);
        setScreen('payment');
    };

    const handleUpdateUser = (userId: string, updates: Partial<User>) => {
        setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
        if (currentUser && currentUser.id === userId) {
            setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
        }
    };

    const handlePaid = (method: string) => {
        if (currentUser) {
            const amount = 'price' in currentUser.plan ? currentUser.plan.price : 2000; // Default price for individuals if not specified
            const newPayment = {
                id: `pay-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                amount,
                method,
                status: 'completed' as const
            };
            
            const updatedHistory = [...(currentUser.paymentHistory || []), newPayment];
            handleUpdateUser(currentUser.id, { paymentHistory: updatedHistory });
        }
        setScreen('userDashboard');
    };

    const handleReportMissedCollection = () => {
        if (!currentUser) return;
        
        const location = currentUser.location || `${currentUser.address}${currentUser.hostelCiteName ? ` (${currentUser.hostelCiteName})` : ''}`;
        const schedule = 'details' in currentUser.plan ? currentUser.plan.details : `${(currentUser.plan as Neighborhood).days} | ${(currentUser.plan as Neighborhood).time}`;
        
        const newReport: MissedCollectionReport = {
            id: `report-${Date.now()}`,
            userId: currentUser.id,
            userName: currentUser.name,
            userTel: currentUser.tel,
            location,
            schedule,
            timestamp: new Date().toLocaleString(),
            status: 'pending'
        };
        
        setReports(prev => [newReport, ...prev]);
        alert('Report Sent! Our team has been notified and will make up for the missed collection.');
    };

    const handleResolveReport = (reportId: string) => {
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'resolved' } : r));
    };
    
    const renderScreen = () => {
        switch (screen) {
            case 'welcome':
                return <WelcomeScreen onGetStarted={handleGetStarted} onAdminLogin={handleAdminLoginClick} />;
            case 'registration':
                return <RegistrationScreen onRegister={handleRegister} />;
            case 'payment':
                return currentUser ? (
                    <PaymentScreen 
                        user={currentUser} 
                        onPaid={handlePaid} 
                        onBack={() => setScreen('registration')} 
                    />
                ) : (
                    <WelcomeScreen onGetStarted={handleGetStarted} onAdminLogin={handleAdminLoginClick} />
                );
            case 'userDashboard':
                 return currentUser ? <UserDashboard user={currentUser} onReportMissed={handleReportMissedCollection} /> : <WelcomeScreen onGetStarted={handleGetStarted} onAdminLogin={handleAdminLoginClick} />;
            case 'adminDashboard':
                return <AdminDashboard users={allUsers} onUpdateUser={handleUpdateUser} reports={reports} onResolveReport={handleResolveReport} />;
            default:
                return <WelcomeScreen onGetStarted={handleGetStarted} onAdminLogin={handleAdminLoginClick} />;
        }
    };
    
    const isDashboard = screen === 'userDashboard' || screen === 'adminDashboard';
    
    const handleLogoClick = () => {
        setCurrentUser(null);
        setScreen('welcome');
    };

    return (
        <div>
            {isDashboard && (
                <nav className="bg-white shadow-md">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="flex justify-between items-center h-16">
                             <div className="flex items-center space-x-2 text-blue-600 cursor-pointer" onClick={handleLogoClick}>
                                <img 
                                    src="/assets/metrobin-logo.png" 
                                    alt="MetroBin Logo" 
                                    className="h-[36px] object-contain"
                                    referrerPolicy="no-referrer"
                                />
                                <span className="font-bold text-xl">MetroBin</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                {currentUser && screen === 'userDashboard' ? (
                                    <>
                                        <span className="px-3 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-700">My Dashboard</span>
                                        <button onClick={handleLogoClick} className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Logout</button>
                                    </>
                                ) : screen === 'adminDashboard' ? (
                                    <>
                                       <span className="px-3 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-700">Trucker View</span>
                                       <button onClick={() => setScreen('welcome')} className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Exit View</button>
                                    </>
                                ) : null }
                            </div>
                        </div>
                    </div>
                </nav>
            )}
            {renderScreen()}
            
            <footer className="bg-white border-t border-gray-100 py-8 mt-auto">
                <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <img 
                            src="/assets/metrobin-logo.png" 
                            alt="MetroBin Logo" 
                            className="h-8 object-contain"
                            referrerPolicy="no-referrer"
                        />
                        <span className="font-bold text-gray-900">MetroBin</span>
                    </div>
                    <div className="text-gray-500 text-sm">
                        © 2026 MetroBin Waste Management. All rights reserved.
                    </div>
                    <div className="flex gap-6 text-sm font-medium text-gray-600">
                        <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Contact Us</a>
                    </div>
                </div>
            </footer>

            {registeringType && (
                <Modal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    title={`Register as ${registeringType.replace('-', ' ')}`}
                >
                    <RegistrationForm 
                        userType={registeringType} 
                        onComplete={handleRegistrationComplete} 
                        onCancel={() => {
                            setIsModalOpen(false);
                            setRegisteringType(null);
                        }}
                    />
                </Modal>
            )}

            <Modal
                isOpen={isAdminLoginOpen}
                onClose={() => {
                    setIsAdminLoginOpen(false);
                    setAdminPassword('');
                    setAdminError('');
                }}
                title="Trucker Admin Login"
            >
                <form onSubmit={handleAdminLoginSubmit} className="space-y-6">
                    <div className="flex flex-col items-center mb-6">
                        <img 
                            src="/assets/metrobin-logo.png" 
                            alt="MetroBin Logo" 
                            className="h-16 mb-2 object-contain"
                            referrerPolicy="no-referrer"
                        />
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Admin Portal</span>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                        <p className="text-sm text-blue-700">
                            Access to the Trucker Dashboard is restricted to authorized personnel only.
                        </p>
                    </div>
                    
                    <InputGroup label="Admin Access Password" htmlFor="admin-pass">
                        <input 
                            type="password" 
                            id="admin-pass"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Enter password"
                            required
                            autoFocus
                        />
                    </InputGroup>
                    
                    {adminError && (
                        <p className="text-sm text-red-500 font-medium">{adminError}</p>
                    )}
                    
                    <div className="flex flex-col gap-3">
                        <Button type="submit" className="w-full py-4">
                            Login to Dashboard
                        </Button>
                        <button 
                            type="button"
                            onClick={() => setIsAdminLoginOpen(false)}
                            className="text-gray-500 font-bold hover:text-blue-600 transition-colors py-2"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default App;
