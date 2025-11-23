# AI Agent 程式碼撰寫規範 (Coding Guidelines)

當為本專案生成程式碼時，請嚴格遵守以下規則：

## 1. React & TypeScript 規範
- **Functional Components**: 一律使用 `React.FC<Props>` 或直接定義 Props 型別。禁止使用 Class Component。
- **嚴格型別 (Strict Typing)**: 避免使用 `any`。必須使用 `types.ts` 中定義的介面 (Interfaces)。
- **Hooks**: 優先使用內建 Hooks (`useState`, `useEffect`, `useId`)。
- **樣式**: 禁止使用 Inline Styles。一律使用 **Tailwind CSS** Utility Classes。

## 2. UI/UX 設計模式
- **色票 (Color Palette)**: 主要動作按鈕請使用 `primary-600` (#0d9488) 以符合企業識別色（類似中國信託配色）。
- **無障礙 (Accessibility)**: 所有 `input` 必須透過 `htmlFor` 與 `id` 屬性與 `label` 正確關聯（請使用 `useId` hook 生成唯一 ID）。
- **響應式 (Responsive)**: 採用 Mobile-first 策略。桌面版排版請使用 `md:` 或 `lg:` 前綴。

## 3. 表單處理 (Form Handling)
- **Controlled Components**: 所有輸入元件必須受控於 `PolicyWizard` 中的 `data` 狀態物件。
- **驗證機制**:
  - 驗證應發生在使用者點擊「下一步」時。
  - 錯誤訊息應儲存在 `Record<string, string>` 結構的物件中，並顯示於對應欄位下方。

## 4. 測試規範 (Selenium/Playwright)
- **元素選取**: 測試腳本應優先透過 **Label Text** (標籤文字) 或穩健的 **XPath** 來選取元素，避免依賴脆弱的 CSS Selectors。
- **覆蓋率**: 測試必須完整覆蓋投保精靈的「Happy Path」（成功投保流程）。