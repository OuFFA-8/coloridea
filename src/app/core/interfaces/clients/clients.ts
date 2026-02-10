export interface Clients {
  id: number;
  nameEn: string; // اسم العميل بالإنجليزي
  nameAr: string; // اسم العميل بالعربي
  email: string; // الإيميل للدخول
  password: string; // الباسورد (مبدئياً)
  logoUrl: string; // رابط اللوجو بعد الرفع
  patternId: string; // معرف الباترن المختار (مثلاً pattern-01)
  createdAt: Date;
}
