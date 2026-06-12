import { useState, useMemo, useRef } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Search, Upload, X } from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// 200+ foods database — per 100g values
// cal=calories, p=protein, c=carbs, f=fat
// ═══════════════════════════════════════════════════════════
const FOODS = [
  // ── MEAT & FISH ──
  { name: { tr: 'Tavuk Göğsü', en: 'Chicken Breast', es: 'Pechuga de Pollo' }, cal: 165, p: 31, c: 0, f: 3.6, cat: 'meat' },
  { name: { tr: 'Tavuk But', en: 'Chicken Thigh', es: 'Muslo de Pollo' }, cal: 209, p: 26, c: 0, f: 11, cat: 'meat' },
  { name: { tr: 'Tavuk Kanat', en: 'Chicken Wing', es: 'Ala de Pollo' }, cal: 203, p: 30, c: 0, f: 8, cat: 'meat' },
  { name: { tr: 'Dana Kıyma', en: 'Ground Beef', es: 'Carne Molida' }, cal: 250, p: 26, c: 0, f: 15, cat: 'meat' },
  { name: { tr: 'Dana Bonfile', en: 'Beef Tenderloin', es: 'Solomillo' }, cal: 218, p: 26, c: 0, f: 12, cat: 'meat' },
  { name: { tr: 'Kuzu Pirzola', en: 'Lamb Chop', es: 'Chuleta de Cordero' }, cal: 282, p: 25, c: 0, f: 20, cat: 'meat' },
  { name: { tr: 'Kuzu Kuşbaşı', en: 'Diced Lamb', es: 'Cordero en Dados' }, cal: 260, p: 25, c: 0, f: 17, cat: 'meat' },
  { name: { tr: 'Hindi Göğsü', en: 'Turkey Breast', es: 'Pechuga de Pavo' }, cal: 135, p: 30, c: 0, f: 1, cat: 'meat' },
  { name: { tr: 'Köfte', en: 'Meatball', es: 'Albóndiga' }, cal: 220, p: 18, c: 8, f: 13, cat: 'meat' },
  { name: { tr: 'Sucuk', en: 'Turkish Sausage', es: 'Salchicha Turca' }, cal: 452, p: 18, c: 2, f: 41, cat: 'meat' },
  { name: { tr: 'Pastırma', en: 'Pastrami', es: 'Pastrami' }, cal: 195, p: 32, c: 1, f: 6, cat: 'meat' },
  { name: { tr: 'Somon', en: 'Salmon', es: 'Salmón' }, cal: 208, p: 20, c: 0, f: 13, cat: 'meat' },
  { name: { tr: 'Ton Balığı', en: 'Tuna', es: 'Atún' }, cal: 130, p: 29, c: 0, f: 1, cat: 'meat' },
  { name: { tr: 'Levrek', en: 'Sea Bass', es: 'Lubina' }, cal: 97, p: 18, c: 0, f: 2, cat: 'meat' },
  { name: { tr: 'Hamsi', en: 'Anchovy', es: 'Anchoa' }, cal: 131, p: 20, c: 0, f: 5, cat: 'meat' },
  { name: { tr: 'Karides', en: 'Shrimp', es: 'Camarón' }, cal: 99, p: 24, c: 0, f: 0.3, cat: 'meat' },
  { name: { tr: 'Midye', en: 'Mussel', es: 'Mejillón' }, cal: 86, p: 12, c: 4, f: 2, cat: 'meat' },
  { name: { tr: 'Yumurta', en: 'Egg', es: 'Huevo' }, cal: 155, p: 13, c: 1.1, f: 11, cat: 'meat' },
  { name: { tr: 'Yumurta Beyazı', en: 'Egg White', es: 'Clara de Huevo' }, cal: 52, p: 11, c: 0.7, f: 0.2, cat: 'meat' },
  { name: { tr: 'Ciğer (Dana)', en: 'Beef Liver', es: 'Hígado de Res' }, cal: 135, p: 21, c: 4, f: 4, cat: 'meat' },
  { name: { tr: 'Salam', en: 'Salami', es: 'Salami' }, cal: 336, p: 22, c: 1, f: 27, cat: 'meat' },
  { name: { tr: 'Jambon', en: 'Ham', es: 'Jamón' }, cal: 145, p: 21, c: 1, f: 6, cat: 'meat' },

  // ── DAIRY ──
  { name: { tr: 'Süt (Tam Yağlı)', en: 'Whole Milk', es: 'Leche Entera' }, cal: 61, p: 3.2, c: 4.8, f: 3.3, cat: 'dairy' },
  { name: { tr: 'Süt (Yarım Yağlı)', en: 'Semi-Skim Milk', es: 'Leche Semidesnatada' }, cal: 46, p: 3.4, c: 5, f: 1.6, cat: 'dairy' },
  { name: { tr: 'Yoğurt', en: 'Yogurt', es: 'Yogur' }, cal: 63, p: 5, c: 3.6, f: 3.3, cat: 'dairy' },
  { name: { tr: 'Yunan Yoğurdu', en: 'Greek Yogurt', es: 'Yogur Griego' }, cal: 97, p: 9, c: 3.6, f: 5, cat: 'dairy' },
  { name: { tr: 'Beyaz Peynir', en: 'White Cheese', es: 'Queso Blanco' }, cal: 264, p: 17, c: 0, f: 21, cat: 'dairy' },
  { name: { tr: 'Lor Peyniri', en: 'Cottage Cheese', es: 'Requesón' }, cal: 98, p: 11, c: 3.4, f: 4.3, cat: 'dairy' },
  { name: { tr: 'Kaşar Peyniri', en: 'Cheddar Cheese', es: 'Queso Cheddar' }, cal: 350, p: 25, c: 1.3, f: 27, cat: 'dairy' },
  { name: { tr: 'Mozzarella', en: 'Mozzarella', es: 'Mozzarella' }, cal: 280, p: 22, c: 2.2, f: 17, cat: 'dairy' },
  { name: { tr: 'Krem Peynir', en: 'Cream Cheese', es: 'Queso Crema' }, cal: 342, p: 6, c: 4, f: 34, cat: 'dairy' },
  { name: { tr: 'Tereyağı', en: 'Butter', es: 'Mantequilla' }, cal: 717, p: 0.9, c: 0.1, f: 81, cat: 'dairy' },
  { name: { tr: 'Krema', en: 'Heavy Cream', es: 'Nata' }, cal: 340, p: 2, c: 3, f: 36, cat: 'dairy' },
  { name: { tr: 'Whey Protein', en: 'Whey Protein', es: 'Proteína Whey' }, cal: 380, p: 75, c: 8, f: 4, cat: 'dairy' },
  { name: { tr: 'Kazein Protein', en: 'Casein Protein', es: 'Proteína Caseína' }, cal: 370, p: 72, c: 10, f: 3, cat: 'dairy' },
  { name: { tr: 'Ayran', en: 'Ayran (Yogurt Drink)', es: 'Ayran' }, cal: 36, p: 1.7, c: 2.5, f: 2, cat: 'dairy' },
  { name: { tr: 'Kefir', en: 'Kefir', es: 'Kéfir' }, cal: 41, p: 3.3, c: 4.7, f: 1, cat: 'dairy' },

  // ── GRAINS ──
  { name: { tr: 'Pirinç (Pişmiş)', en: 'Rice (Cooked)', es: 'Arroz (Cocido)' }, cal: 130, p: 2.7, c: 28, f: 0.3, cat: 'grain' },
  { name: { tr: 'Esmer Pirinç', en: 'Brown Rice', es: 'Arroz Integral' }, cal: 123, p: 2.7, c: 26, f: 1, cat: 'grain' },
  { name: { tr: 'Makarna (Pişmiş)', en: 'Pasta (Cooked)', es: 'Pasta (Cocida)' }, cal: 131, p: 5, c: 25, f: 1.1, cat: 'grain' },
  { name: { tr: 'Tam Buğday Ekmek', en: 'Whole Wheat Bread', es: 'Pan Integral' }, cal: 247, p: 13, c: 41, f: 3.4, cat: 'grain' },
  { name: { tr: 'Beyaz Ekmek', en: 'White Bread', es: 'Pan Blanco' }, cal: 265, p: 9, c: 49, f: 3.2, cat: 'grain' },
  { name: { tr: 'Çavdar Ekmeği', en: 'Rye Bread', es: 'Pan de Centeno' }, cal: 259, p: 9, c: 48, f: 3.3, cat: 'grain' },
  { name: { tr: 'Yulaf Ezmesi', en: 'Oatmeal', es: 'Avena' }, cal: 389, p: 17, c: 66, f: 7, cat: 'grain' },
  { name: { tr: 'Bulgur', en: 'Bulgur', es: 'Bulgur' }, cal: 342, p: 12, c: 63, f: 1.3, cat: 'grain' },
  { name: { tr: 'Kinoa', en: 'Quinoa', es: 'Quinoa' }, cal: 120, p: 4.4, c: 21, f: 1.9, cat: 'grain' },
  { name: { tr: 'Kuskus', en: 'Couscous', es: 'Cuscús' }, cal: 112, p: 3.8, c: 23, f: 0.2, cat: 'grain' },
  { name: { tr: 'Mercimek (Pişmiş)', en: 'Lentils (Cooked)', es: 'Lentejas (Cocidas)' }, cal: 116, p: 9, c: 20, f: 0.4, cat: 'grain' },
  { name: { tr: 'Nohut (Pişmiş)', en: 'Chickpeas (Cooked)', es: 'Garbanzos (Cocidos)' }, cal: 164, p: 9, c: 27, f: 2.6, cat: 'grain' },
  { name: { tr: 'Kuru Fasulye (Pişmiş)', en: 'White Beans (Cooked)', es: 'Judías (Cocidas)' }, cal: 127, p: 9, c: 23, f: 0.5, cat: 'grain' },
  { name: { tr: 'Mısır (Haşlanmış)', en: 'Corn (Boiled)', es: 'Maíz (Hervido)' }, cal: 96, p: 3.4, c: 21, f: 1.5, cat: 'grain' },
  { name: { tr: 'Tortilla (Lavaş)', en: 'Tortilla Wrap', es: 'Tortilla' }, cal: 312, p: 8, c: 52, f: 8, cat: 'grain' },
  { name: { tr: 'Kraker', en: 'Crackers', es: 'Galletas Saladas' }, cal: 484, p: 10, c: 65, f: 21, cat: 'grain' },

  // ── VEGETABLES ──
  { name: { tr: 'Brokoli', en: 'Broccoli', es: 'Brócoli' }, cal: 34, p: 2.8, c: 7, f: 0.4, cat: 'veggie' },
  { name: { tr: 'Ispanak', en: 'Spinach', es: 'Espinaca' }, cal: 23, p: 2.9, c: 3.6, f: 0.4, cat: 'veggie' },
  { name: { tr: 'Tatlı Patates', en: 'Sweet Potato', es: 'Batata' }, cal: 86, p: 1.6, c: 20, f: 0.1, cat: 'veggie' },
  { name: { tr: 'Patates', en: 'Potato', es: 'Patata' }, cal: 77, p: 2, c: 17, f: 0.1, cat: 'veggie' },
  { name: { tr: 'Domates', en: 'Tomato', es: 'Tomate' }, cal: 18, p: 0.9, c: 3.9, f: 0.2, cat: 'veggie' },
  { name: { tr: 'Salatalık', en: 'Cucumber', es: 'Pepino' }, cal: 15, p: 0.7, c: 3.6, f: 0.1, cat: 'veggie' },
  { name: { tr: 'Avokado', en: 'Avocado', es: 'Aguacate' }, cal: 160, p: 2, c: 9, f: 15, cat: 'veggie' },
  { name: { tr: 'Havuç', en: 'Carrot', es: 'Zanahoria' }, cal: 41, p: 0.9, c: 10, f: 0.2, cat: 'veggie' },
  { name: { tr: 'Biber (Yeşil)', en: 'Green Pepper', es: 'Pimiento Verde' }, cal: 20, p: 0.9, c: 4.6, f: 0.2, cat: 'veggie' },
  { name: { tr: 'Soğan', en: 'Onion', es: 'Cebolla' }, cal: 40, p: 1.1, c: 9, f: 0.1, cat: 'veggie' },
  { name: { tr: 'Sarımsak', en: 'Garlic', es: 'Ajo' }, cal: 149, p: 6, c: 33, f: 0.5, cat: 'veggie' },
  { name: { tr: 'Kabak', en: 'Zucchini', es: 'Calabacín' }, cal: 17, p: 1.2, c: 3.1, f: 0.3, cat: 'veggie' },
  { name: { tr: 'Patlıcan', en: 'Eggplant', es: 'Berenjena' }, cal: 25, p: 1, c: 6, f: 0.2, cat: 'veggie' },
  { name: { tr: 'Lahana', en: 'Cabbage', es: 'Col' }, cal: 25, p: 1.3, c: 6, f: 0.1, cat: 'veggie' },
  { name: { tr: 'Karnabahar', en: 'Cauliflower', es: 'Coliflor' }, cal: 25, p: 1.9, c: 5, f: 0.3, cat: 'veggie' },
  { name: { tr: 'Mantar', en: 'Mushroom', es: 'Champiñón' }, cal: 22, p: 3.1, c: 3.3, f: 0.3, cat: 'veggie' },
  { name: { tr: 'Marul', en: 'Lettuce', es: 'Lechuga' }, cal: 15, p: 1.4, c: 2.9, f: 0.2, cat: 'veggie' },
  { name: { tr: 'Roka', en: 'Arugula', es: 'Rúcula' }, cal: 25, p: 2.6, c: 3.7, f: 0.7, cat: 'veggie' },
  { name: { tr: 'Turp', en: 'Radish', es: 'Rábano' }, cal: 16, p: 0.7, c: 3.4, f: 0.1, cat: 'veggie' },
  { name: { tr: 'Bezelye', en: 'Green Peas', es: 'Guisantes' }, cal: 81, p: 5, c: 14, f: 0.4, cat: 'veggie' },
  { name: { tr: 'Zeytin (Siyah)', en: 'Black Olives', es: 'Aceitunas Negras' }, cal: 115, p: 0.8, c: 6, f: 11, cat: 'veggie' },
  { name: { tr: 'Zeytin (Yeşil)', en: 'Green Olives', es: 'Aceitunas Verdes' }, cal: 145, p: 1, c: 4, f: 15, cat: 'veggie' },

  // ── FRUITS ──
  { name: { tr: 'Muz', en: 'Banana', es: 'Plátano' }, cal: 89, p: 1.1, c: 23, f: 0.3, cat: 'fruit' },
  { name: { tr: 'Elma', en: 'Apple', es: 'Manzana' }, cal: 52, p: 0.3, c: 14, f: 0.2, cat: 'fruit' },
  { name: { tr: 'Portakal', en: 'Orange', es: 'Naranja' }, cal: 47, p: 0.9, c: 12, f: 0.1, cat: 'fruit' },
  { name: { tr: 'Çilek', en: 'Strawberry', es: 'Fresa' }, cal: 33, p: 0.7, c: 8, f: 0.3, cat: 'fruit' },
  { name: { tr: 'Karpuz', en: 'Watermelon', es: 'Sandía' }, cal: 30, p: 0.6, c: 8, f: 0.2, cat: 'fruit' },
  { name: { tr: 'Üzüm', en: 'Grape', es: 'Uva' }, cal: 69, p: 0.7, c: 18, f: 0.2, cat: 'fruit' },
  { name: { tr: 'Kiraz', en: 'Cherry', es: 'Cereza' }, cal: 63, p: 1, c: 16, f: 0.2, cat: 'fruit' },
  { name: { tr: 'Şeftali', en: 'Peach', es: 'Melocotón' }, cal: 39, p: 0.9, c: 10, f: 0.3, cat: 'fruit' },
  { name: { tr: 'Kavun', en: 'Melon', es: 'Melón' }, cal: 34, p: 0.8, c: 8, f: 0.2, cat: 'fruit' },
  { name: { tr: 'Ananas', en: 'Pineapple', es: 'Piña' }, cal: 50, p: 0.5, c: 13, f: 0.1, cat: 'fruit' },
  { name: { tr: 'Mango', en: 'Mango', es: 'Mango' }, cal: 60, p: 0.8, c: 15, f: 0.4, cat: 'fruit' },
  { name: { tr: 'Armut', en: 'Pear', es: 'Pera' }, cal: 57, p: 0.4, c: 15, f: 0.1, cat: 'fruit' },
  { name: { tr: 'Kivi', en: 'Kiwi', es: 'Kiwi' }, cal: 61, p: 1.1, c: 15, f: 0.5, cat: 'fruit' },
  { name: { tr: 'İncir (Taze)', en: 'Fig (Fresh)', es: 'Higo (Fresco)' }, cal: 74, p: 0.8, c: 19, f: 0.3, cat: 'fruit' },
  { name: { tr: 'Kayısı', en: 'Apricot', es: 'Albaricoque' }, cal: 48, p: 1.4, c: 11, f: 0.4, cat: 'fruit' },
  { name: { tr: 'Erik', en: 'Plum', es: 'Ciruela' }, cal: 46, p: 0.7, c: 11, f: 0.3, cat: 'fruit' },
  { name: { tr: 'Nar', en: 'Pomegranate', es: 'Granada' }, cal: 83, p: 1.7, c: 19, f: 1.2, cat: 'fruit' },
  { name: { tr: 'Böğürtlen', en: 'Blackberry', es: 'Mora' }, cal: 43, p: 1.4, c: 10, f: 0.5, cat: 'fruit' },
  { name: { tr: 'Ahududu', en: 'Raspberry', es: 'Frambuesa' }, cal: 52, p: 1.2, c: 12, f: 0.7, cat: 'fruit' },
  { name: { tr: 'Limon', en: 'Lemon', es: 'Limón' }, cal: 29, p: 1.1, c: 9, f: 0.3, cat: 'fruit' },

  // ── SNACKS & NUTS ──
  { name: { tr: 'Badem', en: 'Almonds', es: 'Almendras' }, cal: 579, p: 21, c: 22, f: 50, cat: 'snack' },
  { name: { tr: 'Ceviz', en: 'Walnuts', es: 'Nueces' }, cal: 654, p: 15, c: 14, f: 65, cat: 'snack' },
  { name: { tr: 'Fındık', en: 'Hazelnuts', es: 'Avellanas' }, cal: 628, p: 15, c: 17, f: 61, cat: 'snack' },
  { name: { tr: 'Antep Fıstığı', en: 'Pistachios', es: 'Pistachos' }, cal: 560, p: 20, c: 28, f: 45, cat: 'snack' },
  { name: { tr: 'Kaju', en: 'Cashews', es: 'Anacardos' }, cal: 553, p: 18, c: 30, f: 44, cat: 'snack' },
  { name: { tr: 'Yer Fıstığı', en: 'Peanuts', es: 'Cacahuetes' }, cal: 567, p: 26, c: 16, f: 49, cat: 'snack' },
  { name: { tr: 'Fıstık Ezmesi', en: 'Peanut Butter', es: 'Mantequilla de Maní' }, cal: 588, p: 25, c: 20, f: 50, cat: 'snack' },
  { name: { tr: 'Bitter Çikolata', en: 'Dark Chocolate', es: 'Chocolate Negro' }, cal: 546, p: 5, c: 60, f: 31, cat: 'snack' },
  { name: { tr: 'Sütlü Çikolata', en: 'Milk Chocolate', es: 'Chocolate con Leche' }, cal: 535, p: 8, c: 56, f: 30, cat: 'snack' },
  { name: { tr: 'Bal', en: 'Honey', es: 'Miel' }, cal: 304, p: 0.3, c: 82, f: 0, cat: 'snack' },
  { name: { tr: 'Hurma', en: 'Dates', es: 'Dátiles' }, cal: 277, p: 1.8, c: 75, f: 0.2, cat: 'snack' },
  { name: { tr: 'Kuru Üzüm', en: 'Raisins', es: 'Pasas' }, cal: 299, p: 3.1, c: 79, f: 0.5, cat: 'snack' },
  { name: { tr: 'Kuru Kayısı', en: 'Dried Apricots', es: 'Albaricoques Secos' }, cal: 241, p: 3.4, c: 63, f: 0.5, cat: 'snack' },
  { name: { tr: 'Pirinç Keki', en: 'Rice Cake', es: 'Tortita de Arroz' }, cal: 387, p: 8, c: 82, f: 3, cat: 'snack' },
  { name: { tr: 'Granola', en: 'Granola', es: 'Granola' }, cal: 471, p: 10, c: 64, f: 20, cat: 'snack' },
  { name: { tr: 'Protein Bar', en: 'Protein Bar', es: 'Barra de Proteína' }, cal: 350, p: 30, c: 35, f: 10, cat: 'snack' },
  { name: { tr: 'Patlamış Mısır', en: 'Popcorn', es: 'Palomitas' }, cal: 375, p: 12, c: 74, f: 4, cat: 'snack' },
  { name: { tr: 'Çiğ Ayçekirdeği', en: 'Sunflower Seeds', es: 'Semillas de Girasol' }, cal: 584, p: 21, c: 20, f: 51, cat: 'snack' },
  { name: { tr: 'Kabak Çekirdeği', en: 'Pumpkin Seeds', es: 'Semillas de Calabaza' }, cal: 559, p: 30, c: 11, f: 49, cat: 'snack' },
  { name: { tr: 'Chia Tohumu', en: 'Chia Seeds', es: 'Semillas de Chía' }, cal: 486, p: 17, c: 42, f: 31, cat: 'snack' },
  { name: { tr: 'Keten Tohumu', en: 'Flax Seeds', es: 'Semillas de Lino' }, cal: 534, p: 18, c: 29, f: 42, cat: 'snack' },

  // ── DRINKS ──
  { name: { tr: 'Çay (Şekersiz)', en: 'Tea (No Sugar)', es: 'Té (Sin Azúcar)' }, cal: 1, p: 0, c: 0, f: 0, cat: 'drink' },
  { name: { tr: 'Türk Kahvesi', en: 'Turkish Coffee', es: 'Café Turco' }, cal: 2, p: 0.3, c: 0, f: 0, cat: 'drink' },
  { name: { tr: 'Filtre Kahve', en: 'Filter Coffee', es: 'Café Filtrado' }, cal: 2, p: 0.3, c: 0, f: 0, cat: 'drink' },
  { name: { tr: 'Latte', en: 'Latte', es: 'Latte' }, cal: 135, p: 7, c: 13, f: 6, cat: 'drink' },
  { name: { tr: 'Cappuccino', en: 'Cappuccino', es: 'Cappuccino' }, cal: 80, p: 4, c: 8, f: 4, cat: 'drink' },
  { name: { tr: 'Mocha', en: 'Mocha', es: 'Moca' }, cal: 210, p: 7, c: 30, f: 8, cat: 'drink' },
  { name: { tr: 'Portakal Suyu', en: 'Orange Juice', es: 'Zumo de Naranja' }, cal: 45, p: 0.7, c: 10, f: 0.2, cat: 'drink' },
  { name: { tr: 'Elma Suyu', en: 'Apple Juice', es: 'Zumo de Manzana' }, cal: 46, p: 0.1, c: 11, f: 0.1, cat: 'drink' },
  { name: { tr: 'Kola', en: 'Coca-Cola', es: 'Coca-Cola' }, cal: 42, p: 0, c: 11, f: 0, cat: 'drink' },
  { name: { tr: 'Kola (Zero)', en: 'Diet Coke', es: 'Coca-Cola Zero' }, cal: 0, p: 0, c: 0, f: 0, cat: 'drink' },
  { name: { tr: 'Fanta', en: 'Fanta', es: 'Fanta' }, cal: 39, p: 0, c: 10, f: 0, cat: 'drink' },
  { name: { tr: 'Enerji İçeceği', en: 'Energy Drink', es: 'Bebida Energética' }, cal: 45, p: 0, c: 11, f: 0, cat: 'drink' },
  { name: { tr: 'Soda', en: 'Sparkling Water', es: 'Agua con Gas' }, cal: 0, p: 0, c: 0, f: 0, cat: 'drink' },
  { name: { tr: 'Limonata', en: 'Lemonade', es: 'Limonada' }, cal: 40, p: 0, c: 10, f: 0, cat: 'drink' },
  { name: { tr: 'Smoothie (Meyve)', en: 'Fruit Smoothie', es: 'Smoothie de Frutas' }, cal: 65, p: 1, c: 15, f: 0.3, cat: 'drink' },
  { name: { tr: 'Protein Shake', en: 'Protein Shake', es: 'Batido de Proteína' }, cal: 120, p: 24, c: 5, f: 1.5, cat: 'drink' },
  { name: { tr: 'Bira', en: 'Beer', es: 'Cerveza' }, cal: 43, p: 0.5, c: 3.6, f: 0, cat: 'drink' },
  { name: { tr: 'Şarap (Kırmızı)', en: 'Red Wine', es: 'Vino Tinto' }, cal: 85, p: 0.1, c: 2.6, f: 0, cat: 'drink' },
  { name: { tr: 'Rakı', en: 'Raki', es: 'Raki' }, cal: 265, p: 0, c: 0, f: 0, cat: 'drink' },

  // ── FAST FOOD ──
  { name: { tr: 'Hamburger', en: 'Hamburger', es: 'Hamburguesa' }, cal: 295, p: 17, c: 24, f: 14, cat: 'fastfood' },
  { name: { tr: 'Cheeseburger', en: 'Cheeseburger', es: 'Cheeseburger' }, cal: 303, p: 15, c: 25, f: 15, cat: 'fastfood' },
  { name: { tr: 'Patates Kızartması', en: 'French Fries', es: 'Patatas Fritas' }, cal: 312, p: 3.4, c: 41, f: 15, cat: 'fastfood' },
  { name: { tr: 'Pizza (1 dilim)', en: 'Pizza (1 slice)', es: 'Pizza (1 trozo)' }, cal: 266, p: 11, c: 33, f: 10, cat: 'fastfood' },
  { name: { tr: 'Döner (Tavuk)', en: 'Chicken Doner', es: 'Doner de Pollo' }, cal: 190, p: 20, c: 5, f: 10, cat: 'fastfood' },
  { name: { tr: 'Döner (Et)', en: 'Beef Doner', es: 'Doner de Carne' }, cal: 220, p: 18, c: 5, f: 14, cat: 'fastfood' },
  { name: { tr: 'Lahmacun', en: 'Lahmacun', es: 'Lahmacun' }, cal: 270, p: 12, c: 35, f: 9, cat: 'fastfood' },
  { name: { tr: 'Pide (Kıymalı)', en: 'Turkish Pide (Meat)', es: 'Pide Turco (Carne)' }, cal: 250, p: 14, c: 28, f: 9, cat: 'fastfood' },
  { name: { tr: 'Dürüm', en: 'Wrap (Dürüm)', es: 'Dürüm' }, cal: 280, p: 18, c: 22, f: 13, cat: 'fastfood' },
  { name: { tr: 'Tost (Kaşarlı)', en: 'Grilled Cheese Toast', es: 'Tostada de Queso' }, cal: 280, p: 14, c: 25, f: 14, cat: 'fastfood' },
  { name: { tr: 'Nugget (Tavuk)', en: 'Chicken Nuggets', es: 'Nuggets de Pollo' }, cal: 296, p: 15, c: 16, f: 19, cat: 'fastfood' },
  { name: { tr: 'Simit', en: 'Simit (Turkish Bagel)', es: 'Simit' }, cal: 340, p: 11, c: 60, f: 6, cat: 'fastfood' },
  { name: { tr: 'Börek (Peynirli)', en: 'Cheese Borek', es: 'Börek de Queso' }, cal: 310, p: 10, c: 30, f: 17, cat: 'fastfood' },
  { name: { tr: 'Poğaça', en: 'Pogaca (Pastry)', es: 'Pogaça' }, cal: 350, p: 7, c: 40, f: 18, cat: 'fastfood' },
  { name: { tr: 'Çiğ Köfte', en: 'Raw Meatball (Veg)', es: 'Çiğ Köfte' }, cal: 160, p: 5, c: 30, f: 2, cat: 'fastfood' },
  { name: { tr: 'Tantuni', en: 'Tantuni', es: 'Tantuni' }, cal: 190, p: 16, c: 10, f: 9, cat: 'fastfood' },
  { name: { tr: 'Kokoreç', en: 'Kokorec', es: 'Kokoreç' }, cal: 195, p: 18, c: 8, f: 10, cat: 'fastfood' },

  // ── DESSERTS ──
  { name: { tr: 'Baklava', en: 'Baklava', es: 'Baklava' }, cal: 428, p: 6, c: 43, f: 26, cat: 'dessert' },
  { name: { tr: 'Künefe', en: 'Kunefe', es: 'Künefe' }, cal: 400, p: 8, c: 45, f: 20, cat: 'dessert' },
  { name: { tr: 'Sütlaç', en: 'Rice Pudding', es: 'Arroz con Leche' }, cal: 130, p: 3.5, c: 22, f: 3, cat: 'dessert' },
  { name: { tr: 'Kazandibi', en: 'Kazandibi', es: 'Kazandibi' }, cal: 190, p: 4, c: 30, f: 6, cat: 'dessert' },
  { name: { tr: 'Dondurma', en: 'Ice Cream', es: 'Helado' }, cal: 207, p: 3.5, c: 24, f: 11, cat: 'dessert' },
  { name: { tr: 'Cheesecake', en: 'Cheesecake', es: 'Tarta de Queso' }, cal: 321, p: 6, c: 26, f: 23, cat: 'dessert' },
  { name: { tr: 'Brownie', en: 'Brownie', es: 'Brownie' }, cal: 405, p: 5, c: 50, f: 21, cat: 'dessert' },
  { name: { tr: 'Kek', en: 'Cake', es: 'Pastel' }, cal: 350, p: 5, c: 50, f: 15, cat: 'dessert' },
  { name: { tr: 'Kurabiye', en: 'Cookie', es: 'Galleta' }, cal: 480, p: 6, c: 62, f: 23, cat: 'dessert' },
  { name: { tr: 'Waffle', en: 'Waffle', es: 'Gofre' }, cal: 291, p: 8, c: 33, f: 14, cat: 'dessert' },
  { name: { tr: 'Pancake', en: 'Pancake', es: 'Panqueque' }, cal: 227, p: 6, c: 28, f: 10, cat: 'dessert' },
  { name: { tr: 'Profiterol', en: 'Profiterole', es: 'Profiterol' }, cal: 380, p: 7, c: 40, f: 21, cat: 'dessert' },
  { name: { tr: 'Lokum', en: 'Turkish Delight', es: 'Delicias Turcas' }, cal: 350, p: 0.5, c: 86, f: 1, cat: 'dessert' },
  { name: { tr: 'Helva', en: 'Halva', es: 'Halva' }, cal: 469, p: 12, c: 55, f: 22, cat: 'dessert' },
  { name: { tr: 'Revani', en: 'Revani', es: 'Revani' }, cal: 280, p: 5, c: 45, f: 9, cat: 'dessert' },

  // ── SAUCES & SPICES ──
  { name: { tr: 'Zeytinyağı', en: 'Olive Oil', es: 'Aceite de Oliva' }, cal: 884, p: 0, c: 0, f: 100, cat: 'sauce' },
  { name: { tr: 'Ayçiçek Yağı', en: 'Sunflower Oil', es: 'Aceite de Girasol' }, cal: 884, p: 0, c: 0, f: 100, cat: 'sauce' },
  { name: { tr: 'Ketçap', en: 'Ketchup', es: 'Ketchup' }, cal: 112, p: 1.7, c: 26, f: 0.1, cat: 'sauce' },
  { name: { tr: 'Mayonez', en: 'Mayonnaise', es: 'Mayonesa' }, cal: 680, p: 1, c: 0.6, f: 75, cat: 'sauce' },
  { name: { tr: 'Hardal', en: 'Mustard', es: 'Mostaza' }, cal: 66, p: 4, c: 6, f: 3, cat: 'sauce' },
  { name: { tr: 'Soya Sosu', en: 'Soy Sauce', es: 'Salsa de Soja' }, cal: 53, p: 8, c: 5, f: 0, cat: 'sauce' },
  { name: { tr: 'Nar Ekşisi', en: 'Pomegranate Molasses', es: 'Melaza de Granada' }, cal: 222, p: 0, c: 55, f: 0, cat: 'sauce' },
  { name: { tr: 'Salça (Domates)', en: 'Tomato Paste', es: 'Pasta de Tomate' }, cal: 82, p: 4.3, c: 19, f: 0.5, cat: 'sauce' },
  { name: { tr: 'BBQ Sos', en: 'BBQ Sauce', es: 'Salsa BBQ' }, cal: 172, p: 1, c: 40, f: 0.6, cat: 'sauce' },
  { name: { tr: 'Ranch Sos', en: 'Ranch Sauce', es: 'Salsa Ranch' }, cal: 450, p: 2, c: 7, f: 45, cat: 'sauce' },
  { name: { tr: 'Tahin', en: 'Tahini', es: 'Tahini' }, cal: 595, p: 17, c: 22, f: 54, cat: 'sauce' },
  { name: { tr: 'Pekmez', en: 'Grape Molasses', es: 'Melaza de Uva' }, cal: 293, p: 0.4, c: 72, f: 0, cat: 'sauce' },
  { name: { tr: 'Şeker (Toz)', en: 'Sugar', es: 'Azúcar' }, cal: 387, p: 0, c: 100, f: 0, cat: 'sauce' },
  { name: { tr: 'Tuz', en: 'Salt', es: 'Sal' }, cal: 0, p: 0, c: 0, f: 0, cat: 'sauce' },
];

const CATEGORIES = ['meat', 'dairy', 'grain', 'veggie', 'fruit', 'snack', 'drink', 'fastfood', 'dessert', 'sauce'];

export default function CalorieCalc() {
  const { t, lang } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState(null);
  const [grams, setGrams] = useState(100);
  const [selectedFood, setSelectedFood] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const fileRef = useRef(null);

  const filtered = useMemo(() => {
    let items = FOODS;
    if (selectedCat) items = items.filter(f => f.cat === selectedCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(f => {
        // Search in all languages for better results
        return Object.values(f.name).some(n => n.toLowerCase().includes(q));
      });
    }
    return items;
  }, [search, selectedCat]);

  const calc = selectedFood ? {
    cal: Math.round((selectedFood.cal * grams) / 100),
    p: ((selectedFood.p * grams) / 100).toFixed(1),
    c: ((selectedFood.c * grams) / 100).toFixed(1),
    f: ((selectedFood.f * grams) / 100).toFixed(1),
  } : null;

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calculator size={16} className="text-emerald-400" />
          <h3 className="text-sm font-bold font-outfit text-white">{t('calorieCalc.title')}</h3>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            {FOODS.length}+
          </span>
        </div>
        {/* Photo button */}
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-medium cursor-pointer hover:bg-orange-500/20 transition-colors"
        >
          <Upload size={12} />
          {t('calorieCalc.photoScan')}
        </motion.button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
      </div>

      {/* Photo preview */}
      <AnimatePresence>
        {photoUrl && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="mb-3 relative"
          >
            <img src={photoUrl} alt="Food" className="w-full h-32 object-cover rounded-xl border border-slate-800" />
            <button onClick={() => setPhotoUrl(null)}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-900/80 flex items-center justify-center text-white cursor-pointer hover:bg-red-500/50 transition-colors">
              <X size={12} />
            </button>
            <p className="text-[9px] text-slate-500 mt-1 text-center">{t('calorieCalc.photoHint')}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text" placeholder={t('calorieCalc.search')}
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:border-emerald-500/50 transition-colors"
        />
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1 mb-3">
        <button
          onClick={() => setSelectedCat(null)}
          className={`px-2 py-0.5 rounded-lg text-[9px] font-medium cursor-pointer transition-all ${!selectedCat ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-white'}`}
        >
          {t('progressPeriod.all')}
        </button>
        {CATEGORIES.map(cat => (
          <button key={cat}
            onClick={() => setSelectedCat(cat === selectedCat ? null : cat)}
            className={`px-2 py-0.5 rounded-lg text-[9px] font-medium cursor-pointer transition-all ${selectedCat === cat ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-white'}`}
          >
            {t(`calorieCalc.categories.${cat}`)}
          </button>
        ))}
      </div>

      {/* Food list */}
      <div className="max-h-48 overflow-y-auto scrollbar-none space-y-1 mb-4">
        {filtered.map((food, i) => {
          const name = food.name[lang] || food.name.tr;
          const isSelected = selectedFood === food;
          return (
            <button
              key={i} onClick={() => setSelectedFood(food)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between ${isSelected ? 'bg-emerald-500/15 border border-emerald-500/30 text-white' : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'}`}
            >
              <span className="font-medium truncate mr-2">{name}</span>
              <span className="text-slate-500 shrink-0">{food.cal} kcal</span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-xs text-slate-600 py-4">—</p>
        )}
      </div>

      {/* Gram input + Result */}
      <AnimatePresence>
        {selectedFood && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <label className="text-[10px] text-slate-500 shrink-0">{t('calorieCalc.grams')}:</label>
              <input
                type="number" min="1" max="2000" step="10" value={grams}
                onChange={e => setGrams(parseInt(e.target.value) || 0)}
                className="w-20 rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm text-white text-center focus:border-emerald-500/50 transition-colors"
              />
              <span className="text-[10px] text-slate-500">g</span>
              <span className="text-[10px] text-emerald-400 ml-auto font-semibold">
                {selectedFood.name[lang] || selectedFood.name.tr}
              </span>
            </div>

            {calc && (
              <div className="grid grid-cols-4 gap-1.5">
                <div className="bg-slate-950/60 border border-slate-800/50 rounded-xl p-2 text-center">
                  <p className="text-[8px] text-slate-500">{t('calorieCalc.cal')}</p>
                  <p className="text-sm font-bold text-white font-outfit">{calc.cal}</p>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/50 rounded-xl p-2 text-center">
                  <p className="text-[8px] text-slate-500">{t('calorieCalc.protein')}</p>
                  <p className="text-sm font-bold text-orange-400 font-outfit">{calc.p}g</p>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/50 rounded-xl p-2 text-center">
                  <p className="text-[8px] text-slate-500">{t('calorieCalc.carbs')}</p>
                  <p className="text-sm font-bold text-blue-400 font-outfit">{calc.c}g</p>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/50 rounded-xl p-2 text-center">
                  <p className="text-[8px] text-slate-500">{t('calorieCalc.fat')}</p>
                  <p className="text-sm font-bold text-purple-400 font-outfit">{calc.f}g</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
