import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Course, Enrollment } from "../backend.d";
import { useAuthContext } from "../contexts/AuthContext";

const GRADIENTS = [
  "from-violet-500 via-indigo-600 to-indigo-700",
  "from-fuchsia-500 via-purple-600 to-purple-700",
  "from-cyan-500 via-blue-500 to-blue-700",
  "from-emerald-500 via-teal-500 to-teal-700",
  "from-orange-500 via-amber-500 to-red-600",
  "from-pink-500 via-rose-500 to-rose-700",
];

function getCourseOptions(courseId: string): {
  accessRule?: string;
  price?: number;
} {
  try {
    const raw = localStorage.getItem(`learnova_course_options_${courseId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

export default function CheckoutPage() {
  const { courseId } = useParams({ strict: false }) as { courseId: string };
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const { actor, isFetching } = useActor();
  const enabled = !!actor && !isFetching;

  // Form state
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({
        to: "/login",
        search: { redirect: `/learner/courses/${courseId}/checkout` },
      });
    }
  }, [isAuthenticated, courseId, navigate]);

  // Fetch courses
  const { data: courses } = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: () => (actor ? actor.getCourses() : Promise.resolve([])),
    enabled,
  });

  // Fetch enrollments
  const { data: enrollments } = useQuery<Enrollment[]>({
    queryKey: ["myCourseCompletions"],
    queryFn: () =>
      actor ? actor.getMyCourseCompletions() : Promise.resolve([]),
    enabled,
  });

  const course = courses?.find((c) => c.id.toString() === courseId);
  const opts = getCourseOptions(courseId);
  const coverImage = localStorage.getItem(`learnova_cover_${courseId}`);
  const price = opts.price ?? 0;
  const isEnrolled = (enrollments ?? []).some(
    (e) => e.courseId.toString() === courseId,
  );

  // Redirect if already enrolled
  useEffect(() => {
    if (isEnrolled) {
      navigate({ to: `/learner/courses/${courseId}` });
    }
  }, [isEnrolled, courseId, navigate]);

  const courseInitial = course?.title?.trim()[0]?.toUpperCase() ?? "C";
  const gradientClass =
    GRADIENTS[Number(courseId) % GRADIENTS.length] ?? GRADIENTS[0];

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!cardholderName.trim())
      e.cardholderName = "Cardholder name is required";
    if (cardNumber.replace(/\s/g, "").length < 16)
      e.cardNumber = "Enter a valid 16-digit card number";
    if (expiry.length < 5) e.expiry = "Enter expiry in MM/YY format";
    if (cvv.length < 3) e.cvv = "Enter a valid CVV";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handlePay() {
    if (!validate() || !actor) return;
    setProcessing(true);
    try {
      await new Promise((res) => setTimeout(res, 1500));
      try {
        await actor.enrollCourse({ courseId: BigInt(courseId) });
      } catch {
        // already enrolled or other — treat as success
      }
      navigate({ to: `/learner/courses/${courseId}` });
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top nav */}
      <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">
          <button
            type="button"
            data-ocid="checkout.link"
            onClick={() => navigate({ to: "/learner/courses" })}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to My Courses
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center py-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg"
        >
          {/* Course info card */}
          <Card className="overflow-hidden mb-5 border-border/60 shadow-lg">
            <div
              className={`h-28 bg-gradient-to-br ${gradientClass} relative flex items-center justify-center overflow-hidden`}
            >
              {coverImage ? (
                <img
                  src={coverImage}
                  alt={course?.title ?? "Course"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-7xl font-black text-white/20 select-none">
                  {courseInitial}
                </span>
              )}
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <CardContent className="px-5 py-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
                  You're enrolling in
                </p>
                <h2 className="text-base font-bold text-foreground leading-snug line-clamp-2">
                  {course?.title ?? "Loading..."}
                </h2>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-muted-foreground">Price</p>
                <p className="text-2xl font-black text-primary">
                  {price > 0 ? `$${price.toFixed(2)}` : "Free"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment form */}
          <Card className="border-border/60 shadow-lg">
            <CardContent className="px-6 py-6 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">
                  Payment Details
                </h3>
                <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  Secure
                </div>
              </div>

              {/* Cardholder Name */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="cardholder-name"
                  className="text-sm font-medium"
                >
                  Cardholder Name
                </Label>
                <Input
                  id="cardholder-name"
                  data-ocid="checkout.input"
                  placeholder="Jane Smith"
                  value={cardholderName}
                  onChange={(e) => {
                    setCardholderName(e.target.value);
                    if (errors.cardholderName)
                      setErrors((prev) => ({ ...prev, cardholderName: "" }));
                  }}
                  className={errors.cardholderName ? "border-destructive" : ""}
                />
                {errors.cardholderName && (
                  <p
                    data-ocid="checkout.error_state"
                    className="text-xs text-destructive"
                  >
                    {errors.cardholderName}
                  </p>
                )}
              </div>

              {/* Card Number */}
              <div className="space-y-1.5">
                <Label htmlFor="card-number" className="text-sm font-medium">
                  Card Number
                </Label>
                <div className="relative">
                  <Input
                    id="card-number"
                    data-ocid="checkout.input"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    maxLength={19}
                    onChange={(e) => {
                      setCardNumber(formatCardNumber(e.target.value));
                      if (errors.cardNumber)
                        setErrors((prev) => ({ ...prev, cardNumber: "" }));
                    }}
                    className={`pr-10 font-mono tracking-widest ${errors.cardNumber ? "border-destructive" : ""}`}
                  />
                  <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                {errors.cardNumber && (
                  <p
                    data-ocid="checkout.error_state"
                    className="text-xs text-destructive"
                  >
                    {errors.cardNumber}
                  </p>
                )}
              </div>

              {/* Expiry + CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="expiry" className="text-sm font-medium">
                    Expiry Date
                  </Label>
                  <Input
                    id="expiry"
                    data-ocid="checkout.input"
                    placeholder="MM/YY"
                    value={expiry}
                    maxLength={5}
                    onChange={(e) => {
                      setExpiry(formatExpiry(e.target.value));
                      if (errors.expiry)
                        setErrors((prev) => ({ ...prev, expiry: "" }));
                    }}
                    className={errors.expiry ? "border-destructive" : ""}
                  />
                  {errors.expiry && (
                    <p
                      data-ocid="checkout.error_state"
                      className="text-xs text-destructive"
                    >
                      {errors.expiry}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cvv" className="text-sm font-medium">
                    CVV
                  </Label>
                  <div className="relative">
                    <Input
                      id="cvv"
                      data-ocid="checkout.input"
                      placeholder="•••"
                      type="password"
                      maxLength={4}
                      value={cvv}
                      onChange={(e) => {
                        setCvv(e.target.value.replace(/\D/g, "").slice(0, 4));
                        if (errors.cvv)
                          setErrors((prev) => ({ ...prev, cvv: "" }));
                      }}
                      className={errors.cvv ? "border-destructive" : ""}
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  {errors.cvv && (
                    <p
                      data-ocid="checkout.error_state"
                      className="text-xs text-destructive"
                    >
                      {errors.cvv}
                    </p>
                  )}
                </div>
              </div>

              {/* Pay button */}
              <Button
                data-ocid="checkout.primary_button"
                className="w-full font-bold text-sm h-11 mt-1"
                disabled={processing}
                onClick={handlePay}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing payment...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Pay Now{price > 0 ? ` — $${price.toFixed(2)}` : ""}
                  </>
                )}
              </Button>

              <p className="text-center text-[11px] text-muted-foreground">
                Your payment is encrypted and secure. We never store card
                details.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
