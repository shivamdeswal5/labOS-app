'use client';

import * as React from 'react';
import { Terminal, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Instrument {
  id: string;
  name: string;
  model: string;
  department: string;
  interfaceType: 'RS-232 Serial' | 'TCP/IP Socket' | 'ASTM 1394-97' | 'HL7 v2.5';
  port: string;
  status: 'ONLINE' | 'IDLE' | 'STANDBY';
  lastHandshake: string;
}

const INSTRUMENTS: Instrument[] = [
  {
    id: 'inst-01',
    name: 'Sysmex Automated Hematology',
    model: 'XP-300 (3-Part Diff)',
    department: 'Hematology',
    interfaceType: 'RS-232 Serial',
    port: 'COM1 / 9600-8-N-1',
    status: 'ONLINE',
    lastHandshake: '12 seconds ago',
  },
  {
    id: 'inst-02',
    name: 'Erba Clinical Chemistry',
    model: 'Chem 5x Semi-Automated',
    department: 'Biochemistry',
    interfaceType: 'TCP/IP Socket',
    port: '192.168.1.104:5000',
    status: 'IDLE',
    lastHandshake: '4 minutes ago',
  },
  {
    id: 'inst-03',
    name: 'Roche Cobas Biochemistry',
    model: 'c 111 Analyzer',
    department: 'Biochemistry',
    interfaceType: 'ASTM 1394-97',
    port: '192.168.1.108:8000',
    status: 'ONLINE',
    lastHandshake: 'Just now',
  },
];

const PACKET_FRAMES = [
  '[ASTM] <ACK> Received from Sysmex XP-300 (COM1)',
  '[ASTM] <STX>1H|\\^&|||Sysmex^XP300||||||||202609111124<CR><ETX>4F',
  '[ASTM] <STX>2P|1||MRN-8821||Gupta^Ramesh||19720412|M<CR><ETX>9A',
  '[ASTM] <STX>3O|1|BAR-9902||^^^HEM-01|R|202609111122|||||A<CR><ETX>12',
  '[ASTM] <STX>4R|1|^^^WBC|8.4|10*3/uL|4.0-11.0|N||F<CR><ETX>E3',
  '[ASTM] <STX>5R|2|^^^RBC|4.82|10*6/uL|4.5-5.5|N||F<CR><ETX>88',
  '[ASTM] <STX>6R|3|^^^HGB|14.2|g/dL|13.0-17.0|N||F<CR><ETX>B1',
  '[ASTM] <STX>7L|1|N<CR><ETX>03',
  '[ASTM] <EOT> Transmission Complete. Accession R-1048 populated.',
];

export function AnalyzerInterfacingSection() {
  const [autoQuery, setAutoQuery] = React.useState(true);
  const [logs] = React.useState(PACKET_FRAMES);

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl p-6 border border-border shadow-sm space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              Bi-directional LIS Interface
            </span>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              Analyzer Gateway &amp; Telemetry Feed
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Direct RS-232 / TCP-IP bi-directional querying automatically captures analyzer results into accession worklists without manual transcription.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">Auto Barcode Query:</span>
            <button
              type="button"
              onClick={() => setAutoQuery(!autoQuery)}
              className={cn(
                'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                autoQuery ? 'bg-primary' : 'bg-muted',
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out',
                  autoQuery ? 'translate-x-4' : 'translate-x-0',
                )}
              />
            </button>
          </div>
        </div>

        {/* Connected Instruments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INSTRUMENTS.map((inst) => (
            <div
              key={inst.id}
              className="bg-muted/30 border border-border rounded-lg p-4 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase">
                    {inst.department}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full',
                        inst.status === 'ONLINE'
                          ? 'bg-emerald-500 animate-pulse'
                          : 'bg-amber-500',
                      )}
                    />
                    <span className="font-mono text-[11px] font-semibold text-foreground">
                      {inst.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-foreground">{inst.name}</h3>
                  <p className="text-xs font-mono text-muted-foreground">{inst.model}</p>
                </div>

                <div className="bg-card p-2.5 rounded border border-border font-mono text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Protocol:</span>
                    <span className="text-foreground">{inst.interfaceType}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Endpoint:</span>
                    <span className="text-foreground">{inst.port}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span>Last packet: {inst.lastHandshake}</span>
                <RefreshCw className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-pointer" />
              </div>
            </div>
          ))}
        </div>

        {/* Live Packet Monitor Terminal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-primary" />
              <span>Live Serial COM / TCP Telemetry Console</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
              ● STREAM ACTIVE (2400 B/S)
            </span>
          </div>

          <div className="bg-zinc-950 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto space-y-1 shadow-inner max-h-48">
            {logs.map((line, i) => (
              <div key={i} className="leading-relaxed opacity-90 hover:opacity-100">
                <span className="text-zinc-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                <span className={line.includes('Complete') ? 'text-emerald-400 font-semibold' : 'text-zinc-200'}>
                  {line}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
