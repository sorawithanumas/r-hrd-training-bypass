/**
 * ═══════════════════════════════════════════════════════════
 * SCRIPT: Universal Training Bypass V4 (Command Center Edition)
 * ═══════════════════════════════════════════════════════════
 * อัปเกรดจาก V2 พร้อม Floating UI Panel สวยๆ
 * รองรับทั้ง TrainingWatch.js (เก่า) และ TrainingWatch3.js (ใหม่)
 * ═══════════════════════════════════════════════════════════
 * วิธีใช้:
 *  1. เปิดหน้าวิชาเรียนที่มีรายการวิดีโอ
 *  2. เปิด Console (F12) → วางโค้ดนี้ → Enter
 *  3. ใช้ Panel ลอยที่มุมล่างขวาในการควบคุม
 *  4. กด Ctrl+Shift+B เพื่อเปิด/ซ่อน Panel
 * ═══════════════════════════════════════════════════════════
 */
(async function () {
    'use strict';

    // ═══════════════ PREVENT DUPLICATE ═══════════════
    if (window.__V4_LOADED) {
        const p = document.getElementById('v4-panel');
        if (p) { p.classList.toggle('v4-hidden'); }
        return;
    }
    window.__V4_LOADED = true;

    // ═══════════════ STARTUP BANNER ═══════════════
    console.log('%c\n  ⚡ Universal Training Bypass V4\n  Command Center Edition\n  ',
        'background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; font-size: 14px; padding: 10px 20px; border-radius: 8px; font-weight: bold;');

    // ═══════════════ STATE ═══════════════
    const STATE = {
        isRunning: false,
        isPaused: false,
        items: [],
        currentIndex: -1,
        successCount: 0,
        failCount: 0,
        skippedCount: 0,
        initialDoneCount: 0,
        startTime: null,
        logs: [],
        resumeResolver: null,
        settings: {
            mode: 'speed',
            delayMin: 30,
            delayMax: 60,
            useRandomDelay: true,
            skipCompleted: true,
            unlockQuizzes: true,
            autoHeartbeat: true,
            maxRetries: 3
        },
        isNewApi: false,
        token: '',
        traineeId: '',
        heartbeatInterval: null,
        progressInterval: null,
        countdownTotal: 0,
        countdownRemaining: 0,
        countdownInterval: null,
        durationCache: {}
    };

    // ═══════════════ UTILITIES ═══════════════
    function esc(str) {
        return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function formatTime(seconds) {
        const s = Math.max(0, Math.floor(seconds));
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
        return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    function getDelay() {
        const min = STATE.settings.delayMin * 1000;
        const max = STATE.settings.delayMax * 1000;
        if (STATE.settings.useRandomDelay && max > min) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        return min;
    }

    async function smartDelay(ms) {
        const tick = 200;
        let elapsed = 0;
        STATE.countdownTotal = ms;
        STATE.countdownRemaining = ms;
        // Start countdown UI updater
        if (STATE.countdownInterval) clearInterval(STATE.countdownInterval);
        STATE.countdownInterval = setInterval(() => {
            updateCountdownUI();
        }, 100);
        while (elapsed < ms) {
            if (!STATE.isRunning) {
                clearInterval(STATE.countdownInterval); STATE.countdownInterval = null;
                STATE.countdownRemaining = 0;
                throw new Error('STOPPED');
            }
            if (STATE.isPaused) {
                await new Promise(r => { STATE.resumeResolver = r; });
            }
            await new Promise(r => setTimeout(r, tick));
            elapsed += tick;
            STATE.countdownRemaining = Math.max(0, ms - elapsed);
        }
        clearInterval(STATE.countdownInterval); STATE.countdownInterval = null;
        STATE.countdownRemaining = 0;
        updateCountdownUI();
    }

    function maskToken(t) {
        if (!t || t.length < 8) return '****';
        return t.substring(0, 4) + '···' + t.substring(t.length - 4);
    }

    function playBeep() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            [800, 1000, 1200].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.4);
                osc.start(ctx.currentTime + i * 0.15);
                osc.stop(ctx.currentTime + i * 0.15 + 0.4);
            });
        } catch (e) { /* silent fail */ }
    }

    // ═══════════════ LOGGING ═══════════════
    const LOG_COLORS = { info: '#94a3b8', success: '#10b981', warning: '#f59e0b', error: '#ef4444' };

    function addLog(msg, type = 'info') {
        const time = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const entry = { time, msg, type };
        STATE.logs.push(entry);
        console.log(`%c[V4 ${time}] ${msg}`, `color: ${LOG_COLORS[type] || '#e2e8f0'}`);
        renderLogEntry(entry);
    }

    function renderLogEntry(entry) {
        const c = document.getElementById('v4-log-container');
        if (!c) return;
        const div = document.createElement('div');
        div.className = 'v4-log-entry';
        div.innerHTML = `<span style="color:#475569">[${entry.time}]</span> <span style="color:${LOG_COLORS[entry.type]}">${esc(entry.msg)}</span>`;
        c.appendChild(div);
        c.scrollTop = c.scrollHeight;
    }

    // ═══════════════ API DETECTION ═══════════════
    function detectApi() {
        STATE.isNewApi = typeof window.traineeId !== 'undefined' && typeof window.token !== 'undefined';
        if (STATE.isNewApi) {
            STATE.traineeId = window.traineeId;
            STATE.token = window.token;
            addLog('🔑 ตรวจพบ API ใหม่ (TrainingWatch3)', 'info');
            addLog(`👤 TraineeId: ${STATE.traineeId}`, 'info');
        } else {
            try {
                STATE.token = typeof a0_0x5b38 === 'function' ? a0_0x5b38(0x168) : 'D93B3330-98E9-49CA-8792-819EA3EC1A5E';
            } catch (e) {
                STATE.token = 'D93B3330-98E9-49CA-8792-819EA3EC1A5E';
            }
            STATE.traineeId = '';
            addLog('🔑 ตรวจพบ API เดิม (TrainingWatch)', 'info');
        }
        addLog(`🔐 Token: ${maskToken(STATE.token)}`, 'info');
    }

    // ═══════════════ LESSON SCANNER ═══════════════
    function extractYouTubeId(onclickStr) {
        const m = onclickStr.match(/youtube\.com\/embed\/([\w-]+)/);
        return m ? m[1] : null;
    }

    async function fetchVideoDuration(videoId) {
        if (STATE.durationCache[videoId]) return STATE.durationCache[videoId];
        try {
            const resp = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
            const data = await resp.json();
            // noembed doesn't return duration, try YouTube oEmbed
        } catch (e) { /* silent */ }
        // Fallback: use YouTube IFrame API if available on page
        try {
            const iframe = document.querySelector(`iframe[src*="${videoId}"]`);
            if (iframe && iframe.contentWindow) {
                // postMessage approach
                return await new Promise((resolve) => {
                    const timeout = setTimeout(() => resolve(null), 3000);
                    const handler = (e) => {
                        try {
                            const d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
                            if (d && d.info && d.info.duration) {
                                clearTimeout(timeout);
                                window.removeEventListener('message', handler);
                                STATE.durationCache[videoId] = Math.floor(d.info.duration);
                                resolve(Math.floor(d.info.duration));
                            }
                        } catch (ex) { /* ignore */ }
                    };
                    window.addEventListener('message', handler);
                    iframe.contentWindow.postMessage(JSON.stringify({ event: 'listening' }), '*');
                    iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'getVideoData' }), '*');
                });
            }
        } catch (e) { /* silent */ }
        return null;
    }

    function generateRealisticDuration() {
        // Random between 5-20 min, weighted toward 8-12 min
        const base = 480 + Math.floor(Math.random() * 240); // 8-12 min
        const variance = Math.floor(Math.random() * 180) - 90; // ±90s
        return Math.max(180, base + variance);
    }

    function scanLessons() {
        const spans = document.querySelectorAll('span[id^="status-"]');
        STATE.items = [];
        STATE.successCount = 0; STATE.failCount = 0; STATE.skippedCount = 0; STATE.initialDoneCount = 0;

        spans.forEach(span => {
            const fullId = span.id.replace('status-', '');
            if (fullId === 'certificate') return;

            const parentA = span.closest('a');
            const onclick = parentA ? (parentA.getAttribute('onclick') || '') : '';

            let type = 'video';
            if (onclick.includes('downloadItem')) type = 'document';
            else if (onclick.includes('showQuestion')) type = 'quiz';

            // Extract YouTube video ID from onclick
            const videoId = extractYouTubeId(onclick);

            const name = parentA ? parentA.textContent.replace(/\s+/g, ' ').trim() : `Item ${fullId}`;
            const idParts = fullId.split('-');
            const itemId = idParts[idParts.length - 1];
            const parentLi = span.closest('li[id^="index-"]');
            const liIndex = parentLi ? parentLi.id.replace('index-', '') : '0';
            const isCompleted = span.className.includes('dotFinish');

            if (isCompleted) { STATE.successCount++; STATE.initialDoneCount++; }

            STATE.items.push({
                fullId, itemId, type, name, index: liIndex,
                status: isCompleted ? 'done' : 'pending',
                spanEl: span, liEl: parentLi, linkEl: parentA,
                videoId: videoId,
                duration: null
            });
        });

        const vids = STATE.items.filter(i => i.type === 'video').length;
        const docs = STATE.items.filter(i => i.type === 'document').length;
        const quiz = STATE.items.filter(i => i.type === 'quiz').length;
        const done = STATE.items.filter(i => i.status === 'done').length;
        const withVid = STATE.items.filter(i => i.videoId).length;

        addLog(`📦 สแกนพบ ${STATE.items.length} รายการ (🎬${vids} 📄${docs} 📝${quiz} | ✅${done} เสร็จแล้ว)`, 'info');
        if (withVid > 0) addLog(`🎥 พบ YouTube ID ${withVid} คลิป`, 'info');
    }

    // ═══════════════ STATUS API WRAPPER (with Auto-Retry) ═══════════════
    function sendStatusOnce(itemId, status, duration) {
        return new Promise(resolve => {
            const timeout = setTimeout(() => resolve({ d: 'TIMEOUT' }), 45000);
            const cb = (res) => { clearTimeout(timeout); resolve(res); };
            try {
                if (STATE.isNewApi) {
                    updateItemStatus(STATE.traineeId, itemId, STATE.token, status, duration, cb);
                } else {
                    updateItemStatus(itemId, STATE.token, status, duration, cb);
                }
            } catch (e) {
                clearTimeout(timeout);
                resolve({ d: 'ERROR', error: e.message });
            }
        });
    }

    async function sendStatus(itemId, status, duration) {
        const maxRetries = STATE.settings.maxRetries;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            const res = await sendStatusOnce(itemId, status, duration);
            // Success or non-retryable errors
            if (res.d === 'SUCCESS' || res.d === 'INVALID_COURSE' || res.d === 'WRONG_DURATION') {
                return res;
            }
            // Retryable: TIMEOUT, ERROR, unknown
            if (attempt < maxRetries) {
                const backoff = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s
                addLog(`   🔄 Retry ${attempt + 1}/${maxRetries} (รอ ${backoff/1000}s)...`, 'warning');
                await new Promise(r => setTimeout(r, backoff));
                if (!STATE.isRunning) return res; // stopped during retry
            } else {
                addLog(`   ❌ ล้มเหลวหลัง ${maxRetries} ครั้ง: ${res.d}`, 'error');
                return res;
            }
        }
    }

    // ═══════════════ PROCESS SINGLE ITEM ═══════════════
    async function processItem(item, displayIndex) {
        // Skip quizzes
        if (item.type === 'quiz') {
            item.status = 'skipped'; STATE.skippedCount++;
            addLog(`📝 ข้าม: ${item.name.substring(0, 50)} (แบบทดสอบ)`, 'info');
            renderLessonList(); return 'skipped';
        }

        // Skip completed
        if (STATE.settings.skipCompleted && item.status === 'done') {
            STATE.skippedCount++;
            addLog(`⏭️ ข้าม: ${item.name.substring(0, 50)} (เสร็จแล้ว)`, 'info');
            renderLessonList(); return 'skipped';
        }

        item.status = 'running';
        STATE.currentIndex = displayIndex;
        renderLessonList(); updateProgressUI();

        const icon = item.type === 'video' ? '🎬' : '📄';
        addLog(`${icon} [${displayIndex + 1}/${STATE.items.length}] ${item.name.substring(0, 50)}`, 'info');

        // Fetch smart duration for ALL video items (used in both modes)
        let smartDur = null;
        if (item.type === 'video') {
            smartDur = item.duration;
            if (!smartDur && item.videoId) {
                addLog('   🎥 กำลังดึงความยาวคลิป...', 'info');
                smartDur = await fetchVideoDuration(item.videoId);
                item.duration = smartDur;
            }
            if (!smartDur) {
                smartDur = generateRealisticDuration();
                addLog(`   ⚠️ ดึงเวลาจริงไม่ได้ ใช้ค่าจำลอง ${formatTime(smartDur)}`, 'warning');
            } else {
                addLog(`   🎥 ความยาวคลิป: ${formatTime(smartDur)}`, 'info');
            }
        }

        // Determine wait time and send duration based on mode
        let waitTime, sendDuration;
        if (STATE.settings.mode === 'realistic' && item.type === 'video') {
            // Realistic: wait = actual video duration, send = actual duration
            waitTime = smartDur * 1000;
            sendDuration = smartDur;
        } else {
            // Speed: wait = random delay, send = actual duration (if available) or delay
            waitTime = getDelay();
            sendDuration = smartDur || Math.floor(waitTime / 1000);
        }

        // Send Begin
        addLog('   ➡️ ส่งสถานะ Begin (B)...', 'info');
        const resB = await sendStatus(item.itemId, 'B', 0);

        if (resB.d === 'INVALID_COURSE') {
            addLog('   ❌ INVALID_COURSE — ห้ามเปิดหลายหลักสูตรพร้อมกัน', 'error');
            item.status = 'failed'; STATE.failCount++;
            renderLessonList(); return 'failed';
        }

        // Wait
        const modeLabel = STATE.settings.mode === 'realistic' ? '🎭 Realistic' : '⚡ Speed';
        addLog(`   ⏳ [${modeLabel}] รอ ${formatTime(waitTime / 1000)}...`, 'info');
        try { await smartDelay(waitTime); }
        catch (e) {
            if (e.message === 'STOPPED') { item.status = 'pending'; renderLessonList(); return 'stopped'; }
        }

        // Send End (with smart duration)
        addLog(`   ➡️ ส่งสถานะ End (E) duration=${sendDuration}s...`, 'info');
        const resE = await sendStatus(item.itemId, 'E', sendDuration);

        if (resE && resE.d === 'SUCCESS') {
            item.status = 'done'; STATE.successCount++;
            // Update page UI
            if (item.spanEl) { item.spanEl.className = 'dotFinish'; item.spanEl.style.backgroundColor = 'green'; }
            if (typeof finishCount !== 'undefined') finishCount++;
            if (typeof setPercentStatus === 'function') setPercentStatus();
            // Unlock next
            const nextLi = document.getElementById(`index-${parseInt(item.index) + 1}`);
            if (nextLi) nextLi.classList.remove('disabled');

            addLog('   ✅ สำเร็จ!', 'success');
            renderLessonList(); updateProgressUI();
            return 'success';
        } else {
            const errMsg = resE ? resE.d : 'Unknown Error';
            addLog(`   ❌ ล้มเหลว: ${errMsg}`, 'error');
            item.status = 'failed'; STATE.failCount++;
            renderLessonList(); return 'failed';
        }
    }

    // ═══════════════ MAIN BYPASS ENGINE ═══════════════
    async function runBypass() {
        if (STATE.isRunning) { stopBypass(); return; }

        if (typeof updateItemStatus !== 'function') {
            addLog('❌ ไม่พบ updateItemStatus! ตรวจสอบว่าอยู่ในหน้าเล่นวิดีโอจริง', 'error');
            return;
        }

        STATE.isRunning = true; STATE.isPaused = false;
        STATE.startTime = Date.now();
        STATE.failCount = 0; STATE.skippedCount = 0;

        const toProcess = STATE.items.filter(i => {
            if (i.type === 'quiz') return false;
            if (STATE.settings.skipCompleted && i.status === 'done') return false;
            return true;
        });

        addLog(`🚀 เริ่มต้น Bypass V4! (${toProcess.length} รายการ)`, 'success');
        updateButtonStates(); startProgressTimer();

        // Suppress alerts
        const origAlert = window.alert;
        window.alert = (msg) => addLog(`⚠️ [Alert] ${msg}`, 'warning');

        // Heartbeat
        if (STATE.settings.autoHeartbeat && typeof heartBeat === 'function') {
            addLog('💓 เริ่ม Heartbeat อัตโนมัติ', 'info');
            try { heartBeat(); } catch (e) { /* ignore */ }
            STATE.heartbeatInterval = setInterval(() => {
                if (STATE.isRunning) { try { heartBeat(); } catch (e) { /* ignore */ } }
            }, 300000);
        }

        // Process items
        for (let i = 0; i < STATE.items.length; i++) {
            if (!STATE.isRunning) break;
            const result = await processItem(STATE.items[i], i);
            if (result === 'stopped') break;
            if (i < STATE.items.length - 1 && STATE.isRunning) {
                await new Promise(r => setTimeout(r, 500));
            }
        }

        // Cleanup
        STATE.isRunning = false;
        if (STATE.heartbeatInterval) { clearInterval(STATE.heartbeatInterval); STATE.heartbeatInterval = null; }
        stopProgressTimer();
        window.alert = origAlert;

        // Final page updates
        if (typeof totalCount !== 'undefined' && typeof finishCount !== 'undefined') {
            finishCount = STATE.items.filter(i => i.status === 'done' && i.type !== 'quiz').length;
            if (typeof setPercentStatus === 'function') setPercentStatus();
        }

        // Unlock finish button
        const finishBtn = document.getElementById('item-finish');
        if (finishBtn) {
            const nonQuiz = STATE.items.filter(i => i.type !== 'quiz');
            if (nonQuiz.length > 0 && nonQuiz.every(i => i.status === 'done')) {
                finishBtn.classList.remove('disabled');
                finishBtn.className = 'active';
                addLog('🏁 ปลดล็อคปุ่มยืนยันเสร็จสิ้นการอบรม', 'success');
            }
        }

        // Unlock quizzes
        if (STATE.settings.unlockQuizzes) unlockQuizzes();

        // Summary
        const elapsed = formatTime((Date.now() - STATE.startTime) / 1000);
        addLog('', 'info');
        addLog('🎯 ═══ สรุปผล ═══', 'success');
        addLog(`   ✅ สำเร็จ: ${STATE.successCount - STATE.initialDoneCount} (รวมก่อนหน้า: ${STATE.successCount})`, 'success');
        addLog(`   ❌ ล้มเหลว: ${STATE.failCount}`, STATE.failCount > 0 ? 'error' : 'info');
        addLog(`   ⏭️ ข้าม: ${STATE.skippedCount}`, 'info');
        addLog(`   ⏱ เวลา: ${elapsed}`, 'info');
        addLog('═══════════════', 'success');

        updateButtonStates(); updateProgressUI();
        playBeep();
    }

    function stopBypass() {
        STATE.isRunning = false;
        if (STATE.resumeResolver) { STATE.resumeResolver(); STATE.resumeResolver = null; }
        addLog('🛑 หยุดทำงาน', 'warning');
        updateButtonStates();
    }

    function togglePause() {
        if (!STATE.isRunning) return;
        STATE.isPaused = !STATE.isPaused;
        if (!STATE.isPaused && STATE.resumeResolver) {
            STATE.resumeResolver(); STATE.resumeResolver = null;
            addLog('▶️ ทำงานต่อ...', 'info');
        } else {
            addLog('⏸️ หยุดชั่วคราว', 'warning');
        }
        updateButtonStates();
    }

    // ═══════════════ UNLOCK ═══════════════
    function unlockQuizzes() {
        let count = 0;
        STATE.items.forEach(item => {
            if (item.type === 'quiz' && item.liEl) {
                item.liEl.classList.remove('disabled');
                item.liEl.style.pointerEvents = 'auto';
                item.liEl.style.opacity = '1';
                count++;
            }
        });
        // Also search DOM directly for any quiz items we might have missed
        document.querySelectorAll('li[id^="index-"]').forEach(li => {
            const a = li.querySelector('a[onclick*="showQuestion"]');
            if (a && li.classList.contains('disabled')) {
                li.classList.remove('disabled');
                li.style.pointerEvents = 'auto';
                li.style.opacity = '1';
                count++;
            }
        });
        if (count > 0) addLog(`🔓 ปลดล็อคแบบทดสอบ ${count} รายการ`, 'success');
        else addLog('ℹ️ ไม่พบแบบทดสอบที่ต้องปลดล็อค', 'info');
    }

    function unlockAll() {
        let count = 0;
        document.querySelectorAll('li[id^="index-"].disabled').forEach(li => {
            li.classList.remove('disabled');
            li.style.pointerEvents = 'auto';
            li.style.opacity = '1';
            count++;
        });
        // Unlock finish button too
        const fb = document.getElementById('item-finish');
        if (fb && fb.classList.contains('disabled')) {
            fb.classList.remove('disabled'); fb.className = 'active'; count++;
        }
        addLog(`🔓 ปลดล็อคทั้งหมด ${count} รายการ`, 'success');
    }

    // ═══════════════ UI RENDERING ═══════════════
    function renderLessonList() {
        const c = document.getElementById('v4-lesson-list');
        if (!c) return;
        c.innerHTML = STATE.items.map((item, i) => {
            const sc = item.status === 'done' ? 'v4-done' : item.status === 'running' ? 'v4-running' :
                item.status === 'failed' ? 'v4-failed' : item.status === 'skipped' ? 'v4-skipped' : '';
            const ti = item.type === 'video' ? '🎬' : item.type === 'document' ? '📄' : '📝';
            const si = item.status === 'done' ? '✅' : item.status === 'running' ? '⏳' :
                item.status === 'failed' ? '❌' : item.status === 'skipped' ? '⏭️' : '⬜';
            const typeBadge = item.type === 'video' ? 'Video' : item.type === 'document' ? 'Doc' : 'Quiz';
            // Countdown bar for running item
            const countdownHTML = item.status === 'running' ? `
                <div class="v4-cd-wrap">
                    <div class="v4-cd-bar-bg"><div class="v4-cd-bar" id="v4-cd-bar"></div></div>
                    <span class="v4-cd-time" id="v4-cd-time">⏳ กำลังรอ...</span>
                </div>` : '';
            return `<div class="v4-lesson-item ${sc}" id="v4-item-${i}">
                <div class="v4-lesson-row">
                    <span class="v4-lesson-num">${i + 1}</span>
                    <span class="v4-lesson-icon">${ti}</span>
                    <span class="v4-lesson-name" title="${esc(item.name)}">${esc(item.name)}</span>
                    <span class="v4-lesson-badge v4-badge-${item.type}">${typeBadge}</span>
                    <span class="v4-lesson-status">${si}</span>
                </div>${countdownHTML}
            </div>`;
        }).join('');
        // Auto-scroll to current
        if (STATE.currentIndex >= 0) {
            const el = document.getElementById(`v4-item-${STATE.currentIndex}`);
            if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    }

    function updateCountdownUI() {
        const bar = document.getElementById('v4-cd-bar');
        const time = document.getElementById('v4-cd-time');
        if (!bar || !time) return;
        const total = STATE.countdownTotal;
        const rem = STATE.countdownRemaining;
        const pct = total > 0 ? Math.max(0, Math.min(100, ((total - rem) / total) * 100)) : 0;
        bar.style.width = pct + '%';
        if (rem > 0) {
            time.textContent = `⏳ ${(rem / 1000).toFixed(1)}s เหลือ`;
        } else {
            time.textContent = '✅ พร้อม';
        }
    }

    function updateProgressUI() {
        const total = STATE.items.length;
        const done = STATE.items.filter(i => i.status === 'done').length;
        const pct = total > 0 ? Math.round(done / total * 100) : 0;

        const bar = document.getElementById('v4-progress-bar');
        const label = document.getElementById('v4-progress-label');
        const statProg = document.getElementById('v4-stat-progress');
        const statRem = document.getElementById('v4-stat-remaining');

        if (bar) bar.style.width = pct + '%';
        if (label) label.textContent = `${done} / ${total} รายการ`;
        if (statProg) statProg.textContent = pct + '%';
        if (statRem) {
            const rem = STATE.items.filter(i => i.status === 'pending').length;
            statRem.textContent = rem > 0 ? rem : '✅';
        }
    }

    function updateButtonStates() {
        const startBtn = document.getElementById('v4-btn-start');
        const pauseBtn = document.getElementById('v4-btn-pause');
        if (startBtn) {
            if (STATE.isRunning) {
                startBtn.textContent = '⏹ หยุด';
                startBtn.className = 'v4-btn v4-btn-danger';
            } else {
                startBtn.textContent = '▶️ เริ่มต้น';
                startBtn.className = 'v4-btn v4-btn-primary';
            }
        }
        if (pauseBtn) {
            pauseBtn.disabled = !STATE.isRunning;
            pauseBtn.textContent = STATE.isPaused ? '▶️ ทำต่อ' : '⏸ พัก';
        }
    }

    function startProgressTimer() {
        stopProgressTimer();
        STATE.progressInterval = setInterval(() => {
            if (!STATE.startTime || !STATE.isRunning) return;
            const el = document.getElementById('v4-stat-elapsed');
            if (el) el.textContent = formatTime((Date.now() - STATE.startTime) / 1000);
        }, 1000);
    }

    function stopProgressTimer() {
        if (STATE.progressInterval) { clearInterval(STATE.progressInterval); STATE.progressInterval = null; }
    }

    // ═══════════════ EXPORT ═══════════════
    function exportLog() {
        const lines = STATE.logs.map(l => `[${l.time}] [${l.type.toUpperCase()}] ${l.msg}`);
        lines.unshift(`═══ Universal Training Bypass V4 — Log Report ═══`);
        lines.unshift(`Date: ${new Date().toLocaleString('th-TH')}`);
        lines.unshift(`API: ${STATE.isNewApi ? 'TrainingWatch3 (New)' : 'TrainingWatch (Old)'}`);
        lines.unshift(`Items: ${STATE.items.length} | Done: ${STATE.successCount} | Failed: ${STATE.failCount}`);
        lines.unshift('');
        const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `bypass-v4-log-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addLog('📥 บันทึก Log เรียบร้อย', 'success');
    }

    // ═══════════════ INJECT CSS ═══════════════
    function injectCSS() {
        if (document.getElementById('v4-styles')) return;
        const style = document.createElement('style');
        style.id = 'v4-styles';
        style.textContent = `
/* ═══ V4 Command Center — Redesigned ═══ */
#v4-panel *,#v4-fab *{box-sizing:border-box;margin:0;}

#v4-panel{
    position:fixed;bottom:90px;right:20px;width:540px;max-height:680px;
    background:rgba(10,10,28,0.96);
    backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);
    border:1px solid rgba(139,92,246,0.12);border-radius:22px;
    box-shadow:0 30px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.03),0 0 60px rgba(139,92,246,0.06);
    z-index:999999;display:flex;flex-direction:column;overflow:hidden;
    transition:opacity .35s cubic-bezier(.4,0,.2,1),transform .35s cubic-bezier(.4,0,.2,1);
    font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,sans-serif;
    color:#e2e8f0;font-size:14px;line-height:1.6;
}
#v4-panel.v4-hidden{opacity:0;transform:translateY(24px) scale(.92);pointer-events:none;}
#v4-panel.v4-minimized #v4-body,#v4-panel.v4-minimized #v4-footer{display:none!important;}

/* ── Header ── */
.v4-header{
    display:flex;align-items:center;justify-content:space-between;
    padding:16px 22px;
    background:linear-gradient(135deg,rgba(139,92,246,0.12),rgba(99,102,241,0.06),rgba(139,92,246,0.04));
    border-bottom:1px solid rgba(139,92,246,0.1);
    cursor:grab;user-select:none;
}
.v4-header:active{cursor:grabbing;}
.v4-title{font-weight:800;font-size:18px;display:flex;align-items:center;gap:10px;letter-spacing:-0.3px;}
.v4-logo{font-size:22px;filter:drop-shadow(0 0 8px rgba(139,92,246,0.6));}
.v4-badge{font-size:10px;padding:3px 9px;border-radius:8px;background:rgba(139,92,246,0.2);color:#c4b5fd;font-weight:700;letter-spacing:.5px;border:1px solid rgba(139,92,246,0.15);}
.v4-header-actions{display:flex;gap:6px;}
.v4-icon-btn{
    width:30px;height:30px;border:none;background:rgba(255,255,255,0.05);
    color:#64748b;border-radius:9px;cursor:pointer;font-size:14px;
    display:flex;align-items:center;justify-content:center;transition:all .2s;
}
.v4-icon-btn:hover{background:rgba(255,255,255,0.12);color:#e2e8f0;transform:scale(1.05);}

/* ── Body ── */
#v4-body{flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0;}

/* ── Tabs ── */
.v4-tabs{display:flex;padding:6px 20px 0;gap:2px;border-bottom:1px solid rgba(255,255,255,0.04);background:rgba(0,0,0,0.15);}
.v4-tab{
    flex:1;padding:12px 0;border:none;background:transparent;
    color:#475569;font-size:13px;font-weight:700;cursor:pointer;
    border-bottom:2.5px solid transparent;transition:all .2s;font-family:inherit;letter-spacing:0.2px;
}
.v4-tab:hover{color:#94a3b8;background:rgba(255,255,255,0.02);border-radius:8px 8px 0 0;}
.v4-tab.active{color:#c4b5fd;border-bottom-color:#8b5cf6;}

/* ── Tab Panes ── */
.v4-tab-pane{display:none;flex:1;flex-direction:column;overflow-y:auto;padding:18px 22px;min-height:0;}
.v4-tab-pane.active{display:flex;}

/* ── Stats Row ── */
.v4-stats{display:flex;gap:12px;margin-bottom:16px;flex-shrink:0;}
.v4-stat{
    flex:1;text-align:center;padding:14px 8px;
    background:linear-gradient(135deg,rgba(139,92,246,0.06),rgba(99,102,241,0.03));
    border-radius:14px;border:1px solid rgba(139,92,246,0.08);
    transition:border-color .2s;
}
.v4-stat:hover{border-color:rgba(139,92,246,0.2);}
.v4-stat-value{font-size:26px;font-weight:900;background:linear-gradient(135deg,#c4b5fd,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:-0.5px;}
.v4-stat-label{font-size:11px;color:#64748b;margin-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;}

/* ── Progress Bar ── */
.v4-progress-wrap{height:12px;background:rgba(255,255,255,0.04);border-radius:6px;overflow:hidden;margin-bottom:8px;flex-shrink:0;border:1px solid rgba(255,255,255,0.03);}
.v4-progress-bar{
    height:100%;width:0%;border-radius:6px;transition:width .5s ease;
    background:linear-gradient(90deg,#7c3aed,#8b5cf6,#a78bfa,#8b5cf6,#7c3aed);
    background-size:300% 100%;animation:v4shimmer 3s ease infinite;
    box-shadow:0 0 12px rgba(139,92,246,0.3);
}
@keyframes v4shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
.v4-progress-label{text-align:center;font-size:12px;color:#64748b;margin-bottom:12px;flex-shrink:0;font-weight:500;}

/* ── Lesson List ── */
.v4-lesson-list{flex:1;overflow-y:auto;border-radius:12px;background:rgba(0,0,0,0.25);min-height:60px;max-height:280px;border:1px solid rgba(255,255,255,0.03);}
.v4-lesson-item{
    display:flex;flex-direction:column;padding:12px 16px;
    border-bottom:1px solid rgba(255,255,255,0.03);transition:all .2s;
    border-left:3px solid transparent;
}
.v4-lesson-item:last-child{border-bottom:none;}
.v4-lesson-item:hover{background:rgba(255,255,255,0.02);}
.v4-lesson-row{display:flex;align-items:center;gap:10px;width:100%;}
.v4-lesson-item.v4-running{
    background:linear-gradient(135deg,rgba(139,92,246,0.1),rgba(99,102,241,0.05));
    border-left-color:#8b5cf6;
    box-shadow:inset 0 0 20px rgba(139,92,246,0.05);
}
.v4-lesson-item.v4-done{opacity:0.65;}
.v4-lesson-item.v4-done .v4-lesson-name{color:#475569;text-decoration:line-through;}
.v4-lesson-item.v4-failed{border-left-color:#ef4444;background:rgba(239,68,68,0.06);}
.v4-lesson-item.v4-skipped{opacity:0.6;}
.v4-lesson-item.v4-skipped .v4-lesson-name{color:#475569;font-style:italic;}
.v4-lesson-num{font-size:11px;color:#64748b;min-width:24px;text-align:right;font-weight:800;}
.v4-lesson-icon{font-size:16px;flex-shrink:0;}
.v4-lesson-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#cbd5e1;font-size:13px;font-weight:500;}
.v4-lesson-badge{font-size:9px;padding:3px 8px;border-radius:6px;font-weight:700;letter-spacing:.4px;flex-shrink:0;text-transform:uppercase;}
.v4-badge-video{background:rgba(99,102,241,0.15);color:#a5b4fc;border:1px solid rgba(99,102,241,0.1);}
.v4-badge-document{background:rgba(245,158,11,0.12);color:#fcd34d;border:1px solid rgba(245,158,11,0.1);}
.v4-badge-quiz{background:rgba(16,185,129,0.12);color:#6ee7b7;border:1px solid rgba(16,185,129,0.1);}
.v4-lesson-status{font-size:16px;min-width:24px;text-align:center;}

/* ── Countdown Bar (inside running item) ── */
.v4-cd-wrap{
    margin-top:10px;display:flex;align-items:center;gap:12px;
    padding:8px 10px;background:rgba(139,92,246,0.06);border-radius:8px;
    border:1px solid rgba(139,92,246,0.08);
}
.v4-cd-bar-bg{flex:1;height:8px;border-radius:4px;background:rgba(255,255,255,0.06);overflow:hidden;}
.v4-cd-bar{height:100%;border-radius:4px;background:linear-gradient(90deg,#8b5cf6,#a78bfa);transition:width .15s linear;width:0%;box-shadow:0 0 8px rgba(139,92,246,0.3);}
.v4-cd-time{font-size:13px;color:#c4b5fd;font-weight:700;white-space:nowrap;min-width:100px;text-align:right;font-family:'Cascadia Code','Fira Code',Consolas,monospace;}

/* ── Mode Selector ── */
.v4-mode-select{display:flex;gap:10px;}
.v4-mode-option{
    flex:1;display:flex;align-items:center;gap:10px;padding:12px 14px;
    background:rgba(255,255,255,0.02);border:1.5px solid rgba(255,255,255,0.05);
    border-radius:12px;cursor:pointer;transition:all .2s;
}
.v4-mode-option:hover{border-color:rgba(139,92,246,0.2);background:rgba(139,92,246,0.04);}
.v4-mode-option.active{border-color:rgba(139,92,246,0.4);background:rgba(139,92,246,0.08);box-shadow:0 0 12px rgba(139,92,246,0.1);}
.v4-mode-option input[type="radio"]{display:none;}
.v4-mode-icon{font-size:24px;flex-shrink:0;}
.v4-mode-info{display:flex;flex-direction:column;gap:2px;}
.v4-mode-info strong{font-size:14px;color:#e2e8f0;}
.v4-mode-info small{font-size:11px;color:#64748b;font-weight:500;}
.v4-mode-option.active .v4-mode-info strong{color:#c4b5fd;}
.v4-mode-option.active .v4-mode-info small{color:#94a3b8;}

/* ── Settings ── */
.v4-setting-group{margin-bottom:20px;padding:14px 16px;background:rgba(255,255,255,0.02);border-radius:12px;border:1px solid rgba(255,255,255,0.03);}
.v4-setting-title{font-weight:800;font-size:14px;margin-bottom:12px;color:#a78bfa;letter-spacing:0.2px;}
.v4-setting-row{margin-bottom:12px;}
.v4-setting-row:last-child{margin-bottom:0;}
.v4-setting-row>label{display:flex;align-items:center;justify-content:space-between;font-size:13px;color:#94a3b8;margin-bottom:6px;}
.v4-setting-row>label strong{color:#c4b5fd;font-size:15px;background:rgba(139,92,246,0.1);padding:2px 8px;border-radius:6px;}
.v4-slider{
    -webkit-appearance:none;width:100%;height:6px;border-radius:3px;
    background:rgba(255,255,255,0.06);outline:none;cursor:pointer;margin-top:4px;
}
.v4-slider::-webkit-slider-thumb{
    -webkit-appearance:none;width:20px;height:20px;border-radius:50%;
    background:linear-gradient(135deg,#8b5cf6,#6366f1);cursor:pointer;
    box-shadow:0 0 10px rgba(139,92,246,0.5),0 2px 6px rgba(0,0,0,0.3);transition:transform .15s;
    border:2px solid rgba(255,255,255,0.15);
}
.v4-slider::-webkit-slider-thumb:hover{transform:scale(1.2);}
.v4-slider::-moz-range-thumb{
    width:20px;height:20px;border-radius:50%;border:2px solid rgba(255,255,255,0.15);
    background:linear-gradient(135deg,#8b5cf6,#6366f1);cursor:pointer;
}
.v4-checkbox{display:flex;align-items:center;gap:10px;cursor:pointer;padding:6px 0;}
.v4-checkbox input[type="checkbox"]{accent-color:#8b5cf6;width:17px;height:17px;cursor:pointer;flex-shrink:0;}
.v4-checkbox span{font-size:13px;color:#cbd5e1;font-weight:500;}
.v4-info-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.03);}
.v4-info-row:last-child{border-bottom:none;}
.v4-info-label{color:#64748b;font-weight:500;}
.v4-info-value{color:#cbd5e1;font-family:'Cascadia Code','Fira Code',Consolas,monospace;font-size:12px;background:rgba(255,255,255,0.03);padding:2px 8px;border-radius:6px;}

/* ── Logs ── */
.v4-log-container{
    flex:1;overflow-y:auto;max-height:340px;min-height:80px;
    background:rgba(0,0,0,0.35);border-radius:10px;padding:12px 14px;
    font-family:'Cascadia Code','Fira Code',Consolas,monospace;font-size:11.5px;line-height:1.8;
    border:1px solid rgba(255,255,255,0.03);
}
.v4-log-entry{word-break:break-all;padding:1px 0;}
.v4-log-actions{display:flex;gap:8px;margin-top:10px;justify-content:flex-end;flex-shrink:0;}
.v4-btn-sm{
    padding:6px 14px;font-size:12px;background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.06);color:#94a3b8;border-radius:8px;
    cursor:pointer;font-family:inherit;transition:all .2s;font-weight:600;
}
.v4-btn-sm:hover{background:rgba(255,255,255,0.1);color:#e2e8f0;border-color:rgba(255,255,255,0.12);}

/* ── Footer ── */
#v4-footer{
    display:flex;gap:8px;padding:14px 20px;
    border-top:1px solid rgba(139,92,246,0.08);flex-shrink:0;flex-wrap:wrap;
    background:rgba(0,0,0,0.1);
}
.v4-btn{
    padding:10px 16px;border:none;border-radius:10px;font-size:13px;font-weight:700;
    cursor:pointer;transition:all .2s;font-family:inherit;white-space:nowrap;letter-spacing:0.1px;
}
.v4-btn:disabled{opacity:.3;cursor:not-allowed;}
.v4-btn-primary{background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;flex:1;min-width:90px;box-shadow:0 4px 12px rgba(139,92,246,0.25);}
.v4-btn-primary:hover:not(:disabled){box-shadow:0 6px 20px rgba(139,92,246,0.5);transform:translateY(-2px);}
.v4-btn-danger{background:rgba(239,68,68,0.15);color:#f87171;flex:1;min-width:90px;border:1px solid rgba(239,68,68,0.15);}
.v4-btn-danger:hover:not(:disabled){background:rgba(239,68,68,0.25);}
.v4-btn-warning{background:rgba(245,158,11,0.12);color:#fbbf24;min-width:70px;border:1px solid rgba(245,158,11,0.1);}
.v4-btn-warning:hover:not(:disabled){background:rgba(245,158,11,0.22);}
.v4-btn-accent{background:rgba(16,185,129,0.12);color:#34d399;border:1px solid rgba(16,185,129,0.1);}
.v4-btn-accent:hover:not(:disabled){background:rgba(16,185,129,0.22);}
.v4-btn-ghost{background:rgba(255,255,255,0.04);color:#94a3b8;padding:10px 12px;border:1px solid rgba(255,255,255,0.04);}
.v4-btn-ghost:hover{background:rgba(255,255,255,0.08);color:#e2e8f0;border-color:rgba(255,255,255,0.1);}

/* ── FAB ── */
#v4-fab{
    position:fixed;bottom:24px;right:24px;width:56px;height:56px;
    border-radius:18px;border:none;
    background:linear-gradient(135deg,#8b5cf6,#6366f1);
    color:#fff;font-size:24px;cursor:pointer;z-index:999999;
    box-shadow:0 8px 28px rgba(139,92,246,0.4),0 0 0 1px rgba(139,92,246,0.2);
    transition:all .3s ease;display:flex;align-items:center;justify-content:center;
    animation:v4pulse 2.5s infinite;
}
#v4-fab:hover{transform:scale(1.12) rotate(5deg);box-shadow:0 12px 36px rgba(139,92,246,0.55);}
@keyframes v4pulse{
    0%,100%{box-shadow:0 8px 28px rgba(139,92,246,0.4),0 0 0 0 rgba(139,92,246,0.3)}
    50%{box-shadow:0 8px 28px rgba(139,92,246,0.4),0 0 0 14px rgba(139,92,246,0)}
}

/* ── Scrollbar ── */
.v4-lesson-list::-webkit-scrollbar,.v4-log-container::-webkit-scrollbar,.v4-tab-pane::-webkit-scrollbar{width:6px;}
.v4-lesson-list::-webkit-scrollbar-thumb,.v4-log-container::-webkit-scrollbar-thumb,.v4-tab-pane::-webkit-scrollbar-thumb{background:rgba(139,92,246,0.15);border-radius:3px;}
.v4-lesson-list::-webkit-scrollbar-thumb:hover,.v4-log-container::-webkit-scrollbar-thumb:hover,.v4-tab-pane::-webkit-scrollbar-thumb:hover{background:rgba(139,92,246,0.3);}
.v4-lesson-list::-webkit-scrollbar-track,.v4-log-container::-webkit-scrollbar-track,.v4-tab-pane::-webkit-scrollbar-track{background:transparent;}
.v4-lesson-list,.v4-log-container,.v4-tab-pane{scrollbar-width:thin;scrollbar-color:rgba(139,92,246,0.15) transparent;}
`;
        document.head.appendChild(style);
    }

    // ═══════════════ INJECT HTML ═══════════════
    function injectHTML() {
        const wrapper = document.createElement('div');
        wrapper.id = 'v4-wrapper';
        wrapper.innerHTML = `
<div id="v4-panel" class="v4-hidden">
    <div class="v4-header" id="v4-header">
        <div class="v4-title">
            <span class="v4-logo">⚡</span>Bypass V4
            <span class="v4-badge">${STATE.isNewApi ? 'API v3' : 'API v2'}</span>
        </div>
        <div class="v4-header-actions">
            <button id="v4-btn-min" class="v4-icon-btn" title="ย่อ/ขยาย">─</button>
            <button id="v4-btn-close" class="v4-icon-btn" title="ซ่อน (Ctrl+Shift+B)">✕</button>
        </div>
    </div>

    <div id="v4-body">
        <div class="v4-tabs">
            <button class="v4-tab active" data-tab="progress">📊 Progress</button>
            <button class="v4-tab" data-tab="settings">⚙️ ตั้งค่า</button>
            <button class="v4-tab" data-tab="logs">📋 Log</button>
        </div>

        <!-- Progress -->
        <div class="v4-tab-pane active" id="v4-pane-progress">
            <div class="v4-stats">
                <div class="v4-stat"><div class="v4-stat-value" id="v4-stat-progress">0%</div><div class="v4-stat-label">Progress</div></div>
                <div class="v4-stat"><div class="v4-stat-value" id="v4-stat-elapsed">00:00</div><div class="v4-stat-label">เวลาผ่าน</div></div>
                <div class="v4-stat"><div class="v4-stat-value" id="v4-stat-remaining">--</div><div class="v4-stat-label">เหลือ</div></div>
            </div>
            <div class="v4-progress-wrap"><div class="v4-progress-bar" id="v4-progress-bar"></div></div>
            <div class="v4-progress-label" id="v4-progress-label">0 / 0 รายการ</div>
            <div class="v4-lesson-list" id="v4-lesson-list"></div>
        </div>

        <!-- Settings -->
        <div class="v4-tab-pane" id="v4-pane-settings">
            <div class="v4-setting-group">
                <div class="v4-setting-title">🎮 โหมดการทำงาน</div>
                <div class="v4-mode-select">
                    <label class="v4-mode-option ${STATE.settings.mode === 'speed' ? 'active' : ''}" id="v4-mode-speed">
                        <input type="radio" name="v4-mode" value="speed" ${STATE.settings.mode === 'speed' ? 'checked' : ''}>
                        <span class="v4-mode-icon">⚡</span>
                        <span class="v4-mode-info"><strong>Speed</strong><small>สุ่มเวลา delay ตามที่ตั้ง</small></span>
                    </label>
                    <label class="v4-mode-option ${STATE.settings.mode === 'realistic' ? 'active' : ''}" id="v4-mode-realistic">
                        <input type="radio" name="v4-mode" value="realistic" ${STATE.settings.mode === 'realistic' ? 'checked' : ''}>
                        <span class="v4-mode-icon">🎭</span>
                        <span class="v4-mode-info"><strong>Realistic</strong><small>รอตามเวลาจริงของคลิป</small></span>
                    </label>
                </div>
            </div>
            <div class="v4-setting-group" id="v4-speed-settings">
                <div class="v4-setting-title">⏱ ตั้งค่าเวลา Delay <small style="color:#64748b;font-weight:400">(Speed Mode)</small></div>
                <div class="v4-setting-row">
                    <label>Delay ขั้นต่ำ: <strong id="v4-val-min">${STATE.settings.delayMin}</strong>s</label>
                    <input type="range" id="v4-slider-min" min="1" max="120" value="${STATE.settings.delayMin}" class="v4-slider">
                </div>
                <div class="v4-setting-row">
                    <label>Delay สูงสุด: <strong id="v4-val-max">${STATE.settings.delayMax}</strong>s</label>
                    <input type="range" id="v4-slider-max" min="1" max="300" value="${STATE.settings.delayMax}" class="v4-slider">
                </div>
                <div class="v4-setting-row">
                    <label class="v4-checkbox"><input type="checkbox" id="v4-chk-random" ${STATE.settings.useRandomDelay ? 'checked' : ''}><span>สุ่มเวลาระหว่าง Min–Max</span></label>
                </div>
            </div>
            <div class="v4-setting-group">
                <div class="v4-setting-title">🎯 ตัวเลือก</div>
                <div class="v4-setting-row"><label class="v4-checkbox"><input type="checkbox" id="v4-chk-skip" ${STATE.settings.skipCompleted ? 'checked' : ''}><span>ข้ามรายการที่เสร็จแล้ว</span></label></div>
                <div class="v4-setting-row"><label class="v4-checkbox"><input type="checkbox" id="v4-chk-unlock" ${STATE.settings.unlockQuizzes ? 'checked' : ''}><span>ปลดล็อคแบบทดสอบหลังเสร็จ</span></label></div>
                <div class="v4-setting-row"><label class="v4-checkbox"><input type="checkbox" id="v4-chk-hb" ${STATE.settings.autoHeartbeat ? 'checked' : ''}><span>รักษา Session อัตโนมัติ (Heartbeat)</span></label></div>
            </div>
            <div class="v4-setting-group">
                <div class="v4-setting-title">🔑 ข้อมูล Session</div>
                <div class="v4-info-row"><span class="v4-info-label">API Version</span><span class="v4-info-value">${STATE.isNewApi ? 'TrainingWatch3 (ใหม่)' : 'TrainingWatch (เดิม)'}</span></div>
                ${STATE.isNewApi ? `<div class="v4-info-row"><span class="v4-info-label">TraineeId</span><span class="v4-info-value">${esc(STATE.traineeId)}</span></div>` : ''}
                <div class="v4-info-row"><span class="v4-info-label">Token</span><span class="v4-info-value" title="${esc(STATE.token)}">${maskToken(STATE.token)}</span></div>
                <div class="v4-info-row"><span class="v4-info-label">รายการทั้งหมด</span><span class="v4-info-value">${STATE.items.length}</span></div>
                <div class="v4-info-row"><span class="v4-info-label">เสร็จแล้ว</span><span class="v4-info-value">${STATE.initialDoneCount}</span></div>
            </div>
        </div>

        <!-- Logs -->
        <div class="v4-tab-pane" id="v4-pane-logs">
            <div class="v4-log-container" id="v4-log-container"></div>
            <div class="v4-log-actions">
                <button id="v4-btn-clear" class="v4-btn-sm">🗑 Clear</button>
                <button id="v4-btn-copy" class="v4-btn-sm">📋 Copy</button>
            </div>
        </div>
    </div>

    <div id="v4-footer">
        <button id="v4-btn-start" class="v4-btn v4-btn-primary">▶️ เริ่มต้น</button>
        <button id="v4-btn-pause" class="v4-btn v4-btn-warning" disabled>⏸ พัก</button>
        <button id="v4-btn-unlock-quiz" class="v4-btn v4-btn-accent" title="ปลดล็อคแบบทดสอบ">🔓 Quiz</button>
        <button id="v4-btn-unlock-all" class="v4-btn v4-btn-ghost" title="ปลดล็อคทุกรายการ">🔓 All</button>
        <button id="v4-btn-refresh" class="v4-btn v4-btn-ghost" title="สแกนใหม่">🔄</button>
        <button id="v4-btn-export" class="v4-btn v4-btn-ghost" title="Export Log">📥</button>
    </div>
</div>
<button id="v4-fab" title="Toggle Panel (Ctrl+Shift+B)">⚡</button>
`;
        document.body.appendChild(wrapper);
    }

    // ═══════════════ EVENT HANDLERS ═══════════════
    function setupEvents() {
        // FAB toggle
        document.getElementById('v4-fab').addEventListener('click', togglePanel);

        // Close / Minimize
        document.getElementById('v4-btn-close').addEventListener('click', togglePanel);
        document.getElementById('v4-btn-min').addEventListener('click', () => {
            document.getElementById('v4-panel').classList.toggle('v4-minimized');
        });

        // Tabs
        document.querySelectorAll('.v4-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.v4-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.v4-tab-pane').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                const pane = document.getElementById(`v4-pane-${tab.dataset.tab}`);
                if (pane) pane.classList.add('active');
            });
        });

        // Actions
        document.getElementById('v4-btn-start').addEventListener('click', runBypass);
        document.getElementById('v4-btn-pause').addEventListener('click', togglePause);
        document.getElementById('v4-btn-unlock-quiz').addEventListener('click', unlockQuizzes);
        document.getElementById('v4-btn-unlock-all').addEventListener('click', unlockAll);
        document.getElementById('v4-btn-refresh').addEventListener('click', () => {
            scanLessons(); renderLessonList(); updateProgressUI();
            addLog('🔄 สแกนบทเรียนใหม่เสร็จสิ้น', 'info');
        });
        document.getElementById('v4-btn-export').addEventListener('click', exportLog);

        // Log actions
        document.getElementById('v4-btn-clear').addEventListener('click', () => {
            STATE.logs = [];
            const c = document.getElementById('v4-log-container');
            if (c) c.innerHTML = '';
            addLog('🗑 ล้าง Log เรียบร้อย', 'info');
        });
        document.getElementById('v4-btn-copy').addEventListener('click', () => {
            const text = STATE.logs.map(l => `[${l.time}] [${l.type}] ${l.msg}`).join('\n');
            navigator.clipboard.writeText(text).then(() => addLog('📋 คัดลอก Log สำเร็จ', 'success'))
                .catch(() => addLog('❌ ไม่สามารถคัดลอกได้', 'error'));
        });

        // Settings: Sliders
        document.getElementById('v4-slider-min').addEventListener('input', (e) => {
            STATE.settings.delayMin = parseInt(e.target.value);
            document.getElementById('v4-val-min').textContent = STATE.settings.delayMin;
            // Ensure max >= min
            if (STATE.settings.delayMax < STATE.settings.delayMin) {
                STATE.settings.delayMax = STATE.settings.delayMin;
                document.getElementById('v4-slider-max').value = STATE.settings.delayMax;
                document.getElementById('v4-val-max').textContent = STATE.settings.delayMax;
            }
        });
        document.getElementById('v4-slider-max').addEventListener('input', (e) => {
            STATE.settings.delayMax = parseInt(e.target.value);
            document.getElementById('v4-val-max').textContent = STATE.settings.delayMax;
            // Ensure min <= max
            if (STATE.settings.delayMin > STATE.settings.delayMax) {
                STATE.settings.delayMin = STATE.settings.delayMax;
                document.getElementById('v4-slider-min').value = STATE.settings.delayMin;
                document.getElementById('v4-val-min').textContent = STATE.settings.delayMin;
            }
        });

        // Settings: Checkboxes
        document.getElementById('v4-chk-random').addEventListener('change', (e) => { STATE.settings.useRandomDelay = e.target.checked; });
        document.getElementById('v4-chk-skip').addEventListener('change', (e) => { STATE.settings.skipCompleted = e.target.checked; });
        document.getElementById('v4-chk-unlock').addEventListener('change', (e) => { STATE.settings.unlockQuizzes = e.target.checked; });
        document.getElementById('v4-chk-hb').addEventListener('change', (e) => { STATE.settings.autoHeartbeat = e.target.checked; });

        // Mode selector
        document.querySelectorAll('input[name="v4-mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                STATE.settings.mode = e.target.value;
                document.querySelectorAll('.v4-mode-option').forEach(o => o.classList.remove('active'));
                e.target.closest('.v4-mode-option').classList.add('active');
                // Show/hide speed settings
                const speedSettings = document.getElementById('v4-speed-settings');
                if (speedSettings) speedSettings.style.display = STATE.settings.mode === 'speed' ? '' : 'none';
                addLog(`🎮 เปลี่ยนโหมด: ${STATE.settings.mode === 'speed' ? '⚡ Speed' : '🎭 Realistic'}`, 'info');
            });
        });
        // Initial visibility
        const speedSettings = document.getElementById('v4-speed-settings');
        if (speedSettings && STATE.settings.mode !== 'speed') speedSettings.style.display = 'none';

        // Keyboard shortcut: Ctrl+Shift+B
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && (e.key === 'B' || e.key === 'b')) {
                e.preventDefault(); togglePanel();
            }
        });

        // Draggable
        makeDraggable();
    }

    function togglePanel() {
        const panel = document.getElementById('v4-panel');
        if (panel) panel.classList.toggle('v4-hidden');
    }

    // ═══════════════ DRAGGABLE ═══════════════
    function makeDraggable() {
        const panel = document.getElementById('v4-panel');
        const header = document.getElementById('v4-header');
        let isDragging = false, startX, startY, origLeft, origTop;

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.v4-icon-btn')) return;
            isDragging = true;
            const rect = panel.getBoundingClientRect();
            startX = e.clientX; startY = e.clientY;
            origLeft = rect.left; origTop = rect.top;
            panel.style.transition = 'none';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            panel.style.left = (origLeft + dx) + 'px';
            panel.style.top = (origTop + dy) + 'px';
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                panel.style.transition = '';
            }
        });
    }

    // ═══════════════ CLEANUP ═══════════════
    window.__V4_CLEANUP = function () {
        if (STATE.heartbeatInterval) clearInterval(STATE.heartbeatInterval);
        if (STATE.progressInterval) clearInterval(STATE.progressInterval);
        document.getElementById('v4-wrapper')?.remove();
        document.getElementById('v4-styles')?.remove();
        delete window.__V4_LOADED;
        delete window.__V4_CLEANUP;
        console.log('%c⚡ V4 removed', 'color: #8b5cf6');
    };

    // ═══════════════ INIT ═══════════════
    detectApi();
    scanLessons();
    injectCSS();
    injectHTML();
    setupEvents();

    // Re-render logs that were added before panel existed
    const logContainer = document.getElementById('v4-log-container');
    if (logContainer) {
        logContainer.innerHTML = '';
        STATE.logs.forEach(entry => renderLogEntry(entry));
    }

    // Initial renders
    renderLessonList();
    updateProgressUI();
    updateButtonStates();

    // Show panel with a slight delay for animation
    setTimeout(() => {
        document.getElementById('v4-panel')?.classList.remove('v4-hidden');
    }, 100);

    addLog('✨ V4 Command Center พร้อมใช้งาน!', 'success');
    addLog('💡 กด Ctrl+Shift+B เพื่อเปิด/ซ่อน', 'info');

})();
