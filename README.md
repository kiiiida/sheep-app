# 🐑 مدير قطيع الأغنام — تطبيق الهاتف

تطبيق React Native + Expo + TypeScript لإدارة مشروع تربية الأغنام والشراكة المالية.
نسخة كاملة من 11 قسم، تعمل بالكامل **بدون إنترنت** عبر قاعدة بيانات SQLite محلية على الهاتف.

---

## 📁 بنية المشروع

```
SheepManagerApp/
├── App.tsx                      # نقطة الدخول
├── app.json                     # إعدادات Expo
├── eas.json                     # إعدادات بناء EAS
├── package.json
├── tsconfig.json
├── babel.config.js
└── src/
    ├── services/                # طبقة الوصول لقاعدة البيانات (SQLite) — CRUD لكل كيان
    │   ├── database.ts          #   تهيئة القاعدة + الجداول
    │   ├── partnersService.ts
    │   ├── purchasesService.ts
    │   ├── salesService.ts
    │   ├── birthsService.ts
    │   ├── mortalityService.ts
    │   ├── expensesService.ts
    │   ├── medicinesService.ts
    │   ├── feedService.ts
    │   ├── analyticsService.ts  #   حسابات القطيع + المالية + الرسوم البيانية
    │   ├── reportsService.ts    #   تقارير حسب الفترة + CSV
    │   └── backupService.ts     #   تصدير/استيراد JSON
    │
    ├── screens/                 # 11 شاشة (قسم) كاملة
    │   ├── DashboardScreen.tsx
    │   ├── PartnersScreen.tsx
    │   ├── PurchasesScreen.tsx
    │   ├── SalesScreen.tsx
    │   ├── BirthsScreen.tsx
    │   ├── MortalityScreen.tsx
    │   ├── ExpensesScreen.tsx
    │   ├── MedicinesScreen.tsx
    │   ├── FeedScreen.tsx
    │   ├── ReportsScreen.tsx
    │   └── BackupScreen.tsx
    │
    ├── components/               # مكوّنات مشتركة قابلة لإعادة الاستخدام
    │   ├── StatCard.tsx / StatsGrid.tsx
    │   ├── Card.tsx / Badge.tsx
    │   ├── AppButton.tsx / AppModal.tsx / ConfirmDialog.tsx
    │   ├── FormInput.tsx / FormSelect.tsx / FormDateInput.tsx
    │   ├── DataTable.tsx / SearchFilterBar.tsx / EmptyState.tsx
    │   └── ScreenContainer.tsx / ScreenHeader.tsx
    │
    ├── theme/                    # الألوان والقياسات + Context الوضع الليلي/النهاري
    │   ├── colors.ts
    │   ├── metrics.ts
    │   └── ThemeContext.tsx
    │
    ├── locales/                   # النصوص (عربي RTL فقط حالياً، قابلة للتوسعة)
    │   ├── ar.ts
    │   └── i18n.ts
    │
    ├── navigation/                # الشريط الجانبي (Drawer) والتنقل
    │   ├── DrawerContent.tsx
    │   ├── CustomHeader.tsx
    │   └── RootNavigator.tsx
    │
    ├── types/                     # تعريفات TypeScript لكل الكيانات
    │   └── index.ts
    │
    ├── utils/                     # دوال تنسيق (تاريخ، عملة، أرقام)
    │   └── format.ts
    │
    └── hooks/                     # نظام Toast
        └── useToast.tsx
```

---

## 🚀 التشغيل محلياً (تطوير)

```bash
# 1. تثبيت التبعيات
npm install

# 2. تشغيل خادم Expo
npx expo start

# افتح التطبيق على هاتفك عبر Expo Go (مسح QR) أو على محاكي Android
```

> ⚠️ **إذا ظهر خطأ صامت أو `ERR_MODULE_NOT_FOUND` متعلق بـ `expo-sqlite`** عند تشغيل
> أي أمر Expo CLI (`expo start`, `expo config`, `eas build:configure`)، هذا غالباً
> بسبب نسخة Node.js حديثة جداً (22 أو أحدث) تتعارض مع طريقة تصدير وحدات حزمة
> `expo-sqlite` القديمة. **الحل الموصى به الأسهل: لا تشخّص المشكلة محلياً — استخدم
> طريقة "البناء من GitHub" في القسم التالي**، التي تتجاوز هذه المشكلة بالكامل لأن
> البناء يحدث على خوادم Expo، لا على جهازك.

> ⚠️ **ملاحظة أخرى**: `expo-sqlite` يحتاج بيئة native حقيقية. على **Expo Go** قد تحتاج
> `npx expo start` ثم فتح التطبيق عبر **Development Build** بدل Expo Go العادي إذا واجهت
> مشاكل مع SQLite. الحل الموصى به:
> ```bash
> npx expo install expo-dev-client
> eas build --profile development --platform android
> ```

---

## 📦 بناء ملف APK

### ✅ الطريقة الموصى بها: البناء من GitHub (لا تحتاج أي إعداد محلي)

هذه الطريقة تتجاوز أي مشاكل توافق Node.js/CLI على جهازك، لأن البناء يحدث بالكامل
على خوادم Expo السحابية.

1. أنشئ مستودعاً جديداً على GitHub: `https://github.com/new`
2. ارفع **كل محتوى هذا المجلد** إليه، **باستثناء**:
   - `node_modules/` (لو موجود)
   - `.expo/` (لو موجود)
   - `dist/` (لو موجود)
   - أي مجلد فرعي زائد لم يأتِ مع المشروع الأصلي
3. اذهب إلى `https://expo.dev` → افتح مشروعك (أو أنشئه إن لم يكن موجوداً)
4. من القائمة الجانبية اضغط **Builds**
5. اضغط زر **"Build from GitHub"** (يتطلب ربط حسابك بـ GitHub أول مرة فقط،
   عبر زر **Connect GitHub** إن طلبه الموقع)
6. اختر المستودع الذي رفعته، اختر **Platform: Android**، **Profile: preview**
7. اضغط **Create build / Start build** وانتظر — ستحصل على رابط تحميل APK مباشر
   بعد انتهاء البناء (يستغرق عادة 10-20 دقيقة)

> 💡 تأكد أن ملف `eas.json` ظاهر في جذر المستودع على GitHب (وليس داخل مجلد فرعي)،
> وأن لا يوجد مجلد مكرر يحتوي نسخة ثانية من المشروع — هذا أكثر سبب شائع لرسالة
> `Failed to read "/eas.json"`.

---

### طريقة بديلة: البناء عبر EAS CLI من جهازك

> ⚠️ تتطلب هذه الطريقة تشغيل Expo CLI محلياً، وقد تفشل بصمت على بعض إصدارات
> Node.js الحديثة (22+) بسبب خلل معروف في حزمة `expo-sqlite`. إن واجهت مشكلة،
> ارجع للطريقة الموصى بها أعلاه.

### الخطوة 1: تثبيت EAS CLI (مرة واحدة فقط على جهازك)

```bash
npm install -g eas-cli
```

### الخطوة 2: تسجيل الدخول لحساب Expo

```bash
eas login
```

### الخطوة 3: ربط المشروع بـ EAS (يُنشئ `projectId` تلقائياً)

```bash
eas build:configure
```

هذا يُحدّث `app.json` تلقائياً بحقل `extra.eas.projectId` الصحيح
(الموجود حالياً كقيمة مؤقتة `REPLACE_WITH_YOUR_EAS_PROJECT_ID`).

> إن لم يعمل هذا الأمر، يمكنك تعيين `projectId` يدوياً: أنشئ مشروعاً من
> `https://expo.dev` (زر **Create a project**)، انسخ الـ Project ID الظاهر،
> وضعه يدوياً في `app.json` بدّل القيمة المؤقتة.

### الخطوة 4: بناء APK (نسخة معاينة/تجريبية)

```bash
eas build --platform android --profile preview
```

أو باستخدام الاختصار المُعرّف في `package.json`:

```bash
npm run build:apk
```

سيُعطيك EAS رابط تحميل لملف `.apk` جاهز للتثبيت المباشر على أي جهاز أندرويد (بدون متجر Google Play).

### الخطوة 5 (اختياري): بناء نسخة إنتاج (App Bundle لمتجر Play)

```bash
eas build --platform android --profile production
```

هذا يبني `.aab` (Android App Bundle) للنشر على Google Play، وفقاً لإعدادات `eas.json`.

---

## 🗄️ قاعدة البيانات

التطبيق يستخدم **expo-sqlite** لإنشاء قاعدة بيانات محلية كاملة على الهاتف (`sheep_manager.db`)
تحتوي 8 جداول: `partners`, `purchases`, `sales`, `births`, `mortality`, `expenses`,
`medicines`, `feed_stock`. لا حاجة لإنترنت أو خادم خارجي — كل البيانات تبقى على جهاز المستخدم.

النسخ الاحتياطي والاستيراد (`src/services/backupService.ts`) يصدّران/يستوردان كل البيانات
كملف JSON واحد عبر `expo-file-system` و `expo-sharing` و `expo-document-picker`.

---

## 🎨 الثيم والـ RTL

- التطبيق **عربي بالكامل (RTL)**، يُفرض عبر `I18nManager.forceRTL(true)` في `App.tsx`.
- الألوان مطابقة لنسخة الويب (أخضر داكن + ذهبي)، مُعرّفة في `src/theme/colors.ts`.
- الوضع الليلي/النهاري محفوظ في `AsyncStorage` ويُستعاد تلقائياً عند إعادة فتح التطبيق.

---

## 📝 ملاحظة على بنية الملفات

تم اعتماد بنية `services/ screens/ components/ theme/ locales/` طبقاً لنفس النمط
المستخدم في تطبيقاتك السابقة (Café Manager، إلخ)، لتسهيل الصيانة والتوسعة المستقبلية
بنفس الأسلوب الذي اعتدت عليه.
