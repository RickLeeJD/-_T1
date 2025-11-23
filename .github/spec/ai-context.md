# AI Context Specification (專案脈絡說明書)

## 專案識別 (Project Identity)
- **專案名稱**: 新旅平險系統 (New Travel Insurance System)
- **類型**: 企業級前端單頁應用 (Enterprise Frontend SPA)
- **主要語言**: TypeScript (React 19)
- **樣式框架**: Tailwind CSS
- **語系**: zh-TW (繁體中文)

## 核心業務邏輯 (Core Business Logic)
本應用程式為導向式的保險投保系統 (Wizard-based Insurance Issuance System)。
1. **高嚴謹度驗證**: 
   - **身分證**: 必須實作台灣身分證字號檢核邏輯（首碼轉換 + 加權數總和）。
   - **日期**: 結束日期不可早於開始日期。
   - **受益人**: 若選擇「比例分配」，所有受益人的比例總和必須嚴格等於 100%。
2. **資料一致性 (Single Source of Truth)**: 
   - `src/types.ts` 中的 `PolicyData` 介面是唯一的資料真理來源。所有表單輸入都必須映射回此結構。
3. **資料持久化**: 
   - 前端目前模擬 API 呼叫，但資料結構已設計為可直接傳送 JSON Payload 至後端 (Oracle Database + Spring Boot)。

## 目錄結構與職責 (Directory Structure)
- `src/types.ts`: **最關鍵檔案**。定義所有列舉 (Enums) 與介面 (Interfaces)。任何新功能開發**必須**先更新此檔案。
- `src/utils/validation.ts`: 包含純粹的業務邏輯函式（如 ID 檢核、天數計算、信用卡 BIN 碼識別）。**不可**在此放置 UI 邏輯。
- `src/pages/PolicyWizard.tsx`: 核心狀態機 (State Machine)。處理 9 個步驟的流程控制與表單狀態。
- `src/components/`: 可重用的原子元件。必須支援 `useId` 以符合無障礙設計與自動化測試需求。

## 關鍵工作流程 (Key Workflows)
1. **保費試算**: 當 `startDate` (起日) 或 `endDate` (終日) 改變時，必須透過 `useEffect` 立即重新計算 `days` (天數) 與保費。
2. **身分複製**: 當勾選「同要保人」時，必須將要保人資料複製至被保險人欄位，並鎖定相關輸入框。
3. **支付邏輯**: 信用卡號輸入時，需透過 Regex 自動偵測發卡行 (如中國信託) 與卡別 (Visa/Master)。