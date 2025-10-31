import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Pill, Shield, ArrowLeft, Activity } from "lucide-react";

interface DiagnosisResultProps {
  data: {
    disease: string;
    confidence: number;
    description: string;
    medications: string[];
    precautions: string[];
  };
  onNewDiagnosis: () => void;
}

const DiagnosisResult = ({ data, onNewDiagnosis }: DiagnosisResultProps) => {
  const confidenceColor = data.confidence >= 80 ? "text-accent" : data.confidence >= 60 ? "text-primary" : "text-yellow-600";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button
          onClick={onNewDiagnosis}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          New Diagnosis
        </Button>

        <div className="bg-card rounded-2xl shadow-elevated border border-border p-8 md:p-10 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              <Activity className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{data.disease}</h1>
                <Badge variant="secondary" className="text-base px-3 py-1">
                  <span className={confidenceColor}>{data.confidence}%</span> confidence
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">{data.description}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6 shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Pill className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl font-semibold">Recommended Medications</h2>
            </div>
            <ul className="space-y-3">
              {data.medications.map((med, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">{med}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Precautions</h2>
            </div>
            <ul className="space-y-3">
              {data.precautions.map((prec, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">{prec}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 flex gap-4">
          <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Educational Purpose Only</h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              This prediction is generated for educational and demonstration purposes only. It is NOT a medical diagnosis and should never be used for actual healthcare decisions. 
              This is a learning tool to demonstrate AI/ML concepts. Always consult qualified healthcare professionals for any health concerns. 
              Do not use this information to self-diagnose or start any treatment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisResult;
