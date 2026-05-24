let allData = [];

document.addEventListener('DOMContentLoaded', () => {
    // 載入資料
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('無法讀取 data.json');
            }
            return response.json();
        })
        .then(data => {
            allData = data;
            renderResults(allData);
            updateStats(allData.length, allData.length);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            document.getElementById('resultsList').innerHTML = `
                <div class="no-results">
                    <p>無法載入資料 (data.json)。</p>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem;">如果您直接在瀏覽器打開 HTML 檔案，可能會有 CORS 問題。<br>請透過 VS Code Live Server 或上傳至 GitHub Pages 後查看。</p>
                </div>
            `;
            document.getElementById('statsDisplay').innerText = '載入失敗';
        });

    // 綁定搜尋事件
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const keyword = e.target.value.trim();
        if (keyword === '') {
            renderResults(allData);
            updateStats(allData.length, allData.length);
        } else {
            // 過濾主文
            const filteredData = allData.filter(item => 
                item.main_text.includes(keyword) || 
                item.case_no.includes(keyword)
            );
            renderResults(filteredData, keyword);
            updateStats(filteredData.length, allData.length);
        }
    });

    // 綁定 Modal 關閉事件
    const modal = document.getElementById('detailModal');
    const closeBtn = document.getElementById('closeModal');
    
    closeBtn.onclick = function() {
        modal.classList.remove('show');
        setTimeout(() => { modal.style.display = "none"; }, 300);
    }
    
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.classList.remove('show');
            setTimeout(() => { modal.style.display = "none"; }, 300);
        }
    }
});

// 高亮關鍵字
function highlightText(text, keyword) {
    if (!keyword) return text;
    // 避免 xss
    const escapedText = escapeHtml(text);
    const escapedKeyword = escapeHtml(keyword);
    const regex = new RegExp(`(${escapedKeyword})`, 'gi');
    return escapedText.replace(regex, '<span class="highlight">$1</span>');
}

// 跳脫 HTML 避免 XSS
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function getSysClass(sys) {
    if(sys.includes('民事')) return 'sys-V';
    if(sys.includes('刑事')) return 'sys-M';
    if(sys.includes('行政')) return 'sys-A';
    return '';
}

function updateStats(filteredCount, totalCount) {
    const statsDisplay = document.getElementById('statsDisplay');
    statsDisplay.innerHTML = `共載入 <strong>${totalCount}</strong> 筆資料，過濾後顯示 <strong>${filteredCount}</strong> 筆結果`;
}

function renderResults(data, keyword = '') {
    const resultsList = document.getElementById('resultsList');
    
    if (data.length === 0) {
        resultsList.innerHTML = `
            <div class="no-results">
                找不到包含「${escapeHtml(keyword)}」的主文裁判書。請嘗試其他關鍵字。
            </div>
        `;
        return;
    }

    resultsList.innerHTML = data.map((item, index) => {
        return `
            <div class="result-card" onclick="showDetail(${index})">
                <div class="card-header">
                    <div>
                        <div class="case-no">${highlightText(item.case_no, keyword)}</div>
                        <div class="case-meta">
                            <span>裁判日期: ${item.date}</span>
                            <span>案由: ${item.reason}</span>
                        </div>
                    </div>
                    <span class="sys-badge ${getSysClass(item.sys)}">${item.sys}</span>
                </div>
                <div class="main-text-preview">
                    ${highlightText(item.main_text, keyword) || '無主文資料'}
                </div>
            </div>
        `;
    }).join('');
}

// 顯示彈窗細節
window.showDetail = function(index) {
    const item = allData[index];
    const modal = document.getElementById('detailModal');
    
    document.getElementById('modalTitle').innerText = item.case_no;
    document.getElementById('modalMeta').innerHTML = `
        <span class="sys-badge ${getSysClass(item.sys)}">${item.sys}</span>
        <span>裁判日期: ${item.date}</span>
        <span>案由: ${item.reason}</span>
    `;
    
    // 從 input 取得目前的搜尋字詞以進行高亮
    const keyword = document.getElementById('searchInput').value.trim();
    
    document.getElementById('modalMainText').innerHTML = highlightText(item.main_text, keyword) || '無資料';
    document.getElementById('modalFullText').innerHTML = highlightText(item.full_text, keyword) || '無完整內容';
    document.getElementById('modalLink').href = item.link;

    modal.style.display = "block";
    // 稍微延遲加入 class 以觸發 CSS 動畫
    setTimeout(() => { modal.classList.add('show'); }, 10);
};
