import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Load CSV data
let trainingData: any[] = [];
let descriptionData: any[] = [];
let precautionsData: any[] = [];
let medicationsData: any[] = [];

// Diseases list mapping
const diseasesList: Record<number, string> = {
  15: 'Fungal infection', 4: 'Allergy', 16: 'GERD', 9: 'Chronic cholestasis', 14: 'Drug Reaction',
  33: 'Peptic ulcer diseae', 1: 'AIDS', 12: 'Diabetes ', 17: 'Gastroenteritis', 6: 'Bronchial Asthma',
  23: 'Hypertension ', 30: 'Migraine', 7: 'Cervical spondylosis', 32: 'Paralysis (brain hemorrhage)',
  28: 'Jaundice', 29: 'Malaria', 8: 'Chicken pox', 11: 'Dengue', 37: 'Typhoid', 40: 'hepatitis A',
  19: 'Hepatitis B', 20: 'Hepatitis C', 21: 'Hepatitis D', 22: 'Hepatitis E', 3: 'Alcoholic hepatitis',
  36: 'Tuberculosis', 10: 'Common Cold', 34: 'Pneumonia', 13: 'Dimorphic hemmorhoids(piles)',
  18: 'Heart attack', 39: 'Varicose veins', 26: 'Hypothyroidism', 24: 'Hyperthyroidism',
  25: 'Hypoglycemia', 31: 'Osteoarthristis', 5: 'Arthritis', 0: '(vertigo) Paroymsal  Positional Vertigo',
  2: 'Acne', 38: 'Urinary tract infection', 35: 'Psoriasis', 27: 'Impetigo'
};

// Load CSV files
async function loadCSVData() {
  try {
    const trainingText = await Deno.readTextFile('./Training_data.csv');
    trainingData = parseCSV(trainingText);

    const descriptionText = await Deno.readTextFile('./description.csv');
    descriptionData = parseCSV(descriptionText);

    const precautionsText = await Deno.readTextFile('./precautions_df.csv');
    precautionsData = parseCSV(precautionsText);

    const medicationsText = await Deno.readTextFile('./medications.csv');
    medicationsData = parseCSV(medicationsText);

    console.log('CSV data loaded successfully');
  } catch (error) {
    console.error('Error loading CSV data:', error);
  }
}

// Simple CSV parser
function parseCSV(text: string): any[] {
  const lines = text.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const values = line.split(',');
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = values[index]?.trim() || '';
    });
    return obj;
  });
  return rows;
}

// Get disease details
function getDiseaseDetails(disease: string) {
  const descRow = descriptionData.find(row => row['Disease'] === disease);
  const desc = descRow ? descRow['Description'] : 'Description not available.';

  const preRow = precautionsData.find(row => row['Disease'] === disease);
  const precautions = preRow ? Object.values(preRow).slice(1).filter(v => v) : ['No precautions available.'];

  const medRow = medicationsData.find(row => row['Disease'] === disease);
  const medications = medRow ? Object.values(medRow).slice(1).filter(v => v) : ['No medications available.'];

  return { desc, precautions, medications };
}

// Predict disease based on symptoms
function predictDisease(symptoms: string[]): string {
  if (!trainingData.length) {
    throw new Error('Training data not loaded');
  }

  const symptomColumns = Object.keys(trainingData[0]).filter(col => col !== 'prognosis');

  // Calculate match scores — match only against known symptom columns
  const scores = trainingData.map(row => {
    let score = 0;
    symptomColumns.forEach(col => {
      // If the incoming symptoms list mentions this column and the training row has '1'
      if (symptoms.includes(col) && String(row[col]).trim() === '1') {
        score++;
      }
    });
    return { prognosis: row.prognosis, score };
  });

  // Find highest score (if tie, first wins)
  const bestMatch = scores.reduce((max, current) => (current.score > max.score ? current : max), { prognosis: '', score: -1 });

  if (!bestMatch || bestMatch.score < 0 || !bestMatch.prognosis) {
    return 'Unknown disease';
  }

  const prognosisRaw = String(bestMatch.prognosis).trim();

  // If prognosis is numeric index, map via diseasesList; otherwise treat it as disease name
  const prognosisNum = parseInt(prognosisRaw);
  if (!isNaN(prognosisNum)) {
    return diseasesList[prognosisNum] || prognosisRaw;
  }

  return prognosisRaw || 'Unknown disease';
}

// Load data on startup
await loadCSVData();

serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname;

  console.log(`${req.method} ${path} - Request received`);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (path === '/welcome') {
    return new Response(
      JSON.stringify({ message: 'Welcome to the Disease Prediction API!' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { symptoms } = await req.json();

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Symptoms array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Received symptoms:', symptoms);

    // Predict disease using rule-based approach
    const predictedDisease = predictDisease(symptoms);
    console.log('Predicted disease:', predictedDisease);

    // Get disease details
    const { desc, precautions, medications } = getDiseaseDetails(predictedDisease);

    // Calculate confidence based on match score (simplified)
    const confidence = 75; // Placeholder confidence

    const result = {
      disease: predictedDisease,
      confidence,
      description: desc,
      medications,
      precautions
    };

    console.log('Prediction result:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in predict-disease function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
