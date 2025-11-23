export enum Relation {
  SELF = '本人',
  SPOUSE = '配偶',
  PARENT_CHILD = '直系親屬',
  EMPLOYEE = '員工/成員/學生',
  OTHER = '其他'
}

export enum Gender {
  MALE = '男',
  FEMALE = '女'
}

export enum BeneficiaryRelation {
  LEGAL_HEIR = '法定繼承人',
  SPOUSE = '配偶',
  CHILD = '子女',
  PARENT = '父母',
  SIBLING = '兄弟姊妹',
  GRANDPARENT = '祖父母/孫子女',
  OTHER = '其他'
}

export enum AllocationType {
  NONE = '',
  PROPORTION = '比例',
  EQUAL = '均分'
}

export enum PaymentMethod {
  MONTHLY = '月結',
  CREDIT_CARD = '信用卡',
  TRANSFER = '匯款',
  POSTAL = '劃撥'
}

export enum CardAuthIdentity {
  APPLICANT = '要保人',
  INSURED = '被保險人',
  LEGAL_REP = '法定代理人',
  BENEFICIARY = '受益人'
}

export enum TravelRegion {
  DOMESTIC = '國內',
  FOREIGN = '國外',
  SCHENGEN = '歐盟申根地區'
}

export interface PersonInfo {
  relation: string;
  relationNote?: string; // If relation is OTHER
  idNo: string;
  name: string;
  gender: string;
  birthDate: string; // YYYY-MM-DD (Display as ROC in UI if needed, but ISO for storage)
  nationality: string;
  job?: string;
  mobile: string;
  address: string; // Formatted: Zip / Address
}

export interface PolicyInfo {
  startDate: string;
  startTime: string; // HHmm
  endDate: string;
  endTime: string; // HHmm
  days: number;
  planCode: string;
  planName: string;
  region: TravelRegion | '';
  destination: string;
  destinationNote?: string;
}

export interface AgentInfo {
  id: string;
  name: string;
  channel: string; // e.g., '業務員通路-業一'
  unit: string;    // e.g., '台北一處'
}

export interface Beneficiary {
  id: string;
  relation: string;
  idNo: string;
  name: string;
  birthDate: string;
  nationality: string;
  rank: number;
  allocationType: string; // '比例' | '均分' | ''
  rate?: number; // percentage
}

export interface PaymentInfo {
  method: PaymentMethod;
  amount: number;
  // Credit Card Specific
  cardAuthIdentity?: string;
  isSelfCard?: boolean;
  hasSuppDoc?: boolean;
  cardHolderId?: string;
  cardHolderName?: string;
  cardNo?: string;
  cardBank?: string;
  cardType?: string;
  expiryDate?: string; // MM/YY
  // Transfer Specific
  transferDate?: string;
  bankCode?: string;
  bankName?: string;
  accountNo?: string;
  note?: string;
}

export interface PolicyData {
  policyNo?: string; // Generated on submit
  airport: string;
  applicant: PersonInfo;
  insured: PersonInfo;
  policy: PolicyInfo;
  agent: AgentInfo;
  beneficiaries: Beneficiary[];
  payment: PaymentInfo;
}

export const INITIAL_POLICY_DATA: PolicyData = {
  airport: '',
  applicant: {
    relation: Relation.SELF,
    idNo: '',
    name: '',
    gender: '',
    birthDate: '',
    nationality: '本國',
    mobile: '',
    address: ''
  },
  insured: {
    relation: Relation.SELF,
    idNo: '',
    name: '',
    gender: '',
    birthDate: '',
    nationality: '本國',
    mobile: '',
    address: ''
  },
  policy: {
    startDate: new Date().toISOString().split('T')[0],
    startTime: '0000',
    endDate: '',
    endTime: '0000',
    days: 0,
    planCode: '',
    planName: '',
    region: '',
    destination: ''
  },
  agent: {
    id: '',
    name: '',
    channel: '',
    unit: ''
  },
  beneficiaries: [
    {
      id: '1',
      relation: BeneficiaryRelation.LEGAL_HEIR,
      idNo: '',
      name: '',
      birthDate: '',
      nationality: '本國',
      rank: 1,
      allocationType: AllocationType.EQUAL,
      rate: 0
    }
  ],
  payment: {
    method: PaymentMethod.CREDIT_CARD,
    amount: 0
  }
};