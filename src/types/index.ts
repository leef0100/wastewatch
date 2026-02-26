export type Severity = 'critical' | 'warning' | 'info';
export type FlagStatus = 'new' | 'under_review' | 'resolved' | 'dismissed';
export type FlagType =
  | 'duplicate_payment'
  | 'round_number'
  | 'split_transaction'
  | 'vendor_concentration'
  | 'budget_overrun'
  | 'ghost_vendor'
  | 'end_of_period_spike'
  | 'contract_anomaly'
  | 'outlier'
  | 'benford_anomaly';

export type UserRole = 'admin' | 'analyst' | 'viewer';
export type IndustrySector =
  | 'government'
  | 'healthcare'
  | 'defense'
  | 'education'
  | 'technology'
  | 'finance'
  | 'manufacturing'
  | 'other';

export interface Organization {
  id: string;
  name: string;
  industry: IndustrySector;
  employeeCount: string;
  annualBudget: number;
  logoUrl?: string;
  createdAt: Date;
}

export interface Department {
  id: string;
  name: string;
  organizationId: string;
  allocatedBudget: number;
  headcount?: number;
  parentDepartmentId?: string;
}

export interface Vendor {
  id: string;
  name: string;
  organizationId: string;
  address?: string;
  contactEmail?: string;
  website?: string;
  riskScore: number;
  totalPaid: number;
  transactionCount: number;
}

export interface Transaction {
  id: string;
  organizationId: string;
  date: Date;
  vendor: string;
  vendorId?: string;
  amount: number;
  department: string;
  departmentId?: string;
  category: string;
  description: string;
  approvalStatus: string;
  fiscalYear: string;
  fiscalQuarter: number;
}

export interface Contract {
  id: string;
  organizationId: string;
  vendorId: string;
  vendorName: string;
  title: string;
  value: number;
  currentValue: number;
  startDate: Date;
  endDate: Date;
  renewalStatus: 'active' | 'expired' | 'auto_renewed' | 'pending_renewal';
  competitiveBid: boolean;
  deliverables: string;
}

export interface Flag {
  id: string;
  organizationId: string;
  type: FlagType;
  severity: Severity;
  title: string;
  description: string;
  estimatedWaste: number;
  status: FlagStatus;
  assignee?: string;
  affectedTransactionIds: string[];
  affectedDepartment?: string;
  affectedVendor?: string;
  recommendation: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalSpend: number;
  totalSpendChange: number;
  wasteDetected: number;
  wasteDetectedChange: number;
  savingsOpportunities: number;
  savingsChange: number;
  riskScore: number;
  riskScoreChange: number;
}

export interface SpendingByDepartment {
  department: string;
  departmentId: string;
  allocated: number;
  actual: number;
  variance: number;
}

export interface SpendingOverTime {
  month: string;
  amount: number;
  isAnomaly: boolean;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface TopVendor {
  vendorId: string;
  name: string;
  totalPaid: number;
  transactionCount: number;
  department: string;
  flagCount: number;
}

export interface DemoData {
  organization: Organization;
  departments: Department[];
  vendors: Vendor[];
  transactions: Transaction[];
  contracts: Contract[];
  flags: Flag[];
  investigations: Investigation[];
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  timestamp: Date;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: string[];
}

export interface FilterState {
  dateRange: { from: Date | null; to: Date | null };
  departments: string[];
  vendors: string[];
  categories: string[];
  amountRange: { min: number | null; max: number | null };
  flagStatus: FlagStatus[];
  severity: Severity[];
}

// ============================================================
// INVESTIGATION TYPES
// ============================================================

export type InvestigationType = 'fca' | 'fraud' | 'waste' | 'abuse';
export type InvestigationStatus = 'active' | 'draft' | 'submitted' | 'closed';
export type EntityType = 'provider' | 'shell_company' | 'individual' | 'government_entity' | 'bank_account';
export type RelationshipType = 'payment' | 'ownership' | 'kickback' | 'referral' | 'billing' | 'employment';

export interface Investigation {
  id: string;
  title: string;
  type: InvestigationType;
  status: InvestigationStatus;
  summary: string;
  totalFraudAmount: number;
  entities: Entity[];
  relationships: EntityRelationship[];
  documents: InvestigationDocument[];
  timeline: TimelineEvent[];
  complaint?: FCAComplaint;
  createdAt: Date;
  updatedAt: Date;
}

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  description: string;
  metadata: Record<string, string>;
  flagged: boolean;
  totalAmount?: number;
}

export interface EntityRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  label: string;
  amount?: number;
  evidence: string[];
}

export interface InvestigationDocument {
  id: string;
  name: string;
  type: 'claims_data' | 'financial_records' | 'corporate_filings' | 'whistleblower_report' | 'audit_report' | 'correspondence';
  summary: string;
  aiAnalysis?: DocumentAnalysis;
  uploadedAt: Date;
}

export interface DocumentAnalysis {
  findings: Finding[];
  riskScore: number;
  keyEntities: string[];
  suggestedActions: string[];
  processingTime: number;
}

export interface Finding {
  id: string;
  category: string;
  description: string;
  severity: Severity;
  evidence: string;
  relatedEntities: string[];
}

export interface TimelineEvent {
  id: string;
  date: Date;
  title: string;
  description: string;
  type: 'discovery' | 'evidence' | 'filing' | 'action' | 'milestone';
}

export interface FCAComplaint {
  caseNumber: string;
  relator: string;
  defendants: string[];
  jurisdiction: string;
  statuteOfLimitations: Date;
  totalDamages: number;
  trebleDamages: number;
  counts: ComplaintCount[];
  factualAllegations: string[];
  generatedAt: Date;
}

export interface ComplaintCount {
  number: number;
  title: string;
  statute: string;
  description: string;
  amount: number;
}
