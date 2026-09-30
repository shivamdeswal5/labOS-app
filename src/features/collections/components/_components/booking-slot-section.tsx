'use client';

import * as React from 'react';
import { AlertCircle } from 'lucide-react';

export const TIME_SLOTS = [
  '06:30 - 07:30 AM (Fasting)',
  '07:30 - 08:30 AM (Fasting)',
  '08:30 - 09:30 AM (Fasting)',
  '09:30 - 11:00 AM',
  '11:00 - 12:30 PM',
  '04:00 - 05:30 PM',
];

interface BookingSlotSectionProps {
  preferredDate: string;
  onPreferredDateChange: (val: string) => void;
  timeSlot: string;
  onTimeSlotChange: (val: string) => void;
  isFastingRequired: boolean;
  onFastingChange: (val: boolean) => void;
}

export function BookingSlotSection({
  preferredDate,
  onPreferredDateChange,
  timeSlot,
  onTimeSlotChange,
  isFastingRequired,
  onFastingChange,
}: BookingSlotSectionProps) {
  return (
    <div className="space-y-3 pt-2 border-t border-border">
      <h3 className="font-mono text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
        03. Date, Slot &amp; Fasting Requirement
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-foreground font-medium mb-1">Preferred Date</label>
          <input
            type="date"
            required
            value={preferredDate}
            onChange={(e) => onPreferredDateChange(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-foreground font-medium mb-1">Time Window</label>
          <select
            value={timeSlot}
            onChange={(e) => onTimeSlotChange(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-3 rounded-md bg-secondary/50 border border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <div>
            <div className="font-medium text-foreground">12-Hour Overnight Fasting Required</div>
            <div className="text-[11px] text-muted-foreground">
              Enforces fasting alert on patient SMS/WhatsApp notifications.
            </div>
          </div>
        </div>
        <input
          type="checkbox"
          checked={isFastingRequired}
          onChange={(e) => onFastingChange(e.target.checked)}
          className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
        />
      </div>
    </div>
  );
}
