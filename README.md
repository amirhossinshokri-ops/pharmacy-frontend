# 🏥 سلامتی‌شاپ — Frontend

React + TypeScript + Tailwind CSS

## ساختار فایل‌ها

```
src/
├── App.tsx                    # روتینگ کامل
├── main.tsx                   # Entry point
├── index.css                  # استایل‌های پایه
├── components/
│   ├── layout/
│   │   ├── MainLayout.tsx     # لایه اصلی (Header + BottomNav + CartDrawer)
│   │   ├── Header.tsx         # هدر با جستجوی real-time
│   │   ├── BottomNav.tsx      # نوار پایین
│   │   └── CartDrawer.tsx     # کشوی سبد خرید
│   └── ui/
│       ├── ProductCard.tsx    # کارت محصول
│       ├── Loading.tsx        # Skeleton + PageLoader
│       └── EmptyState.tsx     # حالت خالی
├── context/
│   ├── AuthContext.tsx        # مدیریت احراز هویت
│   └── CartContext.tsx        # مدیریت سبد و علاقه‌مندی
├── pages/
│   ├── Home.tsx               # صفحه اصلی
│   ├── Products.tsx           # لیست محصولات + فیلتر
│   ├── ProductDetail.tsx      # جزئیات محصول
│   ├── Auth.tsx               # ورود + ثبت‌نام
│   ├── Shop.tsx               # سبد / علاقه‌مندی / پرداخت
│   ├── Profile.tsx            # پروفایل + سفارشات
│   └── admin/
│       ├── Layout.tsx         # لایه پنل ادمین
│       ├── Dashboard.tsx      # داشبورد آماری
│       ├── Products.tsx       # مدیریت محصولات
│       ├── Orders.tsx         # مدیریت سفارشات
│       ├── Users.tsx          # مدیریت کاربران
│       └── Discounts.tsx      # مدیریت کدهای تخفیف
├── services/
│   └── api.ts                 # تمام API callها
└── utils/
    └── helpers.ts             # توابع کمکی
```

## روت‌ها

| مسیر | صفحه |
|------|-------|
| `/` | صفحه اصلی |
| `/products` | لیست محصولات |
| `/products/:slug` | جزئیات محصول |
| `/login` | ورود |
| `/register` | ثبت‌نام |
| `/cart` | سبد خرید |
| `/wishlist` | علاقه‌مندی‌ها |
| `/checkout` | تکمیل سفارش |
| `/profile` | پروفایل کاربر |
| `/admin` | داشبورد مدیر |
| `/admin/products` | مدیریت محصولات |
| `/admin/orders` | مدیریت سفارشات |
| `/admin/users` | مدیریت کاربران |
| `/admin/discounts` | کدهای تخفیف |

## راه‌اندازی

```bash
npm install
npm run dev
# http://localhost:3000
```

بک‌اند باید روی `localhost:5000` در حال اجرا باشد.
