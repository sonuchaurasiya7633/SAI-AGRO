'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sprout, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

const iconMap: Record<string, any> = {
  Sprout,
  TrendingUp,
  Zap,
  ShieldCheck,
  Layers,
  Sparkles,
};

const defaultCategories = [
  {
    title: 'Bio-Fertilizers & Inoculants',
    desc: 'High-potency PSB & Azotobacter microbial cultures that solubilize fixed soil phosphorus and fix atmospheric nitrogen naturally.',
    icon: Sprout,
    href: '/products?category=Bio-Fertilizers',
    color: 'from-emerald-500 to-green-600',
    count: '6 Formulations',
    tag: 'Bio-Active'
  },
  {
    title: 'Plant Growth Regulators (PGR)',
    desc: 'Enriched with cold-water Ascophyllum Nodosum seaweed extract and free L-amino acids to prevent flower dropping and maximize fruit set.',
    icon: TrendingUp,
    href: '/products?category=Plant+Growth+Promoters',
    color: 'from-lime-500 to-emerald-600',
    count: '5 Formulations',
    tag: 'High Growth'
  },
  {
    title: 'Chelated Micronutrients',
    desc: '100% water-soluble EDTA Zinc, Calcium, Boron, and Multi-Micronutrient formulas for instant stomatal absorption and disease immunity.',
    icon: Zap,
    href: '/products?category=Micronutrients',
    color: 'from-amber-500 to-yellow-600',
    count: '4 Formulations',
    tag: '100% EDTA'
  },
  {
    title: 'Bio-Fungicides & Eco-Defense',
    desc: 'Biological antagonists including Trichoderma viride and Pseudomonas that combat Fusarium wilt, root rot, and foliar blights safely.',
    icon: ShieldCheck,
    href: '/products?category=Bio-Fungicides',
    color: 'from-teal-500 to-emerald-700',
    count: '4 Formulations',
    tag: 'Eco Shield'
  },
  {
    title: 'Soil Conditioners & Humic Flakes',
    desc: '98% Potassium Humate and active Fulvic Acid that condition hard saline soils, enhance CEC, and accelerate fibrous root growth.',
    icon: Layers,
    href: '/products?category=Soil+Conditioners',
    color: 'from-amber-600 to-orange-700',
    count: '3 Formulations',
    tag: 'Soil Vitalizer'
  },
  {
    title: 'VAM Mycorrhizal Bio-Granules',
    desc: 'Endo-mycorrhiza encapsulated granules extending plant root foraging area up to 100x into deeper moisture layers.',
    icon: Sparkles,
    href: '/products?category=Specialty+Bio-Granules',
    color: 'from-green-500 to-lime-600',
    count: '3 Formulations',
    tag: 'Root Booster'
  },
];

const colorsList = [
  'from-emerald-500 to-green-600',
  'from-lime-500 to-emerald-600',
  'from-amber-500 to-yellow-600',
  'from-teal-500 to-emerald-700',
  'from-amber-600 to-orange-700',
  'from-green-500 to-lime-600',
];

const tagsList = ['Bio-Active', 'High Growth', '100% EDTA', 'Eco Shield', 'Soil Vitalizer', 'Root Booster'];

export default function ProductCategoriesSection() {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const isLight = theme === 'light';
  const isHindi = language === 'hi';

  const [categories, setCategories] = useState<any[]>(defaultCategories);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories', { cache: 'no-store' });
        const data = await res.json();
        if (data.success && data.categories && data.categories.length > 0) {
          const mapped = data.categories.map((cat: any, idx: number) => {
            const IconComponent = iconMap[cat.iconName] || defaultCategories[idx % defaultCategories.length].icon;
            return {
              title: cat.name,
              desc: cat.description || defaultCategories[idx % defaultCategories.length].desc,
              icon: IconComponent,
              href: `/products?category=${encodeURIComponent(cat.name)}`,
              color: colorsList[idx % colorsList.length],
              count: `${cat.itemCount || 0} ${isHindi ? 'उत्पाद' : 'Formulations'}`,
              tag: tagsList[idx % tagsList.length],
            };
          });
          setCategories(mapped);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, [isHindi]);

  return (
    <section className={`py-16 sm:py-20 transition-colors duration-300 relative ${
      isLight ? 'bg-[#f0f7f2]' : 'bg-[#07130b]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className={`text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full border ${
            isLight 
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
              : 'bg-emerald-950 text-lime-400 border-emerald-800'
          }`}>
            {isHindi ? 'वैज्ञानिक रूप से प्रमाणित उत्पाद पोर्टफोलियो' : 'Comprehensive Agro-Biotech Portfolio'}
          </span>
          <h2 className={`text-3xl sm:text-4xl font-black mt-3 tracking-tight ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            {t('categoriesHeading')}
          </h2>
          <p className={`text-sm sm:text-base mt-3 leading-relaxed ${
            isLight ? 'text-slate-600' : 'text-slate-300'
          }`}>
            {t('categoriesSubheading')}
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden transition-all duration-300 border shadow-lg hover:shadow-2xl hover:-translate-y-1 ${
                isLight 
                  ? 'bg-white border-emerald-100/80 hover:border-emerald-400' 
                  : 'bg-[#0b1f13] border-emerald-800/50 hover:border-lime-400/60'
              }`}
            >
              {/* Top Icon & Badge */}
              <div className="flex items-center justify-between mb-5">
                <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-slate-950 shadow-md group-hover:scale-110 transition-transform`}>
                  <cat.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {cat.tag}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                    isLight 
                      ? 'bg-slate-100 text-slate-700 border-slate-200' 
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                  }`}>
                    {cat.count}
                  </span>
                </div>
              </div>

              {/* Title & Desc */}
              <div className="space-y-2 flex-grow">
                <h3 className={`text-lg sm:text-xl font-black transition tracking-tight ${
                  isLight ? 'text-slate-900 group-hover:text-emerald-700' : 'text-white group-hover:text-lime-300'
                }`}>
                  {cat.title}
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${
                  isLight ? 'text-slate-600' : 'text-slate-300'
                }`}>
                  {cat.desc}
                </p>
              </div>

              {/* Link CTA */}
              <div className={`mt-6 pt-4 border-t flex items-center justify-between text-xs font-extrabold transition ${
                isLight 
                  ? 'border-emerald-100 text-emerald-700 group-hover:text-emerald-900' 
                  : 'border-emerald-900/60 text-lime-400 group-hover:text-white'
              }`}>
                <span>{isHindi ? 'उत्पाद विवरण देखें' : 'View Formulations'}</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition" />
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Callout */}
        <div className="mt-12 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm transition shadow-lg bg-emerald-700 hover:bg-emerald-600 text-white transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>{isHindi ? 'संपूर्ण उत्पाद कैटलॉग ब्राउज़ करें' : 'Browse Full Product Catalog'}</span>
            <ArrowRight className="w-4 h-4 text-lime-300" />
          </Link>
        </div>

      </div>
    </section>
  );
}
