const { Builder, By, Key, until } = require('selenium-webdriver');
require('chromedriver'); // Ensure chromedriver is available in your path or node_modules

async function runTest() {
  // Initialize Driver
  // Note: Ensure your React app is running at http://localhost:3000 before running this script
  let driver = await new Builder().forBrowser('chrome').build();
  
  // --- Helper Functions ---
  
  // Find input field next to a label containing specific text and fill it
  const fillByLabel = async (labelText, value) => {
    try {
      // Strategy: Find label containing text, then find the 'input' inside the same parent div (Input component structure)
      // Structure: <div> <label>...</label> <input /> </div>
      const input = await driver.findElement(By.xpath(`//label[contains(., '${labelText}')]/following-sibling::input`));
      await input.clear();
      await input.sendKeys(value);
    } catch (e) {
      console.error(`Error filling input for label: ${labelText}`, e);
      throw e;
    }
  };

  // Find select field next to a label and choose an option
  const selectByLabel = async (labelText, optionText) => {
    try {
      const select = await driver.findElement(By.xpath(`//label[contains(., '${labelText}')]/following-sibling::select`));
      await select.click();
      // Click the specific option
      await select.findElement(By.xpath(`.//option[contains(., '${optionText}')]`)).click();
    } catch (e) {
      console.error(`Error selecting option for label: ${labelText}`, e);
      throw e;
    }
  };

  // Click a button/element by its visible text
  const clickByText = async (text) => {
    try {
      const el = await driver.findElement(By.xpath(`//*[contains(text(), '${text}')]`));
      await el.click();
    } catch (e) {
      console.error(`Error clicking element with text: ${text}`, e);
      throw e;
    }
  };

  try {
    console.log('--- Starting Selenium Automation Test ---');
    
    // 1. Open Application
    await driver.get('http://localhost:3000'); 
    await driver.wait(until.titleContains('新旅平險系統'), 5000);
    console.log('[Pass] Page Loaded');

    // 2. Login
    await driver.findElement(By.xpath("//input[@type='text']")).sendKeys('admin');
    await driver.findElement(By.xpath("//input[@type='password']")).sendKeys('admin');
    await clickByText('登入');
    
    // Wait for Dashboard
    await driver.wait(until.urlContains('dashboard'), 5000);
    console.log('[Pass] Login Successful');

    // 3. Start Wizard
    await clickByText('新契約受理');
    await driver.wait(until.urlContains('wizard'), 5000);
    console.log('[Pass] Entered Policy Wizard');

    // 4. Step 0: Airport
    await clickByText('桃園國際機場 (TPE)');
    await clickByText('下一步');

    // 5. Step 1: Applicant
    await selectByLabel('與被保險人關係', '本人');
    await fillByLabel('身分證號', 'A123456789'); // Valid Taiwan ID
    await fillByLabel('姓名', 'Selenium 機器人');
    await selectByLabel('性別', '男');
    
    // Date inputs can be tricky in Selenium. Sending keys directly often works for standard HTML5 date inputs.
    // Format usually YYYY-MM-DD or depending on locale.
    const bdayInput = await driver.findElement(By.xpath(`//label[contains(., '生日')]/following-sibling::input`));
    await bdayInput.sendKeys('1990', Key.TAB, '01', '01'); 

    await fillByLabel('聯絡電話', '0912345678');
    await fillByLabel('聯絡地址', '台北市南港區經貿二路');
    await clickByText('下一步');
    console.log('[Pass] Applicant Step Completed');

    // 6. Step 2: Insured (Copy Applicant)
    await driver.sleep(500); // Wait for transition
    // Find checkbox by label text
    await driver.findElement(By.xpath("//label[contains(., '同要保人資訊')]")).click();
    await driver.sleep(500); // Wait for state update
    
    // Verify copy (Optional)
    const insuredName = await driver.findElement(By.xpath(`//label[contains(., '姓名')]/following-sibling::input`)).getAttribute('value');
    if (insuredName !== 'Selenium 機器人') throw new Error('Copy Applicant Failed');
    
    await clickByText('下一步');
    console.log('[Pass] Insured Step Completed');

    // 7. Step 3: Policy Details
    const startDate = await driver.findElement(By.xpath(`//label[contains(., '保險起日')]/following-sibling::input`));
    // Set to today
    const today = new Date();
    const YYYY = today.getFullYear();
    const MM = String(today.getMonth() + 1).padStart(2, '0');
    const DD = String(today.getDate()).padStart(2, '0');
    await startDate.sendKeys(YYYY.toString(), Key.TAB, MM, DD);

    const endDate = await driver.findElement(By.xpath(`//label[contains(., '保險終日')]/following-sibling::input`));
    // Set to +5 days
    await endDate.sendKeys(YYYY.toString(), Key.TAB, MM, String(Number(DD)+5).padStart(2,'0'));

    await selectByLabel('旅遊地區', '國外');
    await selectByLabel('旅遊地點', '日本 (Japan)');
    
    await driver.sleep(500); // Wait for plan auto-selection
    await clickByText('下一步');
    console.log('[Pass] Policy Info Step Completed');

    // 8. Step 4: Agent
    await fillByLabel('業務員登錄證號', '168168');
    await driver.findElement(By.css('body')).click(); // Trigger blur to activate mock lookup
    await driver.sleep(500);
    await clickByText('下一步');

    // 9. Step 5: Beneficiary
    // Default legal heir, just next
    await clickByText('下一步');

    // 10. Step 6: Payment
    await selectByLabel('信用卡授權人身分', '要保人');
    
    // Test Visa Card Detection
    await fillByLabel('信用卡號', '4000123456789000'); 
    await fillByLabel('有效期限', '12/30');

    // Wait for auto-fill
    await driver.wait(until.elementLocated(By.xpath("//input[@value='中國信託']")), 3000);
    await driver.wait(until.elementLocated(By.xpath("//input[@value='VISA']")), 3000);
    console.log('[Pass] Credit Card Recognition Verified');

    await clickByText('下一步');

    // 11. Step 7: Confirm
    await driver.wait(until.elementLocated(By.xpath("//h2[contains(., '請確認投保資料')]")), 3000);
    await clickByText('確認投保');
    
    // 12. Step 8: Success
    await driver.wait(until.elementLocated(By.xpath("//h2[contains(., '投保完成')]")), 5000);
    
    // Check for Policy Number generation
    const policyNo = await driver.findElement(By.className('font-mono')).getText();
    if (!policyNo) throw new Error('Policy Number not generated');
    
    console.log(`[Pass] Process Finished! Policy No: ${policyNo}`);

    // Return to Dashboard
    await clickByText('回到主頁');
    await driver.wait(until.urlContains('dashboard'), 5000);
    console.log('[Pass] Returned to Dashboard');

  } catch (error) {
    console.error('[FAIL] Test Failed:', error);
  } finally {
    // Keep browser open for a moment to see result, or quit
    await driver.sleep(2000);
    await driver.quit();
  }
}

runTest();