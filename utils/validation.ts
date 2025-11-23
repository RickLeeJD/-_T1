// Taiwan ID Validation Logic
// First letter converts to two numbers based on the table (A=10, B=11... I=34... etc)
const CITY_CODES: Record<string, number> = {
  'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15, 'G': 16, 'H': 17, 'J': 18, 'K': 19, 
  'L': 20, 'M': 21, 'N': 22, 'P': 23, 'Q': 24, 'R': 25, 'S': 26, 'T': 27, 'U': 28, 'V': 29, 
  'X': 30, 'Y': 31, 'W': 32, 'Z': 33, 'I': 34, 'O': 35
};

export const validateTaiwanId = (id: string): boolean => {
  if (!id || !/^[A-Z][12]\d{8}$/.test(id)) return false;

  const firstChar = id[0];
  const code = CITY_CODES[firstChar];
  if (!code) return false;

  // Split the city code into tens (n1) and units (n2)
  // e.g., A=10 -> n1=1, n2=0
  const n1 = Math.floor(code / 10);
  const n2 = code % 10;

  // Digits from the ID string (index 1 to 9)
  const d1 = parseInt(id[1]); // Gender (1 or 2)
  const d2 = parseInt(id[2]);
  const d3 = parseInt(id[3]);
  const d4 = parseInt(id[4]);
  const d5 = parseInt(id[5]);
  const d6 = parseInt(id[6]);
  const d7 = parseInt(id[7]);
  const d8 = parseInt(id[8]);
  const d9 = parseInt(id[9]); // Check digit

  // Weights: 1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1
  // Calculation: n1*1 + n2*9 + d1*8 + d2*7 + ... + d8*1 + d9*1
  
  const sum = 
    (n1 * 1) + 
    (n2 * 9) + 
    (d1 * 8) + 
    (d2 * 7) + 
    (d3 * 6) + 
    (d4 * 5) + 
    (d5 * 4) + 
    (d6 * 3) + 
    (d7 * 2) + 
    (d8 * 1) + 
    (d9 * 1);

  return sum % 10 === 0;
};

export const calculateDays = (start: string, end: string): number => {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  const diffTime = e.getTime() - s.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays >= 0 ? diffDays : 0;
};

export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 }).format(val);
};

// Card Helper
export const getBankName = (cardNumber: string): string => {
  if (!cardNumber || cardNumber.length < 6) return '';
  // Mock BIN list
  if (cardNumber.startsWith('4000')) return '中國信託';
  if (cardNumber.startsWith('4123')) return '台新銀行';
  if (cardNumber.startsWith('5200')) return '國泰世華';
  return '其他銀行';
};

export const getCardType = (cardNumber: string): string => {
  if (!cardNumber) return '';
  if (cardNumber.startsWith('4')) return 'VISA';
  if (cardNumber.startsWith('5')) return 'MasterCard';
  if (cardNumber.startsWith('3')) return 'JCB';
  return 'Unknown';
};

export const generatePolicyNo = (): string => {
  // yyymmddHHmmss (ROC year)
  const now = new Date();
  const year = now.getFullYear() - 1911;
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const sec = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hour}${min}${sec}`;
};

export const toRocDate = (isoDate: string): string => {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  return `${d.getFullYear()-1911}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
}