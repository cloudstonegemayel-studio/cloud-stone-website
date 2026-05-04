\# Проєкт: Cloud Stone Studio



\## Стек

Next.js 14 App Router · TypeScript strict · Tailwind CSS · Supabase · Vercel · Resend



\## Дизайн

\- Base: 1920×1080px, pixel-perfect з Figma

\- Grid: 8 колонок, margin 30px, gap 20px

\- Напрямні: center 960px, right 1435px

\- Breakpoints: xs(375) sm(640) md(768) lg(1024) xl(1280) 2xl(1440) 3xl(1920)

\- НЕ вигадувати значення — тільки з Figma або через MCP посилання



\## База даних (Supabase)

Таблиці: projects, project\_pages, shop\_items, contact\_submissions

Файл міграції: supabase/migrations/001\_schema.sql



\### projects — ключові поля

\- project\_number (INTEGER) — номер на картці

\- card\_image — фото для картки каталогу

\- cover\_image — головне фото сторінки проєкту

\- slider\_items (JSONB) — слайдер \[{type, url, thumbnail}]

\- project\_status, project\_year, client, site\_area, location, project\_type

\- status: 'draft' | 'published'



\### project\_pages — підсторінки проєкту

\- template: 'text\_with\_photos' | 'full\_photo'

\- layout: 'image\_left' | 'image\_right' | 'image\_top' | 'image\_bottom'

\- background\_color, text\_color

\- images (JSONB): \[{url, alt, width: 1|2}]

\- sort\_order — порядок drag \& drop



\## Правила коду

\- Завжди Server Components якщо не потрібен стан

\- 'use client' тільки там де реально потрібно

\- Supabase server client через src/lib/supabase/server.ts

\- Supabase browser client через src/lib/supabase/client.ts

\- Всі форми: React Hook Form + Zod

\- Анімації: Framer Motion (fadeInUp, staggerContainer)

\- Іконки соцмереж — PNG з /public/icons/social/ (НЕ SVG!)

\- Погода — Elfsight embed (app ID: 8294ddb1-6460-4546-8caf-0266985ad33c)



\## Структура папок

src/app/(public)/ — публічні сторінки

src/app/(admin)/  — CMS (захищено Supabase Auth)

src/app/api/      — API routes

src/components/ui/     — атомарні компоненти

src/components/layout/ — Navbar, Footer, Container, Grid

src/components/sections/ — секції сторінок

src/lib/supabase/  — клієнти БД

src/types/         — TypeScript типи



\## Заборонено

\- НЕ виставляти SUPABASE\_SERVICE\_ROLE\_KEY на клієнт

\- НЕ писати inline styles де є Tailwind клас

\- НЕ конвертувати PNG іконки соцмереж в SVG

\- НЕ створювати api/weather/route.ts (використовується Elfsight)

@AGENTS.md

