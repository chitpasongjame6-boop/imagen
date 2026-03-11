# วิธี Deploy บน Railway

## ขั้นตอน

### 1. Push โค้ดขึ้น GitHub
1. เปิด GitHub Desktop หรือ git
2. สร้าง repository ใหม่ (ตั้งชื่อ เช่น `simagent`)
3. Push โค้ดทั้งหมดขึ้น GitHub

### 2. สร้าง Project บน Railway
1. ไปที่ [railway.app](https://railway.app)
2. กด **New Project**
3. เลือก **Deploy from GitHub repo**
4. เลือก repository ที่ push ขึ้นไป

### 3. เพิ่ม PostgreSQL Database
1. ใน Project ของ Railway กด **+ New**
2. เลือก **Database → PostgreSQL**
3. Railway จะสร้าง database ให้อัตโนมัติ

### 4. ตั้งค่า Environment Variables
ใน Railway → Project ของคุณ → **Variables** เพิ่ม:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Railway ตั้งให้อัตโนมัติจาก PostgreSQL |
| `JWT_SECRET` | ใส่รหัสลับใดก็ได้ เช่น `mysecret123abc` |
| `NODE_ENV` | `production` |

> **DATABASE_URL**: ไปที่ PostgreSQL service → Variables → คัดลอก `DATABASE_URL`

### 5. Deploy
Railway จะ build และ deploy อัตโนมัติ ใช้เวลา 2-3 นาที

### 6. รับ URL
เมื่อ deploy สำเร็จ Railway จะให้ URL เช่น:
`https://simagent-production.up.railway.app`

แชร์ URL นี้ให้พนักงานทุกคน ✓

---

## บัญชีเริ่มต้น
- **ชื่อ**: แอดมิน
- **PIN**: 0000

> เปลี่ยน PIN หลังจาก login ครั้งแรกที่หน้า "จัดการพนักงาน"
