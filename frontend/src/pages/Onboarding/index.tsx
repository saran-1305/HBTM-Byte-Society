import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Progress } from "../../components/Progress";

// Basic fetch logic for our API
const startOnboarding = async (data: any) => {
  const res = await fetch("/api/onboarding/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to start onboarding");
  return res.json();
};

const saveOnboarding = async (data: any) => {
  const res = await fetch("/api/onboarding/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save onboarding");
  return res.json();
};

const completeOnboarding = async () => {
  const res = await fetch("/api/onboarding/complete", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  });
  if (!res.ok) throw new Error("Failed to complete onboarding");
  return res.json();
};

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: "",
    age: "",
    occupation: "",
    aspirations: "",
    learning_style: "",
  });
  const navigate = useNavigate();

  const startMutation = useMutation({
    mutationFn: startOnboarding,
    onSuccess: () => setStep(2),
  });

  const saveMutation = useMutation({
    mutationFn: saveOnboarding,
    onSuccess: () => setStep(3),
  });

  const completeMutation = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      navigate("/dashboard");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step === 1) {
      startMutation.mutate({
        full_name: formData.full_name,
        age: parseInt(formData.age),
        occupation: formData.occupation
      });
    } else if (step === 2) {
      // Split comma separated lists
      saveMutation.mutate({
        aspirations: formData.aspirations.split(",").map(s => s.trim()),
        learning_style: formData.learning_style
      });
    } else if (step === 3) {
      completeMutation.mutate();
    }
  };

  const isLoading = startMutation.isPending || saveMutation.isPending || completeMutation.isPending;
  const isError = startMutation.isError || saveMutation.isError || completeMutation.isError;

  return (
    <div className="max-w-xl mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Onboarding (Step {step}/3)</h1>
      <Progress value={(step / 3) * 100} className="mb-6" />
      
      {isError && <p className="text-red-500 mb-4">An error occurred. Please try again.</p>}
      
      {step === 1 && (
        <div className="space-y-4">
          <Input name="full_name" placeholder="Full Name" onChange={handleChange} />
          <Input name="age" type="number" placeholder="Age" onChange={handleChange} />
          <Input name="occupation" placeholder="Occupation" onChange={handleChange} />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Input name="aspirations" placeholder="Aspirations (comma separated)" onChange={handleChange} />
          <Input name="learning_style" placeholder="Preferred Learning Style" onChange={handleChange} />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <p>You're all set! Click below to let our AI generate your personalized Identity Summary.</p>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <Button onClick={handleNext} disabled={isLoading}>
          {isLoading ? "Loading..." : (step === 3 ? "Complete & Generate Profile" : "Next")}
        </Button>
      </div>
    </div>
  );
}
