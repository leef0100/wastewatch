import type {
  Organization,
  Department,
  Vendor,
  Transaction,
  Contract,
  Flag,
  DemoData,
  Investigation,
} from '@/types';
import { generateMedicareInvestigation } from './medicare-investigation';

// Seeded random for reproducible demo data
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.round((rand() * (max - min) + min) * 100) / 100;
}

function randomDate(start: Date, end: Date): Date {
  const s = start.getTime();
  const e = end.getTime();
  return new Date(s + rand() * (e - s));
}

function getFiscalQuarter(date: Date): number {
  const month = date.getMonth();
  if (month >= 9) return 1; // Oct-Dec = Q1
  if (month >= 6) return 4; // Jul-Sep = Q4
  if (month >= 3) return 3; // Apr-Jun = Q3
  return 2; // Jan-Mar = Q2
}

function getFiscalYear(date: Date): string {
  const month = date.getMonth();
  const year = date.getFullYear();
  return month >= 9 ? `FY${year + 1}` : `FY${year}`;
}

const CATEGORIES = [
  'Software & Licenses',
  'Consulting Services',
  'Travel & Transportation',
  'Office Supplies',
  'Facilities & Maintenance',
  'Training & Development',
  'Equipment & Hardware',
  'Professional Services',
  'Telecommunications',
  'Utilities',
  'Insurance',
  'Marketing & Communications',
  'Legal Services',
  'Catering & Events',
  'Temporary Staffing',
];

const DESCRIPTIONS = [
  'Annual license renewal',
  'Quarterly consulting engagement',
  'Staff travel reimbursement',
  'Office supply order',
  'Building maintenance contract',
  'Employee training program',
  'Server hardware purchase',
  'Advisory services',
  'Monthly telecom charges',
  'Utility payment',
  'Annual insurance premium',
  'Public relations campaign',
  'Outside legal counsel',
  'Team event catering',
  'Contractor staffing',
  'Cloud hosting services',
  'Security audit services',
  'Data analytics platform',
  'Conference attendance',
  'Print and reproduction',
  'Vehicle fleet maintenance',
  'Furniture procurement',
  'IT support services',
  'Document management system',
  'Payroll processing services',
];

export function generateDemoData(): DemoData {
  // Organization
  const organization: Organization = {
    id: 'org-fbas-001',
    name: 'Federal Bureau of Administrative Services (FBAS)',
    industry: 'government',
    employeeCount: '5,001-10,000',
    annualBudget: 85000000,
    createdAt: new Date('2024-01-01'),
  };

  // 12 Departments
  const departmentDefs = [
    { name: 'Information Technology', budget: 12500000, headcount: 245 },
    { name: 'Human Resources', budget: 6800000, headcount: 120 },
    { name: 'Procurement', budget: 8200000, headcount: 95 },
    { name: 'Facilities Management', budget: 9500000, headcount: 180 },
    { name: 'Legal Affairs', budget: 5200000, headcount: 65 },
    { name: 'Finance & Accounting', budget: 4800000, headcount: 85 },
    { name: 'Communications', budget: 3500000, headcount: 55 },
    { name: 'Training & Development', budget: 4200000, headcount: 70 },
    { name: 'Field Operations', budget: 14000000, headcount: 350 },
    { name: 'Executive Office', budget: 6500000, headcount: 40 },
    { name: 'Research & Analysis', budget: 5800000, headcount: 90 },
    { name: 'Security', budget: 4000000, headcount: 75 },
  ];

  const departments: Department[] = departmentDefs.map((d, i) => ({
    id: `dept-${String(i + 1).padStart(3, '0')}`,
    name: d.name,
    organizationId: organization.id,
    allocatedBudget: d.budget,
    headcount: d.headcount,
  }));

  // 55 Vendors (including 2 ghost vendors)
  const vendorDefs = [
    { name: 'Acme Technology Solutions', address: '1200 Innovation Drive, Arlington, VA 22201', website: 'https://acmetech.example.com', email: 'billing@acmetech.example.com' },
    { name: 'Pinnacle Consulting Group', address: '800 K Street NW, Suite 400, Washington, DC 20001', website: 'https://pinnaclecg.example.com', email: 'accounts@pinnaclecg.example.com' },
    { name: 'Meridian Office Supplies', address: '345 Commerce Blvd, Tysons, VA 22182', website: 'https://meridianoffice.example.com', email: 'orders@meridianoffice.example.com' },
    { name: 'Sterling Facilities Corp', address: '2100 M Street NW, Washington, DC 20037', website: 'https://sterlingfac.example.com', email: 'service@sterlingfac.example.com' },
    { name: 'DataStream Analytics', address: '500 Tech Park Way, Reston, VA 20190', website: 'https://datastream.example.com', email: 'sales@datastream.example.com' },
    { name: 'Atlas Security Services', address: '750 Defense Highway, Annapolis, MD 21401', website: 'https://atlassec.example.com', email: 'contracts@atlassec.example.com' },
    { name: 'Vanguard Training Institute', address: '1800 Diagonal Road, Alexandria, VA 22314', website: 'https://vanguardti.example.com', email: 'programs@vanguardti.example.com' },
    { name: 'CloudFirst Hosting', address: '400 Cloud Center, Ashburn, VA 20147', website: 'https://cloudfirst.example.com', email: 'support@cloudfirst.example.com' },
    { name: 'Heritage Legal Services', address: '1100 Connecticut Ave NW, Washington, DC 20036', website: 'https://heritagelegal.example.com', email: 'billing@heritagelegal.example.com' },
    { name: 'National Print Services', address: '600 Print Lane, College Park, MD 20742', website: 'https://natprint.example.com', email: 'orders@natprint.example.com' },
    { name: 'Eagle Transport LLC', address: '900 Logistics Drive, Manassas, VA 20109', website: 'https://eagletransport.example.com', email: 'dispatch@eagletransport.example.com' },
    { name: 'Beacon HR Solutions', address: '350 HR Plaza, Bethesda, MD 20814', website: 'https://beaconhr.example.com', email: 'info@beaconhr.example.com' },
    { name: 'ProTech Systems', address: '2200 Crystal Drive, Arlington, VA 22202', website: 'https://protechsys.example.com', email: 'sales@protechsys.example.com' },
    { name: 'Capitol Catering Co', address: '150 Food Court Way, Silver Spring, MD 20901', website: 'https://capitolcatering.example.com', email: 'events@capitolcatering.example.com' },
    { name: 'Federal Telecom Inc', address: '3000 Telecom Blvd, McLean, VA 22102', website: 'https://fedtelecom.example.com', email: 'accounts@fedtelecom.example.com' },
    { name: 'Summit Insurance Group', address: '1500 Insurance Row, Fairfax, VA 22030', website: 'https://summitins.example.com', email: 'claims@summitins.example.com' },
    { name: 'BrightPath Consulting', address: '700 Advisory Lane, Rockville, MD 20850', website: 'https://brightpath.example.com', email: 'engage@brightpath.example.com' },
    { name: 'CoreNet Infrastructure', address: '1000 Network Center, Chantilly, VA 20151', website: 'https://corenet.example.com', email: 'ops@corenet.example.com' },
    { name: 'Alliance Staffing Partners', address: '450 Staffing Way, Falls Church, VA 22046', website: 'https://alliancestaffing.example.com', email: 'jobs@alliancestaffing.example.com' },
    { name: 'GreenSpace Maintenance', address: '200 Landscape Drive, Bowie, MD 20715', website: 'https://greenspacemaint.example.com', email: 'service@greenspacemaint.example.com' },
    { name: 'Quantum Research Labs', address: '3500 Research Parkway, Greenbelt, MD 20770', website: 'https://quantumrl.example.com', email: 'lab@quantumrl.example.com' },
    { name: 'SecureDoc Solutions', address: '800 Document Drive, Herndon, VA 20170', website: 'https://securedoc.example.com', email: 'info@securedoc.example.com' },
    { name: 'Metro Fleet Services', address: '1200 Auto Park Way, Woodbridge, VA 22191', website: 'https://metrofleet.example.com', email: 'service@metrofleet.example.com' },
    { name: 'Apex Software Inc', address: '600 Code Center, Tysons, VA 22182', website: 'https://apexsw.example.com', email: 'licenses@apexsw.example.com' },
    { name: 'Patriot Energy Solutions', address: '900 Power Grid Rd, Frederick, MD 21701', website: 'https://patriotenergy.example.com', email: 'billing@patriotenergy.example.com' },
    { name: 'Liberty Office Furniture', address: '300 Furniture Ave, Springfield, VA 22150', website: 'https://libertyoffice.example.com', email: 'sales@libertyoffice.example.com' },
    { name: 'TrueNorth Analytics', address: '450 Data Way, Laurel, MD 20707', website: 'https://truenorth.example.com', email: 'analytics@truenorth.example.com' },
    { name: 'Federal Learning Group', address: '1600 Education Drive, Alexandria, VA 22301', website: 'https://fedlearn.example.com', email: 'training@fedlearn.example.com' },
    { name: 'Civic Media Partners', address: '100 Media Row, Washington, DC 20005', website: 'https://civicmedia.example.com', email: 'pr@civicmedia.example.com' },
    { name: 'Ironclad Cybersecurity', address: '2500 Cyber Blvd, Columbia, MD 21044', website: 'https://ironcladcyber.example.com', email: 'soc@ironcladcyber.example.com' },
    { name: 'Commonwealth Utilities', address: '700 Utility Parkway, Richmond, VA 23219', website: 'https://cwutilities.example.com', email: 'billing@cwutilities.example.com' },
    { name: 'RedLine Emergency Services', address: '400 First Responder Way, Fairfax, VA 22030', website: 'https://redlineemg.example.com', email: 'ops@redlineemg.example.com' },
    { name: 'Blue Horizon Travel', address: '250 Travel Center, Arlington, VA 22201', website: 'https://bluehorizon.example.com', email: 'bookings@bluehorizon.example.com' },
    { name: 'Keystone Construction', address: '1800 Builder Blvd, Gaithersburg, MD 20878', website: 'https://keystoneconst.example.com', email: 'projects@keystoneconst.example.com' },
    { name: 'Pacific Rim Imports', address: '500 Trade Center, Dulles, VA 20166', website: 'https://pacificrim.example.com', email: 'import@pacificrim.example.com' },
    { name: 'Silverline Communications', address: '350 Comms Drive, Reston, VA 20191', website: 'https://silverline.example.com', email: 'media@silverline.example.com' },
    { name: 'Fortis Benefits Admin', address: '800 Benefits Way, Rockville, MD 20852', website: 'https://fortisbenefits.example.com', email: 'admin@fortisbenefits.example.com' },
    { name: 'Nova Environmental', address: '600 Green Tech Park, Manassas, VA 20110', website: 'https://novaenv.example.com', email: 'projects@novaenv.example.com' },
    { name: 'Crestview Logistics', address: '1100 Logistics Hub, Hagerstown, MD 21740', website: 'https://crestviewlog.example.com', email: 'dispatch@crestviewlog.example.com' },
    { name: 'Paradigm Software Solutions', address: '2000 Software Lane, Herndon, VA 20171', website: 'https://paradigmss.example.com', email: 'support@paradigmss.example.com' },
    { name: 'Central Valley Services', address: '400 Service Road, Winchester, VA 22601', website: 'https://centralvalley.example.com', email: 'service@centralvalley.example.com' },
    { name: 'Northstar Compliance', address: '750 Regulatory Way, Washington, DC 20004', website: 'https://northstarcomp.example.com', email: 'audit@northstarcomp.example.com' },
    { name: 'Granite Risk Management', address: '1300 Risk Assessment Blvd, McLean, VA 22101', website: 'https://graniterisk.example.com', email: 'assess@graniterisk.example.com' },
    { name: 'TechBridge Solutions', address: '550 Bridge Way, Columbia, MD 21046', website: 'https://techbridge.example.com', email: 'hello@techbridge.example.com' },
    { name: 'Sentinel Monitoring Corp', address: '900 Watch Tower Drive, Annapolis, MD 21401', website: 'https://sentinelmon.example.com', email: 'ops@sentinelmon.example.com' },
    { name: 'Harmony Wellness Programs', address: '200 Wellness Center, Bethesda, MD 20817', website: 'https://harmonywp.example.com', email: 'programs@harmonywp.example.com' },
    { name: 'DirectSource Procurement', address: '1400 Supply Chain Way, Chantilly, VA 20152', website: 'https://directsource.example.com', email: 'purchasing@directsource.example.com' },
    { name: 'Evergreen Janitorial', address: '100 Clean Street, Bowie, MD 20716', website: 'https://evergreenjan.example.com', email: 'service@evergreenjan.example.com' },
    { name: 'Pinnacle AV Systems', address: '650 AV Center, Tysons, VA 22181', website: 'https://pinnacleav.example.com', email: 'install@pinnacleav.example.com' },
    { name: 'Oakridge Data Centers', address: '3000 Server Farm Rd, Ashburn, VA 20148', website: 'https://oakridgedc.example.com', email: 'hosting@oakridgedc.example.com' },
    { name: 'FreedomServe Consulting', address: '1700 Liberty Ave, Fairfax, VA 22031', website: 'https://freedomserve.example.com', email: 'engage@freedomserve.example.com' },
    { name: 'Capitol Records Management', address: '850 Archive Way, College Park, MD 20740', website: 'https://capitolrm.example.com', email: 'records@capitolrm.example.com' },
    { name: 'Phantom Services LLC', address: 'P.O. Box 99201, Wilmington, DE 19899', website: undefined, email: undefined },
    { name: 'GrayMatter Advisors', address: 'P.O. Box 44582, Las Vegas, NV 89116', website: undefined, email: undefined },
    { name: 'Vertex Cloud Platforms', address: '1500 Cloud Nine Blvd, Reston, VA 20190', website: 'https://vertexcloud.example.com', email: 'cloud@vertexcloud.example.com' },
  ];

  const vendors: Vendor[] = vendorDefs.map((v, i) => ({
    id: `vendor-${String(i + 1).padStart(3, '0')}`,
    name: v.name,
    organizationId: organization.id,
    address: v.address,
    contactEmail: v.email,
    website: v.website,
    riskScore: 0,
    totalPaid: 0,
    transactionCount: 0,
  }));

  // Ghost vendors are indices 52, 53
  const ghostVendorIds = [vendors[52].id, vendors[53].id];

  // Vendor-department affinities (which vendors commonly serve which departments)
  const vendorDeptAffinities: Record<string, string[]> = {
    [vendors[0].id]: ['dept-001', 'dept-011'], // Acme Tech → IT, Research
    [vendors[1].id]: ['dept-010', 'dept-006'], // Pinnacle Consulting → Exec, Finance
    [vendors[2].id]: ['dept-003', 'dept-002'], // Meridian Office → Procurement, HR
    [vendors[3].id]: ['dept-004'], // Sterling Facilities → Facilities
    [vendors[4].id]: ['dept-001', 'dept-011'], // DataStream → IT, Research
    [vendors[5].id]: ['dept-012'], // Atlas Security → Security
    [vendors[6].id]: ['dept-008'], // Vanguard Training → Training
    [vendors[7].id]: ['dept-001'], // CloudFirst → IT
    [vendors[8].id]: ['dept-005'], // Heritage Legal → Legal
    [vendors[9].id]: ['dept-007'], // National Print → Communications
    [vendors[10].id]: ['dept-009'], // Eagle Transport → Field Ops
    [vendors[11].id]: ['dept-002'], // Beacon HR → HR
    [vendors[12].id]: ['dept-001'], // ProTech → IT
    [vendors[13].id]: ['dept-010', 'dept-002'], // Capitol Catering → Exec, HR
    [vendors[14].id]: ['dept-001', 'dept-007'], // Federal Telecom → IT, Communications
    [vendors[15].id]: ['dept-006'], // Summit Insurance → Finance
    [vendors[16].id]: ['dept-003', 'dept-006'], // BrightPath → Procurement, Finance
    [vendors[17].id]: ['dept-001'], // CoreNet → IT
    [vendors[18].id]: ['dept-002', 'dept-009'], // Alliance Staffing → HR, Field Ops
    [vendors[19].id]: ['dept-004'], // GreenSpace → Facilities
    [vendors[20].id]: ['dept-011'], // Quantum Research → Research
    [vendors[21].id]: ['dept-005', 'dept-006'], // SecureDoc → Legal, Finance
    [vendors[22].id]: ['dept-009'], // Metro Fleet → Field Ops
    [vendors[23].id]: ['dept-001'], // Apex Software → IT
    [vendors[24].id]: ['dept-004'], // Patriot Energy → Facilities
    [vendors[25].id]: ['dept-004', 'dept-010'], // Liberty Furniture → Facilities, Exec
    [vendors[26].id]: ['dept-011'], // TrueNorth → Research
    [vendors[27].id]: ['dept-008'], // Federal Learning → Training
    [vendors[28].id]: ['dept-007'], // Civic Media → Communications
    [vendors[29].id]: ['dept-012', 'dept-001'], // Ironclad Cyber → Security, IT
    [vendors[30].id]: ['dept-004'], // Commonwealth Utilities → Facilities
    [vendors[31].id]: ['dept-012', 'dept-009'], // RedLine Emergency → Security, Field Ops
    [vendors[32].id]: ['dept-009', 'dept-010'], // Blue Horizon → Field Ops, Exec
    [vendors[33].id]: ['dept-004'], // Keystone Construction → Facilities
    [vendors[34].id]: ['dept-003'], // Pacific Rim → Procurement
    [vendors[35].id]: ['dept-007'], // Silverline → Communications
    [vendors[36].id]: ['dept-002'], // Fortis Benefits → HR
    [vendors[37].id]: ['dept-004'], // Nova Environmental → Facilities
    [vendors[38].id]: ['dept-009'], // Crestview Logistics → Field Ops
    [vendors[39].id]: ['dept-001'], // Paradigm Software → IT
    [vendors[40].id]: ['dept-004', 'dept-009'], // Central Valley → Facilities, Field Ops
    [vendors[41].id]: ['dept-005', 'dept-006'], // Northstar Compliance → Legal, Finance
    [vendors[42].id]: ['dept-006'], // Granite Risk → Finance
    [vendors[43].id]: ['dept-001', 'dept-011'], // TechBridge → IT, Research
    [vendors[44].id]: ['dept-012'], // Sentinel → Security
    [vendors[45].id]: ['dept-002', 'dept-008'], // Harmony Wellness → HR, Training
    [vendors[46].id]: ['dept-003'], // DirectSource → Procurement
    [vendors[47].id]: ['dept-004'], // Evergreen Janitorial → Facilities
    [vendors[48].id]: ['dept-007', 'dept-008'], // Pinnacle AV → Comms, Training
    [vendors[49].id]: ['dept-001'], // Oakridge → IT
    [vendors[50].id]: ['dept-010', 'dept-003'], // FreedomServe → Exec, Procurement
    [vendors[51].id]: ['dept-005'], // Capitol Records → Legal
    [vendors[52].id]: ['dept-003', 'dept-009'], // Phantom (ghost) → Procurement, Field Ops
    [vendors[53].id]: ['dept-010', 'dept-006'], // GrayMatter (ghost) → Exec, Finance
    [vendors[54].id]: ['dept-001'], // Vertex Cloud → IT
  };

  const transactions: Transaction[] = [];
  let txnId = 1;

  const FY2024_START = new Date('2023-10-01');
  const FY2024_END = new Date('2024-09-30');
  const FY2025_START = new Date('2024-10-01');
  const FY2025_END = new Date('2025-09-30');

  function createTransaction(
    date: Date,
    vendorIdx: number,
    amount: number,
    deptId: string,
    category: string,
    description: string,
    approval: string = 'approved'
  ): Transaction {
    const dept = departments.find((d) => d.id === deptId)!;
    const v = vendors[vendorIdx];
    const id = `txn-${String(txnId++).padStart(5, '0')}`;
    return {
      id,
      organizationId: organization.id,
      date,
      vendor: v.name,
      vendorId: v.id,
      amount,
      department: dept.name,
      departmentId: deptId,
      category,
      description,
      approvalStatus: approval,
      fiscalYear: getFiscalYear(date),
      fiscalQuarter: getFiscalQuarter(date),
    };
  }

  // Generate ~1800 normal transactions across all departments and vendors
  for (let v = 0; v < vendors.length; v++) {
    const affDepts = vendorDeptAffinities[vendors[v].id] || ['dept-001'];
    const txnCount = ghostVendorIds.includes(vendors[v].id)
      ? Math.floor(rand() * 4) + 2
      : Math.floor(rand() * 35) + 15;

    for (let t = 0; t < txnCount; t++) {
      const isFY2025 = rand() > 0.4;
      const date = isFY2025
        ? randomDate(FY2025_START, FY2025_END)
        : randomDate(FY2024_START, FY2024_END);
      const deptId = pick(affDepts);
      const category = pick(CATEGORIES);
      const description = pick(DESCRIPTIONS);
      const amount = randomBetween(200, 15000);

      transactions.push(createTransaction(date, v, amount, deptId, category, description));
    }
  }

  // ============================================================
  // PLANTED ANOMALIES
  // ============================================================

  // 1. DUPLICATE PAYMENTS — 15 pairs
  const dupPairs: { vendorIdx: number; dept: string; amount: number; baseDate: Date }[] = [
    { vendorIdx: 0, dept: 'dept-001', amount: 8750.00, baseDate: new Date('2025-02-15') },
    { vendorIdx: 1, dept: 'dept-010', amount: 12300.00, baseDate: new Date('2025-03-22') },
    { vendorIdx: 3, dept: 'dept-004', amount: 6420.00, baseDate: new Date('2025-01-10') },
    { vendorIdx: 7, dept: 'dept-001', amount: 9800.00, baseDate: new Date('2024-11-05') },
    { vendorIdx: 8, dept: 'dept-005', amount: 15000.00, baseDate: new Date('2025-04-18') },
    { vendorIdx: 10, dept: 'dept-009', amount: 3200.00, baseDate: new Date('2024-12-20') },
    { vendorIdx: 14, dept: 'dept-001', amount: 4500.00, baseDate: new Date('2025-05-08') },
    { vendorIdx: 16, dept: 'dept-003', amount: 7890.00, baseDate: new Date('2025-06-12') },
    { vendorIdx: 19, dept: 'dept-004', amount: 5600.00, baseDate: new Date('2024-10-25') },
    { vendorIdx: 22, dept: 'dept-009', amount: 11200.00, baseDate: new Date('2025-02-28') },
    { vendorIdx: 25, dept: 'dept-004', amount: 8900.00, baseDate: new Date('2025-07-15') },
    { vendorIdx: 28, dept: 'dept-007', amount: 6700.00, baseDate: new Date('2025-01-30') },
    { vendorIdx: 33, dept: 'dept-004', amount: 14500.00, baseDate: new Date('2024-11-22') },
    { vendorIdx: 36, dept: 'dept-002', amount: 4300.00, baseDate: new Date('2025-03-05') },
    { vendorIdx: 39, dept: 'dept-001', amount: 7200.00, baseDate: new Date('2025-08-20') },
  ];

  for (const dup of dupPairs) {
    const t1 = createTransaction(dup.baseDate, dup.vendorIdx, dup.amount, dup.dept, 'Professional Services', 'Service delivery payment');
    const dupDate = new Date(dup.baseDate);
    dupDate.setDate(dupDate.getDate() + Math.floor(rand() * 3));
    const t2 = createTransaction(dupDate, dup.vendorIdx, dup.amount, dup.dept, 'Professional Services', 'Service delivery payment');
    transactions.push(t1, t2);
  }

  // 2. SPLIT TRANSACTIONS — 8 instances (just below $5,000)
  const splitSets: { vendorIdx: number; dept: string; baseDate: Date; count: number }[] = [
    { vendorIdx: 12, dept: 'dept-001', baseDate: new Date('2025-03-10'), count: 5 },
    { vendorIdx: 1, dept: 'dept-010', baseDate: new Date('2025-01-15'), count: 4 },
    { vendorIdx: 16, dept: 'dept-006', baseDate: new Date('2025-04-20'), count: 3 },
    { vendorIdx: 34, dept: 'dept-003', baseDate: new Date('2024-12-08'), count: 5 },
    { vendorIdx: 50, dept: 'dept-003', baseDate: new Date('2025-06-01'), count: 4 },
    { vendorIdx: 18, dept: 'dept-002', baseDate: new Date('2025-02-18'), count: 3 },
    { vendorIdx: 40, dept: 'dept-009', baseDate: new Date('2025-05-12'), count: 4 },
    { vendorIdx: 46, dept: 'dept-003', baseDate: new Date('2025-07-22'), count: 5 },
  ];

  for (const split of splitSets) {
    for (let s = 0; s < split.count; s++) {
      const splitDate = new Date(split.baseDate);
      splitDate.setDate(splitDate.getDate() + s);
      const amount = randomBetween(4800, 4990);
      transactions.push(
        createTransaction(splitDate, split.vendorIdx, amount, split.dept, 'Equipment & Hardware', 'Equipment purchase order')
      );
    }
  }

  // 3. VENDOR CONCENTRATION — 3 vendors with >40% of department spend
  // Acme Tech → IT (vendor 0, dept-001)
  for (let i = 0; i < 25; i++) {
    const date = randomDate(FY2025_START, FY2025_END);
    transactions.push(
      createTransaction(date, 0, randomBetween(15000, 45000), 'dept-001', 'Software & Licenses', 'Enterprise license & support')
    );
  }
  // Heritage Legal → Legal (vendor 8, dept-005)
  for (let i = 0; i < 20; i++) {
    const date = randomDate(FY2025_START, FY2025_END);
    transactions.push(
      createTransaction(date, 8, randomBetween(12000, 30000), 'dept-005', 'Legal Services', 'Legal counsel retainer')
    );
  }
  // Vanguard Training → Training (vendor 6, dept-008)
  for (let i = 0; i < 18; i++) {
    const date = randomDate(FY2025_START, FY2025_END);
    transactions.push(
      createTransaction(date, 6, randomBetween(10000, 25000), 'dept-008', 'Training & Development', 'Training program delivery')
    );
  }

  // 4. ROUND NUMBER SUSPICIOUS TRANSACTIONS — 5 transactions
  const roundTxns: { vendorIdx: number; dept: string; amount: number; date: Date }[] = [
    { vendorIdx: 52, dept: 'dept-003', amount: 50000.00, date: new Date('2025-03-15') },
    { vendorIdx: 53, dept: 'dept-010', amount: 100000.00, date: new Date('2025-05-20') },
    { vendorIdx: 1, dept: 'dept-010', amount: 75000.00, date: new Date('2025-02-10') },
    { vendorIdx: 50, dept: 'dept-003', amount: 50000.00, date: new Date('2024-11-30') },
    { vendorIdx: 12, dept: 'dept-001', amount: 100000.00, date: new Date('2025-07-01') },
  ];

  for (const rt of roundTxns) {
    transactions.push(
      createTransaction(rt.date, rt.vendorIdx, rt.amount, rt.dept, 'Consulting Services', 'Strategic advisory engagement')
    );
  }

  // 5. END-OF-PERIOD SPENDING SPIKES — 4 departments
  const spikeConfigs: { dept: string; dates: Date[] }[] = [
    {
      dept: 'dept-001',
      dates: [new Date('2025-09-18'), new Date('2025-09-20'), new Date('2025-09-22'), new Date('2025-09-24'), new Date('2025-09-26'), new Date('2025-09-28'), new Date('2025-09-29')],
    },
    {
      dept: 'dept-003',
      dates: [new Date('2025-09-16'), new Date('2025-09-19'), new Date('2025-09-21'), new Date('2025-09-25'), new Date('2025-09-27'), new Date('2025-09-30')],
    },
    {
      dept: 'dept-010',
      dates: [new Date('2025-03-17'), new Date('2025-03-19'), new Date('2025-03-21'), new Date('2025-03-25'), new Date('2025-03-28')],
    },
    {
      dept: 'dept-009',
      dates: [new Date('2025-06-18'), new Date('2025-06-20'), new Date('2025-06-23'), new Date('2025-06-25'), new Date('2025-06-27'), new Date('2025-06-29')],
    },
  ];

  for (const spike of spikeConfigs) {
    for (const date of spike.dates) {
      const vendorIdx = Math.floor(rand() * vendors.length);
      transactions.push(
        createTransaction(date, vendorIdx, randomBetween(8000, 35000), spike.dept, pick(CATEGORIES), 'End-of-period procurement')
      );
    }
  }

  // 6. GHOST VENDOR TRANSACTIONS — additional transactions for ghost vendors
  for (let i = 0; i < 8; i++) {
    const gvIdx = i < 4 ? 52 : 53;
    const dept = gvIdx === 52 ? pick(['dept-003', 'dept-009']) : pick(['dept-010', 'dept-006']);
    const date = randomDate(FY2025_START, FY2025_END);
    transactions.push(
      createTransaction(date, gvIdx, randomBetween(5000, 25000), dept, 'Consulting Services', 'Advisory services')
    );
  }

  // ============================================================
  // CONTRACTS
  // ============================================================
  const contracts: Contract[] = [
    // Normal contracts
    { id: 'ctr-001', organizationId: organization.id, vendorId: vendors[0].id, vendorName: vendors[0].name, title: 'Enterprise IT Support Agreement', value: 2400000, currentValue: 2400000, startDate: new Date('2024-01-01'), endDate: new Date('2025-12-31'), renewalStatus: 'active', competitiveBid: true, deliverables: 'Full-stack IT support, help desk, infrastructure management' },
    { id: 'ctr-002', organizationId: organization.id, vendorId: vendors[3].id, vendorName: vendors[3].name, title: 'Facilities Management Services', value: 1800000, currentValue: 1800000, startDate: new Date('2024-04-01'), endDate: new Date('2026-03-31'), renewalStatus: 'active', competitiveBid: true, deliverables: 'Building maintenance, HVAC, plumbing, electrical' },
    { id: 'ctr-003', organizationId: organization.id, vendorId: vendors[7].id, vendorName: vendors[7].name, title: 'Cloud Hosting Services', value: 960000, currentValue: 960000, startDate: new Date('2024-07-01'), endDate: new Date('2025-06-30'), renewalStatus: 'pending_renewal', competitiveBid: true, deliverables: 'GovCloud hosting, 99.99% uptime SLA, disaster recovery' },
    { id: 'ctr-004', organizationId: organization.id, vendorId: vendors[5].id, vendorName: vendors[5].name, title: 'Physical Security Services', value: 750000, currentValue: 750000, startDate: new Date('2024-01-01'), endDate: new Date('2025-12-31'), renewalStatus: 'active', competitiveBid: true, deliverables: 'Guard services, access control, incident response' },
    { id: 'ctr-005', organizationId: organization.id, vendorId: vendors[14].id, vendorName: vendors[14].name, title: 'Telecommunications Services', value: 1200000, currentValue: 1200000, startDate: new Date('2023-10-01'), endDate: new Date('2025-09-30'), renewalStatus: 'active', competitiveBid: true, deliverables: 'Voice, data, and video communications infrastructure' },
    { id: 'ctr-006', organizationId: organization.id, vendorId: vendors[29].id, vendorName: vendors[29].name, title: 'Cybersecurity Operations', value: 840000, currentValue: 840000, startDate: new Date('2024-03-01'), endDate: new Date('2026-02-28'), renewalStatus: 'active', competitiveBid: true, deliverables: 'SOC operations, penetration testing, security monitoring' },
    { id: 'ctr-007', organizationId: organization.id, vendorId: vendors[22].id, vendorName: vendors[22].name, title: 'Fleet Management Services', value: 680000, currentValue: 680000, startDate: new Date('2024-01-01'), endDate: new Date('2025-12-31'), renewalStatus: 'active', competitiveBid: true, deliverables: 'Vehicle maintenance, fuel management, GPS tracking' },
    { id: 'ctr-008', organizationId: organization.id, vendorId: vendors[15].id, vendorName: vendors[15].name, title: 'Comprehensive Insurance Package', value: 520000, currentValue: 520000, startDate: new Date('2024-07-01'), endDate: new Date('2025-06-30'), renewalStatus: 'pending_renewal', competitiveBid: true, deliverables: 'Property, liability, and workers compensation insurance' },
    // Auto-renewed contracts exceeding original value by 30%+
    { id: 'ctr-009', organizationId: organization.id, vendorId: vendors[1].id, vendorName: vendors[1].name, title: 'Strategic Management Consulting', value: 800000, currentValue: 1120000, startDate: new Date('2022-10-01'), endDate: new Date('2025-09-30'), renewalStatus: 'auto_renewed', competitiveBid: false, deliverables: 'Organizational strategy, change management, executive coaching' },
    { id: 'ctr-010', organizationId: organization.id, vendorId: vendors[12].id, vendorName: vendors[12].name, title: 'IT Infrastructure Modernization', value: 1500000, currentValue: 2100000, startDate: new Date('2023-01-01'), endDate: new Date('2025-12-31'), renewalStatus: 'auto_renewed', competitiveBid: false, deliverables: 'Network upgrades, server migration, system integration' },
    // Expired contracts
    { id: 'ctr-011', organizationId: organization.id, vendorId: vendors[9].id, vendorName: vendors[9].name, title: 'Print Services Agreement', value: 340000, currentValue: 340000, startDate: new Date('2023-04-01'), endDate: new Date('2024-03-31'), renewalStatus: 'expired', competitiveBid: true, deliverables: 'Bulk printing, copying, binding services' },
    { id: 'ctr-012', organizationId: organization.id, vendorId: vendors[20].id, vendorName: vendors[20].name, title: 'Research & Analytics Platform', value: 480000, currentValue: 480000, startDate: new Date('2024-01-01'), endDate: new Date('2025-12-31'), renewalStatus: 'active', competitiveBid: true, deliverables: 'Data analytics software, training, support' },
  ];

  // ============================================================
  // CALCULATE VENDOR TOTALS
  // ============================================================
  for (const v of vendors) {
    const vendorTxns = transactions.filter((t) => t.vendorId === v.id);
    v.totalPaid = vendorTxns.reduce((sum, t) => sum + t.amount, 0);
    v.transactionCount = vendorTxns.length;
  }

  // ============================================================
  // FLAGS — Pre-generate flags from the planted anomalies
  // ============================================================
  const flags: Flag[] = [];
  let flagId = 1;

  function createFlag(
    type: Flag['type'],
    severity: Flag['severity'],
    title: string,
    description: string,
    estimatedWaste: number,
    affectedTxnIds: string[],
    department?: string,
    vendor?: string,
    status: Flag['status'] = 'new'
  ): Flag {
    return {
      id: `flag-${String(flagId++).padStart(3, '0')}`,
      organizationId: organization.id,
      type,
      severity,
      title,
      description,
      estimatedWaste,
      status,
      affectedTransactionIds: affectedTxnIds,
      affectedDepartment: department,
      affectedVendor: vendor,
      recommendation: getRecommendation(type),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  function getRecommendation(type: Flag['type']): string {
    const recs: Record<string, string> = {
      duplicate_payment: 'Review payment records and initiate recovery for confirmed duplicates. Implement duplicate checking in accounts payable workflow.',
      round_number: 'Request detailed invoices and supporting documentation. Verify service delivery and contract terms.',
      split_transaction: 'Review purchasing patterns and enforce approval threshold compliance. Consider consolidating purchases.',
      vendor_concentration: 'Conduct competitive analysis and consider diversifying vendor base. Review contract terms for cost optimization.',
      budget_overrun: 'Implement budget alerts at 80% and 90% thresholds. Review and reallocate budget if necessary.',
      ghost_vendor: 'Verify vendor legitimacy through business registration, physical address verification, and reference checks.',
      end_of_period_spike: 'Review end-of-period purchases for necessity. Implement spending freeze protocols before fiscal period end.',
      contract_anomaly: 'Review contract terms and conduct competitive bidding for renewal. Negotiate better terms based on market rates.',
      outlier: 'Review transaction details and verify against contract terms and market rates.',
      benford_anomaly: 'Conduct detailed audit of transaction amounts. Investigate patterns that deviate from expected distribution.',
    };
    return recs[type] || 'Review and investigate flagged items.';
  }

  // Generate duplicate payment flags
  for (let i = 0; i < dupPairs.length; i++) {
    const dup = dupPairs[i];
    const vName = vendors[dup.vendorIdx].name;
    const dName = departments.find((d) => d.id === dup.dept)!.name;
    // Find the matching transactions (last ones added for this pair)
    const matchingTxns = transactions.filter(
      (t) => t.vendorId === vendors[dup.vendorIdx].id && t.amount === dup.amount
    );
    const txnIds = matchingTxns.slice(-2).map((t) => t.id);

    flags.push(
      createFlag(
        'duplicate_payment',
        i < 5 ? 'critical' : 'warning',
        `Duplicate payment to ${vName}`,
        `Two payments of $${dup.amount.toLocaleString()} to ${vName} within ${dName} were made within 3 days of each other. This may indicate a duplicate payment that should be reviewed and potentially recovered.`,
        dup.amount,
        txnIds,
        dName,
        vName,
        i < 3 ? 'new' : i < 8 ? 'under_review' : 'new'
      )
    );
  }

  // Generate split transaction flags
  for (const split of splitSets) {
    const vName = vendors[split.vendorIdx].name;
    const dName = departments.find((d) => d.id === split.dept)!.name;
    const matchingTxns = transactions.filter(
      (t) =>
        t.vendorId === vendors[split.vendorIdx].id &&
        t.amount >= 4800 &&
        t.amount <= 4990 &&
        t.departmentId === split.dept
    );
    const txnIds = matchingTxns.slice(-split.count).map((t) => t.id);
    const totalAmount = matchingTxns.slice(-split.count).reduce((s, t) => s + t.amount, 0);

    flags.push(
      createFlag(
        'split_transaction',
        'critical',
        `Possible split purchases — ${vName}`,
        `${split.count} transactions from ${vName} in ${dName}, each just below the $5,000 approval threshold (ranging $4,800-$4,990). Total: $${totalAmount.toLocaleString()}. This pattern suggests purchases may have been intentionally split to avoid approval requirements.`,
        totalAmount * 0.15,
        txnIds,
        dName,
        vName
      )
    );
  }

  // Generate vendor concentration flags
  const concentrationVendors = [
    { vendorIdx: 0, dept: 'dept-001', deptName: 'Information Technology' },
    { vendorIdx: 8, dept: 'dept-005', deptName: 'Legal Affairs' },
    { vendorIdx: 6, dept: 'dept-008', deptName: 'Training & Development' },
  ];

  for (const vc of concentrationVendors) {
    const vName = vendors[vc.vendorIdx].name;
    const deptTxns = transactions.filter((t) => t.departmentId === vc.dept);
    const vendorTxns = deptTxns.filter((t) => t.vendorId === vendors[vc.vendorIdx].id);
    const deptTotal = deptTxns.reduce((s, t) => s + t.amount, 0);
    const vendorTotal = vendorTxns.reduce((s, t) => s + t.amount, 0);
    const pct = ((vendorTotal / deptTotal) * 100).toFixed(1);

    flags.push(
      createFlag(
        'vendor_concentration',
        'warning',
        `High vendor concentration — ${vName}`,
        `${vName} received ${pct}% of ${vc.deptName}'s total spend across ${vendorTxns.length} transactions. This concentration creates dependency risk and may indicate a lack of competitive procurement practices.`,
        vendorTotal * 0.1,
        vendorTxns.map((t) => t.id),
        vc.deptName,
        vName
      )
    );
  }

  // Generate round number flags
  for (const rt of roundTxns) {
    const vName = vendors[rt.vendorIdx].name;
    const dName = departments.find((d) => d.id === rt.dept)!.name;
    const matchingTxns = transactions.filter(
      (t) => t.vendorId === vendors[rt.vendorIdx].id && t.amount === rt.amount
    );
    flags.push(
      createFlag(
        'round_number',
        rt.amount >= 75000 ? 'critical' : 'warning',
        `Suspiciously round payment — $${rt.amount.toLocaleString()}`,
        `A payment of exactly $${rt.amount.toLocaleString()} to ${vName} in ${dName}. Perfectly round amounts at this scale are uncommon in legitimate invoicing and may warrant additional documentation review.`,
        rt.amount * 0.05,
        matchingTxns.slice(-1).map((t) => t.id),
        dName,
        vName
      )
    );
  }

  // Generate ghost vendor flags
  flags.push(
    createFlag(
      'ghost_vendor',
      'critical',
      'Suspicious vendor — Phantom Services LLC',
      'Phantom Services LLC has a P.O. Box address in Delaware, no website, no email on file, and minimal transaction history. This vendor profile raises significant red flags for potential fraud.',
      vendors[52].totalPaid,
      transactions.filter((t) => t.vendorId === vendors[52].id).map((t) => t.id),
      undefined,
      'Phantom Services LLC'
    )
  );

  flags.push(
    createFlag(
      'ghost_vendor',
      'critical',
      'Suspicious vendor — GrayMatter Advisors',
      'GrayMatter Advisors has a P.O. Box address in Nevada, no website, no contact email, and limited transaction documentation. This vendor should be investigated for legitimacy.',
      vendors[53].totalPaid,
      transactions.filter((t) => t.vendorId === vendors[53].id).map((t) => t.id),
      undefined,
      'GrayMatter Advisors'
    )
  );

  // Generate end-of-period spike flags
  for (const spike of spikeConfigs) {
    const dName = departments.find((d) => d.id === spike.dept)!.name;
    const spikeTxns = transactions.filter(
      (t) =>
        t.departmentId === spike.dept &&
        t.description === 'End-of-period procurement'
    );
    const spikeTotal = spikeTxns.reduce((s, t) => s + t.amount, 0);

    flags.push(
      createFlag(
        'end_of_period_spike',
        'warning',
        `End-of-period spending surge — ${dName}`,
        `${dName} made ${spikeTxns.length} purchases totaling $${Math.round(spikeTotal).toLocaleString()} in the final two weeks of the fiscal period. This "use it or lose it" pattern often results in unnecessary or poorly vetted purchases.`,
        spikeTotal * 0.3,
        spikeTxns.map((t) => t.id),
        dName
      )
    );
  }

  // Generate budget overrun flags
  const overrunDepts = ['dept-001', 'dept-004', 'dept-009'];
  for (const deptId of overrunDepts) {
    const dept = departments.find((d) => d.id === deptId)!;
    const deptTxns = transactions.filter((t) => t.departmentId === deptId && t.fiscalYear === 'FY2025');
    const actualSpend = deptTxns.reduce((s, t) => s + t.amount, 0);
    const overrun = actualSpend - dept.allocatedBudget;
    if (overrun > 0) {
      flags.push(
        createFlag(
          'budget_overrun',
          'critical',
          `Budget exceeded — ${dept.name}`,
          `${dept.name} has spent $${Math.round(actualSpend).toLocaleString()} against an allocated budget of $${dept.allocatedBudget.toLocaleString()}, exceeding the budget by $${Math.round(overrun).toLocaleString()} (${((overrun / dept.allocatedBudget) * 100).toFixed(1)}%).`,
          overrun,
          deptTxns.map((t) => t.id),
          dept.name
        )
      );
    }
  }

  // Generate contract anomaly flags
  flags.push(
    createFlag(
      'contract_anomaly',
      'critical',
      'Auto-renewed contract exceeds original value — Pinnacle Consulting',
      'The Strategic Management Consulting contract with Pinnacle Consulting Group was auto-renewed without competitive bidding and now exceeds its original value of $800,000 by 40% ($1,120,000 current). This represents $320,000 in potential waste.',
      320000,
      [],
      'Executive Office',
      'Pinnacle Consulting Group'
    )
  );

  flags.push(
    createFlag(
      'contract_anomaly',
      'critical',
      'Auto-renewed contract exceeds original value — ProTech Systems',
      'The IT Infrastructure Modernization contract with ProTech Systems was auto-renewed without competitive bidding and has increased from $1,500,000 to $2,100,000 (40% increase). This represents $600,000 in potential overspend.',
      600000,
      [],
      'Information Technology',
      'ProTech Systems'
    )
  );

  // Calculate vendor risk scores based on flags
  for (const v of vendors) {
    const vendorFlags = flags.filter((f) => f.affectedVendor === v.name);
    const criticalCount = vendorFlags.filter((f) => f.severity === 'critical').length;
    const warningCount = vendorFlags.filter((f) => f.severity === 'warning').length;
    v.riskScore = Math.min(100, criticalCount * 30 + warningCount * 15 + (ghostVendorIds.includes(v.id) ? 40 : 0));
  }

  // Sort transactions by date
  transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Generate Medicare FCA investigation demo
  const investigations: Investigation[] = [generateMedicareInvestigation()];

  return {
    organization,
    departments,
    vendors,
    transactions,
    contracts,
    flags,
    investigations,
  };
}
