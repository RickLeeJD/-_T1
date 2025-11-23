# 新旅平險系統 (New Travel Insurance System)

這是一個現代化、響應式的前端投保系統，專為保險業務員設計。採用企業級架構，具備嚴謹的欄位檢核、直覺的精靈流程 (Wizard) 以及為後端整合做好的資料模型準備。

## 🤖 AI Spec Kit (AI 語境規範套件)

本專案內建 **AI Context Specification Kit**，旨在讓任何 LLM 或 AI Agent (如 GitHub Copilot, Cursor, Windsurf) 能快速理解專案架構並進行協作開發。**所有規範文件皆已繁體中文化。**

*   **位置**: `.github/spec/`
*   **檔案說明**:
    *   `ai-context.md`: **專案脈絡檔** - 定義核心業務邏輯、檔案職責與關鍵流程。
    *   `code-style.md`: **代碼風格檔** - 定義 React 元件寫法、變數命名與 UI 規範。
    *   `schema-map.json`: **資料映射檔** - 描述前端物件 (`types.ts`) 如何對應至資料庫實體。

**如何使用**:
當使用 AI 輔助開發工具時，請確保 AI 索引了 `.github/spec/` 目錄。這就像是給了 AI 一本「專案說明書」，能大幅提升程式碼生成的準確度與風格一致性。

## 🛠 技術棧 (Tech Stack)

*   **Frontend Framework**: React 19 (Hooks, Functional Components)
*   **Language**: TypeScript (Strong Typing)
*   **Styling**: Tailwind CSS (Corporate Teal/Green Theme)
*   **Routing**: React Router (HashRouter)
*   **Build/Container**: Docker, Nginx
*   **Testing**: Selenium WebDriver

## 🏗 系統架構設計 (Architecture)

本專案採用 **Feature-based 分層架構**，確保程式碼的可維護性與擴充性。

### 1. 目錄結構與職責

*   **`src/types.ts` (資料模型層)**
    *   定義全站共用的 `Enum` (如 `Relation`, `PaymentMethod`) 與 `Interface`。
    *   **設計目的**: 嚴格對應後端 Oracle 資料庫 Schema，確保前後端資料合約 (Contract) 一致，減少整合錯誤。

*   **`src/utils/validation.ts` (核心邏輯層)**
    *   抽離複雜的業務邏輯，保持 UI 純淨。
    *   **功能包含**:
        *   **台灣身分證驗證**: 實作戶籍碼權重演算法 (非僅 Regex)。
        *   **信用卡識別**: 透過 BIN Code 自動判斷發卡行與卡別 (Visa/Master/JCB)。
        *   **日期計算**: 自動計算保險天數與保費試算。

*   **`src/components/` (原子元件層)**
    *   `Input`, `Select`: 封裝樣式與錯誤處理，支援 Accessibility (`useId`)，利於自動化測試定位。
    *   `Steps`: 視覺化步驟條，連動流程狀態。

*   **`src/pages/PolicyWizard.tsx` (業務引擎)**
    *   **集中式狀態管理**: 使用單一 `PolicyData` 物件管理 9 個步驟的資料，確保跨步驟資料 (如日期影響保費) 能即時連動。
    *   **響應式邏輯**: 利用 `useEffect` 監聽欄位變化 (例：勾選「同要保人」自動帶入資料)。
    *   **步驟檢核 (Guard)**: 在切換步驟前執行 `validateStep`，確保資料完整性。

### 2. 部署架構 (Deployment)

專案配置了生產環境等級的 **Nginx** 與 **Dockerfile**，支援現代化雲端部署。

*   **Containerization**: 採用 Multi-stage build，將 React 建置產物 (Build Artifacts) 封裝至輕量級 Nginx 映像檔。
*   **Reverse Proxy**: Nginx 配置了 SPA 路由支援 (`try_files`)，並預留 `/api` 反向代理設定，可無縫對接 Spring Boot 後端。
*   **Google Cloud Run Ready**: 完全相容 Serverless 容器平台部署。

## 🚀 快速開始 (Getting Started)

### 安裝與執行

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm start
```

### 執行自動化測試 (Selenium)

本專案包含完整的 End-to-End 測試腳本，模擬使用者從登入到投保完成的完整路徑。

1.  確保本地已安裝 Chrome 瀏覽器。
2.  安裝測試依賴：
    ```bash
    npm install selenium-webdriver chromedriver
    ```
3.  執行測試：
    ```bash
    node tests/selenium-test.js
    ```

### Docker 部署

```bash
# 建置映像檔
docker build -t travel-insurance-frontend .

# 啟動容器 (Port 8080)
docker run -p 8080:80 travel-insurance-frontend
```

## 📋 功能清單

*   [x] **RWD 響應式設計**: 支援桌機與行動裝置操作。
*   [x] **身分證檢核**: 台灣身分證字號邏輯驗證。
*   [x] **智慧信用卡欄位**: 輸入卡號自動帶出銀行與卡別。
*   [x] **保費試算**: 依據天數自動計算保費。
*   [x] **受益人邏輯**: 支援「比例分配」與「均分」模式檢核。
*   [x] **資料持久化模擬**: 模擬 API 延遲與非同步寫入。

---
*Created for New Travel Insurance System Project*