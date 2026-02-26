'use client';

import { useStore } from '@/stores/useStore';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Building2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function Header() {
  const organization = useStore((s) => s.organization);
  const darkMode = useStore((s) => s.darkMode);
  const setDarkMode = useStore((s) => s.setDarkMode);
  const globalSearch = useStore((s) => s.globalSearch);
  const setGlobalSearch = useStore((s) => s.setGlobalSearch);
  const fiscalPeriod = useStore((s) => s.fiscalPeriod);
  const setFiscalPeriod = useStore((s) => s.setFiscalPeriod);
  const flags = useStore((s) => s.flags);
  const isDemo = useStore((s) => s.isDemo);

  const newFlagCount = flags.filter((f) => f.status === 'new').length;

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left: Org info */}
      <div className="flex items-center gap-3">
        <Building2 className="w-5 h-5 text-muted-foreground" />
        <div>
          <h2 className="text-sm font-semibold leading-tight">
            {organization?.name || 'WasteWatch'}
          </h2>
          {isDemo && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              Demo Mode
            </Badge>
          )}
        </div>
      </div>

      {/* Center: Search + Period */}
      <div className="flex items-center gap-3">
        <Select value={fiscalPeriod} onValueChange={setFiscalPeriod}>
          <SelectTrigger className="w-[130px] h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FY2025">FY 2025</SelectItem>
            <SelectItem value="FY2024">FY 2024</SelectItem>
            <SelectItem value="Q1">Q1</SelectItem>
            <SelectItem value="Q2">Q2</SelectItem>
            <SelectItem value="Q3">Q3</SelectItem>
            <SelectItem value="Q4">Q4</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search vendors, departments, flags..."
            className="pl-9 w-72 h-9 text-sm"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <Bell className="w-4 h-4" />
          {newFlagCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-waste text-[10px] text-white rounded-full flex items-center justify-center font-bold">
              {newFlagCount > 9 ? '9+' : newFlagCount}
            </span>
          )}
        </button>

        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary ml-1">
          AD
        </div>
      </div>
    </header>
  );
}
