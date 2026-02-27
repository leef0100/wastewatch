'use client';

import { useState } from 'react';
import { useStore } from '@/stores/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, Bell, Database, Palette, AlertTriangle, Trash2, Users } from 'lucide-react';

export default function SettingsPage() {
  const organization = useStore((s) => s.organization);
  const darkMode = useStore((s) => s.darkMode);
  const setDarkMode = useStore((s) => s.setDarkMode);
  const clearData = useStore((s) => s.clearData);
  const departments = useStore((s) => s.departments);
  const transactions = useStore((s) => s.transactions);

  const [approvalThreshold, setApprovalThreshold] = useState(5000);
  const [outlierSensitivity, setOutlierSensitivity] = useState(2.5);
  const [concentrationThreshold, setConcentrationThreshold] = useState(35);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [criticalOnly, setCriticalOnly] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl">
      <div><h1 className="font-heading text-2xl font-bold">Settings</h1><p className="text-muted-foreground text-sm">Configure detection rules, notifications, and preferences</p></div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4" /> Organization</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Organization Name</label><Input value={organization?.name || ''} readOnly className="h-9" /></div>
            <div><label className="text-sm font-medium mb-1 block">Industry</label><Input value={organization?.industry || ''} readOnly className="h-9 capitalize" /></div>
          </div>
          <div className="text-xs text-muted-foreground">{departments.length} departments — {transactions.length} transactions loaded</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Anomaly Detection Thresholds</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div><div className="flex items-center justify-between mb-2"><label className="text-sm font-medium">Split Transaction Threshold</label><span className="text-sm font-data font-semibold">${approvalThreshold.toLocaleString()}</span></div><Slider value={[approvalThreshold]} onValueChange={(v) => setApprovalThreshold(v[0])} min={1000} max={25000} step={500} /><p className="text-xs text-muted-foreground mt-1">Flags multiple transactions just below this amount</p></div>
          <div><div className="flex items-center justify-between mb-2"><label className="text-sm font-medium">Outlier Sensitivity (z-score)</label><span className="text-sm font-data font-semibold">{outlierSensitivity.toFixed(1)}</span></div><Slider value={[outlierSensitivity * 10]} onValueChange={(v) => setOutlierSensitivity(v[0] / 10)} min={15} max={40} step={1} /><p className="text-xs text-muted-foreground mt-1">Lower = more sensitive. Default: 2.5</p></div>
          <div><div className="flex items-center justify-between mb-2"><label className="text-sm font-medium">Vendor Concentration Threshold</label><span className="text-sm font-data font-semibold">{concentrationThreshold}%</span></div><Slider value={[concentrationThreshold]} onValueChange={(v) => setConcentrationThreshold(v[0])} min={20} max={60} step={5} /><p className="text-xs text-muted-foreground mt-1">Flag vendors exceeding this % of department spend</p></div>
          <button onClick={() => toast.success('Thresholds saved')} className="h-9 px-4 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">Save Thresholds</button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between"><div><div className="text-sm font-medium">Email Alerts</div><div className="text-xs text-muted-foreground">Receive notifications for new flags</div></div><Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} /></div>
          <div className="flex items-center justify-between"><div><div className="text-sm font-medium">Critical Only</div><div className="text-xs text-muted-foreground">Only alert for critical severity</div></div><Switch checked={criticalOnly} onCheckedChange={setCriticalOnly} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Palette className="w-4 h-4" /> Appearance</CardTitle></CardHeader>
        <CardContent><div className="flex items-center justify-between"><div><div className="text-sm font-medium">Dark Mode</div><div className="text-xs text-muted-foreground">Toggle theme</div></div><Switch checked={darkMode} onCheckedChange={setDarkMode} /></div></CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4" /> User Roles</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 rounded-lg border border-border"><div><span className="text-sm font-medium">Admin Demo</span><span className="text-xs text-muted-foreground ml-2">admin@wastewatch.example</span></div><Badge>Admin</Badge></div>
          <p className="text-xs text-muted-foreground mt-2">Roles: Admin (full access), Analyst (view + manage flags), Viewer (read-only)</p>
        </CardContent>
      </Card>

      <Card className="border-waste/20">
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Database className="w-4 h-4" /> Data Management</CardTitle></CardHeader>
        <CardContent><div className="flex items-center justify-between"><div><div className="text-sm font-medium text-waste">Clear All Data</div><div className="text-xs text-muted-foreground">Remove all data and return to landing page</div></div><button onClick={() => { clearData(); toast.success('All data cleared'); window.location.href = '/'; }} className="h-8 px-4 text-xs font-medium border border-waste/30 text-waste rounded-lg hover:bg-waste/10 transition-colors flex items-center gap-1"><Trash2 className="w-3 h-3" /> Clear Data</button></div></CardContent>
      </Card>
    </div>
  );
}
