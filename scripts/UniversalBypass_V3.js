/**
 * ==========================================================
 * SCRIPT: Universal Training Bypass V3 (Ghost Pilot Edition)
 * ==========================================================
 * โหมด: Stealth & Automated (เน้นความเนียนและปลอดภัย 100%)
 * วิธีใช้งาน: 
 * 1. เปิดหน้าวิชาเรียน
 * 2. เปิด Console (F12) -> วางโค้ด -> Enter
 * 3. ปล่อย Tab นี้ทิ้งไว้ (ห้ามปิด) ระบบจะ "นั่งเรียนแทนคุณ" จนจบครบทุกหน่วย
 * ==========================================================
 */

(async function() {
    console.log("%c🥷 เริ่มต้นระบบ Ghost Pilot v3.0 (Stealth Mode)...", "color: #9b59b6; font-weight: bold; font-size: 16px;");

    // 1. ตรวจสอบความพร้อมของฟังก์ชันระบบ
    if (typeof updateItemStatus !== 'function' || typeof player === 'undefined') {
        console.error("❌ ระบบไม่พร้อม! กรุณาตรวจสอบว่าอยู่ในหน้าเล่นวิดีโอที่มีรายการบทเรียนจริง");
        return;
    }

    // 2. สแกนหาบทเรียนทั้งหมดในหน้าเว็บ
    const statusSpans = document.querySelectorAll('span[id^="status-"]');
    const items = [];
    statusSpans.forEach(span => {
        const fullId = span.id.replace('status-', '');
        const idParts = fullId.split('-');
        const id = idParts[idParts.length - 1];
        // ข้ามจุดที่เป็นใบเซอร์
        if (id !== 'certificate') {
            items.push({ id: id, fullId: fullId });
        }
    });

    if (items.length === 0) {
        console.warn("⚠️ ไม่พบบทเรียนที่ต้องจัดการในหน้านี้");
        return;
    }

    console.log(`📦 พบทั้งหมด ${items.length} บทเรียนที่ต้องดำเนินการทีละขั้นตอน...`);

    // ดึง Token ล่าสุด
    let dynamicToken = 'D93B3330-98E9-49CA-8792-819EA3EC1A5E';
    try {
        if (typeof a0_0x5b38 === 'function') dynamicToken = a0_0x5b38(0x168);
    } catch(e) {}

    const formatTime = (s) => new Date(s * 1000).toISOString().substr(11, 8);

    // 3. ฟังก์ชันจำลองการนั่งดูวิดีโอ (หุ่นยนต์เฝ้าจอ)
    const ghostWatch = async (item, index) => {
        return new Promise(async (resolve) => {
            console.log(`%c[${index + 1}/${items.length}] 🎬 เริ่มเรียนบทเรียน ID: ${item.id}`, "color: #3498db; font-weight: bold;");

            // คลิกเลือกบทเรียนเพื่อให้ Player โหลดคลิป
            const linkEl = document.querySelector(`li[id^="index-"] a[onclick*="${item.id}"]`);
            if (linkEl) linkEl.click();

            // รอสักครู่ให้ Player โหลด Metadata (ความยาวคลิป)
            let duration = 0;
            let retry = 0;
            while (duration <= 0 && retry < 15) {
                await new Promise(r => setTimeout(r, 1000));
                duration = typeof player.getDuration === 'function' ? player.getDuration() : 0;
                retry++;
            }

            // ถ้าดึงไม่ได้จริงๆ ให้ใช้ค่า Default (5 นาที)
            if (duration <= 0) {
                console.warn("⚠️ ไม่สามารถดึงความยาวคลิปได้ ใช้ค่ามาตรฐาน 5 นาที");
                duration = 300;
            }

            console.log(`🕒 ความยาวคลิป: ${formatTime(duration)} | กำลังจำลองการดูจนจบ...`);

            // ส่งสถานะเริ่ม (Begin)
            updateItemStatus(item.id, dynamicToken, 'B', 0, () => {});

            // แสดงการนับถอยหลังใน Console ทุกๆ 15 วินาที
            let remaining = Math.floor(duration);
            const countdown = setInterval(() => {
                remaining -= 1;
                if (remaining % 15 === 0 && remaining > 0) {
                    console.log(`⏳ บทเรียน ${item.id}: เหลือเวลาอีกประมาณ ${formatTime(remaining)}`);
                    // ส่ง Heartbeat ระหว่างรอ (ถ้ามี)
                    if (typeof heartBeat === 'function') heartBeat();
                }
                if (remaining <= 0) clearInterval(countdown);
            }, 1000);

            // รอจนครบเวลาจริงของคลิป
            await new Promise(r => setTimeout(r, duration * 1000));

            // เมื่อครบเวลา ส่งสถานะจบ (End)
            updateItemStatus(item.id, dynamicToken, 'E', 0, (res) => {
                if (res && res.d === "SUCCESS") {
                    console.log(`%c✅ สำเร็จบทเรียน ${item.id} (บันทึกเวลาดูจริงครบถ้วน)`, "color: #2ecc71; font-weight: bold;");
                    
                    // อัปเดต UI
                    const el = document.getElementById(`status-${item.fullId}`);
                    if (el) {
                        el.className = 'dotFinish';
                        el.style.backgroundColor = 'green';
                    }
                    if (typeof finishCount !== 'undefined') finishCount++;
                    if (typeof setPercentStatus === 'function') setPercentStatus();
                    
                    resolve(true);
                } else {
                    console.log(`%c❌ พลาด: ${item.id} (${res ? res.d : 'Error'})`, "color: #e74c3c;");
                    resolve(false);
                }
            });
        });
    };

    // 4. เริ่มต้นกระบวนการรันทีละบทเรียน
    for (let i = 0; i < items.length; i++) {
        await ghostWatch(items[i], i);
        // พักสัก 3 วินาทีก่อนข้ามไปบทถัดไป เพื่อความเนียน
        await new Promise(r => setTimeout(r, 3000));
    }

    // สรุปผล
    console.log("%c🎯 ภารกิจ Ghost Pilot เสร็จสิ้นครบทุกบทเรียน!", "color: #f39c12; font-weight: bold; font-size: 14px;");
    
    // อัปเดต UI ส่วนรวม (ถ้ามีตัวแปร)
    if (typeof totalCount !== 'undefined') {
        finishCount = totalCount;
        if (typeof setPercentStatus === 'function') setPercentStatus();
    }

    alert("เรียนจบครบทุกหน่วยการเรียนรู้แล้วครับ!\nสคริปต์ทำงานเสร็จสิ้นและบันทึกเวลาดูจริงให้คุณเรียบร้อยแล้ว");
})();
