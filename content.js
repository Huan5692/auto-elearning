// Kiểm tra xem script đã chạy chưa
if (!window.hasRunAutoScript) {
    window.hasRunAutoScript = true;
    
    console.log("=====================================");
    console.log("🚀 [AUTO E-LEARNING] MENU ĐIỀU KHIỂN KÍCH HOẠT!");
    console.log("=====================================");

    // ==========================================
    // 1. TẠO GIAO DIỆN BẢNG ĐIỀU KHIỂN CHÍNH
    // ==========================================
    const statusBox = document.createElement('div');
    statusBox.id = "auto-script-status-box";
    statusBox.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(33, 33, 33, 0.95);
        color: white;
        padding: 15px;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        z-index: 999999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        cursor: move; 
        user-select: none;
        border: 1px solid #4CAF50;
        min-width: 300px;
    `;
    
    statusBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #555; padding-bottom: 8px; margin-bottom: 12px;">
            <span style="font-size: 16px;">🚀 <b>Menu Điều Khiển</b></span>
            <button id="close-panel-btn" style="background:#ff4444; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-weight:bold;">Đóng</button>
        </div>
        
        <!-- Option 1: Auto Learning -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <button id="toggle-learning-btn" style="background:#2196F3; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-weight:bold; flex: 1; margin-right: 10px; transition: 0.2s;">Bật Auto Learning</button>
            <span id="status-learning" aria-live="polite" style="color: #9e9e9e; font-size: 13px; min-width: 80px; text-align: right;">⚫ Đã dừng</span>
        </div>

    `;
    document.body.appendChild(statusBox);

    // ==========================================
    // TÍNH NĂNG KÉO THẢ BẢNG ĐIỀU KHIỂN
    // ==========================================
    let isDragging = false;
    let offsetX, offsetY;

    statusBox.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'BUTTON') return; 
        isDragging = true;
        const rect = statusBox.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        statusBox.style.bottom = 'auto';
        statusBox.style.right = 'auto';
        statusBox.style.left = (e.clientX - offsetX) + 'px';
        statusBox.style.top = (e.clientY - offsetY) + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // ==========================================
    // LOGIC BẬT/TẮT TỪNG TÍNH NĂNG
    // ==========================================
    let isLearningRunning = false;
    let learningIntervalId = null;
    let highlightIntervalId = null;
    let pausedSlideLabel = null;

    const highlightLayer = document.createElement('div');
    highlightLayer.id = 'auto-script-highlight-layer';
    highlightLayer.style.cssText = 'position: fixed; inset: 0; pointer-events: none; z-index: 999998;';
    document.body.appendChild(highlightLayer);

    const highlightStyle = document.createElement('style');
    highlightStyle.textContent = `
        @keyframes autoScriptPulse {
            0%, 100% { box-shadow: 0 0 0 3px rgba(255,152,0,0.9), 0 0 12px 4px rgba(255,152,0,0.6); }
            50% { box-shadow: 0 0 0 5px rgba(255,235,59,0.95), 0 0 22px 8px rgba(255,152,0,0.8); }
        }
    `;
    document.head.appendChild(highlightStyle);

    const btnLearning = document.getElementById('toggle-learning-btn');
    const statusLearning = document.getElementById('status-learning');

    btnLearning.addEventListener('click', () => {
        if (isLearningRunning) {
            stopLearning("⚫ Đã dừng", "#9e9e9e");
            stopHighlighting();
        } else {
            startLearning();
        }
    });

    function startLearning() {
        isLearningRunning = true;
        btnLearning.innerText = "Tắt Auto Learning";
        btnLearning.style.background = "#f44336"; 
        statusLearning.innerHTML = "🟢 Đang chạy";
        statusLearning.style.color = "#4CAF50";
        statusLearning.title = "";
        stopHighlighting();
        clearInterval(learningIntervalId);
        learningIntervalId = setInterval(runAutoLearningTask, 500);
    }

    function stopLearning(statusText, statusColor) {
        isLearningRunning = false;
        clearInterval(learningIntervalId);
        learningIntervalId = null;
        btnLearning.innerText = "Bật Auto Learning";
        btnLearning.style.background = "#2196F3"; 
        statusLearning.innerHTML = statusText;
        statusLearning.style.color = statusColor;
        statusLearning.title = "";
    }

    function getSlideLabel() {
        const label = document.getElementById('slide-label');
        return label ? label.textContent.trim() : '';
    }

    function isNextAvailable() {
        const btnNext = document.getElementById('next');
        if (!btnNext || btnNext.getAttribute('aria-disabled') === 'true') return false;
        const style = window.getComputedStyle(btnNext);
        return style.display !== 'none' && style.visibility !== 'hidden';
    }

    function isSlideTimelineDone() {
        const progressBar = document.querySelector('input[data-ref="progressBar"]');
        if (!progressBar || !progressBar.max) return true;
        return parseInt(progressBar.value || 0) >= parseInt(progressBar.max) - 500;
    }

    document.getElementById('close-panel-btn').addEventListener('click', () => {
        clearInterval(learningIntervalId);
        stopHighlighting();
        highlightLayer.remove();
        highlightStyle.remove();
        window.hasRunAutoScript = false;          
        statusBox.remove();                        
    });

    function getInteractionLabel(button) {
        const modelId = (button.dataset.represents || '').split('.').pop();
        const slideObject = modelId && document.querySelector(`.slide-object[data-model-id="${CSS.escape(modelId)}"]`);
        return (slideObject && slideObject.getAttribute('data-acc-text')) ||
            button.getAttribute('aria-label') ||
            button.innerText.trim();
    }

    function renderHighlights(buttons) {
        highlightLayer.replaceChildren(...buttons.map(button => {
            const rect = button.getBoundingClientRect();
            const box = document.createElement('div');
            box.style.cssText = `
                position: fixed;
                left: ${rect.left - 4}px;
                top: ${rect.top - 4}px;
                width: ${rect.width + 8}px;
                height: ${rect.height + 8}px;
                border-radius: 6px;
                animation: autoScriptPulse 1.2s ease-in-out infinite;
            `;
            const tag = document.createElement('span');
            tag.textContent = '👆 Bấm vào đây';
            tag.style.cssText = 'position: absolute; left: 0; top: -24px; background: #FF9800; color: #fff; font: bold 12px Arial, sans-serif; padding: 2px 6px; border-radius: 4px; white-space: nowrap;';
            box.appendChild(tag);
            return box;
        }));
    }

    function refreshHighlights() {
        const buttons = findVisibleStorylineInteractions();
        // Auto-resume once the user's own click moved the course on or cleared the interaction.
        if (buttons.length === 0 || getSlideLabel() !== pausedSlideLabel) {
            startLearning();
            return;
        }
        renderHighlights(buttons);
        statusLearning.title = buttons.map(getInteractionLabel).join('\n');
    }

    function startHighlighting() {
        stopHighlighting();
        refreshHighlights();
        highlightIntervalId = setInterval(refreshHighlights, 500);
    }

    function stopHighlighting() {
        clearInterval(highlightIntervalId);
        highlightIntervalId = null;
        highlightLayer.replaceChildren();
    }

    function findVisibleStorylineInteractions() {
        return Array.from(document.querySelectorAll('.acc-shadow-dom button.acc-button')).filter(button => {
            const label = button.getAttribute('aria-label') || button.innerText || '';
            const style = window.getComputedStyle(button);
            const isMediaControl = /\.(mp4|webm|mov|mp3|wav)(?:\s|$)/i.test(label);

            return !isMediaControl &&
                !button.closest('[aria-hidden="true"]') &&
                !button.disabled &&
                style.display !== 'none' &&
                style.visibility === 'visible' &&
                Number(style.opacity) > 0 &&
                button.getClientRects().length > 0;
        });
    }

    function runAutoLearningTask() {
        if (!isNextAvailable() && isSlideTimelineDone() && findVisibleStorylineInteractions().length > 0) {
            stopLearning("🟠 Cần thao tác", "#FF9800");
            pausedSlideLabel = getSlideLabel();
            startHighlighting();
            return;
        }

        document.querySelectorAll('video, audio').forEach(media => { 
            try { 
                if (!media.src || media.src.startsWith('data:')) return; 
                if (!media.hasHackedSpeed) {
                    media.hasHackedSpeed = true;
                    media.muted = true; 
                    const originalDescriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'playbackRate');
                    Object.defineProperty(media, 'playbackRate', { get: function() { return 1; }, set: function(val) { originalDescriptor.set.call(this, 16); }});
                    media.playbackRate = 16;
                }
            } catch (e) { } 
        }); 

        const progressBar = document.querySelector('input[data-ref="progressBar"]');
        if (progressBar && progressBar.max) {
            let maxVal = parseInt(progressBar.max);
            let currentVal = parseInt(progressBar.value || 0);
            if (maxVal - currentVal > 1000) {
                progressBar.value = maxVal - 100;
                progressBar.dispatchEvent(new Event('input', { bubbles: true }));
                progressBar.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

        const btnNext = document.getElementById('next'); 
        if (btnNext && btnNext.dataset.clicked !== "true") { 
            let isReadyToNext = false;
            if (btnNext.getAttribute('aria-disabled') === "false") { isReadyToNext = true; } 
            if (!isReadyToNext && progressBar && progressBar.max) {
                let maxVal = parseInt(progressBar.max);
                let currentVal = parseInt(progressBar.value || 0);
                if (currentVal >= maxVal - 500) { isReadyToNext = true; }
            }

            if (isReadyToNext) {
                btnNext.setAttribute("aria-disabled", "false"); 
                btnNext.style.pointerEvents = "auto"; 
                btnNext.style.opacity = 1; 
                btnNext.removeAttribute("disabled"); 

                const eventsToSimulate = ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'];
                eventsToSimulate.forEach(evName => { btnNext.dispatchEvent(new MouseEvent(evName, { bubbles: true, cancelable: true, view: window, buttons: 1 })); });

                btnNext.dataset.clicked = "true"; 
                setTimeout(() => { btnNext.dataset.clicked = "false"; }, 1000);
            }
        } 
        document.querySelectorAll('.read-only').forEach(e => e.classList.remove('read-only')); 
    }

} else {
    console.warn("⚠️ [AUTO E-LEARNING] Bảng điều khiển đã mở rồi!");
}