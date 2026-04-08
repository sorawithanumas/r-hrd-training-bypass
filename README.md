# 🚀 Universal Training Bypass (training.r-hrd.net)

[ไทย] | [English]

สคริปต์ JavaScript สำหรับจำลองความคืบหน้าการรับชมวิดีโอในเว็บไซต์ `training.r-hrd.net` เพื่อการศึกษาและวิจัยระบบ (Educational Purposes Only) ช่วยให้สามารถข้ามการรับชมวิดีโอเดิมที่เคยผ่านการอบรมมาแล้วได้โดยอัตโนมัติ

JavaScript script to simulate video progress on `training.r-hrd.net`. Developed for educational and research purposes to help users who have already completed the training bypass redundant video watching.

---

## ✨ คุณสมบัติ (Features)
- 🔍 **Auto-Detection:** ค้นหาบทเรียนทั้งหมดในหน้าเว็บโดยอัตโนมัติ (Automatically scans all lessons on the page).
- 🔑 **Dynamic Token:** ดึงกุญแจยืนยันตัวตนล่าสุดจากระบบโดยอัตโนมัติ (Automatically extracts the latest session token).
- 🎓 **Universal Support:** รองรับทุกวิชา ทุกบทเรียน และผู้ใช้งานทุกคน (Supports all courses, lessons, and all user accounts).
- ⚡ **Safe Execution:** มีระบบหน่วงเวลา (Delay) เพื่อป้องกันการส่งข้อมูลถี่เกินไปจนระบบขัดข้อง (Includes delays to prevent server-side errors).

---

## ⚠️ คำเตือน (Disclaimer)
**ไทย:** โปรเจกต์นี้จัดทำขึ้นเพื่อ **วัตถุประสงค์ทางการศึกษาและการทดสอบระบบเท่านั้น** ผู้พัฒนาไม่สนับสนุนการใช้งานในทางที่ผิดกฎหมายหรือระเบียบของหน่วยงาน การนำไปใช้งานถือเป็นความรับผิดชอบของผู้ใช้แต่เพียงผู้เดียว

**English:** This project is for **educational and testing purposes only**. The developer does not encourage any misuse or violation of terms of service. Use this script at your own risk.

---

## 🛠️ วิธีใช้งาน (How to Use)

1.  **เปิดหน้าบทเรียน:** เข้าไปยังหน้าที่มีรายการวิดีโอที่ต้องการข้าม (Go to the course page containing the video list).
2.  **เปิด Console:** กดปุ่ม `F12` บนคีย์บอร์ด หรือคลิกขวาแล้วเลือก **"ตรวจสอบ" (Inspect)** จากนั้นเลือกแท็บ **"Console"**.
3.  **ปลดล็อก Console (ถ้าจำเป็น):** หากเบราว์เซอร์ไม่ยอมให้วางโค้ด ให้พิมพ์คำว่า `allow pasting` แล้วกด `Enter` ก่อน (If the browser prevents pasting, type `allow pasting` and press `Enter` first).
4.  **คัดลอกโค้ด:** คัดลอกเนื้อหาทั้งหมดจากไฟล์ [UniversalBypass_V2.js](./scripts/UniversalBypass_V2.js) (แนะนำ) หรือ [UniversalBypass_V1.js](./scripts/UniversalBypass_V1.js) (Copy the entire content of `UniversalBypass_V2.js` or `UniversalBypass_V1.js`).
4.  **รันสคริปต์:** วางโค้ดลงใน Console แล้วกด `Enter` (Paste the code into the Console and press `Enter`).
5.  **ยืนยัน:** เมื่อระบบทำงานเสร็จสิ้น ให้คลิกปุ่ม **"คลิกเพื่อยืนยันเสร็จสิ้นการอบรม"** ที่ด้านล่างสุดของหน้าเว็บ (Once finished, click the confirmation button at the bottom of the page).

---

## 📂 โครงสร้างไฟล์ (File Structure)
- `scripts/UniversalBypass_V1.js`: เวอร์ชันพื้นฐาน เน้นความเร็วและเรียบง่าย (Basic version, simple and fast).
- `scripts/UniversalBypass_V2.js`: เวอร์ชันมืออาชีพ มีระบบจำลองพฤติกรรมมนุษย์และรักษา Session (Professional version with human-like simulation and session heartbeat).
- `reference/TraingWatch.js`: ไฟล์ต้นฉบับสำหรับการวิเคราะห์ (Original JS for analysis).
- `reference/Simple.TrainingWatch2.html`: ตัวอย่างโครงสร้างหน้าเว็บ (Sample HTML structure).

---

## 🚀 เลือกเวอร์ชันที่เหมาะสม (Choosing the right version)
- **V1 (Basic):** เหมาะสำหรับข้ามคลิปจำนวนมากอย่างรวดเร็ว (Best for fast bypassing).
- **V2 (Professional):** แนะนำให้ใช้เวอร์ชันนี้ เนื่องจากปลอดภัยกว่า มีการจำลองการหน่วงเวลาและกระตุ้น Heartbeat เพื่อรักษา Session ไม่ให้หลุด (Recommended, safer with human simulation and session heartbeat).

---

## 🤝 การสนับสนุน (Contribution)
หากพบข้อผิดพลาดหรือต้องการเสนอแนะการพัฒนา สามารถสร้าง Issue หรือส่ง Pull Request ได้ตลอดเวลาครับ!
Feel free to open an Issue or submit a Pull Request for any suggestions or bug fixes.
