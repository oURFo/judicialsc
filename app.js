/**
 * 職場不法侵害 裁判書檢索 — 快捷入口
 * 直接組合 URL 開新分頁到司法院 qryresult.aspx
 */

// 司法院查詢結果頁 base URL
// q= 後面的 hash 代表「職場不法侵害」的搜尋結果集
const QRYRESULT_BASE = 'https://judgment.judicial.gov.tw/FJUD/qryresult.aspx';
const QUERY_HASH = 'ed751c053f448069eee483828bc3ca7a';

/**
 * 組合查詢 URL
 * @param {string} keyword - 二次檢索關鍵字（可為空）
 */
function buildSearchUrl(keyword = '') {
    const params = new URLSearchParams({
        q: QUERY_HASH,
        akw: keyword.trim()
    });
    return `${QRYRESULT_BASE}?${params.toString()}`;
}

/**
 * 執行搜尋：開新分頁
 */
function doSearch(keyword) {
    const url = buildSearchUrl(keyword);
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast(keyword ? `已開啟「${keyword}」的查詢結果` : '已開啟全部查詢結果');
}

/**
 * Toast 通知
 */
function showToast(message) {
    // 移除舊 toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // 觸發動畫
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 2500);
}

/**
 * 搜尋框 ripple 動畫
 */
function triggerRipple() {
    const box = document.getElementById('searchBox');
    box.classList.remove('ripple');
    void box.offsetWidth; // force reflow
    box.classList.add('ripple');
}

// === Event Bindings ===
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const directBtn = document.getElementById('directBtn');

    // 搜尋按鈕
    searchBtn.addEventListener('click', () => {
        triggerRipple();
        doSearch(searchInput.value);
    });

    // Enter 鍵
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            triggerRipple();
            doSearch(searchInput.value);
        }
    });

    // 直接瀏覽全部（不帶關鍵字）
    directBtn.addEventListener('click', () => {
        doSearch('');
    });

    // 快捷標籤
    document.querySelectorAll('.tag[data-kw]').forEach(tag => {
        tag.addEventListener('click', () => {
            const kw = tag.dataset.kw;
            searchInput.value = kw;
            triggerRipple();
            doSearch(kw);
        });
    });

    // 自動 focus 搜尋框
    searchInput.focus();
});
