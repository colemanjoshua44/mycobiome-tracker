import React, { useState, useEffect, useRef } from "react";
import { 
  Activity, 
  BookOpen, 
  Calendar, 
  Check, 
  ChevronLeft,
  ChevronRight, 
  Clock, 
  Database, 
  FileText, 
  Heart, 
  HelpCircle, 
  Info, 
  Layers, 
  LogOut, 
  Plus, 
  RotateCcw, 
  Send, 
  Settings, 
  Smile, 
  Sparkles, 
  Trash2, 
  User, 
  X,
  Smartphone,
  RefreshCw,
  Copy,
  KeyRound,
  Camera,
  UploadCloud,
  Image as ImageIcon
} from "lucide-react";

const BRISTOL_STOOL_CHART = [
  { type: 1, name: "Separate Hard Lumps", rating: "severe constipation", desc: "Hard, separate lumps resembling nuts; difficult to pass. Suggests slow transit and low hydration.", color: "text-red-600 bg-red-50 border-red-200" },
  { type: 2, name: "Sausage-Shaped but Lumpy", rating: "mild constipation", desc: "Sausage-shaped but filled with distinct lumps. Indicates slight dehydration and lack of fermentable fiber.", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { type: 3, name: "Sausage with Surface Cracks", rating: "normal / optimal", desc: "Like a sausage but with shallow cracks on the surface. Indicates a healthy gut transit time.", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { type: 4, name: "Smooth and Soft Sausage", rating: "excellent / perfect", desc: "Soft, smooth snake-like sausage. The absolute gold standard of bowel health and gut motility.", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { type: 5, name: "Soft Blobs with Clear Borders", rating: "low fiber transit", desc: "Soft blobs with clean-cut edges. Suggests faster transit, potentially lacking dietary structure.", color: "text-blue-500 bg-blue-50 border-blue-200" },
  { type: 6, name: "Mushy Stool with Ragged Edges", rating: "mild diarrhea", desc: "Mushy, fluffy pieces with ragged, torn borders. Indicates mild inflammation or rapid intestinal transit.", color: "text-amber-700 bg-amber-50 border-amber-200" },
  { type: 7, name: "Watery, No Solid Pieces", rating: "severe diarrhea", desc: "Entirely liquid, watery stool. Signals high inflammation, potential infection, or severe irritation.", color: "text-red-700 bg-red-50 border-red-200" }
];

const DEFAULT_LOGS = [
  { 
    id: "1", 
    food: "Steel-cut oatmeal with fresh blueberries, ground chia seeds, and organic honey", 
    fats: 6, 
    carbs: 45, 
    protein: 10, 
    vitamins: "Iron, Vitamin B1, Magnesium", 
    fiber: 12, 
    prebiotics: "Beta-glucan, Mucilage", 
    probiotics: "None", 
    score: 95, 
    timestamp: new Date().toISOString()
  },
  { 
    id: "2", 
    food: "Sourdough bread toast with mashed avocado, pumpkin seeds, and fermented kimchi", 
    fats: 14, 
    carbs: 32, 
    protein: 9, 
    vitamins: "Vitamin K, Folate, Zinc", 
    fiber: 8, 
    prebiotics: "Inulin, Resistant starch", 
    probiotics: "Lactobacillus, Leuconostoc", 
    score: 90, 
    timestamp: new Date().toISOString()
  },
  { 
    id: "3", 
    food: "Wild-caught salmon salad with steamed asparagus, artichoke hearts, spinach, and extra virgin olive oil", 
    fats: 22, 
    carbs: 12, 
    protein: 34, 
    vitamins: "Vitamin D, Vitamin B12, Potassium", 
    fiber: 10, 
    prebiotics: "Inulin, FOS", 
    probiotics: "None", 
    score: 88, 
    timestamp: new Date(Date.now() - 86400000).toISOString()
  }
];

const MICROBES_INFO = [
  { name: "Bifidobacteria", category: "Good", desc: "Thrives on prebiotic starches and fibers (oats, onions, bananas). Key for producing anti-inflammatory acetate.", color: "#10b981" },
  { name: "Lactobacillus", category: "Good", desc: "Common in fermented foods (yogurt, kefir, sauerkraut). Produces lactic acid, maintaining an acidic barrier against pathogens.", color: "#3b82f6" },
  { name: "Akkermansia", category: "Good", desc: "Feeds on your natural mucus layer, encouraging gut lining regeneration. Boosted by polyphenols like green tea and berries.", color: "#6366f1" },
  { name: "Sugar-Feeders", category: "Opportunistic", desc: "Thrive on ultra-processed sweets and refined flour. High populations can crowd out good microbes and trigger bloating.", color: "#f59e0b" }
];

const SECURITY_QUESTIONS = [
  "What is your favorite gut-friendly prebiotic food?",
  "What was the name of your first childhood pet?",
  "In what city or town were you born?",
  "What was the brand of your first vehicle?",
  "What is your mother's maiden name?"
];

const getLocalDateString = (dateObjOrIsoString) => {
  const d = new Date(dateObjOrIsoString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const mergeDateWithCurrentTime = (dateStr) => {
  const now = new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  const localDate = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds());
  return localDate.toISOString();
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('mybiome_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authMode, setAuthMode] = useState('login'); 
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authSecurityQuestion, setAuthSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [authSecurityAnswer, setAuthSecurityAnswer] = useState('');
  const [authAgreed, setAuthAgreed] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);

  const [recoveredQuestion, setRecoveredQuestion] = useState('');
  const [recoveryAnswerAttempt, setRecoveryAnswerAttempt] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryStep, setRecoveryStep] = useState(1); 

  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncPinCode, setSyncPinCode] = useState('');
  const [syncCodeToRetrieve, setSyncCodeToRetrieve] = useState('');
  const [manualBackupString, setManualBackupString] = useState('');
  const [manualImportString, setManualImportString] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem("mybiome_api_key") || "");
  const [showSettings, setShowSettings] = useState(false);

  const [foodLogs, setFoodLogs] = useState(DEFAULT_LOGS);
  const [symptomLogs, setSymptomLogs] = useState([]);

  const [selectedFoodDateStr, setSelectedFoodDateStr] = useState(() => getLocalDateString(new Date()));

  const [stoolTimestamp, setStoolTimestamp] = useState(() => new Date().toISOString().slice(0, 16));
  const [stoolNotes, setStoolNotes] = useState('');

  const [bloatingTimestamp, setBloatingTimestamp] = useState(() => new Date().toISOString().slice(0, 16));
  const [bloatingNotes, setBloatingNotes] = useState('');

  const [energyTimestamp, setEnergyTimestamp] = useState(() => new Date().toISOString().slice(0, 16));
  const [energyNotes, setEnergyNotes] = useState('');

  const [sleepTimestamp, setSleepTimestamp] = useState(() => new Date().toISOString().slice(0, 16));
  const [sleepNotes, setSleepNotes] = useState('');

  const [stressTimestamp, setStressTimestamp] = useState(() => new Date().toISOString().slice(0, 16));
  const [stressNotes, setStressNotes] = useState('');

  const [waterIntake, setWaterIntake] = useState(4); 
  const [bloatingLevel, setBloatingLevel] = useState(2); 
  const [energyLevel, setEnergyLevel] = useState(4); 
  const [stoolType, setStoolType] = useState(4); 
  const [sleepHours, setSleepHours] = useState(7.5);
  const [stressLevel, setStressLevel] = useState(2); 
  const [aiReport, setAiReport] = useState(null);

  const [foodInput, setFoodInput] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null); 
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const canvasRef = useRef(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getDatabase = () => {
    const db = localStorage.getItem('mybiome_user_database');
    return db ? JSON.parse(db) : {};
  };

  useEffect(() => {
    if (currentUser) {
      const db = getDatabase();
      if (db[currentUser.email]) {
        db[currentUser.email] = {
          ...db[currentUser.email],
          foodLogs,
          symptomLogs, 
          waterIntake,
          bloatingLevel,
          energyLevel,
          stoolType,
          sleepHours,
          stressLevel,
          aiReport
        };
        localStorage.setItem('mybiome_user_database', JSON.stringify(db));
      }
    }
  }, [currentUser, foodLogs, symptomLogs, waterIntake, bloatingLevel, energyLevel, stoolType, sleepHours, stressLevel, aiReport]);

  const loadUserData = (email) => {
    const db = getDatabase();
    const userData = db[email];
    if (userData) {
      setFoodLogs(userData.foodLogs || []);
      setSymptomLogs(userData.symptomLogs || []); 
      setWaterIntake(userData.waterIntake ?? 4);
      setBloatingLevel(userData.bloatingLevel ?? 2);
      setEnergyLevel(userData.energyLevel ?? 4);
      setStoolType(userData.stoolType ?? 4);
      setSleepHours(userData.sleepHours ?? 7.5);
      setStressLevel(userData.stressLevel ?? 2);
      setAiReport(userData.aiReport || null);
    } else {
      setFoodLogs(DEFAULT_LOGS);
      setSymptomLogs([]);
      setWaterIntake(4);
      setBloatingLevel(2);
      setEnergyLevel(4);
      setStoolType(4);
      setSleepHours(7.5);
      setStressLevel(2);
      setAiReport(null);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword || !authName || !authSecurityAnswer) {
      showNotification('Please fill in all fields including the Security Question!');
      return;
    }
    if (!authAgreed) {
      showNotification('You must read and accept the Medical Disclaimer & Terms of Service to sign up!');
      return;
    }
    const db = getDatabase();
    if (db[authEmail]) {
      showNotification('Account with this email already exists!');
      return;
    }

    db[authEmail] = {
      name: authName,
      password: authPassword, 
      securityQuestion: authSecurityQuestion,
      securityAnswer: authSecurityAnswer.trim().toLowerCase(),
      foodLogs: DEFAULT_LOGS,
      symptomLogs: [],
      waterIntake: 4,
      bloatingLevel: 2,
      energyLevel: 4,
      stoolType: 4,
      sleepHours: 7.5,
      stressLevel: 2,
      aiReport: null
    };
    localStorage.setItem('mybiome_user_database', JSON.stringify(db));
    
    const userObj = { email: authEmail, name: authName };
    setCurrentUser(userObj);
    localStorage.setItem('mybiome_current_user', JSON.stringify(userObj));
    loadUserData(authEmail);
    setShowAuthModal(false);
    clearAuthFields();
    showNotification(`Welcome, ${authName}! Account created successfully.`);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      showNotification('Please enter email and password!');
      return;
    }
    const db = getDatabase();
    const userRecord = db[authEmail];
    if (!userRecord || userRecord.password !== authPassword) {
      showNotification('Invalid email or password!');
      return;
    }

    const userObj = { email: authEmail, name: userRecord.name };
    setCurrentUser(userObj);
    localStorage.setItem('mybiome_current_user', JSON.stringify(userObj));
    loadUserData(authEmail);
    setShowAuthModal(false);
    clearAuthFields();
    showNotification(`Welcome back, ${userRecord.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mybiome_current_user');
    setFoodLogs(DEFAULT_LOGS);
    setSymptomLogs([]);
    setWaterIntake(4);
    setBloatingLevel(2);
    setEnergyLevel(4);
    setStoolType(4);
    setSleepHours(7.5);
    setStressLevel(2);
    setAiReport(null);
    showNotification('Logged out successfully.');
  };

  const clearAuthFields = () => {
    setAuthEmail('');
    setAuthPassword('');
    setAuthName('');
    setAuthSecurityAnswer('');
    setAuthAgreed(false);
    setRecoveryEmail('');
    setRecoveryAnswerAttempt('');
    setNewPassword('');
    setRecoveryStep(1);
  };

  const handleInitiateRecovery = (e) => {
    e.preventDefault();
    if (!recoveryEmail) {
      showNotification('Please enter your registration email.');
      return;
    }
    const db = getDatabase();
    const record = db[recoveryEmail];
    if (!record) {
      showNotification('No registered user found with that email.');
      return;
    }
    
    setRecoveredQuestion(record.securityQuestion || "What is your favorite gut-friendly prebiotic food?");
    setRecoveryStep(2);
    showNotification('User found. Please answer your recovery question.');
  };

  const handleCompleteRecovery = (e) => {
    e.preventDefault();
    if (!recoveryAnswerAttempt || !newPassword) {
      showNotification('Please fill out all fields.');
      return;
    }
    const db = getDatabase();
    const record = db[recoveryEmail];
    
    if (!record) {
      showNotification('Error during recovery session. Please try again.');
      return;
    }

    const savedAnswer = record.securityAnswer || "";
    if (savedAnswer.trim().toLowerCase() !== recoveryAnswerAttempt.trim().toLowerCase()) {
      showNotification('Incorrect security answer! Access denied.');
      return;
    }

    db[recoveryEmail] = {
      ...record,
      password: newPassword
    };
    localStorage.setItem('mybiome_user_database', JSON.stringify(db));
    showNotification('Password successfully reset! Please sign in with your new password.');
    setAuthMode('login');
    clearAuthFields();
  };

  const handleGenerateCloudSync = async () => {
    setIsSyncing(true);
    try {
      const db = getDatabase();
      const payloadString = JSON.stringify(db);
      
      const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let pin = '';
      for (let i = 0; i < 6; i++) {
        pin += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
      }

      const response = await fetch(`https://kvdb.io/t9D3h8Fv5Xk8N2/sync_${pin}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: payloadString
      });

      if (!response.ok) throw new Error('Cloud vault connection rejected.');

      setSyncPinCode(pin);
      
      const encoded = btoa(unescape(encodeURIComponent(payloadString)));
      setManualBackupString(encoded);
      showNotification(`Cloud sync generated! PIN: ${pin}`);
    } catch (err) {
      console.error(err);
      const db = getDatabase();
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(db))));
      setManualBackupString(encoded);
      showNotification('Cloud service blocked. Copy the Manual Backup Code instead!');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRetrieveCloudSync = async () => {
    if (!syncCodeToRetrieve.trim()) {
      showNotification('Please enter a 6-character PIN code.');
      return;
    }
    setIsSyncing(true);
    const formattedPin = syncCodeToRetrieve.trim().toUpperCase();

    try {
      const response = await fetch(`https://kvdb.io/t9D3h8Fv5Xk8N2/sync_${formattedPin}`);
      if (!response.ok) {
        throw new Error('Sync PIN not found or expired.');
      }
      
      const importedDb = await response.json();
      if (typeof importedDb !== 'object' || Array.isArray(importedDb)) {
        throw new Error('Invalid database format.');
      }

      const localDb = getDatabase();
      const mergedDb = { ...localDb, ...importedDb };
      localStorage.setItem('mybiome_user_database', JSON.stringify(mergedDb));

      showNotification('Success! All accounts successfully imported & synced!');
      setSyncCodeToRetrieve('');
      setShowSyncModal(false);
      
      if (currentUser && mergedDb[currentUser.email]) {
        loadUserData(currentUser.email);
      }
    } catch (err) {
      console.error(err);
      showNotification('Error: Unable to find or verify PIN. Check code or use manual fallback.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualImport = () => {
    if (!manualImportString.trim()) {
      showNotification('Please paste a backup code.');
      return;
    }
    try {
      const decodedString = decodeURIComponent(escape(atob(manualImportString.trim())));
      const parsedDb = JSON.parse(decodedString);
      
      const localDb = getDatabase();
      const mergedDb = { ...localDb, ...parsedDb };
      localStorage.setItem('mybiome_user_database', JSON.stringify(mergedDb));

      showNotification('Success! Profiles imported manually successfully!');
      setManualImportString('');
      setShowSyncModal(false);
      
      if (currentUser && mergedDb[currentUser.email]) {
        loadUserData(currentUser.email);
      }
    } catch (err) {
      console.error(err);
      showNotification('Invalid backup code. Please ensure you copied the entire string correctly.');
    }
  };

  const handleAddSymptomLog = (type, value, timestamp, notes, clearNotesFn) => {
    const newLog = {
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
      type,
      value,
      timestamp: new Date(timestamp).toISOString(),
      notes: notes.trim()
    };

    const updatedLogs = [newLog, ...symptomLogs];
    setSymptomLogs(updatedLogs);

    const logsOfType = updatedLogs.filter(log => log.type === type);
    const sortedLogs = [...logsOfType].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    if (sortedLogs[0]?.id === newLog.id) {
      if (type === 'stool') setStoolType(value);
      if (type === 'bloating') setBloatingLevel(value);
      if (type === 'energy') setEnergyLevel(value);
      if (type === 'sleep') setSleepHours(value);
      if (type === 'stress') setStressLevel(value);
      if (type === 'water') setWaterIntake(value);
    }

    showNotification(`Logged ${type} metric successfully!`);
    if (clearNotesFn) clearNotesFn('');
  };

  const handleDeleteSymptomLog = (id) => {
    const updatedLogs = symptomLogs.filter(log => log.id !== id);
    setSymptomLogs(updatedLogs);
    showNotification('Symptom entry removed.');

    ['stool', 'bloating', 'energy', 'sleep', 'stress', 'water'].forEach(type => {
      const logsOfType = updatedLogs.filter(log => log.type === type);
      if (logsOfType.length > 0) {
        const sorted = [...logsOfType].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const latestVal = sorted[0].value;
        if (type === 'stool') setStoolType(latestVal);
        if (type === 'bloating') setBloatingLevel(latestVal);
        if (type === 'energy') setEnergyLevel(latestVal);
        if (type === 'sleep') setSleepHours(latestVal);
        if (type === 'stress') setStressLevel(latestVal);
        if (type === 'water') setWaterIntake(latestVal);
      }
    });
  };

  const handleSubmitDashboardMetrics = () => {
    const autoTimestamp = new Date().toISOString();
    
    const waterLog = {
      id: 'qs-water-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      type: 'water',
      value: waterIntake,
      timestamp: autoTimestamp,
      notes: 'Submitted via Quick Stats Panel'
    };
    
    const bloatingLog = {
      id: 'qs-bloat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      type: 'bloating',
      value: bloatingLevel,
      timestamp: autoTimestamp,
      notes: 'Submitted via Quick Stats Panel'
    };
    
    const stressLog = {
      id: 'qs-stress-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      type: 'stress',
      value: stressLevel,
      timestamp: autoTimestamp,
      notes: 'Submitted via Quick Stats Panel'
    };

    const updatedLogs = [waterLog, bloatingLog, stressLog, ...symptomLogs];
    setSymptomLogs(updatedLogs);
    showNotification('Dashboard metrics compiled & synchronized with timeline logs!');
  };

  const saveApiKey = (e) => {
    e.preventDefault();
    localStorage.setItem("mybiome_api_key", customApiKey);
    setShowSettings(false);
    showNotification("Gemini API key successfully saved!");
  };

  const activeDayFoodLogs = foodLogs.filter(log => getLocalDateString(log.timestamp) === selectedFoodDateStr);

  const calculateWellBeingScore = () => {
    let score = 75; 

    const totalFiberLogged = activeDayFoodLogs.reduce((acc, log) => acc + log.fiber, 0);
    score += Math.min(totalFiberLogged * 1.5, 15);

    if (stoolType === 3 || stoolType === 4) {
      score += 10;
    } else if (stoolType === 1 || stoolType === 7) {
      score -= 15;
    } else {
      score -= 5;
    }

    score -= (bloatingLevel - 1) * 3;
    score += (energyLevel - 3) * 3;
    score -= (stressLevel - 2) * 2;
    score += Math.min(waterIntake * 1.5, 10);

    return Math.max(15, Math.min(score, 100)); 
  };

  const scoreValue = calculateWellBeingScore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const calculateMicrobeSettings = () => {
      const fiberScore = activeDayFoodLogs.reduce((acc, log) => acc + log.fiber, 0);
      const isPerfectStool = stoolType === 3 || stoolType === 4;

      const bifidoCount = Math.max(5, Math.min(25, 5 + fiberScore + (isPerfectStool ? 5 : 0)));
      const lactoCount = Math.max(5, Math.min(25, 6 + (waterIntake * 2)));
      const akkerCount = Math.max(3, Math.min(20, 3 + (energyLevel * 2.5) - bloatingLevel));
      const sugarCount = Math.max(2, Math.min(30, 2 + (stressLevel * 4) + (bloatingLevel * 2) - Math.floor(fiberScore / 3)));

      return { bifidoCount, lactoCount, akkerCount, sugarCount };
    };

    const populations = calculateMicrobeSettings();

    class Microbe {
      constructor(type, color, radius) {
        this.type = type;
        this.color = color;
        this.radius = radius;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.wigglePhase = Math.random() * Math.PI * 2;
        this.wiggleSpeed = 0.02 + Math.random() * 0.03;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        this.wigglePhase += this.wiggleSpeed;
        this.x += Math.sin(this.wigglePhase) * 0.15;
        this.y += Math.cos(this.wigglePhase) * 0.15;

        if (this.x < this.radius || this.x > canvas.width - this.radius) {
          this.vx *= -1;
          this.x = Math.max(this.radius, Math.min(this.x, canvas.width - this.radius));
        }
        if (this.y < this.radius || this.y > canvas.height - this.radius) {
          this.vy *= -1;
          this.y = Math.max(this.radius, Math.min(this.y, canvas.height - this.radius));
        }
      }

      draw() {
        ctx.beginPath();
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;

        if (this.type === "Bifidobacteria") {
          ctx.strokeStyle = this.color;
          ctx.lineWidth = 4;
          ctx.lineCap = "round";
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x, this.y - this.radius);
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x - this.radius * 0.7, this.y + this.radius * 0.7);
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x + this.radius * 0.7, this.y + this.radius * 0.7);
          ctx.stroke();
        } else if (this.type === "Lactobacillus") {
          ctx.fillStyle = this.color;
          ctx.save();
          ctx.translate(this.x, this.y);
          const angle = Math.atan2(this.vy, this.vx);
          ctx.rotate(angle);
          ctx.roundRect(-this.radius * 1.5, -this.radius * 0.6, this.radius * 3, this.radius * 1.2, this.radius * 0.6);
          ctx.fill();
          ctx.restore();
        } else if (this.type === "Akkermansia") {
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.ellipse(this.x, this.y, this.radius * 1.4, this.radius * 0.9, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = this.color;
          const spikes = 8;
          const outerRad = this.radius * 1.2;
          const innerRad = this.radius * 0.6;
          let rot = (Math.PI / 2) * 3;
          let cx = this.x;
          let cy = this.y;
          let step = Math.PI / spikes;

          ctx.beginPath();
          ctx.moveTo(cx, cy - outerRad);
          for (let i = 0; i < spikes; i++) {
            let sx = cx + Math.cos(rot) * outerRad;
            let sy = cy + Math.sin(rot) * outerRad;
            ctx.lineTo(sx, sy);
            rot += step;

            sx = cx + Math.cos(rot) * innerRad;
            sy = cy + Math.sin(rot) * innerRad;
            ctx.lineTo(sx, sy);
            rot += step;
          }
          ctx.lineTo(cx, cy - outerRad);
          ctx.closePath();
          ctx.fill();
        }

        ctx.shadowBlur = 0; 
      }
    }

    const microbes = [];

    for (let i = 0; i < populations.bifidoCount; i++) {
      microbes.push(new Microbe("Bifidobacteria", "#10b981", 6 + Math.random() * 4));
    }
    for (let i = 0; i < populations.lactoCount; i++) {
      microbes.push(new Microbe("Lactobacillus", "#06b6d4", 5 + Math.random() * 4));
    }
    for (let i = 0; i < populations.akkerCount; i++) {
      microbes.push(new Microbe("Akkermansia", "#8b5cf6", 4 + Math.random() * 3));
    }
    for (let i = 0; i < populations.sugarCount; i++) {
      microbes.push(new Microbe("SugarFeeders", "#f59e0b", 6 + Math.random() * 3));
    }

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      microbes.forEach((microbe) => {
        microbe.update();
        microbe.draw();
      });
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [foodLogs, stoolType, bloatingLevel, energyLevel, stressLevel, waterIntake, activeTab, selectedFoodDateStr]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1];
      setSelectedPhoto({
        base64: base64String,
        mimeType: file.type,
        previewUrl: URL.createObjectURL(file)
      });
      showNotification("Photo ready for molecular analysis!");
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeFood = async () => {
    if (!foodInput.trim() && !selectedPhoto) {
      showNotification("Please enter food details or select/take a photo to analyze!");
      return;
    }

    const activeKey = customApiKey || import.meta.env.VITE_GEMINI_API_KEY;

    if (!activeKey) {
      showNotification("Missing Gemini API Key! Please enter one using the Settings gear in the header.");
      setShowSettings(true);
      return;
    }

    setIsAnalyzing(true);
    try {
      const textPrompt = `You are a molecular gut microbiome specialist and clinical nutritionist. 
Analyze this custom food logging description${selectedPhoto ? " and the attached food photo" : ""}: "${foodInput || "No description provided, analyze from the photo directly."}". 
Provide a strictly formatted JSON output containing:
{
  "foodName": "Short descriptive simplified name of food logged",
  "fats": "estimated fats in numerical grams only",
  "carbs": "estimated carbohydrates in numerical grams only",
  "protein": "estimated protein in numerical grams only",
  "vitamins": "list of prominent vitamins and minerals found in this food (e.g. Vitamin C, Potassium, Magnesium, Zinc, Iron, B-Vitamins)",
  "fiber": "estimated fiber amount in numerical grams only",
  "prebiotics": "names of prebiotics present (e.g. Inulin, FOS, Resistant Starch) or 'None'",
  "probiotics": "names of active live bacteria strains (e.g. Lactobacillus bulgaricus, Bifidobacterium lactis) or 'None'",
  "score": "estimated dynamic microbiome health score out of 100 based on plant diversity, prebiotic presence, lack of ultra-processing"
}
Do not return any conversational introductory text, only the raw JSON.`;

      const parts = [{ text: textPrompt }];
      if (selectedPhoto) {
        parts.push({
          inlineData: {
            mimeType: selectedPhoto.mimeType,
            data: selectedPhoto.base64
          }
        });
      }

      const response = await fetch(
        `https://generativelink.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts }] })
        }
      );

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      const newLog = {
        id: Date.now().toString(),
        food: parsed.foodName || foodInput || "Analyzed Photo Plate",
        fats: parseInt(parsed.fats) || 4,
        carbs: parseInt(parsed.carbs) || 12,
        protein: parseInt(parsed.protein) || 6,
        vitamins: parsed.vitamins || "None",
        fiber: parseInt(parsed.fiber) || 2,
        prebiotics: parsed.prebiotics || "Unknown",
        probiotics: parsed.probiotics || "None",
        score: parseInt(parsed.score) || 60,
        timestamp: mergeDateWithCurrentTime(selectedFoodDateStr) 
      };

      setFoodLogs([newLog, ...foodLogs]);
      setFoodInput("");
      setSelectedPhoto(null);
      showNotification("Food successfully analyzed & added to microbiome timeline!");
    } catch (err) {
      console.error(err);
      showNotification("Error parsing food with Gemini. Added entry manually as default.");
      const fallbackLog = {
        id: Date.now().toString(),
        food: foodInput || "Manual Meal Upload",
        fats: 5,
        carbs: 15,
        protein: 5,
        vitamins: "Vitamin C, Magnesium",
        fiber: 3,
        prebiotics: "Insoluble fiber",
        probiotics: "None",
        score: 65,
        timestamp: mergeDateWithCurrentTime(selectedFoodDateStr)
      };
      setFoodLogs([fallbackLog, ...foodLogs]);
      setFoodInput("");
      setSelectedPhoto(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateAdvisorReport = async () => {
    const activeKey = customApiKey || import.meta.env.VITE_GEMINI_API_KEY;

    if (!activeKey) {
      showNotification("Missing Gemini API Key! Enter it via the gear icon.");
      setShowSettings(true);
      return;
    }

    setIsAnalyzing(true);
    try {
      const recentFoodsList = activeDayFoodLogs.map(l => `${l.food} (Macros - C:${l.carbs}g, P:${l.protein}g, F:${l.fats}g, Fiber: ${l.fiber}g, Prebiotics: ${l.prebiotics})`).join(", ");
      
      const prompt = `You are the MyBiome Chief AI Microbiome Advisor. Synthesize an ultimate personalized gut flora report based on this bio-profile:
- Selected Date Context: ${selectedFoodDateStr}
- Stool Type: Bristol Stool Form Type ${stoolType}
- Water Intake: ${waterIntake} Liters/day
- Stress Level: ${stressLevel}/5
- Bloating Rating: ${bloatingLevel}/5
- Recent Meals Logged on this day: [${recentFoodsList}]
- Sleep quality: ${sleepHours} hours

Generate a structured feedback report containing:
1. "predictedMicrobialBalance": Which good bacteria strains are thriving or struggling, and whether opportunistic sugar-feeders are elevated. Include macronutrient impacts (fats, carbs, proteins) on microbial populations.
2. "nutritionalDeficiencies": What vital prebiotic carbohydrates, plant polyphenols, and micronutrients/vitamins are currently missing or low in this profile.
3. "digestiveVagusInsights": How their logged stress level and sleep hours are biochemically interacting with their gut motility and bloating via the gut-brain vagus pathway.
4. "targetedFoodsToIntroduce": List 4 highly specific functional foods (like raw chicory, black tea polyphenols, or Jerusalem artichoke) to restore homeostasis.
5. "personalizedGutHealerRecipe": Provide a custom fast-preparation microbiome-building recipe tailored directly to address their symptoms (bloating, stool consistency, or high stress). Include dynamic pre/probiotic pairings.

Format the output cleanly in normal conversational paragraphs with distinct headings. Don't use markdown headers (like # or ##) inside the blocks, keep the sections separate and beautifully styled.`;

      const response = await fetch(
        `https://generativelink.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${activeKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );

      const data = await response.json();
      const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to retrieve advisor data at this time.";
      setAiReport(outputText);
      showNotification("New MyBiome Advisor Analysis synthesized successfully!");
    } catch (err) {
      console.error(err);
      setAiReport("Unable to synthesize AI report. Check your Gemini API Key parameters or network connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePrevDay = () => {
    const d = new Date(selectedFoodDateStr + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    setSelectedFoodDateStr(getLocalDateString(d));
  };

  const handleNextDay = () => {
    const d = new Date(selectedFoodDateStr + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    setSelectedFoodDateStr(getLocalDateString(d));
  };

  const handleJumpToToday = () => {
    setSelectedFoodDateStr(getLocalDateString(new Date()));
  };

  const getDayLabel = () => {
    const todayStr = getLocalDateString(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    if (selectedFoodDateStr === todayStr) return "Today";
    if (selectedFoodDateStr === yesterdayStr) return "Yesterday";

    const dateOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(selectedFoodDateStr + 'T00:00:00').toLocaleDateString([], dateOptions);
  };

  const dailyTotals = activeDayFoodLogs.reduce((acc, log) => ({
    fiber: acc.fiber + log.fiber,
    fats: acc.fats + log.fats,
    carbs: acc.carbs + log.carbs,
    protein: acc.protein + log.protein,
    scoreCount: acc.scoreCount + 1,
    scoreSum: acc.scoreSum + log.score
  }), { fiber: 0, fats: 0, carbs: 0, protein: 0, scoreCount: 0, scoreSum: 0 });

  const averageDailyScore = dailyTotals.scoreCount > 0 ? Math.round(dailyTotals.scoreSum / dailyTotals.scoreCount) : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-800 text-white text-xs font-semibold px-4.5 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-2.5 transition animate-fade-in animate-bounce">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
          {toastMessage}
        </div>
      )}

      {/* Primary header navbar navigation */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-emerald-950 rounded-2xl flex items-center justify-center text-emerald-400 shadow-md">
              <Sparkles className="h-5.5 w-5.5" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-950 uppercase tracking-widest leading-none flex items-center gap-1.5">
                MyBiome <span className="text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-normal">AI v5</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Molecular Gut Ecology & Sync Bridge</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-100/80 rounded-2xl p-1 pr-3 border border-slate-200">
                <div className="h-7 w-7 bg-emerald-950 text-emerald-400 rounded-xl flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                  {currentUser.name[0]}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[10px] font-bold text-slate-800 leading-none">{currentUser.name}</p>
                  <p className="text-[8px] text-slate-400 leading-none mt-0.5">{currentUser.email}</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowSyncModal(true)}
                  className="text-emerald-700 hover:text-emerald-900 transition p-1 hover:bg-white rounded-lg ml-1"
                  title="Mobile Sync & Backup Settings"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
                <button 
                  type="button"
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-500 transition p-1 hover:bg-white rounded-lg ml-0.5"
                  title="Log Out Account"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSyncModal(true)}
                  className="text-slate-500 hover:text-slate-900 text-xs p-2 rounded-xl bg-slate-100/80 border border-slate-200 transition flex items-center gap-1"
                  title="Sync or Restore Account from Desktop"
                >
                  <Smartphone className="h-4 w-4" /> <span className="hidden md:inline">Sync Phone</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                  className="bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <User className="h-3.5 w-3.5" /> Sign In / Join
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 transition flex items-center justify-center"
              title="API Key Configuration"
            >
              <Settings className="h-4 w-4" />
            </button>

            <div className="hidden md:flex items-center gap-2.5 bg-slate-950 text-white rounded-2xl p-2 px-3 border border-slate-800 shadow-md">
              <div className="text-right">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">MyBiome Day Score</p>
                <p className="text-xs font-bold text-slate-100 leading-none mt-1">Score Tracker</p>
              </div>
              <span className="text-sm font-black text-emerald-400 font-mono">
                {scoreValue}
              </span>
            </div>

          </div>
        </div>
      </header>

      {/* Authentication and multi-user profile login modals */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6.5 max-w-md w-full border border-slate-100 shadow-2xl relative animate-fade-in">
            <button
              type="button"
              onClick={() => {
                setShowAuthModal(false);
                clearAuthFields();
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-950 p-1 rounded-xl hover:bg-slate-50 transition"
            >
              <X className="h-5 w-5" />
            </button>

            {authMode === 'login' && (
              <>
                <div className="mb-5 text-center">
                  <div className="h-10 w-10 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Database className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-950">Access your MyBiome Profile</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Sign in to access your logs, custom timeline records, and personalized AI advisor data.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g., alex@guthealth.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="block text-[10px] text-slate-400 font-bold uppercase">Password</label>
                      <button 
                        type="button" 
                        onClick={() => setAuthMode('forgot_password')} 
                        className="text-[10px] text-emerald-700 font-bold hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold py-3.5 rounded-xl transition shadow mt-1.5"
                  >
                    Sign In to Profile
                  </button>
                </form>

                <div className="mt-5 text-center border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-500">
                    Don't have an account yet?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        clearAuthFields();
                      }}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      Sign Up
                    </button>
                  </p>
                </div>
              </>
            )}

            {authMode === 'signup' && (
              <>
                <div className="mb-5 text-center">
                  <div className="h-10 w-10 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-950">Create MyBiome Account</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Set up a secure profile with custom security backup recovery questions.
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Alex Johnson"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g., alex@guthealth.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  
                  <div className="border-t border-slate-100 pt-3 space-y-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                      <KeyRound className="h-3.5 w-3.5 text-emerald-800" /> Security Question (For Password Reset)
                    </p>
                    <div>
                      <select
                        value={authSecurityQuestion}
                        onChange={(e) => setAuthSecurityQuestion(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                      >
                        {SECURITY_QUESTIONS.map((q, idx) => (
                          <option key={idx} value={q}>{q}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Type recovery answer here..."
                        value={authSecurityAnswer}
                        onChange={(e) => setAuthSecurityAnswer(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Mandatory Medical Disclaimer Checkbox */}
                  <div className="flex items-start gap-2.5 pt-2 border-t border-slate-100">
                    <input
                      type="checkbox"
                      id="disclaimer-agreement"
                      checked={authAgreed}
                      onChange={(e) => setAuthAgreed(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                    />
                    <label htmlFor="disclaimer-agreement" className="text-[10.5px] text-slate-500 leading-normal font-medium cursor-pointer">
                      I agree to the <button type="button" onClick={() => setShowDisclaimerModal(true)} className="text-emerald-700 font-bold underline hover:text-emerald-800">Medical Disclaimer & Terms of Service</button>. I understand that MyBiome is not a clinical medical device.
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold py-3.5 rounded-xl transition shadow mt-1.5"
                  >
                    Register Account
                  </button>
                </form>

                <div className="mt-5 text-center border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-500">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        clearAuthFields();
                      }}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      Log In
                    </button>
                  </p>
                </div>
              </>
            )}

            {authMode === 'forgot_password' && (
              <>
                <div className="mb-5 text-center">
                  <div className="h-10 w-10 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-950">Password Recovery</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Reset your password by answering the security question chosen during signup.
                  </p>
                </div>

                {recoveryStep === 1 ? (
                  <form onSubmit={handleInitiateRecovery} className="space-y-4">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Enter registered email address</label>
                      <input
                        type="email"
                        required
                        placeholder="alex@guthealth.com"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold py-3.5 rounded-xl transition shadow"
                    >
                      Verify Email
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleCompleteRecovery} className="space-y-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                      <p className="text-slate-400 font-bold uppercase text-[9px] mb-1">Your Security Question:</p>
                      <p className="font-extrabold text-slate-800">{recoveredQuestion}</p>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Your Answer</label>
                      <input
                        type="text"
                        required
                        placeholder="Answer answer..."
                        value={recoveryAnswerAttempt}
                        onChange={(e) => setRecoveryAnswerAttempt(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Set New Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setRecoveryStep(1)}
                        className="flex-1 border border-slate-200 text-slate-500 text-xs font-bold py-3.5 rounded-xl hover:bg-slate-50 transition"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3.5 rounded-xl transition shadow"
                      >
                        Reset Password
                      </button>
                    </div>
                  </form>
                )}

                <div className="mt-5 text-center border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-500">
                    Remember your password?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        clearAuthFields();
                      }}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* Cloud devices database synchronization modal dialog */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6.5 max-w-lg w-full border border-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-fade-in">
            <button
              type="button"
              onClick={() => {
                setShowSyncModal(false);
                setSyncPinCode('');
                setSyncCodeToRetrieve('');
                setManualBackupString('');
                setManualImportString('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-950 p-1 rounded-xl hover:bg-slate-50 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-1.5">
                <Smartphone className="h-5.5 w-5.5 text-emerald-800" /> Device Sync & Mobile Pairing
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Because your accounts are saved inside your device's browser local storage, use this Cloud Sync Bridge to safely copy and sync your profiles over to your phone!
              </p>
            </div>

            <div className="space-y-6">
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-emerald-700" /> 1. Send data from Desktop (Source)
                  </h4>
                  <p className="text-[10.5px] text-slate-500 leading-normal mt-0.5">
                    Click below to secure and upload your database payload. You will receive a 6-character PIN code.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handleGenerateCloudSync}
                  className="bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold py-2 px-4 rounded-xl transition flex items-center justify-center gap-1.5 shadow"
                >
                  {isSyncing ? "Creating Cloud Tunnel..." : "Upload & Generate Sync PIN"}
                </button>

                {syncPinCode && (
                  <div className="bg-white p-3.5 rounded-xl border border-emerald-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[9px] font-bold text-emerald-800 uppercase block tracking-wider">Your Pairing PIN:</span>
                      <span className="text-xl font-mono font-black text-slate-950 tracking-widest">{syncPinCode}</span>
                    </div>
                    <div className="text-right max-w-[200px]">
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Type this 6-character PIN code on your phone browser/app to pair! (Expires in 3 months).
                      </p>
                    </div>
                  </div>
                )}

                {manualBackupString && (
                  <div className="space-y-1.5 pt-1.5 border-t border-slate-200">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase">Or Copy Backup Code manually:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={manualBackupString}
                        className="flex-1 text-[9px] p-2 rounded-lg border border-slate-200 bg-white select-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(manualBackupString);
                          showNotification("Backup code copied to clipboard!");
                        }}
                        className="bg-white hover:bg-slate-50 border border-slate-200 p-2 rounded-lg transition"
                        title="Copy to clipboard"
                      >
                        <Copy className="h-3.5 w-3.5 text-slate-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <RefreshCw className="h-4 w-4 text-emerald-700" /> 2. Receive data on Phone (Target)
                  </h4>
                  <p className="text-[10.5px] text-slate-500 leading-normal mt-0.5">
                    Type in the 6-character PIN code generated on your desktop screen below to sync your database.
                  </p>
                </div>

                <div className="flex gap-2 max-w-sm">
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="e.g., G8X3P1"
                    value={syncCodeToRetrieve}
                    onChange={(e) => setSyncCodeToRetrieve(e.target.value)}
                    className="flex-1 text-xs p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono uppercase tracking-widest text-center"
                  />
                  <button
                    type="button"
                    disabled={isSyncing}
                    onClick={handleRetrieveCloudSync}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 rounded-xl transition"
                  >
                    {isSyncing ? "Pulling..." : "Sync Devices"}
                  </button>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-200">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase">Or paste manual backup code:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste backup code here..."
                      value={manualImportString}
                      onChange={(e) => setManualImportString(e.target.value)}
                      className="flex-1 text-[10px] p-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleManualImport}
                      className="bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold px-4 rounded-xl transition"
                    >
                      Import
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed text-center">
              🔒 <strong>Privacy Guard:</strong> Your logs, credentials, and symptoms are compressed fully client-side before sending and are safely stored in temporary vaults.
            </div>

          </div>
        </div>
      )}

      {/* Settings Panel for personal API keys */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6.5 max-w-md w-full border border-slate-100 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-950 p-1 rounded-xl hover:bg-slate-50 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-5">
              <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-1.5">
                <Settings className="h-5 w-5 text-emerald-800" /> Gemini API Config
              </h3>
              <p className="text-xs text-slate-500 mt-1.5">
                The food parsing and biological gut advisory features are driven by Google Gemini's advanced models. Provide your own key below to query safely.
              </p>
            </div>

            <form onSubmit={saveApiKey} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">Personal Google Gemini API Key</label>
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
                <p className="text-[10px] text-slate-400 leading-relaxed mt-2">
                  🔑 Your keys are stored completely inside your own web browser storage (localStorage) and never touch outside analytical log servers. You can acquire a free token inside <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-semibold underline">Google AI Studio</a>.
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="flex-1 border border-slate-200 text-slate-500 text-xs font-bold py-3 rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold py-3 rounded-xl transition shadow"
                >
                  Save API Config
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Robust Medical Disclaimer & Terms of Service Modal */}
      {showDisclaimerModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl p-6.5 max-w-lg w-full border border-slate-100 shadow-2xl relative max-h-[85vh] overflow-y-auto animate-fade-in">
            <button
              type="button"
              onClick={() => setShowDisclaimerModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-950 p-1 rounded-xl hover:bg-slate-50 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-base font-black text-slate-950 flex items-center gap-1.5">
                <Info className="h-5 w-5 text-emerald-800" /> Medical Disclaimer & Terms of Service
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Please read before registering or tracking</p>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-600 font-medium pr-1">
              <p>
                <strong>1. Not Medical Advice:</strong> MyBiome is an interactive self-tracking and educational database utility. All tools, calculations (including the Microbiome Well-being Score), visualizations, educational text, and dynamically compiled Gemini AI reports are created for informational, self-discovery, and general wellness purposes only.
              </p>
              <p>
                <strong>2. No Clinical Diagnostics:</strong> This software is not a medical device (or Software as a Medical Device / SaMD) as defined by the Food and Drug Administration (FDA) or global health departments. It is not intended to diagnose, treat, cure, or prevent any clinical digestive disorder or pathology, including but not limited to Irritable Bowel Syndrome (IBS), Small Intestinal Bacterial Overgrowth (SIBO), Crohn’s Disease, Ulcerative Colitis, or chronic gut inflammation.
              </p>
              <p>
                <strong>3. AI Advisor Disclaimers:</strong> The "Deep AI Advisor Synthesis" employs automated generative large language models to estimate microbial balance and digestive responses. Artificial intelligence can make inaccurate predictions or exhibit hallucinations. Never disregard professional clinical diagnosis, alter your medication schedule, or delay seeking emergency medical treatment because of analysis read on this dashboard.
              </p>
              <p>
                <strong>4. Assumption of Risk:</strong> Any dietary modifications, pre/probiotic usage, or physical lifestyle habits initiated on the basis of suggestions provided by this application are carried out entirely at your own discretion and individual liability. You are highly encouraged to consult a licensed dietitian or physician before changing your dietary structure.
              </p>
              <p>
                <strong>5. Data Security:</strong> Your logged profiles and credentials are secure. Standard cloud transfers compress and pair devices without exposing emails or biological metrics publicly.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setAuthAgreed(true);
                setShowDisclaimerModal(false);
              }}
              className="w-full bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold py-3 rounded-xl transition shadow mt-5"
            >
              I Understand & Accept These Terms
            </button>
          </div>
        </div>
      )}

      {/* Main navigation selection headers */}
      <nav className="bg-white border-b border-slate-100 sticky top-18 z-30 shadow-sm/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-start space-x-1 py-2 overflow-x-auto scrollbar-none">
            
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex-shrink-0 ${
                activeTab === "dashboard" 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Activity className="h-4 w-4" /> MyBiome Dashboard
            </button>

            <button
              onClick={() => setActiveTab("food")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex-shrink-0 ${
                activeTab === "food" 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Plus className="h-4 w-4" /> Molecular Food Log
            </button>

            <button
              onClick={() => setActiveTab("symptoms")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex-shrink-0 ${
                activeTab === "symptoms" 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Layers className="h-4 w-4" /> Physical Symptoms
            </button>

            <button
              onClick={() => setActiveTab("education")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex-shrink-0 ${
                activeTab === "education" 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <BookOpen className="h-4 w-4" /> Gut Encyclopedia
            </button>

          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: DASHBOARD VIEW */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-120">
                <div className="z-10 bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 max-w-sm">
                  <h2 className="text-sm font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Smile className="h-5.5 w-5.5 text-emerald-700" /> Gut Flora Live Microbe Simulation
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-semibold">
                    Interactive canvas visualizing how daily nutrition, logged prebiotics, and stressors actively coordinate populations inside your colon on <strong className="text-emerald-800">{getDayLabel()}</strong>.
                  </p>
                </div>

                <div className="absolute inset-0 z-0">
                  <canvas ref={canvasRef} className="w-full h-full block bg-slate-950/2" />
                </div>

                <div className="z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-auto">
                  {MICROBES_INFO.map((microbe) => (
                    <div key={microbe.name} className="p-2.5 rounded-2xl bg-white/90 border border-slate-100 backdrop-blur-md shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: microbe.color }} />
                        <h4 className="text-[10px] font-black text-slate-900 tracking-wider uppercase">{microbe.name}</h4>
                      </div>
                      <p className="text-[8px] text-slate-500 leading-normal mt-1">{microbe.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic quick vitals summaries */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4.5">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
                  <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Dietary Fiber</h4>
                  <p className="text-xl font-black text-slate-950 font-mono mt-2.5">
                    {dailyTotals.fiber}g
                  </p>
                  <p className="text-[9px] text-slate-500 font-semibold mt-1">Goal: 30g+ daily</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
                  <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Bristol Stool</h4>
                  <p className="text-xl font-black text-slate-950 font-mono mt-2.5">
                    Type {stoolType}
                  </p>
                  <p className="text-[9px] text-slate-500 font-semibold mt-1 uppercase">
                    {stoolType === 4 || stoolType === 3 ? "Excellent" : "Imbalanced"}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
                  <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Stress Impact</h4>
                  <p className="text-xl font-black text-slate-950 font-mono mt-2.5">
                    {stressLevel}/5
                  </p>
                  <p className="text-[9px] text-slate-500 font-semibold mt-1 uppercase">
                    {stressLevel >= 4 ? "Cortisol Active" : "Sympathetic"}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
                  <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Hydration</h4>
                  <p className="text-xl font-black text-slate-950 font-mono mt-2.5">
                    {waterIntake}L
                  </p>
                  <p className="text-[9px] text-slate-500 font-semibold mt-1">Goal: 3L+ daily</p>
                </div>
              </div>

            </div>

            <div className="space-y-6">
              
              <div className="bg-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-5 w-5 text-emerald-400" /> Deep AI Advisor Synthesis
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
                    Click below to trigger our Gemini molecular specialist engine, analyzing physical symptoms, stools, prebiotics, and vagus impacts.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateAdvisorReport}
                  disabled={isAnalyzing}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-1.5 shadow"
                >
                  {isAnalyzing ? "Synthesizing Core Data..." : "Run Molecular Synthesis Report"}
                </button>

                {aiReport ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-4 max-h-110 overflow-y-auto text-[11px] leading-relaxed text-slate-300 font-medium font-sans">
                    {aiReport.split("\n\n").map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-800 rounded-2xl p-6 text-center text-[11px] text-slate-500 leading-relaxed">
                    No Advisor Analysis Synthesized Yet. Use the button above to generate molecular insights dynamically!
                  </div>
                )}
              </div>

              {/* Quick stats compiling section with automatic timestamp submit options */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-xs font-black text-slate-950 uppercase tracking-widest leading-none flex items-center gap-1.5">
                  <Calendar className="h-4.5 w-4.5 text-emerald-800" /> Quick Stats Tracking
                </h3>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  Update fast indicators here to sync with the interactive canvas instantly. Hit "Submit Dashboard Metrics" to instantly log these with an automatic current timestamp into your symptom timeline.
                </p>

                <div className="space-y-4 pt-2">
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-slate-500 uppercase">Daily Hydration</span>
                      <span className="font-bold text-slate-800">{waterIntake} Liters</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="6" 
                      step="0.5" 
                      value={waterIntake} 
                      onChange={(e) => setWaterIntake(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer h-1 rounded-lg bg-slate-100" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-slate-500 uppercase">Bloating Scale</span>
                      <span className="font-bold text-slate-800">{bloatingLevel}/5</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="5" 
                      value={bloatingLevel} 
                      onChange={(e) => setBloatingLevel(parseInt(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer h-1 rounded-lg bg-slate-100" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-slate-500 uppercase">Stress Load</span>
                      <span className="font-bold text-slate-800">{stressLevel}/5</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="5" 
                      value={stressLevel} 
                      onChange={(e) => setStressLevel(parseInt(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer h-1 rounded-lg bg-slate-100" 
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmitDashboardMetrics}
                    className="w-full bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-black uppercase tracking-wider py-3 rounded-xl transition shadow flex items-center justify-center gap-1.5"
                  >
                    <Check className="h-4 w-4" /> Submit Dashboard Metrics
                  </button>

                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: MOLECULAR FOOD LOG */}
        {activeTab === "food" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            
            {/* Left Column: AI Food Parser Form */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-1.5">
                    <FileText className="h-5.5 w-5.5 text-emerald-800" /> AI Molecular Food Parser
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Log custom dietary items, complete dishes, or take a direct camera photo of your plate! Gemini 1.5 Flash will analyze the food properties to estimate fats, carbs, proteins, prebiotics, probiotics, and plant diversity.
                  </p>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-800" />
                    <div>
                      <span className="text-[9px] uppercase tracking-wide font-black text-emerald-800 block">Target Log Day</span>
                      <span className="text-xs font-bold text-slate-900">{getDayLabel()}</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">Backlogging</span>
                </div>

                <div className="space-y-4">
                  {/* Multimodal Camera/Upload */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase text-slate-400">Meal Photo (Camera / Gallery)</label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-emerald-500 cursor-pointer p-4 rounded-2xl bg-slate-50/50 hover:bg-emerald-50/20 transition group">
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handlePhotoSelect}
                          className="hidden"
                        />
                        <div className="text-center">
                          <Camera className="h-5 w-5 text-slate-400 group-hover:text-emerald-700 mx-auto mb-1" />
                          <span className="text-[11px] text-slate-500 font-bold block">Take Photo / Upload</span>
                        </div>
                      </label>
                    </div>

                    {selectedPhoto && (
                      <div className="relative mt-2 p-1 border border-slate-200 rounded-2xl bg-slate-50">
                        <img 
                          src={selectedPhoto.previewUrl} 
                          alt="Meal Preview" 
                          className="h-32 w-full object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => setSelectedPhoto(null)}
                          className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white p-1 rounded-lg transition"
                          title="Remove Photo"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase text-slate-400">Meal Description</label>
                    <textarea
                      rows="4"
                      placeholder="e.g., Greek yogurt bowl with oats, wild berries, ground flaxseed, walnuts, and a squeeze of raw honey"
                      value={foodInput}
                      onChange={(e) => setFoodInput(e.target.value)}
                      className="w-full p-4 text-xs rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed bg-slate-50/50"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAnalyzeFood}
                  disabled={isAnalyzing}
                  className="w-full bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 shadow"
                >
                  {isAnalyzing ? "Querying Gemini Strains..." : "Analyze & Log Meal"}
                </button>

                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setFoodInput("Fermented kefir drink with chia seeds, pumpkin seeds, and ripe raspberries")}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-xl transition"
                    >
                      Kefir Seed Smoothie
                    </button>
                    <button
                      type="button"
                      onClick={() => setFoodInput("Seared cod fish with sautéed spinach, steamed broccoli, olive oil, and asparagus")}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-xl transition"
                    >
                      Fish & Polyphenol Greens
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/70 text-[10px] text-slate-500 leading-relaxed">
                  💡 <strong>Microbe Pro-tip:</strong> Adding diverse complex carbohydrates (berries, seeds, whole grains) feeds the critical mucous-thriving Akkermansia muciniphila.
                </div>
              </div>
            </div>

            {/* Right Column (2/3 width): Calendar Selector & History Log lists */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Dynamic Calendar Date Selection Banner */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="h-5 w-5 text-emerald-700" /> Nutrition Calendar
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold">Flip through dates to view what you ate</p>
                  </div>

                  {selectedFoodDateStr !== getLocalDateString(new Date()) && (
                    <button
                      onClick={handleJumpToToday}
                      className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition shadow-sm"
                    >
                      Jump to Today
                    </button>
                  )}
                </div>

                {/* Calendar Flipper Controls */}
                <div className="flex items-center justify-between border border-slate-100 bg-slate-50/50 p-2.5 rounded-2xl max-w-md mx-auto">
                  <button
                    onClick={handlePrevDay}
                    className="p-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100 rounded-xl transition shadow-sm"
                    title="Previous Day"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-100/50 px-4 py-2 rounded-xl transition relative">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-black text-slate-900 tracking-wide font-sans">{getDayLabel()}</span>
                    <input
                      type="date"
                      value={selectedFoodDateStr}
                      onChange={(e) => {
                        if (e.target.value) setSelectedFoodDateStr(e.target.value);
                      }}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                  </label>

                  <button
                    onClick={handleNextDay}
                    className="p-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100 rounded-xl transition shadow-sm"
                    title="Next Day"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Daily Macros Scorecard */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 border-t border-slate-100">
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Day Fiber</span>
                    <span className="text-sm font-black text-slate-900 font-mono mt-0.5 block">{dailyTotals.fiber}g</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Day Fats</span>
                    <span className="text-sm font-black text-slate-900 font-mono mt-0.5 block">{dailyTotals.fats}g</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Day Carbs</span>
                    <span className="text-sm font-black text-slate-900 font-mono mt-0.5 block">{dailyTotals.carbs}g</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Day Protein</span>
                    <span className="text-sm font-black text-slate-900 font-mono mt-0.5 block">{dailyTotals.protein}g</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center col-span-2 sm:col-span-1">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Day Score</span>
                    <span className="text-sm font-black text-emerald-700 font-mono mt-0.5 block">
                      {averageDailyScore > 0 ? `${averageDailyScore}/100` : "0"}
                    </span>
                  </div>
                </div>
              </div>

              {/* History logs filter for currently active calendar selection */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="h-5 w-5 text-emerald-700" /> Food logs for {getDayLabel()}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold">Active meals recorded on this calendar day</p>
                  </div>
                  {activeDayFoodLogs.length > 0 && (
                    <button
                      onClick={() => {
                        const otherDays = foodLogs.filter(log => getLocalDateString(log.timestamp) !== selectedFoodDateStr);
                        setFoodLogs(otherDays);
                        showNotification(`Logs cleared for ${selectedFoodDateStr}!`);
                      }}
                      className="text-xs text-red-500 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Clear Day Logs
                    </button>
                  )}
                </div>

                {activeDayFoodLogs.length === 0 ? (
                  <div className="text-center py-16">
                    <Layers className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">No Food Items on this Day</h4>
                    <p className="text-xs text-slate-400 mt-1">Submit meal parameters using our AI Parser column to populate your profile for this day.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeDayFoodLogs.map((log) => (
                      <div key={log.id} className="p-4.5 rounded-2xl bg-slate-50/50 border border-slate-100 flex items-start justify-between gap-4 flex-col">
                        <div className="space-y-2.5 w-full">
                          
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md uppercase">
                                Fiber: {log.fiber}g
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Score Impact</span>
                                <span className="text-xs font-black text-slate-900 font-mono mt-0.5 block">{log.score}/100</span>
                              </div>
                              <button
                                onClick={() => {
                                  setFoodLogs(foodLogs.filter((f) => f.id !== log.id));
                                  showNotification("Food entry deleted.");
                                }}
                                className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition"
                                title="Delete entry"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          <h4 className="text-xs font-black text-slate-900 leading-relaxed">{log.food}</h4>

                          {/* Dynamic detailed macros scorecard */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-y border-slate-100/80 py-2.5">
                            <div className="bg-slate-100 text-slate-700 text-[10px] p-1.5 rounded-lg font-semibold text-center">
                              🥑 Fats: <span className="font-bold">{log.fats || 0}g</span>
                            </div>
                            <div className="bg-slate-100 text-slate-700 text-[10px] p-1.5 rounded-lg font-semibold text-center">
                              🍞 Carbs: <span className="font-bold">{log.carbs || 0}g</span>
                            </div>
                            <div className="bg-slate-100 text-slate-700 text-[10px] p-1.5 rounded-lg font-semibold text-center">
                              🥩 Protein: <span className="font-bold">{log.protein || 0}g</span>
                            </div>
                            <div className="bg-slate-100 text-slate-700 text-[10px] p-1.5 rounded-lg font-semibold text-center truncate" title={log.vitamins}>
                              🍊 Vitamins: <span className="font-bold text-[9px] block truncate">{log.vitamins || "None"}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] pt-1">
                            <p className="text-slate-500 font-medium">
                              <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Prebiotics:</span> {log.prebiotics}
                            </p>
                            <p className="text-slate-500 font-medium">
                              <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Probiotics:</span> {log.probiotics}
                            </p>
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: PHYSICAL SYMPTOMS LOG */}
        {activeTab === 'symptoms' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Bristol Stool Chart Selector (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <div>
                  <h3 className="text-base font-extrabold text-slate-950">Bristol Stool Chart Tracker</h3>
                  <p className="text-xs text-slate-500 mt-0.5 mb-6">
                    Bowel form is the primary biological indicator of gut motility, dietary fiber activity, and transit time. Select a bowel form, customize the timestamp, and submit the log below.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {BRISTOL_STOOL_CHART.map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => {
                        setStoolType(item.type);
                        showNotification(`Bristol Type ${item.type} selected.`);
                      }}
                      className={`p-4 rounded-2xl border text-left transition flex items-start gap-3.5 group ${
                        stoolType === item.type 
                          ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                          : 'bg-slate-50/50 hover:bg-slate-50 border-slate-100 text-slate-700'
                      }`}
                    >
                      <div className={`text-xl font-mono font-black flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        stoolType === item.type ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                      }`}>
                        {item.type}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold">{item.name}</h4>
                          <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-md ${
                            stoolType === item.type 
                              ? 'bg-white/10 text-white' 
                              : item.rating === 'excellent' || item.rating === 'normal / optimal' || item.rating === 'excellent / perfect'
                              ? 'bg-emerald-50 text-emerald-800' 
                              : item.rating === 'mild constipation' || item.rating === 'mild diarrhea' || item.rating === 'low fiber transit'
                              ? 'bg-amber-50 text-amber-800' 
                              : 'bg-red-50 text-red-800'
                          }`}>
                            {item.rating}
                          </span>
                        </div>
                        <p className={`text-[11px] leading-relaxed ${stoolType === item.type ? 'text-slate-200' : 'text-slate-400'}`}>
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Submit Stool Log Form */}
                <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-emerald-600" /> Stool Log Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Time of Bowel Movement</label>
                      <input
                        type="datetime-local"
                        value={stoolTimestamp}
                        onChange={(e) => setStoolTimestamp(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Add Notes (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g., after breakfast, normal motility"
                        value={stoolNotes}
                        onChange={(e) => setStoolNotes(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddSymptomLog('stool', stoolType, stoolTimestamp, stoolNotes, setStoolNotes)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition shadow"
                  >
                    Submit Bowel Log (Bristol Type {stoolType})
                  </button>
                </div>
              </div>
            </div>

            {/* Other Symptoms Column (1/3 width) */}
            <div className="space-y-6">
              
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-950">Daily Biofeedback</h3>
                  <p className="text-xs text-slate-500">Track physical cues for AI correlation as often as you wish with custom timestamps.</p>
                </div>

                {/* Bloating Slider */}
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-extrabold text-slate-700">Bloating/Distension</label>
                    <span className="text-xs bg-slate-100 font-mono px-2 py-0.5 rounded text-slate-800 font-semibold">
                      {bloatingLevel === 1 ? 'None' : bloatingLevel === 3 ? 'Mild' : bloatingLevel === 5 ? 'Severe' : `${bloatingLevel}/5`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={bloatingLevel}
                    onChange={(e) => setBloatingLevel(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
                  />
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-slate-400 font-bold uppercase">Time</span>
                      <input
                        type="datetime-local"
                        value={bloatingTimestamp}
                        onChange={(e) => setBloatingTimestamp(e.target.value)}
                        className="w-full mt-0.5 p-1.5 rounded-lg border border-slate-200 bg-white text-[11px]"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase">Notes</span>
                      <input
                        type="text"
                        placeholder="e.g., after carbonation"
                        value={bloatingNotes}
                        onChange={(e) => setBloatingNotes(e.target.value)}
                        className="w-full mt-0.5 p-1.5 rounded-lg border border-slate-200 bg-white text-[11px]"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddSymptomLog('bloating', bloatingLevel, bloatingTimestamp, bloatingNotes, setBloatingNotes)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold py-1.5 rounded-lg transition"
                  >
                    Submit Bloating Measure
                  </button>
                </div>

                {/* Energy Slider */}
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-extrabold text-slate-700">Energy & Vitality</label>
                    <span className="text-xs bg-slate-100 font-mono px-2 py-0.5 rounded text-slate-800 font-semibold">
                      {energyLevel === 1 ? 'Fatigued' : energyLevel === 3 ? 'Steady' : energyLevel === 5 ? 'Vibrant' : `${energyLevel}/5`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
                  />
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-slate-400 font-bold uppercase">Time</span>
                      <input
                        type="datetime-local"
                        value={energyTimestamp}
                        onChange={(e) => setEnergyTimestamp(e.target.value)}
                        className="w-full mt-0.5 p-1.5 rounded-lg border border-slate-200 bg-white text-[11px]"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase">Notes</span>
                      <input
                        type="text"
                        placeholder="e.g., stable energy"
                        value={energyNotes}
                        onChange={(e) => setEnergyNotes(e.target.value)}
                        className="w-full mt-0.5 p-1.5 rounded-lg border border-slate-200 bg-white text-[11px]"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddSymptomLog('energy', energyLevel, energyTimestamp, energyNotes, setEnergyNotes)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold py-1.5 rounded-lg transition"
                  >
                    Submit Energy Measure
                  </button>
                </div>

                {/* Sleep Slider */}
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-extrabold text-slate-700">Sleep Quality</label>
                    <span className="text-xs bg-slate-100 font-mono px-2 py-0.5 rounded text-slate-800 font-semibold">
                      {sleepHours} Hours
                    </span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="10"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
                  />
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-slate-400 font-bold uppercase">Time</span>
                      <input
                        type="datetime-local"
                        value={sleepTimestamp}
                        onChange={(e) => setSleepTimestamp(e.target.value)}
                        className="w-full mt-0.5 p-1.5 rounded-lg border border-slate-200 bg-white text-[11px]"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase">Notes</span>
                      <input
                        type="text"
                        placeholder="e.g., woke up rested"
                        value={sleepNotes}
                        onChange={(e) => setSleepNotes(e.target.value)}
                        className="w-full mt-0.5 p-1.5 rounded-lg border border-slate-200 bg-white text-[11px]"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddSymptomLog('sleep', sleepHours, sleepTimestamp, sleepNotes, setSleepNotes)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold py-1.5 rounded-lg transition"
                  >
                    Submit Sleep Measure
                  </button>
                </div>

                {/* Stress Slider */}
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                      Stress Level <Info className="h-3 w-3 text-slate-400" title="Stress restricts gut blood flow and slows motility" />
                    </label>
                    <span className="text-xs bg-slate-100 font-mono px-2 py-0.5 rounded text-slate-800 font-semibold">
                      {stressLevel === 1 ? 'Serene' : stressLevel === 3 ? 'Moderate' : stressLevel === 5 ? 'High' : `${stressLevel}/5`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={stressLevel}
                    onChange={(e) => setStressLevel(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
                  />
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-slate-400 font-bold uppercase">Time</span>
                      <input
                        type="datetime-local"
                        value={stressTimestamp}
                        onChange={(e) => setStressTimestamp(e.target.value)}
                        className="w-full mt-0.5 p-1.5 rounded-lg border border-slate-200 bg-white text-[11px]"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase">Notes</span>
                      <input
                        type="text"
                        placeholder="e.g., deadline hustle"
                        value={stressNotes}
                        onChange={(e) => setStressNotes(e.target.value)}
                        className="w-full mt-0.5 p-1.5 rounded-lg border border-slate-200 bg-white text-[11px]"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddSymptomLog('stress', stressLevel, stressTimestamp, stressNotes, setStressNotes)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold py-1.5 rounded-lg transition"
                  >
                    Submit Stress Measure
                  </button>
                </div>

                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100/50 text-[11px] text-indigo-900 leading-relaxed">
                  💡 <strong>Did you know?</strong> Stress signals through the brain-gut axis can directly decrease *Lactobacillus* species while altering intestinal lining permeability.
                </div>

              </div>

            </div>

            {/* Bottom Full-Width Section: Historical Symptom Timeline Logs */}
            <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950 flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-emerald-600" /> Biofeedback & Symptom Timeline
                  </h3>
                  <p className="text-xs text-slate-500">Historical records of your tracked measurements</p>
                </div>
                {symptomLogs.length > 0 && (
                  <button
                    onClick={() => {
                      setSymptomLogs([]);
                      showNotification('All symptom logs cleared!');
                    }}
                    className="text-xs text-red-500 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Clear Timeline
                  </button>
                )}
              </div>

              {symptomLogs.length === 0 ? (
                <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <Activity className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-slate-700">No Symptom History</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Use the panels above to customize and log measurements with notes and timestamps.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-1">
                  {symptomLogs.map((log) => {
                    let badgeColor = 'bg-slate-100 text-slate-800';
                    let displayVal = log.value;

                    if (log.type === 'stool') {
                      badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
                      displayVal = `Bristol Type ${log.value}`;
                    } else if (log.type === 'bloating') {
                      badgeColor = 'bg-rose-100 text-rose-800 border-rose-200';
                      displayVal = `Bloating: ${log.value}/5`;
                    } else if (log.type === 'energy') {
                      badgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
                      displayVal = `Energy: ${log.value}/5`;
                    } else if (log.type === 'sleep') {
                      badgeColor = 'bg-indigo-100 text-indigo-800 border-indigo-200';
                      displayVal = `Sleep: ${log.value} hrs`;
                    } else if (log.type === 'stress') {
                      badgeColor = 'bg-purple-100 text-purple-800 border-purple-200';
                      displayVal = `Stress: ${log.value}/5`;
                    } else if (log.type === 'water') {
                      badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                      displayVal = `Hydration: ${log.value} Liters`;
                    }

                    return (
                      <div key={log.id} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/30 flex items-start justify-between gap-3 relative group">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase border ${badgeColor}`}>
                              {log.type}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900">{displayVal}</h4>
                          {log.notes && (
                            <p className="text-[11px] text-slate-500 italic">“{log.notes}”</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteSymptomLog(log.id)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition"
                          title="Delete log"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 4: EDUCATION VIEW */}
        {activeTab === "education" && (
          <div className="space-y-8 animate-fade-in">
            
            <div className="p-8 rounded-3xl bg-emerald-950 text-white relative overflow-hidden shadow-md">
              <div className="max-w-2xl z-10 relative space-y-3.5">
                <span className="text-[10px] bg-emerald-800 text-emerald-300 font-bold tracking-widest px-2.5 py-1 rounded-md uppercase">Hand-Curated Ecology</span>
                <h2 className="text-lg font-black tracking-tight sm:text-xl">The Molecular Guide to your Microbiome Ecosystem</h2>
                <p className="text-xs text-emerald-200 leading-relaxed">
                  Inside your digestive colon lives over 100 trillion microbial organism cells. This library explains how prebiotic starches, live probiotic fermentation, and the dynamic nervous system highway control your daily immune health.
                </p>
              </div>
              <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none hidden md:block">
                <Sparkles className="w-full h-full text-emerald-300" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="h-10 w-10 bg-emerald-50 text-emerald-800 rounded-xl flex items-center justify-center">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">1. Prebiotic Fertilizers</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Prebiotics are structural, non-digestible plant carbohydrates that slide past your small intestine untouched. When they land in your colon, good microbes ferment them into vital Short-Chain Fatty Acids (SCFAs) like acetate, propionate, and butyrate.
                </p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] space-y-1.5">
                  <p className="font-bold text-slate-700">Prime Prebiotic Families:</p>
                  <p className="text-slate-500"><strong>Inulin:</strong> Found in garlic, leeks, onions, asparagus, chicory root.</p>
                  <p className="text-slate-500"><strong>Beta-Glucan:</strong> Found in whole oats, barley, and medicinal mushrooms.</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="h-10 w-10 bg-blue-50 text-blue-800 rounded-xl flex items-center justify-center">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">2. Live Probiotic Strains</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Probiotics are live active bacteria cultures introduced through fermented foods or targeted supplements. Instead of colonizing your gut forever, they act as active transient passengers that quiet pathogens and boost immune signals.
                </p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] space-y-1.5">
                  <p className="font-bold text-slate-700">Traditional Probiotic Sources:</p>
                  <p className="text-slate-500"><strong>Sauerkraut & Kimchi:</strong> Loaded with wild *Lactobacillus* and *Leuconostoc*.</p>
                  <p className="text-slate-500"><strong>Organic Kefir:</strong> Houses over 30 distinct bacterial and yeast strains.</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="h-10 w-10 bg-indigo-50 text-indigo-800 rounded-xl flex items-center justify-center">
                  <Heart className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">3. The Vagus Highway</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your gut and your brain are hardwired through the giant 10th cranial nerve—the **vagus nerve**. Over 90% of your body's serotonin is produced directly by gut cells, sending immediate status signals back to your brain regarding mood, sleep, and emotional stress.
                </p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] space-y-1.5">
                  <p className="font-bold text-slate-700">Stress & Motility Impact:</p>
                  <p className="text-slate-500">Elevated stress triggers adrenaline, restricting oxygen to your gut lining and causing good *Bifidobacteria* to plummet, which can lead to bloating.</p>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      <footer className="bg-white border-t border-slate-100 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-semibold text-slate-400">
          <p>© 2026 MyBiome AI. Curate your ecosystem, cultivate your health.</p>
          <div className="flex gap-4">
            <button type="button" onClick={() => setShowDisclaimerModal(true)} className="hover:text-slate-900 transition underline">Medical Disclaimer</button>
            <span className="text-slate-200">|</span>
            <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition">Get Gemini Token</a>
            <span className="text-slate-200">|</span>
            <span className="text-emerald-700">Molecular Gut Sync Bridge v5</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
