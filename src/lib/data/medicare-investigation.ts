import type {
  Investigation,
  Entity,
  EntityRelationship,
  InvestigationDocument,
  TimelineEvent,
  FCAComplaint,
} from '@/types';

export function generateMedicareInvestigation(): Investigation {
  // ============================================================
  // ENTITIES — The network of fraud
  // ============================================================
  const entities: Entity[] = [
    {
      id: 'ent-001',
      name: 'MedCare Solutions Inc.',
      type: 'provider',
      description: 'Primary healthcare provider and central node in the fraud scheme. Operates 12 clinics across Southern California. Filed $47.3M in Medicare claims (2021-2024), of which an estimated $31.2M are fraudulent.',
      metadata: {
        npi: '1234567890',
        taxId: '95-4567890',
        incorporatedIn: 'Delaware',
        incorporatedDate: '2019-03-15',
        address: '4500 Wilshire Blvd, Suite 800, Los Angeles, CA 90010',
        ceo: 'James R. Morrison',
        employees: '187 (34 suspected phantom)',
      },
      flagged: true,
      totalAmount: 47300000,
    },
    {
      id: 'ent-002',
      name: 'Sunrise Medical Group',
      type: 'provider',
      description: 'Secondary provider involved in patient referral kickback scheme. Refers patients to MedCare for unnecessary diagnostic tests in exchange for per-referral payments.',
      metadata: {
        npi: '9876543210',
        taxId: '95-7654321',
        address: '2200 Pacific Coast Hwy, Long Beach, CA 90803',
        medicalDirector: 'Dr. Lisa Nguyen',
        patients: '~3,400 Medicare beneficiaries',
      },
      flagged: true,
      totalAmount: 12400000,
    },
    {
      id: 'ent-003',
      name: 'Pacific Coast Health Services LLC',
      type: 'shell_company',
      description: 'Shell company used to funnel kickback payments. Registered in Nevada with a virtual office address. No actual employees or medical services. Received $2.1M from MedCare Solutions.',
      metadata: {
        taxId: '88-1234567',
        incorporatedIn: 'Nevada',
        incorporatedDate: '2020-07-22',
        address: 'Registered Agent: 1234 Corporate Way, Carson City, NV 89701',
        registeredAgent: 'Nevada Corp Services LLC',
        actualOperations: 'None identified',
      },
      flagged: true,
      totalAmount: 2100000,
    },
    {
      id: 'ent-004',
      name: 'Golden State Diagnostics',
      type: 'shell_company',
      description: 'Fraudulent diagnostic lab that bills for tests never performed. Connected to MedCare through shared ownership structure. 89% of claims are for high-reimbursement genetic tests.',
      metadata: {
        npi: '5678901234',
        taxId: '95-8901234',
        clia: 'Expired 2023-06-30',
        address: '9800 S. Sepulveda Blvd, Suite 200, Los Angeles, CA 90045',
        labDirector: 'Dr. Robert Chen (also at MedCare)',
      },
      flagged: true,
      totalAmount: 8700000,
    },
    {
      id: 'ent-005',
      name: 'Apex Billing Services',
      type: 'shell_company',
      description: 'Third-party billing company that systematically upcodes procedures and adds phantom charges. Processes claims for MedCare and Golden State Diagnostics.',
      metadata: {
        taxId: '95-3456789',
        address: '7777 Center Ave, Suite 100, Huntington Beach, CA 92647',
        owner: 'Sandra Morrison (spouse of James Morrison)',
        billingVolume: '~$60M annually across clients',
      },
      flagged: true,
      totalAmount: 3200000,
    },
    {
      id: 'ent-006',
      name: 'Dr. Robert Chen',
      type: 'individual',
      description: 'Medical Director at MedCare Solutions and Lab Director at Golden State Diagnostics. Signs off on medically unnecessary tests and treatments. Licensed in California (A-112233).',
      metadata: {
        role: 'Medical Director, MedCare / Lab Director, Golden State',
        medicalLicense: 'CA A-112233',
        dea: 'BC1234567',
        personalAddress: '15200 Mulholland Dr, Los Angeles, CA 90077',
        compensation: '$485,000/yr base + $1.2M in "consulting fees" to Pacific Coast',
      },
      flagged: true,
    },
    {
      id: 'ent-007',
      name: 'Dr. Lisa Nguyen',
      type: 'individual',
      description: 'Medical Director at Sunrise Medical Group. Hidden ownership in Pacific Coast Health Services. Receives kickbacks per patient referred to MedCare for unnecessary procedures.',
      metadata: {
        role: 'Medical Director, Sunrise Medical Group',
        medicalLicense: 'CA A-445566',
        hiddenOwnership: '40% of Pacific Coast Health Services LLC',
        kickbackEstimate: '$800-$1,200 per referral',
        personalAddress: '8900 Marina del Rey Blvd, Marina del Rey, CA 90292',
      },
      flagged: true,
    },
    {
      id: 'ent-008',
      name: 'James R. Morrison',
      type: 'individual',
      description: 'CEO and 100% owner of MedCare Solutions Inc. Mastermind of the fraud scheme. Controls shell company network through family members. Prior healthcare fraud conviction in Florida (2014).',
      metadata: {
        role: 'CEO & Owner, MedCare Solutions Inc.',
        priorConvictions: 'Healthcare fraud, S.D. Florida, Case No. 14-CR-20234 (2014)',
        personalAddress: '2800 Bel Air Rd, Los Angeles, CA 90077',
        vehicles: '2024 Rolls-Royce Spectre, 2023 Mercedes-AMG GT',
        realEstate: '$4.2M Bel Air residence, $1.8M Palm Springs vacation home',
      },
      flagged: true,
    },
    {
      id: 'ent-009',
      name: 'Healthcare Staffing Plus',
      type: 'shell_company',
      description: 'Staffing agency controlled by Morrison family. Bills MedCare for 34 phantom employees at average $65,000/yr. Employees either do not exist or perform no actual work.',
      metadata: {
        taxId: '95-6789012',
        address: 'P.O. Box 45678, Encino, CA 91416',
        owner: 'Michael Morrison (brother of James)',
        phantomEmployees: '34 identified',
        annualBillings: '$2,210,000',
      },
      flagged: true,
      totalAmount: 2210000,
    },
    {
      id: 'ent-010',
      name: 'Centers for Medicare & Medicaid Services',
      type: 'government_entity',
      description: 'Federal payer defrauded through false claims submitted by MedCare Solutions and associated entities. Total estimated loss: $31.2M.',
      metadata: {
        jurisdiction: 'Federal',
        programsAffected: 'Medicare Parts A, B, and D',
        beneficiariesAffected: '~4,800',
        fraudPeriod: 'January 2021 - Present',
      },
      flagged: false,
      totalAmount: 31200000,
    },
    {
      id: 'ent-011',
      name: 'First Pacific National Bank',
      type: 'bank_account',
      description: 'Primary banking institution used for the scheme. Multiple accounts held by Morrison and shell companies. Suspicious transaction patterns identified including structuring.',
      metadata: {
        accountNumbers: '****4521, ****7832, ****9104, ****3367',
        suspiciousActivity: '47 transactions structured below $10,000 reporting threshold',
        totalFlow: '$8.4M in suspicious transfers (2021-2024)',
      },
      flagged: true,
    },
    {
      id: 'ent-012',
      name: 'Delta Management Consulting LLC',
      type: 'shell_company',
      description: 'Shell company used for personal expense laundering. "Consulting fees" from MedCare fund Morrison\'s luxury lifestyle. No legitimate consulting services identified.',
      metadata: {
        taxId: '95-0123456',
        incorporatedIn: 'Wyoming',
        address: 'Registered Agent only - no physical office',
        owner: 'James R. Morrison (through irrevocable trust)',
        disbursements: '$1.8M to personal accounts, $420K luxury auto purchases, $340K travel',
      },
      flagged: true,
      totalAmount: 2560000,
    },
  ];

  // ============================================================
  // RELATIONSHIPS — Payment flows and connections
  // ============================================================
  const relationships: EntityRelationship[] = [
    {
      id: 'rel-001',
      sourceId: 'ent-001', // MedCare
      targetId: 'ent-010', // CMS
      type: 'billing',
      label: 'Fraudulent Medicare Claims',
      amount: 47300000,
      evidence: ['Claims data analysis shows 66% fraud rate', 'Phantom patient billing identified', 'Upcoding on 78% of E/M codes'],
    },
    {
      id: 'rel-002',
      sourceId: 'ent-002', // Sunrise
      targetId: 'ent-010', // CMS
      type: 'billing',
      label: 'Medicare Claims (inflated)',
      amount: 12400000,
      evidence: ['Referral patterns correlate with kickback payments', 'Unnecessary procedures ordered for referred patients'],
    },
    {
      id: 'rel-003',
      sourceId: 'ent-001', // MedCare
      targetId: 'ent-003', // Pacific Coast
      type: 'kickback',
      label: 'Kickback Payments',
      amount: 2100000,
      evidence: ['Wire transfers from MedCare to Pacific Coast', 'No services rendered by Pacific Coast', 'Timing correlates with patient referrals from Sunrise'],
    },
    {
      id: 'rel-004',
      sourceId: 'ent-003', // Pacific Coast
      targetId: 'ent-007', // Dr. Nguyen
      type: 'payment',
      label: 'Hidden Ownership Distributions',
      amount: 840000,
      evidence: ['Bank records show distributions to Dr. Nguyen personal account', 'Nevada corporate filings show 40% ownership'],
    },
    {
      id: 'rel-005',
      sourceId: 'ent-002', // Sunrise
      targetId: 'ent-001', // MedCare
      type: 'referral',
      label: 'Patient Referrals (~2,100 patients)',
      evidence: ['Referral volume 340% above regional average', '94% of referrals result in high-cost procedures', 'No medical necessity documentation for 71%'],
    },
    {
      id: 'rel-006',
      sourceId: 'ent-004', // Golden State
      targetId: 'ent-010', // CMS
      type: 'billing',
      label: 'Lab Claims (89% fraudulent)',
      amount: 8700000,
      evidence: ['CLIA certification expired June 2023', 'Continued billing after expiration', '89% of claims for high-reimbursement genetic tests'],
    },
    {
      id: 'rel-007',
      sourceId: 'ent-006', // Dr. Chen
      targetId: 'ent-001', // MedCare
      type: 'employment',
      label: 'Medical Director',
      evidence: ['Signs off on all treatment plans', 'Authorizes medically unnecessary procedures'],
    },
    {
      id: 'rel-008',
      sourceId: 'ent-006', // Dr. Chen
      targetId: 'ent-004', // Golden State
      type: 'employment',
      label: 'Lab Director (dual role)',
      evidence: ['Concurrent employment violates CMS guidelines', 'Orders labs at Golden State for MedCare patients'],
    },
    {
      id: 'rel-009',
      sourceId: 'ent-008', // Morrison
      targetId: 'ent-001', // MedCare
      type: 'ownership',
      label: '100% Owner & CEO',
      evidence: ['Delaware corporate filings', 'SEC beneficial ownership disclosures'],
    },
    {
      id: 'rel-010',
      sourceId: 'ent-008', // Morrison
      targetId: 'ent-012', // Delta Mgmt
      type: 'ownership',
      label: 'Owner (via trust)',
      evidence: ['Wyoming corporate filings', 'Trust documents obtained via subpoena'],
    },
    {
      id: 'rel-011',
      sourceId: 'ent-001', // MedCare
      targetId: 'ent-012', // Delta Mgmt
      type: 'payment',
      label: '"Consulting Fees"',
      amount: 2560000,
      evidence: ['No consulting services rendered', 'Funds used for personal expenses', 'Luxury vehicle purchases traced'],
    },
    {
      id: 'rel-012',
      sourceId: 'ent-005', // Apex Billing
      targetId: 'ent-001', // MedCare
      type: 'payment',
      label: 'Billing Services (upcoding)',
      amount: 3200000,
      evidence: ['Systematic upcoding of E/M codes', 'Average code level 4.7 vs regional avg 3.2', 'Modifier 25 used on 91% of claims'],
    },
    {
      id: 'rel-013',
      sourceId: 'ent-009', // Healthcare Staffing
      targetId: 'ent-001', // MedCare
      type: 'employment',
      label: 'Phantom Employees (34)',
      amount: 2210000,
      evidence: ['34 employees have no work records', 'SSNs traced to deceased individuals (7)', 'Payroll checks deposited into Morrison-controlled accounts'],
    },
    {
      id: 'rel-014',
      sourceId: 'ent-012', // Delta Mgmt
      targetId: 'ent-011', // First Pacific Bank
      type: 'payment',
      label: 'Laundered Funds',
      amount: 2560000,
      evidence: ['47 structured deposits below $10K threshold', 'Wire transfers to luxury auto dealers', 'Mortgage payments on personal properties'],
    },
    {
      id: 'rel-015',
      sourceId: 'ent-001', // MedCare
      targetId: 'ent-005', // Apex Billing
      type: 'payment',
      label: 'Billing Service Fees',
      amount: 960000,
      evidence: ['Above-market billing fees (8% vs industry 4-5%)', 'Apex owned by Sandra Morrison (spouse)'],
    },
    {
      id: 'rel-016',
      sourceId: 'ent-007', // Dr. Nguyen
      targetId: 'ent-002', // Sunrise
      type: 'employment',
      label: 'Medical Director',
      evidence: ['Employment contract', 'Directs referral patterns'],
    },
    {
      id: 'rel-017',
      sourceId: 'ent-007', // Dr. Nguyen
      targetId: 'ent-003', // Pacific Coast
      type: 'ownership',
      label: 'Hidden 40% Owner',
      evidence: ['Nevada Secretary of State filings', 'Ownership concealed from Sunrise board'],
    },
    {
      id: 'rel-018',
      sourceId: 'ent-006', // Dr. Chen
      targetId: 'ent-003', // Pacific Coast
      type: 'payment',
      label: '"Consulting Fees"',
      amount: 1200000,
      evidence: ['Monthly payments of $100K to Dr. Chen via Pacific Coast', 'No consulting agreement on file', 'Payments correlate with lab orders'],
    },
  ];

  // ============================================================
  // DOCUMENTS — Evidence with AI analysis
  // ============================================================
  const documents: InvestigationDocument[] = [
    {
      id: 'doc-001',
      name: 'Medicare Claims Data Analysis (2021-2024)',
      type: 'claims_data',
      summary: 'Comprehensive analysis of 47,832 Medicare claims filed by MedCare Solutions Inc. and associated entities from January 2021 through December 2024.',
      aiAnalysis: {
        findings: [
          { id: 'f-001', category: 'Upcoding', description: 'E/M code distribution shows systematic upcoding. 78% of claims billed at Level 4-5, compared to regional average of 31%. Statistical probability of legitimate distribution: <0.001%.', severity: 'critical', evidence: 'CPT codes 99214/99215 used on 78% of claims vs. 31% regional benchmark', relatedEntities: ['ent-001', 'ent-005'] },
          { id: 'f-002', category: 'Phantom Billing', description: 'Identified 1,247 claims for services on dates when the listed provider was verifiably not at the clinic (conference attendance, vacation records, etc.).', severity: 'critical', evidence: 'Cross-reference of provider schedules, conference registrations, and travel records with claim dates', relatedEntities: ['ent-001', 'ent-006'] },
          { id: 'f-003', category: 'Unbundling', description: '3,892 instances of procedure unbundling detected. Services that should be billed as a single procedure are split into component parts to increase reimbursement by an estimated 240%.', severity: 'critical', evidence: 'CCI edit analysis of claim pairs filed on same date of service', relatedEntities: ['ent-001', 'ent-005'] },
          { id: 'f-004', category: 'Impossible Billing', description: '412 claims show 25+ unique patients seen by a single provider in a single day, exceeding humanly possible patient volume. Highest single-day count: 47 patients.', severity: 'critical', evidence: 'Provider NPI-level daily claim counts exceed CMS reasonability thresholds', relatedEntities: ['ent-001', 'ent-006'] },
          { id: 'f-005', category: 'Expired Lab Certification', description: 'Golden State Diagnostics continued billing Medicare for $3.2M in lab services after CLIA certification expired on June 30, 2023.', severity: 'critical', evidence: 'CLIA database shows expired certification; claims continue through December 2024', relatedEntities: ['ent-004'] },
        ],
        riskScore: 97,
        keyEntities: ['MedCare Solutions Inc.', 'Golden State Diagnostics', 'Dr. Robert Chen', 'Apex Billing Services'],
        suggestedActions: ['Immediate payment suspension for MedCare Solutions', 'Revoke Golden State CLIA certification', 'Refer Dr. Chen to OIG for exclusion proceedings'],
        processingTime: 4.2,
      },
      uploadedAt: new Date('2025-01-15'),
    },
    {
      id: 'doc-002',
      name: 'Corporate Filings & Ownership Analysis',
      type: 'corporate_filings',
      summary: 'Analysis of corporate filings across Delaware, Nevada, Wyoming, and California revealing hidden ownership connections between entities.',
      aiAnalysis: {
        findings: [
          { id: 'f-006', category: 'Hidden Ownership', description: 'Dr. Lisa Nguyen holds undisclosed 40% ownership in Pacific Coast Health Services LLC, which receives kickback payments from MedCare Solutions. This ownership was not disclosed on her CMS enrollment application.', severity: 'critical', evidence: 'Nevada Secretary of State filing NV20200722-001234', relatedEntities: ['ent-007', 'ent-003'] },
          { id: 'f-007', category: 'Related Party Network', description: 'James Morrison controls 4 entities through direct ownership and trusts: MedCare Solutions, Delta Management, Healthcare Staffing Plus (via brother Michael Morrison), and Apex Billing (via spouse Sandra Morrison).', severity: 'critical', evidence: 'Corporate filings in DE, WY, CA; trust documents from subpoena USDC-CV-2025-0341', relatedEntities: ['ent-008', 'ent-001', 'ent-012', 'ent-009', 'ent-005'] },
          { id: 'f-008', category: 'Prior Fraud History', description: 'James Morrison was convicted of healthcare fraud in S.D. Florida (Case No. 14-CR-20234) in 2014. He was excluded from federal healthcare programs until 2019 but incorporated MedCare immediately upon reinstatement.', severity: 'warning', evidence: 'PACER records, OIG LEIE database, Delaware incorporation timeline', relatedEntities: ['ent-008'] },
        ],
        riskScore: 94,
        keyEntities: ['James R. Morrison', 'Dr. Lisa Nguyen', 'Pacific Coast Health Services LLC', 'Delta Management Consulting LLC'],
        suggestedActions: ['File CMS enrollment revocation for Dr. Nguyen', 'Petition for asset freeze on Morrison-controlled entities', 'Subpoena trust documents for Delta Management'],
        processingTime: 3.1,
      },
      uploadedAt: new Date('2025-01-20'),
    },
    {
      id: 'doc-003',
      name: 'Bank Records & Financial Flow Analysis',
      type: 'financial_records',
      summary: 'Analysis of banking records from First Pacific National Bank covering 4 accounts linked to the fraud scheme (2021-2024).',
      aiAnalysis: {
        findings: [
          { id: 'f-009', category: 'Structured Transactions', description: '47 cash deposits structured below the $10,000 CTR threshold into Delta Management account ****3367. Total: $423,000 over 18 months. Classic structuring pattern.', severity: 'critical', evidence: 'Transaction records from FPNB account ****3367; FinCEN SAR cross-reference', relatedEntities: ['ent-012', 'ent-011', 'ent-008'] },
          { id: 'f-010', category: 'Kickback Payment Timing', description: 'Wire transfers from MedCare to Pacific Coast Health correlate with patient referral batches from Sunrise Medical. Average lag: 12 business days post-referral. R² = 0.89.', severity: 'critical', evidence: 'Statistical correlation analysis of wire transfer dates vs. referral batch dates', relatedEntities: ['ent-001', 'ent-003', 'ent-002'] },
          { id: 'f-011', category: 'Personal Expense Laundering', description: 'Delta Management funds used for: $420K luxury vehicles (2 purchases), $340K travel (private charter), $180K jewelry (Cartier, Tiffany), $1.8M direct transfers to Morrison personal checking.', severity: 'warning', evidence: 'Bank statements, credit card records, purchase receipts from luxury retailers', relatedEntities: ['ent-012', 'ent-008'] },
        ],
        riskScore: 91,
        keyEntities: ['Delta Management Consulting LLC', 'James R. Morrison', 'First Pacific National Bank'],
        suggestedActions: ['File FinCEN referral for structuring violations', 'Seek temporary restraining order on all Morrison-controlled accounts', 'Subpoena personal banking records'],
        processingTime: 5.7,
      },
      uploadedAt: new Date('2025-02-01'),
    },
    {
      id: 'doc-004',
      name: 'Whistleblower Report — Former Billing Manager',
      type: 'whistleblower_report',
      summary: 'Sealed declaration from Sarah Chen (no relation to Dr. Chen), former Billing Manager at MedCare Solutions (2021-2023), filed under seal per 31 U.S.C. § 3730(b)(2).',
      aiAnalysis: {
        findings: [
          { id: 'f-012', category: 'Direct Witness Testimony', description: 'Relator states Morrison personally directed upcoding: "James told us to bill everything as a 99215. He said CMS doesn\'t audit individual claims under $500." Relator has contemporaneous notes from 12 staff meetings.', severity: 'critical', evidence: 'Sealed declaration ¶¶ 14-27; meeting notes exhibits A-L', relatedEntities: ['ent-008', 'ent-001'] },
          { id: 'f-013', category: 'Phantom Employee Scheme', description: 'Relator identified 34 names on MedCare payroll who never appeared at work. "I asked James about employees I\'d never seen. He told me to mind my own business and process the timesheets." 7 SSNs traced to deceased individuals.', severity: 'critical', evidence: 'Sealed declaration ¶¶ 31-45; payroll records exhibit M; SSA death index cross-reference', relatedEntities: ['ent-008', 'ent-009'] },
          { id: 'f-014', category: 'Retaliation', description: 'Relator was terminated after raising concerns to MedCare compliance officer. Termination occurred within 14 days of internal complaint. MedCare has no record of the compliance complaint.', severity: 'warning', evidence: 'Sealed declaration ¶¶ 48-52; employment records; timeline analysis', relatedEntities: ['ent-001', 'ent-008'] },
        ],
        riskScore: 96,
        keyEntities: ['James R. Morrison', 'MedCare Solutions Inc.', 'Healthcare Staffing Plus'],
        suggestedActions: ['Protect whistleblower identity per FCA seal requirements', 'Corroborate payroll records with SSA', 'Interview additional former employees'],
        processingTime: 2.8,
      },
      uploadedAt: new Date('2025-02-10'),
    },
    {
      id: 'doc-005',
      name: 'OIG Audit Report — MedCare Billing Patterns',
      type: 'audit_report',
      summary: 'Office of Inspector General audit of MedCare Solutions billing patterns, triggered by automated fraud detection algorithms.',
      aiAnalysis: {
        findings: [
          { id: 'f-015', category: 'Statistical Anomaly', description: 'MedCare\'s claim denial rate is 2.1% compared to 15.3% regional average. This abnormally low denial rate, combined with high billing volume, suggests claims are specifically crafted to avoid automated denial rules while maximizing reimbursement.', severity: 'critical', evidence: 'CMS claims processing data; regional benchmarking analysis', relatedEntities: ['ent-001', 'ent-005'] },
          { id: 'f-016', category: 'Geographic Impossibility', description: '238 claims show services provided to patients whose home addresses are >200 miles from MedCare clinic locations, with no documentation of travel or telemedicine authorization.', severity: 'warning', evidence: 'Beneficiary address cross-reference with service locations', relatedEntities: ['ent-001'] },
          { id: 'f-017', category: "Benford's Law Violation", description: 'Charge amounts across all MedCare claims show significant deviation from expected Benford\'s Law distribution (χ² = 847.3, p < 0.0001). Leading digit "9" appears in 22.1% of charges vs expected 4.6%.', severity: 'critical', evidence: "Benford's Law analysis of 47,832 claim amounts", relatedEntities: ['ent-001', 'ent-005'] },
        ],
        riskScore: 93,
        keyEntities: ['MedCare Solutions Inc.', 'Apex Billing Services'],
        suggestedActions: ['Escalate to DOJ for civil and criminal investigation', 'Implement pre-payment review for all MedCare claims', 'Issue overpayment demand letter'],
        processingTime: 6.3,
      },
      uploadedAt: new Date('2025-02-15'),
    },
    {
      id: 'doc-006',
      name: 'Intercepted Communications — Morrison & Chen',
      type: 'correspondence',
      summary: 'Email and text message communications between James Morrison and Dr. Robert Chen obtained pursuant to court order (Magistrate Judge Order 25-MC-0089).',
      aiAnalysis: {
        findings: [
          { id: 'f-018', category: 'Explicit Fraud Direction', description: 'Morrison to Chen (email, 03/15/2023): "Make sure every patient gets the full panel. I don\'t care if they only came in for a flu shot. The genetics panel alone is worth $4,200 to us." Direct evidence of ordering medically unnecessary tests.', severity: 'critical', evidence: 'Email exhibit F-001; Google Workspace metadata confirms authenticity', relatedEntities: ['ent-008', 'ent-006'] },
          { id: 'f-019', category: 'Kickback Discussion', description: 'Morrison to Chen (text, 07/22/2023): "Nguyen wants more per head. Tell her $1,200 starting next month or she can find another lab." Evidence of explicit kickback negotiation.', severity: 'critical', evidence: 'Text message exhibit F-014; carrier records corroborate', relatedEntities: ['ent-008', 'ent-006', 'ent-007'] },
          { id: 'f-020', category: 'Obstruction Evidence', description: 'Morrison to Chen (email, 01/05/2025): "Delete everything about the staffing company. Use Signal from now on. My lawyer says they might be looking at us." Evidence of consciousness of guilt and potential obstruction.', severity: 'critical', evidence: 'Email exhibit F-023; recovered from server backup after deletion attempt', relatedEntities: ['ent-008', 'ent-006'] },
        ],
        riskScore: 99,
        keyEntities: ['James R. Morrison', 'Dr. Robert Chen', 'Dr. Lisa Nguyen'],
        suggestedActions: ['Preserve all electronic communications immediately', 'Consider criminal referral for obstruction', 'Seek expedited discovery before further spoliation'],
        processingTime: 3.5,
      },
      uploadedAt: new Date('2025-02-20'),
    },
  ];

  // ============================================================
  // TIMELINE
  // ============================================================
  const timeline: TimelineEvent[] = [
    { id: 'tl-001', date: new Date('2019-03-15'), title: 'MedCare Solutions Incorporated', description: 'James Morrison incorporates MedCare Solutions in Delaware, just months after OIG exclusion period ends.', type: 'milestone' },
    { id: 'tl-002', date: new Date('2020-07-22'), title: 'Shell Company Network Established', description: 'Pacific Coast Health Services LLC incorporated in Nevada. Golden State Diagnostics and Healthcare Staffing Plus follow within 6 months.', type: 'milestone' },
    { id: 'tl-003', date: new Date('2021-01-15'), title: 'Fraudulent Billing Begins', description: 'First wave of fraudulent Medicare claims filed. Initial claims are conservative to avoid detection.', type: 'evidence' },
    { id: 'tl-004', date: new Date('2021-06-01'), title: 'Kickback Arrangement Initiated', description: 'First wire transfer from MedCare to Pacific Coast Health, correlating with patient referrals from Sunrise Medical Group.', type: 'evidence' },
    { id: 'tl-005', date: new Date('2022-03-15'), title: 'Billing Volume Escalates', description: 'MedCare claim volume increases 180% year-over-year. Upcoding becomes systematic after Apex Billing takes over claims processing.', type: 'evidence' },
    { id: 'tl-006', date: new Date('2023-06-30'), title: 'Golden State CLIA Certification Expires', description: 'Lab certification expires but billing continues unchanged. $3.2M in claims filed after expiration.', type: 'evidence' },
    { id: 'tl-007', date: new Date('2023-09-01'), title: 'Whistleblower Files Complaint', description: 'Sarah Chen files sealed qui tam complaint under the False Claims Act. Government investigation begins.', type: 'filing' },
    { id: 'tl-008', date: new Date('2024-02-15'), title: 'OIG Audit Initiated', description: 'Office of Inspector General opens formal audit based on automated fraud detection flags and whistleblower allegations.', type: 'action' },
    { id: 'tl-009', date: new Date('2024-08-01'), title: 'Bank Records Subpoenaed', description: 'Grand jury subpoena issued for First Pacific National Bank records covering all Morrison-associated accounts.', type: 'action' },
    { id: 'tl-010', date: new Date('2025-01-05'), title: 'Obstruction Evidence Discovered', description: 'Morrison emails Dr. Chen directing destruction of evidence. Email recovered from server backup.', type: 'discovery' },
    { id: 'tl-011', date: new Date('2025-01-15'), title: 'WasteWatch Analysis Begins', description: 'Full dataset loaded into WasteWatch platform. AI analysis identifies network structure and quantifies fraud.', type: 'action' },
    { id: 'tl-012', date: new Date('2025-02-25'), title: 'FCA Complaint Drafted', description: 'Draft False Claims Act complaint generated with specific factual allegations, damage calculations, and treble damages.', type: 'filing' },
  ];

  // ============================================================
  // FCA COMPLAINT
  // ============================================================
  const complaint: FCAComplaint = {
    caseNumber: 'CV-2025-03892-FCA',
    relator: 'Sarah Chen, former Billing Manager, MedCare Solutions Inc.',
    defendants: [
      'MedCare Solutions Inc.',
      'James R. Morrison, individually',
      'Dr. Robert Chen, individually',
      'Dr. Lisa Nguyen, individually',
      'Golden State Diagnostics',
      'Pacific Coast Health Services LLC',
      'Apex Billing Services',
      'Healthcare Staffing Plus',
    ],
    jurisdiction: 'United States District Court, Central District of California',
    statuteOfLimitations: new Date('2027-09-01'),
    totalDamages: 31200000,
    trebleDamages: 93600000,
    counts: [
      {
        number: 1,
        title: 'False Claims — Fraudulent Medicare Billing',
        statute: '31 U.S.C. § 3729(a)(1)(A)',
        description: 'Defendants knowingly presented, or caused to be presented, false or fraudulent claims for payment to Medicare, including but not limited to: (a) claims for medically unnecessary diagnostic tests and procedures; (b) claims using upcoded E/M codes that did not reflect services actually rendered; (c) claims for services not actually performed ("phantom billing"); and (d) claims for laboratory services performed without valid CLIA certification. From January 2021 through the present, Defendants submitted approximately 47,832 false claims totaling $47,300,000 in fraudulent billings, of which approximately $31,200,000 constitutes the Government\'s actual damages.',
        amount: 31200000,
      },
      {
        number: 2,
        title: 'False Statements — Concealment of Kickback Arrangements',
        statute: '31 U.S.C. § 3729(a)(1)(B)',
        description: 'Defendants knowingly made, used, or caused to be made or used, false records and statements material to false and fraudulent claims, including but not limited to: (a) false CMS enrollment applications concealing Dr. Nguyen\'s ownership interest in Pacific Coast Health Services; (b) false certifications of compliance with the Anti-Kickback Statute; and (c) false statements regarding the medical necessity of referred procedures.',
        amount: 2100000,
      },
      {
        number: 3,
        title: 'Conspiracy to Defraud the Government',
        statute: '31 U.S.C. § 3729(a)(1)(C)',
        description: 'Defendants conspired to defraud the Government by knowingly concealing and improperly avoiding an obligation to pay and transmit money to the Government, specifically by: (a) establishing a network of shell companies to disguise kickback payments; (b) using phantom employees to extract additional funds; (c) laundering fraud proceeds through Delta Management Consulting; and (d) attempting to destroy evidence upon learning of the investigation.',
        amount: 5970000,
      },
      {
        number: 4,
        title: 'Anti-Kickback Statute Violations Giving Rise to False Claims',
        statute: '42 U.S.C. § 1320a-7b(b); 31 U.S.C. § 3729(a)(1)(A)',
        description: 'Defendants violated the Anti-Kickback Statute by offering, paying, soliciting, and receiving remuneration to induce patient referrals for services covered by Medicare. Specifically: (a) MedCare paid $2,100,000 to Pacific Coast Health (controlled by Dr. Nguyen) as kickbacks for patient referrals from Sunrise Medical Group; (b) Dr. Chen received $1,200,000 in "consulting fees" through Pacific Coast Health. Each claim resulting from these kickback arrangements constitutes a separate false claim under the FCA per the 2010 ACA amendment.',
        amount: 3300000,
      },
    ],
    factualAllegations: [
      'MedCare Solutions Inc., through its CEO James R. Morrison, operated a systematic healthcare fraud scheme from January 2021 to the present, defrauding Medicare of approximately $31.2 million through a combination of false claims, kickback payments, phantom billing, and upcoding.',
      'Morrison, who was previously convicted of healthcare fraud in the Southern District of Florida (Case No. 14-CR-20234, 2014), incorporated MedCare Solutions in Delaware on March 15, 2019—the same month his OIG exclusion period ended—and immediately began establishing the infrastructure for the current fraud scheme.',
      'The scheme operated through a network of shell companies controlled by Morrison and his family members: Delta Management Consulting LLC (Wyoming, controlled by Morrison through an irrevocable trust), Healthcare Staffing Plus (owned by Michael Morrison, brother), and Apex Billing Services (owned by Sandra Morrison, spouse). Pacific Coast Health Services LLC (Nevada) was used to funnel kickback payments to Dr. Lisa Nguyen.',
      'Dr. Robert Chen served simultaneously as Medical Director of MedCare Solutions and Lab Director of Golden State Diagnostics, ordering medically unnecessary genetic tests that generated $8.7 million in fraudulent claims. Chen continued to order and bill for lab tests after Golden State\'s CLIA certification expired on June 30, 2023, generating $3.2 million in post-expiration claims.',
      'Dr. Lisa Nguyen, Medical Director of Sunrise Medical Group, referred approximately 2,100 patients to MedCare for medically unnecessary procedures, receiving kickback payments through her hidden 40% ownership interest in Pacific Coast Health Services. This referral volume was 340% above the regional average, and 71% of referred procedures lacked medical necessity documentation.',
      'Morrison directed the upcoding scheme personally, instructing billing staff to code all evaluation and management services at the highest levels (99214/99215). The resulting code distribution—78% at Level 4-5 versus a 31% regional average—is statistically impossible for a legitimate practice (p < 0.001).',
      'Healthcare Staffing Plus billed MedCare $2,210,000 for 34 phantom employees who either did not exist or performed no actual work. Seven of the Social Security numbers on file belong to deceased individuals, as confirmed by the Social Security Administration Death Master File.',
      'Morrison laundered fraud proceeds through Delta Management Consulting, which received $2,560,000 in "consulting fees" from MedCare despite providing no legitimate consulting services. These funds were used for personal luxury purchases including two luxury vehicles ($420,000), private travel ($340,000), jewelry ($180,000), and direct transfers to Morrison\'s personal bank accounts ($1,800,000).',
      'Upon learning of the investigation, Morrison directed Dr. Chen via email on January 5, 2025, to "delete everything about the staffing company" and switch to encrypted messaging, evidencing consciousness of guilt and potential obstruction of justice.',
      'The total damages to the Government are estimated at $31,200,000. Under the False Claims Act\'s treble damages provision (31 U.S.C. § 3729(a)(1)), Defendants are liable for $93,600,000 plus civil penalties of $13,946 to $27,894 per false claim for the approximately 47,832 false claims submitted.',
    ],
    generatedAt: new Date('2025-02-25'),
  };

  return {
    id: 'inv-medicare-001',
    title: 'United States ex rel. Chen v. MedCare Solutions Inc. et al.',
    type: 'fca',
    status: 'active',
    summary: 'False Claims Act investigation into a $31.2M Medicare fraud scheme operated by MedCare Solutions Inc. and a network of shell companies. The scheme involves fraudulent billing, kickback payments, phantom employees, and upcoding directed by CEO James Morrison. Investigation initiated by whistleblower Sarah Chen, former Billing Manager.',
    totalFraudAmount: 31200000,
    entities,
    relationships,
    documents,
    timeline,
    complaint,
    createdAt: new Date('2023-09-01'),
    updatedAt: new Date('2025-02-25'),
  };
}
