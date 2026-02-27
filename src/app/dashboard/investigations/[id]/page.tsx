'use client';

import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/stores/useStore';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EntityNetworkGraph } from '@/components/investigation/EntityNetworkGraph';
import {
  ArrowLeft,
  Network,
  FileText,
  Scale,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  Loader2,
  Shield,
  Users,
  DollarSign,
  Building2,
  User,
  Landmark,
  Banknote,
  ExternalLink,
} from 'lucide-react';
import type { Entity, EntityRelationship, InvestigationDocument, Finding } from '@/types';

type Tab = 'network' | 'documents' | 'complaint' | 'timeline';

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-waste/10 text-waste border-waste/20',
  warning: 'bg-warning-accent/10 text-warning-accent border-warning-accent/20',
  info: 'bg-primary/10 text-primary border-primary/20',
};

const ENTITY_ICONS: Record<string, typeof Building2> = {
  provider: Building2,
  shell_company: AlertTriangle,
  individual: User,
  government_entity: Landmark,
  bank_account: Banknote,
};

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function formatFullCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
}

export default function InvestigationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const investigations = useStore((s) => s.investigations);
  const organization = useStore((s) => s.organization);

  const [activeTab, setActiveTab] = useState<Tab>('network');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<InvestigationDocument | null>(null);
  const [expandedFindings, setExpandedFindings] = useState<Set<string>>(new Set());
  const [generatingComplaint, setGeneratingComplaint] = useState(false);
  const [complaintReady, setComplaintReady] = useState(true);

  if (!organization) {
    router.push('/');
    return null;
  }

  const investigation = investigations.find((i) => i.id === params.id);
  if (!investigation) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Investigation not found</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Network }[] = [
    { id: 'network', label: 'Entity Network', icon: Network },
    { id: 'documents', label: `Evidence (${investigation.documents.length})`, icon: FileText },
    { id: 'complaint', label: 'FCA Complaint', icon: Scale },
    { id: 'timeline', label: 'Timeline', icon: Clock },
  ];

  function toggleFinding(id: string) {
    setExpandedFindings((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleGenerateComplaint() {
    setGeneratingComplaint(true);
    // Simulate AI generation
    setTimeout(() => {
      setGeneratingComplaint(false);
      setComplaintReady(true);
    }, 3000);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/dashboard/investigations')}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Investigations
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Scale className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">{investigation.title}</h1>
            </div>
            <p className="text-sm text-muted-foreground max-w-3xl">{investigation.summary}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl font-bold font-data text-waste">
              {formatCurrency(investigation.totalFraudAmount)}
            </div>
            <div className="text-xs text-muted-foreground">estimated fraud</div>
            {investigation.complaint && (
              <div className="text-sm text-primary mt-1 font-data font-semibold">
                {formatCurrency(investigation.complaint.trebleDamages)} treble
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Entities', value: investigation.entities.length, icon: Users, color: 'text-primary' },
          { label: 'Connections', value: investigation.relationships.length, icon: Network, color: 'text-warning-accent' },
          { label: 'Evidence Docs', value: investigation.documents.length, icon: FileText, color: 'text-savings' },
          { label: 'Findings', value: investigation.documents.reduce((s, d) => s + (d.aiAnalysis?.findings.length || 0), 0), icon: AlertTriangle, color: 'text-waste' },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              {stat.label}
            </div>
            <div className="text-xl font-bold font-data">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'network' && (
          <motion.div
            key="network"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Entity Relationship Network</h2>
                <p className="text-sm text-muted-foreground">Interactive visualization of entities and their connections. Click nodes for details.</p>
              </div>
            </div>

            <EntityNetworkGraph
              entities={investigation.entities}
              relationships={investigation.relationships}
              onEntityClick={setSelectedEntity}
            />

            {/* Entity detail panel */}
            <AnimatePresence>
              {selectedEntity && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-card border border-border rounded-md p-5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const Icon = ENTITY_ICONS[selectedEntity.type] || Shield;
                        return <Icon className="w-5 h-5 text-primary" />;
                      })()}
                      <div>
                        <h3 className="font-semibold text-lg">{selectedEntity.name}</h3>
                        <span className="text-xs text-muted-foreground capitalize">{selectedEntity.type.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedEntity(null)}
                      className="text-muted-foreground hover:text-foreground text-sm cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{selectedEntity.description}</p>
                  {selectedEntity.totalAmount && (
                    <div className="mb-4">
                      <span className="text-xs text-muted-foreground">Total Amount</span>
                      <div className="text-xl font-bold font-data text-waste">{formatCurrency(selectedEntity.totalAmount)}</div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(selectedEntity.metadata).map(([key, value]) => (
                      <div key={key} className="bg-muted/50 rounded-lg p-2.5">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                        <div className="text-xs font-medium mt-0.5 break-words">{value}</div>
                      </div>
                    ))}
                  </div>
                  {/* Show related connections */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold mb-2">Connections</h4>
                    <div className="space-y-2">
                      {investigation.relationships
                        .filter((r) => r.sourceId === selectedEntity.id || r.targetId === selectedEntity.id)
                        .map((r) => {
                          const otherEntity = investigation.entities.find(
                            (e) => e.id === (r.sourceId === selectedEntity.id ? r.targetId : r.sourceId)
                          );
                          const direction = r.sourceId === selectedEntity.id ? '→' : '←';
                          return (
                            <div key={r.id} className="flex items-center gap-2 text-xs">
                              <span className="text-muted-foreground">{direction}</span>
                              <span className="font-medium">{otherEntity?.name}</span>
                              <span className="text-muted-foreground">({r.label})</span>
                              {r.amount && <span className="font-data text-primary ml-auto">{formatCurrency(r.amount)}</span>}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {activeTab === 'documents' && (
          <motion.div
            key="documents"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold">AI-Analyzed Evidence</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Document list */}
              <div className="space-y-2">
                {investigation.documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                      selectedDoc?.id === doc.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm font-medium truncate">{doc.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground capitalize">{doc.type.replace(/_/g, ' ')}</span>
                      {doc.aiAnalysis && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          doc.aiAnalysis.riskScore >= 90 ? 'bg-waste/10 text-waste' :
                          doc.aiAnalysis.riskScore >= 70 ? 'bg-warning-accent/10 text-warning-accent' :
                          'bg-savings/10 text-savings'
                        }`}>
                          Risk: {doc.aiAnalysis.riskScore}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Document detail */}
              <div className="lg:col-span-2">
                {selectedDoc ? (
                  <div className="bg-card border border-border rounded-md p-5 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedDoc.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{selectedDoc.summary}</p>
                    </div>

                    {selectedDoc.aiAnalysis && (
                      <>
                        <div className="flex items-center gap-4 bg-muted/50 rounded-lg p-3">
                          <div>
                            <div className="text-xs text-muted-foreground">AI Risk Score</div>
                            <div className={`text-2xl font-bold font-data ${
                              selectedDoc.aiAnalysis.riskScore >= 90 ? 'text-waste' :
                              selectedDoc.aiAnalysis.riskScore >= 70 ? 'text-warning-accent' : 'text-savings'
                            }`}>
                              {selectedDoc.aiAnalysis.riskScore}/100
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Findings</div>
                            <div className="text-2xl font-bold font-data">{selectedDoc.aiAnalysis.findings.length}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Processing Time</div>
                            <div className="text-2xl font-bold font-data">{selectedDoc.aiAnalysis.processingTime}s</div>
                          </div>
                        </div>

                        {/* Findings */}
                        <div>
                          <h4 className="text-sm font-semibold mb-2">AI Findings</h4>
                          <div className="space-y-2">
                            {selectedDoc.aiAnalysis.findings.map((finding) => (
                              <div
                                key={finding.id}
                                className={`border rounded-lg overflow-hidden ${SEVERITY_STYLES[finding.severity]}`}
                              >
                                <button
                                  onClick={() => toggleFinding(finding.id)}
                                  className="w-full flex items-center gap-2 p-3 text-left cursor-pointer"
                                >
                                  {expandedFindings.has(finding.id) ? (
                                    <ChevronDown className="w-4 h-4 shrink-0" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 shrink-0" />
                                  )}
                                  <span className="text-xs font-medium uppercase">{finding.category}</span>
                                  <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${
                                    finding.severity === 'critical' ? 'bg-waste/20' : 'bg-warning-accent/20'
                                  }`}>
                                    {finding.severity}
                                  </span>
                                </button>
                                <AnimatePresence>
                                  {expandedFindings.has(finding.id) && (
                                    <motion.div
                                      initial={{ height: 0 }}
                                      animate={{ height: 'auto' }}
                                      exit={{ height: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="px-3 pb-3 space-y-2">
                                        <p className="text-xs leading-relaxed">{finding.description}</p>
                                        <div className="bg-background/50 rounded p-2">
                                          <div className="text-[10px] text-muted-foreground uppercase mb-1">Evidence</div>
                                          <p className="text-xs">{finding.evidence}</p>
                                        </div>
                                        {finding.relatedEntities.length > 0 && (
                                          <div className="flex flex-wrap gap-1">
                                            {finding.relatedEntities.map((entId) => {
                                              const ent = investigation.entities.find((e) => e.id === entId);
                                              return ent ? (
                                                <span key={entId} className="text-[10px] bg-background/50 px-1.5 py-0.5 rounded">
                                                  {ent.name}
                                                </span>
                                              ) : null;
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Suggested actions */}
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Suggested Actions</h4>
                          <ul className="space-y-1.5">
                            {selectedDoc.aiAnalysis.suggestedActions.map((action, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                <CheckCircle2 className="w-3.5 h-3.5 text-savings shrink-0 mt-0.5" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-card border border-border rounded-md text-muted-foreground">
                    <div className="text-center">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Select a document to view AI analysis</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'complaint' && (
          <motion.div
            key="complaint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {investigation.complaint && complaintReady ? (
              <div className="space-y-6">
                {/* Complaint header */}
                <div className="bg-card border border-border rounded-md p-6">
                  <div className="text-center mb-6">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">United States District Court</p>
                    <p className="text-sm font-semibold">{investigation.complaint.jurisdiction}</p>
                    <div className="w-16 h-px bg-border mx-auto my-3" />
                    <p className="text-xs text-muted-foreground">Case No. {investigation.complaint.caseNumber}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Relator (Whistleblower)</h4>
                      <p className="text-sm font-medium">{investigation.complaint.relator}</p>
                    </div>
                    <div>
                      <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Defendants</h4>
                      <ul className="space-y-1">
                        {investigation.complaint.defendants.map((d, i) => (
                          <li key={i} className="text-sm">{d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 bg-muted/50 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Damages</div>
                      <div className="text-xl font-bold font-data text-waste">{formatCurrency(investigation.complaint.totalDamages)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Treble Damages</div>
                      <div className="text-xl font-bold font-data text-waste">{formatCurrency(investigation.complaint.trebleDamages)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Per-Claim Penalties</div>
                      <div className="text-xl font-bold font-data text-primary">$13,946-$27,894</div>
                      <div className="text-[10px] text-muted-foreground">× ~47,832 claims</div>
                    </div>
                  </div>
                </div>

                {/* Counts */}
                <div className="bg-card border border-border rounded-md p-6">
                  <h3 className="font-semibold text-lg mb-4">Counts</h3>
                  <div className="space-y-4">
                    {investigation.complaint.counts.map((count) => (
                      <div key={count.number} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">
                            Count {count.number}: {count.title}
                          </h4>
                          <span className="font-data text-sm text-waste font-semibold">{formatFullCurrency(count.amount)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{count.statute}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{count.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Factual Allegations */}
                <div className="bg-card border border-border rounded-md p-6">
                  <h3 className="font-semibold text-lg mb-4">Factual Allegations</h3>
                  <div className="space-y-4">
                    {investigation.complaint.factualAllegations.map((allegation, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="text-xs font-data text-muted-foreground shrink-0 w-6 text-right mt-0.5">{i + 1}.</span>
                        <p className="text-sm leading-relaxed text-muted-foreground">{allegation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Download button */}
                <div className="flex justify-center">
                  <button
                    className="flex items-center gap-2 h-10 px-6 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                    onClick={() => {
                      const text = [
                        `UNITED STATES DISTRICT COURT`,
                        investigation.complaint!.jurisdiction.toUpperCase(),
                        '',
                        `Case No. ${investigation.complaint!.caseNumber}`,
                        '',
                        `COMPLAINT UNDER THE FALSE CLAIMS ACT`,
                        `31 U.S.C. §§ 3729-3733`,
                        '',
                        `Relator: ${investigation.complaint!.relator}`,
                        '',
                        'DEFENDANTS:',
                        ...investigation.complaint!.defendants.map((d) => `  - ${d}`),
                        '',
                        'COUNTS:',
                        ...investigation.complaint!.counts.map((c) => `\nCount ${c.number}: ${c.title}\n${c.statute}\n${c.description}\nAmount: ${formatFullCurrency(c.amount)}`),
                        '',
                        'FACTUAL ALLEGATIONS:',
                        ...investigation.complaint!.factualAllegations.map((a, i) => `\n${i + 1}. ${a}`),
                        '',
                        `Total Damages: ${formatFullCurrency(investigation.complaint!.totalDamages)}`,
                        `Treble Damages: ${formatFullCurrency(investigation.complaint!.trebleDamages)}`,
                        '',
                        `Generated by WasteWatch AI on ${investigation.complaint!.generatedAt.toLocaleDateString()}`,
                      ].join('\n');
                      const blob = new Blob([text], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `FCA-Complaint-${investigation.complaint!.caseNumber}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="w-4 h-4" />
                    Download Draft Complaint
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                {generatingComplaint ? (
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="font-semibold text-lg">Generating FCA Complaint...</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Analyzing {investigation.documents.length} documents, {investigation.entities.length} entities,
                      and {investigation.relationships.length} connections
                    </p>
                    <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                      <p>Identifying statutory violations...</p>
                      <p>Calculating damages and penalties...</p>
                      <p>Drafting factual allegations from evidence...</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Scale className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="font-semibold text-lg mb-2">Generate FCA Complaint</p>
                    <p className="text-sm text-muted-foreground max-w-md mb-6">
                      AI will analyze all evidence documents, entity relationships, and financial flows
                      to generate a draft False Claims Act complaint with specific factual allegations.
                    </p>
                    <button
                      onClick={handleGenerateComplaint}
                      className="h-11 px-6 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Scale className="w-4 h-4" />
                      Generate Draft Complaint
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'timeline' && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-lg font-semibold mb-4">Investigation Timeline</h2>
            <div className="relative pl-8">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-6">
                {investigation.timeline
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((event, i) => {
                    const typeColors: Record<string, string> = {
                      discovery: 'bg-waste',
                      evidence: 'bg-warning-accent',
                      filing: 'bg-primary',
                      action: 'bg-savings',
                      milestone: 'bg-muted-foreground',
                    };
                    return (
                      <div
                        key={event.id}
                        className="relative"
                      >
                        <div className={`absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-sm ${typeColors[event.type]} ring-4 ring-background`} />
                        <div className="bg-card border border-border rounded-md p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-data text-muted-foreground">
                              {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${
                              event.type === 'discovery' ? 'bg-waste/10 text-waste' :
                              event.type === 'evidence' ? 'bg-warning-accent/10 text-warning-accent' :
                              event.type === 'filing' ? 'bg-primary/10 text-primary' :
                              event.type === 'action' ? 'bg-savings/10 text-savings' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {event.type}
                            </span>
                          </div>
                          <h4 className="font-semibold text-sm">{event.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
