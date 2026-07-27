# 🚀 Universal Training Bypass (training.r-hrd.net)

<p align="center">
  <a href="#thai">🇹🇭 ภาษาไทย</a> | 
  <a href="#english">🇺🇸 English</a>
</p>

---

<div id="thai"></div>

## 🇹🇭 ภาษาไทย (Thai)

สคริปต์ JavaScript สำหรับจำลองความคืบหน้าการรับชมวิดีโอในเว็บไซต์ `training.r-hrd.net` เพื่อการศึกษาและวิจัยระบบ ช่วยให้สามารถข้ามการรับชมวิดีโอเดิมที่เคยผ่านการอบรมมาแล้วได้โดยอัตโนมัติ

### ✨ คุณสมบัติ
- 🔍 **Auto-Detection:** ค้นหาบทเรียนทั้งหมดในหน้าเว็บโดยอัตโนมัติ
- 🔑 **Dynamic Token:** ดึงกุญแจยืนยันตัวตนล่าสุดจากระบบโดยอัตโนมัติ
- 🎓 **Universal Support:** รองรับทุกวิชา ทุกบทเรียน และผู้ใช้งานทุกคน
- ⚡ **Safe Execution:** มีระบบหน่วงเวลา (Delay) เพื่อป้องกันการส่งข้อมูลถี่เกินไปจนระบบขัดข้อง

### ⚠️ คำเตือน
โปรเจกต์นี้จัดทำขึ้นเพื่อ **วัตถุประสงค์ทางการศึกษาและการทดสอบระบบเท่านั้น** ผู้พัฒนาไม่สนับสนุนการใช้งานในทางที่ผิดกฎหมายหรือระเบียบของหน่วยงาน การนำไปใช้งานถือเป็นความรับผิดชอบของผู้ใช้แต่เพียงผู้เดียว

### 🛠️ วิธีใช้งาน
1. **เปิดหน้าบทเรียน:** เข้าไปยังหน้าที่มีรายการวิดีโอที่ต้องการข้าม
2. **เปิด Console:** กดปุ่ม `F12` บนคีย์บอร์ด หรือคลิกขวาแล้วเลือก **"ตรวจสอบ" (Inspect)** จากนั้นเลือกแท็บ **"Console"**
3. **ปลดล็อก Console (ถ้าจำเป็น):** หากเบราว์เซอร์ไม่ยอมให้วางโค้ด ให้พิมพ์คำว่า `allow pasting` แล้วกด `Enter` ก่อน
4. **คัดลอกโค้ด:** คัดลอกเนื้อหาจากไฟล์ในโฟลเดอร์ `scripts/` (เลือก V1, V2, V3 หรือ V4 ตามต้องการ)
5. **รันสคริปต์:** วางโค้ดลงใน Console แล้วกด `Enter`
6. **ยืนยัน:** เมื่อระบบทำงานเสร็จสิ้น ให้คลิกปุ่ม **"คลิกเพื่อยืนยันเสร็จสิ้นการอบรม"** (หากมี)

---

<div id="english"></div>

## 🇺🇸 English

JavaScript script to simulate video progress on `training.r-hrd.net`. Developed for educational and research purposes to help users who have already completed the training bypass redundant video watching.

### ✨ Features
- 🔍 **Auto-Detection:** Automatically scans all lessons on the page.
- 🔑 **Dynamic Token:** Automatically extracts the latest session token.
- 🎓 **Universal Support:** Supports all courses, lessons, and all user accounts.
- ⚡ **Safe Execution:** Includes delays to prevent server-side errors.

### ⚠️ Disclaimer
This project is for **educational and testing purposes only**. The developer does not encourage any misuse or violation of terms of service. Use this script at your own risk.

### 🛠️ How to Use
1. **Open Lesson Page:** Go to the course page containing the video list.
2. **Open Console:** Press `F12` or Right-click -> **"Inspect"** -> **"Console"** tab.
3. **Unlock Console (If needed):** Type `allow pasting` and press `Enter`.
4. **Copy Code:** Copy content from files in `scripts/` folder (Choose V1, V2, V3, or V4).
5. **Run Script:** Paste the code into the Console and press `Enter`.
6. **Confirm:** Click the confirmation button at the bottom of the page once finished.

---

## 📂 โครงสร้างไฟล์ (File Structure)
- `scripts/UniversalBypass_V1.js`: Basic version. ⚠️ *Deprecated*
- `scripts/UniversalBypass_V2.js`: Professional version. ⚠️ *Deprecated*
- `scripts/UniversalBypass_V3.js`: Ghost Pilot version. ⚠️ *Deprecated*
- `scripts/UniversalBypass_V4.js`: Command Center version (Recommended).
- `reference/TraingWatch.js`: Original JS for analysis (obfuscated).
- `reference/new-27.7.2026/TrainingWatch3.js`: New JS for analysis (readable).
- `reference/Simple.TrainingWatch2.html`: Sample HTML structure (old).
- `reference/new-27.7.2026/Simple.TrainingWatch2.html`: Sample HTML structure (new).

---

## 🔍 รายละเอียดแต่ละเวอร์ชัน (Version Details)

### **V1: Basic Edition (The Sprinter)** — ⚠️ Deprecated
- **TH:** ~~ส่งสัญญาณเริ่ม (B) และจบ (E) เกือบทันทีในทุกบทเรียน เหมาะสำหรับระบบที่ไม่มีการตรวจสอบระยะเวลาเรียน (Duration) เน้นความรวดเร็วสูงสุด~~ **ไม่รองรับ TrainingWatch3.js — ใช้ V4 แทน**
- **EN:** ~~Sends 'Begin' and 'End' signals almost immediately.~~ **Does not support TrainingWatch3.js — use V4 instead.**

### **V2: Professional Edition (The Simulator)** — ⚠️ Deprecated
- **TH:** ~~เพิ่มการหน่วงเวลาสั้นๆ (2-3 วินาที) และมีการส่ง Heartbeat เพื่อรักษา Session~~ **ไม่รองรับ TrainingWatch3.js — ใช้ V4 แทน**
- **EN:** ~~Adds short delays and Heartbeat signals.~~ **Does not support TrainingWatch3.js — use V4 instead.**

### **V3: Ghost Pilot Edition (The Stealth Master)** — ⚠️ Deprecated
- **TH:** ~~ดึงเวลาจริงจากคลิป (YouTube API) และจำลองการ "นั่งดูจริง" ทีละบทเรียนตามลำดับ~~ **ไม่รองรับ TrainingWatch3.js — ใช้ V4 แทน**
- **EN:** ~~Extracts actual video duration and simulates real-time learning.~~ **Does not support TrainingWatch3.js — use V4 instead.**

### **V4: Command Center Edition (The All-in-One) - 🌟 Recommended**
- **TH:** อัปเกรดจาก V2 พร้อม **Floating UI Panel (Popup)** สวยๆ แบบ Glassmorphism **รองรับ TrainingWatch3.js (API ใหม่)** มี Dashboard แสดงความคืบหน้าแบบ Real-time, ปรับ Delay ได้, สุ่มเวลาได้, ข้ามบทที่เรียนแล้ว, ปลดล็อคแบบทดสอบ, Pause/Resume, Error Log, Export รายงาน และ Keyboard Shortcut (Ctrl+Shift+B)
- **EN:** Upgraded from V2 with a **beautiful floating Glassmorphism UI Panel**. **Supports TrainingWatch3.js (new API with traineeId).** Real-time progress dashboard, adjustable & randomizable delays, skip completed lessons, unlock quizzes, pause/resume, error logging, export reports, draggable panel, and keyboard shortcuts (Ctrl+Shift+B).

---

## 🤝 การสนับสนุน (Contribution)
หากพบข้อผิดพลาดหรือต้องการเสนอแนะการพัฒนา สามารถสร้าง Issue หรือส่ง Pull Request ได้ตลอดเวลาครับ!
Feel free to open an Issue or submit a Pull Request for any suggestions or bug fixes.
