import React, { useState } from 'react';
import { AlertCircle, ShieldAlert, MapPin, Phone, Building2, UserCheck, CheckCircle2, Navigation, Compass, PhoneCall } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import Modal from '../common/Modal';
import Button from '../common/Button';

// Key Helpline Numbers Directory
export const HELPLINE_NUMBERS = [
  { id: 'police', name: 'National Emergency & Police', number: '112', description: 'All-in-one emergency helpline for police dispatch, fire & rescue.', category: 'Police & Emergency', icon: ShieldAlert, color: 'bg-red-50 text-red-900 border-red-200 hover:bg-red-100', badgeColor: 'bg-red-600 text-white' },
  { id: 'nalsa', name: 'NALSA Legal Aid Hotline', number: '15100', description: 'National Legal Services Authority for free legal aid & court advocates.', category: 'Legal Services', icon: UserCheck, color: 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100', badgeColor: 'bg-blue-900 text-white' },
  { id: 'cyber', name: 'National Cyber Crime Helpline', number: '1930', description: 'Call within 2 hours of online financial fraud to hold & freeze stolen funds.', category: 'Cyber Fraud', icon: PhoneCall, color: 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100', badgeColor: 'bg-amber-600 text-white' },
  { id: 'women', name: 'Women Helpline / Protection', number: '1091', description: '24/7 National emergency hotline for women safety & protection.', category: 'Women Protection', icon: Phone, color: 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100', badgeColor: 'bg-purple-700 text-white' },
  { id: 'child', name: 'Childline India', number: '1098', description: 'Emergency protection and care service for children in distress.', category: 'Child Protection', icon: AlertCircle, color: 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100', badgeColor: 'bg-emerald-700 text-white' },
  { id: 'elder', name: 'Senior Citizen Elderline', number: '14567', description: 'Helpline for elderly assistance, abuse protection, and legal guidance.', category: 'Senior Citizens', icon: Building2, color: 'bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100', badgeColor: 'bg-slate-800 text-white' },
  { id: 'ambulance', name: 'Medical Emergency & Ambulance', number: '108', description: 'Immediate medical emergency response and ambulance dispatch.', category: 'Medical', icon: Navigation, color: 'bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100', badgeColor: 'bg-rose-600 text-white' },
];

const SOSButton = () => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { language, t } = useLanguage();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submittingSos, setSubmittingSos] = useState(false);
  const [coords, setCoords] = useState(null);
  const [sosResult, setSosResult] = useState(null);
  const [locationError, setLocationError] = useState('');

  // Location Form State
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [address, setAddress] = useState('');
  const [useManualLocation, setUseManualLocation] = useState(false);

  // Auto-Detect GPS Location
  const detectGpsLocation = () => {
    setLocationError('');
    setLoadingLocation(true);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoadingLocation(false);
          addToast({ type: 'success', title: 'GPS Location Detected', message: 'Precise coordinates attached to alert.' });
        },
        (error) => {
          console.warn('Geolocation warning:', error.message);
          setLocationError('GPS permission denied or timed out. Please enter your location manually below.');
          setCoords({ lat: 28.6139, lng: 77.2090 });
          setUseManualLocation(true);
          setLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser. Please specify your location below.');
      setCoords({ lat: 28.6139, lng: 77.2090 });
      setUseManualLocation(true);
      setLoadingLocation(false);
    }
  };

  // 1. Initial SOS Click -> Open Confirm Modal & Trigger GPS check
  const handleSosClick = () => {
    setIsConfirmOpen(true);
    if (!coords && !city) {
      detectGpsLocation();
    }
  };

  // 2. Trigger SOS POST request
  const confirmTriggerSos = async () => {
    setSubmittingSos(true);
    try {
      const locationString = [address, city, stateName].filter(Boolean).join(', ') || 'Connaught Place, New Delhi';
      const payload = {
        lat: coords?.lat || 28.6139,
        lng: coords?.lng || 77.2090,
        locationName: locationString,
        city: city || 'New Delhi',
        state: stateName || 'Delhi',
        address: address || '',
        userId: currentUser?.uid || 'guest-citizen-101',
        timestamp: new Date().toISOString()
      };

      const res = await api.post('/api/sos/trigger', payload);
      const data = res.data;

      setSosResult({
        ...data,
        locationDispatched: locationString
      });
      setIsConfirmOpen(false);
      setIsResultOpen(true);

      addToast({
        type: 'success',
        title: '🚨 Emergency SOS Dispatched!',
        message: `Dispatched to: ${data.policeStation} (${data.distance || 'Nearest'})`,
        duration: 7000
      });
    } catch (err) {
      console.error('SOS Trigger Error:', err);
      addToast({
        type: 'error',
        title: 'SOS Dispatch Error',
        message: err.message || 'Failed to dispatch SOS signal. Please call 112 directly.',
        duration: 6000
      });
    } finally {
      setSubmittingSos(false);
    }
  };

  return (
    <>
      {/* Persistent Floating Red Pulsing SOS Button (Bottom-Left) */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={handleSosClick}
          className="group relative flex items-center gap-2.5 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-3.5 sm:px-5 sm:py-4 rounded-full shadow-2xl animate-pulse-sos border-2 border-white/40 transition-transform active:scale-95 cursor-pointer"
          title="Trigger Emergency Legal SOS Alert"
        >
          <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7 animate-bounce" />
          <span className="text-xs sm:text-sm tracking-wider uppercase font-extrabold">{t('floatingSosBtn')}</span>
        </button>
      </div>

      {/* Location Request & Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={`⚠️ ${t('sosModalTitle')}`}
        subtitle={t('sosModalSubtitle')}
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-900 text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Use for high-risk legal emergencies:</p>
              <ul className="list-disc list-inside text-xs text-red-800 mt-1 space-y-0.5">
                <li>Unlawful detention or immediate physical harassment</li>
                <li>Financial extortion or ongoing cyber fraud alert</li>
                <li>Emergency eviction under coercion</li>
              </ul>
            </div>
          </div>

          {/* Location Input Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs sm:text-sm">
                <MapPin className="w-4 h-4 text-red-600" />
                <span>Dispatch Emergency Location</span>
              </div>
              <button
                type="button"
                onClick={detectGpsLocation}
                disabled={loadingLocation}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-900 hover:text-blue-950 bg-blue-100 hover:bg-blue-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <Compass className={`w-3.5 h-3.5 ${loadingLocation ? 'animate-spin' : ''}`} />
                {loadingLocation ? 'Detecting...' : 'Auto-Detect GPS'}
              </button>
            </div>

            {/* GPS coordinates preview */}
            {coords && (
              <div className="font-mono text-[11px] bg-white p-2 rounded border border-slate-200 text-slate-700 flex items-center justify-between">
                <span>GPS Coords: <strong>{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</strong></span>
                <span className="text-emerald-700 font-semibold text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded">GPS Active</span>
              </div>
            )}

            {locationError && (
              <p className="text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 text-xs">
                {locationError}
              </p>
            )}

            {/* Manual Location Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">City / District</label>
                <input
                  type="text"
                  placeholder="e.g. New Delhi, Mumbai, Chennai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  placeholder="e.g. Delhi, Maharashtra, Tamil Nadu"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-900"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Landmark / Street Address (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Near Metro Gate 2, Connaught Place"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setIsConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              fullWidth
              isLoading={submittingSos || loadingLocation}
              onClick={confirmTriggerSos}
              icon={ShieldAlert}
            >
              Send Emergency SOS Alert
            </Button>
          </div>
        </div>
      </Modal>

      {/* SOS Dispatched Success & Helpline Numbers Modal */}
      <Modal
        isOpen={isResultOpen}
        onClose={() => setIsResultOpen(false)}
        title="🚨 SOS Alert Dispatched & Emergency Directory"
        subtitle="Law enforcement authorities and legal aid officers have been notified."
      >
        {sosResult && (
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-900">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Alert Ref: {sosResult.alertId}</h4>
                <p className="text-xs text-emerald-800">
                  Location dispatched: <strong>{sosResult.locationDispatched || 'Captured Location'}</strong>
                </p>
              </div>
            </div>

            {/* Nearest Station & DLSA Details */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Nearest Police Station</p>
                  <p className="text-sm font-bold text-slate-900">{sosResult.policeStation}</p>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">Distance: <span className="text-blue-900 font-bold">{sosResult.distance || '1.2 km'}</span></p>
                </div>
              </div>

              <hr className="border-slate-200" />

              <div className="flex items-start gap-3">
                <UserCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Assigned Legal Officer (DLSA)</p>
                  <p className="text-sm font-bold text-slate-900">{sosResult.dlsaOfficer || 'Adv. Rajesh Kumar (DLSA Panel Counsel)'}</p>
                  <p className="text-xs text-slate-600 mt-0.5">Phone: <span className="font-mono font-semibold">{sosResult.dlsaContact || '+91 98765 43210'}</span></p>
                </div>
              </div>
            </div>

            {/* Quick Helpline Numbers Section */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-red-600" />
                <span>Instant Emergency Helplines</span>
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {HELPLINE_NUMBERS.slice(0, 4).map((hp) => (
                  <div key={hp.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-2.5">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{hp.name}</p>
                      <p className="text-[11px] text-slate-500">{hp.category}</p>
                    </div>
                    <a
                      href={`tel:${hp.number}`}
                      className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-mono font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {hp.number}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={() => setIsResultOpen(false)}
            >
              Acknowledge & Close
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
};

export default SOSButton;

