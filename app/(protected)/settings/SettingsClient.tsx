"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface UserSettings {
  notify_expiring_benefits: boolean;
  notify_days_monthly: number;
  notify_days_quarterly: number;
  notify_days_half_yearly: number;
  notify_days_yearly: number;
  notify_days_free_night: number;
}

const DEFAULT_SETTINGS: UserSettings = {
  notify_expiring_benefits: false,
  notify_days_monthly: 7,
  notify_days_quarterly: 30,
  notify_days_half_yearly: 30,
  notify_days_yearly: 90,
  notify_days_free_night: 90,
};

interface Props {
  userId: string;
  email: string;
  settings: UserSettings | null;
}

export default function SettingsClient({ userId, email, settings: initialSettings }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const s = initialSettings ?? DEFAULT_SETTINGS;

  // Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Notifications
  const [notifyEnabled, setNotifyEnabled] = useState(s.notify_expiring_benefits);
  const [daysMonthly, setDaysMonthly] = useState(s.notify_days_monthly);
  const [daysQuarterly, setDaysQuarterly] = useState(s.notify_days_quarterly);
  const [daysHalfYearly, setDaysHalfYearly] = useState(s.notify_days_half_yearly);
  const [daysYearly, setDaysYearly] = useState(s.notify_days_yearly);
  const [daysFreeNight, setDaysFreeNight] = useState(s.notify_days_free_night);
  const [savingNotif, setSavingNotif] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);
  const [notifError, setNotifError] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  const saveNotifications = useCallback(async (
    enabled: boolean, monthly: number, quarterly: number, halfYearly: number, yearly: number, freeNight: number
  ) => {
    setSavingNotif(true);
    setNotifSaved(false);
    setNotifError(false);

    const { error } = await supabase
      .from("user_settings")
      .upsert({
        user_id: userId,
        notify_expiring_benefits: enabled,
        notify_days_monthly: monthly,
        notify_days_quarterly: quarterly,
        notify_days_half_yearly: halfYearly,
        notify_days_yearly: yearly,
        notify_days_free_night: freeNight,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    setSavingNotif(false);
    if (error) {
      setNotifError(true);
    } else {
      setNotifSaved(true);
      setTimeout(() => setNotifSaved(false), 2000);
    }
  }, [supabase, userId]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveNotifications(notifyEnabled, daysMonthly, daysQuarterly, daysHalfYearly, daysYearly, daysFreeNight);
    }, 600);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [notifyEnabled, daysMonthly, daysQuarterly, daysHalfYearly, daysYearly, daysFreeNight, saveNotifications]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords do not match." });
      return;
    }

    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);

    if (error) {
      setPasswordMsg({ type: "error", text: error.message });
    } else {
      setPasswordMsg({ type: "success", text: "Password updated successfully." });
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    // Delete user data first, then sign out (actual auth user deletion requires a server-side admin call)
    await supabase.from("user_used_benefits").delete().eq("user_id", userId);
    await supabase.from("user_tracked_cards").delete().eq("user_id", userId);
    await supabase.from("user_settings").delete().eq("user_id", userId);
    await supabase.from("card_requests").delete().eq("user_id", userId);
    await supabase.auth.signOut();
    router.push("/login");
  };

  const daysFields: { label: string; frequency: string; value: number; max: number; setter: (v: number) => void }[] = [
    { label: "Monthly benefits", frequency: "monthly", value: daysMonthly, max: 30, setter: setDaysMonthly },
    { label: "Quarterly benefits", frequency: "quarterly", value: daysQuarterly, max: 90, setter: setDaysQuarterly },
    { label: "Half-yearly benefits", frequency: "half-yearly", value: daysHalfYearly, max: 180, setter: setDaysHalfYearly },
    { label: "Yearly benefits", frequency: "yearly", value: daysYearly, max: 360, setter: setDaysYearly },
    { label: "Free night benefits", frequency: "free_night", value: daysFreeNight, max: 360, setter: setDaysFreeNight },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-8">Settings</h1>

      {/* Account Section */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-foreground mb-1">Account</h2>
        <p className="text-sm text-muted-foreground mb-5">Signed in as {email}</p>

        {/* Change Password */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {passwordMsg && (
              <p className={`text-sm ${passwordMsg.type === "success" ? "text-success" : "text-destructive"}`}>
                {passwordMsg.text}
              </p>
            )}
            <button
              type="submit"
              disabled={changingPassword}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {changingPassword ? "Updating…" : "Update Password"}
            </button>
          </form>
        </div>

        {/* Delete Account */}
        <div className="bg-card border border-destructive/30 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Delete Account</h3>
          <p className="text-xs text-muted-foreground mb-3">
            This will permanently remove all your tracked cards, benefit usage data, and settings.
          </p>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 rounded-xl border border-destructive text-destructive text-sm font-semibold hover:bg-destructive/10 transition-colors"
            >
              Delete Account
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-foreground font-medium">
                Type <span className="font-mono text-destructive">delete</span> to confirm:
              </p>
              <input
                type="text"
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                placeholder="delete"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive/50"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteText !== "delete" || deleting}
                  className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Confirm Delete"}
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteText(""); }}
                  className="px-4 py-2 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Notifications Section */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-foreground mb-1">Notifications</h2>
        <p className="text-sm text-muted-foreground mb-5">Get reminded before your benefits expire.</p>

        <div className="bg-card border border-border rounded-2xl p-5">
          {/* Toggle */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-semibold text-foreground">Email reminders</p>
              <p className="text-xs text-muted-foreground">Receive an email before benefits expire</p>
            </div>
            <button
              onClick={() => setNotifyEnabled((prev) => !prev)}
              className={`relative w-11 h-6 rounded-full transition-colors ${notifyEnabled ? "bg-primary" : "bg-muted"}`}
              aria-label="Toggle email reminders"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifyEnabled ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
          </div>

          {/* Days in advance */}
          <div className={`transition-opacity ${notifyEnabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
            <div className="flex items-center gap-2 mb-4 mt-1">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-semibold text-foreground tracking-wide">Remind me this many days before expiry</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="space-y-4">
              {daysFields.map((field) => (
                <div key={field.frequency} className="flex items-center justify-between">
                  <label className="text-sm text-foreground">{field.label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={field.max}
                      value={field.value}
                      onChange={(e) => field.setter(Math.max(1, Math.min(field.max, Number(e.target.value) || 1)))}
                      className="w-16 px-2 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <span className="text-xs text-muted-foreground">days</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Auto-save status */}
          <div className="mt-4 h-5 flex items-center">
            {savingNotif && (
              <p className="text-xs text-muted-foreground">Saving…</p>
            )}
            {notifSaved && (
              <p className="text-xs text-success">Saved</p>
            )}
            {notifError && (
              <p className="text-xs text-destructive">Failed to save. Please try again.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
