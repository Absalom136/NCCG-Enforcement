import { AdministrativeUnit, EnforcementRecord } from './types';

// Data extracted directly from the provided PDF "RE-ORGANIZATON OF COUNTY EXCUTIVE AND ADMINISTRATION UNITS"
export const NAIROBI_ADMIN_STRUCTURE: AdministrativeUnit[] = [
  {
    borough: "Western",
    manager: "Janet Waeni Kimeu",
    subCounties: [
      {
        name: "Westlands",
        administrator: "Florence Ambia Shikaga",
        commander: "Peter Otieno Owino",
        environmentOfficer: "Mercy Amoa",
        planningOfficer: "John Mbuthia",
        wards: ["Kitisuru", "Parklands", "Karura", "Kangemi", "Mt. View"]
      },
      {
        name: "Dagoretti North",
        administrator: "Jane Ndanu Kyarungu",
        commander: "Wiclif Walera",
        environmentOfficer: "Salome W. Gitua",
        planningOfficer: "Waweru Kindiga",
        wards: ["Kilimani", "Kawangware", "Gatina", "Kileleshwa", "Kabiro"]
      }
    ]
  },
  {
    borough: "Southern",
    manager: "Dabasso Luka Wario",
    subCounties: [
      {
        name: "Dagoretti South",
        administrator: "Edward Musuni",
        commander: "Fredrick Maritim",
        environmentOfficer: "David K. Macharia",
        planningOfficer: "Conslate Adhiambo",
        wards: ["Mutuini", "Ngando", "Riruta", "Uthiru/Ruthimitu", "Waithaka"]
      },
      {
        name: "Langata",
        administrator: "Ag. Nelly Ayoti",
        commander: "Priscilla Maneno",
        environmentOfficer: "Antony Baka",
        planningOfficer: "Beatrice Kimathi",
        wards: ["Karen", "Nairobi West", "Mugumoini", "South C", "Nyayo Highrise"]
      },
      {
        name: "Kibra",
        administrator: "Calvince Otieno Okello",
        commander: "Jane Talam",
        environmentOfficer: "Enos Chetambe",
        planningOfficer: "Sylvia Mwikali",
        wards: ["Laini Saba", "Lindi", "Makina", "Woodley/K Golf C.", "Sarangombe"]
      }
    ]
  },
  {
    borough: "Northern",
    manager: "John Saruni",
    subCounties: [
      {
        name: "Roysambu",
        administrator: "Ronald O. Mulema",
        commander: "Cecilia Mwaura",
        environmentOfficer: "Meryvine Nyanchoka",
        planningOfficer: "Albert Matundura",
        wards: ["Githurai", "Kahawa West", "Zimmerman", "Roysambu", "Kahawa"]
      },
      {
        name: "Kasarani",
        administrator: "Ag. Elizabeth Kyalungu",
        commander: "Michael Mbuthia",
        environmentOfficer: "Ayala Powell Aporo",
        planningOfficer: "Michael Agoya",
        wards: ["Clay City", "Mwiki", "Kasarani", "Njiru", "Ruai"]
      },
      {
        name: "Ruaraka",
        administrator: "Jazz Kemunto",
        commander: "Alphonse Kamau",
        environmentOfficer: "Ruth Mwendwa",
        planningOfficer: "Robert Chelino",
        wards: ["Babadogo", "Utalii", "Mathare North", "Lucky Summer", "Korogocho"]
      }
    ]
  },
  {
    borough: "Eastern",
    manager: "George Muca",
    subCounties: [
      {
        name: "Embakasi Central",
        administrator: "Eston Kiyai",
        commander: "Josiah Agina",
        environmentOfficer: "Richard Langat",
        planningOfficer: "Josphat Mburu",
        wards: ["Kayole North", "Kayole Central", "Kayole South", "Komarock", "Matopeni/Spring V."]
      },
      {
        name: "Embakasi West",
        administrator: "Jane Ngima Munyiri",
        commander: "George Gachara",
        environmentOfficer: "Christine Kizibi",
        planningOfficer: "Faith Kibet",
        wards: ["Umoja I", "Umoja II", "Mowlem", "Kariobangi South"]
      },
      {
        name: "Embakasi North",
        administrator: "Francis Nyandago",
        commander: "George Nyasimi",
        environmentOfficer: "Julia Muchoki",
        planningOfficer: "Roy Misiko",
        wards: ["Kariobangi North", "Dandora Area I", "Dandora Area II", "Dandora Area III", "Dandora Area IV"]
      }
    ]
  }
];

export const MOCK_RECORDS: EnforcementRecord[] = [
  {
    id: "REC-001",
    noticeNumber: "NCC-ENF-2025-089",
    plotNumber: "66/4080",
    location: "Argwings Kodhek Rd",
    subCounty: "Kilimani",
    ward: "Kilimani",
    dateIssued: "2025-05-12",
    issueOfConcern: "Illegal construction of boundary wall without valid permits.",
    processTaken: "Notice Issued",
    recommendations: "Immediate cessation of construction. Present approved architectural drawings within 7 days.",
    officerInCharge: "Waweru Kindiga",
    status: "Open",
    auditLog: [
      { timestamp: "2025-05-12 10:00", action: "Record Created", user: "Officer J. Kamau" }
    ]
  },
  {
    id: "REC-002",
    noticeNumber: "NCC-ENF-2025-112",
    plotNumber: "23/109",
    location: "Mombasa Road",
    subCounty: "Embakasi South",
    ward: "Imara Daima",
    dateIssued: "2025-05-14",
    issueOfConcern: "Dumping of waste in non-designated area.",
    processTaken: "Warning",
    recommendations: "Clear waste within 24 hours. Monitor for compliance.",
    officerInCharge: "Christine Kizibi",
    status: "Pending Review",
    auditLog: [
      { timestamp: "2025-05-14 14:30", action: "Record Created", user: "Officer P. Otieno" },
      { timestamp: "2025-05-15 09:00", action: "Status Updated", user: "Admin" }
    ]
  },
  {
    id: "REC-003",
    noticeNumber: "NCC-ENF-2025-045",
    plotNumber: "78/5502",
    location: "Peponi Road",
    subCounty: "Westlands",
    ward: "Kitisuru",
    dateIssued: "2025-04-20",
    issueOfConcern: "Noise pollution from entertainment joint beyond allowed decibels.",
    processTaken: "Arrest Made",
    recommendations: "Confiscation of sound equipment. Court appearance scheduled.",
    officerInCharge: "Mercy Amoa",
    status: "Closed",
    auditLog: [
      { timestamp: "2025-04-20 23:15", action: "Arrest Logged", user: "Commander P. Owino" }
    ]
  }
];