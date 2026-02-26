'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/stores/useStore';
import { generateDemoData } from '@/lib/data/demo-generator';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Upload,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Plus,
  X,
  FileSpreadsheet,
  Sparkles,
  Eye,
} from 'lucide-react';
import type { IndustrySector, Organization, Department } from '@/types';
import { toast } from 'sonner';

const industryDefaults: Record<string, string[]> = {
  government: ['Information Technology', 'Human Resources', 'Procurement', 'Facilities', 'Legal', 'Finance', 'Communications'],
  healthcare: ['Administration', 'Clinical Operations', 'IT', 'Facilities', 'HR', 'Finance', 'Research'],
  defense: ['Operations', 'Logistics', 'Intelligence', 'IT', 'HR', 'Finance', 'Training'],
  education: ['Academic Affairs', 'Student Services', 'IT', 'Facilities', 'Finance', 'HR', 'Research'],
  technology: ['Engineering', 'Product', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'],
  finance: ['Trading', 'Risk Management', 'IT', 'Compliance', 'HR', 'Operations', 'Client Services'],
  manufacturing: ['Production', 'Quality Control', 'Supply Chain', 'Engineering', 'HR', 'Finance', 'Maintenance'],
  other: ['Operations', 'IT', 'HR', 'Finance', 'Sales', 'Marketing'],
};

const steps = [
  { id: 1, title: 'Organization', icon: Building2 },
  { id: 2, title: 'Departments', icon: Layers },
  { id: 3, title: 'Data Import', icon: Upload },
];

export default function OnboardingPage() {
  const router = useRouter();
  const loadDemoData = useStore((s) => s.loadDemoData);
  const setOrganization = useStore((s) => s.setOrganization);
  const setDepartments = useStore((s) => s.setDepartments);
  const setIsDemo = useStore((s) => s.setIsDemo);

  const [step, setStep] = useState(1);

  // Step 1: Org
  const [orgName, setOrgName] = useState('');
  const [industry, setIndustry] = useState<IndustrySector>('government');
  const [employeeCount, setEmployeeCount] = useState('1,001-5,000');
  const [budget, setBudget] = useState('');

  // Step 2: Departments
  const [depts, setDepts] = useState<string[]>(industryDefaults['government']);

  // Step 3: Import
  const [importMethod, setImportMethod] = useState<'file' | 'demo' | null>(null);

  function handleIndustryChange(value: IndustrySector) {
    setIndustry(value);
    setDepts(industryDefaults[value] || industryDefaults['other']);
  }

  function addDepartment() {
    setDepts([...depts, '']);
  }

  function removeDepartment(idx: number) {
    setDepts(depts.filter((_, i) => i !== idx));
  }

  function updateDepartment(idx: number, value: string) {
    const updated = [...depts];
    updated[idx] = value;
    setDepts(updated);
  }

  function handleDemoLoad() {
    const data = generateDemoData();
    loadDemoData(data);
    toast.success('Demo data loaded successfully');
    router.push('/dashboard');
  }

  function handleFinishSetup() {
    const budgetNum = parseFloat(budget.replace(/[,$]/g, '')) || 10000000;
    const org: Organization = {
      id: 'org-' + Date.now(),
      name: orgName || 'My Organization',
      industry,
      employeeCount,
      annualBudget: budgetNum,
      createdAt: new Date(),
    };
    setOrganization(org);

    const departments: Department[] = depts
      .filter((d) => d.trim())
      .map((name, i) => ({
        id: `dept-custom-${i + 1}`,
        name,
        organizationId: org.id,
        allocatedBudget: budgetNum / depts.length,
      }));
    setDepartments(departments);
    setIsDemo(false);
    toast.success('Organization setup complete');
    router.push('/dashboard');
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      toast.info(`File "${files[0].name}" received. Processing coming soon.`);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Eye className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">WasteWatch</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">Set up your organization</h1>
          <p className="text-muted-foreground text-sm">
            Get started in under a minute
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                  step === s.id
                    ? 'bg-primary text-primary-foreground'
                    : step > s.id
                    ? 'bg-savings/20 text-savings'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {step > s.id ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <s.icon className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{s.title}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={cn('w-8 h-0.5', step > s.id ? 'bg-savings' : 'bg-border')} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Organization Name</label>
                    <Input
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="e.g., Department of Commerce"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Industry Sector</label>
                    <Select value={industry} onValueChange={(v) => handleIndustryChange(v as IndustrySector)}>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="government">Government</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="defense">Defense</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Employee Count</label>
                    <Select value={employeeCount} onValueChange={setEmployeeCount}>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-100">1-100</SelectItem>
                        <SelectItem value="101-500">101-500</SelectItem>
                        <SelectItem value="501-1,000">501-1,000</SelectItem>
                        <SelectItem value="1,001-5,000">1,001-5,000</SelectItem>
                        <SelectItem value="5,001-10,000">5,001-10,000</SelectItem>
                        <SelectItem value="10,000+">10,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Annual Budget</label>
                    <Input
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g., $50,000,000"
                      className="h-10"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    We've suggested departments based on your industry. Add, remove, or rename as needed.
                  </p>
                  <div className="space-y-2 mb-4">
                    {depts.map((dept, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          value={dept}
                          onChange={(e) => updateDepartment(i, e.target.value)}
                          placeholder="Department name"
                          className="h-9"
                        />
                        <button
                          onClick={() => removeDepartment(i)}
                          className="p-2 text-muted-foreground hover:text-waste transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addDepartment}
                    className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Department
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="space-y-4">
                {/* Demo data option */}
                <Card
                  className={cn(
                    'cursor-pointer transition-colors hover:border-primary/30',
                    importMethod === 'demo' && 'border-primary'
                  )}
                  onClick={() => setImportMethod('demo')}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Load Demo Data</h3>
                      <p className="text-xs text-muted-foreground">
                        Explore WasteWatch with a realistic government agency dataset including planted anomalies
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                      Recommended
                    </Badge>
                  </CardContent>
                </Card>

                {/* File upload option */}
                <Card
                  className={cn(
                    'cursor-pointer transition-colors hover:border-primary/30',
                    importMethod === 'file' && 'border-primary'
                  )}
                  onClick={() => setImportMethod('file')}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 rounded-lg bg-muted">
                        <FileSpreadsheet className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">Upload Spreadsheet</h3>
                        <p className="text-xs text-muted-foreground">
                          Import CSV or Excel file with transaction data
                        </p>
                      </div>
                    </div>
                    {importMethod === 'file' && (
                      <div
                        className="border-2 border-dashed border-border rounded-lg p-8 text-center"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      >
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Drag & drop a CSV or Excel file here
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          or click to browse
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <div>
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 h-10 px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <button
                onClick={() => router.push('/')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
          <div>
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1 h-10 px-6 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : importMethod === 'demo' ? (
              <button
                onClick={handleDemoLoad}
                className="flex items-center gap-1 h-10 px-6 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Sparkles className="w-4 h-4" /> Load Demo & Explore
              </button>
            ) : (
              <button
                onClick={handleFinishSetup}
                className="flex items-center gap-1 h-10 px-6 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Finish Setup <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
