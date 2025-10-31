import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SYMPTOMS = [
  "itching", "skin_rash", "nodal_skin_eruptions", "continuous_sneezing", "shivering",
  "chills", "joint_pain", "stomach_pain", "acidity", "ulcers_on_tongue",
  "muscle_wasting", "vomiting", "burning_micturition", "spotting_urination", "fatigue",
  "weight_gain", "anxiety", "cold_hands_and_feets", "mood_swings", "weight_loss",
  "restlessness", "lethargy", "patches_in_throat", "irregular_sugar_level", "cough",
  "high_fever", "sunken_eyes", "breathlessness", "sweating", "dehydration",
  "indigestion", "headache", "yellowish_skin", "dark_urine", "nausea",
  "loss_of_appetite", "pain_behind_the_eyes", "back_pain", "constipation", "abdominal_pain",
  "diarrhoea", "mild_fever", "yellow_urine", "yellowing_of_eyes", "acute_liver_failure",
  "fluid_overload", "swelling_of_stomach", "swelled_lymph_nodes", "malaise", "blurred_and_distorted_vision",
  "phlegm", "throat_irritation", "redness_of_eyes", "sinus_pressure", "runny_nose",
  "congestion", "chest_pain", "weakness_in_limbs", "fast_heart_rate", "pain_during_bowel_movements",
  "pain_in_anal_region", "bloody_stool", "irritation_in_anus", "neck_pain", "dizziness",
  "cramps", "bruising", "obesity", "swollen_legs", "swollen_blood_vessels",
  "puffy_face_and_eyes", "enlarged_thyroid", "brittle_nails", "swollen_extremeties", "excessive_hunger",
  "extra_marital_contacts", "drying_and_tingling_lips", "slurred_speech", "knee_pain", "hip_joint_pain",
  "muscle_weakness", "stiff_neck", "swelling_joints", "movement_stiffness", "spinning_movements",
  "loss_of_balance", "unsteadiness", "weakness_of_one_body_side", "loss_of_smell", "bladder_discomfort",
  "foul_smell_of_urine", "continuous_feel_of_urine", "passage_of_gases", "internal_itching", "toxic_look_(typhos)",
  "depression", "irritability", "muscle_pain", "altered_sensorium", "red_spots_over_body",
  "belly_pain", "abnormal_menstruation", "dischromic_patches", "watering_from_eyes", "increased_appetite",
  "polyuria", "family_history", "mucoid_sputum", "rusty_sputum", "lack_of_concentration",
  "visual_disturbances", "receiving_blood_transfusion", "receiving_unsterile_injections", "coma", "stomach_bleeding",
  "distention_of_abdomen", "history_of_alcohol_consumption", "fluid_overload.1", "blood_in_sputum", "prominent_veins_on_calf",
  "palpitations", "painful_walking", "pus_filled_pimples", "blackheads", "scurring",
  "skin_peeling", "silver_like_dusting", "small_dents_in_nails", "inflammatory_nails", "blister",
  "red_sore_around_nose", "yellow_crust_ooze"
];

interface SymptomSelectorProps {
  onDiagnosisComplete: (result: any) => void;
  onBack: () => void;
}

const SymptomSelector = ({ onDiagnosisComplete, onBack }: SymptomSelectorProps) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const filteredSymptoms = SYMPTOMS.filter(symptom =>
    symptom.toLowerCase().replace(/_/g, " ").includes(searchTerm.toLowerCase())
  );

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const formatSymptomName = (symptom: string) => {
    return symptom.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleAnalyze = async () => {
    if (selectedSymptoms.length < 3) {
      toast.error("Please select at least 3 symptoms for accurate diagnosis");
      return;
    }

    setIsAnalyzing(true);
    try {
      // Use Supabase Edge Function instead of local Flask API
      const { data, error } = await supabase.functions.invoke('predict-disease', {
        body: { symptoms: selectedSymptoms }
      });

      if (error) {
        throw new Error(error.message || 'Failed to analyze symptoms');
      }

      if (!data) {
        throw new Error('No data received from prediction service');
      }

      // Transform data to match expected format
      const transformedData = {
        disease: data.disease,
        confidence: data.confidence || 75, // Use provided confidence or default
        description: data.description,
        medications: Array.isArray(data.medications) ? data.medications : [],
        precautions: Array.isArray(data.precautions) ? data.precautions : []
      };

      onDiagnosisComplete(transformedData);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      toast.error("Failed to analyze symptoms. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to Home
        </Button>
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-center">Select Your Symptoms</h1>
          <p className="text-muted-foreground text-center">Choose all symptoms you are experiencing</p>
        </div>

        <div className="bg-card rounded-2xl shadow-card border border-border p-6 md:p-8 mb-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search symptoms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {selectedSymptoms.length > 0 && (
            <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Selected Symptoms ({selectedSymptoms.length})</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSymptoms([])}
                  className="text-xs"
                >
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSymptoms.map(symptom => (
                  <Badge key={symptom} variant="default" className="pl-3 pr-1 py-1">
                    {formatSymptomName(symptom)}
                    <button
                      onClick={() => toggleSymptom(symptom)}
                      className="ml-2 hover:bg-primary-foreground/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredSymptoms.map(symptom => (
                <button
                  key={symptom}
                  onClick={() => toggleSymptom(symptom)}
                  className={`text-left px-4 py-3 rounded-lg border transition-all ${
                    selectedSymptoms.includes(symptom)
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-secondary hover:bg-secondary/80 border-border"
                  }`}
                >
                  <span className="text-sm font-medium">{formatSymptomName(symptom)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || selectedSymptoms.length === 0}
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-elevated"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Symptoms"
            )}
          </Button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 dark:text-blue-200">
            For accurate results, select all symptoms you're currently experiencing. The AI will analyze the combination to provide the most likely diagnosis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SymptomSelector;
