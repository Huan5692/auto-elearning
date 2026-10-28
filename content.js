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
            <span id="status-learning" style="color: #9e9e9e; font-size: 13px; min-width: 80px; text-align: right;">⚫ Đã dừng</span>
        </div>

        <!-- Option 2: Auto Answer -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <button id="toggle-quiz-btn" style="background:#FF9800; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-weight:bold; flex: 1; margin-right: 10px; transition: 0.2s;">Bật Auto Answer</button>
            <span id="status-quiz" style="color: #9e9e9e; font-size: 13px; min-width: 80px; text-align: right;">⚫ Đã dừng</span>
        </div>

        <!-- Trạng thái chi tiết của Gemini -->
        <div id="gemini-status" style="line-height: 1.5; font-size: 13px; border-top: 1px dashed #555; padding-top: 8px; display: none; margin-top: 10px; word-wrap: break-word; user-select: text; cursor: text;">
            🤖 Gemini: <i>Đang chờ kích hoạt...</i>
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
    let isQuizRunning = false;
    let learningIntervalId = null;
    let quizIntervalId = null;

    const btnLearning = document.getElementById('toggle-learning-btn');
    const statusLearning = document.getElementById('status-learning');
    const btnQuiz = document.getElementById('toggle-quiz-btn');
    const statusQuiz = document.getElementById('status-quiz');
    const geminiStatusBox = document.getElementById('gemini-status');

    function updateGeminiStatus(message, color = "#FFEB3B") {
		const statusBox = document.getElementById('gemini-status');
		if (statusBox) {
			statusBox.style.display = "block";
			statusBox.innerHTML = `🤖 Gemini: <span style="color: ${color}">${message}</span>`;
		}
	}

    btnLearning.addEventListener('click', () => {
        isLearningRunning = !isLearningRunning;
        if (isLearningRunning) {
            btnLearning.innerText = "Tắt Auto Learning";
            btnLearning.style.background = "#f44336"; 
            statusLearning.innerHTML = "🟢 Đang chạy";
            statusLearning.style.color = "#4CAF50";
            learningIntervalId = setInterval(runAutoLearningTask, 500);
        } else {
            btnLearning.innerText = "Bật Auto Learning";
            btnLearning.style.background = "#2196F3"; 
            statusLearning.innerHTML = "⚫ Đã dừng";
            statusLearning.style.color = "#9e9e9e";
            clearInterval(learningIntervalId);
        }
    });

    btnQuiz.addEventListener('click', () => {
        isQuizRunning = !isQuizRunning;
        if (isQuizRunning) {
            btnQuiz.innerText = "Tắt Auto Answer";
            btnQuiz.style.background = "#f44336"; 
            statusQuiz.innerHTML = "🟢 Đang chạy";
            statusQuiz.style.color = "#4CAF50";
            
            window.lastAskedQuestion = "";
            window.currentUIState = "";
            updateGeminiStatus("<i>Đang quét và tìm khung bài thi xuyên Iframe...</i>", "#9e9e9e");

            quizIntervalId = setInterval(runAutoQuizTask, 1000); 
        } else {
            btnQuiz.innerText = "Bật Auto Answer";
            btnQuiz.style.background = "#FF9800"; 
            statusQuiz.innerHTML = "⚫ Đã dừng";
            statusQuiz.style.color = "#9e9e9e";
            geminiStatusBox.style.display = "none"; 
            clearInterval(quizIntervalId);
        }
    });

    document.getElementById('close-panel-btn').addEventListener('click', () => {
        clearInterval(learningIntervalId);
        clearInterval(quizIntervalId);
        window.hasRunAutoScript = false;          
        statusBox.remove();                        
    });

    function runAutoLearningTask() {
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

    // ==========================================
    // LOGIC AUTO ANSWER ĐỤC THỦNG IFRAME
    // ==========================================

    // Hàm đệ quy quét xuyên màng iframe để tìm câu hỏi
    function getQuizDocument(currentDoc) {
        try {
            if (currentDoc.querySelector('span[id*="questionText"]')) {
                return currentDoc;
            }
            const frames = currentDoc.querySelectorAll('iframe, frame');
            for (let i = 0; i < frames.length; i++) {
                try {
                    const childDoc = frames[i].contentDocument || frames[i].contentWindow.document;
                    if (childDoc) {
                        const foundDoc = getQuizDocument(childDoc);
                        if (foundDoc) return foundDoc;
                    }
                } catch(e) { } // Bỏ qua lỗi chặn chéo Domain
            }
        } catch(e) {}
        return null;
    }

    function runAutoQuizTask() {
        if (!isQuizRunning) return;

        // 1. TÌM TÀI LIỆU CHỨA BÀI THI (Trong iframe hoặc thẻ gốc)
        const quizDoc = getQuizDocument(document);

        if (!quizDoc) {
            if (window.currentUIState !== "waiting_area") {
                updateGeminiStatus("<i>Đang chờ giao diện bài thi...</i>", "#9e9e9e");
                window.currentUIState = "waiting_area";
            }
            return;
        }

        // 2. LẤY TIÊU ĐỀ VÀ NỘI DUNG CÂU HỎI
        const titleEl = quizDoc.querySelector('.quizUiQuestionTitle');
        const questionTitle = titleEl ? (titleEl.innerText || titleEl.textContent).trim() : "Câu hỏi";

        const questionTextEl = quizDoc.querySelector('span[id*="questionText"] .sfUserAssessment');
        const questionText = questionTextEl ? (questionTextEl.innerText || questionTextEl.textContent).trim() : "";

        if (!questionText) {
            if (window.currentUIState !== "waiting_text") {
                updateGeminiStatus("<i>Đang đọc dữ liệu câu hỏi...</i>", "#9e9e9e");
                window.currentUIState = "waiting_text";
            }
            return;
        }

        // Bỏ qua nếu nội dung giống y chang câu trước đó (chưa kịp tải câu mới)
        if (questionText === window.lastAskedQuestion) {
            return;
        }

        // Đã qua câu mới -> Lưu lại
        window.lastAskedQuestion = questionText;
        window.currentUIState = "processing";
        updateGeminiStatus(`Đang phân tích <b>[${questionTitle}]</b>...`, "#2196F3");

        // 3. TÌM VÙNG ĐÁP ÁN
        const radioBtns = quizDoc.querySelectorAll('.sapMRb');
        const optionEls = quizDoc.querySelectorAll('span[id*="idSAOption"] .sfUserAssessment');

        if (optionEls.length === 0 || radioBtns.length === 0) {
            updateGeminiStatus(`❌ <b>Lỗi:</b> Không đọc được các lựa chọn A B C D!`, "#f44336");
            return;
        }

        let optionsText = "";
        let optionsArray = [];
        optionEls.forEach((el, index) => {
            let text = (el.innerText || el.textContent).trim();
            if(text) {
                optionsText += `${index + 1}. ${text}\n`;
                optionsArray.push({ text: text, index: index, radio: radioBtns[index] });
            }
        });

        // 4. TẠO PROMPT
        const prompt = `Câu hỏi: ${questionText}\nCác đáp án:\n${optionsText}\nHãy trả lời bằng cách chỉ in ra nội dung CHÍNH XÁC của đáp án đúng nhất (chỉ trả về nội dung, không thêm số thứ tự, không thêm lời giải thích).`;

        updateGeminiStatus(`Đang gửi <b>[${questionTitle}]</b> cho Gemini API... ⏳`, "#00bcd4");

        // 5. GỌI BACKGROUND.JS ĐỂ NHỜ GEMINI
        try {
            chrome.runtime.sendMessage({ action: "askGemini", prompt: prompt }, (response) => {
                if (response && response.success) {
                    let answer = response.answer.trim();
                    let selectedIndex = -1;
                    
                    optionsArray.forEach((opt) => {
                        const cleanOpt = opt.text.toLowerCase().replace(/\s+/g, '');
                        const cleanAns = answer.toLowerCase().replace(/\s+/g, '');
                        // Kiểm tra chuỗi con qua lại
                        if (cleanAns.includes(cleanOpt) || cleanOpt.includes(cleanAns)) {
                            selectedIndex = opt.index;
                        }
                    });

                    if (selectedIndex !== -1 && optionsArray[selectedIndex].radio) {
                        const selectedText = optionsArray[selectedIndex].text;
                        const radioToClick = optionsArray[selectedIndex].radio;
                        
                        updateGeminiStatus(`✅ Đáp án: <b>${selectedText}</b>. Đang click...`, "#4CAF50");
                        
                        // Click vào Radio trong đúng Iframe chứa nó
                        const docView = quizDoc.defaultView || window;
                        const eventsToSimulate = ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'];
                        eventsToSimulate.forEach(evName => {
                            radioToClick.dispatchEvent(new MouseEvent(evName, { bubbles: true, cancelable: true, view: docView, buttons: 1 }));
                        });

                        updateGeminiStatus(`✅ <b>${questionTitle}:</b> Đã chọn xong<br>👉 Tự động Next sau 2s...`, "#4CAF50");
                        
                        // Tự động bấm NEXT sau 2 giây
                        setTimeout(() => {
                            const nextBtnBdi = Array.from(quizDoc.querySelectorAll('bdi')).find(el => {
                                const t = (el.innerText || el.textContent).trim();
                                return t === 'Next' || t === 'Tiếp theo';
                            });
                            
                            if (nextBtnBdi) {
                                const nextBtn = nextBtnBdi.closest('button');
                                if (nextBtn) nextBtn.click();
                            } else {
                                updateGeminiStatus(`⚠️ <b>${questionTitle}:</b> Không tìm thấy nút NEXT. Vui lòng bấm tay!`, "#FF9800");
                            }
                        }, 2000);

                    } else {
                        updateGeminiStatus(`⚠️ Gemini chọn: <b>${answer}</b><br>❌ <i>Không khớp đáp án hiển thị. Vui lòng tự chọn!</i>`, "#FF9800");
                    }
                } else {
                    updateGeminiStatus(`❌ <b>Lỗi API:</b> ${response ? response.error : 'Mất kết nối'}`, "#f44336");
                }
            });
        } catch (error) {
            updateGeminiStatus(`❌ <b>Lỗi hệ thống:</b> Không kết nối được extension.`, "#f44336");
        }
    }

} else {
    console.warn("⚠️ [AUTO E-LEARNING] Bảng điều khiển đã mở rồi!");
}