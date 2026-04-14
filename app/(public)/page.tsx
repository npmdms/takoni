import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-24 flex flex-col gap-24">
      {/* HERO */}
      <section className="flex flex-col gap-6">
        <Badge variant="outline" className="w-fit">
          Early access
        </Badge>
        <h1 className="text-4xl md:text-5xl font-serif tracking-tight leading-tight">
          A smarter way to handle
          <br />
          customer questions.
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
          Takoni lets you embed a chatbot on your website. Teach it what to
          know, turn it on, and let it work.
        </p>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/sign-up">Get started</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      </section>

      <Separator />

      {/* WHAT IT IS */}
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            What it is
          </p>
          <h2 className="text-2xl font-serif tracking-tight">
            Not magic. Just well-organized information.
          </h2>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          You write down what your business does, what your policies are, what
          questions people usually ask. Takoni turns that into a chatbot. When a
          visitor asks something, the bot looks through what you wrote and
          answers. If it can&apos;t, it says so.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          No training. No machine learning setup. You fill in a form, the
          chatbot knows what you filled in.
        </p>
      </section>

      <Separator />

      {/* HOW */}
      <section className="flex flex-col gap-8">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          How it works
        </p>
        <div className="flex flex-col gap-6">
          {[
            {
              n: "1",
              title: "Create an organization",
              body: "Your business lives inside an organization. You can have more than one. Invite your team if you want.",
            },
            {
              n: "2",
              title: "Create a chatbot",
              body: "Give it a name. Write what it should say when someone opens it. Write what role it should play.",
            },
            {
              n: "3",
              title: "Add your knowledge",
              body: "Write entries — a refund policy, a pricing breakdown, a list of services. Organize them by category.",
            },
            {
              n: "4",
              title: "Embed it",
              body: "One script tag. Paste it into your website. Toggle the chatbot active from your dashboard.",
            },
          ].map((step) => (
            <div key={step.n} className="flex gap-5">
              <span className="text-muted-foreground/40 font-serif text-2xl leading-none mt-0.5 w-5 shrink-0">
                {step.n}
              </span>
              <div className="flex flex-col gap-1">
                <p className="font-medium">{step.title}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* TWO MODES */}
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            Two modes
          </p>
          <h2 className="text-2xl font-serif tracking-tight">
            AI answers and fixed answers.
          </h2>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="font-medium">AI mode</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The chatbot reads your knowledge base and writes a response. Good
              for open-ended questions where the answer isn&apos;t one sentence.
              It stays within what you&apos;ve written — it won&apos;t make
              things up outside of your content.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-medium">FAQ mode</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The visitor sees a list of questions. They pick one. They get the
              exact answer you wrote. Good for things that never change — office
              hours, return windows, delivery times. No AI involved. Zero chance
              of a wrong answer.
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground border-l-2 pl-4">
          Both modes run at the same time. You decide which questions go where.
        </p>
      </section>

      <Separator />

      {/* WHAT YOU GET */}
      <section className="flex flex-col gap-6">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          What&apos;s included
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
          {[
            "Unlimited knowledge entries",
            "FAQ builder",
            "Conversation history",
            "Pre-chat form (name + email)",
            "Multiple chatbots per org",
            "Multiple organizations",
            "Team members",
            "Active / inactive toggle",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <span className="w-1 h-1 rounded-full bg-foreground shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* CTA */}
      <section className="flex flex-col gap-5">
        <h2 className="text-2xl font-serif tracking-tight">Ready to try it?</h2>
        <p className="text-muted-foreground">
          No credit card. Takes about ten minutes to have something live.
        </p>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/sign-up">Create an account</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Already have one</Link>
          </Button>
        </div>
      </section>

      <Separator />

      {/* FOOTER */}
      <footer className="flex items-center justify-between">
        <span className="font-serif text-sm">Takoni</span>
        <span className="text-xs text-muted-foreground">Built in Borneo.</span>
      </footer>
    </main>
  );
}
