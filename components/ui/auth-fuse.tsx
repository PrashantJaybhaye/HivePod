"use client";

import * as React from "react";
import { useState, useId, useEffect } from "react";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { useRouter } from "next/navigation";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TypewriterProps {
  text: string | string[];
  speed?: number;
  cursor?: string;
  loop?: boolean;
  deleteSpeed?: number;
  delay?: number;
  className?: string;
}

export function Typewriter({
  text,
  speed = 100,
  cursor = "|",
  loop = false,
  deleteSpeed = 50,
  delay = 1500,
  className,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textArrayIndex, setTextArrayIndex] = useState(0);

  const textArray = Array.isArray(text) ? text : [text];
  const currentText = textArray[textArrayIndex] || "";

  useEffect(() => {
    if (!currentText) return;

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < currentText.length) {
            setDisplayText((prev) => prev + currentText[currentIndex]);
            setCurrentIndex((prev) => prev + 1);
          } else if (loop) {
            setTimeout(() => setIsDeleting(true), delay);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText((prev) => prev.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentIndex(0);
            setTextArrayIndex((prev) => (prev + 1) % textArray.length);
          }
        }
      },
      isDeleting ? deleteSpeed : speed,
    );

    return () => clearTimeout(timeout);
  }, [
    currentIndex,
    isDeleting,
    currentText,
    loop,
    speed,
    deleteSpeed,
    delay,
    displayText,
    text,
  ]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">{cursor}</span>
    </span>
  );
}

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input dark:border-input/50 bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary-foreground/60 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-6",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input dark:border-input/50 bg-background px-3 py-3 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:bg-accent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, ...props }, ref) => {
    const id = useId();
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    return (
      <div className="grid w-full items-center gap-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
          <Input id={id} type={showPassword ? "text" : "password"} className={cn("pe-10", className)} ref={ref} {...props} />
          <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 inset-e-0 flex h-full w-10 items-center justify-center text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? (<EyeOff className="size-4" aria-hidden="true" />) : (<Eye className="size-4" aria-hidden="true" />)}
          </button>
        </div>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

function SignInForm({ onError, onLoading }: { onError: (msg: string) => void; onLoading: (loading: boolean) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    setIsSubmitting(true);
    onError("");
    onLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/");
    } catch (error: any) {
      const code = error?.code || "";
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        onError("Invalid email or password. Please try again.");
      } else if (code === "auth/too-many-requests") {
        onError("Too many failed attempts. Please try again later.");
      } else if (code === "auth/user-disabled") {
        onError("This account has been disabled.");
      } else {
        onError(error?.message || "Sign in failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
      onLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <img 
          src="/logo.png" 
          alt="HivePod Logo" 
          className="w-12 h-12 object-contain mb-2" 
        />
        <h1 className="text-2xl font-bold">Sign in to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">Enter your email below to sign in</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" placeholder="m@example.com" required autoComplete="email" disabled={isSubmitting} /></div>
        <PasswordInput name="password" label="Password" required autoComplete="current-password" placeholder="Password" disabled={isSubmitting} />
        <Button type="submit" variant="outline" className="mt-2" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="size-4 animate-spin" /> Signing in...</> : "Sign In"}
        </Button>
      </div>
    </form>
  );
}

function SignUpForm({ onError, onLoading }: { onError: (msg: string) => void; onLoading: (loading: boolean) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (password.length < 6) {
      onError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    onError("");
    onLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      router.replace("/");
    } catch (error: any) {
      const code = error?.code || "";
      if (code === "auth/email-already-in-use") {
        onError("An account with this email already exists.");
      } else if (code === "auth/weak-password") {
        onError("Password is too weak. Use at least 6 characters.");
      } else if (code === "auth/invalid-email") {
        onError("Please enter a valid email address.");
      } else {
        onError(error?.message || "Sign up failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
      onLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <img 
          src="/logo.png" 
          alt="HivePod Logo" 
          className="w-12 h-12 object-contain mb-2" 
        />
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-balance text-sm text-muted-foreground">Enter your details below to sign up</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-1"><Label htmlFor="name">Full Name</Label><Input id="name" name="name" type="text" placeholder="John Doe" required autoComplete="name" disabled={isSubmitting} /></div>
        <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" placeholder="m@example.com" required autoComplete="email" disabled={isSubmitting} /></div>
        <PasswordInput name="password" label="Password" required autoComplete="new-password" placeholder="Password" disabled={isSubmitting} />
        <Button type="submit" variant="outline" className="mt-2" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="size-4 animate-spin" /> Creating account...</> : "Sign Up"}
        </Button>
      </div>
    </form>
  );
}

function AuthFormContainer({ isSignIn, onToggle }: { isSignIn: boolean; onToggle: () => void; }) {
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const router = useRouter();

    const handleGoogleSignIn = async () => {
      setError("");
      setIsGoogleLoading(true);
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        router.replace("/");
      } catch (error: any) {
        const code = error?.code || "";
        if (code === "auth/popup-closed-by-user") {
          // User closed the popup, no error needed
        } else if (code === "auth/popup-blocked") {
          setError("Popup was blocked. Please allow popups for this site.");
        } else if (code === "auth/cancelled-popup-request") {
          // Ignore cancelled duplicate popup
        } else {
          setError(error?.message || "Google sign-in failed. Please try again.");
        }
      } finally {
        setIsGoogleLoading(false);
      }
    };

    // Clear error when switching forms
    const handleToggle = () => {
      setError("");
      onToggle();
    };

    return (
        <div className="mx-auto grid w-[350px] gap-2">
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-start gap-2">
                <svg className="size-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
            {isSignIn ? <SignInForm onError={setError} onLoading={setIsLoading} /> : <SignUpForm onError={setError} onLoading={setIsLoading} />}
            <div className="text-center text-sm">
                {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
                <Button variant="link" className="pl-1 text-foreground" onClick={handleToggle} disabled={isLoading || isGoogleLoading}>
                    {isSignIn ? "Sign up" : "Sign in"}
                </Button>
            </div>
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
            <Button variant="outline" type="button" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
                {isGoogleLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google icon" className="mr-2 h-4 w-4" />
                )}
                {isGoogleLoading ? "Connecting..." : "Continue with Google"}
            </Button>
        </div>
    )
}

interface AuthContentProps {
  image?: {
    src: string;
    alt: string;
  };
  quote?: {
    text: string;
    author: string;
  }
}

interface AuthUIProps {
  signInContent?: AuthContentProps;
  signUpContent?: AuthContentProps;
}

const defaultSignInContent = {
  image: {
    src: "https://i.pinimg.com/736x/a4/4a/7e/a44a7e64ab8dbae2d3fab93875601f50.jpg",
    alt: "Abstract colorful gradient art"
  },
  quote: {
    text: "Welcome Back! The journey continues.",
    author: "HivePod"
  }
};

const defaultSignUpContent = {
  image: {
    src: "https://i.pinimg.com/736x/a4/4a/7e/a44a7e64ab8dbae2d3fab93875601f50.jpg",
    alt: "Vibrant gradient background for new beginnings"
  },
  quote: {
    text: "Create an account. A new chapter awaits.",
    author: "HivePod"
  }
};

export function AuthUI({ signInContent = {}, signUpContent = {} }: AuthUIProps) {
  const [isSignIn, setIsSignIn] = useState(true);
  const toggleForm = () => setIsSignIn((prev) => !prev);

  const finalSignInContent = {
    image: { ...defaultSignInContent.image, ...signInContent.image },
    quote: { ...defaultSignInContent.quote, ...signInContent.quote },
  };
  const finalSignUpContent = {
    image: { ...defaultSignUpContent.image, ...signUpContent.image },
    quote: { ...defaultSignUpContent.quote, ...signUpContent.quote },
  };

  const currentContent = isSignIn ? finalSignInContent : finalSignUpContent;

  return (
    <div className="w-full min-h-screen md:grid md:grid-cols-2">
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>
      <div className="flex h-screen items-center justify-center p-6 md:h-auto md:p-0 md:py-12">
        <AuthFormContainer isSignIn={isSignIn} onToggle={toggleForm} />
      </div>

      <div
        className="hidden md:block relative bg-cover bg-center transition-all duration-500 ease-in-out"
        style={{ backgroundImage: `url(${currentContent.image.src})` }}
        key={currentContent.image.src}
      >

        <div className="absolute inset-x-0 bottom-0 h-[100px] bg-linear-to-t from-background to-transparent" />

        <div className="relative z-10 flex h-full flex-col items-center justify-end p-2 pb-6">
          <blockquote className="space-y-2 text-center text-foreground">
            <p className="text-lg font-medium">
              &quot;<Typewriter
                key={currentContent.quote.text}
                text={currentContent.quote.text}
                speed={60}
              />&quot;
            </p>
            <cite className="block text-sm font-light text-muted-foreground not-italic">
              — {currentContent.quote.author}
            </cite>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
