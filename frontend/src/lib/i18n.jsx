import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { translit } from './translit.js';

const I18nContext = createContext(null);

const DICT = {
  uz: {
    // Navigation
    home: 'Bosh sahifa',
    products: 'Mahsulotlar',
    rentals: 'Ijaralar',
    activeRentals: 'Faol ijaralar',
    history: 'Tarix',
    report: 'Hisobot',
    
    // Login
    login_title: 'Kirish',
    username: 'Foydalanuvchi nomi',
    password: 'Parol',
    login: 'Kirish',
    
    // Products
    products_title: 'Mahsulotlar',
    name: 'Nomi',
    daily_price: 'Kunlik narx',
    image: 'Rasm',
    image_url: 'Rasm URL',
    add: 'Qo\'shish',
    adding: 'Qo\'shilmoqda...',
    new_product: 'Yangi mahsulot',
    delete_confirm: 'O\'chirishni tasdiqlaysizmi?',
    edit: 'Tahrirlash',
    save: 'Saqlash',
    cancel: 'Bekor qilish',
    delete_btn: 'O\'chirish',
    no_image: 'Rasm yo\'q',
    per_day: '/kun',
    actions: 'Amallar',
    
    // Rentals
    rentals_title: 'Ijaralar',
    select_product: 'Mahsulot tanlang',
    client_name: 'Mijoz ismi',
    client_phone: 'Telefon raqami',
    start_date: 'Boshlanish sana',
    start_rental: 'Ijara boshlash',
    mark_returned: 'Qaytarildi deb belgilash',
    
    // History
    history_title: 'Tarix',
    rental_history: 'Ijaralar tarixi',
    product: 'Mahsulot',
    client: 'Xaridor',
    phone: 'Telefon',
    start: 'Boshlanish',
    return: 'Qaytish',
    days: 'Kun',
    total: 'Jami',
    
    // Reports
    total_income: 'Jami daromad',
    month: 'Oy',
    monthly: 'Oylik',
    
    // Homepage
    welcome_badge: 'Hush kelibsiz',
    welcome_title: 'Asbob-uskunalarni ijara rejalashtirish',
    welcome_description: 'Rentacloud orqali asbob-uskunalaringizni samarali boshqaring, ijaralarni kuzating va daromadlaringizni hisoblang.',
    view_products: 'Mahsulotlarni ko\'rish',
    manage_rentals: 'Ijaralarni boshqarish',
    products_managed: 'Mahsulot boshqarilmoqda',
    customer_satisfaction: 'Mijozlar qoniqishi',
    get_started: 'Boshlash',
    get_started_description: 'Asbob-uskunalaringizni ijara rejalashtirishni boshlang',
    start_now: 'Hozir boshlash',
    why_choose_us: 'Nega Rentacloud?',
    real_time_analytics: 'Real vaqt analitikasi',
    real_time_analytics_desc: 'Ijaralaringiz va daromadlaringizni real vaqtda kuzatib boring.',
    secure_data: 'Xavfsiz ma\'lumotlar',
    secure_data_desc: 'Barcha ma\'lumotlaringiz ilg\'or shifrlash texnologiyalari bilan himoyalangan.',
    mobile_friendly: 'Mobil qulaylik',
    mobile_friendly_desc: 'Har qanday qurilma orqali ilovamizdan foydalaning.',
    fast_performance: 'Tez ishlash',
    fast_performance_desc: 'Optimallashtirilgan ilova orqali tez va silliq foydalanish.',
    how_it_works: 'Qanday ishlaydi',
    step_add_products: 'Mahsulotlarni qo\'shing',
    step_add_products_desc: 'Asbob-uskunalaringizni katalogga qo\'shing va narxlarni belgilang.',
    step_manage_rentals: 'Ijaralarni boshqaring',
    step_manage_rentals_desc: 'Yangi ijaralarni boshlang va mavjudlarni kuzatib boring.',
    step_track_income: 'Daromadlarni kuzating',
    step_track_income_desc: 'Har bir ijara uchun daromadlaringizni kuzating.',
    step_generate_reports: 'Hisobotlarni yarating',
    step_generate_reports_desc: 'Batafsil hisobotlar yordamida biznesingizni tahlil qiling.',
  }
};

export function I18nProvider({ children }) {
  const [script, setScript] = useState(() => localStorage.getItem('uz_script') || 'latin');
  useEffect(() => { localStorage.setItem('uz_script', script); }, [script]);

  const t = useMemo(() => {
    const base = DICT.uz;
    const translated = {};
    for (const key of Object.keys(base)) translated[key] = translit(base[key], script);
    return (key) => translated[key] || key;
  }, [script]);

  // Provide translit function for dynamic content
  const transliterate = useMemo(() => {
    return (text) => translit(text, script);
  }, [script]);

  const value = useMemo(() => ({ t, script, setScript, transliterate }), [t, script, transliterate]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}