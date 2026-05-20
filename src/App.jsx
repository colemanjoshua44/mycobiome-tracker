import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Plus, 
  Trash2, 
  Sparkles, 
  Calendar, 
  Info, 
  Droplet, 
  Smile, 
  Meh, 
  Frown, 
  BookOpen, 
  Flame, 
  Apple, 
  TrendingUp, 
  RotateCcw,
  Camera,
  Activity,
  User,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  HelpCircle,
  Moon,
  Clock,
  Settings
} from 'lucide-react';

const BRISTOL_STOOL_CHART = [
  { type: 1, name: 'Severe Constipation', desc: 'Separate hard lumps, like nuts (hard to pass)', rating: 'poor', color: 'text-red-500' },
  { type: 2, name: 'Mild Constipation', desc: 'Sausage-shaped but lumpy', rating: 'moderate', color: 'text-amber-500' },
  { type: 3, name: 'Normal', desc: 'Like a sausage but with cracks on surface', rating: 'excellent', color: 'text-emerald-500' },
  { type: 4, name: 'Ideal', desc: 'Like a sausage or snake, smooth and soft', rating: 'excellent', color: 'text-emerald-500' },
  { type: 5, name: 'Lacking Fiber', desc: 'Soft blobs with clear-cut edges', rating: 'moderate', color: 'text-amber-500' },
  { type: 6, name: 'Mild Diarrhea', desc: 'Fluffy pieces with ragged edges, a mushy stool', rating: 'poor', color: 'text-red-500' },
  { type: 7, name: 'Severe Diarrhea', desc: 'Watery, no solid pieces, entirely liquid', rating: 'poor', color: 'text-red-500' },
];

const PRESET_PLANTS = [
  'Oatmeal', 'Banana', 'Chia Seeds', 'Blueberries', 'Garlic', 'Onion', 
  'Spinach', 'Broccoli', 'Almonds', 'Walnuts', 'Sweet Potato', 'Lentils', 
  'Chickpeas', 'Flaxseeds', 'Avocado', 'Apple', 'Tomato', 'Asparagus'
];

const PREBIOTIC_SOURCES = [
  { name: 'Inulin', foods: 'Chicory root, Jerusalem artichoke, garlic, onions, leeks, asparagus' },
  { name: 'Beta-Glucan', foods: 'Oats, barley, mushrooms (shiitake, reishi)' },
  { name: 'Pectin', foods: 'Apples, pears, plums, citrus fruits' },
  { name: 'Resistant Starch', foods: 'Cooked and cooled potatoes/rice, green bananas, legumes' }
];

const PROBIOTIC_SOURCES = [
  { name: 'Lactobacillus', foods: 'Yogurt, Kefir, Kimchi, Sauerkraut, Sour cream' },
  { name: 'Bifidobacterium', foods: 'Kefir, fermented milk, some fortified yogurts' },
  { name: 'Saccharomyces boulardii', foods: 'Kombucha, specialized fermented products' }
];

const DEFAULT_LOGS = [
  {
    id: '1',
    foodName: 'Greek yogurt with blueberries, chia seeds, and oats',
    calories: 320,
    carbs: 42,
    protein: 18,
    fats: 8,
    fiber: 8,
    prebiotics: 3,
    probiotics: true,
    fermented: true,
    vitamins: ['Vitamin C', 'Vitamin B12', 'Calcium'],
    minerals: ['Magnesium', 'Potassium', 'Phosphorus'],
    plantDiversityPoints: 3,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    foodName: 'Sourdough toast with sliced avocado and garlic-sautéed spinach',
    calories: 410,
    carbs: 35,
    protein: 12,
    fats: 22,
    fiber: 9,
    prebiotics: 4,
    probiotics: false,
    fermented: true,
    vitamins: ['Vitamin A', 'Vitamin K', 'Vitamin E', 'Folate'],
    minerals: ['Iron', 'Potassium', 'Magnesium'],
    plantDiversityPoints: 4,
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [foodLogs, setFoodLogs] = useState(DEFAULT_LOGS);
  
  // Custom Food Entry State
  const [foodInput, setFoodInput] = useState('');
  const [imageInput, setImageInput] = useState(null);
  const [analyzingFood, setAnalyzingFood] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  
  // Manual Entry Form State
  const [manualForm, setManualForm] = useState({
    foodName: '',
    calories: 250,
    carbs: 30,
    protein: 10,
    fats: 8,
    fiber: 5,
    prebiotics: 2,
    probiotics: false,
    fermented: false,
    vitamins: '',
    minerals: '',
    plantDiversityPoints: 1
  });

  // Well-being & Symptoms State
  const [waterIntake, setWaterIntake] = useState(4); // in cups/glasses (250ml)
  const [bloatingLevel, setBloatingLevel] = useState(2); // 1 to 5
  const [energyLevel, setEnergyLevel] = useState(4); // 1 to 5
  const [stoolType, setStoolType] = useState(4); // Bristol Type
  const [sleepHours, setSleepHours] = useState(7.5);
  const [stressLevel, setStressLevel] = useState(2); // 1 to 5

  // Daily Synthesis / Microbiome AI State
  const [aiReport, setAiReport] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Error/Success visual notifications (Replacing browser alert)
  const [notification, setNotification] = useState(null);

  // API Key Settings States
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('mycobiome_api_key') || '');
  const [apiKeyInput, setApiKeyInput] = useState(apiKey);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const saveApiKey = (e) => {
    e.preventDefault();
    const trimmedKey = apiKeyInput.trim();
    localStorage.setItem('mycobiome_api_key', trimmedKey);
    setApiKey(trimmedKey);
    setIsSettingsOpen(false);
    showNotification('Gemini API Key saved securely inside local browser storage!');
  };

  const getActiveApiKey = () => {
    let envKey = '';
    try {
      const safeMeta = new Function('return import.meta')();
      if (safeMeta && safeMeta.env) {
        envKey = safeMeta.env.VITE_GEMINI_API_KEY || '';
      }
    } catch (e) {
      // Safe fallback if execution fails
    }
    return apiKey || envKey || '';
  };

  const dailyTotals = foodLogs.reduce((acc, log) => {
    acc.calories += log.calories || 0;
    acc.carbs += log.carbs || 0;
    acc.protein += log.protein || 0;
    acc.fats += log.fats || 0;
    acc.fiber += log.fiber || 0;
    acc.prebiotics += log.prebiotics || 0;
    if (log.probiotics) acc.probioticsCount += 1;
    if (log.fermented) acc.fermentedCount += 1;
    acc.plantDiversity += log.plantDiversityPoints || 0;
    return acc;
  }, { calories: 0, carbs: 0, protein: 0, fats: 0, fiber: 0, prebiotics: 0, probioticsCount: 0, fermentedCount: 0, plantDiversity: 0 });

  // Recommended Daily Values (RDVs)
  const targets = {
    calories: 2000,
    carbs: 250,
    protein: 65,
    fats: 70,
    fiber: 30, // Gut standard: aim for 30g+
    prebiotics: 8, // Prebiotic target
    water: 8, // cups
    plantDiversity: 30 // Target per week, but daily score calculates relative progress
  };

  // The Microbiome Well-being Score is synthesised using weighted criteria:
  // $Score = w_1 \cdot \text{Fiber\%} + w_2 \cdot \text{Prebiotics\%} + w_3 \cdot \text{Probiotics} + w_4 \cdot \text{Water\%} + w_5 \cdot \text{Stool} + w_6 \cdot \text{Lifestyle}$
  const calculateMicrobiomeScore = () => {
    const fiberScore = Math.min((dailyTotals.fiber / targets.fiber) * 100, 100);
    const prebioticScore = Math.min((dailyTotals.prebiotics / targets.prebiotics) * 100, 100);
    const probioScore = Math.min(((dailyTotals.probioticsCount * 40) + (dailyTotals.fermentedCount * 25)), 100);
    const hydrationScore = Math.min((waterIntake / targets.water) * 100, 100);
    
    // Bristol Stool Penalty
    let stoolScore = 50;
    if (stoolType === 3 || stoolType === 4) stoolScore = 100;
    else if (stoolType === 2 || stoolType === 5) stoolScore = 75;
    else if (stoolType === 1 || stoolType === 6) stoolScore = 40;
    else stoolScore = 15;

    // Lifestyle factor score
    const lifestyleScore = ((6 - stressLevel) * 10) + (Math.min(sleepHours / 8, 1.2) * 50);

    const rawScore = (fiberScore * 0.3) + (prebioticScore * 0.2) + (probioScore * 0.15) + (hydrationScore * 0.1) + (stoolScore * 0.1) + (lifestyleScore * 0.15);
    return Math.round(Math.min(rawScore, 100));
  };

  const microbiomeScore = calculateMicrobiomeScore();

  // Based on the calculated scores, different microbe types will thrive, glow, multiply or decrease
  const getMicrobeStatus = () => {
    const fiberRatio = dailyTotals.fiber / targets.fiber;
    const prebioticRatio = dailyTotals.prebiotics / targets.prebiotics;
    const probioticRatio = (dailyTotals.probioticsCount + dailyTotals.fermentedCount) / 2;

    return {
      bifido: {
        population: Math.min(15 + Math.round(prebioticRatio * 15), 35),
        mood: prebioticRatio > 0.8 ? 'happy' : prebioticRatio > 0.4 ? 'neutral' : 'sluggish',
        color: '#3b82f6',
        label: 'Bifidobacteria (Fiber-Lovers)'
      },
      lacto: {
        population: Math.min(10 + Math.round(probioticRatio * 20), 30),
        mood: probioticRatio > 0.7 ? 'happy' : probioticRatio > 0.3 ? 'neutral' : 'sluggish',
        color: '#ec4899',
        label: 'Lactobacillus (Ferment-Lovers)'
      },
      akkermansia: {
        population: Math.min(5 + Math.round(fiberRatio * 15), 20),
        mood: fiberRatio > 1.0 ? 'happy' : fiberRatio > 0.5 ? 'neutral' : 'starving',
        color: '#10b981',
        label: 'Akkermansia muciniphila (Gut Barrier Protectors)'
      },
      opportunistic: {
        // High processed/lack of fiber allows bad bacterial families to grow
        population: Math.max(25 - Math.round(fiberRatio * 15), 5),
        mood: fiberRatio < 0.4 ? 'aggressive' : 'dormant',
        color: '#f59e0b',
        label: 'Opportunistic Bacteroidetes (Sugar Lovers)'
      }
    };
  };

  const microbes = getMicrobeStatus();

  const handleAIFoodParse = async (e) => {
    e.preventDefault();
    
    const activeKey = getActiveApiKey();
    if (!activeKey) {
      setIsSettingsOpen(true);
      showNotification('Please configure your Gemini API Key first to unlock AI Analysis.', 'error');
      return;
    }

    if (!foodInput && !imageInput) {
      showNotification('Please provide a text log or select an image first.', 'error');
      return;
    }

    setAnalyzingFood(true);
    try {
      const systemPrompt = `
        You are a clinical nutritionist and expert in digestive microbiome health. 
        Analyze the meal given by the user (which can be a text description or base64 image data).
        Extract accurate estimated nutrient macros, fibers, prebiotics, probiotics (fermented/live cultures), key vitamins, minerals, and plant-based ingredient diversity counts.
        Respond STRICTLY with a valid JSON matching this schema:
        {
          "foodName": "A descriptive name of the food logged",
          "calories": number,
          "carbs": number,
          "protein": number,
          "fats": number,
          "fiber": number,
          "prebiotics": number,
          "probiotics": boolean,
          "fermented": boolean,
          "vitamins": ["Vitamin A", "Vitamin C"],
          "minerals": ["Calcium", "Magnesium"],
          "plantDiversityPoints": number (How many distinct plant-based ingredients/species are in this meal, e.g., grains, seeds, veggies, fruit, herbs)
        }
      `;

      let payload;
      let modelUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`;

      if (imageInput) {
        const base64CleanData = imageInput.split(',')[1];
        payload = {
          contents: [
            {
              role: "user",
              parts: [
                { text: `Analyze this image of a food meal. Fallback text context: ${foodInput || 'No context'}` },
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: base64CleanData
                  }
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          }
        };
      } else {
        payload = {
          contents: [{ parts: [{ text: `Analyze this food: "${foodInput}"` }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          }
        };
      }

      const response = await fetch(modelUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analysis from Gemini API.');
      }

      const data = await response.json();
      const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (textOutput) {
        const parsedFood = JSON.parse(textOutput);
        const newLog = {
          ...parsedFood,
          id: Date.now().toString(),
          timestamp: new Date().toISOString()
        };
        setFoodLogs([newLog, ...foodLogs]);
        showNotification(`Successfully analyzed & logged: "${parsedFood.foodName}"!`);
        setFoodInput('');
        setImageInput(null);
      } else {
        throw new Error('Unexpected JSON structure from API.');
      }
    } catch (err) {
      console.error(err);
      showNotification('AI analysis failed. Please verify your API Key, use manual input, or try again.', 'error');
    } finally {
      setAnalyzingFood(false);
    }
  };

  const generateMicrobiomeReport = async () => {
    const activeKey = getActiveApiKey();
    if (!activeKey) {
      setIsSettingsOpen(true);
      showNotification('Please configure your Gemini API Key first to generate a report.', 'error');
      return;
    }

    setGeneratingReport(true);
    try {
      const formattedLogs = foodLogs.map(log => 
        `- ${log.foodName}: ${log.calories}kcal (C:${log.carbs}g, P:${log.protein}g, F:${log.fats}g, Fiber:${log.fiber}g, Prebiotics:${log.prebiotics}g, Probiotics:${log.probiotics ? 'Yes' : 'No'}, Fermented:${log.fermented ? 'Yes' : 'No'}, Plant Diversity:${log.plantDiversityPoints})`
      ).join('\n');

      const physicalSymptoms = `
        - Water Intake: ${waterIntake} cups (Target: 8)
        - Bloating Level: ${bloatingLevel}/5
        - Energy Level: ${energyLevel}/5
        - Bristol Stool Type: Type ${stoolType} (${BRISTOL_STOOL_CHART.find(c => c.type === stoolType)?.name})
        - Sleep Hours: ${sleepHours} hours
        - Stress Level: ${stressLevel}/5
      `;

      const userPrompt = `
        Today's Nutritional Logs:
        ${formattedLogs}

        Today's Bio/Lifestyle Symptoms:
        ${physicalSymptoms}

        Analyze this information as an advanced gastrointestinal microbiologist and dietitian. Predict the state of their digestive microbiome, name key bacterial species likely thriving or suffering, discuss systemic wellness connections (like mucosal barrier and gut-brain axis), provide detailed dietary recommendations to optimize their gut, and craft a delicious "Microbiome Power Recipe" with clear preparation instructions.
      `;

      const systemPrompt = `
        You are a Gut Microbiome Intelligence AI. Synthesize user logs into a beautifully structured, engaging, and encouraging microbiome diagnostic report.
        Produce a JSON response strictly matching this schema structure:
        {
          "overallStatus": "A summary phrase representing their gut state (e.g. Symbiotic Bliss, Mild Dysbiosis Risk, Highly Starved Microbiome)",
          "gutMicrobialBreakdown": "Analysis of their Bifidobacteria, Lactobacillus, Akkermansia, etc., mentioning species by name (e.g., Bifidobacterium longum, Akkermansia muciniphila) and how their current meals affected them.",
          "symptomCorrelation": "A clinical-style explanation of how their physical symptoms (bloating, stool type, energy) relate back to their specific gut health, fiber intake, or stress-associated gut motility changes.",
          "beneficialAdditions": ["List of 3 specific prebiotic/probiotic foods to add tomorrow"],
          "reductiveTargets": ["List of 2 items to limit to restore balanced symbiosis"],
          "microbiomePowerRecipe": {
            "name": "Creative name for gut healing recipe",
            "ingredients": ["list of ingredients with prebiotic/probiotic markers"],
            "benefits": "Short summary of how this recipe directly aids their microbiome",
            "instructions": "Simple step-by-step instructions to make it"
          }
        }
      `;

      const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        },
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        }
      };

      const modelUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`;

      const response = await fetch(modelUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Report generation failed.');
      }

      const data = await response.json();
      const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (textOutput) {
        setAiReport(JSON.parse(textOutput));
        showNotification('Personalized Microbiome synthesis ready!');
      } else {
        throw new Error('Parsed response text was empty.');
      }

    } catch (err) {
      console.error(err);
      showNotification('Failed to generate gut report. Please check your API Key and try again.', 'error');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleManualLog = (e) => {
    e.preventDefault();
    if (!manualForm.foodName.trim()) {
      showNotification('Please enter a food name.', 'error');
      return;
    }

    const newLog = {
      id: Date.now().toString(),
      foodName: manualForm.foodName,
      calories: Number(manualForm.calories) || 0,
      carbs: Number(manualForm.carbs) || 0,
      protein: Number(manualForm.protein) || 0,
      fats: Number(manualForm.fats) || 0,
      fiber: Number(manualForm.fiber) || 0,
      prebiotics: Number(manualForm.prebiotics) || 0,
      probiotics: manualForm.probiotics,
      fermented: manualForm.fermented,
      vitamins: manualForm.vitamins ? manualForm.vitamins.split(',').map(v => v.trim()) : [],
      minerals: manualForm.minerals ? manualForm.minerals.split(',').map(m => m.trim()) : [],
      plantDiversityPoints: Number(manualForm.plantDiversityPoints) || 0,
      timestamp: new Date().toISOString()
    };

    setFoodLogs([newLog, ...foodLogs]);
    showNotification(`Logged: "${manualForm.foodName}" successfully.`);
    
    // Reset manual form
    setManualForm({
      foodName: '',
      calories: 250,
      carbs: 30,
      protein: 10,
      fats: 8,
      fiber: 5,
      prebiotics: 2,
      probiotics: false,
      fermented: false,
      vitamins: '',
      minerals: '',
      plantDiversityPoints: 1
    });
    setManualMode(false);
  };

  const deleteLog = (id) => {
    setFoodLogs(foodLogs.filter(log => log.id !== id));
    showNotification('Log entry removed.');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageInput(reader.result);
        showNotification('Meal image uploaded successfully. Ready to parse!');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* Visual Notification Banner */}
      {notification && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border animate-bounce ${
          notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Global API Warning Banner if no key exists */}
      {!getActiveApiKey() && (
        <div className="bg-amber-50 border-b border-amber-100 py-2.5 px-4 text-center text-xs text-amber-800 font-medium flex items-center justify-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>Gemini AI is currently offline. Setup your free API Key to enable instant nutrition analysis and reports.</span>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="underline hover:text-amber-950 font-bold ml-1"
          >
            Configure Key
          </button>
        </div>
      )}

      {/* API Configuration Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <Settings className="h-5 w-5 text-emerald-600" />
                <h3 className="font-extrabold text-base">Gemini API Key Settings</h3>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              We process everything locally inside your browser directly with Google's API. Your key is stored securely in your browser's local cache and is never uploaded to external intermediary servers.
            </p>

            <form onSubmit={saveApiKey} className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">Google AI Studio API Key</label>
                <input 
                  type="password" 
                  placeholder="AIzaSy..." 
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full text-sm font-mono p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-500 font-semibold">Don't have an API key?</span>
                <a 
                  href="https://aistudio.google.com/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-emerald-600 hover:underline font-bold"
                >
                  Get a Free Key →
                </a>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition shadow"
                >
                  Save API Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl shadow-inner">
              <Activity className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                MycoBiome <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">AI</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">Precision Gut Health & Microbe Tracker</p>
            </div>
          </div>

          <nav className="hidden md:flex space-x-1">
            {['dashboard', 'meals', 'symptoms', 'advisor', 'encyclopedia'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all capitalize ${
                  activeTab === tab 
                    ? 'bg-slate-950 text-white shadow-md shadow-slate-900/15' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab === 'advisor' ? 'AI Gut Advisor' : tab}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-100">
              <Heart className="h-4 w-4 fill-emerald-500 text-emerald-500 animate-pulse" />
              <span className="text-xs font-bold font-mono">Score: {microbiomeScore}%</span>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 transition"
              title="API Key Configuration"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Header */}
      <div className="md:hidden flex overflow-x-auto gap-1 bg-white border-b border-slate-100 px-2 py-2 sticky top-16 z-30 shadow-sm scrollbar-none">
        {['dashboard', 'meals', 'symptoms', 'advisor', 'encyclopedia'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg capitalize ${
              activeTab === tab ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab === 'advisor' ? 'AI Gut Advisor' : tab}
          </button>
        ))}
      </div>

      {/* MAIN VIEW CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Well-being Score & Animated Microbe Ecosystem */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Score Display Card */}
              <div className="bg-gradient-to-br from-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl shadow-emerald-950/20">
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
                  <Activity className="h-64 w-64 text-emerald-400" />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-4 text-center md:text-left">
                    <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                      <Sparkles className="h-3.5 w-3.5" /> Predicted Microbiome Well-being
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                      Your gut is in {microbiomeScore >= 80 ? 'Symbiotic Bliss' : microbiomeScore >= 50 ? 'Steady Balance' : 'Dysbiosis Risk'}
                    </h2>
                    <p className="text-emerald-200/80 text-sm max-w-md">
                      Based on your physical feedback, fiber levels, prebiotic flora-feed, and hydration rates today.
                    </p>
                    <button
                      onClick={() => setActiveTab('advisor')}
                      className="mt-2 inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-emerald-50 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-lg transition-transform hover:scale-[1.02]"
                    >
                      <Sparkles className="h-4 w-4 text-emerald-600 fill-emerald-100" /> Consult AI Microbiome Advisor
                    </button>
                  </div>

                  <div className="flex-shrink-0 flex flex-col items-center justify-center p-6 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <div className="relative flex items-center justify-center">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="54" className="stroke-white/10 fill-none" strokeWidth="8" />
                        <circle 
                          cx="64" cy="64" r="54" 
                          className="stroke-emerald-400 transition-all duration-1000 ease-out fill-none" 
                          strokeWidth="8" 
                          strokeDasharray={339.3}
                          strokeDashoffset={339.3 - (339.3 * microbiomeScore) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-4xl font-black font-mono tracking-tighter text-white">{microbiomeScore}%</span>
                    </div>
                    <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest mt-2">Gut Bio Score</span>
                  </div>
                </div>
              </div>

              {/* Ecosystem Interactive Simulator */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-emerald-600" /> Interactive Gut Flora Simulator
                    </h3>
                    <p className="text-xs text-slate-500">Visualizing estimated microbial abundance reacting to your logged items</p>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-semibold">
                    Interactive Microscope view
                  </span>
                </div>

                {/* Animated Simulation Box */}
                <div className="relative bg-slate-900 rounded-2xl h-80 overflow-hidden shadow-inner flex items-center justify-center border-4 border-slate-950">
                  <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_45%,rgba(15,23,42,0.85))]"></div>

                  {/* Render simulated floating microbe blobs */}
                  <div className="absolute inset-0 overflow-hidden">
                    {/* Render Bifido Strains (Blue rods) */}
                    {[...Array(microbes.bifido.population)].map((_, i) => (
                      <div
                        key={`bif-${i}`}
                        className="absolute rounded-full flex items-center justify-center text-[8px]"
                        style={{
                          left: `${(i * 19.3 + 12) % 90}%`,
                          top: `${(i * 11.7 + 25) % 80}%`,
                          width: '18px',
                          height: '8px',
                          background: microbes.bifido.color,
                          boxShadow: `0 0 10px ${microbes.bifido.color}80`,
                          opacity: 0.85,
                          transform: `rotate(${i * 45}deg)`,
                          animation: `bounce ${2.5 + (i % 3)}s infinite ease-in-out`
                        }}
                      />
                    ))}

                    {/* Render Lacto Strains (Pink spheres) */}
                    {[...Array(microbes.lacto.population)].map((_, i) => (
                      <div
                        key={`lac-${i}`}
                        className="absolute rounded-full"
                        style={{
                          left: `${(i * 23.4 + 7) % 90}%`,
                          top: `${(i * 15.2 + 10) % 80}%`,
                          width: '12px',
                          height: '12px',
                          background: microbes.lacto.color,
                          boxShadow: `0 0 8px ${microbes.lacto.color}90`,
                          opacity: 0.8,
                          animation: `pulse ${1.8 + (i % 4)}s infinite ease-in-out`
                        }}
                      />
                    ))}

                    {/* Render Akkermansia protectors (Green sturdy ovals) */}
                    {[...Array(microbes.akkermansia.population)].map((_, i) => (
                      <div
                        key={`akk-${i}`}
                        className="absolute rounded-lg border border-white/20"
                        style={{
                          left: `${(i * 29.1 + 18) % 90}%`,
                          top: `${(i * 13.9 + 40) % 85}%`,
                          width: '14px',
                          height: '14px',
                          background: microbes.akkermansia.color,
                          boxShadow: `0 0 12px ${microbes.akkermansia.color}a0`,
                          opacity: 0.9,
                          transform: `rotate(${i * 15}deg)`,
                          animation: `bounce ${3 + (i % 2)}s infinite ease-in-out`
                        }}
                      />
                    ))}

                    {/* Render Sugar-Lovers/Opportunistic (Orange circles) */}
                    {[...Array(microbes.opportunistic.population)].map((_, i) => (
                      <div
                        key={`opp-${i}`}
                        className="absolute rounded-full border border-orange-300/30"
                        style={{
                          left: `${(i * 17.5 + 45) % 90}%`,
                          top: `${(i * 21.3 + 5) % 80}%`,
                          width: '10px',
                          height: '10px',
                          background: microbes.opportunistic.color,
                          boxShadow: `0 0 6px ${microbes.opportunistic.color}70`,
                          opacity: microbes.opportunistic.mood === 'aggressive' ? 0.9 : 0.4,
                          animation: `pulse ${1.2 + (i % 3)}s infinite ease-in-out`
                        }}
                      />
                    ))}
                  </div>

                  {/* Microbe Live Feed Legend Indicator overlay */}
                  <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 flex flex-wrap gap-x-4 gap-y-1 text-[11px] justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: microbes.bifido.color }}></div>
                      <span className="text-slate-300">Bifidobacteria: <span className="text-white font-bold">{microbes.bifido.population}x ({microbes.bifido.mood})</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: microbes.lacto.color }}></div>
                      <span className="text-slate-300">Lactobacillus: <span className="text-white font-bold">{microbes.lacto.population}x ({microbes.lacto.mood})</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: microbes.akkermansia.color }}></div>
                      <span className="text-slate-300">Akkermansia: <span className="text-white font-bold">{microbes.akkermansia.population}x ({microbes.akkermansia.mood})</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: microbes.opportunistic.color }}></div>
                      <span className="text-slate-300">Sugar-feeders: <span className="text-white font-bold">{microbes.opportunistic.population}x ({microbes.opportunistic.mood})</span></span>
                    </div>
                  </div>
                </div>

                {/* Analysis Commentary box */}
                <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100/50 text-xs text-emerald-800 leading-relaxed flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold">Ecosystem Snapshot:</span>{' '}
                    {microbiomeScore >= 80 ? (
                      <span>Superb! High dietary fiber and prebiotics are feeding key short-chain fatty acid (SCFA) synthesizers like Bifidobacteria and Akkermansia. This stabilizes the protective mucosal lining and promotes anti-inflammatory pathways. Keep up the high prebiotic food choices!</span>
                    ) : microbiomeScore >= 50 ? (
                      <span>Stable gut state. Your dietary logs indicate some plant diversity, but increasing prebiotic-rich foods (onions, leeks, garlic, green bananas) will trigger higher growth for gut-barrier guardians like *Akkermansia muciniphila*. Keep drinking water to improve transit times.</span>
                    ) : (
                      <span>High risk of gut dysbiosis. A lack of structural fiber and fermented elements is starving key symbionts. The opportunistic/inflammatory species are currently enjoying available refined carbs. Add dynamic fibers, probiotics, and improve hydration levels to repair.</span>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Key Daily Stats Ring & Hydration */}
            <div className="space-y-8">
              
              {/* Daily Target Progress Bars */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-slate-500" /> Daily Nutritional Targets
                  </h3>
                  <p className="text-xs text-slate-500">How your meal intake stacked up today</p>
                </div>

                <div className="space-y-4">
                  {/* Dietary Fiber Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700 flex items-center gap-1.5">
                        <Apple className="h-3.5 w-3.5 text-emerald-600" /> Gut Fiber
                      </span>
                      <span className="text-slate-900 font-mono font-bold">{dailyTotals.fiber}g / {targets.fiber}g</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${dailyTotals.fiber >= targets.fiber ? 'bg-emerald-500' : 'bg-emerald-600'}`}
                        style={{ width: `${Math.min((dailyTotals.fiber / targets.fiber) * 100, 100)}%` }}
                      />
                    </div>
                    {dailyTotals.fiber < targets.fiber ? (
                      <p className="text-[10px] text-amber-600 font-semibold mt-1">Need {targets.fiber - dailyTotals.fiber}g more fiber to feed beneficial strains.</p>
                    ) : (
                      <p className="text-[10px] text-emerald-600 font-semibold mt-1">Awesome! Target met to produce healthy SCFAs like butyrate!</p>
                    )}
                  </div>

                  {/* Prebiotics Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-blue-500" /> Prebiotic Fuel
                      </span>
                      <span className="text-slate-900 font-mono font-bold">{dailyTotals.prebiotics}g / {targets.prebiotics}g</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((dailyTotals.prebiotics / targets.prebiotics) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Probiotic Fermented Elements Counter */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100/50 text-center">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Fermented Foods</span>
                      <span className="text-xl font-black font-mono text-emerald-800">{dailyTotals.fermentedCount}</span>
                    </div>
                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100/50 text-center">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Live Probiotics</span>
                      <span className="text-xl font-black font-mono text-blue-800">{dailyTotals.probioticsCount}</span>
                    </div>
                  </div>

                  {/* Macros Breakdown Pills */}
                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest block">Standard Macronutrients</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-slate-50 p-2.5 rounded-lg text-center">
                        <span className="text-[9px] text-slate-500 font-bold block">Carbs</span>
                        <span className="text-xs font-bold text-slate-900">{dailyTotals.carbs}g</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg text-center">
                        <span className="text-[9px] text-slate-500 font-bold block">Protein</span>
                        <span className="text-xs font-bold text-slate-900">{dailyTotals.protein}g</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg text-center">
                        <span className="text-[9px] text-slate-500 font-bold block">Fats</span>
                        <span className="text-xs font-bold text-slate-900">{dailyTotals.fats}g</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Dynamic Daily Water Tracker Widget */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Droplet className="h-4 w-4 text-blue-500" /> Hydration Motility
                    </h3>
                    <p className="text-xs text-slate-500">Water supports bowel movement</p>
                  </div>
                  <span className="text-xs font-bold font-mono text-blue-600">{waterIntake * 250}ml</span>
                </div>

                <div className="flex justify-between items-center gap-2">
                  <div className="flex gap-1.5">
                    {[...Array(targets.water)].map((_, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setWaterIntake(idx + 1)}
                        className={`w-7 h-10 rounded-lg flex flex-col justify-end items-center overflow-hidden transition-all duration-300 border ${
                          idx < waterIntake 
                            ? 'bg-blue-100 border-blue-300 shadow-sm' 
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {idx < waterIntake ? (
                          <div className="w-full bg-blue-500 h-4/5 animate-pulse" />
                        ) : (
                          <div className="w-full bg-slate-200 h-1/5" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col gap-1">
                    <button 
                      onClick={() => setWaterIntake(Math.min(waterIntake + 1, 12))}
                      className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-center font-bold text-xs"
                    >
                      + Cup
                    </button>
                    <button 
                      onClick={() => setWaterIntake(Math.max(waterIntake - 1, 0))}
                      className="p-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg text-center text-xs"
                    >
                      - Cup
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: MEAL LOGGING & ANALYSIS TRACKER */}
        {activeTab === 'meals' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Input Form Column (Left 1/3) */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-extrabold text-slate-900">Log New Meal</h3>
                  <button 
                    onClick={() => setManualMode(!manualMode)}
                    className="text-xs font-bold text-emerald-600 hover:underline"
                  >
                    {manualMode ? 'Use AI Auto-Parse' : 'Switch to Manual Input'}
                  </button>
                </div>

                {!manualMode ? (
                  /* AI Parsing Form */
                  <form onSubmit={handleAIFoodParse} className="space-y-4">
                    <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/50 mb-2">
                      <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                        ✨ <strong>AI Auto-Parse:</strong> Type your breakfast, lunch, or snack, and our AI will break down the fibers, carbs, prebiotics, and minerals for you! You can also upload a photo.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Describe What You Ate
                      </label>
                      <textarea
                        rows="3"
                        placeholder="e.g., Sourdough bread toasted with half an avocado, dynamic microgreens, and a bowl of mixed probiotic live kefir with fresh raspberries"
                        value={foodInput}
                        onChange={(e) => setFoodInput(e.target.value)}
                        className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50"
                      />
                    </div>

                    {/* Image Upload Area */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Meal Photo (Optional but Recommended)
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-2xl bg-slate-50 relative hover:bg-slate-100/50 transition">
                        {imageInput ? (
                          <div className="text-center">
                            <img src={imageInput} alt="Preview of food" className="mx-auto h-32 w-auto rounded-xl object-cover mb-2 shadow" />
                            <p className="text-xs text-slate-500 font-semibold mb-2">Meal photo selected</p>
                            <button 
                              type="button" 
                              onClick={() => setImageInput(null)}
                              className="text-xs text-red-500 hover:underline font-bold"
                            >
                              Remove Image
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1 text-center">
                            <Camera className="mx-auto h-8 w-8 text-slate-400 stroke-[1.5]" />
                            <div className="flex text-xs text-slate-600 justify-center">
                              <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-semibold text-emerald-600 hover:text-emerald-500 focus-within:outline-none">
                                <span>Upload a meal photo</span>
                                <input id="file-upload" name="file-upload" type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} />
                              </label>
                            </div>
                            <p className="text-[10px] text-slate-500">PNG, JPG, GIF up to 5MB</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={analyzingFood}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold p-3 rounded-xl transition text-xs flex items-center justify-center gap-2 shadow disabled:opacity-60"
                    >
                      {analyzingFood ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Analyzing with Microbiome AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 text-emerald-400 fill-emerald-100" />
                          Log with AI Analysis
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* Manual Logging Form */
                  <form onSubmit={handleManualLog} className="space-y-3 text-xs font-semibold text-slate-700">
                    <div>
                      <label className="block text-slate-500 uppercase tracking-wider mb-1">Meal / Food Item Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Chia Seed Pudding"
                        value={manualForm.foodName}
                        onChange={(e) => setManualForm({...manualForm, foodName: e.target.value})}
                        className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-500 mb-1">Calories (kcal)</label>
                        <input
                          type="number"
                          value={manualForm.calories}
                          onChange={(e) => setManualForm({...manualForm, calories: e.target.value})}
                          className="w-full p-2 rounded-lg border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1">Fibers (g)</label>
                        <input
                          type="number"
                          value={manualForm.fiber}
                          onChange={(e) => setManualForm({...manualForm, fiber: e.target.value})}
                          className="w-full p-2 rounded-lg border border-slate-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-slate-500 mb-1">Carbs (g)</label>
                        <input
                          type="number"
                          value={manualForm.carbs}
                          onChange={(e) => setManualForm({...manualForm, carbs: e.target.value})}
                          className="w-full p-1.5 rounded-lg border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1">Protein (g)</label>
                        <input
                          type="number"
                          value={manualForm.protein}
                          onChange={(e) => setManualForm({...manualForm, protein: e.target.value})}
                          className="w-full p-1.5 rounded-lg border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1">Fats (g)</label>
                        <input
                          type="number"
                          value={manualForm.fats}
                          onChange={(e) => setManualForm({...manualForm, fats: e.target.value})}
                          className="w-full p-1.5 rounded-lg border border-slate-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div>
                        <label className="block text-slate-500 mb-1">Prebiotics (g)</label>
                        <input
                          type="number"
                          value={manualForm.prebiotics}
                          onChange={(e) => setManualForm({...manualForm, prebiotics: e.target.value})}
                          className="w-full p-2 rounded-lg border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1">Plant Diversity (0-5)</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={manualForm.plantDiversityPoints}
                          onChange={(e) => setManualForm({...manualForm, plantDiversityPoints: e.target.value})}
                          className="w-full p-2 rounded-lg border border-slate-200"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-2 border-t border-slate-100">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={manualForm.probiotics}
                          onChange={(e) => setManualForm({...manualForm, probiotics: e.target.checked})}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Has Live Probiotics</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={manualForm.fermented}
                          onChange={(e) => setManualForm({...manualForm, fermented: e.target.checked})}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Is Fermented Food</span>
                      </label>
                    </div>

                    <div className="space-y-1 pt-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Vitamins present (comma separated)</label>
                        <input
                          type="text"
                          placeholder="Vitamin C, Vitamin B6"
                          value={manualForm.vitamins}
                          onChange={(e) => setManualForm({...manualForm, vitamins: e.target.value})}
                          className="w-full p-2 rounded-lg border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Minerals present (comma separated)</label>
                        <input
                          type="text"
                          placeholder="Iron, Magnesium, Zinc"
                          value={manualForm.minerals}
                          onChange={(e) => setManualForm({...manualForm, minerals: e.target.value})}
                          className="w-full p-2 rounded-lg border border-slate-200"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3 rounded-xl transition text-xs"
                    >
                      Add Meal Log
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Meal Logs List Column (Right 2/3) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-950">Food & Nutrition Logs</h3>
                    <p className="text-xs text-slate-500">Everything eaten in the tracking window</p>
                  </div>
                  <button 
                    onClick={() => {
                      setFoodLogs([]);
                      showNotification('All food logs cleared for a fresh start!');
                    }}
                    className="text-xs text-red-500 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Clear All
                  </button>
                </div>

                {foodLogs.length === 0 ? (
                  <div className="text-center py-12 px-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                    <Apple className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-slate-700">No Food Logged Today</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                      Enter food details on the left using description text or photo analysis!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {foodLogs.map((log) => (
                      <div key={log.id} className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/40 relative group transition">
                        
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                              <Clock className="h-3 w-3" /> 
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug">{log.foodName}</h4>
                          </div>
                          
                          <button
                            onClick={() => deleteLog(log.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Nutrition pill summaries */}
                        <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold">
                          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md">
                            {log.calories} kcal
                          </span>
                          <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-100/60">
                            Fiber: {log.fiber}g
                          </span>
                          {log.prebiotics > 0 && (
                            <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md border border-blue-100/60">
                              Prebiotics: {log.prebiotics}g
                            </span>
                          )}
                          {log.probiotics && (
                            <span className="bg-pink-50 text-pink-800 px-2 py-0.5 rounded-md border border-pink-100/60">
                              Live Cultures
                            </span>
                          )}
                          {log.fermented && (
                            <span className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded-md border border-purple-100/60">
                              Fermented
                            </span>
                          )}
                          {log.plantDiversityPoints > 0 && (
                            <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-100/60">
                              🌱 Diversity Points: +{log.plantDiversityPoints}
                            </span>
                          )}
                        </div>

                        {/* Vitamins/Minerals listing */}
                        {(log.vitamins?.length > 0 || log.minerals?.length > 0) && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100/60 text-[10px] text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                            {log.vitamins?.length > 0 && (
                              <span><strong>Vitamins:</strong> {log.vitamins.join(', ')}</span>
                            )}
                            {log.minerals?.length > 0 && (
                              <span><strong>Minerals:</strong> {log.minerals.join(', ')}</span>
                            )}
                          </div>
                        )}

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
                    Bowel form is the primary biological indicator of gut motility, dietary fiber activity, and transit time.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {BRISTOL_STOOL_CHART.map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => {
                        setStoolType(item.type);
                        showNotification(`Bowel status logged as Bristol Type ${item.type}: ${item.name}`);
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
                              : item.rating === 'excellent' 
                              ? 'bg-emerald-50 text-emerald-800' 
                              : item.rating === 'moderate' 
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
              </div>
            </div>

            {/* Other Symptoms Column (1/3 width) */}
            <div className="space-y-6">
              
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-950">Daily Biofeedback</h3>
                  <p className="text-xs text-slate-500">Track physical cues for AI correlation</p>
                </div>

                {/* Bloating Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700">Bloating/Distension</label>
                    <span className="text-xs bg-slate-100 font-mono px-2 py-0.5 rounded text-slate-800 font-semibold">
                      {bloatingLevel === 1 ? 'None (1/5)' : bloatingLevel === 3 ? 'Mild (3/5)' : bloatingLevel === 5 ? 'Severe (5/5)' : `${bloatingLevel}/5`}
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
                </div>

                {/* Energy Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700">Energy & Mental Vitality</label>
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
                </div>

                {/* Sleep Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700">Sleep Quality</label>
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
                </div>

                {/* Stress Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      Stress Level <Info className="h-3 w-3 text-slate-400" title="Stress restricts gut blood flow and slows motility" />
                    </label>
                    <span className="text-xs bg-slate-100 font-mono px-2 py-0.5 rounded text-slate-800 font-semibold">
                      {stressLevel === 1 ? 'Serene' : stressLevel === 3 ? 'Moderate' : stressLevel === 5 ? 'Highly Anxious' : `${stressLevel}/5`}
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
                </div>

                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100/50 text-[11px] text-indigo-900 leading-relaxed">
                  💡 <strong>Did you know?</strong> Stress signals through the brain-gut axis can directly decrease *Lactobacillus* species while altering intestinal lining permeability.
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 4: AI MICROBIOME ADVISOR CONSOLE */}
        {activeTab === 'advisor' && (
          <div className="space-y-6">
            
            {/* Header description */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
              <div className="max-w-3xl space-y-4">
                <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold uppercase">
                  <Sparkles className="h-3 w-3" /> Predictive Microbiome Report Generator
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Consult the Gut Intelligence AI
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Synthesize your meal logs, prebiotic inputs, vitamins, minerals, water intake, stool quality, and physiological symptoms to predict which microbial populations are thriving or suffering, understand gut-brain interactions, and get dynamic recipes custom-fit to optimize your unique digestive ecosystem.
                </p>

                <button
                  onClick={generateMicrobiomeReport}
                  disabled={generatingReport || foodLogs.length === 0}
                  className="inline-flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-6 py-3 rounded-2xl text-xs transition shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {generatingReport ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating Comprehensive Synthesis...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-emerald-400 fill-emerald-100" />
                      Generate Microbiome Health Report
                    </>
                  )}
                </button>
                {foodLogs.length === 0 && (
                  <p className="text-xs text-amber-600 font-semibold">Please log at least one meal to generate a report.</p>
                )}
              </div>
            </div>

            {/* AI Report Render Area */}
            {aiReport ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Main analysis cards (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Synthesis Overview and Gut status */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="font-extrabold text-slate-900 text-base">Gut State Prediction</h3>
                      <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg text-xs font-extrabold">
                        {aiReport.overallStatus}
                      </span>
                    </div>
                    
                    <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                          <Activity className="h-4 w-4 text-emerald-600" /> Key Bacterial Flora Impact Breakdown
                        </h4>
                        <p className="bg-slate-50 p-4 rounded-xl text-slate-600">{aiReport.gutMicrobialBreakdown}</p>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                          <TrendingUp className="h-4 w-4 text-blue-500" /> Symptom Correlation Explanation
                        </h4>
                        <p className="bg-slate-50 p-4 rounded-xl text-slate-600">{aiReport.symptomCorrelation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Microbiome Power Recipe */}
                  {aiReport.microbiomePowerRecipe && (
                    <div className="bg-gradient-to-br from-emerald-50 to-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                          <Apple className="h-5 w-5" />
                        </span>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">Today's Microbiome Power Recipe</h3>
                          <p className="text-[11px] text-slate-500">Dynamic recipe formulated to nourish beneficial strains</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200/50 space-y-3">
                        <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                          🍲 {aiReport.microbiomePowerRecipe.name}
                        </h4>
                        <p className="text-xs text-slate-600 italic">
                          {aiReport.microbiomePowerRecipe.benefits}
                        </p>

                        <div className="space-y-2 text-xs pt-2">
                          <h5 className="font-bold text-slate-900 uppercase tracking-wide text-[10px] text-slate-400">Targeted Ingredients</h5>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-slate-700 list-disc list-inside">
                            {aiReport.microbiomePowerRecipe.ingredients.map((ingredient, i) => (
                              <li key={i}>{ingredient}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-1.5 text-xs pt-2">
                          <h5 className="font-bold text-slate-900 uppercase tracking-wide text-[10px] text-slate-400">Preparation Instructions</h5>
                          <p className="text-slate-600 leading-relaxed whitespace-pre-line">{aiReport.microbiomePowerRecipe.instructions}</p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Target additions/limits checklist */}
                <div className="space-y-6">
                  
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
                    
                    {/* Additions */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4" /> Highly Beneficial Additions
                      </h4>
                      <p className="text-xs text-slate-500">Add these to feed optimal microbes</p>
                      <div className="space-y-2">
                        {aiReport.beneficialAdditions.map((item, i) => (
                          <div key={i} className="flex gap-2 p-2.5 bg-emerald-50/50 border border-emerald-100/50 rounded-xl items-center">
                            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full flex-shrink-0" />
                            <span className="text-xs font-bold text-slate-800">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reductions */}
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-black uppercase text-amber-800 tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4" /> Optimization Targets
                      </h4>
                      <p className="text-xs text-slate-500">Reduce or limit these elements to prevent dysbiosis triggers</p>
                      <div className="space-y-2">
                        {aiReport.reductiveTargets.map((item, i) => (
                          <div key={i} className="flex gap-2 p-2.5 bg-amber-50/50 border border-amber-100/50 rounded-xl items-center">
                            <span className="w-1.5 h-1.5 bg-amber-600 rounded-full flex-shrink-0" />
                            <span className="text-xs font-bold text-slate-800">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            ) : (
              /* Prompt when report hasn't been generated yet */
              <div className="bg-slate-50 text-slate-500 text-center py-12 px-4 rounded-3xl border border-dashed border-slate-200">
                <Sparkles className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-700">No Consultation Generated Yet</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                  Click the button above to synthesize your logged meals and custom lifestyle stats.
                </p>
              </div>
            )}

          </div>
        )}

        {/* TAB 5: MICROBIOME ENCYCLOPEDIA */}
        {activeTab === 'encyclopedia' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main content educational cards (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                  <BookOpen className="h-5 w-5 text-emerald-600" /> Understanding Prebiotics vs. Probiotics
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The human gut microbiome contains trillions of organisms that govern metabolism, nutrient synthesis, gut barrier strength, and immunomodulatory pathways. To achieve clinical symbiosis, we must address both the organisms themselves and their fuels.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100">
                    <h4 className="text-xs font-black uppercase text-emerald-800 tracking-wider mb-1">
                      Prebiotics (The Fiber Food)
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      These are non-digestible dietary compounds (mostly complex starches and soluble fibers) that bypass our stomach digestion to feed beneficial gut species in the large intestine.
                    </p>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Key Bacterial Recipients:</span>
                    <p className="text-xs text-slate-700 font-medium">Bifidobacterium, Faecalibacterium prausnitzii (highly anti-inflammatory).</p>
                  </div>

                  <div className="p-4 bg-blue-50/40 rounded-2xl border border-blue-100">
                    <h4 className="text-xs font-black uppercase text-blue-800 tracking-wider mb-1">
                      Probiotics (The Live Organisms)
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      These are active, living bacteria cultures present in fermented foods or dietary capsules that actively repopulate, transiently assist, or outcompete bad pathogenic bacteria.
                    </p>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Primary Families:</span>
                    <p className="text-xs text-slate-700 font-medium">Lactobacillus strains, Bifidobacterium animalis, Saccharomyces boulardii.</p>
                  </div>
                </div>
              </div>

              {/* Gut Microbiome-Brain Axis connection card */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-lg">
                <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-md uppercase">
                  Gut-Brain Axis (Vagus Highway)
                </span>
                <h3 className="text-lg font-black tracking-tight">How Gut Bacteria Command Mood & Serotonin</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Roughly **90% of your body's Serotonin** (the key neurotransmitter dictating sleep, happiness, and steady digestion) is manufactured right inside your intestinal tract by specialized gut microbes reacting to dietary fiber breakdown. High stress triggers hormonal cascades that decrease protective mucus, making it imperative to eat raw prebiotic vegetation to keep these neural pathways clear!
                </p>
              </div>

            </div>

            {/* Encyclopedia Tables/Guides (1/3 width) */}
            <div className="space-y-6">
              
              {/* Prebiotics Table list */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Prebiotic Sources</h4>
                  <p className="text-[11px] text-slate-500">The primary structural nutrients for gut bacteria</p>
                </div>
                <div className="space-y-3">
                  {PREBIOTIC_SOURCES.map((source, i) => (
                    <div key={i} className="text-xs border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                      <span className="font-bold text-emerald-800">{source.name}</span>
                      <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">{source.foods}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Probiotics Ferments List */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Probiotic Sources</h4>
                  <p className="text-[11px] text-slate-500">Traditional fermented flora builders</p>
                </div>
                <div className="space-y-3">
                  {PROBIOTIC_SOURCES.map((source, i) => (
                    <div key={i} className="text-xs border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                      <span className="font-bold text-blue-800">{source.name}</span>
                      <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">{source.foods}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      <footer className="bg-white border-t border-slate-100 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="text-xs text-slate-500 font-bold">MycoBiome Gut Health AI Tracker — Empowered by Google Gemini & Live Microbe Simulation</p>
          <p className="text-[10px] text-slate-400">Disclaimer: Predictions are for educational purposes. Consult a gastroenterologist or clinical dietitian for personal health decisions.</p>
        </div>
      </footer>
    </div>
  );
}