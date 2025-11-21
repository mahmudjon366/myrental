import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="fade-in-up" style={{ padding: 8 }}>
      <div className="panel glass" style={{ padding: 20 }}>
        <h1>Maxfiylik siyosati</h1>
        <p style={{ color: 'var(--muted)' }}>
          Ushbu sahifa foydalanuvchilar ma'lumotlarining qanday yig'ilishi, saqlanishi va ishlatilishini
          qisqacha tushuntiradi. Agar savollaringiz bo'lsa, pastdagi aloqa kanallari orqali bog'laning.
        </p>
      </div>

      <div className="panel" style={{ marginTop: 12 }}>
        <h2>Qanday ma'lumotlar yig'iladi?</h2>
        <ul>
          <li>Mahsulotlar va ijaralar bo'yicha xizmat ma'lumotlari</li>
          <li>Foydalanuvchi tomonidan kiritilgan mijoz ismi va telefon raqami</li>
        </ul>
      </div>

      <div className="panel">
        <h2>Ma'lumotlardan foydalanish</h2>
        <p>Ma'lumotlar faqat ijara jarayonlarini yuritish va hisobotlarni shakllantirish uchun ishlatiladi.</p>
      </div>

      <div className="panel">
        <h2>Saqlash va xavfsizlik</h2>
        <p>Ma'lumotlar xavfsiz tarzda saqlashga harakat qilinadi. Maxfiy ma'lumotlar uchinchi tomonlarga berilmaydi.</p>
      </div>

      <div className="panel">
        <h2>Bog'lanish</h2>
        <p>
          Savollar uchun: <a href="mailto:example@gmail.com">example@gmail.com</a> · Tel: <a href="tel:+998919752757">+998 91 975 27 57</a>
        </p>
      </div>
    </div>
  );
}
