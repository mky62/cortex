import { SignIn } from "@clerk/nextjs";
import { Montserrat } from "next/font/google";
import { CheckCircle2Icon } from "lucide-react";
import { AuthAmbientPanel } from "../components/auth-ambient-panel";
import { AuthMotionBackground } from "../components/auth-motion-background";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const clerkAppearance = {
  variables: {
    colorPrimary: "var(--primary)",
    colorBackground: "var(--background)",
    colorInputBackground: "var(--background)",
    colorInputText: "var(--foreground)",
    colorText: "var(--foreground)",
    colorTextSecondary: "var(--muted-foreground)",
    colorDanger: "var(--destructive)",
    borderRadius: "var(--radius)",
    fontFamily: "var(--font-sans)",
  },
  elements: {
    rootBox: "flex w-full justify-center",
    card: "w-full gap-5 p-0 shadow-none",
    cardBox:
      "mx-auto w-full max-w-md overflow-hidden rounded-lg border border-border bg-background p-0 shadow-sm",
    header: "gap-1 px-6 pt-6 text-left",
    headerTitle: "text-xl font-semibold tracking-normal text-foreground",
    headerSubtitle: "text-sm leading-5 text-muted-foreground",
    main: "gap-4 px-6",
    form: "gap-4",
    formField: "gap-1.5",
    socialButtonsBlockButton:
      "h-10 rounded-md border-border bg-background text-sm font-medium text-foreground shadow-none transition-colors hover:bg-muted",
    socialButtonsBlockButtonText: "text-sm font-medium",
    dividerLine: "bg-border",
    dividerText: "px-2 text-xs text-muted-foreground",
    formFieldLabel: "text-sm font-medium text-foreground",
    formFieldInput:
      "h-10 rounded-md border-border bg-background px-3 text-sm text-foreground shadow-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-ring",
    formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",
    formButtonPrimary:
      "h-10 rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-none transition-colors hover:bg-primary/90",
    formFieldErrorText: "text-xs text-destructive",
    formResendCodeLink: "text-primary hover:text-primary/80",
    alert: "rounded-md border border-destructive/20 bg-destructive/10 text-destructive",
    alertText: "text-sm",
    footer: "rounded-b-lg border-t border-border bg-muted/40 px-6 py-4",
    footerAction: "justify-center",
    footerActionText: "text-sm text-muted-foreground",
    footerActionLink: "font-medium text-primary hover:text-primary/80",
    identityPreviewEditButton: "text-primary hover:text-primary/80",
  },
};


const capabilities = [
  {
    title: "AI replies",
    description: "Smart, context-aware assistance",
  },
  {
    title: "Human handoff",
    description: "Seamless transition to your team",
  },
  {
    title: "Voice support",
    description: "Talk to customers when it matters",
  },
];

export function SignInView() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-background">
      <AuthMotionBackground />
      <div className="relative z-10 grid h-full w-full gap-8 p-4 sm:p-8 lg:grid-cols-[minmax(0,1fr)_560px] lg:p-10 xl:p-12">
        <section className="hidden min-h-0 flex-col justify-center gap-8 overflow-hidden lg:flex">
          <div className="max-w-3xl space-y-8">
            <AuthAmbientPanel
              eyebrow="Welcome back"
              title="Support that stays calm."
              description="Return to a clear workspace for customer conversations, AI assistance, and human handoff."
              wordmark={<CortexWordmark />}
            />

            <div className="hidden max-w-3xl overflow-hidden rounded-lg border bg-background/60 p-5 shadow-sm backdrop-blur xl:block">
              <div className="auth-marquee flex w-max gap-0">
                {[...capabilities, ...capabilities].map((item, index) => (
                  <div
                    className="w-64 shrink-0 border-r border-border px-5"
                    key={`${item.title}-${index}`}
                  >
                    <CheckCircle2Icon className="size-6 text-primary" />
                    <p className="mt-4 text-base font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="flex h-full min-h-0 items-center justify-center  overflow-hidden lg:justify-end">
          <div className="flex w-full max-w-xl items-center justify-center rounded-lg bg-background/40  p-4 pt-10 shadow-xl sm:p-6 sm:pt-12 lg:p-8 lg:pt-14">
          <div className="flex w-full m-12 justify-center">
            <SignIn appearance={clerkAppearance} />
          </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function CortexWordmark() {
  return (
    <div className={montserrat.className}>
      <p className="text-6xl font-light italic leading-none tracking-[-0.04em] text-white drop-shadow-md">
        Cortex
      </p>
      <p className="mt-3 text-xs font-medium uppercase tracking-[0.42em] text-white/75">
        AI support command center
      </p>
    </div>
  );
}
