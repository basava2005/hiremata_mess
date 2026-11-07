import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Utensils,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Coffee,
  Heart,
  Star,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Award,
  Flame,
  Leaf,
  MessageSquare,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'

export const LandingPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const [activeMenuTab, setActiveMenuTab] = useState<'BREAKFAST' | 'LUNCH' | 'DINNER' | 'HOLIGE'>('BREAKFAST')

  const getDashboardLink = () => {
    if (!user) return '/login'
    switch (user.role) {
      case 'BRANCH_ADMIN':
        return '/admin'
      case 'STUDENT':
      default:
        return '/student'
    }
  }

  // 1. Sliding Hero Images Showcase
  const heroSlides = [
    {
      title: 'Famous Davanagere Mandakki Mirchi & Normal Dosa',
      subtitle: 'ಕನ್ನಡದ ಹೆಮ್ಮೆ - ಗರಿಗರಿ ದೋಸೆ & ಮಂಡಕ್ಕಿ ಮಿರ್ಚಿ',
      desc: 'Authentic crispy golden dosa and spicy puffed rice with piping hot mirchi bajjis made fresh every morning.',
      badge: 'Davanagere Signature',
      image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1200&q=80',
      timing: 'Breakfast: 7:30 AM – 10:00 AM',
    },
    {
      title: 'Authentic Homestyle Chapati Meals (ಚಪಾತಿ ಊಟ)',
      subtitle: 'ಶುದ್ಧ ಸಸ್ಯಾಹಾರಿ ಸಂಪೂರ್ಣ ಊಟ • Pure Desi Ghee & Fresh Phulkas',
      desc: 'Unlimited soft whole-wheat chapatis with two daily Karnataka palyas, kat saaru, dal tadka, sona masoori rice, curd, and majjige.',
      badge: 'Unlimited Lunch & Dinner',
      image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=1200&q=80',
      timing: 'Lunch: 12:30 PM – 2:30 PM',
    },
    {
      title: 'Special Festival Holige Meals (ಹೋಳಿಗೆ ಊಟ)',
      subtitle: 'ಬಿಸಿ ತುಪ್ಪದೊಂದಿಗೆ ಬೇಳೆ ಹೋಳಿಗೆ • Traditional Obbattu Feast',
      desc: 'Melt-in-mouth traditional Bele Holige drizzled with pure desi ghee, accompanied by Kat Saaru, Kosambari, Payasa, and Chapatis.',
      badge: 'Special Feast',
      image: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Puran_Poli_with_Ghee_%2C_Maharashtra.jpg',
      timing: 'Special Holige Meals',
    },
    {
      title: 'Crispy Paddu, Puliyogare & Kadak Tea',
      subtitle: 'ಗುಳಿಯಪ್ಪ, ಪುಳಿಯೋಗರೆ, ವೆಜ್ ಪಲಾವ್ & ಕಡಕ್ ಚಹಾ',
      desc: 'Daily rotating breakfast varieties: Paddu with red chutney, temple-style Puliyogare, Veg Palau, Kanda Avalakki, and Thatte Idli.',
      badge: 'Morning Tiffins',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Kuzhi_Paniyaram.jpg',
      timing: 'Daily Breakfast & Tea',
    },
  ]

  // Auto-advance hero slides
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [heroSlides.length])

  // Karnataka culinary menu items
  const menuCategories = {
    BREAKFAST: [
      {
        name: 'Davanagere Mandakki Mirchi (ಮಂಡಕ್ಕಿ ಮಿರ್ಚಿ)',
        desc: 'The iconic taste of Davanagere! Fresh spiced puffed rice mixture tossed with roasted peanuts, coriander, and served with piping hot chilli bajjis.',
        kannada: 'ದಾವಣಗೆರೆ ಗಿರಿಮಿಟ್ & ಮಿರ್ಚಿ ಬಜ್ಜಿ',
        tag: 'Davanagere Iconic',
        image: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Mirchi_Vada_bajji.jpg',
      },
      {
        name: 'Crispy Normal Dosa (ದೋಸೆ)',
        desc: 'Golden crispy plain and masala dosa roasted to perfection on the tawa, served with soothing potato palya and fresh coconut chutney.',
        kannada: 'ಗರಿಗರಿ ದೋಸೆ',
        tag: 'Golden Crisp',
        image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Crispy Paddu / Guliappa (ಗುಳಿಯಪ್ಪ / ಪದ್ದು)',
        desc: 'Round golden dumplings crisped in cast-iron moulds, seasoned with onions, mustard, green chillies, served with spicy red & coconut chutney.',
        kannada: 'ಗರಂ ಗರಂ ಪದ್ದು',
        tag: 'Traditional',
        image: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Kuzhi_Paniyaram.jpg',
      },
      {
        name: 'Vegetable Palau (ತರಕಾರಿ ಪಲಾವ್)',
        desc: 'Davanagere style mild aromatic vegetable pulao loaded with carrots, beans, peas, and whole spices, served with cooling cucumber raita.',
        kannada: 'ರುಚಿಕರ ವೆಜ್ ಪಲಾವ್',
        tag: 'Nutritious & Fresh',
        image: 'https://upload.wikimedia.org/wikipedia/commons/8/85/Vegetable_pulao.JPG',
      },
      {
        name: 'Kanda Avalakki (ಕಂದ ಅವಲಕ್ಕಿ / ಪೋಹಾ)',
        desc: 'Light and wholesome tempered beaten rice with roasted groundnuts, mustard, green chillies, fresh grated coconut and fresh coriander.',
        kannada: 'ಕಾಯಿ ತುರಿ ಅವಲಕ್ಕಿ',
        tag: 'Healthy Light',
        image: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Poha_made_from_beaten_rice_in_Madhya_Pradesh%2C_India.jpg',
      },
      {
        name: 'Temple Puliyogare (ಪುಳಿಯೋಗರೆ)',
        desc: 'Traditional tangy tamarind rice spiced with roasted peanuts, sesame seeds, red chillies, and authentic Karnataka home-ground masala.',
        kannada: 'ಸಾಂಪ್ರದಾಯಿಕ ಪುಳಿಯೋಗರೆ',
        tag: 'Tangy & Spicy',
        image: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Tamarind_Rice_%28Puliyogare%29.jpg',
      },
      {
        name: 'Soft Thatte Idli & Sambar (ತಟ್ಟೆ ಇಡ್ಲಿ)',
        desc: 'Plate-sized ultra soft steamed rice idlis dipped in spicy vegetable sambar and accompanied by creamy coconut chutney.',
        kannada: 'ಮಲ್ಲಿಗೆ ತಟ್ಟೆ ಇಡ್ಲಿ',
        tag: 'Piping Hot',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Kadak Chai & Ginger Tea (ಕಡಕ್ ಚಹಾ & ಶುಂಠಿ ಚಹಾ)',
        desc: 'Freshly brewed aromatic ginger-cardamom whole milk tea served piping hot every morning with breakfast.',
        kannada: 'ಕಡಕ್ ಚಹಾ',
        tag: 'Morning Starter',
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=700&q=80',
      },
    ],
    LUNCH: [
      {
        name: 'Unlimited Chapati / Roti Meal (ಚಪಾತಿ ಊಟ)',
        desc: 'Piping hot 100% whole wheat chapatis made continuously on the tawa, smeared with homemade desi ghee.',
        kannada: 'ಅನ್ಲಿಮಿಟೆಡ್ ಬಿಸಿ ಚಪಾತಿ',
        tag: 'Unlimited Servings',
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Daily 2 Karnataka Palyas (ತರಕಾರಿ ಪಲ್ಯಗಳು)',
        desc: 'Two wholesome curries daily: Yennegai Badanekayi (Stuffed Brinjal), Hesaru Kaalu (Green Gram), Aloo Sukka, or Cabbage Chana Dal.',
        kannada: 'ಎಣ್ಣೆಗಾಯಿ ಬದನೆಕಾಯಿ & ಪಲ್ಯ',
        tag: 'Uttara Karnataka Style',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Kat Saaru, Dal & Sona Masoori Rice (ಕಟ್ ಸಾರು & ಅನ್ನ)',
        desc: 'Traditional aromatic Kat Saaru (peppery lentil soup) and rich Dal Tadka poured over steaming hot Sona Masoori rice with ghee.',
        kannada: 'ಘಮಘಮಿಸುವ ಕಟ್ ಸಾರು & ಬಿಸಿ ಅನ್ನ',
        tag: 'Pure Comfort',
        image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Curd, Spiced Majjige & Crispy Sandige (ಮಜ್ಜಿಗೆ & ಸಂಡಿಗೆ)',
        desc: 'Thick creamy curd, tempering buttermilk (Majjige) with ginger and curry leaves, lemon pickle, and crispy sandige.',
        kannada: 'ಮಜ್ಜಿಗೆ & ಉಪ್ಪಿನಕಾಯಿ',
        tag: 'Cooling Finish',
        image: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Masala_chaas.JPG',
      },
    ],
    DINNER: [
      {
        name: 'Fresh Night Chapati Dinner (ರಾತ್ರಿ ಚಪಾತಿ ಊಟ)',
        desc: 'Soft, easy-to-digest hot chapatis cooked fresh on demand with a light night vegetable curry, dal, and rice.',
        kannada: 'ಬಿಸಿ ಚಪಾತಿ & ರಾತ್ರಿ ಊಟ',
        tag: 'Light & Homestyle',
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Tomato Rasam & Steamed Rice (ಟೊಮೆಟೊ ರಸಂ ಅನ್ನ)',
        desc: 'Comforting hot pepper-garlic rasam, soothing curd rice with mustard tempering, and roasted papad.',
        kannada: 'ಟೊಮೆಟೊ ಸಾರು & ಮೊಸರನ್ನ',
        tag: 'Gentle on Stomach',
        image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Tiffin Dabba Takeaway Box (ರಾತ್ರಿ ಡಬ್ಬಾ)',
        desc: 'Students can carry their night meals back to room or hostel in packed insulated dabbas on busy exam nights.',
        kannada: 'ಹಾಸ್ಟೆಲ್ ಟಿಫಿನ್ ಬಾಕ್ಸ್',
        tag: 'Takeaway Ready',
        image: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Dabba.jpg',
      },
    ],
    HOLIGE: [
      {
        name: 'Special Bele Holige / Obbattu (ಬೇಳೆ ಹೋಳಿಗೆ)',
        desc: 'Karnataka’s crown jewel! Thin, delicate flatbread stuffed with sweet jaggery-chana dal puran, served hot with pure desi ghee.',
        kannada: 'ಬಿಸಿ ತುಪ್ಪದೊಂದಿಗೆ ಹೋಳಿಗೆ',
        tag: 'Special Holige Feast',
        image: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Puran_Poli_with_Ghee_%2C_Maharashtra.jpg',
      },
      {
        name: 'Traditional Holige Kat Saaru (ಹೋಳಿಗೆ ಕಟ್ ಸಾರು)',
        desc: 'The legendary thin, sweet and spicy rasam made from the boiled chana dal stock of holige. A true Karnataka delicacy!',
        kannada: 'ಅದ್ಭುತ ರುಚಿಯ ಕಟ್ ಸಾರು',
        tag: 'Signature Broth',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80',
      },
      {
        name: 'Hesaru Bele Kosambari & Shavige Payasa (ಪಾಯಸ)',
        desc: 'Moong dal cucumber salad tempered with mustard and lemon juice, followed by rich vermicelli milk payasa with roasted cashews.',
        kannada: 'ಕೊಸಂಬರಿ & ಶಾಮಿಗೆ ಪಾಯಸ',
        tag: 'Festive Delight',
        image: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Kheer.jpg',
      },
    ],
  }

  return (
    <div className="min-h-screen bg-[#fafcf7] text-slate-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
      {/* 1. Header with Modern Minimalist Branding & Clean Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] transition-all">
        {/* Cultural Top Strip */}
        <div className="bg-[#0b331c] text-emerald-200 text-[11px] py-1.5 px-4 border-b border-emerald-800/40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="font-medium tracking-wide">
                100% Pure Veg (ಶುದ್ಧ ಸಸ್ಯಾಹಾರಿ) • Authentic Davanagere Homestyle Food
              </span>
            </div>
            <div className="hidden md:flex items-center gap-4 text-emerald-300/90 text-[11px]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>BIET Rd, Davangere</span>
              </span>
              <span>•</span>
              <a
                href="https://api.whatsapp.com/send?phone=918431413551&text=Hello%20Chandan%20Hiremat%2C%20I%20have%20an%20inquiry%20about%20Hiremat%20Mess%20Davanagere."
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white flex items-center gap-1.5 transition-colors font-semibold"
                title="Chat with Chandan Hiremat"
              >
                <MessageSquare className="w-3 h-3 text-[#25D366] fill-[#25D366]" />
                <span>Chandan: 8431413551</span>
              </a>
              <span>•</span>
              <a
                href="https://api.whatsapp.com/send?phone=918073113562&text=Hello%20Punith%20Hiremat%2C%20I%20have%20an%20inquiry%20about%20Hiremat%20Mess%20Davanagere."
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white flex items-center gap-1.5 transition-colors font-semibold"
                title="Chat with Punith Hiremat"
              >
                <MessageSquare className="w-3 h-3 text-[#25D366] fill-[#25D366]" />
                <span>Punith: 8073113562</span>
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 flex items-center justify-center text-white shadow-sm shadow-emerald-900/30 group-hover:scale-105 transition-transform border border-emerald-400/20">
              <Utensils className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight leading-none group-hover:text-emerald-800 transition-colors">
                  Hiremat Mess
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 leading-none">
                  ದಾವಣಗೆರೆ
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium tracking-normal mt-0.5 hidden sm:block">
                Pure Veg Homestyle Meals • BIET Road
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links - Clean & Pill-styled */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-600">
            <a
              href="#specialties"
              className="px-3.5 py-1.5 rounded-full hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
            >
              Specialties
            </a>
            <a
              href="#homestyle"
              className="px-3.5 py-1.5 rounded-full hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
            >
              Our Kitchen
            </a>
            <a
              href="#menu"
              className="px-3.5 py-1.5 rounded-full hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
            >
              Daily Menu
            </a>
            <a
              href="#plans"
              className="px-3.5 py-1.5 rounded-full hover:text-emerald-800 hover:bg-emerald-50 transition-colors flex items-center gap-1.5"
            >
              <span>Monthly Pass</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                ₹3,500
              </span>
            </a>
            <a
              href="#timings"
              className="px-3.5 py-1.5 rounded-full hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
            >
              Timings & Location
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            {/* Quick WhatsApp Link for Desktop */}
            <a
              href="https://api.whatsapp.com/send?phone=918431413551&text=Hello%20Chandan%20Hiremat%2C%20I%20have%20an%20inquiry%20about%20Hiremat%20Mess%20Davanagere."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 px-3.5 py-2 rounded-full transition-all active:scale-95"
              title="WhatsApp Mess Admin Chandan Hiremat"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-[#25D366] text-[#25D366]" />
              <span>Enquire</span>
            </a>

            {isAuthenticated ? (
              <Link to={getDashboardLink()}>
                <button className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold h-9 sm:h-10 px-4 sm:px-5 rounded-full shadow-xs hover:shadow transition-all flex items-center gap-1.5">
                  <span>Go to Portal ({user?.role?.replace('_', ' ')})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            ) : (
              <Link to="/login">
                <button className="bg-[#15803d] hover:bg-[#166534] text-white text-xs sm:text-sm font-bold h-9 sm:h-10 px-5 sm:px-6 rounded-full shadow-xs hover:shadow-md transition-all active:scale-95 flex items-center gap-1.5">
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileNavOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2 animate-in slide-in-from-top-2 shadow-lg">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <a
                href="#specialties"
                onClick={() => setMobileNavOpen(false)}
                className="block text-xs font-bold text-slate-800 px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
              >
                Davanagere Specialties (Mandakki Mirchi & Dosa)
              </a>
              <a
                href="#homestyle"
                onClick={() => setMobileNavOpen(false)}
                className="block text-xs font-bold text-slate-800 px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
              >
                Our Kitchen (ಮನೆ ಊಟ)
              </a>
              <a
                href="#menu"
                onClick={() => setMobileNavOpen(false)}
                className="block text-xs font-bold text-slate-800 px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
              >
                Daily Menu (ಟಿಫಿನ್ & ಊಟ)
              </a>
              <a
                href="#plans"
                onClick={() => setMobileNavOpen(false)}
                className="block text-xs font-bold text-emerald-800 px-3 py-2 rounded-lg bg-emerald-50/60 hover:bg-emerald-100/60 transition-colors flex items-center justify-between"
              >
                <span>Monthly All-Inclusive Pass</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-extrabold">₹3,500</span>
              </a>
              <a
                href="#timings"
                onClick={() => setMobileNavOpen(false)}
                className="block text-xs font-bold text-slate-800 px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
              >
                Timings & BIET Rd Location
              </a>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href="https://api.whatsapp.com/send?phone=918431413551&text=Hello%20Chandan%20Hiremat%2C%20I%20have%20an%20inquiry%20about%20Hiremat%20Mess%20Davanagere."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 py-2.5 px-3 rounded-xl"
              >
                <MessageSquare className="w-4 h-4 fill-[#25D366] text-[#25D366]" />
                <span>WhatsApp Admins (8431413551 / 8073113562)</span>
              </a>

              <Link to="/login" onClick={() => setMobileNavOpen(false)}>
                <button className="w-full bg-[#15803d] text-white text-xs font-bold h-10 rounded-xl shadow-xs">
                  Sign In to Member Portal
                </button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. Sliding Hero Image Carousel Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-950 text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-5 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-600/50 text-emerald-300 text-xs font-bold shadow-sm">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Pure Veg Karnataka Homestyle • Davanagere</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
                ಶುದ್ಧ ದಾವಣಗೆರೆ ರುಚಿ.{' '}
                <span className="text-emerald-400 italic">
                  ಮನೆಯೂಟದ ಸವಿ
                </span>{' '}
                ಬಿಸಿ ಬಿಸಿ ಊಟ.
              </h1>

              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Welcome to <strong>Hiremat Mess</strong>, Davanagere. Enjoy morning breakfast with famous{' '}
                <strong>Mandakki Mirchi</strong> & Normal Dosa, unlimited afternoon{' '}
                <strong>Chapati Meals</strong>, and comforting dinner. Just like home in Karnataka.
              </p>

              {/* Inclusions summary pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-[11px] font-bold text-emerald-200">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-900/90 border border-emerald-700/60">
                  ✓ Breakfast + Tea
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-900/90 border border-emerald-700/60">
                  ✓ Chapati Meals
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-900/90 border border-emerald-700/60">
                  ✓ Chapati Dinner
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-900/80 border border-amber-600/60 text-amber-300">
                  ✓ Special Holige Meals
                </span>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-3">
                <Link to="/login" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-[#15803d] hover:bg-[#166534] text-white text-sm font-bold h-12 px-7 rounded-2xl shadow-xl shadow-emerald-950/50 border border-emerald-400/30"
                  >
                    <span>Sign In to Member Portal</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>

                <a href="#plans" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto text-emerald-100 hover:text-white border-emerald-700/80 bg-emerald-900/40 hover:bg-emerald-800/60 text-sm font-bold h-12 px-6 rounded-2xl backdrop-blur"
                  >
                    <span>₹3,500 All-Inclusive Plan</span>
                  </Button>
                </a>
              </div>
            </div>

            {/* Right Sliding Carousel Column */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-600/40 shadow-2xl bg-slate-900 group">
                {/* Active Slide Image */}
                <div className="relative h-72 sm:h-96 w-full overflow-hidden">
                  <img
                    src={heroSlides[activeSlide].image}
                    alt={heroSlides[activeSlide].title}
                    className="w-full h-full object-cover transition-all duration-700 transform scale-100 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Badge top-left */}
                  <div className="absolute top-4 left-4 bg-[#15803d] text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-lg border border-emerald-400/40">
                    {heroSlides[activeSlide].badge}
                  </div>

                  {/* Bottom details */}
                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                    <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                      {heroSlides[activeSlide].timing}
                    </span>
                    <h3 className="font-serif text-lg sm:text-2xl font-black text-white leading-tight">
                      {heroSlides[activeSlide].title}
                    </h3>
                    <p className="text-xs text-emerald-200 font-medium">
                      {heroSlides[activeSlide].subtitle}
                    </p>
                    <p className="text-[11px] text-slate-300 line-clamp-2 pt-0.5">
                      {heroSlides[activeSlide].desc}
                    </p>
                  </div>
                </div>

                {/* Slider Controls (Prev / Next Arrows) */}
                <button
                  onClick={() =>
                    setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur transition-all"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setActiveSlide((prev) => (prev + 1) % heroSlides.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur transition-all"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Slide Dots */}
                <div className="absolute bottom-2 right-4 flex items-center gap-1.5 z-20">
                  {heroSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlide(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        activeSlide === idx ? 'w-6 bg-emerald-400' : 'w-2 bg-white/50'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Authentic Davanagere Specialties Section */}
      <section id="specialties" className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#15803d] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Traditional Davanagere Flavours
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Davanagere Signature Delicacies
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Handcrafted daily using traditional Karnataka recipes, stone-ground masalas, and pure homemade ghee.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Specialty 1: Mandakki Mirchi */}
            <div className="rounded-3xl border border-emerald-100 bg-[#fbfdf9] p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="h-44 rounded-2xl overflow-hidden relative">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/8/8a/Mirchi_Vada_bajji.jpg"
                  alt="Davanagere Mandakki Mirchi"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2.5 left-2.5 bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase shadow">
                  Davanagere Special
                </span>
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-800">ದಾವಣಗೆರೆ ಮಂಡಕ್ಕಿ ಮಿರ್ಚಿ</span>
                <h3 className="font-serif font-bold text-lg text-slate-900">Mandakki Mirchi (ಮಂಡಕ್ಕಿ)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Crisp besan-batter green chilli bajjis paired with crunchy spiced puffed rice (usli/girmit), chopped onions, roasted groundnuts, and lemon juice.
                </p>
              </div>
            </div>

            {/* Specialty 2: Normal Dosa */}
            <div className="rounded-3xl border border-emerald-100 bg-[#fbfdf9] p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="h-44 rounded-2xl overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=700&q=80"
                  alt="Crispy Normal Dosa"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2.5 left-2.5 bg-[#15803d] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase shadow">
                  Golden Crisp
                </span>
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-800">ಗರಿಗರಿ ದೋಸೆ</span>
                <h3 className="font-serif font-bold text-lg text-slate-900">Crispy Normal Dosa (ದೋಸೆ)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Golden-crisp on the outside and soft inside, roasted fresh on the tawa and served with comforting potato palya and spicy coconut chutney.
                </p>
              </div>
            </div>

            {/* Specialty 3: Holige Meals */}
            <div className="rounded-3xl border border-emerald-100 bg-[#fbfdf9] p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="h-44 rounded-2xl overflow-hidden relative">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/f/ff/Puran_Poli_with_Ghee_%2C_Maharashtra.jpg"
                  alt="Special Holige Meals"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2.5 left-2.5 bg-amber-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase shadow">
                  ಹೋಳಿಗೆ ಊಟ
                </span>
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-800">ಬೇಳೆ ಹೋಳಿಗೆ ಊಟ</span>
                <h3 className="font-serif font-bold text-lg text-slate-900">Special Holige Meals</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Traditional sweet Bele Holige (Obbattu) dripping with pure desi ghee, served with Kat Saaru, Kosambari, Payasa, hot Chapatis, and Sona Masoori Rice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Authentic Davanagere Homestyle Dining Experience (ಮನೆ ಊಟ) */}
      <section id="homestyle" className="py-16 sm:py-20 bg-gradient-to-b from-[#f2faee] via-[#e5f6de] to-[#f2faee] border-y border-emerald-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-emerald-200/60 border border-emerald-300 px-3 py-1 rounded-full">
              <Leaf className="w-3.5 h-3.5 text-emerald-800" />
              <span>ಸಾಂಪ್ರದಾಯಿಕ ಕರ್ನಾಟಕ ಮನೆ ಊಟ</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-emerald-950 tracking-tight">
              Authentic Homestyle Chapati Meals & Dining
            </h2>
            <p className="text-xs sm:text-sm text-emerald-900/80">
              Clean, nutritious, and wholesome home-cooked meals prepared with pure desi ghee, whole wheat, and farm-fresh vegetables.
            </p>
          </div>

          {/* Interactive Homestyle Spread Visualizer */}
          <div className="rounded-3xl bg-gradient-to-r from-emerald-800 via-green-800 to-emerald-900 p-6 sm:p-10 shadow-2xl text-white relative overflow-hidden border-4 border-emerald-700/50">
            <div className="absolute inset-0 bg-[radial-gradient(#4ade80_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between border-b border-emerald-600/40 pb-4">
                <div>
                  <span className="text-[11px] uppercase font-extrabold tracking-wider text-emerald-300">
                    Homestyle Dining Experience
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold mt-0.5">
                    How We Serve Your Daily Chapati Meals
                  </h3>
                </div>
                <span className="text-xs font-bold bg-emerald-950 px-3 py-1 rounded-full text-emerald-300 border border-emerald-700">
                  Unlimited Servings
                </span>
              </div>

              {/* Homestyle item mapping grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-emerald-950/70 border border-emerald-600/40 rounded-xl space-y-1">
                  <span className="text-[10px] text-amber-300 font-bold block">1. Side Accompanients</span>
                  <p className="font-bold text-sm">ಉಪ್ಪಿನಕಾಯಿ & ಕೊಸಂಬರಿ</p>
                  <p className="text-[11px] text-emerald-200">Lemon pickle, salt, and soaked moong dal kosambari.</p>
                </div>

                <div className="p-3 bg-emerald-950/70 border border-emerald-600/40 rounded-xl space-y-1">
                  <span className="text-[10px] text-amber-300 font-bold block">2. Daily Subzis</span>
                  <p className="font-bold text-sm">2 ತರಕಾರಿ ಪಲ್ಯಗಳು</p>
                  <p className="text-[11px] text-emerald-200">Yennegai badane / kaalu palya & daily fresh seasonal subzi.</p>
                </div>

                <div className="p-3 bg-emerald-950/70 border border-emerald-600/40 rounded-xl space-y-1">
                  <span className="text-[10px] text-amber-300 font-bold block">3. Fresh from Tawa</span>
                  <p className="font-bold text-sm">ಬಿಸಿ ಚಪಾತಿ & ತುಪ್ಪ</p>
                  <p className="text-[11px] text-emerald-200">Soft whole-wheat chapatis straight from tawa with pure ghee.</p>
                </div>

                <div className="p-3 bg-emerald-950/70 border border-emerald-600/40 rounded-xl space-y-1">
                  <span className="text-[10px] text-amber-300 font-bold block">4. Main Serving</span>
                  <p className="font-bold text-sm">ಸೋನಾ ಮಸೂರಿ ಅನ್ನ & ಸಾರು</p>
                  <p className="text-[11px] text-emerald-200">Steamed rice with authentic Kat Saaru, dal, and majjige.</p>
                </div>
              </div>

              {/* Holige Special mention */}
              <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <p className="text-xs sm:text-sm font-semibold text-amber-200">
                    <strong>Holige:</strong> Fresh Bele Holige (Obbattu) served piping hot with pure ghee and payasa!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Complete Daily Menu Explorer (Breakfast, Lunch, Dinner, Holige) */}
      <section id="menu" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#15803d] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Full Culinary Spread
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Daily Menu: Morning to Night
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              All 3 meals (Breakfast + Tea, Chapati Lunch Meals, Chapati Dinner) are included in the ₹3,500 monthly plan!
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex justify-center">
            <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl gap-1 overflow-x-auto max-w-full">
              {[
                { id: 'BREAKFAST', label: '1. Breakfast + Tea (ತಿಂಡಿ & ಚಹಾ)', icon: Coffee },
                { id: 'LUNCH', label: '2. Chapati Meals Lunch (ಊಟ)', icon: Utensils },
                { id: 'DINNER', label: '3. Chapati Dinner (ರಾತ್ರಿ ಊಟ)', icon: Flame },
                { id: 'HOLIGE', label: '4. Special Holige Feast (ಹೋಳಿಗೆ)', icon: Sparkles },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMenuTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                      activeMenuTab === tab.id
                        ? 'bg-[#15803d] text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Menu Items Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {menuCategories[activeMenuTab].map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all flex flex-col group"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-[#15803d] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                    {item.tag}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 block">
                      {item.kannada}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#15803d] transition-colors leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-extrabold text-[#15803d]">Included in Plan</span>
                    <Link to="/login" className="text-slate-400 hover:text-[#15803d] flex items-center">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Leave Extension Guarantee Section */}
      <section id="extension" className="py-14 sm:py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Our Fair Student Guarantee</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Traveling Home to Native for Holidays?{' '}
                <span className="text-emerald-400">Never Lose A Single Paid Day.</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                College semester breaks, festivals, or exam holidays? At <strong>Hiremat Mess</strong>, we strictly honor our fair extension policy for all Davanagere students:
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    10+
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      10 Consecutive Approved Leave Days Rule
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Take 10 or more consecutive approved leave days inside your 30-day subscription, and our admin credits those days directly to extend your valid date!
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    📱
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      1-Click Mobile Leave Requests
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Apply right from your phone with 1 day advance notice. Digital tracking, zero disputes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/login">
                  <Button className="bg-[#15803d] hover:bg-[#166534] text-white text-xs sm:text-sm font-bold h-11 px-6 rounded-xl">
                    <span>Sign In & Check Eligibility</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Illustration Card */}
            <div className="lg:col-span-5">
              <div className="p-6 rounded-3xl bg-slate-800/90 border border-slate-700 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <span className="font-bold text-xs uppercase tracking-wider text-emerald-400">
                    Live Student Example
                  </span>
                  <span className="text-[11px] bg-emerald-950 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-800 font-bold">
                    12 Days Approved
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl space-y-1">
                    <span className="text-slate-400 text-[10px] block">Student: Ananya Deshmukh</span>
                    <span className="font-bold text-white block">Vacation Trip (10 Oct – 21 Oct)</span>
                    <span className="text-emerald-400 font-semibold block text-[11px]">
                      ✓ 12 Consecutive Days Approved
                    </span>
                  </div>

                  <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl space-y-1 text-slate-200">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Original End Date:</span>
                      <span className="line-through text-slate-400">30 Oct 2026</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-emerald-300 pt-1 border-t border-emerald-900">
                      <span>Extended End Date:</span>
                      <span>11 Nov 2026 (+12 Days Added)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Single All-Inclusive Plan: ₹3,500 Only */}
      <section id="plans" className="py-16 sm:py-20 bg-emerald-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#15803d] bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
              One Single Honest Plan
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Hiremat Mess Monthly All-Inclusive Plan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Only one complete plan covering Breakfast, Morning Tea, Chapati Lunch Meals, and Chapati Dinner.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="rounded-3xl bg-white border-2 border-[#15803d] shadow-2xl p-6 sm:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#15803d] text-white text-[11px] font-extrabold px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider shadow">
                100% Pure Veg Plan
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#15803d]">
                    Full Month Mess & Tiffin Membership
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                    Standard Monthly Plan
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Includes: <strong>Breakfast + Tea + Chapati Meals + Chapati Dinner</strong> (7 Days/Week)
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500 uppercase font-bold block">
                      All-Inclusive Monthly Fee
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-black text-[#15803d]">₹3,500</span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-600">/ 30 calendar days</span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-900 bg-white/90 border border-emerald-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                    Full 3 Meals + Tea (~₹116/day)
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                    Everything Included In Your ₹3,500 Plan:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 font-medium">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#15803d] flex-shrink-0 mt-0.5" />
                      <span><strong>Breakfast + Tea:</strong> Mandakki Mirchi, Dosa, Paddu, Palau, Avalakki & Kadak Tea</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#15803d] flex-shrink-0 mt-0.5" />
                      <span><strong>Chapati Meals (Lunch):</strong> Unlimited Chapatis with Ghee, 2 Palyas, Kat Saaru, Rice & Majjige</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#15803d] flex-shrink-0 mt-0.5" />
                      <span><strong>Chapati Dinner (Night):</strong> Fresh tawa chapatis, night sabzi, dal & rice</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#15803d] flex-shrink-0 mt-0.5" />
                      <span><strong>Special Holige Feast:</strong> Bele Holige with pure desi ghee included on special days!</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#15803d] flex-shrink-0 mt-0.5" />
                      <span><strong>Homestyle Dining & Tiffin:</strong> Dine in our clean mess hall or carry tiffin dabba to hostel</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#15803d] flex-shrink-0 mt-0.5" />
                      <span><strong>10+ Day Leave Extension:</strong> Credited validity when you travel home for holidays</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#15803d] flex-shrink-0 mt-0.5" />
                      <span><strong>Digital Mobile Portal:</strong> Days left tracking, receipts, and leave requests</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#15803d] flex-shrink-0 mt-0.5" />
                      <span><strong>Zero Hidden Costs:</strong> Clean RO drinking water & unlimited chapatis</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                  <Link to="/login" className="w-full sm:flex-1">
                    <Button className="w-full bg-[#15803d] hover:bg-[#166534] text-white text-sm font-bold h-12 rounded-xl shadow-lg shadow-emerald-900/20">
                      <span>Sign In & Subscribe (₹3,500)</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>

                  <a
                    href="tel:+918431413551"
                    className="w-full sm:w-auto text-xs font-semibold text-slate-600 hover:text-[#15803d] text-center px-4 py-2"
                  >
                    Davanagere Admins: 8431413551 / 8073113562
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Mess Timings & Location (Davanagere, Karnataka) */}
      <section id="timings" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Timings */}
            <div className="space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#15803d] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  ದಿನನಿತ್ಯದ ಸಮಯ
                </span>
                <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
                  Daily Service Timings
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Open 7 days a week for breakfast, lunch, and dinner.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3.5 text-xs">
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                      <Coffee className="w-4 h-4 text-amber-600" />
                      <span>1. ಬೆಳಗಿನ ತಿಂಡಿ & ಚಹಾ (Breakfast + Tea)</span>
                    </div>
                    <span className="text-[#15803d] font-black text-sm bg-emerald-100/80 px-2.5 py-0.5 rounded-lg border border-emerald-300">
                      7:30 AM – 10:00 AM
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] pt-1">
                    Mandakki Mirchi, Normal Dosa, Paddu, Veg Palau, Kanda Avalakki, Thatte Idli & Morning Tea.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                      <Utensils className="w-4 h-4 text-[#15803d]" />
                      <span>2. ಮಧ್ಯಾಹ್ನದ ಚಪಾತಿ ಊಟ (Chapati Meals Lunch)</span>
                    </div>
                    <span className="text-[#15803d] font-black text-sm bg-emerald-100/80 px-2.5 py-0.5 rounded-lg border border-emerald-300">
                      12:30 PM – 2:30 PM
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] pt-1">
                    Unlimited Hot Tawa Chapatis with Pure Ghee, 2 Karnataka Palyas, Kat Saaru, Rice, Majjige & Holige.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                      <Flame className="w-4 h-4 text-[#15803d]" />
                      <span>3. ರಾತ್ರಿಯ ಚಪಾತಿ ಊಟ (Chapati Dinner)</span>
                    </div>
                    <span className="text-[#15803d] font-black text-sm bg-emerald-100/80 px-2.5 py-0.5 rounded-lg border border-emerald-300">
                      7:30 PM – 9:30 PM
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] pt-1">
                    Fresh Whole-Wheat Chapatis, Night Palya, Dal, Rasam, Steamed Rice & Majjige (Tiffin takeaway available).
                  </p>
                </div>
              </div>
            </div>

            {/* Location & Contact in Davangere */}
            <div id="contact" className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 space-y-5 shadow-xl border border-emerald-900/40">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  ಶಾಖೆಯ ವಿಳಾಸ • Davangere Branch
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold mt-1">Hiremat Mess Davangere</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Centrally located on BIET Road, Anjaneya Layout, close to BIET Engineering College, Dental College, and student hostels in Davangere.
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">
                      Anjaneya Layout 5th Cross, BIET Rd, Davangere, Karnataka 577004
                    </span>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Anjaneya+Layout+5th+Cross+BIET+Rd+Davangere+Karnataka+577004"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold text-[11px] mt-1 underline"
                    >
                      <span>Get Directions on Google Maps ↗</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Call or WhatsApp: Chandan (8431413551) • Punith (8073113562)</span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Open 7 Days a Week (Mon – Sun)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <Link to="/login">
                  <Button className="w-full bg-[#15803d] hover:bg-[#166534] text-white text-xs sm:text-sm font-bold h-11 rounded-xl">
                    <span>Sign In to Member Portal</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-8 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#15803d] flex items-center justify-center text-white font-bold text-xs">
              H
            </div>
            <span className="font-serif font-bold text-slate-200 text-sm">
              Hiremat Mess (ಹಿರೇಮಠ್ ಮೆಸ್) • Davanagere, Karnataka
            </span>
          </div>

          <p className="text-[11px] text-slate-500 text-center sm:text-right">
            © {new Date().getFullYear()} Hiremat Mess Davanagere. Powered by MessPro System.
          </p>

          <Link to="/login" className="text-emerald-400 hover:underline font-bold">
            Portal Sign In →
          </Link>
        </div>
      </footer>
    </div>
  )
}
