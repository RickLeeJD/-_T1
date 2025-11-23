import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Steps } from '../components/Steps';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { 
  PolicyData, INITIAL_POLICY_DATA, Relation, Gender, 
  BeneficiaryRelation, AllocationType, PaymentMethod,
  CardAuthIdentity, TravelRegion
} from '../types';
import { 
  validateTaiwanId, calculateDays, formatCurrency, 
  getBankName, getCardType, generatePolicyNo, toRocDate 
} from '../utils/validation';
import { ArrowRight, ArrowLeft, Plane, User, Users, FileText, CreditCard, CheckCircle, Save, Briefcase, AlertCircle } from 'lucide-react';

const STEPS = [
  '機場',
  '要保人',
  '被保險人',
  '投保',
  '業務',
  '受益人',
  '繳費',
  '確認',
  '完成'
];

export const PolicyWizard: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<PolicyData>(INITIAL_POLICY_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sameAsApplicant, setSameAsApplicant] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Data Handlers ---

  const updateData = (section: keyof PolicyData, field: string | null, value: any) => {
    setData(prev => {
      const newData = { ...prev };
      
      // Handle top-level primitive fields
      if (section === 'airport') {
        newData.airport = value;
      } else if (section === 'policyNo') {
        newData.policyNo = value;
      } else if (section === 'beneficiaries') {
        // handled separately via helper functions
      } else {
        // Handle nested objects (applicant, insured, policy, agent, payment)
        if (field) {
          (newData[section] as any)[field] = value;
        }
      }
      return newData;
    });
    
    // Clear specific error
    const errorKey = field ? `${section}.${field}` : section;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const updateBeneficiary = (index: number, field: string, value: any) => {
    setData(prev => {
      const newBene = [...prev.beneficiaries];
      (newBene[index] as any)[field] = value;
      
      // Auto set rank if needed? For now manual input as per doc
      return { ...prev, beneficiaries: newBene };
    });
  };

  const addBeneficiary = () => {
    setData(prev => ({
      ...prev,
      beneficiaries: [
        ...prev.beneficiaries,
        {
          id: Date.now().toString(),
          relation: BeneficiaryRelation.LEGAL_HEIR,
          idNo: '',
          name: '',
          birthDate: '',
          nationality: '本國',
          rank: prev.beneficiaries.length + 1,
          allocationType: AllocationType.EQUAL,
          rate: 0
        }
      ]
    }));
  };

  const removeBeneficiary = (index: number) => {
    setData(prev => ({
      ...prev,
      beneficiaries: prev.beneficiaries.filter((_, i) => i !== index)
    }));
  };

  // --- Effects ---

  // 1. Auto-calculate Travel Days
  useEffect(() => {
    if (data.policy.startDate && data.policy.endDate) {
      const days = calculateDays(data.policy.startDate, data.policy.endDate);
      if (days !== data.policy.days) {
        updateData('policy', 'days', days);
        // Simple mock premium calc: 200 base + 100/day
        const premium = 200 + (days * 100);
        updateData('payment', 'amount', premium > 0 ? premium : 0);
      }
    }
  }, [data.policy.startDate, data.policy.endDate]);

  // 2. Copy Applicant to Insured
  useEffect(() => {
    if (sameAsApplicant) {
      setData(prev => ({
        ...prev,
        insured: { 
          ...prev.insured,
          name: prev.applicant.name,
          idNo: prev.applicant.idNo,
          gender: prev.applicant.gender,
          birthDate: prev.applicant.birthDate,
          nationality: prev.applicant.nationality,
          mobile: prev.applicant.mobile,
          address: prev.applicant.address,
          relation: Relation.SELF
        }
      }));
    }
  }, [sameAsApplicant, data.applicant]);

  // 3. Credit Card Recognition
  useEffect(() => {
    if (data.payment.cardNo && data.payment.cardNo.length >= 6) {
      const bank = getBankName(data.payment.cardNo);
      const type = getCardType(data.payment.cardNo);
      
      if (data.payment.cardBank !== bank || data.payment.cardType !== type) {
        setData(prev => ({
          ...prev,
          payment: { ...prev.payment, cardBank: bank, cardType: type }
        }));
      }
    }
  }, [data.payment.cardNo]);

  // --- Validation ---

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (step === 0) { // Airport
      if (!data.airport) { newErrors['airport'] = '請選擇投保機場'; isValid = false; }
    }

    if (step === 1) { // Applicant
      if (!data.applicant.name) newErrors['applicant.name'] = '請輸入姓名';
      if (!data.applicant.idNo) newErrors['applicant.idNo'] = '請輸入證號';
      else if (!validateTaiwanId(data.applicant.idNo)) newErrors['applicant.idNo'] = '身分證格式錯誤';
      if (!data.applicant.mobile) newErrors['applicant.mobile'] = '請輸入手機';
      if (!data.applicant.gender) newErrors['applicant.gender'] = '請選擇性別';
      if (!data.applicant.birthDate) newErrors['applicant.birthDate'] = '請輸入生日';
      if (data.applicant.relation === Relation.OTHER && !data.applicant.relationNote) {
         newErrors['applicant.relationNote'] = '請輸入關係說明';
      }
    }

    if (step === 2) { // Insured
      if (!data.insured.name) newErrors['insured.name'] = '請輸入姓名';
      if (!data.insured.idNo) newErrors['insured.idNo'] = '請輸入證號';
      else if (!validateTaiwanId(data.insured.idNo)) newErrors['insured.idNo'] = '身分證格式錯誤';
      if (!data.insured.gender) newErrors['insured.gender'] = '請選擇性別';
      if (!data.insured.birthDate) newErrors['insured.birthDate'] = '請輸入生日';
    }

    if (step === 3) { // Policy
      if (!data.policy.startDate) newErrors['policy.startDate'] = '請選擇起日';
      if (!data.policy.endDate) newErrors['policy.endDate'] = '請選擇終日';
      if (data.policy.days < 0) newErrors['policy.days'] = '結束日期不能早於開始日期';
      if (!data.policy.region) newErrors['policy.region'] = '請選擇地區';
      if (!data.policy.destination) newErrors['policy.destination'] = '請選擇地點';
      if (!data.policy.planCode) newErrors['policy.planCode'] = '請選擇方案';
    }

    if (step === 4) { // Agent
      if (!data.agent.id) newErrors['agent.id'] = '請輸入登錄證號';
    }

    if (step === 5) { // Beneficiary
      let totalRate = 0;
      let hasProportion = false;
      
      data.beneficiaries.forEach((b, idx) => {
         // If Legal Heir, name can be empty/implied, but usually system requires input or distinct handling.
         // Prompt says input name is optional if Legal Heir? No, prompt says 'Name' field.
         // Let's assume Name is required unless implied.
         if (b.relation !== BeneficiaryRelation.LEGAL_HEIR && !b.name) {
           newErrors[`bene.${idx}.name`] = '請輸入姓名';
         }
         
         if (b.allocationType === AllocationType.PROPORTION) {
           hasProportion = true;
           totalRate += Number(b.rate || 0);
         }
      });

      if (hasProportion && totalRate !== 100) {
         newErrors['bene.total'] = `分配比例總和必須為 100% (目前 ${totalRate}%)`;
         isValid = false;
      }
    }

    if (step === 6) { // Payment
      if (data.payment.method === PaymentMethod.CREDIT_CARD) {
        if (!data.payment.cardNo) newErrors['payment.cardNo'] = '請輸入卡號';
        if (!data.payment.expiryDate) newErrors['payment.expiryDate'] = '請輸入效期';
        if (!data.payment.cardAuthIdentity) newErrors['payment.cardAuthIdentity'] = '請選擇授權人身分';
      }
      if (data.payment.method === PaymentMethod.TRANSFER) {
        if (!data.payment.bankCode) newErrors['payment.bankCode'] = '請輸入銀行代碼';
        if (!data.payment.accountNo) newErrors['payment.accountNo'] = '請輸入帳號';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      isValid = false;
    }
    return isValid;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setErrors({});
      
      if (currentStep === STEPS.length - 2) { // Submitting
        handleSubmit();
      } else if (currentStep < STEPS.length - 1) {
        setCurrentStep(c => c + 1);
        window.scrollTo(0, 0);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(c => c - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    // Simulate API Call
    setTimeout(() => {
       const policyNo = generatePolicyNo();
       updateData('policyNo', null, policyNo); // Update root policyNo
       setIsProcessing(false);
       setCurrentStep(c => c + 1); // Go to Success
    }, 1500);
  };

  // --- Renders ---

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Airport
        return (
          <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-center mb-6 text-primary-600 bg-primary-50 w-20 h-20 rounded-full items-center mx-auto">
               <Plane size={40} />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">機場投保</h2>
            <p className="text-center text-gray-500 mb-8">請選擇您所在的機場據點</p>
            
            <div className="space-y-3">
               {['桃園國際機場 (TPE)', '松山機場 (TSA)', '高雄小港機場 (KHH)'].map((airport) => (
                 <div 
                   key={airport}
                   onClick={() => {
                     updateData('airport', null, airport);
                     setErrors({});
                   }}
                   className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between
                     ${data.airport === airport ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-gray-100 hover:border-primary-200'}
                   `}
                 >
                    <span className="font-bold">{airport}</span>
                    {data.airport === airport && <CheckCircle size={20} className="text-primary-600"/>}
                 </div>
               ))}
            </div>
            {errors['airport'] && <p className="text-red-500 text-center mt-4 text-sm">{errors['airport']}</p>}
          </div>
        );

      case 1: // Applicant
        return (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-700 pb-4 border-b border-gray-100">
              <User size={24} className="text-primary-600"/> 要保人資訊
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select 
                label="與被保險人關係"
                value={data.applicant.relation}
                onChange={e => updateData('applicant', 'relation', e.target.value)}
                options={Object.values(Relation).map(v => ({ label: v, value: v }))}
                required
              />
              {data.applicant.relation === Relation.OTHER && (
                <Input 
                  label="關係說明"
                  value={data.applicant.relationNote || ''}
                  onChange={e => updateData('applicant', 'relationNote', e.target.value)}
                  error={errors['applicant.relationNote']}
                  required
                />
              )}
              <Input 
                label="身分證號 (或居留證/護照)" 
                value={data.applicant.idNo} 
                onChange={e => updateData('applicant', 'idNo', e.target.value.toUpperCase())}
                error={errors['applicant.idNo']}
                required 
                placeholder="A123456789"
                maxLength={10}
              />
              <Input 
                label="姓名" 
                value={data.applicant.name} 
                onChange={e => updateData('applicant', 'name', e.target.value)}
                error={errors['applicant.name']}
                required 
              />
              <Select 
                label="性別"
                value={data.applicant.gender}
                onChange={e => updateData('applicant', 'gender', e.target.value)}
                options={Object.values(Gender).map(v => ({ label: v, value: v }))}
                error={errors['applicant.gender']}
                required
              />
              <Input 
                label="生日" 
                type="date"
                value={data.applicant.birthDate} 
                onChange={e => updateData('applicant', 'birthDate', e.target.value)}
                error={errors['applicant.birthDate']}
                required
              />
              <Select 
                label="國籍"
                value={data.applicant.nationality}
                onChange={e => updateData('applicant', 'nationality', e.target.value)}
                options={[{label:'本國', value:'本國'}, {label:'外國', value:'外國'}]}
              />
              <Input 
                label="職業" 
                value={data.applicant.job || ''} 
                onChange={e => updateData('applicant', 'job', e.target.value)}
              />
              <Input 
                label="聯絡電話 (手機)" 
                value={data.applicant.mobile} 
                onChange={e => updateData('applicant', 'mobile', e.target.value)}
                error={errors['applicant.mobile']}
                required
                placeholder="0912345678"
              />
              <Input 
                label="聯絡地址" 
                value={data.applicant.address} 
                onChange={e => updateData('applicant', 'address', e.target.value)}
                fullWidth
                className="md:col-span-2"
              />
            </div>
          </div>
        );

      case 2: // Insured
        return (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-700 pb-4 border-b border-gray-100">
               <Users size={24} className="text-primary-600"/> 被保險人資訊
             </h3>
             <div className="mb-6 flex items-center bg-primary-50 p-4 rounded-lg border border-primary-100">
                <input 
                  type="checkbox" 
                  id="sameAsApplicant" 
                  checked={sameAsApplicant} 
                  onChange={(e) => setSameAsApplicant(e.target.checked)}
                  className="w-5 h-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="sameAsApplicant" className="ml-3 block text-gray-900 font-medium cursor-pointer select-none">
                  同要保人資訊
                </label>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Select 
                  label="與要保人關係"
                  value={data.insured.relation}
                  onChange={e => updateData('insured', 'relation', e.target.value)}
                  options={Object.values(Relation).map(v => ({ label: v, value: v }))}
                  disabled={sameAsApplicant}
                />
                {/* Relation Note could be added here if Insured -> Other */}
               <Input 
                label="姓名" 
                value={data.insured.name} 
                onChange={e => updateData('insured', 'name', e.target.value)}
                error={errors['insured.name']}
                required 
                disabled={sameAsApplicant}
              />
              <Input 
                label="身分證號" 
                value={data.insured.idNo} 
                onChange={e => updateData('insured', 'idNo', e.target.value.toUpperCase())}
                error={errors['insured.idNo']}
                required 
                disabled={sameAsApplicant}
              />
              <Select 
                label="性別"
                value={data.insured.gender}
                onChange={e => updateData('insured', 'gender', e.target.value)}
                options={Object.values(Gender).map(v => ({ label: v, value: v }))}
                error={errors['insured.gender']}
                required
                disabled={sameAsApplicant}
              />
              <Input 
                label="生日" 
                type="date"
                value={data.insured.birthDate} 
                onChange={e => updateData('insured', 'birthDate', e.target.value)}
                error={errors['insured.birthDate']}
                disabled={sameAsApplicant}
              />
              <Select 
                label="國籍"
                value={data.insured.nationality}
                onChange={e => updateData('insured', 'nationality', e.target.value)}
                options={[{label:'本國', value:'本國'}, {label:'外國', value:'外國'}]}
                disabled={sameAsApplicant}
              />
             </div>
          </div>
        );
      
      case 3: // Policy Info
        return (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-700 pb-4 border-b border-gray-100">
              <FileText size={24} className="text-primary-600"/> 投保內容
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Date & Time Row 1 */}
              <div className="grid grid-cols-3 gap-2 md:col-span-2">
                 <div className="col-span-2">
                    <Input 
                      label="保險起日" 
                      type="date"
                      value={data.policy.startDate} 
                      onChange={e => updateData('policy', 'startDate', e.target.value)}
                      error={errors['policy.startDate']}
                      required
                    />
                 </div>
                 <Select 
                   label="時間"
                   value={data.policy.startTime}
                   onChange={e => updateData('policy', 'startTime', e.target.value)}
                   options={Array.from({length:24}).map((_,i) => {
                     const val = String(i).padStart(2,'0')+'00';
                     return {label: `${String(i).padStart(2,'0')}:00`, value: val};
                   })}
                />
              </div>

              {/* Date & Time Row 2 */}
              <div className="grid grid-cols-3 gap-2 md:col-span-2">
                 <div className="col-span-2">
                    <Input 
                      label="保險終日" 
                      type="date"
                      value={data.policy.endDate} 
                      onChange={e => updateData('policy', 'endDate', e.target.value)}
                      error={errors['policy.endDate']}
                      required
                    />
                 </div>
                 <Select 
                   label="時間"
                   value={data.policy.endTime}
                   onChange={e => updateData('policy', 'endTime', e.target.value)}
                   options={Array.from({length:24}).map((_,i) => {
                     const val = String(i).padStart(2,'0')+'00';
                     return {label: `${String(i).padStart(2,'0')}:00`, value: val};
                   })}
                   disabled // Fixed to Start Time usually, or manual
                />
              </div>

              <div className="bg-gray-100 p-3 rounded text-center">
                <label className="text-xs text-gray-500 block mb-1">投保天數</label>
                <span className="text-2xl font-bold text-primary-600">{data.policy.days} 天</span>
                {errors['policy.days'] && <p className="text-xs text-red-500 mt-1">{errors['policy.days']}</p>}
              </div>

              <Select 
                  label="旅遊地區"
                  value={data.policy.region}
                  onChange={e => updateData('policy', 'region', e.target.value)}
                  options={Object.values(TravelRegion).map(v => ({label: v, value: v}))}
                  error={errors['policy.region']}
                  required
              />
              
              <div className="md:col-span-2">
                <Select 
                    label="旅遊地點"
                    value={data.policy.destination}
                    onChange={e => {
                      const plan = e.target.value === 'JP' || e.target.value === 'US' ? 'PLAN_B' : 'PLAN_A';
                      updateData('policy', 'destination', e.target.value);
                      updateData('policy', 'planCode', plan);
                      updateData('policy', 'planName', plan === 'PLAN_A' ? '快樂旅遊保障計劃 A' : '商務安心計劃 B');
                    }}
                    error={errors['policy.destination']}
                    options={[
                      {label:'日本 (Japan)', value:'JP'}, 
                      {label:'美國 (USA)', value:'US'}, 
                      {label:'泰國 (Thailand)', value:'TH'},
                      {label:'中國大陸 (China)', value:'CN'},
                      {label:'韓國 (Korea)', value:'KR'}
                    ]}
                    required
                />
              </div>

              <div className="md:col-span-2 p-4 border border-primary-200 bg-primary-50 rounded-lg">
                 <Select 
                    label="險種組合 (依地點自動推薦)"
                    value={data.policy.planCode}
                    onChange={e => {
                      updateData('policy', 'planCode', e.target.value);
                      updateData('policy', 'planName', e.target.value === 'PLAN_A' ? '快樂旅遊保障計劃 A' : '商務安心計劃 B');
                    }}
                    options={[
                      {label:'快樂旅遊保障計劃 A (基本型)', value:'PLAN_A'}, 
                      {label:'商務安心計劃 B (豪華型)', value:'PLAN_B'}
                    ]}
                    fullWidth
                    required
                    error={errors['policy.planCode']}
                    className="bg-white"
                />
                <div className="mt-2 text-sm text-gray-600 pl-1">
                  包含：意外身故、海外突發疾病、班機延誤等保障。
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Agent
        return (
           <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-700 pb-4 border-b border-gray-100">
               <Briefcase size={24} className="text-primary-600"/> 業務員資訊
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="業務員登錄證號" 
                  value={data.agent.id} 
                  onChange={e => updateData('agent', 'id', e.target.value)}
                  error={errors['agent.id']}
                  required
                  placeholder="請輸入證號 (例如: 123456)"
                  onBlur={() => {
                    if(data.agent.id) {
                      // Mock Agent Lookup
                      updateData('agent', 'name', '王大明');
                      updateData('agent', 'unit', '台北一處');
                      updateData('agent', 'channel', '業務員通路-業一');
                    }
                  }}
                />
                <Input label="姓名" value={data.agent.name} disabled className="bg-gray-100" />
                <Input label="通路別" value={data.agent.channel} disabled className="bg-gray-100" />
                <Input label="通訊處" value={data.agent.unit} disabled className="bg-gray-100" />
             </div>
           </div>
        );

      case 5: // Beneficiaries
        return (
           <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <h3 className="text-xl font-bold flex items-center gap-2 text-gray-700">
                  <Users size={24} className="text-primary-600"/> 受益人資訊
                </h3>
                <button onClick={addBeneficiary} className="text-sm text-primary-600 hover:text-primary-700 font-bold border border-primary-200 px-4 py-2 rounded-full bg-primary-50 hover:bg-primary-100 transition-colors flex items-center">
                  <PlusIcon /> 新增受益人
                </button>
              </div>
              
              {errors['bene.total'] && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm flex items-center border border-red-100">
                  <AlertCircle size={16} className="mr-2"/> {errors['bene.total']}
                </div>
              )}
              
              <div className="space-y-6">
                {data.beneficiaries.map((b, idx) => (
                  <div key={b.id} className="p-6 border border-gray-200 rounded-xl bg-gray-50 relative transition-shadow hover:shadow-sm">
                    <div className="absolute top-0 left-0 bg-gray-200 text-gray-600 px-3 py-1 rounded-br-lg text-xs font-bold">
                      順位 {b.rank}
                    </div>
                    {data.beneficiaries.length > 1 && (
                      <button onClick={() => removeBeneficiary(idx)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 text-xs font-medium">
                        移除此位
                      </button>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <Select 
                        label="關係"
                        value={b.relation}
                        onChange={e => updateBeneficiary(idx, 'relation', e.target.value)}
                        options={Object.values(BeneficiaryRelation).map(v => ({ label: v, value: v }))}
                      />
                      <Input 
                        label="姓名"
                        value={b.name}
                        onChange={e => updateBeneficiary(idx, 'name', e.target.value)}
                        error={errors[`bene.${idx}.name`]}
                        placeholder={b.relation === BeneficiaryRelation.LEGAL_HEIR ? "法定繼承人 (可免填)" : "請輸入姓名"}
                      />
                      <Input 
                        label="身分證號"
                        value={b.idNo}
                        onChange={e => updateBeneficiary(idx, 'idNo', e.target.value.toUpperCase())}
                      />
                      
                      <div className="grid grid-cols-2 gap-2 md:col-span-3 bg-white p-3 rounded border border-gray-200">
                        <Select 
                          label="分配方式"
                          value={b.allocationType}
                          onChange={e => {
                            updateBeneficiary(idx, 'allocationType', e.target.value);
                            if(e.target.value === AllocationType.EQUAL) updateBeneficiary(idx, 'rate', 0);
                          }}
                          options={Object.values(AllocationType).map(v => ({ label: v || '請選擇', value: v }))}
                        />
                        {b.allocationType === AllocationType.PROPORTION && (
                          <Input 
                            label="比例 (%)"
                            type="number"
                            value={b.rate}
                            onChange={e => updateBeneficiary(idx, 'rate', e.target.value)}
                            placeholder="e.g. 50"
                          />
                        )}
                        {b.allocationType === AllocationType.EQUAL && (
                           <div className="flex items-end pb-3 px-2 text-gray-500 text-sm">
                              系統自動均分
                           </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        );

      case 6: // Payment
        return (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-700 pb-4 border-b border-gray-100">
              <CreditCard size={24} className="text-primary-600"/> 繳費方式
            </h3>
            
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
              {Object.values(PaymentMethod).map(method => (
                <label key={method} className={`flex-shrink-0 flex-1 min-w-[120px] border-2 rounded-xl p-4 cursor-pointer transition-all text-center ${data.payment.method === method ? 'border-primary-500 bg-primary-50 text-primary-800 shadow-md' : 'border-gray-100 hover:border-primary-200'}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod"
                    value={method}
                    checked={data.payment.method === method}
                    onChange={() => updateData('payment', 'method', method)}
                    className="hidden"
                  />
                  <div className="font-bold">{method}</div>
                </label>
              ))}
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                 <span className="text-gray-500 font-medium">應收保費</span>
                 <span className="text-3xl font-bold text-primary-600">{formatCurrency(data.payment.amount)}</span>
              </div>
              
              {data.payment.method === PaymentMethod.CREDIT_CARD && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                  <Select 
                    label="信用卡授權人身分"
                    value={data.payment.cardAuthIdentity || ''}
                    onChange={e => updateData('payment', 'cardAuthIdentity', e.target.value)}
                    options={Object.values(CardAuthIdentity).map(v => ({label: v, value: v}))}
                    error={errors['payment.cardAuthIdentity']}
                    required
                  />
                  <div className="flex items-center md:mt-6">
                     <input type="checkbox" className="w-5 h-5 text-primary-600 rounded border-gray-300" />
                     <span className="ml-2 text-gray-700">本人信用卡 (自動帶入)</span>
                  </div>
                  <div className="md:col-span-2">
                    <Input 
                      label="信用卡號" 
                      value={data.payment.cardNo || ''} 
                      onChange={e => updateData('payment', 'cardNo', e.target.value)}
                      placeholder="0000 0000 0000 0000"
                      error={errors['payment.cardNo']}
                      maxLength={19}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 md:col-span-2">
                    <Input label="發卡銀行" value={data.payment.cardBank || ''} disabled className="bg-gray-100" />
                    <Input label="卡別" value={data.payment.cardType || ''} disabled className="bg-gray-100" />
                  </div>

                  <Input 
                    label="有效期限 (MM/YY)" 
                    placeholder="MM/YY"
                    value={data.payment.expiryDate || ''} 
                    onChange={e => updateData('payment', 'expiryDate', e.target.value)}
                    error={errors['payment.expiryDate']}
                    maxLength={5}
                    required
                  />
                  <Input 
                     label="持卡人姓名" 
                     value={data.payment.cardHolderName || ''} 
                     onChange={e => updateData('payment', 'cardHolderName', e.target.value)} 
                  />
                </div>
              )}

              {data.payment.method === PaymentMethod.TRANSFER && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                    <Input label="匯款日期" value={toRocDate(new Date().toISOString())} disabled className="bg-gray-100" />
                    <Input label="匯款金額" value={data.payment.amount} disabled className="bg-gray-100" />
                    
                    <Select 
                       label="銀行代碼"
                       value={data.payment.bankCode || ''}
                       onChange={e => updateData('payment', 'bankCode', e.target.value)}
                       options={[
                         {label:'004 臺灣銀行', value:'004'},
                         {label:'822 中國信託', value:'822'},
                         {label:'013 國泰世華', value:'013'}
                       ]}
                       error={errors['payment.bankCode']}
                    />
                    <Input 
                      label="匯款帳號" 
                      value={data.payment.accountNo || ''}
                      onChange={e => updateData('payment', 'accountNo', e.target.value)}
                      error={errors['payment.accountNo']}
                      maxLength={16}
                    />
                 </div>
              )}
            </div>
          </div>
        );

      case 7: // Confirm
        return (
          <div className="bg-white p-10 rounded-xl shadow-lg border border-primary-100 space-y-8">
             <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">請確認投保資料</h2>
             
             <div className="space-y-6">
                <SectionHeader title="基本資料" icon={<FileText size={18}/>} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pl-4">
                  <ConfirmRow label="受理編號" value="NTA113050000001 (預覽)" />
                  <ConfirmRow label="投保機場" value={data.airport} />
                </div>

                <SectionHeader title="人員資訊" icon={<Users size={18}/>} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pl-4">
                  <ConfirmRow label="要保人" value={`${data.applicant.name} (${data.applicant.idNo})`} />
                  <ConfirmRow label="被保險人" value={`${data.insured.name} (${data.insured.idNo})`} />
                  <ConfirmRow label="關係" value={data.insured.relation} />
                </div>

                <SectionHeader title="投保內容" icon={<Plane size={18}/>} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pl-4">
                  <ConfirmRow label="旅遊地點" value={`${data.policy.region} - ${data.policy.destination}`} />
                  <ConfirmRow label="保險期間" value={`${data.policy.startDate} ${data.policy.startTime} ~ ${data.policy.endDate} ${data.policy.endTime}`} />
                  <ConfirmRow label="天數" value={`${data.policy.days} 天`} />
                  <ConfirmRow label="方案" value={data.policy.planName} />
                </div>

                <SectionHeader title="繳費資訊" icon={<CreditCard size={18}/>} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pl-4">
                   <ConfirmRow label="方式" value={data.payment.method} />
                   <ConfirmRow label="總保費" value={formatCurrency(data.payment.amount)} isHighlight />
                </div>
             </div>
          </div>
        );

      case 8: // Finish
        return (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center animate-fadeIn">
             <div className="flex justify-center mb-8">
               <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                 <CheckCircle size={64} />
               </div>
             </div>
             <h2 className="text-4xl font-bold text-gray-800 mb-4">投保完成!</h2>
             <p className="text-gray-500 mb-8 text-lg">感謝您的投保，電子保單將寄送至您的信箱。</p>
             
             <div className="bg-gray-50 p-6 rounded-lg max-w-md mx-auto mb-10 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">您的保單號碼</p>
                <p className="text-3xl font-mono font-bold text-primary-700 tracking-wider">{data.policyNo || 'Generating...'}</p>
             </div>

             <div className="flex justify-center gap-4">
                <button onClick={() => navigate('/dashboard')} className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-bold transition-colors">
                  回到主頁
                </button>
                <button onClick={() => window.print()} className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-bold shadow-lg shadow-primary-500/30 transition-colors">
                   列印要保書
                </button>
             </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-800">
       {/* Header */}
       <div className="bg-white shadow-sm sticky top-0 z-20 border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4">
            <Steps steps={STEPS} currentStep={currentStep} />
          </div>
       </div>

       {/* Main Content */}
       <div className="flex-1 w-full max-w-4xl mx-auto p-4 md:py-8 md:px-4 mb-20">
         {renderStepContent()}
       </div>

       {/* Footer Actions */}
       {currentStep < 8 && (
          <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
               <button 
                 onClick={prevStep} 
                 disabled={currentStep === 0 || isProcessing}
                 className={`flex items-center px-6 py-3 rounded-lg font-bold transition-colors ${
                   currentStep === 0 
                     ? 'text-gray-300 cursor-not-allowed' 
                     : 'text-gray-600 hover:bg-gray-100'
                 }`}
               >
                 <ArrowLeft size={20} className="mr-2" /> 上一步
               </button>
               
               <div className="flex gap-3">
                 <button disabled={isProcessing} className="hidden md:flex items-center px-5 py-3 text-primary-700 hover:bg-primary-50 rounded-lg font-bold border border-primary-200 transition-colors">
                    <Save size={18} className="mr-2" /> 暫存
                 </button>
                 <button 
                   onClick={nextStep} 
                   disabled={isProcessing}
                   className={`flex items-center px-10 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-bold shadow-lg shadow-primary-500/30 transition-all transform active:scale-95 ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
                 >
                   {isProcessing ? '處理中...' : (currentStep === 7 ? '確認投保' : '下一步')} 
                   {!isProcessing && <ArrowRight size={20} className="ml-2" />}
                 </button>
               </div>
            </div>
          </div>
       )}
    </div>
  );
};

const SectionHeader = ({ title, icon }: { title: string, icon: React.ReactNode }) => (
  <div className="flex items-center gap-2 text-primary-700 font-bold text-lg border-b border-gray-100 pb-2">
    {icon} {title}
  </div>
);

const ConfirmRow = ({ label, value, isHighlight = false }: { label: string, value: string | number | undefined, isHighlight?: boolean }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
    <span className="text-gray-500">{label}</span>
    <span className={`font-medium text-right ${isHighlight ? 'text-xl text-primary-600 font-bold' : 'text-gray-900'}`}>{value || '-'}</span>
  </div>
);

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;