import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Trophy } from "lucide-react";
import { useState } from "react";

export interface RewardsConfig {
  attempt1: number;
  attempt2: number;
  attempt3: number;
  attempt4plus: number;
}

interface RewardsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rewards: RewardsConfig;
  onSave: (rewards: RewardsConfig) => void;
}

const ATTEMPTS = [
  { key: "attempt1" as const, label: "1st Attempt", color: "text-yellow-500" },
  { key: "attempt2" as const, label: "2nd Attempt", color: "text-slate-400" },
  { key: "attempt3" as const, label: "3rd Attempt", color: "text-orange-400" },
  {
    key: "attempt4plus" as const,
    label: "4th+ Attempts",
    color: "text-muted-foreground",
  },
];

export function RewardsPanel({
  open,
  onOpenChange,
  rewards,
  onSave,
}: RewardsPanelProps) {
  const [local, setLocal] = useState<RewardsConfig>(rewards);

  function handleSave() {
    onSave(local);
    onOpenChange(false);
  }

  function handleCancel() {
    setLocal(rewards);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-[360px] sm:w-[400px] flex flex-col"
        data-ocid="rewards.sheet"
      >
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-primary" />
            </div>
            <SheetTitle>Attempt Rewards</SheetTitle>
          </div>
          <SheetDescription>
            Points awarded to learners based on the attempt number when they
            answer correctly.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 py-2">
          {ATTEMPTS.map(({ key, label, color }) => (
            <div key={key} className="flex items-center gap-4">
              <div className="w-32 shrink-0">
                <Label
                  htmlFor={`reward-${key}`}
                  className="text-sm font-medium"
                >
                  <span className={color}>{label}</span>
                </Label>
              </div>
              <div className="relative flex-1">
                <Input
                  id={`reward-${key}`}
                  type="number"
                  min={0}
                  max={9999}
                  value={local[key]}
                  onChange={(e) =>
                    setLocal((prev) => ({
                      ...prev,
                      [key]: Number(e.target.value),
                    }))
                  }
                  className="pr-10"
                  data-ocid={`rewards.${key}.input`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                  pts
                </span>
              </div>
            </div>
          ))}
        </div>

        <SheetFooter className="flex gap-2 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleCancel}
            data-ocid="rewards.cancel_button"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} data-ocid="rewards.save_button">
            Save Rewards
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
