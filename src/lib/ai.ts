interface AssessmentResult {
  risk_level: "low" | "medium" | "high";
  possible_diagnoses: Array<{ name: string; reason: string }>;
  recommended_tests: Array<{ name: string; reason: string }>;
  precautions: string[];
  natural_remedies: string[];
  warnings: string[];
  disclaimer: string;
}

interface VitalsInput {
  temperature?: string | number;
  blood_pressure?: string;
  pulse?: string | number;
  oxygen?: string | number;
  weight?: string | number;
}

function toFloat(value: unknown): number {
  const n = parseFloat(String(value ?? 0));
  return isNaN(n) ? 0 : n;
}

function toInt(value: unknown): number {
  const n = parseInt(String(value ?? 0));
  return isNaN(n) ? 0 : n;
}

// HIGH risk keywords — serious/life-threatening conditions
const HIGH_RISK_KEYWORDS = [
  "cancer", "tumor", "tumour", "malignant", "malignancy", "carcinoma", "lymphoma",
  "leukemia", "leukaemia", "sarcoma", "metastasis", "metastatic",
  "lung cancer", "breast cancer", "colon cancer", "prostate cancer", "blood cancer",
  "heart attack", "cardiac arrest", "stroke", "brain hemorrhage", "hemorrhage",
  "aneurysm", "pulmonary embolism", "blood clot",
  "sepsis", "septic", "meningitis", "encephalitis",
  "paralysis", "unconscious", "unresponsive", "coma",
  "severe bleeding", "internal bleeding", "coughing blood", "blood in urine",
  "blood in stool", "vomiting blood",
  "suicidal", "overdose", "poisoning",
  "difficulty breathing", "can't breathe", "cannot breathe", "no breath",
  "chest tightness", "chest pain", "crushing chest",
  "kidney failure", "liver failure", "organ failure",
  "hiv", "aids", "tuberculosis", "tb",
  "dengue", "malaria", "typhoid",
  "broken bone", "fracture", "head injury", "skull fracture",
  "diabetic coma", "hypoglycemia severe", "insulin shock",
];

// MEDIUM risk keywords
const MEDIUM_RISK_KEYWORDS = [
  "fever", "high temperature", "infection", "infected",
  "chronic pain", "persistent pain", "severe pain",
  "diabetes", "diabetic", "blood sugar", "sugar level",
  "hypertension", "high blood pressure", "low blood pressure",
  "asthma", "bronchitis", "pneumonia",
  "kidney stone", "gallstone", "appendix",
  "migraine", "severe headache", "blurred vision",
  "vertigo", "dizziness", "fainting",
  "vomiting", "severe nausea", "dehydration",
  "swollen", "inflammation", "abscess",
  "fracture", "sprain", "dislocation",
  "urinary infection", "uti", "kidney pain",
  "thyroid", "hormonal", "anxiety severe", "depression severe",
  "back pain severe", "nerve pain", "numbness",
  "allergy severe", "anaphylaxis", "hives",
  "rash spreading", "skin infection",
  "weight loss sudden", "fatigue extreme", "weakness severe",
];

function checkKeywords(text: string, keywords: string[]): string[] {
  return keywords.filter(kw => text.includes(kw));
}

export function generateLocalAssessment(
  symptoms: string,
  history: Array<{ condition_name: string }>,
  vitals: VitalsInput
): AssessmentResult {
  const text = (symptoms + " " + history.map((h) => h.condition_name).join(" "))
    .toLowerCase()
    .trim();

  const temperature = toFloat(vitals.temperature);
  const oxygen = toInt(vitals.oxygen);
  const pulse = toInt(vitals.pulse);

  let risk: "low" | "medium" | "high" = "low";
  const diagnoses: Array<{ name: string; reason: string }> = [];
  const tests: Array<{ name: string; reason: string }> = [];
  const precautions: string[] = [
    "Doctor must verify all AI suggestions before clinical use.",
    "Confirm allergies and current medications before prescribing.",
  ];
  const remedies: string[] = [
    "Hydration and rest may support recovery where clinically appropriate.",
    "Balanced diet and good sleep hygiene can support general wellness.",
  ];
  const warnings: string[] = [];

  // --- VITALS CHECK ---
  if (oxygen > 0 && oxygen < 90) {
    risk = "high";
    warnings.push("CRITICAL: Oxygen saturation below 90% — requires immediate medical attention.");
  } else if (oxygen > 0 && oxygen < 94) {
    risk = "high";
    warnings.push("Low oxygen saturation detected — urgent medical evaluation required.");
  }

  if (temperature >= 104) {
    risk = "high";
    warnings.push("CRITICAL: Very high fever (≥104°F/40°C) — requires urgent evaluation.");
  } else if (temperature >= 102) {
    if (risk !== "high") risk = "medium";
    warnings.push("High fever detected — monitor closely and seek medical attention.");
  }

  if (pulse > 0 && (pulse > 150 || pulse < 40)) {
    risk = "high";
    warnings.push("Abnormal heart rate detected — requires immediate cardiac evaluation.");
  }

  // --- HIGH RISK KEYWORD CHECK ---
  const highMatches = checkKeywords(text, HIGH_RISK_KEYWORDS);
  if (highMatches.length > 0) {
    risk = "high";
    warnings.push(`High-risk condition(s) mentioned: ${highMatches.slice(0, 3).join(", ")}. Immediate medical evaluation strongly recommended.`);

    // Cancer specific
    if (text.includes("cancer") || text.includes("tumor") || text.includes("malignant") ||
        text.includes("carcinoma") || text.includes("lymphoma") || text.includes("leukemia") ||
        text.includes("sarcoma")) {
      diagnoses.push({
        name: "Oncological condition (suspected)",
        reason: "Patient mentions cancer or malignancy-related symptoms. Requires urgent specialist evaluation.",
      });
      tests.push(
        { name: "Complete Blood Count (CBC)", reason: "Assess blood cell abnormalities." },
        { name: "CT Scan / MRI", reason: "Imaging to evaluate tumor size and spread." },
        { name: "Biopsy", reason: "Tissue sample for definitive cancer diagnosis." },
        { name: "Tumor markers (CEA, CA-125, PSA etc.)", reason: "Blood markers for specific cancer types." },
        { name: "PET Scan", reason: "Evaluate cancer spread throughout body." }
      );
      precautions.push("Urgent oncology referral required.");
      precautions.push("Do not delay specialist consultation.");
      remedies.length = 0;
      remedies.push("Cancer treatment must be managed by a licensed oncologist.");
      remedies.push("Palliative care and nutritional support may be discussed with the treating team.");
    }

    // Heart attack / stroke
    if (text.includes("heart attack") || text.includes("cardiac arrest") || text.includes("stroke")) {
      diagnoses.push({
        name: "Acute cardiac/neurological emergency",
        reason: "Symptoms suggest possible heart attack or stroke — requires emergency response.",
      });
      tests.push(
        { name: "ECG / EKG", reason: "Immediate cardiac rhythm assessment." },
        { name: "Troponin I/T", reason: "Cardiac damage markers." },
        { name: "CT Head", reason: "Rule out hemorrhagic stroke." },
        { name: "Echocardiogram", reason: "Assess heart function." }
      );
      warnings.push("EMERGENCY: Call ambulance / go to ER immediately.");
    }

    // Sepsis
    if (text.includes("sepsis") || text.includes("septic")) {
      diagnoses.push({
        name: "Sepsis (suspected)",
        reason: "Systemic infection signs — medical emergency.",
      });
      tests.push(
        { name: "Blood cultures", reason: "Identify causative organism." },
        { name: "Lactate level", reason: "Assess severity of sepsis." },
        { name: "CBC + CRP + Procalcitonin", reason: "Infection and inflammation markers." }
      );
      warnings.push("EMERGENCY: Sepsis requires immediate IV antibiotics and hospital admission.");
    }

    // Tuberculosis
    if (text.includes("tuberculosis") || text.includes(" tb ") || text.includes("tb,")) {
      diagnoses.push({
        name: "Tuberculosis (suspected)",
        reason: "TB is a serious infectious disease requiring immediate evaluation.",
      });
      tests.push(
        { name: "Sputum AFB smear & culture", reason: "Confirm TB diagnosis." },
        { name: "Chest X-ray", reason: "Assess lung involvement." },
        { name: "Mantoux / TB Gold test", reason: "TB infection screening." }
      );
    }

    // Dengue / Malaria
    if (text.includes("dengue") || text.includes("malaria")) {
      diagnoses.push({
        name: text.includes("dengue") ? "Dengue fever (suspected)" : "Malaria (suspected)",
        reason: "Infectious disease requiring urgent confirmation.",
      });
      tests.push(
        { name: "Dengue NS1 Antigen / IgM-IgG", reason: "Confirm dengue infection." },
        { name: "Complete Blood Count", reason: "Check platelet count and WBC." },
        { name: "Malaria RDT / Blood smear", reason: "Confirm malaria parasites." }
      );
    }
  }

  // --- MEDIUM RISK KEYWORD CHECK ---
  const mediumMatches = checkKeywords(text, MEDIUM_RISK_KEYWORDS);
  if (mediumMatches.length > 0 && risk === "low") {
    risk = "medium";
  }

  // Chest pain
  if (text.includes("chest pain") || text.includes("chest tightness") || text.includes("shortness of breath")) {
    if (risk !== "high") risk = "high";
    diagnoses.push({
      name: "Cardiorespiratory concern",
      reason: "Chest pain or breathing difficulty is a red flag requiring urgent evaluation.",
    });
    tests.push(
      { name: "ECG", reason: "Screen for cardiac abnormality." },
      { name: "Troponin", reason: "Rule out myocardial infarction." },
      { name: "Chest X-ray", reason: "Assess lungs and heart." }
    );
    warnings.push("Chest pain or breathing difficulty requires immediate medical attention.");
  }

  // Fever
  if (temperature >= 102 || text.includes("fever") || text.includes("high temperature")) {
    if (risk === "low") risk = "medium";
    diagnoses.push({
      name: "Febrile illness / Infection",
      reason: "Fever suggests infectious or inflammatory process.",
    });
    tests.push(
      { name: "CBC", reason: "Assess blood count and infection markers." },
      { name: "CRP / ESR", reason: "Measure systemic inflammation." },
      { name: "Urine routine", reason: "Rule out UTI." }
    );
    precautions.push("Monitor temperature every 4–6 hours.");
    remedies.push("Paracetamol for fever control as directed by doctor.");
    remedies.push("Cool compresses and adequate fluid intake.");
  }

  // Diabetes
  if (text.includes("diabetes") || text.includes("diabetic") || text.includes("blood sugar") || text.includes("sugar")) {
    if (risk === "low") risk = "medium";
    diagnoses.push({
      name: "Diabetes / Blood sugar abnormality",
      reason: "Diabetes mentioned — glycemic assessment required.",
    });
    tests.push(
      { name: "Fasting Blood Sugar", reason: "Baseline glucose level." },
      { name: "HbA1c", reason: "3-month average blood sugar control." },
      { name: "Urine for glucose/ketones", reason: "Assess diabetic complications." }
    );
    precautions.push("Monitor blood sugar levels regularly.");
    precautions.push("Review insulin/medication dosing with doctor.");
  }

  // Skin / rash
  if (text.includes("rash") || text.includes("itch") || text.includes("skin")) {
    diagnoses.push({
      name: "Dermatological condition",
      reason: "Rash or itching may indicate allergy, eczema, infection, or systemic disease.",
    });
    tests.push(
      { name: "Skin examination", reason: "Dermatologist review recommended." },
      { name: "Allergy panel", reason: "If recurrent or exposure-related." }
    );
    precautions.push("Avoid known irritants and harsh soaps.");
  }

  // Hypertension
  if (text.includes("hypertension") || text.includes("high blood pressure") || text.includes("bp high")) {
    if (risk === "low") risk = "medium";
    diagnoses.push({
      name: "Hypertension",
      reason: "High blood pressure is a major cardiovascular risk factor.",
    });
    tests.push(
      { name: "BP monitoring (serial)", reason: "Confirm sustained hypertension." },
      { name: "ECG", reason: "Check for cardiac effects of hypertension." },
      { name: "Renal function tests", reason: "Assess kidney involvement." }
    );
    precautions.push("Reduce sodium intake and manage stress.");
    remedies.push("Regular exercise, DASH diet, and weight management.");
  }

  // Kidney / UTI
  if (text.includes("kidney") || text.includes("uti") || text.includes("urinary") || text.includes("burning urine")) {
    if (risk === "low") risk = "medium";
    diagnoses.push({
      name: "Renal / Urinary tract condition",
      reason: "Kidney or urinary symptoms noted.",
    });
    tests.push(
      { name: "Urine routine & culture", reason: "Identify UTI and causative organism." },
      { name: "Renal ultrasound", reason: "Rule out kidney stones or structural issues." },
      { name: "Serum creatinine / BUN", reason: "Assess kidney function." }
    );
    precautions.push("Increase water intake to 2–3 liters/day.");
  }

  // Fallback if no diagnoses
  if (diagnoses.length === 0) {
    diagnoses.push({
      name: "Non-specific presentation",
      reason: "Symptoms require further clinical evaluation by the doctor.",
    });
    tests.push({
      name: "Complete physical examination",
      reason: "Doctor assessment needed to guide further workup.",
    });
  }

  return {
    risk_level: risk,
    possible_diagnoses: diagnoses,
    recommended_tests: tests,
    precautions,
    natural_remedies: remedies,
    warnings: warnings.length
      ? warnings
      : risk === "low"
        ? ["No immediate red flags detected. Monitor symptoms and follow up if no improvement."]
        : ["Consult a doctor promptly based on the risk level assessed."],
    disclaimer:
      "Clinical decision-support only. This does not replace a licensed doctor's evaluation. All suggestions must be verified clinically.",
  };
}

function asList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
}

function asNamedItems(value: unknown): Array<{ name: string; reason: string }> {
  return asList(value).map((item) => {
    if (typeof item === "object" && item !== null) {
      const obj = item as Record<string, unknown>;
      return {
        name: String(obj.name ?? obj.title ?? "Suggestion"),
        reason: String(obj.reason ?? obj.description ?? obj.rationale ?? ""),
      };
    }
    return { name: String(item), reason: "" };
  });
}

function normalizeAssessment(result: Record<string, unknown>): AssessmentResult {
  let risk = String(result.risk_level ?? "low").toLowerCase().trim();
  if (!["low", "medium", "high"].includes(risk)) risk = "medium";
  const warnings = asList(result.warnings).map(String);
  return {
    risk_level: risk as "low" | "medium" | "high",
    possible_diagnoses: asNamedItems(result.possible_diagnoses),
    recommended_tests: asNamedItems(result.recommended_tests),
    precautions: asList(result.precautions).map(String),
    natural_remedies: asList(result.natural_remedies).map(String),
    warnings: warnings.length ? warnings : ["No immediate red flag detected."],
    disclaimer: String(result.disclaimer ?? "Clinical decision-support only."),
  };
}

async function generateNvidiaAssessment(
  symptoms: string,
  history: Array<{ condition_name: string }>,
  vitals: VitalsInput
): Promise<AssessmentResult> {
  const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || "";
  const NVIDIA_MODEL = process.env.NVIDIA_MODEL || "google/gemma-3n-e4b-it";
  const NVIDIA_BASE_URL =
    process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1/chat/completions";

  const systemPrompt =
    "You are a clinical decision-support assistant for licensed doctors. " +
    "Return JSON only with keys: risk_level, possible_diagnoses, recommended_tests, " +
    "precautions, natural_remedies, warnings, disclaimer. " +
    "risk_level must be low, medium, or high. " +
    "For serious conditions like cancer, heart attack, stroke, sepsis — always set risk_level to high. " +
    "possible_diagnoses and recommended_tests are arrays of {name, reason}. " +
    "precautions, natural_remedies, warnings are string arrays.";

  const response = await fetch(NVIDIA_BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NVIDIA_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify({ symptoms, medical_history: history, vitals }) },
      ],
      temperature: 0.2,
      top_p: 0.7,
      max_tokens: 1200,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content as string;
  let cleaned = content.trim().replace(/```json?\n?/g, "").replace(/```$/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end >= start) cleaned = cleaned.slice(start, end + 1);
  return normalizeAssessment(JSON.parse(cleaned));
}

export async function generateAiAssessment(
  symptoms: string,
  history: Array<{ condition_name: string }>,
  vitals: VitalsInput
): Promise<AssessmentResult> {
  const provider = process.env.AI_PROVIDER?.toLowerCase() || "local";
  const nvidiaKey = process.env.NVIDIA_API_KEY || "";

  if (provider === "nvidia" && nvidiaKey) {
    try {
      return await generateNvidiaAssessment(symptoms, history, vitals);
    } catch {
      const local = generateLocalAssessment(symptoms, history, vitals);
      local.warnings.push("NVIDIA AI unavailable — local rule engine used as fallback.");
      return local;
    }
  }
  return generateLocalAssessment(symptoms, history, vitals);
}
