# Live Demo
URL:
https://attendance-system-indol-xi.vercel.app/login


# 1) ภาพรวมแอป
1. แอปนี้คือระบบลงเวลาเข้า–ออกงานผ่านมือถือ/เว็บ โดยตรวจ 2 เงื่อนไขก่อนลงเวลา:
   - สแกนใบหน้า
   - อยู่ในรัศมีสถานที่ที่อนุญาต
2. ใช้สำหรับเก็บประวัติการลงเวลาของแต่ละคน เพื่อตรวจสอบย้อนหลังได้
3. สามารถดูประวัติการ เข้า ออก ของแต่ละสถานที่ได้
4. สามารถดูประวัติการ เข้า ออก ของแต่ละบุคคลได้


# 2) ฟังก์ชันหลัก
1. ผู้ใช้สมัครสมาชิก / ล็อกอินด้วยอีเมลและรหัสผ่าน
2. ผู้ดูแล (Admin) จัดการสถานที่ลงเวลา (Location):
   - เพิ่ม
   - แก้ไข
   - ลบ
3. ผู้ดูแลกำหนดสิทธิ์ว่า User คนไหนลงเวลาได้ที่ Location ไหน
4. ผู้ใช้เลือกสถานที่ แล้วลงเวลาได้ 4 ประเภทต่อวัน:
   - MORNING_IN
   - LUNCH_OUT
   - AFTERNOON_IN
   - EVENING_OUT
5. ระบบป้องกันการลงเวลาที่ไม่ถูกต้อง:
   - ไม่เจอหน้า → ไม่ให้ลง
   - ไม่อนุญาต Location (หรืออยู่นอกรัศมี) → ไม่ให้ลง
   - ลงซ้ำประเภทเดิมในวันเดียวกัน → ไม่ให้ลง
   - ลงผิดลำดับช่วงเวลา → ไม่ให้ลง


# 3) ผู้ใช้ทั่วไปต้องทำอะไรบ้าง
1. ล็อกอิน
2. เข้าเมนูลงเวลา
3. เลือกสถานที่ที่มีสิทธิ์
4. อนุญาตกล้อง + ตำแหน่ง (Location)
5. เลือกประเภทการลงเวลา แล้วกดบันทึก
6. ตรวจสอบผลในหน้า History


# 4) วิธีเทสระบบ (แนะนำทีละขั้น)
1. ล็อกอินด้วยบัญชี Admin
2. ไปหน้า Location Management แล้วสร้าง Location ใหม่ (ชื่อ + พิกัด + รัศมี เช่น 200m)
3. ไปหน้า Assign Location Access แล้วกำหนดสิทธิ์ User ให้เข้าถึง Location ที่สร้าง
4. ล็อกอินเป็น User
5. ไปหน้าลงเวลา เลือก Location ที่ได้รับสิทธิ์
6. กดอนุญาตกล้องและตำแหน่ง แล้วลองลง MORNING_IN
7. เข้า History เพื่อตรวจว่ามีบันทึกจริง
8. ทดสอบเคสผิดพลาด:
   - ปิดกล้อง / ไม่อนุญาตตำแหน่ง
   - อยู่ไกลเกิน 200 เมตร
   - ลงซ้ำประเภทเดิม
   - ลงข้ามลำดับ (เช่น AFTERNOON_IN ก่อน LUNCH_OUT)


# 5) เงื่อนไขสำคัญก่อนเทส
1. ต้องรันผ่าน https (โดยเฉพาะบนมือถือ) เพื่อให้กล้อง/ตำแหน่งทำงานครบ
2. เบราว์เซอร์ต้องอนุญาต Camera + Geolocation
3. User ต้องมีสิทธิ์ Location จาก Admin ก่อน ไม่งั้นลงเวลาไม่ได้


Tech stack
Frontend: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS + global CSS
Backend (in Next.js): Route Handlers (REST API) บน Node.js runtime
Authentication: Email/Password (custom credentials), bcryptjs (hash password), JWT session ด้วย jose
Database: PostgreSQL
ORM: Prisma (@prisma/client, Prisma Migrate/Seed/Studio)
Face Detection: face-api.js 
Geolocation: Browser Geolocation API (ฝั่ง client) + ตรวจระยะฝั่ง backend ด้วย Haversine formula
Timezone Handling: Asia/Bangkok สำหรับแยกวันลงเวลา
Deployment Target: Vercel (รองรับ HTTPS สำหรับ camera + geolocation)
