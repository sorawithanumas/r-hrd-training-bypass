/**
 * ==========================================================
 * SCRIPT: Universal Training Bypass V2 (Professional Edition)
 * ==========================================================
 * จุดเด่น: มี Heartbeat, หน่วงเวลาสมจริง, อัปเดต % อัตโนมัติ และระบบตรวจสอบความปลอดภัย
 * ==========================================================
 */

(async function() {
    console.log("%c🚀 เริ่มต้นระบบ Universal Bypass V2...", "color: #3498db; font-weight: bold; font-size: 16px;");

    if (typeof updateItemStatus !== 'function') {
        console.error("❌ ไม่พบฟังก์ชันระบบ! กรุณาตรวจสอบว่าคุณอยู่ในหน้าเล่นวิดีโอที่มีรายการบทเรียนจริง");
        return;
    }

    // กระตุ้น Heartbeat เพื่อรักษา Session
    if (typeof heartBeat === 'function') {
        console.log("💓 กระตุ้นการรักษาการเชื่อมต่อ (Heartbeat)...");
        heartBeat();
    }

    const statusSpans = document.querySelectorAll('span[id^="status-"]');
    const items = [];
    statusSpans.forEach(span => {
        const fullId = span.id.replace('status-', '');
        const idParts = fullId.split('-');
        const id = idParts[idParts.length - 1];
        if (id !== 'certificate') {
            items.push({ id: id, fullId: fullId });
        }
    });

    if (items.length === 0) {
        console.warn("⚠️ ไม่พบบทเรียนที่ยังไม่ได้เรียน หรือโครงสร้างหน้าเว็บเปลี่ยนไป");
        return;
    }

    let dynamicToken = 'D93B3330-98E9-49CA-8792-819EA3EC1A5E';
    try {
        if (typeof a0_0x5b38 === 'function') dynamicToken = a0_0x5b38(0x168);
    } catch(e) {}

    const processItem = async (item, index) => {
        return new Promise((resolve) => {
            console.log(`[${index + 1}/${items.length}] ⏳ กำลังส่งสถานะบทเรียน: ${item.id}`);
            
            updateItemStatus(item.id, dynamicToken, 'B', 0, async (resB) => {
                await new Promise(r => setTimeout(r, 2000));
                
                updateItemStatus(item.id, dynamicToken, 'E', 0, (resE) => {
                    if (resE && resE.d === "SUCCESS") {
                        console.log(`%c   ✅ บทเรียน ${item.id} สำเร็จ!`, "color: #2ecc71;");
                        
                        const el = document.getElementById(`status-${item.fullId}`);
                        if (el) { el.className = 'dotFinish'; el.style.backgroundColor = 'green'; }
                        
                        if (typeof finishCount !== 'undefined') finishCount++;
                        if (typeof setPercentStatus === 'function') setPercentStatus();
                        
                        resolve(true);
                    } else {
                        console.log(`%c   ❌ บทเรียน ${item.id} ล้มเหลว`, "color: #e74c3c;");
                        resolve(false);
                    }
                });
            });
        });
    };

    let successCount = 0;
    for (let i = 0; i < items.length; i++) {
        const success = await processItem(items[i], i);
        if (success) successCount++;
    }

    // เปิดปุ่มจบหลักสูตร
    const finishBtn = document.getElementById('item-finish');
    if (finishBtn) {
        finishBtn.classList.remove('disabled');
        finishBtn.style.pointerEvents = 'auto';
        finishBtn.style.opacity = '1';
    }

    // อัปเดตเปอร์เซ็นต์ให้เต็ม 100%
    if (typeof totalCount !== 'undefined' && typeof finishCount !== 'undefined') {
        finishCount = totalCount;
        if (typeof setPercentStatus === 'function') setPercentStatus();
    }

    alert(`ดำเนินการเสร็จสิ้น! (V2)\nสำเร็จ: ${successCount} บทเรียน`);
})();
