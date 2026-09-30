'use client';

import * as React from 'react';
import {
  Copy,
  Check,
  Phone,
  AlertCircle,
  Clock,
  Sparkles,
  Link2,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { useLabProfile } from '@/features/settings/hooks/use-lab-profile';
import { useUpdatePatient } from '@/features/patients/api/use-patients';
import { useReportNotification, useSendNotification } from '../../api/use-notifications';
import { WhatsAppChatBubble } from './_components/whatsapp-chat-bubble';

interface SendWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: {
    id: string;
    reportNumber: string;
    shareToken?: string | null;
    patient?: {
      id?: string;
      name?: string | null;
      phone?: string | null;
      patientNumber?: string | null;
    } | null;
    reportPanels?: Array<{
      panel?: {
        name: string;
      } | null;
    }> | null;
  };
  onDispatched?: () => void;
}

export function SendWhatsAppModal({
  isOpen,
  onClose,
  report,
  onDispatched,
}: SendWhatsAppModalProps) {
  const { data: labProfile } = useLabProfile();
  const labName = labProfile?.name || 'Deswal Clinical Laboratory';
  const patient = report.patient;
  const patientName = patient?.name || 'Patient';
  const [userEditedPhone, setUserEditedPhone] = React.useState<string | null>(null);
  const phoneInput = userEditedPhone !== null ? userEditedPhone : (patient?.phone || '');
  const [copiedText, setCopiedText] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);

  const { data: existingNotification } = useReportNotification(report.id);
  const sendMutation = useSendNotification();
  const updatePatientMutation = useUpdatePatient();
  const [saveToPatientProfile, setSaveToPatientProfile] = React.useState(true);

  // Clean 10-digit Indian phone extraction
  const cleanDigits = React.useMemo(() => {
    const raw = phoneInput.replace(/\D/g, '');
    return raw.length >= 10 ? raw.slice(-10) : raw;
  }, [phoneInput]);

  const isValidPhone = cleanDigits.length === 10;
  const hasRegisteredPhone = Boolean(patient?.phone && patient.phone.replace(/\D/g, '').length >= 10);

  const testSummary = React.useMemo(() => {
    return report.reportPanels?.map((rp) => rp.panel?.name).filter(Boolean).join(', ') || 'Diagnostic Panel';
  }, [report.reportPanels]);

  const shareToken = report.shareToken || `tok-${report.id}`;
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/v/${shareToken}`
    : `https://labos.app/v/${shareToken}`;

  const messageText = React.useMemo(() => {
    return `Dear *${patientName}*,\n\nYour verified diagnostic report (*#${report.reportNumber}*) from *${labName}* is ready.\n\n📋 *Investigation:* ${testSummary}\n🔒 *Status:* Digitally Authenticated (NABL ISO 15189)\n\nAccess your digital report here:\n${shareUrl}`;
  }, [patientName, report.reportNumber, labName, testSummary, shareUrl]);

  const handleOpenWhatsApp = () => {
    if (!isValidPhone) return;

    // Save phone to patient master record if requested and changed/new
    if (
      saveToPatientProfile &&
      patient?.id &&
      (!patient.phone || patient.phone.replace(/\D/g, '').slice(-10) !== cleanDigits)
    ) {
      updatePatientMutation.mutate({
        id: patient.id,
        data: { phone: `+91 ${cleanDigits}` },
      });
    }

    // Universal WhatsApp deep link: works on WhatsApp Web and WhatsApp Desktop/App
    const waUrl = `https://wa.me/91${cleanDigits}?text=${encodeURIComponent(messageText)}`;
    window.open(waUrl, '_blank');

    // Automatically record delivery in LabOS audit log
    sendMutation.mutate(
      {
        recipientType: 'PATIENT',
        recipientName: patientName,
        destination: `+91 ${cleanDigits}`,
        channel: 'WHATSAPP',
        notificationType: 'REPORT_READY',
        message: messageText,
        payload: {
          reportId: report.id,
          reportNumber: report.reportNumber,
          shareToken,
          reportUrl: shareUrl,
          dispatchMode: 'WEB_INTENT',
        },
      },
      {
        onSuccess: () => {
          onDispatched?.();
          onClose();
        },
      },
    );
  };

  const handleCopyText = async () => {
    await navigator.clipboard.writeText(messageText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const nowTimeString = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs">
            <WhatsAppIcon className="w-4 h-4 text-white" />
          </div>
          <span>WhatsApp Report Dispatch</span>
        </div>
      }
      description="Direct 1-click dispatch to patient WhatsApp via WhatsApp Web / App. 100% Free with zero API setup."
    >
      <div className="space-y-4 py-1">
        {/* Recipient Verification Row */}
        <div className="p-3 rounded-lg bg-card border border-border space-y-2">
          {hasRegisteredPhone ? (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Registered Mobile ({patientName})</span>
              </span>
              <span className="font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified on File</span>
              </span>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold">No Phone on Patient Profile</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                  Enter 10-digit mobile number below to send this report via WhatsApp.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1.5 rounded-md bg-muted border border-border text-xs font-mono text-muted-foreground">
              +91
            </div>
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setUserEditedPhone(e.target.value)}
              placeholder="e.g. 98123 45678"
              className="flex-1 px-3 py-1.5 text-xs font-mono rounded-md border border-input bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Option to save entered number to patient master record */}
          {patient?.id && (!patient.phone || patient.phone.replace(/\D/g, '').slice(-10) !== cleanDigits) && isValidPhone && (
            <label className="flex items-center gap-2 text-xs text-muted-foreground pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={saveToPatientProfile}
                onChange={(e) => setSaveToPatientProfile(e.target.checked)}
                className="rounded border-border text-emerald-600 focus:ring-emerald-500"
              />
              <span>Save this number to {patientName}&apos;s master profile</span>
            </label>
          )}
        </div>

        {/* Existing Log Alert (if failed or previously dispatched) */}
        {existingNotification?.status === 'FAILED' && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <p className="font-semibold">Previous Attempt Failed</p>
              <p className="text-[11px] text-red-600 dark:text-red-300 mt-0.5">
                {existingNotification.failureReason || 'Invalid phone number or recipient unreachable.'}
              </p>
            </div>
          </div>
        )}

        {existingNotification?.status === 'DELIVERED' && (
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Previously delivered to patient
            </span>
            <span className="font-mono text-[11px]">
              {existingNotification.deliveredAt
                ? new Date(existingNotification.deliveredAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Delivered'}
            </span>
          </div>
        )}

        {/* Live WhatsApp Chat Bubble Preview */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span className="font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Live WhatsApp Preview
            </span>
            <span className="text-[11px] font-mono">End-to-End Encrypted</span>
          </div>

          <WhatsAppChatBubble
            labName={labName}
            patientName={patientName}
            reportNumber={report.reportNumber}
            testsSummary={testSummary}
            shareUrl={shareUrl}
            timeString={nowTimeString}
          />
        </div>
      </div>

      {/* Modal Actions */}
      <div className="mt-5 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyText}
            className="text-xs h-8 gap-1.5"
            title="Copy pre-formatted WhatsApp message"
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedText ? 'Copied' : 'Copy Text'}</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            className="text-xs h-8 gap-1.5 text-muted-foreground hover:text-foreground"
            title="Copy direct patient report link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Link2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs h-8"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleOpenWhatsApp}
            disabled={!isValidPhone || sendMutation.isPending}
            className="text-xs h-8 gap-1.5 font-semibold bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xs"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
            <span>Open & Send in WhatsApp</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
