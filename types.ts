export interface Attachment {
  name: string;
  type: string;
  data: string;
}

export interface EnforcementRecord {
  id: string;
  noticeNumber: string;
  plotNumber: string;
  location: string; // Street/Road
  subCounty: string;
  ward: string;
  dateIssued: string;
  issueOfConcern: string;
  processTaken: 'Notice Issued' | 'Arrest Made' | 'Demolition' | 'Warning' | 'Compliance Verified';
  recommendations: string;
  officerInCharge: string;
  status: 'Open' | 'Pending Review' | 'Closed';
  auditLog: AuditLogEntry[];
  imageUrl?: string;
  attachments?: Attachment[];
  aiSummary?: string;
}

export interface AuditLogEntry {
  timestamp: string;
  action: string;
  user: string;
}

export interface AdministrativeUnit {
  borough: string;
  manager: string;
  subCounties: SubCounty[];
}

export interface SubCounty {
  name: string;
  administrator: string;
  commander: string;
  environmentOfficer: string;
  planningOfficer: string;
  wards: string[];
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  SEARCH = 'SEARCH',
  NEW_ENTRY = 'NEW_ENTRY',
  ADMIN_STRUCTURE = 'ADMIN_STRUCTURE',
}