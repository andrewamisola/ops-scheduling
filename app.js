// ==========================================================================
// Ops Scheduling - Main Application
// ==========================================================================

// DOM Elements
const elements = {
  // Views
  loginView: document.getElementById('loginView'),
  dashboardView: document.getElementById('dashboardView'),

  // Login
  loginForm: document.getElementById('loginForm'),
  usernameInput: document.getElementById('username'),
  passwordInput: document.getElementById('password'),

  // Header
  userAvatar: document.getElementById('userAvatar'),
  userName: document.getElementById('userName'),
  roleToggle: document.getElementById('roleToggle'),
  logoutBtn: document.getElementById('logoutBtn'),

  // Sidebar
  sidebarTabs: document.querySelectorAll('.tab-btn'),
  myShiftsTab: document.getElementById('myShiftsTab'),
  bulletinTab: document.getElementById('bulletinTab'),
  myShiftsList: document.getElementById('myShiftsList'),
  bulletinList: document.getElementById('bulletinList'),
  bulletinBadge: document.getElementById('bulletinBadge'),
  showAllRequests: document.getElementById('showAllRequests'),
  leadApprovals: document.getElementById('leadApprovals'),
  approvalList: document.getElementById('approvalList'),

  // Main Content
  weekView: document.getElementById('weekView'),
  expandTeamBtn: document.getElementById('expandTeamBtn'),
  teamSchedule: document.getElementById('teamSchedule'),
  scheduleGrid: document.getElementById('scheduleGrid'),
  csvUpload: document.getElementById('csvUpload'),
  timezoneToggle: document.getElementById('timezoneToggle'),

  // Request Modal
  requestModal: document.getElementById('requestModal'),
  closeModal: document.getElementById('closeModal'),
  cancelRequest: document.getElementById('cancelRequest'),
  submitRequest: document.getElementById('submitRequest'),
  modalShiftDetail: document.getElementById('modalShiftDetail'),
  availableList: document.getElementById('availableList'),
  requestNote: document.getElementById('requestNote'),
  requestTypeInput: document.getElementById('requestTypeInput'),
  modeCoverage: document.getElementById('modeCoverage'),
  modeSwap: document.getElementById('modeSwap'),
  pivotToSwap: document.getElementById('pivotToSwap'),
  pivotToCoverage: document.getElementById('pivotToCoverage'),

  // Confirmation Modal
  confirmModal: document.getElementById('confirmModal'),
  confirmTitle: document.getElementById('confirmTitle'),
  confirmSummary: document.getElementById('confirmSummary'),
  swapOptions: document.getElementById('swapOptions'),
  swapList: document.getElementById('swapList'),
  confirmNotice: document.getElementById('confirmNotice'),
  closeConfirm: document.getElementById('closeConfirm'),
  cancelConfirm: document.getElementById('cancelConfirm'),
  submitConfirm: document.getElementById('submitConfirm'),

  // Toast
  toast: document.getElementById('toast'),
  toastAction: document.getElementById('toastAction'),

  // Detail Modal
  detailModal: document.getElementById('detailModal'),
  closeDetail: document.getElementById('closeDetail'),
  closeDetailBtn: document.getElementById('closeDetailBtn'),
  cancelDetailRequest: document.getElementById('cancelDetailRequest'),
  detailStatus: document.getElementById('detailStatus'),
  detailShift: document.getElementById('detailShift'),
  detailType: document.getElementById('detailType'),
  detailReason: document.getElementById('detailReason'),
  detailReasonSection: document.getElementById('detailReasonSection'),
  detailAvailable: document.getElementById('detailAvailable'),
  detailResponses: document.getElementById('detailResponses'),

  // Notification Modal
  notifyBtn: document.getElementById('notifyBtn'),
  notifyModal: document.getElementById('notifyModal'),
  closeNotify: document.getElementById('closeNotify'),
  cancelNotify: document.getElementById('cancelNotify'),
  saveNotify: document.getElementById('saveNotify'),
  notifyEmail: document.getElementById('notifyEmail'),
  notifyText: document.getElementById('notifyText'),
  notifyTeams: document.getElementById('notifyTeams'),
  emailGroup: document.getElementById('emailGroup'),
  phoneGroup: document.getElementById('phoneGroup'),
  teamsGroup: document.getElementById('teamsGroup')
};

// Leads/Admins/Supervisors - excluded from operator pool
const EXCLUDED_LEADS = [
  'Rodriguez, Eric',
  'Anderegg, Ryan',
  'Borchardt, Lawrence',
  'McMasters, Jim',
  'Szarejko, Alex',
  'Schlieman, Derek',
  'Cummings, Michael',
  'LaMotta, Gregg',
  'Luchino, David',
  'O\'Connor, Jeff',
  'Brandt, David',
  'Bishop, Jabari',
  'Ceballos, Carlos',
  'Chiafolo, Joseph',
  'Humiston, Kenneth',
  'Kiem, Mackenzie',
  'Morales, Vivian',
  'O\'Connor Jamia, Adam',
  'Ostrofsky, Matt',
  'Rojas, Thomas',
  'Saal, Robert',
  'Sanchez, Irving',
  'Spanopoulos, Steve',
  'Violante, Michael',
  'Williams, Graham',
  'Witzel, Zack',
  'Wroy, Ricky',
  'Funston, Tony',
  'Lau, Welland',
  'Wallace, Kory'
].map(name => name.toLowerCase());

// State
const state = {
  currentUser: null,
  role: 'Operator',
  displayTimezone: 'ET', // 'ET' or 'PT'
  scheduleStartDate: null, // Date object for active week start (Sunday)
  roster: [],
  activeScheduleIndex: 0,
  scheduleFiles: [], // [{ roster, startDate, label }]
  selectedShift: null,
  pendingConfirm: null, // For confirmation modal
  selectedSwapShift: null,
  viewingRequest: null, // For detail modal
  viewingApproval: null, // For lead approval detail modal
  viewingContext: null, // 'own', 'respond', or 'approve'
  lastPostedRequestId: null, // For toast action
  coverageRequests: [
    {
      id: 1,
      requesterName: 'Demo User A',
      day: 'Saturday',
      dayIndex: 6,
      time: '10:00-18:00 ET',
      type: 'swap',
      note: 'Family commitment, looking for swap if possible.',
      timestamp: Date.now() - 3600000
    },
    {
      id: 2,
      requesterName: 'Demo User B',
      day: 'Sunday',
      dayIndex: 0,
      time: '14:00-22:00 ET',
      type: 'coverage',
      note: 'Need coverage for training.',
      timestamp: Date.now() - 7200000
    },
    {
      id: 3,
      requesterName: 'Demo User C',
      day: 'Tuesday',
      dayIndex: 2,
      time: '2p-10p ET',
      type: 'coverage',
      note: 'Doctor appointment.',
      timestamp: Date.now() - 1800000
    }
  ],
  approvals: [
    {
      id: 101,
      type: 'swap',
      requesterName: 'Demo User A',
      responderName: 'Demo User D',
      requesterShift: { day: 'Saturday', time: '10:00-18:00 ET' },
      responderShift: { day: 'Saturday', time: '2p-10p ET' },
      status: 'pending'
    },
    {
      id: 102,
      type: 'coverage',
      requesterName: 'Demo User B',
      responderName: 'Andrew Amisola',
      requesterShift: { day: 'Sunday', time: '14:00-22:00 ET' },
      responderShift: null,
      status: 'pending'
    },
    {
      id: 103,
      type: 'coverage',
      requesterName: 'Demo User C',
      responderName: 'Demo User E',
      requesterShift: { day: 'Tuesday', time: '2p-10p ET' },
      responderShift: null,
      status: 'pending'
    }
  ],
  activityLog: [
    // Example completed approvals for demo
    {
      id: 1001,
      type: 'coverage_approved',
      requesterName: 'Demo User F',
      responderName: 'Demo User G',
      shift: { day: 'Monday', time: '9a-5p ET' },
      approvedBy: 'Szarejko, Alex',
      timestamp: new Date(Date.now() - 86400000).toISOString() // Yesterday
    },
    {
      id: 1002,
      type: 'swap_approved',
      requesterName: 'Demo User H',
      responderName: 'Demo User I',
      shift: { day: 'Wednesday', time: '2p-10p ET' },
      approvedBy: 'McMasters, Jim',
      timestamp: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    }
  ]
};

// Credentials (demo) - accepts any password for demo names in roster
const validCredentials = [
  { username: 'Andrew Amisola', password: 'Disney123!' },
  { username: 'Alvarez Rosa', password: 'Disney123!' },
  { username: 'Baker Jordan', password: 'Disney123!' },
  { username: 'Chen Mina', password: 'Disney123!' },
  { username: 'Diaz Ramon', password: 'Disney123!' },
  { username: 'Hughes Claire', password: 'Disney123!' },
  { username: 'Nguyen Taylor', password: 'Disney123!' },
  { username: 'Patel Anand', password: 'Disney123!' }
];

// Preloaded schedule data (from XLSX files)
const PRELOADED_SCHEDULES = [{"roster":[{"name":"Eric Rodriguez","events":["Request Off","9:30a ADMIN","9:30a ADMIN","9:30a ADMIN","9:30a ADMIN","9:30a ADMIN","Request Off"]},{"name":"Ryan Anderegg","events":["4a-12p ESPN/STAR SUP*","Request Off","7a-3p ESPN/STAR SUP","8a ADMIN*","Request Off","9a ADMIN","6a-2p ESPN/STAR SUP"]},{"name":"Lawrence Borchardt","events":["All Day","7a-3p ESPN/STAR SUP","10a ADMIN","10a ADMIN","All Day","All Day","11a-7p ESPN/STAR SUP"]},{"name":"Jim McMasters","events":["2p-10p ESPN/STAR SUP","2p-10p ESPN/STAR SUP","2p-10p ESPN/STAR SUP","Request Off","Request Off","Request Off","2p-10p ESPN/STAR SUP"]},{"name":"Alex Szarejko","events":["Request Off","11a-7p ESPN/STAR SUP","Request Off","*12p-8p ESPN/STAR SUP","Request Off","11a-7p ESPN/STAR SUP","11a-7p ESPN/STAR SUP"]},{"name":"Derek Schlieman","events":["Request Off","Request Off","Request Off","Request Off","Request Off","Request Off","12p-8p ESPN/STAR SUP"]},{"name":"Michael Cummings","events":["3p-11p ESPN/STAR SUP","3p-11p ESPN/STAR SUP","Request Off","Request Off","3p-11p ESPN/STAR SUP","3p-11p ESPN/STAR SUP","3p-11p ESPN/STAR SUP"]},{"name":"Gregg LaMotta","events":["Request Off","Request Off","Request Off","8a-4p ESPN/STAR SUP*","7a-3p ESPN/STAR SUP","Request Off","7a-3p ESPN/STAR SUP"]},{"name":"David Luchino","events":["Request Off","Request Off","Request Off","Request Off","Request Off","Request Off","Request Off"]},{"name":"Jeff O'Connor","events":["Request Off","Request Off","Request Off","Request Off","Request Off","Request Off","9a-5p ESPN/STAR SUP*"]},{"name":"David Brandt","events":["Request Off","Request Off","7p-3:30a ESPN/STAR SUP","8p-4:30a ESPN/STAR SUP","7p-3:30a ESPN/STAR SUP","7p-3:30a ESPN/STAR SUP","8p-4:30a ESPN/STAR SUP"]},{"name":"Jabari Bishop","events":["*11a-7p ESPN/STAR SUP","Request Off","Request Off","Request Off","Request Off","Request Off","11a-7p ESPN/STAR SUP"]},{"name":"Carlos Ceballos","events":["11a-7p ESPN/STAR SUP","Request Off","Request Off","2p-10p ESPN/STAR SUP","2p-10p ESPN/STAR SUP","Request Off","2p-10p ESPN/STAR SUP"]},{"name":"Joseph Chiafolo","events":["Request Off","Request Off","Request Off","7a-3p ESPN/STAR SUP*","Request Off","7a-3p ESPN/STAR SUP","8a-4p ESPN/STAR SUP"]},{"name":"Kenneth Humiston","events":["4p-12a ESPN/STAR SUP","4p-12a ESPN/STAR SUP","Request Off","Request Off","4p-12a ESPN/STAR SUP","4p-12a ESPN/STAR SUP","4p-12a ESPN/STAR SUP"]},{"name":"Mackenzie Kiem","events":["4p-12a ESPN/STAR SUP","4p-12a ESPN/STAR SUP","All Day","Request Off","4p-12a ESPN/STAR SUP","4p-12a ESPN/STAR SUP","4p-12a ESPN/STAR SUP"]},{"name":"Vivian Morales","events":["Request Off","1p-9p ESPN/STAR SUP","Request Off","Request Off","1p-9p ESPN/STAR SUP","1p-9p ESPN/STAR SUP","1p-9p ESPN/STAR SUP"]},{"name":"Adam O'Connor Jamia","events":["11a-7p ESPN/STAR SUP","All Day","11a-7p ESPN/STAR SUP","11a-7p ESPN/STAR SUP","11a-7p ESPN/STAR SUP","All Day","All Day"]},{"name":"Matt Ostrofsky","events":["Request Off","3p-11p ESPN/STAR SUP","Request Off","Request Off","3p-11p ESPN/STAR SUP","3p-11p ESPN/STAR SUP","*2p-10p ESPN/STAR SUP"]},{"name":"Thomas Rojas","events":["Request Off","Request Off","Request Off","Request Off","9a-5p ESPN/STAR SUP","Request Off","*8a-4p ESPN/STAR SUP"]},{"name":"Robert Saal","events":["All Day","4p-12a ESPN/STAR SUP","4p-12a ESPN/STAR SUP","4p-12a ESPN/STAR SUP","4p-12a ESPN/STAR SUP","All Day","4p-12a ESPN/STAR SUP"]},{"name":"Irving Sanchez","events":["Request Off","Request Off","Request Off","4p-12a ESPN/STAR SUP","4p-12a ESPN/STAR SUP","Request Off","Request Off"]},{"name":"Steve Spanopoulos","events":["9a-5p ESPN/STAR SUP","9a-5p ESPN/STAR SUP","9a-5p ESPN/STAR SUP","All Day","All Day","All Day","9a-5p ESPN/STAR SUP"]},{"name":"Michael Violante","events":["Request Off","Request Off","3p-11p ESPN/STAR SUP","Request Off","Request Off","3p-11p ESPN/STAR SUP","3p-11p ESPN/STAR SUP"]},{"name":"Graham Williams","events":["3p-11p ESPN/STAR SUP","All Day","3p-11p ESPN/STAR SUP","3p-11p ESPN/STAR SUP","All Day","All Day","3p-11p ESPN/STAR SUP"]},{"name":"Zack Witzel","events":["Request Off","Request Off","Request Off","Request Off","Request Off","Request Off","Request Off"]},{"name":"Ricky Wroy","events":["Request Off","Request Off","Request Off","Request Off","Request Off","Request Off","Request Off"]},{"name":"Tony Funston","events":["Request Off","Request Off","Request Off","Request Off","Request Off","Request Off","Request Off"]},{"name":"Welland Lau","events":["All Day","7p-3:30a ESPN/STAR SUP","4p-12:30a ESPN/STAR SUP","4p-12:30a ESPN/STAR SUP","4p-12:30a ESPN/STAR SUP","All Day","4p-12:30a ESPN/STAR SUP"]},{"name":"Kory Wallace","events":["*7p-3:30a ESPN/STAR SUP","*12p-8:30p ESPN/STAR SUP","Request Off","Request Off","*12p-8:30p ESPN/STAR SUP","*12p-8:30p ESPN/STAR SUP","*12p-8:30p ESPN/STAR SUP"]},{"name":"Alex Choi","events":["10p-6a Star Logging","Request Off","Request Off","10p-6a Star Logging","10p-6a Star Logging","10p-6a Star Logging","10p-6a Star Logging"]},{"name":"Paul Dorsa","events":["5:30a-1:30p Star Logging","Request Off","Request Off","5:30a-2:00p Star Logging","5:30a-1:30p Star Logging","5:30a-1:30p Star Logging","5:30a-1:30p Star Logging"]},{"name":"Besim Dushaj","events":["Request Off","5:30a-1:30p Star Logging","5:30a-1:30p Star Logging","5:30a-1:30p Star Logging","5:30a-1:30p Star Logging","All Day","5:30a-1:30p Star Logging"]},{"name":"Zack Holcomb","events":["10p-6a Star Logging","10p-6a Star Logging","10p-6a Star Logging","All Day","All Day","10p-6a Star Logging","10p-6a Star Logging"]},{"name":"Robert Johnson","events":["Request Off","Request Off","10p-6a Star Logging","10p-6a Star Logging","10p-6a Star Logging","10p-6a Star Logging","10p-6a Star Logging"]},{"name":"Omar Keita","events":["Request Off","Request Off","*3p-11p Star Logging","10a-6p Star Logging*","10a-6p Star Logging*","*3p-11p Star Logging","*3p-11p Star Logging"]},{"name":"Kevin Kiem","events":["9a-5p Star Logging","Request Off","Request Off","9a-5p Star Logging","9a-5p Star Logging","9a-5p Star Logging","9a-5p Star Logging"]},{"name":"Aubrey Rubino","events":["*12p-8p Star Logging","Request Off","*12p-8p Star Logging","*11a-7p Star Logging","Request Off","*12p-8p Star Logging","*12p-8p Star Logging"]},{"name":"Eric Soimes","events":["5:30a-1:30p Star Logging","Request Off","Request Off","Request Off","5:30a-1:30p Star Logging","5:30a-1:30p Star Logging","5:30a-1:30p Star Logging"]},{"name":"Chelsey Williams","events":["10p-6a Star Logging","10p-6a Star Logging","All Day","Request Off","10p-6a Star Logging","10p-6a Star Logging","10p-6a Star Logging"]},{"name":"Alex Agius","events":["9a-5p ESPN/Star Logging","2p-6p ESPN/Star Logging\r\n7p(10p) ESPN NHL","12p-8p ESPN/Star Logging","12:30p(3:30p) ESPN NHL","1p(4p) ESPN NHL\r\n4p-8p ESPN/Star Logging","All Day","4p-7p ESPN/Star Logging\r\n8p(11:15p) ESPN NFL on ESPN: Doubleheader Saturday"]},{"name":"Andrew Amisola","events":["All Day","2p-10p ESPN/Star Logging","2p-10p ESPN/Star Logging","All Day","4:10p(7:40p) ESPN College Football Playoff Quarterfinal at the Rose Bowl Game Presented by Prudential","5p(5:30p) D+ VibeCheck\r\n5:30p-10p ESPN/Star Logging","2p-10p ESPN/Star Logging"]},{"name":"Mohanna Aziz","events":["12p-8p ESPN/Star Logging","All Day","Request Off","All Day","4:10p(7:40p) ESPN Field Pass with McAfee: CFP Quarterfinal at the Rose Bowl Game Presented by Prudential","12p-8p ESPN/Star Logging","12p-8p ESPN/Star Logging"]},{"name":"Keith Bogan","events":["2p-6p ESPN/Star Logging\r\n7p(10p) ESPN NHL","5p(5:30p) D+ VibeCheck\r\n7p(10p) ESPN NHL","All Day","4p(7p) ESPN NHL","4:10p(7:40p) ESPN Command Center: CFP Quarterfinal at the Rose Bowl Game Presented by Prudential","All Day","4p(7p) ESPN NHL\r\n7p-11p ESPN/Star Logging"]},{"name":"Dylan Brennan","events":["Request Off","5p-9p ESPN/Star Logging\r\n10p(1a) ESPN NHL","All Day","3p(6p) ESPN NHL\r\n6p-10p ESPN/Star Logging","3p(6p) ESPN NHL\r\n6p-10p ESPN/Star Logging","All Day","3:30p(6:30p) ESPN NHL\r\n6:30p-10:30p ESPN/Star Logging"]},{"name":"Joseph Caracappa","events":["9a-5p ESPN/Star Logging","Request Off","Request Off","Request Off","Request Off","9a-5p ESPN/Star Logging","All Day"]},{"name":"Sean Cerise","events":["*10a-6p ESPN BRB","2p-10p ESPN BRB","All Day","Out by 11pm","2p-10p ESPN BRB","2p-10p ESPN BRB","*10a-6p ESPN BRB"]},{"name":"Robert Connolly","events":["Request Off","10a-6p ESPN/Star Logging","630p+","clear by 4p","*8:10p(11:40p) ESPN Command Center: CFP Quarterfinal at the Allstate Sugar Bowl","5p+","10a-6p ESPN/Star Logging"]},{"name":"Daniel Contreras","events":["5am - 12pm","8a-4p ESPN/Star Logging","Request Off","5am - 12pm","Request Off","8a-4p ESPN/Star Logging","8a-4p ESPN/Star Logging"]},{"name":"Michael Contreras","events":["11a-7p ESPN/Star Logging","11a-7p ESPN/Star Logging","Request Off","All Day","12:10p(3:40p) ESPN Command Center: CFP Quarterfinal at the Capital One Orange Bowl\r\n3:40p-7p ESPN/Star Logging","11a-7p ESPN/Star Logging","All Day"]},{"name":"Lance Counts","events":["10:30a(11a) D+ SC+\r\n11a-3p ESPN/Star Logging*","9a(9:30a) D+ SC+\r\n10a(12p) ESPN Clinton & Friends*","Request Off","Request Off","9a(9:30a) D+ SC+\r\n10a(12p) ESPN Clinton & Friends*","Switch Off","Before 3pm"]},{"name":"Brian Cruz","events":["Request Off","Request Off","Request Off","Request Off","Request Off","Request Off","3p(6p) ESPN NHL\r\n6p-10p ESPN/Star Logging"]},{"name":"Christopher Dalton","events":["Request Off","Request Off","Request Off","Request Off","Request Off","Request Off","Request Off"]},{"name":"Anastasiia Denysiuk","events":["Request Off","All Day","5p(6p) ESPN Tue, 12/30 - ESPN FC\r\n7p(9p) ESPN NBA G League","Request Off","Request Off","2p-10p ESPN/Star Logging","2p-10p ESPN/Star Logging"]},{"name":"Nicholas DiCinti","events":["10a-6p ESPN/Star Logging","12p(3p) ESPN Mon, 12/29 - The Rich Eisen Show*","12p(3p) ESPN Tue, 12/30 - The Rich Eisen Show","9a-7p","*10:30a(12:30p) ESPN ACL\r\n12:30p-4p ESPN/Star Logging*","9a-6p","*8a-1p ESPN/Star Logging*"]},{"name":"Nikolas Donadic","events":["11a-7p ESPN BRB","12p(12:30p) D+ WYNTK\r\n12:30p-7p ESPN/Star Logging","Request Off","Request Off","11a(1p) ESPN The Rose Parade Presented by Honda\r\n1p-6p ESPN/Star Logging","11a-7p ESPN BRB","11a-7p ESPN BRB"]},{"name":"Robert Duffy","events":["12p-8p ESPN/Star Logging","5p(6p) ESPN Mon, 12/29 - ESPN FC\r\n8p(11:15p) ESPN Monday Night Football (S)","12p-8p ESPN/Star Logging","Request Off","Request Off","12p-8p ESPN/Star Logging","All Day"]},{"name":"Kyle Fader","events":["Request Off","Request Off","2p-10p ESPN/Star Logging","3p(6:30p) ESPN Cheez-It Citrus Bowl","2p-6p ESPN/Star Logging\r\n7p(10p) ESPN NHL","3p(6p) ESPN NHL\r\n8p(11p) ESPN NHL","4p(7p) ESPN NHL\r\n9p(12a) ESPN NHL"]},{"name":"Patrick Flood","events":["5p(8p) ESPN NHL","2:30p-6:30p ESPN/Star Logging\r\n7:30p(10:30p) ESPN NHL","2p-10p ESPN/Star Logging","7am - 3 pm","Request Off","2p-10p ESPN/Star Logging","3p(6p) ESPN NHL\r\n6p-10p ESPN/Star Logging"]},{"name":"John Gjoni","events":["Request Off","6p-7p starts","6p-7p starts","Request Off","Request Off","Request Off","Request Off"]},{"name":"Jay Giampietro","events":["Request Off","12p(4p) ESPN McAfee*","Request Off","Request Off","12-7pm","12p(4p) ESPN McAfee*","*11a-5p ESPN/Star Logging*"]},{"name":"Fiorella Gomez","events":["11a-7p ESPN BRB","2p-10p ESPN BRB","2p-10p ESPN BRB","Out by 6p","All Day","11a-7p ESPN BRB","11a-7p ESPN BRB"]},{"name":"Nigel Gordon","events":["4p-111p","*10a-6p ESPN/Star Logging","*10a-6p ESPN/Star Logging","10a-6p","3p-10p","*10a-6p ESPN/Star Logging","*10a-4p ESPN/Star Logging*"]},{"name":"James Graceffo","events":["Request Off","8p(11p) ESPN NHL","7p(10p) ESPN NHL","Done by 5p","Request Off","12p(3p) ESPN Fri, 1/2 - The Rich Eisen Show*","12p(3p) ESPN ABC Hockey Saturday*"]},{"name":"Adam Grassani","events":["12p-8p ESPN/Star Logging","Switch Off","All Day","All Day","4:30p(6p) ESPN ACL\r\n8:30p(10:30p) ESPN ACL","12p-8p ESPN/Star Logging","*9a-5p ESPN/Star Logging*"]},{"name":"James Griffo","events":["1p(4p) D+ NFL Seahawks vs. Panthers*","12p-8p ESPN/Star Logging","All Day","8am-6pm","4:10p(7:40p) ESPN SkyCast: CFP Quarterfinal at the Rose Bowl Game Presented by Prudential","12p-8p ESPN/Star Logging","12p-8p ESPN/Star Logging"]},{"name":"Jason Hancock","events":["11a-3p ESPN/Star Logging\r\n4:25p(7:30p) D+ NFL Eagles vs. Bills","Request Off","Request Off","All Day","4p-7p ESPN/Star Logging\r\n8:10p(11:40p) ESPN College Football Playoff Quarterfinal at the Allstate Sugar Bowl","2p-10p ESPN/Star Logging","4:30p(7:30p) ESPN NFL on ESPN: Doubleheader Saturday\r\n9p(11:30p) ESPN National Lacrosse League"]},{"name":"Antonio Hernandez","events":["7a-3p ESPN/Star Logging*","10a-6p ESPN/Star Logging","All Day","Until 9pm","Request Off","10a-6p ESPN/Star Logging","8a-4p ESPN/Star Logging*"]},{"name":"Joseph Hersh","events":["12p-8p ESPN/Star Logging","12p-8p ESPN/Star Logging","1p-6p ESPN/Star Logging","Out by 7pm","After 2pm","12p-8p ESPN/Star Logging","All Day"]},{"name":"Oscar Jimenez","events":["Request Off","*10p(1a) ESPN NHL","2pm +","5p(5:30p) D+ VibeCheck\r\n6:30p(9:30p) ESPN NHL*","2p-6p ESPN/Star Logging\r\n7p(10p) ESPN NHL","2pm +","2p-6p ESPN/Star Logging\r\n7p(10p) ESPN NHL"]},{"name":"Dylan Jock","events":["11a-7p ESPN BRB","Request Off","Request Off","3p-6:30p ESPN/Star Logging\r\n7:37p(11p) ESPN SkyCast: CFP Quarterfinal at the Goodyear Cotton Bowl Classic","Request Off","Request Off","Request Off"]},{"name":"Michael Jozwiak","events":["8a-3p ESPN/Star Logging*","Out by 2p","Out by 2p","Out by 3p","All Day","8a-3p ESPN/Star Logging*","8a-4p ESPN/Star Logging"]},{"name":"Glenn King","events":["7a-1p ESPN/Star Logging*","5AM-1PM","5AM-1PM","5AM-12PM","Request Off","10:30a(12:30p) ESPN ACL*","Request Off"]},{"name":"Elizabeth Krajewski","events":["Switch Off","All Day","All Day","All Day","2p-10p ESPN/Star Logging","2p-10p ESPN/Star Logging","12p(5p) ESPN ACL"]},{"name":"Michael Lee","events":["Request Off","*7p(10p) ESPN NHL","*7p(10p) ESPN NHL","*7p(10p) ESPN NHL","Available from 9am to 11pm","Available from 9am to 11pm","7p(10p) ESPN NHL*"]},{"name":"Kevin Martin","events":["All Day","11a-7p ESPN/Star Logging","12p(4p) ESPN McAfee","Request Off","Request Off","11a-7p ESPN/Star Logging","11a-7p ESPN/Star Logging"]},{"name":"Roberto Medina","events":["12p-8p ESPN/Star Logging","All Day","Request Off","All Day","12p-8p ESPN/Star Logging","12p-8p ESPN/Star Logging","12p-8p ESPN/Star Logging"]},{"name":"Rose Miller","events":["All Day","10a-6p ESPN/Star Logging","1:30p-6:30p ESPN/Star Logging\r\n7:30p(9:30p) ESPN NBA G League","Request Off","Request Off","10a-6p ESPN/Star Logging","2p-6p ESPN/Star Logging\r\n7p(9:30p) ESPN National Lacrosse League"]},{"name":"Kimberly Morales","events":["Request Off","9a-5p ESPN/Star Logging","9a-5p ESPN/Star Logging","Request Off","Request Off","Request Off","9a-5p ESPN/Star Logging"]},{"name":"Maya Peart","events":["Request Off","Request Off","Request Off","Request Off","Request Off","Request Off","Request Off"]},{"name":"Matthew Press","events":["3p-7p ESPN/Star Logging\r\n8p(11p) ESPN NHL","5p-9p ESPN/Star Logging\r\n10p(1a) ESPN NHL","5p-9p ESPN/Star Logging\r\n10p(1a) ESPN NHL","4:30p-8:30p ESPN/Star Logging\r\n9:30p(12:30a) ESPN NHL","All Day","9a(9:30a) D+ SC+\r\n10a(12p) ESPN Clinton & Friends","7p(10p) ESPN NHL"]},{"name":"Melissa Robilotta","events":["Request Off","Request Off","Request Off","Request Off","Request Off","*8:30p(10:30p) ESPN ACL","9:00 AM - 4:00 PM"]},{"name":"Jacob Rossi","events":["Request Off","3p-7p ESPN/Star Logging\r\n8p(10:30p) D+ NBA Cavaliers vs. Spurs","3p-7p ESPN/Star Logging\r\n8p(10:30p) D+ NBA 76ers vs. Grizzlies","Request Off","Request Off","All Day","2p-10p ESPN/Star Logging"]},{"name":"Jack Schneider","events":["3p(5p) ESPN TGL Presented by SoFi\r\n7:30p(8:15p) ESPN NFL PrimeTime on ESPN+","All Day","Request Off","5p(6p) ESPN Wed, 12/31 - ESPN FC\r\n7:37p(11p) ESPN College Football Playoff Quarterfinal at the Goodyear Cotton Bowl Classic","4p-7p ESPN/Star Logging\r\n8:10p(11:40p) ESPN SkyCast: CFP Quarterfinal at the Allstate Sugar Bowl","2p-10p ESPN/Star Logging","4p-6:45p ESPN/Star Logging\r\n7:50p(11:15p) ESPN NFL on ESPN Playbook with Next Gen Stats"]},{"name":"Eddie Segarra","events":["*1p(4p) D+ NFL Steelers vs. Browns\r\n4p-8p ESPN/Star Logging","All Day","2p-7p ESPN/Star Logging\r\n8p(10p) ESPN NBA G League","Request Off","Request Off","2p-10p ESPN/Star Logging","3p-7:30p ESPN/Star Logging\r\n8:30p(10:30p) ESPN ACL"]},{"name":"Franco Sevillano","events":["Request Off","12p-8p ESPN/Star Logging","7p(9p) ESPN NBA G League","9A to 5P","12:10p(3:40p) ESPN College Football Playoff Quarterfinal at the Capital One Orange Bowl*","Request Off","Switch Off"]},{"name":"Oswaldo Sevillano","events":["11a-7p ESPN/Star Logging","All Day","12p(12:30p) D+ WYNTK\r\n12:30p-7p ESPN/Star Logging","12p(12:30p) D+ WYNTK\r\n12:30p-7p ESPN/Star Logging","12:10p(3:40p) ESPN SkyCast: CFP Quarterfinal at the Capital One Orange Bowl\r\n3:30p-7p ESPN/Star Logging","12p(12:30p) D+ WYNTK\r\n12:30p-7p ESPN/Star Logging","All Day"]},{"name":"Willy Sevillano","events":["Request Off","*10a-6p ESPN/Star Logging","3p-7p ESPN/Star Logging\r\n8p(10:30p) ESPN NBA G League","10A+","Request Off","*10a-6p ESPN/Star Logging","*10a-6p ESPN/Star Logging"]},{"name":"Justin Silverman","events":["9a-5p ESPN/Star Logging","Request Off","Request Off","Request Off","Request Off","Request Off","*12p-8p ESPN/Star Logging"]},{"name":"Chad Townsend","events":["Request Off","6PM+","6PM+","Out by 7PM","All Day","Request Off","3p-7:30p ESPN/Star Logging\r\n8:30p(10:30p) D+ WNBL Canberra Capitals vs. Perth Lynx"]},{"name":"David Turner","events":["Request Off","9p(12a) ESPN NHL","8:30p(11:30p) ESPN NHL","4p(7p) ESPN NHL\r\n9p(12a) ESPN NHL","7p(10p) ESPN NHL","Request Off","Request Off"]},{"name":"Nicholas Violante","events":["Out by 2p","Out by 2p","9a(9:30a) D+ SC+\r\n10a(12p) ESPN Clinton & Friends*","9a(9:30a) D+ SC+\r\n10a(12p) ESPN Clinton & Friends*","All Day","8a-4p ESPN/Star Logging","8a-4p ESPN/Star Logging"]},{"name":"Michael Witte","events":["5p(8p) ESPN NHL","*9p(12a) ESPN NHL","*7p(10p) ESPN NHL","*8p(11p) ESPN NHL","Request Off","6pm in time - 3am out time","7p(10p) ESPN NHL"]},{"name":"Brandon Worden","events":["Request Off","Request Off","Request Off","Request Off","Request Off","After 4p","*4p-11p ESPN/Star Logging"]},{"name":"Matt Zofchak","events":["2p-6p ESPN BRB\r\n7p(10p) ESPN NHL","Request Off","2p-10p ESPN BRB","All Day","2p-6p ESPN BRB\r\n7p(10p) ESPN NHL","2p-10p ESPN BRB","2p-6p ESPN BRB\r\n7p(10p) ESPN NHL"]},{"name":"Sebastian Diaz","events":["All Day","9p(12a) ESPN NHL","All Day","4:30p-8:30p ESPN/Star Logging\r\n9:30p(12:30a) ESPN NHL","3:30p-7:30p ESPN/Star Logging\r\n8:30p(11:30p) ESPN NHL","5:30p-9:30p ESPN/Star Logging\r\n10:30p(1:30a) ESPN NHL","5p-9p ESPN/Star Logging\r\n10p(1a) ESPN NHL"]},{"name":"Chris Evers","events":["All Day","6:40p(10:10p) ESPN Women's Dream 11 Super Smash T20\r\n10:25p(1:55a) ESPN Men's Dream 11 Super Smash T20","6:40p(10:10p) ESPN Women's Dream 11 Super Smash T20\r\n10:25p(1:55a) ESPN Men's Dream 11 Super Smash T20","5:30p-9:30p ESPN/Star Logging\r\n10:30p(1a) D+ NBA Trail Blazers vs. Thunder","8:30p(10:30p) ESPN Ohio Valley Conference Basketball\r\n12a(2a) ESPN Women's College Basketball","All Day","8:10p(11:40p) ESPN Women's Dream 11 Super Smash T20\r\n11:55p(3:25a) ESPN Men's Dream 11 Super Smash T20"]},{"name":"Hanna Garcia","events":["All Day","3p(6p) ESPN Freddie & Harry\r\n6p-10p ESPN/Star Logging","3p(6p) ESPN Freddie & Harry\r\n7p(9p) ESPN NBA G League","All Day","7p(9:30p) D+ NBA Heat vs. Pistons\r\n10p(12:30a) D+ NBA Celtics vs. Kings","4p-12a ESPN/Star Logging","All Day"]},{"name":"Ayannah Green","events":["Request Off","4p-12a ESPN/Star Logging","4p-12a ESPN/Star Logging","Request Off","Request Off","5p(6p) ESPN Fri, 1/2 - ESPN FC\r\n8p(10:30p) ESPN National Lacrosse League","All Day"]},{"name":"Elijah Hernandez","events":["3p-7p ESPN/Star Logging\r\n8p(10:30p) ESPN National Lacrosse League","4p-12a ESPN/Star Logging","Request Off","All Day","All Day","3p(6p) ESPN Freddie & Harry\r\n8p(10p) ESPN ACC Men's Basketball","5p(5:30p) ESPN ESPN FC\r\n7p(9:30p) ESPN National Lacrosse League"]},{"name":"Greyson Hines","events":["Request Off","Request Off","2p-10p ESPN/Star Logging","Request Off","All Day","2p-10p ESPN/Star Logging","2p-10p ESPN/Star Logging"]},{"name":"Halle Holmes","events":["2p-10p ESPN/Star Logging","2p-10p ESPN/Star Logging","2p-10p ESPN/Star Logging","2p-10p ESPN/Star Logging","Out by 7pm","All Day","All Day"]},{"name":"Yash Kapadia","events":["6:40p(10:10p) ESPN Women's Dream 11 Super Smash T20\r\n10:25p(1:55a) ESPN Men's Dream 11 Super Smash T20","Request Off","Request Off","8:10p(11:40p) ESPN Women's Dream 11 Super Smash T20\r\n11:55p(3:25a) ESPN Men's Dream 11 Super Smash T20","6:40p(10:10p) ESPN Women's Dream 11 Super Smash T20\r\n10:25p(1:55a) ESPN Men's Dream 11 Super Smash T20","6:40p(10:10p) ESPN Women's Dream 11 Super Smash T20\r\n10:25p(1:55a) ESPN Men's Dream 11 Super Smash T20","All Day"]},{"name":"Julio Marquez","events":["4p-12a ESPN/Star Logging","5p-12 am PST","*10:30p(1a) D+ NBA Pistons vs. Lakers","Request Off","5p(6p) ESPN Thu, 1/1 - ESPN FC\r\n7p(9p) ESPN NBA G League","4p-12a ESPN/Star Logging","All Day"]},{"name":"Mario Mendoza","events":["*9:30p(12a) D+ NBA Kings vs. Lakers","Request Off","After 4:30pm","All Day","Request Off","Request Off","*10p(12:30a) ESPN National Lacrosse League"]},{"name":"Moises Miranda","events":["All Day","All Day","4p-12a ESPN/Star Logging","All Day","4p-12a ESPN/Star Logging","4p-12a ESPN/Star Logging","4p-12a ESPN/Star Logging"]},{"name":"Marcos Pinto-Leite","events":["Request Off","Request Off","Request Off","Request Off","5p-9p ESPN/Star Logging\r\n10p(1a) ESPN NHL","7p(9p) ESPN TGL Presented by SoFi\r\n10:30p(1:30a) ESPN NHL","4p-12a ESPN/Star Logging"]},{"name":"Felix Quinonez","events":["Request Off","PTO","PTO","PTO","Request Off","4p-12a ESPN/Star Logging","Switch Off"]},{"name":"Felipe Reis","events":["4p-12a ESPN/Star Logging","4p-12a ESPN/Star Logging","4p-12a ESPN/Star Logging","4p-12a ESPN/Star Logging","All Day","All Day","All Day"]},{"name":"Greg Tietz","events":["All Day","4p-12a ESPN/Star Logging","4p-12a ESPN/Star Logging","Available 7a-5p","Request Off","2p-10p ESPN/Star Logging","5p(9p) ESPN Dogs\r\n9p-12a ESPN/Star Logging"]},{"name":"Leonel Tolentino","events":["4p-12a ESPN/Star Logging","Request Off","After 530p","Request Off","Request Off","After 530p","*10:30p(12:30a) D+ NBL Breakers vs. Wildcats"]}],"startDate":"12/28/2025","label":"Week of 12/28"},{"roster":[{"name":"Eric Rodriguez","events":["Request Off","9:30a ADMIN","9:30a ADMIN","9:30a ADMIN","9:30a ADMIN","9:30a ADMIN","Request Off"]},{"name":"Ryan Anderegg","events":["4a-12p ESPN/STAR SUP*","Request Off","9a ADMIN","9a ADMIN","9a ADMIN","9a ADMIN","Request Off"]},{"name":"Lawrence Borchardt","events":["12p-8p ESPN/STAR SUP","10a ADMIN","10a ADMIN","10a ADMIN","All Day","All Day","10a-6p ESPN/STAR SUP"]},{"name":"Jim McMasters","events":["All Day","All Day","All Day","All Day","All Day","All Day","All Day"]},{"name":"Alex Szarejko","events":["Request Off","All Day","TBD ADMIN","TBD ADMIN","TBD ADMIN","TBD ADMIN","12p-8p ESPN/STAR SUP"]},{"name":"Derek Schlieman","events":["Request Off","All Day","TBD ADMIN","TBD ADMIN","TBD ADMIN","TBD ADMIN","2p-10p ESPN/STAR SUP"]},{"name":"Michael Cummings","events":["3p-11p ESPN/STAR SUP","Request Off","Request Off","Request Off","3p-11p ESPN/STAR SUP","3p-11p ESPN/STAR SUP","3p-11p ESPN/STAR SUP"]},{"name":"Gregg LaMotta","events":["5a-1p ESPN/STAR SUP*","7a-3p ESPN/STAR SUP*","6a-2p ESPN/STAR SUP*","7a-3p ESPN/STAR SUP*","Request Off","Request Off","*7a-3p ESPN/STAR SUP*"]},{"name":"David Luchino","events":["Request Off","Request Off","9a-5p ADMIN","9a-5p ADMIN","9a-5p ADMIN","9a-5p ADMIN","Request Off"]},{"name":"Jeff O'Connor","events":["Request Off","2p-10p ESPN/STAR SUP","2p-10p ESPN/STAR SUP","Request Off","9a-5p ESPN/STAR SUP*","9a-5p ESPN/STAR SUP*","9a-5p ESPN/STAR SUP*"]},{"name":"David Brandt","events":["7p-3:30a ESPN/STAR SUP","7p-3:30a ESPN/STAR SUP","Request Off","after 3p","*6p-2:30a ESPN/STAR SUP","*6p-2:30a ESPN/STAR SUP","4p-12:30a ESPN/STAR SUP"]},{"name":"Jabari Bishop","events":["8a-4p ESPN/STAR SUP*","9a-5p ESPN/STAR SUP*","9a-5p ESPN/STAR SUP","Request Off","Request Off","10a-6p ESPN/STAR SUP*","12p-8p ESPN/STAR SUP"]},{"name":"Carlos Ceballos","events":["11a-7p ESPN/STAR SUP","Request Off","3p-11p ESPN/STAR SUP","3p-11p ESPN/STAR SUP","3p-11p ESPN/STAR SUP","Request Off","11a-7p ESPN/STAR SUP*"]},{"name":"Joseph Chiafolo","events":["9a-5p ESPN/STAR SUP","Request Off","Request Off","8a-4p ESPN/STAR SUP","7a-3p ESPN/STAR SUP","7a-3p ESPN/STAR SUP","5a-1p ESPN/STAR SUP"]},{"name":"Kenneth Humiston","events":["4p-12a ESPN/STAR SUP","4p-12a ESPN/STAR SUP","4p-12a ESPN/STAR SUP","Request Off","Request Off","4p-12a ESPN/STAR SUP","4p-12a ESPN/STAR SUP"]},{"name":"Mackenzie Kiem","events":["4p-12a ESPN/STAR SUP","Request Off","4p-12a ESPN/STAR SUP","4p-12a ESPN/STAR SUP","Request Off","4p-12a ESPN/STAR SUP","4p-12a ESPN/STAR SUP"]},{"name":"Vivian Morales","events":["1p-9p ESPN/STAR SUP","1p-9p ESPN/STAR SUP","1p-9p ESPN/STAR SUP","1p-9p ESPN/STAR SUP","Request Off","All Day","1p-9p ESPN/STAR SUP"]},{"name":"Adam O'Connor Jamia","events":["11a-7p ESPN/STAR SUP","11a-7p ESPN/STAR SUP","All Day","All Day","11a-7p ESPN/STAR SUP","11a-7p ESPN/STAR SUP","11a-7p ESPN/STAR SUP"]},{"name":"Matt Ostrofsky","events":["Request Off","3p-11p ESPN/STAR SUP","3p-11p ESPN/STAR SUP","3p-11p ESPN/STAR SUP","Request Off","Request Off","Request Off"]},{"name":"Thomas Rojas","events":["*8a-4p ESPN/STAR SUP","Request Off","In time 9am","9a-5p ESPN/STAR SUP","9a-5p ESPN/STAR SUP","9a-5p ESPN/STAR SUP","9a-5p ESPN/STAR SUP"]},{"name":"Robert Saal","events":["Request Off","Request Off","Request Off","Request Off","Request Off","Request Off","Request Off"]},{"name":"Irving Sanchez","events":["All Day","4p-12a ESPN/STAR SUP","4p-12a ESPN/STAR SUP","4p-12a ESPN/STAR SUP","4p-12a ESPN/STAR SUP","Request Off","Request Off"]},{"name":"Steve Spanopoulos","events":["6a-2p ESPN/STAR SUP*","Request Off","All Day","9a-5p ESPN/STAR SUP","9a-5p ESPN/STAR SUP","9a-5p ESPN/STAR SUP","9a-5p ESPN/STAR SUP"]},{"name":"Michael Violante","events":["3p-11p ESPN/STAR SUP","3p-11p ESPN/STAR SUP","All Day","All Day","3p-11p ESPN/STAR SUP","3p-11p ESPN/STAR SUP","3p-11p ESPN/STAR SUP"]},{"name":"Graham Williams","events":["All Day","All Day","3p-11p ESPN/STAR SUP","3p-11p ESPN/STAR SUP","3p-11p ESPN/STAR SUP","3p-11p ESPN/STAR SUP","3p-11p ESPN/STAR SUP"]},{"name":"Zack Witzel","events":["Request Off","Request Off","11a-7p ESPN/STAR SUP","11a-7p ESPN/STAR SUP","available after 11 a.m.","available after 8 a.m.","10a-6p ESPN/STAR SUP"]},{"name":"Ricky Wroy","events":["Request Off","Request Off","2p-10p ESPN/STAR SUP","2p-10p ESPN/STAR SUP","2p-10p ESPN/STAR SUP","2p-10p ESPN/STAR SUP*","11a-7p ESPN/STAR SUP*"]},{"name":"Tony Funston","events":["Request Off","All Day","4p-12:30a ESPN/STAR SUP","4p-12:30a ESPN/STAR SUP","1p-9:30p ESPN/STAR SUP*","4p-12:30a ESPN/STAR SUP","4p-12:30a ESPN/STAR SUP"]},{"name":"Welland Lau","events":["All Day","All Day","7p-3:30a ESPN/STAR SUP","8p-4:30a ESPN/STAR SUP","7p-3:30a ESPN/STAR SUP","8p-4:30a ESPN/STAR SUP","7p-3:30a ESPN/STAR SUP"]},{"name":"Kory Wallace","events":["*12p-8:30p ESPN/STAR SUP","*12p-8:30p ESPN/STAR SUP","Request Off","Request Off","*12p-8:30p ESPN/STAR SUP","*12p-8:30p ESPN/STAR SUP","*12p-8:30p ESPN/STAR SUP"]},{"name":"Alex Choi","events":["10p-6a Star Logging","BETWEEN 7PM AND 3AM","BETWEEN 7PM AND 3AM","10p-6a Star Logging","10p-6a Star Logging","10p-6a Star Logging","10p-6a Star Logging"]},{"name":"Paul Dorsa","events":["5:30a-1:30p Star Logging","Request Off","Request Off","5:30a-1:30p Star Logging","5:30a-1:30p Star Logging","5:30a-1:30p Star Logging","5:30a-1:30p Star Logging"]},{"name":"Besim Dushaj","events":["5:30a-1:30p Star Logging","Request Off","Request Off","Request Off","5:30a-1:30p Star Logging","5:30a-1:30p Star Logging","5:30a-1:30p Star Logging"]},{"name":"Zack Holcomb","events":["10p-6a Star Logging","10p-6a Star Logging","10p-6a Star Logging","All Day","All Day","10p-6a Star Logging","10p-6a Star Logging"]},{"name":"Robert Johnson","events":["All Day","All Day","10p-6a Star Logging","10p-6a Star Logging","10p-6a Star Logging","10p-6a Star Logging","10p-6a Star Logging"]},{"name":"Omar Keita","events":["*3p-11p Star Logging","Request Off","*3p-11p Star Logging","10a-6p Star Logging*","*3p-11p Star Logging","*3p-11p Star Logging","Request Off"]},{"name":"Kevin Kiem","events":["9a-5p Star Logging","Request Off","Request Off","9a-5p Star Logging","9a-5p Star Logging","9a-5p Star Logging","9a-5p Star Logging"]},{"name":"Aubrey Rubino","events":["*12p-8p Star Logging*","Request Off","*12p-8p Star Logging*","Request Off","*12p-8p Star Logging*","*12p-8p Star Logging*","*12p-8p Star Logging*"]},{"name":"Eric Soimes","events":["5:30a-1:30p Star Logging","5:30a-1:30p Star Logging","5:30a-1:30p Star Logging","5:30a-1:30p Star Logging","All Day","All Day","5:30a-1:30p Star Logging"]},{"name":"Chelsey Williams","events":["10p-6a Star Logging","10p-6a Star Logging","All Day","All Day","10p-6a Star Logging","10p-6a Star Logging","10p-6a Star Logging"]},{"name":"Andrew Amisola","events":["All Day","All Day","12p(12:30p) D+ WYNTK\r\n12:30p-7p ESPN/Star Logging","4p-8:30p ESPN/Star Logging\r\n9:30p(12a) ESPN NBA Miércoles","7:30p(11p) ESPN College Football Playoff Semifinal at the Vrbo Fiesta Bowl (S)","12p(6p) ESPN Mecum Auctions: Kissimmee 2026","12p-8p ESPN/Star Logging"]},{"name":"Mohanna Aziz","events":["11a-4p ESPN/Star Logging\r\n5p(7p) ESPN Holiday Hoops","8am-5p","3p-7p ESPN/Star Logging\r\n8p(10:30p) D+ NBA Heat vs. Timberwolves*","2p-11p","3p-6:30p ESPN/Star Logging\r\n7:30p(9:30p) ESPN NBA G League","3p(6p) ESPN Freddie & Harry","Request Off"]},{"name":"Keith Bogan","events":["All Day","2p-10p ESPN/Star Logging","5p(6p) ESPN Tue, 1/6 - ESPN FC\r\n8p(11p) ESPN NHL","5p(5:30p) D+ VibeCheck\r\n7p(10p) ESPN NHL","2p-6p ESPN/Star Logging\r\n7p(10p) ESPN NHL","3p+","11a-6p ESPN/Star Logging*"]},{"name":"Dylan Brennan","events":["All Day","5p(6p) ESPN Mon, 1/5 - ESPN FC\r\n7:30p(10:30p) ESPN FCS Football Championship","2p-6p ESPN/Star Logging\r\n7p(10p) ESPN NHL","Request Off","2p-6p ESPN/Star Logging\r\n7p(10p) ESPN NHL","All Day","2p-6p ESPN/Star Logging\r\n7p(10p) ESPN NHL"]},{"name":"Joseph Caracappa","events":["10a(3p) ESPN ACL Myrtle Beach Signature","Request Off","Request Off","Request Off","Request Off","All Day","8a-4p ESPN/Star Logging"]},{"name":"Sean Cerise","events":["12p-8p ESPN BRB","All Day","All Day","12p(12:30p) D+ WYNTK\r\n12:30p-7p ESPN/Star Logging*","2p-6p ESPN/Star Logging\r\n7p(10p) ESPN NHL","2p-10p ESPN BRB","2p-6p ESPN/Star Logging\r\n7p(10p) ESPN NHL"]},{"name":"Robert Connolly","events":["9a-5p ESPN/Star Logging","All Day","All Day","*7p(9:30p) ESPN NBA Miércoles","*8p(11p) ESPN Missouri High School Basketball","5p(6p) ESPN Fri, 1/9 - ESPN FC\r\n8p(11p) ESPN Missouri High School Basketball","*8p(10p) D+ AEW: Collision"]},{"name":"Daniel Contreras","events":["10a-6p ESPN/Star Logging","All Day","All Day","Request Off","2:30p-7p ESPN/Star Logging\r\n8p(10:30p) D+ NBA Heat vs. Bulls","10a-6p ESPN/Star Logging","10a-6p ESPN/Star Logging"]},{"name":"Lance Counts","events":["10:30a(11a) D+ SC+\r\n11a-3p ESPN/Star Logging*","Before 2pm","Request Off","Request Off","9a(9:30a) D+ SC+\r\n10a(12p) ESPN Clinton*","9a(9:30a) D+ SC+\r\n10a(12p) ESPN Clinton*","7a-3p ESPN/Star Logging*"]},{"name":"Brian Cruz","events":["Request Off","Request Off","Request Off","Request Off","*8p(10:30p) ESPN ESPN+ Hockey Night","*8p(11p) ESPN NHL","2p-6p ESPN/Star Logging\r\n7p(10p) ESPN NHL"]},{"name":"Christopher Dalton","events":["6:30pm on","7:30pm on","*9p(12a) ESPN NHL","*9:30p(12:30a) ESPN NHL","*9p(12a) ESPN NHL","Request Off","Request Off"]},{"name":"Anastasiia Denysiuk","events":["Request Off","All Day","All Day","3p-8p ESPN/Star Logging\r\n9p(11p) ESPN NBA G League","1:30p(4p) ESPN SuperCopa Football\r\n4p-8p ESPN/Star Logging","2p-10p ESPN/Star Logging","6am-11am"]},{"name":"Nicholas DiCinti","events":["8a-1p","12p(3p) ESPN Mon, 1/5 - The Rich Eisen Show","12p(3p) ESPN Tue, 1/6 - The Rich Eisen Show","12p(3p) ESPN Wed, 1/7 - The Rich Eisen Show","12p(3p) ESPN Thu, 1/8 - The Rich Eisen Show","9a-6p","8a-1p"]},{"name":"Nikolas Donadic","events":["11a-7p ESPN BRB","12p(12:30p) D+ WYNTK\r\n12:30p-7p ESPN/Star Logging","Request Off","Request Off","2p-10p ESPN BRB","1p-9p ESPN BRB*","1p-9p ESPN BRB*"]},{"name":"Kyle Fader","events":["Request Off","5p(5:30p) D+ VibeCheck\r\n7p(10p) ESPN NHL","2p-10p ESPN/Star Logging","2:30p-6:30p ESPN/Star Logging\r\n7:30p(10:30p) ESPN NHL","2p-6p ESPN/Star Logging\r\n7p(10p) ESPN NHL","All Day","4p(6p) ESPN Sprouts Farmers Market Collegiate Quad\r\n7p(10p) ESPN NHL"]},{"name":"Patrick Flood","events":["2p(5p) ESPN NHL\r\n5p-9p ESPN/Star Logging","2p-6p ESPN/Star Logging\r\n7p(10p) ESPN NHL","2p-6p ESPN/Star Logging\r\n7p(10p) ESPN NHL","7 am - 5pm","3p-7p ESPN/Star Logging\r\n8p(11p) ESPN NHL","All Day","7am - 3 pm"]},{"name":"John Gjoni","events":["Request Off","Request Off","6p-7p starts","Request Off","*7p(9p) ESPN NBA G League","Request Off","12p(6p) ESPN Mecum Auctions: Kissimmee 2026"]},{"name":"Jay Giampietro","events":["2:30p(6p) ESPN LaLiga*","3p(6p) ESPN Freddie & Harry*","Request Off","Request Off","12p(4p) ESPN McAfee*","11am-5pm","*11a-5p ESPN/Star Logging*"]},{"name":"Nigel Gordon","events":["10a-1:45p ESPN/Star Logging\r\n2:50p(5p) ESPN LaLiga","12p(4p) ESPN McAfee","12p(4p) ESPN McAfee","3p(4p) D+ NBA Today\r\n5p(6p) ESPN Wed, 1/7 - ESPN FC\r\n7:12p(9:35p) ESPN NBA Wednesday","10a-7p","10a-6p","10a-4p"]},{"name":"James Graceffo","events":["Hard Out by 4:45p","7:30p(10:30p) ESPN NHL","4:30p(5p) ESPN The Point\r\n7p(10p) ESPN NHL","12p(4p) ESPN McAfee*","Hard Out by 4:45p","12p(3p) ESPN Fri, 1/9 - The Rich Eisen Show*","1p(4p) ESPN ABC Hockey Saturday*"]},{"name":"Jason Hancock","events":["2:50p(5p) ESPN LaLiga\r\n7:30p(8:15p) ESPN NFL PrimeTime on ESPN+","Request Off","Request Off","3p-8p ESPN/Star Logging\r\n9p(11p) ESPN NBA G League","Request Off","3p-11p ESPN/Star Logging","3p-11p ESPN/Star Logging"]},{"name":"Antonio Hernandez","events":["8a-4p ESPN/Star Logging*","8a-4p ESPN/Star Logging","All Day","1:30p(4p) ESPN SuperCopa Football*","Request Off","Request Off","Request Off"]},{"name":"Oscar Jimenez","events":["5p(6p) ESPN En Español - ESPN FC\r\n7p(10p) ESPN NHL","All Day","All Day","9:35p(12:05a) ESPN NBA Wednesday Presented by State Farm","2p-6p ESPN/Star Logging\r\n7p(10p) ESPN NHL","5p(5:30p) D+ VibeCheck\r\n5:30p-11p ESPN/Star Logging","2p-6p ESPN/Star Logging\r\n7p(10p) ESPN NHL"]},{"name":"Dylan Jock","events":["Request Off","Request Off","Request Off","Request Off","Request Off","Request Off","Request Off"]},{"name":"Michael Jozwiak","events":["Request Off","3p-7:30p ESPN/Star Logging\r\n8:30p(11p) D+ NBA Nuggets vs. 76ers","Out by 3pm","All Day","9a-5p ESPN/Star Logging","9a-5p ESPN/Star Logging","9a-5p ESPN/Star Logging"]},{"name":"Elizabeth Krajewski","events":["1p(4p) D+ NFL Colts vs. Texans\r\n4p-8p ESPN/Star Logging","All Day","5p(7p) ESPN TGL Presented by SoFi\r\n9p(11p) ESPN NBA G League","All Day","5p(6p) ESPN Thu, 1/8 - ESPN FC\r\n7p(9p) ESPN NBA G League","All Day","1p-9p ESPN/Star Logging"]},{"name":"Michael Lee","events":["3p(6p) ESPN NHL","Available from 5:00pm to 11pm","*7p(10p) ESPN NHL","Available from 5:00pm to 11pm","*7p(10p) ESPN NHL","Available from 5:00pm to 11pm","7p(10p) ESPN NHL*"]},{"name":"Roberto Medina","events":["1p(4p) D+ NFL Cowboys vs. Giants\r\n4p-8p ESPN/Star Logging","All Day","All Day","All Day","3p-7p ESPN/Star Logging\r\n8p(11p) ESPN Missouri High School Basketball","2p-10p ESPN/Star Logging","2p-10p ESPN/Star Logging"]},{"name":"Rose Miller","events":["11a-3:30p ESPN/Star Logging\r\n4:30p(6:30p) ESPN ACL Myrtle Beach Signature","10a-6p ESPN/Star Logging","Request Off","Request Off","10a-6p ESPN/Star Logging","10a-6p ESPN/Star Logging","7p(9:30a) ESPN FA Cup Soccer\r\n12:30p(1p) ESPN ABC Hockey Saturday Pregame"]},{"name":"Kimberly Morales","events":["9a-5p ESPN/Star Logging","Request Off","Request Off","7am-5pm","*11a-5p ESPN/Star Logging*","*11a-5p ESPN/Star Logging*","9a-5p ESPN/Star Logging"]},{"name":"Maya Peart","events":["Request Off","Request Off","Request Off","Request Off","1:30p-7:30p ESPN/Star Logging\r\n8:30p(9:30p) ESPN Thu, 1/8 - Futbol Americas","12p(12:30p) D+ WYNTK\r\n12:30p-7p ESPN/Star Logging","Until noon"]},{"name":"Matthew Press","events":["5p(8p) ESPN NHL\r\n8p-11p ESPN/Star Logging","All Day","5p-9p ESPN/Star Logging\r\n10p(1a) ESPN NHL","Request Off","5p-9p ESPN/Star Logging\r\n10p(1a) ESPN NHL","8:10p(11:40p) ESPN Women's Dream 11 Super Smash T20","4p(7p) ESPN NHL\r\n10p(1a) ESPN NHL"]},{"name":"Melissa Robilotta","events":["All Day","Request Off","Request Off","Request Off","Request Off","7:00 PM - 10:00 PM","8a-4p ESPN/Star Logging"]},{"name":"Jack Schneider","events":["All Day","2p-5:30p ESPN/Star Logging\r\n6:40p(10:10p) ESPN Men's Dream 11 Super Smash T20","3p(4p) D+ NBA Today\r\n6:40p(10:10p) ESPN Women's Dream 11 Super Smash T20","8:10p(11:40p) ESPN Men's Dream 11 Super Smash T20","6:40p(10:10p) ESPN Women's Dream 11 Super Smash T20","Request Off","2:30p-7:30p ESPN/Star Logging\r\n8:30p(10:30p) D+ 2025 WNBL: Round 13"]},{"name":"Eddie Segarra","events":["*12p-8p ESPN/Star Logging","2p-10p ESPN/Star Logging","2p-10p ESPN/Star Logging","All Day","Request Off","Request Off","Request Off"]},{"name":"Franco Sevillano","events":["Request Off","Request Off","Request Off","Request Off","Request Off","*8:30p(11p) ESPN Men's College Club Hockey","*11a-5p ESPN/Star Logging*"]},{"name":"Willy Sevillano","events":["*10a-6p ESPN/Star Logging","10A+","10A+","10A+","1:30p-7:30p ESPN/Star Logging\r\n8:30p(9:30p) ESPN Kevin Young Show","*12p-8p ESPN/Star Logging","*12p-8p ESPN/Star Logging"]},{"name":"Justin Silverman","events":["9a-5p ESPN/Star Logging","Request Off","Request Off","Request Off","All Day","9a-5p ESPN/Star Logging","9a-5p ESPN/Star Logging"]},{"name":"Chad Townsend","events":["All Day","7PM+","7PM+","7PM+","*8p(10p) ESPN NBA G League","Request Off","11a-7p ESPN/Star Logging"]},{"name":"David Turner","events":["7p(10p) ESPN NHL","*9:30p(12:30a) ESPN NHL","*7:30p(10p) ESPN ESPN+ Hockey Night","*9:30p(12:30a) ESPN NHL","Request Off","Request Off","Request Off"]},{"name":"Nicholas Violante","events":["Out by 2p","9a(9:30a) D+ SC+\r\n10a(12p) ESPN Clinton*","9a(9:30a) D+ SC+\r\n10a(12p) ESPN Clinton*","9a(9:30a) D+ SC+\r\n10a(12p) ESPN Clinton*","12p(12:30p) D+ WYNTK\r\n12:30p-7p ESPN/Star Logging","All Day","8a-4p ESPN/Star Logging"]},{"name":"Michael Witte","events":["All Day","6pm in time - 2am out time","*7:30p(10:30p) ESPN NHL","6pm in time - 2am out time","*7p(10p) ESPN NHL","*8p(11p) ESPN NHL","3:30p(6:30p) ESPN NHL\r\n8p(11p) ESPN NHL"]},{"name":"Matt Zofchak","events":["All Day","2pm+","5p-9p ESPN/Star Logging\r\n10p(1a) ESPN NHL","2p-10p ESPN BRB","2p-10p ESPN BRB","4p-8p ESPN/Star Logging\r\n9p(12a) ESPN NHL","3p-7p ESPN/Star Logging\r\n8p(11p) ESPN NHL"]},{"name":"Sebastian Diaz","events":["All Day","5:30p-9:30p ESPN/Star Logging\r\n10:30p(1:30a) ESPN NHL","Request Off","5:30p-9:30p ESPN/Star Logging\r\n10:30p(1:30a) ESPN NHL","10p(1a) ESPN NHL","4:30p-8:30p ESPN/Star Logging\r\n9:30p(12a) ESPN National Lacrosse League","4p(7p) ESPN NHL\r\n10p(1a) ESPN NHL"]},{"name":"Elijah Hernandez","events":["4:30p-8:30p ESPN/Star Logging\r\n9:30p(12a) D+ NBA Grizzlies vs. Lakers","Before 6pm","7p(9p) ESPN NBA G League\r\n10p(12a) ESPN NBA G League","All Day","All Day","7p(9:30p) D+ NBA 76ers vs. Magic\r\n10p(12:30a) D+ NBA Rockets vs. Trail Blazers","5p(6p) ESPN Sat, 1/10 - ESPN FC\r\n7:30p(10p) ESPN National Lacrosse League"]},{"name":"Julio Marquez","events":["All Day","*10:50p(2:20a) ESPN Women's Dream 11 Super Smash T20","*10:25p(1:55a) ESPN Men's Dream 11 Super Smash T20","5p-12am PST","Request Off","*11p(1a) D+ 2025 WNBL: Round 13","6:40p(10:10p) ESPN Women's Dream 11 Super Smash T20\r\n10:25p(1:55a) ESPN Men's Dream 11 Super Smash T20"]},{"name":"Mario Mendoza","events":["4p-12a ESPN/Star Logging","All Day","After 4:30pm","After 4:00pm","After 4pm","After 4:30pm","7p(9:30p) D+ NBA Heat vs. Pacers\r\n10:30p(12:30a) D+ 2025 NBL: Round 16"]},{"name":"Moises Miranda","events":["All Day","All Day","3p-8p ESPN/Star Logging\r\n9p(11p) ESPN NBA G League","7p(9p) ESPN NBA G League\r\n10p(12a) ESPN NBA G League","All Day","7p(9:30p) ESPN National Lacrosse League\r\n10:30p(1a) ESPN National Lacrosse League","2p(4p) ESPN Ivy League Basketball\r\n6p(8p) ESPN Missouri Valley Conference Basketball"]},{"name":"Felix Quinonez","events":["All Day","7p(9:30p) D+ NBA Knicks vs. Pistons\r\n10p(12:30a) D+ NBA Warriors vs. Clippers","3p(6p) ESPN Freddie & Harry\r\n7:30p(9:30p) ESPN NBA G League","Request Off","After 11a","7p(9:30p) ESPN National Lacrosse League\r\n10:30p(1a) ESPN National Lacrosse League","2p-6p ESPN/Star Logging\r\n7p(9:30p) ESPN National Lacrosse League"]},{"name":"Greg Tietz","events":["4:25p(7:30p) D+ NFL Chargers vs. Broncos","All Day","Request Off","3p(6p) ESPN Freddie & Harry\r\n8p(9p) ESPN BYU Countdown to Tip-Off*","3p(6p) ESPN Freddie & Harry\r\n7p(9p) ESPN NBA G League","1p-9p ESPN/Star Logging*","2p-6p ESPN/Star Logging\r\n7p(9:30p) ESPN National Lacrosse League"]},{"name":"Leonel Tolentino","events":["Request Off","All Day","*11p(1:30a) D+ NBA Mavericks vs. Kings","*12:20a(3:50a) ESPN Women's Dream 11 Super Smash T20","*10:25p(1:55a) ESPN Men's Dream 11 Super Smash T20","*11:55p(3:25a) ESPN Men's Dream 11 Super Smash T20","After 530p"]}],"startDate":"01/04/2026","label":"Week of 01/04"}];

// Days of the week
// Sunday-first order per request
const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ==========================================================================
// Utility Functions
// ==========================================================================

function getInitials(name) {
  return name.split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Normalize names so "Last, First" becomes "First Last" for matching
function normalizeName(name) {
  const trimmed = String(name || '').trim();
  const commaIdx = trimmed.indexOf(',');
  if (commaIdx !== -1) {
    const last = trimmed.slice(0, commaIdx).trim();
    const first = trimmed.slice(commaIdx + 1).trim();
    if (first && last) return `${first} ${last}`;
  }
  return trimmed;
}

function getTimezone() {
  return state.displayTimezone === 'PT' ? 'Pacific' : 'Eastern';
}

function getTimezoneLabel() {
  return state.displayTimezone;
}

// Convert hour from ET to PT (subtract 3 hours)
function convertETtoPT(hour) {
  let converted = hour - 3;
  if (converted < 0) converted += 24;
  return converted;
}

// Convert hour from PT to ET (add 3 hours)
function convertPTtoET(hour) {
  let converted = hour + 3;
  if (converted >= 24) converted -= 24;
  return converted;
}

function formatTimeDisplay(timeStr, forDisplay = true) {
  if (!timeStr || timeStr === 'OFF') return 'OFF';

  const parts = parseShiftForDisplay(timeStr);
  if (!parts) {
    // Fallback: try to extract time from raw string like "4p-8:30p ..."
    const rawMatch = timeStr.match(/(\d{1,2}(?::\d{2})?)\s*([ap])\s*-\s*(\d{1,2}(?::\d{2})?)\s*([ap])/i);
    if (rawMatch) {
      return `${rawMatch[1]}${rawMatch[2]}-${rawMatch[3]}${rawMatch[4]} ${state.displayTimezone}`;
    }
    return timeStr;
  }

  const { startH, startM, endH, endM, tz } = parts;
  const fmt = (h, m) => {
    const period = h >= 12 ? 'p' : 'a';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const hasMinutes = m !== 0;
    return `${hour12}${hasMinutes ? ':' + m.toString().padStart(2, '0') : ''}${period}`;
  };
  const startLabel = fmt(startH, startM);
  const endLabel = fmt(endH, endM);
  // If start and end are the same, just show start time (no range)
  if (startH === endH && startM === endM) {
    return `${startLabel} ${tz}`;
  }
  return `${startLabel}-${endLabel} ${tz}`;
}

// Extract a title from raw shift data when parsing fails
function extractTitleFromRaw(timeStr) {
  if (!timeStr || timeStr === 'OFF') return '';
  // Try to get text after the time range, cleaning out embedded times
  const match = timeStr.match(/\d{1,2}(?::\d{2})?\s*[ap]\s*-\s*\d{1,2}(?::\d{2})?\s*[ap]\s+(.+)/i);
  if (match) {
    let label = match[1];
    // Clean embedded times
    label = label.replace(/\d{1,2}(?::\d{2})?\s*[ap]m?\s*\(\d{1,2}(?::\d{2})?\s*[ap]m?\)/gi, '');
    label = label.replace(/\(\d{1,2}(?::\d{2})?\s*[ap]m?\)/gi, '');
    label = label.replace(/\b\d{1,2}(?::\d{2})?\s*[ap]m?\b/gi, '');
    label = label.replace(/\s{2,}/g, ' ').trim();
    return label || '';
  }
  return '';
}

function getWeekDates(offsetDays = 0, baseDate = null) {
  const today = baseDate ? new Date(baseDate) : new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek + offsetDays);

  return weekDays.map((_, i) => {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + i);
    return date;
  });
}

// ==========================================================================
// Calendar Export Functions
// ==========================================================================

function formatDateForCalendar(date, hours, minutes) {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function generateGoogleCalendarUrl(title, date, startH, startM, endH, endM) {
  const startDate = new Date(date);
  startDate.setHours(startH, startM, 0, 0);
  const endDate = new Date(date);
  endDate.setHours(endH, endM, 0, 0);
  // Handle overnight shifts
  if (endH < startH) {
    endDate.setDate(endDate.getDate() + 1);
  }

  const formatGoogleDate = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title || 'Work Shift',
    dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
    details: 'Shift added from Ops Scheduling'
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function generateICSFile(title, date, startH, startM, endH, endM) {
  const startDate = new Date(date);
  startDate.setHours(startH, startM, 0, 0);
  const endDate = new Date(date);
  endDate.setHours(endH, endM, 0, 0);
  // Handle overnight shifts
  if (endH < startH) {
    endDate.setDate(endDate.getDate() + 1);
  }

  const formatICSDate = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const uid = `${Date.now()}@ops-scheduling`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ops Scheduling//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${title || 'Work Shift'}`,
    'DESCRIPTION:Shift added from Ops Scheduling',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
}

function downloadICSFile(title, date, startH, startM, endH, endM) {
  const icsContent = generateICSFile(title, date, startH, startM, endH, endM);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `shift-${date.toISOString().split('T')[0]}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function showCalendarOptions(title, date, shift) {
  const parts = parseShiftForDisplay(shift);
  if (!parts) return;

  const { startH, startM, endH, endM } = parts;

  // Create a small popup/dropdown with options
  const existing = document.querySelector('.calendar-popup');
  if (existing) existing.remove();

  const popup = document.createElement('div');
  popup.className = 'calendar-popup';
  popup.innerHTML = `
    <div class="calendar-popup-content">
      <button class="calendar-option" data-type="google">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
        Google Calendar
      </button>
      <button class="calendar-option" data-type="apple">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
        Apple Calendar
      </button>
    </div>
  `;

  document.body.appendChild(popup);

  // Position near click or center
  popup.style.position = 'fixed';
  popup.style.top = '50%';
  popup.style.left = '50%';
  popup.style.transform = 'translate(-50%, -50%)';

  // Handle clicks
  popup.querySelector('[data-type="google"]').addEventListener('click', () => {
    window.open(generateGoogleCalendarUrl(title, date, startH, startM, endH, endM), '_blank');
    popup.remove();
  });

  popup.querySelector('[data-type="apple"]').addEventListener('click', () => {
    downloadICSFile(title, date, startH, startM, endH, endM);
    popup.remove();
  });

  // Close on outside click
  popup.addEventListener('click', (e) => {
    if (e.target === popup) popup.remove();
  });
}

// Show calendar options for event arrays (multiple events = multiple calendar entries)
function showCalendarOptionsForEvents(title, date, events) {
  if (isOffDay(events) || !Array.isArray(events) || events.length === 0) return;

  const existing = document.querySelector('.calendar-popup');
  if (existing) existing.remove();

  const popup = document.createElement('div');
  popup.className = 'calendar-popup';
  popup.innerHTML = `
    <div class="calendar-popup-content">
      <button class="calendar-option" data-type="google">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
        Google Calendar ${events.length > 1 ? `(${events.length} events)` : ''}
      </button>
      <button class="calendar-option" data-type="apple">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
        Apple Calendar ${events.length > 1 ? `(${events.length} events)` : ''}
      </button>
    </div>
  `;

  document.body.appendChild(popup);
  popup.style.position = 'fixed';
  popup.style.top = '50%';
  popup.style.left = '50%';
  popup.style.transform = 'translate(-50%, -50%)';

  // Google: open one tab per event
  popup.querySelector('[data-type="google"]').addEventListener('click', () => {
    events.forEach(evt => {
      if (!evt.startTime) return;
      const [startH, startM] = evt.startTime.split(':').map(n => parseInt(n, 10));
      const [endH, endM] = evt.endTime ? evt.endTime.split(':').map(n => parseInt(n, 10)) : [startH, startM];
      const evtTitle = evt.label || title || 'Work Shift';
      window.open(generateGoogleCalendarUrl(evtTitle, date, startH, startM, endH, endM), '_blank');
    });
    popup.remove();
  });

  // Apple: download ICS with all events
  popup.querySelector('[data-type="apple"]').addEventListener('click', () => {
    downloadMultiEventICS(date, events);
    popup.remove();
  });

  popup.addEventListener('click', (e) => {
    if (e.target === popup) popup.remove();
  });
}

// Generate ICS file with multiple events
function downloadMultiEventICS(date, events) {
  const formatICSDate = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ops Scheduling//EN'
  ];

  events.forEach((evt, idx) => {
    if (!evt.startTime) return;
    const [startH, startM] = evt.startTime.split(':').map(n => parseInt(n, 10));
    const [endH, endM] = evt.endTime ? evt.endTime.split(':').map(n => parseInt(n, 10)) : [startH, startM];

    const startDate = new Date(date);
    startDate.setHours(startH, startM, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(endH, endM, 0, 0);
    if (endH < startH) endDate.setDate(endDate.getDate() + 1);

    const uid = `${Date.now()}-${idx}@ops-scheduling`;
    const evtTitle = evt.label || 'Work Shift';

    icsContent.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `SUMMARY:${evtTitle}`,
      'DESCRIPTION:Shift added from Ops Scheduling',
      'END:VEVENT'
    );
  });

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `shifts-${date.toISOString().split('T')[0]}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatWeekRange(weekDates) {
  const start = weekDates[0];
  const end = weekDates[6];
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}

function isToday(date) {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

// ==========================================================================
// Data Functions
// ==========================================================================

function parseCSV(text) {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (!lines.length) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const days = headers.slice(1);

  return lines.slice(1).map(line => {
    const cols = line.split(',').map(c => c.trim());
    const name = cols[0] || 'Unknown';
    const eventsMonFirst = days.map((_, idx) => normalizeShift(cols[idx + 1] || 'OFF'));
    const events = reorderToSundayFirst(eventsMonFirst);
    return { name, events };
  });
}

function loadDefaultSchedule() {
  // Load preloaded schedules from XLSX data
  if (PRELOADED_SCHEDULES && PRELOADED_SCHEDULES.length > 0) {
    state.scheduleFiles = PRELOADED_SCHEDULES.map(schedule => ({
      // Parse each person's events from raw strings to event arrays (same as XLSX upload)
      roster: schedule.roster.map(person => ({
        name: person.name,
        events: person.events.map(evt => normalizeShift(evt))
      })),
      startDate: new Date(schedule.startDate),
      label: schedule.label
    }));
    // Sort by start date
    state.scheduleFiles.sort((a, b) => a.startDate - b.startDate);
    pickActiveSchedule();
    return;
  }

  // Fallback to hardcoded data if preloaded schedules not available
  const csvData = `Name,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday
Alvarez Rosa,OFF,12:00-20:00 ET,08:00-16:00 ET,OFF,13:00-21:00 ET,10:00-18:00 ET,09:00-17:00 ET
Baker Jordan,11:00-19:00 ET,OFF,12:00-20:00 ET,10:00-18:00 ET,OFF,13:00-21:00 ET,14:00-22:00 ET
Chen Mina,OFF,07:00-15:00 ET,09:00-17:00 ET,11:00-19:00 ET,OFF,09:30-17:30 ET,12:00-20:00 ET
Diaz Ramon,08:00-16:00 ET,OFF,09:00-17:00 ET,OFF,12:00-20:00 ET,14:00-22:00 ET,13:00-21:00 ET
Hughes Claire,13:00-21:00 ET,10:00-18:00 ET,OFF,09:00-17:00 ET,12:00-20:00 ET,OFF,10:00-18:00 ET
Nguyen Taylor,OFF,11:00-19:00 ET,13:00-21:00 ET,10:00-18:00 ET,OFF,12:00-20:00 ET,09:00-17:00 ET
Andrew Amisola,09:00-17:00 ET,OFF,11:00-19:00 ET,13:00-21:00 ET,OFF,10:00-18:00 ET,12:00-20:00 ET
Patel Anand,12:00-20:00 ET,09:00-17:00 ET,OFF,13:00-21:00 ET,10:00-18:00 ET,11:00-19:00 ET,OFF`;

  const roster = parseCSV(csvData);
  const start = getCurrentSunday();
  state.roster = roster;
  state.scheduleStartDate = start;
  state.scheduleFiles = [{ roster, startDate: start, label: 'Default' }];
  state.activeScheduleIndex = 0;
}

// Parse XLSX (first sheet) into roster, handling Sunday-first headers and time ranges with 1h earlier check-in
function parseXlsxRoster(workbook) {
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  // Extract date range like "01/04/26 - 01/10/26"
  let startDate = null;
  for (let i = 0; i < Math.min(rows.length, 5); i++) {
    const joined = rows[i].join(' ');
    const match = joined.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})\s*-\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/);
    if (match) {
      const [ , startStr ] = match;
      startDate = new Date(startStr);
      break;
    }
  }

  // Find the header row that contains day names
  const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  let headerRowIndex = rows.findIndex(row => row.some(cell => dayNames.includes(String(cell).trim().toLowerCase())));
  if (headerRowIndex === -1) throw new Error('No header row with days found.');

  const headerRow = rows[headerRowIndex].map(c => String(c).trim().toLowerCase());
  const dayColIndex = {};
  headerRow.forEach((val, idx) => {
    const match = dayNames.find(d => d === val);
    if (match) dayColIndex[match] = idx;
  });

  // If we don't have all 7, fail
  if (Object.keys(dayColIndex).length < 7) throw new Error('Missing day columns in sheet.');

  // Guess name column: first non-empty before the first day col, otherwise 0
  const firstDayCol = Math.min(...Object.values(dayColIndex));
  let nameCol = 0;
  for (let i = 0; i < firstDayCol; i++) {
    if (rows[headerRowIndex + 2]?.[i] || rows[headerRowIndex + 1]?.[i]) {
      nameCol = i;
      break;
    }
  }

  // Data starts after header row (skip date row if present)
  const dataStart = headerRowIndex + 2;
  const roster = [];

  for (let r = dataStart; r < rows.length; r++) {
    const row = rows[r];
    const rawName = String(row[nameCol] || '').trim();
    const name = normalizeName(rawName);
    if (!name) continue;

    const events = [];
    // Map to Sunday-first order
    weekDays.map(d => d.toLowerCase()).forEach(day => {
      const cell = row[dayColIndex[day]];
      events.push(normalizeShift(cell));
    });

    roster.push({ name, events });
  }

  if (!roster.length) throw new Error('No schedule rows found.');
  return { roster, startDate };
}

function getCurrentSunday() {
  const today = new Date();
  const day = today.getDay(); // Sunday = 0
  const sunday = new Date(today);
  sunday.setHours(0, 0, 0, 0);
  sunday.setDate(today.getDate() - day);
  return sunday;
}

function pickActiveSchedule() {
  if (!state.scheduleFiles.length) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let active = state.scheduleFiles[0];
  let activeIndex = 0;
  state.scheduleFiles.forEach((sched, idx) => {
    const start = new Date(sched.startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    if (today >= start && today < end) {
      active = sched;
      activeIndex = idx;
      return;
    }
    if (start <= today && start >= new Date(active.startDate)) {
      active = sched;
      activeIndex = idx;
    }
  });
  state.roster = active.roster;
  state.scheduleStartDate = active.startDate;
  state.activeScheduleIndex = activeIndex;
}

// Check if a day's events array represents an OFF day
function isOffDay(events) {
  return !events || (Array.isArray(events) && events.length === 0) || events === 'OFF';
}

// Parse a single event line into a structured object
// Returns: { startTime, endTime, timezone, label, checkInTime?, rawText }
function parseEventLine(line) {
  const val = String(line || '').trim();
  if (!val) return null;

  const lower = val.toLowerCase();
  if (lower.includes('request off') || lower === 'off' || lower.includes('all day')) {
    return null;
  }

  // Format 1: "12p(12:30p) D+ WYNTK 12:30p-7p ESPN/Star Logging"
  // Pattern: [check-in]([actual-start]) [TITLE] [start]-[end] [extra]
  const complexMatch = val.match(/^\*?\s*(\d{1,2}(?::\d{2})?)\s*([ap])\s*\([\d:]+[ap]\)\s+(.+?)\s+(\d{1,2}(?::\d{2})?)\s*([ap])\s*-\s*(\d{1,2}(?::\d{2})?)\s*([ap])(?:\s+(.*))?$/i);
  if (complexMatch) {
    const checkInTime = formatTimeToken(complexMatch[1], complexMatch[2]);
    const title = complexMatch[3].trim();
    const start = formatTimeToken(complexMatch[4], complexMatch[5]);
    const end = formatTimeToken(complexMatch[6], complexMatch[7]);
    const extra = complexMatch[8] ? complexMatch[8].trim() : '';
    let label = title;
    if (extra && !extra.match(/^\d{1,2}(?::\d{2})?\s*[ap]/i)) {
      label = `${title} - ${extra}`;
    }
    return { startTime: start, endTime: end, timezone: 'ET', label, checkInTime, rawText: val };
  }

  // Format 2: "4:10p(7:40p) ESPN College Football..." - arrival + event start, NO end time
  const noEndMatch = val.match(/^\*?\s*(\d{1,2}(?::\d{2})?)\s*([ap])\s*\((\d{1,2}(?::\d{2})?)\s*([ap])\)\s+(.+)$/i);
  if (noEndMatch) {
    const titlePart = noEndMatch[5];
    if (!titlePart.match(/\d{1,2}(?::\d{2})?\s*[ap]\s*-\s*\d{1,2}(?::\d{2})?\s*[ap]/i)) {
      const arrivalTime = formatTimeToken(noEndMatch[1], noEndMatch[2]);
      const eventStartTime = formatTimeToken(noEndMatch[3], noEndMatch[4]);
      const title = titlePart.trim();
      return { startTime: arrivalTime, endTime: eventStartTime, timezone: 'ET', label: title, checkInTime: null, rawText: val };
    }
  }

  // Format 3: "4a-12p ESPN" or "9:30a-5p Something" - simple 12-hour time range
  const simpleMatch = val.match(/^\*?\s*([0-9]{1,2}(?::[0-9]{2})?)\s*([ap])\s*-\s*([0-9]{1,2}(?::[0-9]{2})?)\s*([ap])\s*(.*)$/i);
  if (simpleMatch) {
    const start = formatTimeToken(simpleMatch[1], simpleMatch[2]);
    const end = formatTimeToken(simpleMatch[3], simpleMatch[4]);
    let label = simpleMatch[5] ? simpleMatch[5].trim() : '';
    label = label.replace(/^[-–—,:]+\s*/, '');
    label = label.replace(/\d{1,2}(?::\d{2})?\s*[ap]m?\s*\(\d{1,2}(?::\d{2})?\s*[ap]m?\)/gi, '');
    label = label.replace(/\(\d{1,2}(?::\d{2})?\s*[ap]m?\)/gi, '');
    label = label.replace(/\b\d{1,2}(?::\d{2})?\s*[ap]m?\b/gi, '');
    label = label.replace(/\s{2,}/g, ' ').trim();
    return { startTime: start, endTime: end, timezone: 'ET', label: label || '', checkInTime: null, rawText: val };
  }

  // Format 4: "12:00-20:00 ET" or "08:00-16:00 ET" - 24-hour format from CSV
  const format24Match = val.match(/^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})\s*(ET|PT)?$/i);
  if (format24Match) {
    const startH = parseInt(format24Match[1], 10);
    const startM = parseInt(format24Match[2], 10);
    const endH = parseInt(format24Match[3], 10);
    const endM = parseInt(format24Match[4], 10);
    const tz = format24Match[5] || 'ET';
    const start = `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`;
    const end = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
    return { startTime: start, endTime: end, timezone: tz.toUpperCase(), label: '', checkInTime: null, rawText: val };
  }

  // Fallback: return raw text as label with no time parsing
  return { startTime: null, endTime: null, timezone: 'ET', label: val, checkInTime: null, rawText: val };
}

// Normalize a cell into an array of event objects
// Handles newline-separated multiple events
function normalizeShift(cell) {
  const val = String(cell || '').trim();
  if (!val) return [];

  const lower = val.toLowerCase();
  if (lower.includes('request off') || lower === 'off' || lower.includes('all day')) {
    return [];
  }

  // Split by newlines for multiple events
  const lines = val.split(/\r?\n/).map(line => line.trim()).filter(Boolean);

  // Parse each line as a separate event
  const events = lines.map((line, idx) => {
    const parsed = parseEventLine(line);
    if (parsed) {
      parsed.id = idx;
      return parsed;
    }
    return null;
  }).filter(Boolean);

  return events;
}

// Legacy helper: Convert event array to old string format for backward compatibility
function eventsToLegacyString(events) {
  if (isOffDay(events)) return 'OFF';
  if (!Array.isArray(events)) return events; // Already a string
  if (events.length === 0) return 'OFF';

  // Return first event in old format for backward compat
  const evt = events[0];
  if (!evt.startTime) return evt.label || 'OFF';

  let str = `${evt.startTime}-${evt.endTime} ${evt.timezone}`;
  if (evt.label) str += `|${evt.label}`;
  if (evt.checkInTime) str += `|${evt.checkInTime}`;
  return str;
}

// Format a single time range (e.g., "5p-10p ET")
function formatTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return '';
  const fmt = (t) => {
    const period = t >= 12 ? 'p' : 'a';
    const hour12 = t % 12 === 0 ? 12 : t % 12;
    return `${hour12}${period}`;
  };
  return `${fmt(startTime)}-${fmt(endTime)} ET`;
}

// Format time display for event arrays (first start → last end)
function formatEventsTimeDisplay(events) {
  if (isOffDay(events)) return 'OFF';
  if (!Array.isArray(events) || events.length === 0) return 'OFF';

  // Find first start and last end time
  let firstStart = null;
  let lastEnd = null;
  let storedTz = 'ET'; // Default timezone of stored data

  events.forEach(evt => {
    if (evt.startTime) {
      if (!firstStart || evt.startTime < firstStart) firstStart = evt.startTime;
      if (evt.timezone) storedTz = evt.timezone;
    }
    if (evt.endTime) {
      if (!lastEnd || evt.endTime > lastEnd) lastEnd = evt.endTime;
    }
  });

  if (!firstStart) return events[0]?.label || 'Shift';

  const fmt = (timeStr, convertFn = null) => {
    let [h, m] = timeStr.split(':').map(n => parseInt(n, 10));
    if (convertFn) h = convertFn(h);
    const period = h >= 12 ? 'p' : 'a';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return m ? `${hour12}:${m.toString().padStart(2, '0')}${period}` : `${hour12}${period}`;
  };

  // Determine if conversion is needed
  let convertFn = null;
  if (state.displayTimezone === 'PT' && storedTz === 'ET') {
    convertFn = convertETtoPT;
  } else if (state.displayTimezone === 'ET' && storedTz === 'PT') {
    convertFn = convertPTtoET;
  }

  const tz = state.displayTimezone;
  if (!lastEnd || firstStart === lastEnd) {
    return `${fmt(firstStart, convertFn)} ${tz}`;
  }
  return `${fmt(firstStart, convertFn)}-${fmt(lastEnd, convertFn)} ${tz}`;
}

// Get all event labels from an events array
function getEventsLabels(events) {
  if (isOffDay(events)) return [];
  if (!Array.isArray(events)) return [];
  return events.map(evt => evt.label).filter(Boolean);
}

// Format check-in for event arrays (earliest check-in, skip ESPN/Star Logging if first)
function formatEventsCheckIn(events) {
  if (isOffDay(events)) return '';
  if (!Array.isArray(events) || events.length === 0) return '';

  // Find the earliest check-in time
  // First event's check-in or 1 hour before first start
  const firstEvt = events[0];
  const storedTz = firstEvt.timezone || 'ET';

  // Skip check-in for ESPN/Star Logging (check-in same as start)
  if (firstEvt.label && firstEvt.label.toLowerCase().includes('espn/star logging')) {
    return '';
  }

  let checkInTime = firstEvt.checkInTime;
  if (!checkInTime && firstEvt.startTime) {
    // Calculate 1 hour before start
    const [h, m] = firstEvt.startTime.split(':').map(n => parseInt(n, 10));
    const checkInH = (h + 24 - 1) % 24;
    checkInTime = `${checkInH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  if (!checkInTime) return '';

  let [h, m] = checkInTime.split(':').map(n => parseInt(n, 10));

  // Convert timezone if needed
  if (state.displayTimezone === 'PT' && storedTz === 'ET') {
    h = convertETtoPT(h);
  } else if (state.displayTimezone === 'ET' && storedTz === 'PT') {
    h = convertPTtoET(h);
  }

  const period = h >= 12 ? 'p' : 'a';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const timeLabel = m ? `${hour12}:${m.toString().padStart(2, '0')}${period}` : `${hour12}${period}`;

  return `Check-in · ${timeLabel} ${state.displayTimezone}`;
}

function adjustTimeMinusHour(timeStr, meridiem) {
  const [h, m] = parseTimeToken(timeStr);
  let hour24 = to24Hour(h, meridiem);
  let minutes = m;
  hour24 = (hour24 + 24 - 1) % 24; // subtract 1 hour, wrap around
  return `${pad(hour24)}:${pad(minutes)}`;
}

function formatTimeToken(timeStr, meridiem) {
  const [h, m] = parseTimeToken(timeStr);
  const hour24 = to24Hour(h, meridiem);
  return `${pad(hour24)}:${pad(m)}`;
}

// Parse a shift string into display-friendly parts, applying timezone toggle
function parseShiftForDisplay(timeStr) {
  if (!timeStr || timeStr === 'OFF') return null;

  const [timePart, labelPart] = timeStr.split('|');
  const match = timePart.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})\s*(\w+)/);
  if (!match) return null;

  let [, startH, startM, endH, endM, storedTz] = match;
  startH = parseInt(startH, 10);
  endH = parseInt(endH, 10);

  // Convert times if display timezone differs from stored timezone
  if (state.displayTimezone === 'PT' && storedTz === 'ET') {
    startH = convertETtoPT(startH);
    endH = convertETtoPT(endH);
  } else if (state.displayTimezone === 'ET' && storedTz === 'PT') {
    startH = convertPTtoET(startH);
    endH = convertPTtoET(endH);
  }

  const displayTz = state.displayTimezone;
  return { startH, startM: parseInt(startM,10), endH, endM: parseInt(endM,10), tz: displayTz, label: labelPart || '' };
}

function formatHour12(h, m) {
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  const mm = m.toString().padStart(2, '0');
  return `${displayHour}:${mm} ${period}`;
}

function formatCheckIn(timeStr) {
  if (!timeStr || timeStr === 'OFF') return '';

  // Check for stored check-in time (third segment after second |)
  const segments = timeStr.split('|');
  if (segments.length >= 3 && segments[2]) {
    const checkInStored = segments[2]; // Format: "HH:MM"
    const match = checkInStored.match(/(\d{2}):(\d{2})/);
    if (match) {
      const h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const label = `${formatHour12(h, m).replace(/\s(AM|PM)$/,'').toLowerCase()} ${state.displayTimezone}`;
      return `Check-in · ${label}`;
    }
  }

  // Fallback: calculate from start time minus 1 hour
  const parts = parseShiftForDisplay(timeStr);
  if (!parts) return '';
  let { startH, startM, tz } = parts;
  startH = (startH + 24 - 1) % 24;
  const label = `${formatHour12(startH, startM).replace(/\s(AM|PM)$/,'').toLowerCase()} ${tz}`;
  return `Check-in · ${label}`;
}

function parseTimeToken(token) {
  const parts = token.split(':');
  const h = parseInt(parts[0], 10);
  const m = parts[1] ? parseInt(parts[1], 10) : 0;
  return [isNaN(h) ? 0 : h, isNaN(m) ? 0 : m];
}

function to24Hour(hour, meridiem) {
  const mer = meridiem.toLowerCase();
  let h = hour % 12;
  if (mer === 'p') h += 12;
  return h;
}

function pad(num) {
  return num.toString().padStart(2, '0');
}

function reorderToSundayFirst(monFirstEvents) {
  if (!Array.isArray(monFirstEvents) || monFirstEvents.length < 7) return monFirstEvents || [];
  const sunday = monFirstEvents[6];
  const rest = monFirstEvents.slice(0, 6);
  return [sunday, ...rest];
}

function getCurrentUserSchedule() {
  const target = normalizeName(state.currentUser).toLowerCase();
  return state.roster.find(p => normalizeName(p.name).toLowerCase() === target);
}

function getUserSchedule(userName) {
  const target = normalizeName(userName).toLowerCase();
  return state.roster.find(p => normalizeName(p.name).toLowerCase() === target);
}

// Convert "HH:MM" to minutes since midnight
function timeToMinutes(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(n => parseInt(n, 10));
  return h * 60 + (m || 0);
}

// Check if a person can cover a shift with 15-min buffer requirement
function canCoverShift(personEvents, requestedEvents) {
  const BUFFER_MINUTES = 15;

  // If person is off, they can cover
  if (isOffDay(personEvents)) return { available: true, reason: 'Day off' };

  // Get the requested shift time range
  let reqStart = null, reqEnd = null;
  const reqEvts = Array.isArray(requestedEvents) ? requestedEvents : [requestedEvents];
  reqEvts.forEach(evt => {
    if (evt && evt.startTime) {
      const start = timeToMinutes(evt.startTime);
      const end = timeToMinutes(evt.endTime);
      if (reqStart === null || start < reqStart) reqStart = start;
      if (reqEnd === null || end > reqEnd) reqEnd = end;
    }
  });

  if (reqStart === null || reqEnd === null) return { available: false, reason: 'Invalid request times' };

  // Get person's existing shift time range for the day
  let personStart = null, personEnd = null;
  const pEvts = Array.isArray(personEvents) ? personEvents : [personEvents];
  pEvts.forEach(evt => {
    if (evt && evt.startTime) {
      const start = timeToMinutes(evt.startTime);
      const end = timeToMinutes(evt.endTime);
      if (personStart === null || start < personStart) personStart = start;
      if (personEnd === null || end > personEnd) personEnd = end;
    }
  });

  if (personStart === null || personEnd === null) return { available: true, reason: 'No timed shift' };

  // Check if person's shift ends before requested shift starts (with buffer)
  if (personEnd + BUFFER_MINUTES <= reqStart) {
    return { available: true, reason: 'Available after their shift' };
  }

  // Check if person's shift starts after requested shift ends (with buffer)
  if (reqEnd + BUFFER_MINUTES <= personStart) {
    return { available: true, reason: 'Available before their shift' };
  }

  return { available: false, reason: 'Schedule conflict' };
}

function getAvailablePeople(dayIndex, requestedEvents = null) {
  return state.roster.filter(person => {
    if (person.name === state.currentUser) return false;
    // Exclude leads/admins/supervisors - check both original and normalized name
    const originalName = person.name.toLowerCase();
    const normalizedName = normalizeName(person.name).toLowerCase();
    if (EXCLUDED_LEADS.some(lead => {
      const normalizedLead = normalizeName(lead).toLowerCase();
      return originalName.includes(lead) ||
             lead.includes(originalName) ||
             normalizedName === normalizedLead ||
             originalName === lead;
    })) return false;

    // If we have requested events, do time-based availability check
    if (requestedEvents) {
      const result = canCoverShift(person.events[dayIndex], requestedEvents);
      return result.available;
    }

    // Fallback to simple off-day check
    return isOffDay(person.events[dayIndex]);
  }).map(person => {
    // Add availability reason for display
    const result = requestedEvents
      ? canCoverShift(person.events[dayIndex], requestedEvents)
      : { available: true, reason: isOffDay(person.events[dayIndex]) ? 'Day off' : 'Available' };
    return { ...person, availabilityReason: result.reason };
  });
}

// Check if current user can take this request
function canUserTakeRequest(request) {
  const userSchedule = getCurrentUserSchedule();
  if (!userSchedule) return false;

  // User must be OFF on the requested day
  return isOffDay(userSchedule.events[request.dayIndex]);
}

// Get current user's shifts that can be swapped for a specific request
function getSwappableShifts(request) {
  const userSchedule = getCurrentUserSchedule();
  if (!userSchedule) return [];

  // Find the requester's schedule to check their availability
  const requesterSchedule = state.roster.find(p => p.name === request.requesterName);
  if (!requesterSchedule) return [];

  const swappable = [];

  userSchedule.events.forEach((events, dayIndex) => {
    // Skip if user is OFF this day (nothing to swap)
    if (isOffDay(events)) return;

    // Skip if requester is working that day (they can't take your shift)
    if (!isOffDay(requesterSchedule.events[dayIndex])) return;

    swappable.push({
      dayIndex,
      day: weekDays[dayIndex],
      events: events // Now an array
    });
  });

  return swappable;
}

// ==========================================================================
// Render Functions
// ==========================================================================

function renderWeekView() {
  if (!state.scheduleFiles.length) {
    const userSchedule = getCurrentUserSchedule();
    if (!userSchedule) {
      elements.weekView.innerHTML = '<p class="no-schedule">No schedule found for your account.</p>';
      return;
    }
  }

  const activeStart = state.scheduleStartDate || getCurrentSunday();

const sections = (state.scheduleFiles.length ? state.scheduleFiles : [{ roster: state.roster, startDate: activeStart, label: 'This Week' }])
    .map((sched, idx) => {
      const weekDates = getWeekDates(0, sched.startDate);
      const userSchedule = sched.roster.find(p => normalizeName(p.name).toLowerCase() === normalizeName(state.currentUser || '').toLowerCase());
      if (!userSchedule) return `<div class="week-section"><div class="week-section-header"><h3>${formatWeekRange(weekDates)}</h3></div><p class="no-schedule">No schedule found for your account.</p></div>`;
      return `
        <div class="week-section" data-sched-index="${idx}">
          <div class="week-section-header">
            <h3>${formatWeekRange(weekDates)}</h3>
            <button class="export-week-btn" data-sched-index="${idx}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Export Week
            </button>
          </div>
          <div class="week-grid">
            ${weekDays.map((day, i) => {
              const date = weekDates[i];
              const events = userSchedule.events[i];
              const isOff = Array.isArray(events) && events.length === 0;
              const isTodayClass = isToday(date) ? 'today' : '';
              const offClass = isOff ? 'off' : '';
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isPast = date < today;

              // Get event labels for display
              const labels = getEventsLabels(events);
              const hasMultipleEvents = labels.length > 1;
              const checkIn = isOff ? '' : formatEventsCheckIn(events);
              const timeDisplay = isOff ? '' : formatEventsTimeDisplay(events);
              const calendarTitle = labels.length ? labels.join(' + ') : 'Work Shift';

              const pastClass = isPast ? 'past' : '';

              return `
                <div class="day-card ${isTodayClass} ${offClass} ${pastClass}" data-day-index="${i}" data-day="${day}" data-sched-index="${idx}">
                  <div class="day-card-header">
                    <span class="day-name">${shortDays[i]}</span>
                    <span class="day-date">${date.getDate()}</span>
                    ${hasMultipleEvents ? `<span class="event-count-badge">${labels.length} events</span>` : ''}
                  </div>
                  <div class="day-shift">
                    ${isOff ? `
                      <span class="off-label">Day Off</span>
                    ` : `
                      ${labels.length ? `<div class="shift-labels">${labels.map(l => `<div class="shift-title">${l}</div>`).join('')}</div>` : ''}
                      <div class="shift-time-display">${timeDisplay}</div>
                    `}
                  </div>
                  ${!isOff && !isPast ? `
                    <div class="day-card-footer">
                      ${checkIn ? `<div class="shift-checkin">${checkIn}</div>` : '<div class="shift-checkin-spacer"></div>'}
                      <div class="day-actions-row">
                        <div class="day-action" data-action="request">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 5v14M5 12h14"/>
                          </svg>
                          Request Coverage
                        </div>
                      </div>
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');

  elements.weekView.innerHTML = sections;

  elements.weekView.querySelectorAll('.day-card:not(.off):not(.past)').forEach(card => {
    card.addEventListener('click', (e) => {
      const dayIndex = parseInt(card.dataset.dayIndex);
      const day = card.dataset.day;
      const schedIdx = parseInt(card.dataset.schedIndex, 10) || 0;
      const sched = state.scheduleFiles[schedIdx] || { roster: state.roster, startDate: state.scheduleStartDate };
      state.roster = sched.roster;
      state.scheduleStartDate = sched.startDate;
      state.activeScheduleIndex = schedIdx;
      const userSchedule = sched.roster.find(p => normalizeName(p.name).toLowerCase() === normalizeName(state.currentUser || '').toLowerCase());
      if (!userSchedule) return;

      const events = userSchedule.events[dayIndex];

      // Open request modal
      openRequestModal(day, dayIndex, events);
    });
  });

  // Export week button handlers
  elements.weekView.querySelectorAll('.export-week-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const schedIdx = parseInt(btn.dataset.schedIndex, 10) || 0;
      showWeekExportOptions(schedIdx);
    });
  });
}

// Show export options for entire week
function showWeekExportOptions(schedIdx) {
  const sched = state.scheduleFiles[schedIdx] || { roster: state.roster, startDate: state.scheduleStartDate };
  const userSchedule = sched.roster.find(p => normalizeName(p.name).toLowerCase() === normalizeName(state.currentUser || '').toLowerCase());
  if (!userSchedule) return;

  const weekDates = getWeekDates(0, sched.startDate);

  // Collect all events for the week
  const allWeekEvents = [];
  userSchedule.events.forEach((events, dayIndex) => {
    if (isOffDay(events)) return;
    const date = weekDates[dayIndex];
    events.forEach(evt => {
      if (evt.startTime) {
        allWeekEvents.push({ ...evt, date });
      }
    });
  });

  if (allWeekEvents.length === 0) {
    showToast('No shifts to export this week');
    return;
  }

  const existing = document.querySelector('.calendar-popup');
  if (existing) existing.remove();

  const popup = document.createElement('div');
  popup.className = 'calendar-popup';
  popup.innerHTML = `
    <div class="calendar-popup-content">
      <div class="popup-header">Export Week (${allWeekEvents.length} events)</div>
      <button class="calendar-option" data-type="google">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
        Google Calendar
      </button>
      <button class="calendar-option" data-type="apple">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
        Apple Calendar
      </button>
    </div>
  `;

  document.body.appendChild(popup);
  popup.style.position = 'fixed';
  popup.style.top = '50%';
  popup.style.left = '50%';
  popup.style.transform = 'translate(-50%, -50%)';

  // Google: open one tab per event
  popup.querySelector('[data-type="google"]').addEventListener('click', () => {
    allWeekEvents.forEach(evt => {
      const [startH, startM] = evt.startTime.split(':').map(n => parseInt(n, 10));
      const [endH, endM] = evt.endTime ? evt.endTime.split(':').map(n => parseInt(n, 10)) : [startH, startM];
      const evtTitle = evt.label || 'Work Shift';
      window.open(generateGoogleCalendarUrl(evtTitle, evt.date, startH, startM, endH, endM), '_blank');
    });
    popup.remove();
    showToast(`Opened ${allWeekEvents.length} calendar events`);
  });

  // Apple: download ICS with all events
  popup.querySelector('[data-type="apple"]').addEventListener('click', () => {
    downloadWeekICS(allWeekEvents, weekDates);
    popup.remove();
  });

  popup.addEventListener('click', (e) => {
    if (e.target === popup) popup.remove();
  });
}

// Generate ICS file for entire week
function downloadWeekICS(allWeekEvents, weekDates) {
  const formatICSDate = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ops Scheduling//EN'
  ];

  allWeekEvents.forEach((evt, idx) => {
    const [startH, startM] = evt.startTime.split(':').map(n => parseInt(n, 10));
    const [endH, endM] = evt.endTime ? evt.endTime.split(':').map(n => parseInt(n, 10)) : [startH, startM];

    const startDate = new Date(evt.date);
    startDate.setHours(startH, startM, 0, 0);
    const endDate = new Date(evt.date);
    endDate.setHours(endH, endM, 0, 0);
    if (endH < startH) endDate.setDate(endDate.getDate() + 1);

    const uid = `${Date.now()}-${idx}@ops-scheduling`;
    const evtTitle = evt.label || 'Work Shift';

    icsContent.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `SUMMARY:${evtTitle}`,
      'DESCRIPTION:Shift added from Ops Scheduling',
      'END:VEVENT'
    );
  });

  icsContent.push('END:VCALENDAR');

  const startStr = weekDates[0].toISOString().split('T')[0];
  const endStr = weekDates[6].toISOString().split('T')[0];

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `schedule-${startStr}-to-${endStr}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast(`Downloaded ${allWeekEvents.length} events to calendar`);
}

function renderMyShifts() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find current week's schedule
  const currentSunday = getCurrentSunday();
  const nextSunday = new Date(currentSunday);
  nextSunday.setDate(nextSunday.getDate() + 7);

  // Get schedules for this week and next week
  const thisWeekSched = state.scheduleFiles.find(s => {
    const schedStart = new Date(s.startDate);
    schedStart.setHours(0, 0, 0, 0);
    return schedStart.getTime() === currentSunday.getTime();
  });

  const nextWeekSched = state.scheduleFiles.find(s => {
    const schedStart = new Date(s.startDate);
    schedStart.setHours(0, 0, 0, 0);
    return schedStart.getTime() === nextSunday.getTime();
  });

  // Fallback to current schedule if no matching week found
  const fallbackSched = { roster: state.roster, startDate: state.scheduleStartDate || currentSunday };
  const thisWeek = thisWeekSched || fallbackSched;

  const thisWeekDates = getWeekDates(0, thisWeek.startDate);
  const nextWeekDates = getWeekDates(0, nextSunday);

  const thisWeekUser = thisWeek.roster?.find(p =>
    normalizeName(p.name).toLowerCase() === normalizeName(state.currentUser || '').toLowerCase()
  );

  let html = '';

  // This Week - only show today and future days
  if (thisWeekUser) {
    const remainingDays = thisWeekUser.events.map((events, i) => {
      const date = thisWeekDates[i];
      if (date < today) return null; // Skip past days
      return { events, date, dayIndex: i };
    }).filter(Boolean);

    if (remainingDays.length > 0) {
      html += `<div class="sidebar-week-section">
        <div class="sidebar-week-label">This Week</div>
        ${remainingDays.map(({ events, date, dayIndex }) => {
          const isOff = isOffDay(events);
          const isToday = date.toDateString() === today.toDateString();
          const labels = getEventsLabels(events);
          const checkIn = isOff ? '' : formatEventsCheckIn(events);
          const timeDisplay = isOff ? '' : formatEventsTimeDisplay(events);

          const classes = ['sidebar-shift'];
          if (isOff) classes.push('off');
          if (isToday) classes.push('today');

          return `
            <div class="${classes.join(' ')}" data-day-index="${dayIndex}" data-week="this">
              <div class="sidebar-shift-header">
                <span class="sidebar-day-name">${shortDays[dayIndex]}</span>
                <span class="sidebar-day-num">${date.getDate()}</span>
              </div>
              <div class="sidebar-shift-body">
                ${isOff ? `
                  <span class="sidebar-off-label">Day Off</span>
                ` : `
                  ${labels.map(l => `<div class="sidebar-shift-label">${l}</div>`).join('')}
                  <div class="sidebar-shift-time">${timeDisplay}</div>
                  ${checkIn ? `<div class="sidebar-shift-checkin">${checkIn}</div>` : ''}
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>`;
    }
  }

  // Next Week
  html += `<div class="sidebar-week-section">
    <div class="sidebar-week-label">Next Week</div>`;

  if (nextWeekSched) {
    const nextWeekUser = nextWeekSched.roster?.find(p =>
      normalizeName(p.name).toLowerCase() === normalizeName(state.currentUser || '').toLowerCase()
    );

    if (nextWeekUser) {
      html += nextWeekUser.events.map((events, i) => {
        const date = nextWeekDates[i];
        const isOff = isOffDay(events);
        const labels = getEventsLabels(events);
        const checkIn = isOff ? '' : formatEventsCheckIn(events);
        const timeDisplay = isOff ? '' : formatEventsTimeDisplay(events);

        const classes = ['sidebar-shift'];
        if (isOff) classes.push('off');

        return `
          <div class="${classes.join(' ')}" data-day-index="${i}" data-week="next">
            <div class="sidebar-shift-header">
              <span class="sidebar-day-name">${shortDays[i]}</span>
              <span class="sidebar-day-num">${date.getDate()}</span>
            </div>
            <div class="sidebar-shift-body">
              ${isOff ? `
                <span class="sidebar-off-label">Day Off</span>
              ` : `
                ${labels.map(l => `<div class="sidebar-shift-label">${l}</div>`).join('')}
                <div class="sidebar-shift-time">${timeDisplay}</div>
                ${checkIn ? `<div class="sidebar-shift-checkin">${checkIn}</div>` : ''}
              `}
            </div>
          </div>
        `;
      }).join('');
    } else {
      html += `<div class="sidebar-shift tbd">
        <div class="sidebar-tbd-label">Schedule not available yet</div>
      </div>`;
    }
  } else {
    html += `<div class="sidebar-shift tbd">
      <div class="sidebar-tbd-label">Schedule not available yet</div>
    </div>`;
  }

  html += '</div>';

  if (!thisWeekUser && !nextWeekSched) {
    elements.myShiftsList.innerHTML = '<p class="no-shifts">No shifts found.</p>';
    return;
  }

  elements.myShiftsList.innerHTML = html;

  // Add click handlers for this week's shifts
  elements.myShiftsList.querySelectorAll('.sidebar-shift[data-week="this"]:not(.off)').forEach(item => {
    item.addEventListener('click', () => {
      const dayIndex = parseInt(item.dataset.dayIndex);
      const day = weekDays[dayIndex];
      openRequestModal(day, dayIndex, thisWeekUser.events[dayIndex]);
    });
  });

  // Add click handlers for next week's shifts (if schedule exists)
  if (nextWeekSched) {
    const nextWeekUser = nextWeekSched.roster?.find(p =>
      normalizeName(p.name).toLowerCase() === normalizeName(state.currentUser || '').toLowerCase()
    );
    if (nextWeekUser) {
      elements.myShiftsList.querySelectorAll('.sidebar-shift[data-week="next"]:not(.off)').forEach(item => {
        item.addEventListener('click', () => {
          const dayIndex = parseInt(item.dataset.dayIndex);
          const day = weekDays[dayIndex];
          // Switch to next week's schedule context
          state.roster = nextWeekSched.roster;
          state.scheduleStartDate = nextWeekSched.startDate;
          openRequestModal(day, dayIndex, nextWeekUser.events[dayIndex]);
        });
      });
    }
  }
}

function renderBulletin() {
  const showAll = elements.showAllRequests.checked;

  // Find requests where current user has already responded (pending lead approval)
  const myPendingResponses = state.approvals.filter(a =>
    a.responderName === state.currentUser &&
    a.status === 'pending'
  );
  const respondedRequestIds = new Set(myPendingResponses.map(a => {
    // Find the matching request
    const req = state.coverageRequests.find(r =>
      r.requesterName === a.requesterName &&
      r.day === a.requesterShift.day
    );
    return req ? req.id : null;
  }).filter(Boolean));

  // Separate into: user's own, pending responses, applicable, and non-applicable requests
  const myRequests = [];
  const applicable = [];
  const notApplicable = [];

  state.coverageRequests.forEach(req => {
    // Only coverage requests go to the public bulletin
    if (req.type !== 'coverage') return;

    if (req.requesterName === state.currentUser) {
      myRequests.push(req);
    } else if (respondedRequestIds.has(req.id)) {
      // Skip - will show in pending responses section
    } else if (canUserTakeRequest(req)) {
      applicable.push(req);
    } else {
      notApplicable.push(req);
    }
  });

  // Update badge with count including own requests and pending
  elements.bulletinBadge.textContent = myRequests.length + applicable.length + myPendingResponses.length;

  let html = '';

  // Render user's own requests first
  if (myRequests.length > 0) {
    html += '<div class="bulletin-section-label">Your Requests</div>';
    myRequests.forEach(req => {
      html += renderMyRequestCard(req);
    });
  }

  // Render pending responses (awaiting lead approval)
  if (myPendingResponses.length > 0) {
    html += '<div class="bulletin-section-label">Awaiting Lead Approval</div>';
    myPendingResponses.forEach(approval => {
      html += renderPendingResponseCard(approval);
    });
  }

  // Render applicable requests
  if (applicable.length > 0) {
    html += '<div class="bulletin-section-label">Open Requests</div>';
    applicable.forEach(req => {
      html += renderBulletinCard(req, true);
    });
  }

  // Render non-applicable (only if showAll)
  if (showAll && notApplicable.length > 0) {
    html += '<div class="bulletin-section-label">Other Requests</div>';
    notApplicable.forEach(req => {
      html += renderBulletinCard(req, false);
    });
  }

  if (myRequests.length === 0 && myPendingResponses.length === 0 && applicable.length === 0 && (!showAll || notApplicable.length === 0)) {
    html = '<p class="no-requests">No open requests right now.</p>';
  }

  elements.bulletinList.innerHTML = html;
}

function renderPendingResponseCard(approval) {
  const typeLabel = approval.type === 'swap' ? 'Swap offer' : 'Coverage offer';
  const time = approval.requesterShift.time;

  return `
    <div class="bulletin-card pending-response">
      <div class="bulletin-header">
        <span class="bulletin-name">${approval.requesterName}</span>
        <span class="bulletin-type pending">${typeLabel}</span>
      </div>
      <div class="bulletin-shift">${approval.requesterShift.day} · ${time}</div>
      ${approval.responderShift ? `
        <div class="bulletin-swap-info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
          </svg>
          Trading your ${approval.responderShift.day} shift
        </div>
      ` : ''}
      <div class="pending-status">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        Waiting for lead approval
      </div>
    </div>
  `;
}

function renderMyRequestCard(req) {
  const eventInfo = req.eventLabel ? `<div class="bulletin-event-label">${req.eventLabel}</div>` : '';
  return `
    <div class="bulletin-card my-request" onclick="handleViewRequest(${req.id})" style="cursor: pointer;">
      <div class="bulletin-header">
        <span class="bulletin-name">You</span>
        <span class="bulletin-type ${req.type}">${req.type}</span>
      </div>
      ${eventInfo}
      <div class="bulletin-shift">${req.day} · ${req.time}</div>
      ${req.note ? `<div class="bulletin-note">"${req.note}"</div>` : ''}
      <div class="my-request-status">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        Waiting for responses · Tap to view details
      </div>
    </div>
  `;
}

function renderBulletinCard(req, canTake) {
  const userSchedule = getCurrentUserSchedule();
  const userShiftOnDay = userSchedule ? userSchedule.events[req.dayIndex] : null;

  let unavailableReason = '';
  if (!canTake && userShiftOnDay) {
    unavailableReason = `<div class="unavailable-reason">You're working ${formatEventsTimeDisplay(userShiftOnDay)} on ${req.day}</div>`;
  }

  const eventInfo = req.eventLabel ? `<div class="bulletin-event-label">${req.eventLabel}</div>` : '';

  return `
    <div class="bulletin-card ${!canTake ? 'disabled' : ''}" onclick="${canTake ? `handleViewOtherRequest(${req.id})` : ''}" style="${canTake ? 'cursor: pointer;' : ''}">
      <div class="bulletin-header">
        <span class="bulletin-name">${req.requesterName}</span>
        <span class="bulletin-type ${req.type}">${req.type}</span>
      </div>
      ${eventInfo}
      <div class="bulletin-shift">${req.day} · ${req.time}</div>
      ${req.note ? `<div class="bulletin-note">"${req.note}"</div>` : ''}
      ${unavailableReason}
      ${canTake ? `
        <div class="bulletin-view-action">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          View Request
        </div>
      ` : ''}
    </div>
  `;
}

function renderApprovals() {
  if (state.role !== 'Lead') {
    elements.leadApprovals.classList.add('hidden');
    return;
  }

  elements.leadApprovals.classList.remove('hidden');

  // Get pending swap requests (private, only leads see these)
  const pendingSwaps = state.coverageRequests.filter(req => req.type === 'swap');

  if (!state.approvals.length && !pendingSwaps.length) {
    elements.approvalList.innerHTML = '<p class="no-approvals">No pending approvals.</p>';
    return;
  }

  let html = '';

  // Show pending swap requests first
  if (pendingSwaps.length > 0) {
    html += '<div class="approval-section-label">Pending Swap Requests</div>';
    html += pendingSwaps.map(req => `
      <div class="approval-card swap-request" onclick="handleViewSwapRequest(${req.id})" style="cursor: pointer;">
        <div class="approval-header">
          <span class="approval-type swap">swap request</span>
        </div>
        <div class="approval-person" style="margin-bottom: 8px;">
          <span class="mini-avatar">${getInitials(req.requesterName)}</span>
          <span class="person-name">${req.requesterName}</span>
          <span style="color: var(--text-muted); font-size: 12px; margin-left: 4px;">wants to trade</span>
        </div>
        <div class="approval-shift" style="margin-bottom: 8px;">
          <div class="day-time">${req.day} · ${formatTimeDisplay(req.time)}</div>
        </div>
        ${req.note ? `<div class="bulletin-note" style="margin-bottom: 8px;">"${req.note}"</div>` : ''}
        <div class="approval-view-action">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          View Request
        </div>
      </div>
    `).join('');
  }

  // Show pending approvals (responses to coverage/swap requests)
  if (state.approvals.length > 0) {
    html += '<div class="approval-section-label">Pending Approvals</div>';
    html += state.approvals.map(item => `
    <div class="approval-card" onclick="handleViewApproval(${item.id})" style="cursor: pointer;">
      <div class="approval-header">
        <span class="approval-type ${item.type}">${item.type}</span>
      </div>

      <div class="approval-parties">
        <div class="approval-person">
          <span class="mini-avatar">${getInitials(item.requesterName)}</span>
          <span class="person-name">${item.requesterName}</span>
        </div>
        <div class="approval-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
        <div class="approval-person">
          <span class="mini-avatar">${getInitials(item.responderName)}</span>
          <span class="person-name">${item.responderName}</span>
        </div>
      </div>

      <div class="approval-shifts">
        <div class="approval-shift">
          <div class="label">${item.requesterName.split(' ')[0]}'s shift</div>
          <div class="day-time">${item.requesterShift.day} · ${formatTimeDisplay(item.requesterShift.time)}</div>
        </div>
        ${item.type === 'swap' && item.responderShift ? `
          <div class="approval-shift">
            <div class="label">${item.responderName.split(' ')[0]}'s shift</div>
            <div class="day-time">${item.responderShift.day} · ${formatTimeDisplay(item.responderShift.time)}</div>
          </div>
        ` : ''}
      </div>

      <div class="approval-view-action">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        View Request
      </div>
    </div>
  `).join('');
  }

  elements.approvalList.innerHTML = html;
}

function renderTeamSchedule() {
  const grid = elements.scheduleGrid;
  grid.innerHTML = '';

  const schedules = state.scheduleFiles.length ? state.scheduleFiles : [{ roster: state.roster, startDate: state.scheduleStartDate || getCurrentSunday(), label: 'This Week' }];

  schedules.forEach((sched, idx) => {
    const weekDates = getWeekDates(0, sched.startDate);
    const sectionTitle = `${formatWeekRange(weekDates)}`;

    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'grid-cell header';
    sectionHeader.style.gridColumn = `span ${weekDays.length + 1}`;
    sectionHeader.textContent = sectionTitle;
    grid.appendChild(sectionHeader);

    grid.appendChild(createCell('Team Member', 'header'));
    weekDays.forEach(day => grid.appendChild(createCell(day, 'header')));

    sched.roster.forEach(person => {
      const isCurrentUser = normalizeName(person.name).toLowerCase() === normalizeName(state.currentUser || '').toLowerCase();
      grid.appendChild(createCell(person.name, `name ${isCurrentUser ? 'highlight' : ''}`));

      person.events.forEach(events => {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';

        if (isOffDay(events)) {
          cell.innerHTML = '<span class="off-tag">OFF</span>';
        } else {
          // For team grid, show time range from first start to last end
          const timeDisplay = formatEventsTimeDisplay(events).replace(/ (ET|PT)$/, '');
          cell.innerHTML = `<div class="time">${timeDisplay}</div>`;
        }

        grid.appendChild(cell);
      });
    });
  });
}

function createCell(text, className) {
  const cell = document.createElement('div');
  cell.className = `grid-cell ${className}`;
  cell.textContent = text;
  return cell;
}

function renderAvailableList(dayIndex, requestedEvents = null) {
  // Use state.selectedShift.events if not passed
  const events = requestedEvents || (state.selectedShift ? state.selectedShift.events : null);
  const available = getAvailablePeople(dayIndex, events);

  if (!available.length) {
    elements.availableList.innerHTML = `
      <div class="no-available">
        No one is available for this time slot. Your request will be posted to the bulletin for volunteers.
      </div>
    `;
    return;
  }

  elements.availableList.innerHTML = available.map(person => `
    <div class="available-person">
      <span class="avatar">${getInitials(person.name)}</span>
      <div class="available-person-info">
        <span class="available-person-name">${person.name}</span>
        <span class="available-person-status">${person.availabilityReason}</span>
      </div>
    </div>
  `).join('');
}

// ==========================================================================
// Modal Functions
// ==========================================================================

function openRequestModal(day, dayIndex, events) {
  const hasMultipleEvents = Array.isArray(events) && events.length > 1;
  state.selectedShift = { day, dayIndex, events, selectedEventScope: hasMultipleEvents ? '0' : 'all' };

  const labels = getEventsLabels(events);
  const timeDisplay = formatEventsTimeDisplay(events);

  // Build event selector for multi-event days
  let eventSelectorHtml = '';
  if (hasMultipleEvents) {
    eventSelectorHtml = `
      <div class="event-selector">
        <h4>Which shift needs coverage?</h4>
        <div class="event-options">
          ${events.map((evt, idx) => {
            const evtTime = evt.startTime && evt.endTime ? formatEventTime(evt) : '';
            const isFirst = idx === 0;
            return `
              <label class="event-option${isFirst ? ' selected' : ''}">
                <input type="radio" name="eventScope" value="${idx}"${isFirst ? ' checked' : ''} />
                <div class="event-option-info">
                  <div class="event-option-label">${evt.label || 'Event ' + (idx + 1)}</div>
                  ${evtTime ? `<div class="event-option-detail">${evtTime}</div>` : ''}
                </div>
              </label>
            `;
          }).join('')}
          <div class="event-option-divider"></div>
          <label class="event-option">
            <input type="radio" name="eventScope" value="all" />
            <div class="event-option-info">
              <div class="event-option-label">Entire day</div>
              <div class="event-option-detail">${labels.join(' + ')} (${timeDisplay})</div>
            </div>
          </label>
        </div>
      </div>
    `;
  }

  elements.modalShiftDetail.innerHTML = `
    <div class="shift-day">${day}</div>
    ${labels.length ? `<div class="shift-labels-modal">${labels.map(l => `<div class="shift-title-modal">${l}</div>`).join('')}</div>` : ''}
    <div class="shift-time">${timeDisplay}</div>
    ${eventSelectorHtml}
  `;

  // Add event listener for event scope selection
  if (hasMultipleEvents) {
    elements.modalShiftDetail.querySelectorAll('.event-option').forEach(option => {
      option.addEventListener('click', () => {
        elements.modalShiftDetail.querySelectorAll('.event-option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
        const radio = option.querySelector('input[type="radio"]');
        state.selectedShift.selectedEventScope = radio.value;
      });
    });
  }

  renderAvailableList(dayIndex);
  elements.requestNote.value = '';

  // Reset to coverage mode
  setRequestMode('coverage');

  elements.requestModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

// Format a single event's time for display
function formatEventTime(evt) {
  if (!evt.startTime || !evt.endTime) return '';
  const storedTz = evt.timezone || 'ET';

  // Determine if conversion is needed
  let convertFn = null;
  if (state.displayTimezone === 'PT' && storedTz === 'ET') {
    convertFn = convertETtoPT;
  } else if (state.displayTimezone === 'ET' && storedTz === 'PT') {
    convertFn = convertPTtoET;
  }

  const fmt = (timeStr) => {
    let [h, m] = timeStr.split(':').map(n => parseInt(n, 10));
    if (convertFn) h = convertFn(h);
    const period = h >= 12 ? 'p' : 'a';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return m ? `${hour12}:${m.toString().padStart(2, '0')}${period}` : `${hour12}${period}`;
  };
  return `${fmt(evt.startTime)}-${fmt(evt.endTime)} ${state.displayTimezone}`;
}

function setRequestMode(mode) {
  elements.requestTypeInput.value = mode;

  if (mode === 'coverage') {
    elements.modeCoverage.classList.remove('hidden');
    elements.modeSwap.classList.add('hidden');
    elements.pivotToSwap.classList.remove('hidden');
    elements.pivotToCoverage.classList.add('hidden');
    elements.submitRequest.textContent = 'Post to Bulletin';
  } else {
    elements.modeCoverage.classList.add('hidden');
    elements.modeSwap.classList.remove('hidden');
    elements.pivotToSwap.classList.add('hidden');
    elements.pivotToCoverage.classList.remove('hidden');
    elements.submitRequest.textContent = 'Submit Trade Request';
  }
}

function closeRequestModal() {
  elements.requestModal.classList.add('hidden');
  document.body.style.overflow = '';
  state.selectedShift = null;
}

function openConfirmModal(type, request, swapShift = null) {
  state.pendingConfirm = { type, request, swapShift };

  if (type === 'cover') {
    elements.confirmTitle.textContent = 'Confirm Coverage';
    elements.swapOptions.classList.add('hidden');

    elements.confirmSummary.innerHTML = `
      <div class="confirm-parties">
        <div class="confirm-person">
          <div class="avatar-lg">${getInitials(request.requesterName)}</div>
          <div class="name">${request.requesterName}</div>
          <div class="role-label">Needs coverage</div>
        </div>
        <div class="confirm-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
        <div class="confirm-person">
          <div class="avatar-lg">${getInitials(state.currentUser)}</div>
          <div class="name">${state.currentUser}</div>
          <div class="role-label">Covering</div>
        </div>
      </div>
      <div class="confirm-shifts">
        <div class="confirm-shift">
          <div class="shift-label">Shift you're picking up</div>
          <div class="shift-day">${request.day}</div>
          <div class="shift-time">${formatTimeDisplay(request.time)}</div>
        </div>
      </div>
    `;

    elements.confirmNotice.textContent = 'A lead will review and approve this request. You\'ll be notified once confirmed.';
    elements.submitConfirm.textContent = 'Confirm Coverage';

  } else if (type === 'swap') {
    elements.confirmTitle.textContent = 'Propose Swap';

    const swappableShifts = getSwappableShifts(request);

    if (swappableShifts.length === 0) {
      elements.confirmSummary.innerHTML = `
        <div class="no-swaps">
          No available shifts to swap. ${request.requesterName} is working on all your scheduled days.
        </div>
      `;
      elements.swapOptions.classList.add('hidden');
      elements.submitConfirm.disabled = true;
    } else {
      elements.confirmSummary.innerHTML = `
        <div class="confirm-parties">
          <div class="confirm-person">
            <div class="avatar-lg">${getInitials(state.currentUser)}</div>
            <div class="name">${state.currentUser}</div>
            <div class="role-label">Your shift</div>
          </div>
          <div class="confirm-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
            </svg>
          </div>
          <div class="confirm-person">
            <div class="avatar-lg">${getInitials(request.requesterName)}</div>
            <div class="name">${request.requesterName}</div>
            <div class="role-label">Their shift: ${request.day}</div>
          </div>
        </div>
      `;

      elements.swapOptions.classList.remove('hidden');
      elements.swapList.innerHTML = swappableShifts.map((shift, idx) => `
        <label class="swap-option ${idx === 0 ? 'selected' : ''}">
          <input type="radio" name="swapShift" value="${shift.dayIndex}" ${idx === 0 ? 'checked' : ''} />
          <div class="swap-option-info">
            <div class="swap-option-day">${shift.day}</div>
            <div class="swap-option-time">${formatTimeDisplay(shift.time)}</div>
          </div>
        </label>
      `).join('');

      // Add selection styling
      elements.swapList.querySelectorAll('.swap-option').forEach(option => {
        option.addEventListener('click', () => {
          elements.swapList.querySelectorAll('.swap-option').forEach(o => o.classList.remove('selected'));
          option.classList.add('selected');
        });
      });

      elements.submitConfirm.disabled = false;
    }

    elements.confirmNotice.textContent = 'A lead will review and approve this swap. Both parties will be notified.';
    elements.submitConfirm.textContent = 'Propose Swap';
  }

  elements.confirmModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeConfirmModal() {
  elements.confirmModal.classList.add('hidden');
  document.body.style.overflow = '';
  state.pendingConfirm = null;
  state.selectedSwapShift = null;
}

// ==========================================================================
// Toast
// ==========================================================================

function showToast(message, showAction = false, actionText = 'View Request', type = 'success') {
  const toastMessage = elements.toast.querySelector('.toast-message');
  const successIcon = elements.toast.querySelector('.toast-icon-success');
  const errorIcon = elements.toast.querySelector('.toast-icon-error');

  toastMessage.textContent = message;

  // Toggle icons based on type
  if (type === 'error') {
    successIcon.classList.add('hidden');
    errorIcon.classList.remove('hidden');
    elements.toast.classList.add('toast-error');
  } else {
    successIcon.classList.remove('hidden');
    errorIcon.classList.add('hidden');
    elements.toast.classList.remove('toast-error');
  }

  if (showAction) {
    elements.toastAction.textContent = actionText;
    elements.toastAction.classList.remove('hidden');
  } else {
    elements.toastAction.classList.add('hidden');
  }

  elements.toast.classList.remove('hidden');

  setTimeout(() => {
    elements.toast.classList.add('hidden');
    elements.toastAction.classList.add('hidden');
  }, showAction ? 5000 : 3000);
}

// ==========================================================================
// Detail Modal
// ==========================================================================

function openDetailModal(requestId, context = 'own') {
  const request = state.coverageRequests.find(r => r.id === requestId);
  if (!request) return;

  state.viewingRequest = request;
  state.viewingContext = context;
  state.viewingApproval = null;

  // Populate shift info
  elements.detailShift.innerHTML = `
    <div class="shift-day">${request.day}</div>
    <div class="shift-time">${formatTimeDisplay(request.time)}</div>
  `;

  // Request type
  elements.detailType.textContent = request.type === 'swap' ? 'Shift Swap' : 'Coverage Request';

  // Reason
  if (request.note) {
    elements.detailReasonSection.classList.remove('hidden');
    elements.detailReason.textContent = request.note;
  } else {
    elements.detailReasonSection.classList.add('hidden');
  }

  // Available people
  const available = getAvailablePeople(request.dayIndex);
  if (available.length > 0) {
    elements.detailAvailable.innerHTML = available.map(person => `
      <div class="available-person">
        <span class="avatar">${getInitials(person.name)}</span>
        ${person.name}
      </div>
    `).join('');
  } else {
    elements.detailAvailable.innerHTML = '<p class="no-responses">No one is off this day</p>';
  }

  // Check for responses (approvals related to this request)
  const responses = state.approvals.filter(a =>
    a.requesterName === request.requesterName &&
    a.requesterShift.day === request.day
  );

  if (responses.length > 0) {
    elements.detailResponses.innerHTML = responses.map(r => `
      <div class="response-item">
        <div class="available-person">
          <span class="avatar">${getInitials(r.responderName)}</span>
          ${r.responderName}
        </div>
        <span class="response-type">${r.type === 'swap' ? 'Offered swap' : 'Offered coverage'}</span>
      </div>
    `).join('');
  } else {
    elements.detailResponses.innerHTML = '<p class="no-responses">No responses yet</p>';
  }

  // Update modal footer based on context
  updateDetailModalFooter(context, request);

  elements.detailModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function openApprovalDetailModal(approvalId) {
  const approval = state.approvals.find(a => a.id === approvalId);
  if (!approval) return;

  state.viewingApproval = approval;
  state.viewingContext = 'approve';
  state.viewingRequest = null;

  // Populate shift info (requester's shift)
  elements.detailShift.innerHTML = `
    <div class="shift-day">${approval.requesterShift.day}</div>
    <div class="shift-time">${formatTimeDisplay(approval.requesterShift.time)}</div>
  `;

  // Request type
  elements.detailType.textContent = approval.type === 'swap' ? 'Shift Swap Request' : 'Coverage Request';

  // Hide reason section for approvals
  elements.detailReasonSection.classList.add('hidden');

  // Show parties involved
  elements.detailAvailable.innerHTML = `
    <div class="approval-detail-parties">
      <div class="party-info">
        <div class="party-label">Requesting</div>
        <div class="available-person">
          <span class="avatar">${getInitials(approval.requesterName)}</span>
          ${approval.requesterName}
        </div>
        <div class="party-shift">${approval.requesterShift.day} · ${formatTimeDisplay(approval.requesterShift.time)}</div>
      </div>
      <div class="party-arrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          ${approval.type === 'swap'
            ? '<path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>'
            : '<path d="M5 12h14M12 5l7 7-7 7"/>'
          }
        </svg>
      </div>
      <div class="party-info">
        <div class="party-label">${approval.type === 'swap' ? 'Swapping with' : 'Covering'}</div>
        <div class="available-person">
          <span class="avatar">${getInitials(approval.responderName)}</span>
          ${approval.responderName}
        </div>
        ${approval.responderShift ? `
          <div class="party-shift">${approval.responderShift.day} · ${formatTimeDisplay(approval.responderShift.time)}</div>
        ` : ''}
      </div>
    </div>
  `;

  // Hide responses section for approvals
  elements.detailResponses.innerHTML = '';

  // Update modal footer for approval context
  updateDetailModalFooter('approve', null, approval);

  elements.detailModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function updateDetailModalFooter(context, request = null, approval = null) {
  const footer = elements.detailModal.querySelector('.modal-footer');

  if (context === 'own' && request) {
    // Own request - show cancel button
    footer.innerHTML = `
      <button class="btn-outline" id="cancelDetailRequest">Cancel Request</button>
      <button class="btn-ghost" id="closeDetailBtn">Close</button>
    `;
    document.getElementById('cancelDetailRequest').addEventListener('click', () => {
      const requestId = state.viewingRequest.id;
      closeDetailModal();
      window.handleCancelRequest(requestId);
    });
  } else if (context === 'respond' && request) {
    // Responding to someone else's request
    footer.innerHTML = `
      <button class="btn-ghost" id="closeDetailBtn">Close</button>
      <button class="btn-primary" id="detailCoverBtn">I Can Cover</button>
      ${request.type === 'swap' ? `<button class="btn-outline" id="detailSwapBtn">Propose Swap</button>` : ''}
    `;
    document.getElementById('detailCoverBtn').addEventListener('click', () => {
      closeDetailModal();
      openConfirmModal('cover', request);
    });
    if (request.type === 'swap') {
      document.getElementById('detailSwapBtn').addEventListener('click', () => {
        closeDetailModal();
        openConfirmModal('swap', request);
      });
    }
  } else if (context === 'approve' && approval) {
    // Lead approving/denying
    footer.innerHTML = `
      <button class="btn-deny" id="detailDenyBtn">Deny</button>
      <button class="btn-approve" id="detailApproveBtn">Approve</button>
    `;
    document.getElementById('detailApproveBtn').addEventListener('click', () => {
      closeDetailModal();
      window.handleApprove(approval.id);
    });
    document.getElementById('detailDenyBtn').addEventListener('click', () => {
      closeDetailModal();
      window.handleDeny(approval.id);
    });
  } else if (context === 'lead-swap' && request) {
    // Lead viewing a pending swap request
    footer.innerHTML = `
      <button class="btn-deny" id="detailCancelSwapBtn">Cancel Request</button>
      <button class="btn-ghost" id="closeDetailBtn">Close</button>
    `;
    document.getElementById('detailCancelSwapBtn').addEventListener('click', () => {
      closeDetailModal();
      window.handleCancelRequest(request.id);
      showToast('Swap request cancelled.');
    });
  } else {
    // Default - just close button
    footer.innerHTML = `
      <button class="btn-ghost" id="closeDetailBtn">Close</button>
    `;
  }

  // Re-attach close button listener
  const closeBtn = document.getElementById('closeDetailBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeDetailModal);
  }
}

function closeDetailModal() {
  elements.detailModal.classList.add('hidden');
  document.body.style.overflow = '';
  state.viewingRequest = null;
}

// ==========================================================================
// Action Handlers
// ==========================================================================

function handleLogin(e) {
  e.preventDefault();

  const username = elements.usernameInput.value.trim();
  const password = elements.passwordInput.value.trim();

  const valid = validCredentials.find(
    c => c.username.toLowerCase() === username.toLowerCase() && c.password === password
  );

  if (valid) {
    state.currentUser = valid.username;
    elements.userName.textContent = state.currentUser;
    elements.userAvatar.textContent = getInitials(state.currentUser);

    elements.loginView.classList.add('hidden');
    elements.dashboardView.classList.remove('hidden');

    loadDefaultSchedule();
    renderWeekView();
    renderMyShifts();
    renderBulletin();
    renderApprovals();
    renderTeamSchedule();
  } else {
    showToast('Invalid credentials. Please check your username and password.', false, '', 'error');
  }
}

function handleLogout() {
  state.currentUser = null;
  elements.dashboardView.classList.add('hidden');
  elements.loginView.classList.remove('hidden');
  elements.usernameInput.value = '';
  elements.passwordInput.value = '';
}

function handleRoleSwitch(e) {
  const btn = e.target.closest('.role-btn');
  if (!btn) return;

  state.role = btn.dataset.role;

  elements.roleToggle.querySelectorAll('.role-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.role === state.role);
  });

  // Toggle lead mode styling
  elements.dashboardView.classList.toggle('lead-mode', state.role === 'Lead');

  renderApprovals();
  showToast(`Switched to ${state.role} view`);
}

function handleTabSwitch(e) {
  const btn = e.target.closest('.tab-btn');
  if (!btn) return;

  const tabName = btn.dataset.tab;

  elements.sidebarTabs.forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  elements.myShiftsTab.classList.toggle('active', tabName === 'myShifts');
  elements.bulletinTab.classList.toggle('active', tabName === 'bulletin');
}

function handleTimezoneSwitch(e) {
  const btn = e.target.closest('.tz-btn');
  if (!btn) return;

  const tz = btn.dataset.tz;
  state.displayTimezone = tz;

  // Update button states
  elements.timezoneToggle.querySelectorAll('.tz-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tz === tz);
  });

  // Re-render views with new timezone
  renderWeekView();
  renderMyShifts();
  renderBulletin();
  renderTeamSchedule();

  showToast(`Switched to ${tz === 'ET' ? 'Eastern' : 'Pacific'} time`);
}

function handleSubmitRequest() {
  if (!state.selectedShift) return;

  const requestType = elements.requestTypeInput.value;
  const note = elements.requestNote.value.trim();
  const allEvents = state.selectedShift.events;
  const scope = state.selectedShift.selectedEventScope || 'all';

  // Determine which events are being requested for coverage
  let requestedEvents, timeDisplay, eventLabel;
  if (scope === 'all') {
    requestedEvents = allEvents;
    timeDisplay = formatEventsTimeDisplay(allEvents);
    eventLabel = getEventsLabels(allEvents).join(' + ');
  } else {
    const eventIdx = parseInt(scope, 10);
    const singleEvent = allEvents[eventIdx];
    requestedEvents = [singleEvent];
    timeDisplay = formatEventTime(singleEvent);
    eventLabel = singleEvent.label || '';
  }

  const newRequest = {
    id: Date.now(),
    requesterName: state.currentUser,
    day: state.selectedShift.day,
    dayIndex: state.selectedShift.dayIndex,
    events: requestedEvents, // Store only the requested events
    allDayEvents: allEvents, // Store full day for context
    eventScope: scope, // 'all' or index
    eventLabel: eventLabel, // For display in bulletin
    time: timeDisplay, // For display
    type: requestType,
    note: note,
    timestamp: Date.now()
  };

  state.coverageRequests.unshift(newRequest);
  state.lastPostedRequestId = newRequest.id;

  closeRequestModal();
  renderBulletin();
  renderApprovals(); // Update approvals in case it's a swap request

  // Show toast with appropriate message
  if (requestType === 'coverage') {
    showToast('Your coverage request has been posted to the bulletin.', true, 'View Request');
  } else {
    showToast('Your trade request has been submitted. A lead will be notified.', false);
  }
}

function handleExpandTeam() {
  const isExpanded = !elements.teamSchedule.classList.contains('hidden');

  elements.teamSchedule.classList.toggle('hidden');
  elements.expandTeamBtn.classList.toggle('expanded');

  elements.expandTeamBtn.querySelector('span').textContent =
    isExpanded ? 'View Full Team Schedule' : 'Hide Team Schedule';
}

function handleCSVUpload(e) {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;

  const parseFile = (file) => new Promise((resolve, reject) => {
    const isXLSX = file.name.toLowerCase().endsWith('.xlsx');
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (isXLSX) {
          if (typeof XLSX === 'undefined') return reject(new Error('XLSX parser missing'));
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const parsed = parseXlsxRoster(workbook);
          resolve({
            roster: parsed.roster,
            startDate: parsed.startDate || getCurrentSunday(),
            label: file.name
          });
        } else {
          const text = event.target.result;
          resolve({
            roster: parseCSV(text),
            startDate: getCurrentSunday(),
            label: file.name
          });
        }
      } catch (err) { reject(err); }
    };
    reader.onerror = reject;
    if (isXLSX) reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
  });

  Promise.allSettled(files.map(parseFile)).then(results => {
    const parsed = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);
    if (!parsed.length) {
      showToast('No schedules loaded.');
      return;
    }

    // Sort by start date ascending
    parsed.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    state.scheduleFiles = parsed;
    pickActiveSchedule();

    renderWeekView();
    renderMyShifts();
    renderTeamSchedule();
    renderBulletin();
    showToast(parsed.length > 1 ? 'Schedules updated (multiple weeks).' : 'Schedule updated from file!');
  }).catch(err => {
    console.error(err);
    showToast('Could not read one of the schedule files.');
  });
}

function handleConfirmSubmit() {
  if (!state.pendingConfirm) return;

  const { type, request } = state.pendingConfirm;
  const userSchedule = getCurrentUserSchedule();

  if (type === 'cover') {
    // Create approval for coverage
    state.approvals.push({
      id: Date.now(),
      type: 'coverage',
      requesterName: request.requesterName,
      responderName: state.currentUser,
      requesterShift: { day: request.day, time: request.time },
      responderShift: null,
      status: 'pending'
    });

    showToast(`Coverage offer sent! ${request.requesterName} and leads will be notified.`);

  } else if (type === 'swap') {
    const selectedRadio = document.querySelector('input[name="swapShift"]:checked');
    if (!selectedRadio) {
      showToast('Please select a shift to swap.');
      return;
    }

    const swapDayIndex = parseInt(selectedRadio.value);
    const swapDay = weekDays[swapDayIndex];
    const swapTime = userSchedule.events[swapDayIndex];

    // Create approval for swap
    state.approvals.push({
      id: Date.now(),
      type: 'swap',
      requesterName: request.requesterName,
      responderName: state.currentUser,
      requesterShift: { day: request.day, time: request.time },
      responderShift: { day: swapDay, time: swapTime },
      status: 'pending'
    });

    showToast(`Swap proposal sent! ${request.requesterName} and leads will be notified.`);
  }

  closeConfirmModal();
  renderApprovals();
}

// Global action handlers
window.handleCoverClick = function(requestId) {
  const request = state.coverageRequests.find(r => r.id === requestId);
  if (!request) return;
  openConfirmModal('cover', request);
};

window.handleSwapClick = function(requestId) {
  const request = state.coverageRequests.find(r => r.id === requestId);
  if (!request) return;
  openConfirmModal('swap', request);
};

window.handleApprove = function(approvalId) {
  const approval = state.approvals.find(a => a.id === approvalId);

  // Record approval details
  const completedApproval = {
    ...approval,
    status: 'approved',
    approvedBy: state.currentUser,
    approvedAt: new Date().toISOString()
  };

  // Add to activity log
  state.activityLog.push({
    id: Date.now(),
    type: approval.type === 'swap' ? 'swap_approved' : 'coverage_approved',
    requesterName: approval.requesterName,
    responderName: approval.responderName,
    shift: approval.requesterShift,
    approvedBy: state.currentUser,
    timestamp: new Date().toISOString()
  });

  state.approvals = state.approvals.filter(a => a.id !== approvalId);

  // Remove from coverage requests
  state.coverageRequests = state.coverageRequests.filter(
    r => !(r.requesterName === approval.requesterName && r.day === approval.requesterShift.day)
  );

  renderApprovals();
  renderBulletin();
  showToast(`Request approved by ${state.currentUser}! Both parties have been notified.`);
};

window.handleDeny = function(approvalId) {
  const approval = state.approvals.find(a => a.id === approvalId);

  // Add to activity log
  if (approval) {
    state.activityLog.push({
      id: Date.now(),
      type: approval.type === 'swap' ? 'swap_denied' : 'coverage_denied',
      requesterName: approval.requesterName,
      responderName: approval.responderName,
      shift: approval.requesterShift,
      deniedBy: state.currentUser,
      timestamp: new Date().toISOString()
    });
  }

  state.approvals = state.approvals.filter(a => a.id !== approvalId);
  renderApprovals();
  showToast(`Request denied by ${state.currentUser}. The requester has been notified.`);
};

window.handleCancelRequest = function(requestId) {
  state.coverageRequests = state.coverageRequests.filter(r => r.id !== requestId);
  renderBulletin();
  showToast('Request cancelled.');
};

window.handleViewRequest = function(requestId) {
  openDetailModal(requestId, 'own');
};

window.handleViewOtherRequest = function(requestId) {
  openDetailModal(requestId, 'respond');
};

window.handleViewApproval = function(approvalId) {
  openApprovalDetailModal(approvalId);
};

window.handleViewSwapRequest = function(requestId) {
  // For leads viewing a swap request - show details with option to cancel
  openDetailModal(requestId, 'lead-swap');
};

// ==========================================================================
// Event Listeners
// ==========================================================================

elements.loginForm.addEventListener('submit', handleLogin);
elements.logoutBtn.addEventListener('click', handleLogout);

// Toggle password visibility
document.getElementById('togglePassword').addEventListener('click', function() {
  const passwordInput = elements.passwordInput;
  const eyeOpen = this.querySelector('.eye-open');
  const eyeClosed = this.querySelector('.eye-closed');

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    eyeOpen.classList.add('hidden');
    eyeClosed.classList.remove('hidden');
  } else {
    passwordInput.type = 'password';
    eyeOpen.classList.remove('hidden');
    eyeClosed.classList.add('hidden');
  }
});
elements.roleToggle.addEventListener('click', handleRoleSwitch);
elements.sidebarTabs.forEach(tab => tab.addEventListener('click', handleTabSwitch));
elements.closeModal.addEventListener('click', closeRequestModal);
elements.cancelRequest.addEventListener('click', closeRequestModal);
elements.submitRequest.addEventListener('click', handleSubmitRequest);
elements.pivotToSwap.addEventListener('click', () => setRequestMode('swap'));
elements.pivotToCoverage.addEventListener('click', () => setRequestMode('coverage'));
elements.expandTeamBtn.addEventListener('click', handleExpandTeam);
elements.csvUpload.addEventListener('change', handleCSVUpload);
elements.showAllRequests.addEventListener('change', renderBulletin);
elements.timezoneToggle.addEventListener('click', handleTimezoneSwitch);

// Confirmation modal
elements.closeConfirm.addEventListener('click', closeConfirmModal);
elements.cancelConfirm.addEventListener('click', closeConfirmModal);
elements.submitConfirm.addEventListener('click', handleConfirmSubmit);

// Detail modal
elements.closeDetail.addEventListener('click', closeDetailModal);
elements.closeDetailBtn.addEventListener('click', closeDetailModal);
elements.cancelDetailRequest.addEventListener('click', () => {
  if (state.viewingRequest) {
    const requestId = state.viewingRequest.id;
    closeDetailModal();
    window.handleCancelRequest(requestId);
  }
});

// Toast action
elements.toastAction.addEventListener('click', () => {
  if (state.lastPostedRequestId) {
    openDetailModal(state.lastPostedRequestId);
  }
});

// Close modals on overlay click
elements.requestModal.querySelector('.modal-overlay').addEventListener('click', closeRequestModal);
elements.confirmModal.querySelector('.modal-overlay').addEventListener('click', closeConfirmModal);
elements.detailModal.querySelector('.modal-overlay').addEventListener('click', closeDetailModal);

// Close modal on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!elements.notifyModal.classList.contains('hidden')) {
      elements.notifyModal.classList.add('hidden');
    } else if (!elements.detailModal.classList.contains('hidden')) {
      closeDetailModal();
    } else if (!elements.confirmModal.classList.contains('hidden')) {
      closeConfirmModal();
    } else if (!elements.requestModal.classList.contains('hidden')) {
      closeRequestModal();
    }
  }
});

// Notification modal
elements.notifyBtn.addEventListener('click', () => elements.notifyModal.classList.remove('hidden'));
elements.closeNotify.addEventListener('click', () => elements.notifyModal.classList.add('hidden'));
elements.cancelNotify.addEventListener('click', () => elements.notifyModal.classList.add('hidden'));
elements.saveNotify.addEventListener('click', () => {
  elements.notifyModal.classList.add('hidden');
  showToast('Notification preferences saved!');
});
elements.notifyModal.querySelector('.modal-overlay').addEventListener('click', () => {
  elements.notifyModal.classList.add('hidden');
});

// Toggle input field visibility based on checkboxes
elements.notifyEmail.addEventListener('change', (e) => {
  elements.emailGroup.classList.toggle('hidden', !e.target.checked);
});
elements.notifyText.addEventListener('change', (e) => {
  elements.phoneGroup.classList.toggle('hidden', !e.target.checked);
});
elements.notifyTeams.addEventListener('change', (e) => {
  elements.teamsGroup.classList.toggle('hidden', !e.target.checked);
});

// ==========================================================================
// Mobile Drawer
// ==========================================================================

const mobileElements = {
  hamburgerBtn: document.getElementById('hamburgerBtn'),
  mobileDrawer: document.getElementById('mobileDrawer'),
  mobileDrawerOverlay: document.getElementById('mobileDrawerOverlay'),
  closeDrawerBtn: document.getElementById('closeDrawerBtn'),
  mobileUserAvatar: document.getElementById('mobileUserAvatar'),
  mobileUserName: document.getElementById('mobileUserName'),
  mobileBulletinContent: document.getElementById('mobileBulletinContent'),
  mobileLogoutBtn: document.getElementById('mobileLogoutBtn'),
  mobileRoleToggle: document.getElementById('mobileRoleToggle'),
  mobileRoleBtns: document.querySelectorAll('.mobile-role-btn')
};

function openMobileDrawer() {
  mobileElements.mobileDrawerOverlay.classList.remove('hidden');
  mobileElements.mobileDrawer.style.display = 'flex';

  // Trigger reflow for animation
  void mobileElements.mobileDrawer.offsetWidth;

  mobileElements.mobileDrawerOverlay.classList.add('visible');
  mobileElements.mobileDrawer.classList.add('open');

  // Prevent body scroll
  document.body.style.overflow = 'hidden';

  // Sync user info, role toggle, and load bulletin
  syncMobileUserInfo();
  syncMobileRoleToggle();
  loadMobileBulletin();
}

function closeMobileDrawer() {
  mobileElements.mobileDrawerOverlay.classList.remove('visible');
  mobileElements.mobileDrawer.classList.remove('open');

  // Re-enable body scroll
  document.body.style.overflow = '';

  // Hide after animation
  setTimeout(() => {
    mobileElements.mobileDrawerOverlay.classList.add('hidden');
    mobileElements.mobileDrawer.style.display = 'none';
  }, 300);
}

function syncMobileUserInfo() {
  if (mobileElements.mobileUserAvatar && elements.userAvatar) {
    mobileElements.mobileUserAvatar.textContent = elements.userAvatar.textContent;
  }
  if (mobileElements.mobileUserName && elements.userName) {
    mobileElements.mobileUserName.textContent = elements.userName.textContent;
  }
}

function loadMobileBulletin() {
  const container = mobileElements.mobileBulletinContent;
  if (!container || !elements.bulletinList) return;

  // Clone bulletin content
  const bulletinClone = elements.bulletinList.cloneNode(true);
  container.innerHTML = '<p class="mobile-bulletin-desc">Shifts needing coverage</p>';

  if (bulletinClone.innerHTML.trim()) {
    container.appendChild(bulletinClone);
  } else {
    container.innerHTML += '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No open requests</p>';
  }
}

// Mobile drawer event listeners
if (mobileElements.hamburgerBtn) {
  mobileElements.hamburgerBtn.addEventListener('click', openMobileDrawer);
}

// User badge also opens drawer on mobile
const userBadge = document.getElementById('userBadge');
if (userBadge) {
  userBadge.addEventListener('click', (e) => {
    // Only on mobile (<=900px)
    if (window.innerWidth <= 900) {
      e.preventDefault();
      openMobileDrawer();
    }
  });
}

if (mobileElements.closeDrawerBtn) {
  mobileElements.closeDrawerBtn.addEventListener('click', closeMobileDrawer);
}

if (mobileElements.mobileDrawerOverlay) {
  mobileElements.mobileDrawerOverlay.addEventListener('click', closeMobileDrawer);
}

// Mobile logout button
if (mobileElements.mobileLogoutBtn) {
  mobileElements.mobileLogoutBtn.addEventListener('click', () => {
    closeMobileDrawer();
    handleLogout();
  });
}

// Mobile role toggle - sync with desktop
function syncMobileRoleToggle() {
  const activeDesktopRole = document.querySelector('.role-btn.active');
  if (!activeDesktopRole) return;

  const activeRole = activeDesktopRole.dataset.role;
  mobileElements.mobileRoleBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.role === activeRole);
  });
}

// Mobile role button clicks
mobileElements.mobileRoleBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const role = btn.dataset.role;

    // Update mobile buttons
    mobileElements.mobileRoleBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Sync with desktop toggle
    const desktopBtns = document.querySelectorAll('.role-btn');
    desktopBtns.forEach(b => {
      b.classList.toggle('active', b.dataset.role === role);
    });

    // Toggle lead mode on dashboard
    const dashboard = document.getElementById('dashboardView');
    const leadApprovals = document.getElementById('leadApprovals');

    if (role === 'Lead') {
      dashboard.classList.add('lead-mode');
      if (leadApprovals) leadApprovals.classList.remove('hidden');
    } else {
      dashboard.classList.remove('lead-mode');
      if (leadApprovals) leadApprovals.classList.add('hidden');
    }
  });
});

// Close drawer on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileElements.mobileDrawer.classList.contains('open')) {
    closeMobileDrawer();
  }
});

// Close drawer on window resize to desktop
window.addEventListener('resize', () => {
  if (window.innerWidth > 900 && mobileElements.mobileDrawer.classList.contains('open')) {
    closeMobileDrawer();
  }
});

// ==========================================================================
// Initialize
// ==========================================================================

elements.usernameInput.value = 'Andrew Amisola';
