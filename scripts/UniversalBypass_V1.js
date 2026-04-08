/**
 * ==========================================================
 * SCRIPT: Universal Training Bypass V1 (Basic Edition)
 * ==========================================================
 * จุดเด่น: เน้นความเรียบง่าย ค้นหาบทเรียนและส่งสถานะทันที
 * ==========================================================
 */

(async function() {
    console.log("🚀 กำลังเริ่ม Universal Bypass V1...");

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

    let dynamicToken = 'D93B3330-98E9-49CA-8792-819EA3EC1A5E';
    try {
        if (typeof a0_0x5b38 === 'function') dynamicToken = a0_0x5b38(0x168);
    } catch(e) {}

    for (const item of items) {
        console.log(`⏳ กำลังจัดการ: ${item.id}`);
        
        // ส่งสถานะเริ่มและจบ (หน่วงเวลา 1.5 วินาที)
        updateItemStatus(item.id, dynamicToken, 'B', 0, () => {});
        await new Promise(r => setTimeout(r, 1500));
        
        updateItemStatus(item.id, dynamicToken, 'E', 0, (res) => {
            if (res && res.d === "SUCCESS") {
                const el = document.getElementById(`status-${item.fullId}`);
                if (el) { el.className = 'dotFinish'; el.style.backgroundColor = 'green'; }
                console.log(`✅ ${item.id} สำเร็จ`);
            }
        });
    }

    alert("ดำเนินการเสร็จสิ้น! (V1)");
})();
