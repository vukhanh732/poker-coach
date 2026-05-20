"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getProfile, upsertProfile } from "@/app/actions/profile";
import { createClient } from "@/lib/supabase/client";
import { useDecisionClockSettings } from "@/hooks/useDecisionClockSettings";

const STAKE_LEVELS = [
  { value: "1_2", label: "$1/$2" },
  { value: "2_3", label: "$2/$3" },
  { value: "5_10", label: "$5/$10" },
] as const;

export default function SettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [stakeLevel, setStakeLevel] = useState("1_2");
  const [location, setLocation] = useState("");
  const [studyGoals, setStudyGoals] = useState("");
  const { settings: clockSettings, update: updateClock } = useDecisionClockSettings();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Load email from supabase client session
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.email) setEmail(user.email);

        // Load profile data from DB
        const profile = await getProfile();
        if (profile) {
          setFullName(profile.fullName ?? "");
          setStakeLevel(profile.stakeLevel ?? "1_2");
          setLocation(profile.location ?? "");
          setStudyGoals(profile.studyGoals ?? "");
        }
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const result = await upsertProfile({
        fullName: fullName.trim() || undefined,
        stakeLevel,
        location: location.trim() || undefined,
        studyGoals: studyGoals.trim() || undefined,
      });
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Profile saved!");
      }
    } catch {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    } catch {
      toast.error("Failed to sign out");
      setSigningOut(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your profile and account preferences.
        </p>
      </div>

      {/* Profile section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="stake-level">Stake Level</Label>
                <Select value={stakeLevel} onValueChange={setStakeLevel}>
                  <SelectTrigger id="stake-level">
                    <SelectValue placeholder="Select stake level" />
                  </SelectTrigger>
                  <SelectContent>
                    {STAKE_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Las Vegas, NV"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="study-goals">Study Goals</Label>
                <Textarea
                  id="study-goals"
                  value={studyGoals}
                  onChange={(e) => setStudyGoals(e.target.value)}
                  placeholder="What do you want to improve? e.g. 3-bet ranges, river play..."
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Simulation section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Simulation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Decision Clock</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Countdown timer during each decision in /simulate
              </p>
            </div>
            <button
              onClick={() => updateClock({ enabled: !clockSettings.enabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                clockSettings.enabled ? "bg-primary" : "bg-muted"
              }`}
              role="switch"
              aria-checked={clockSettings.enabled}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  clockSettings.enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          {clockSettings.enabled && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Duration</p>
              <div className="flex items-center gap-2">
                {[10, 15, 20, 30].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateClock({ seconds: s })}
                    className={`rounded px-2 py-0.5 text-sm font-mono transition-colors ${
                      clockSettings.seconds === s
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              readOnly
              disabled
              className="bg-muted/50 cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed here.
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Sign Out</p>
            <p className="text-xs text-muted-foreground">
              You will be redirected to the login page.
            </p>
            <Button
              variant="destructive"
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full"
            >
              {signingOut ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
