// Thay API Key của bạn vào đây (Key của Google Cloud bắt đầu bằng AIza...)
const GEMINI_API_KEY = "123";

// ==========================================
// 1. TẠO MENU CHUỘT PHẢI KHI EXTENSION ĐƯỢC LOAD
// ==========================================
chrome.runtime.onInstalled.addListener(() => {
  // Menu cũ mở tool
  chrome.contextMenus.create({
    id: "run-auto-elearning",
    title: "🚀 Mở Menu Auto E-Learning", 
    contexts: ["all"] 
  });

  // MENU MỚI DÀNH RIÊNG ĐỂ TEST GEMINI (Chỉ hiện khi bôi đen chữ)
  chrome.contextMenus.create({
    id: "test-gemini",
    title: "🧪 Test Gemini: Hỏi đoạn text đã bôi đen", 
    contexts: ["selection"] 
  });
});

// ==========================================
// 2. LẮNG NGHE SỰ KIỆN KHI BẤM MENU CHUỘT PHẢI
// ==========================================
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // Nếu bấm mở tool E-Learning
  if (info.menuItemId === "run-auto-elearning") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    }).catch(err => console.error("Lỗi khi chạy script:", err));
  }
  
  // Nếu bấm Test Gemini
  else if (info.menuItemId === "test-gemini") {
    // Hiện thông báo đang xử lý lên màn hình web
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => alert("⏳ Đang gửi cho Gemini, vui lòng chờ khoảng 2-3 giây...")
    });

    const prompt = "Hãy trả lời câu hỏi sau ngắn gọn. Chỉ lấy 5 dòng đầu tiên:\n" + info.selectionText;

    askGemini(prompt).then(answer => {
        // Cắt lấy 5 dòng đầu tiên của kết quả trả về
        const lines = answer.split('\n').filter(line => line.trim() !== '').slice(0, 5).join('\n');
        
        // Hiện Alert kết quả
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (result) => alert("🤖 GEMINI TRẢ LỜI (5 dòng đầu):\n\n" + result),
            args: [lines]
        });
    }).catch(err => {
        // Hiện Alert Lỗi
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (errMsg) => alert("❌ LỖI API GEMINI:\n\n" + errMsg),
            args: [err.toString()]
        });
    });
  }
});

// Giữ nguyên tính năng click icon
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"]
  });
}); 

// Lắng nghe lệnh từ content.js (dùng cho Auto Quiz sau này)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "askGemini") {
        askGemini(request.prompt)
            .then(answer => sendResponse({ success: true, answer: answer }))
            .catch(error => sendResponse({ success: false, error: error.toString() }));
        return true; 
    }
});

// ==========================================
// HÀM GỌI API GEMINI
// ==========================================
async function askGemini(prompt) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("ĐIỀN")) {
        throw new Error("Vui lòng cấu hình lại API Key trong file background.js!");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1 } 
        })
    });
    
    const data = await response.json();
    if (data.error) {
        throw new Error(data.error.message);
    }
    
    return data.candidates[0].content.parts[0].text;
}