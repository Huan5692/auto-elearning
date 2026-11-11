// ==========================================
// 1. TẠO MENU CHUỘT PHẢI KHI EXTENSION ĐƯỢC LOAD
// ==========================================
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "run-auto-elearning",
      title: "🚀 Mở Menu Auto E-Learning", 
      contexts: ["all"] 
    });
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
});

// Giữ nguyên tính năng click icon
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"]
  });
}); 

