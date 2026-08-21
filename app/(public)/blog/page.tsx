"use client";
import { useState } from "react";
import {
  HeartPulse,
  Activity,
  Scale,
  Wind,
  Brain,
  Moon,
  RefreshCcw,
  Stethoscope,
  CalendarCheck,
  AlertCircle,
  ArrowRight,
  BookOpen,
  X,
  ChevronDown,
  Clock,
  UserRound,
} from "lucide-react";

const healthPoints = [
  {
    icon: Activity,
    title: "Persistent or Unexplained Pain",
    short:
      "Pain that continues, gets worse, or has no obvious cause deserves attention.",
    more:
      "Persistent headaches, abdominal pain, joint pain, or back pain can have many different causes. A healthcare professional can help determine what may be causing the discomfort and whether further evaluation is needed.",
    tips: [
      "Keep track of when the pain started.",
      "Note where the pain occurs.",
      "Record whether it is getting better or worse.",
      "Tell your doctor about any other symptoms.",
    ],
  },
  {
    icon: Scale,
    title: "Unusual Changes in Your Body",
    short:
      "Noticeable changes in your body that don't go away should not always be ignored.",
    more:
      "Unexplained weight changes, unusual tiredness, changes in appetite, persistent swelling, or other new changes may be worth discussing with a healthcare professional, particularly if they continue.",
    tips: [
      "Pay attention to new or unusual changes.",
      "Record when the change first appeared.",
      "Note whether it is getting better or worse.",
      "Discuss persistent changes with your provider.",
    ],
  },
  {
    icon: Wind,
    title: "Difficulty Breathing",
    short:
      "Breathing problems can have many causes and sometimes require prompt medical attention.",
    more:
      "Shortness of breath can occur for many reasons. Sudden or severe breathing difficulty, especially when accompanied by chest pain, fainting, or other serious symptoms, should be treated as an urgent medical concern.",
    tips: [
      "Do not ignore sudden or severe breathing problems.",
      "Pay attention to when breathing difficulty occurs.",
      "Tell your provider about recurring symptoms.",
      "Seek urgent care for severe symptoms.",
    ],
  },
  {
    icon: Brain,
    title: "Frequent Headaches or Dizziness",
    short:
      "Frequent, severe, or unusual headaches and dizziness may need professional evaluation.",
    more:
      "Occasional headaches or dizziness can happen for many reasons. However, if these symptoms become frequent, severe, unusual for you, or interfere with daily activities, discussing them with a healthcare professional can help identify possible causes.",
    tips: [
      "Record how often symptoms occur.",
      "Note how long each episode lasts.",
      "Record possible triggers.",
      "Tell your doctor if symptoms are becoming more frequent.",
    ],
  },
  {
    icon: Moon,
    title: "Changes in Sleep",
    short:
      "Persistent changes in your sleep can affect your health and everyday life.",
    more:
      "Difficulty falling asleep, staying asleep, or consistently feeling unrefreshed can affect concentration, energy, mood, and overall wellbeing. Persistent sleep problems are worth discussing with a healthcare professional.",
    tips: [
      "Keep a regular sleep schedule.",
      "Track how many hours you sleep.",
      "Note changes in your sleep pattern.",
      "Discuss persistent problems with your provider.",
    ],
  },
  {
    icon: RefreshCcw,
    title: "Symptoms That Keep Coming Back",
    short:
      "A symptom that repeatedly disappears and returns may deserve further attention.",
    more:
      "Recurring stomach problems, pain, fatigue, infections, or other symptoms can sometimes indicate an underlying issue. Keeping a record of recurring symptoms can give your healthcare provider useful information.",
    tips: [
      "Write down when symptoms return.",
      "Record how long they last.",
      "Look for patterns or possible triggers.",
      "Share your notes during your appointment.",
    ],
  },
  {
    icon: HeartPulse,
    title: "When Something Doesn't Feel Right",
    short:
      "You don't always have to wait until a health concern becomes severe before seeking advice.",
    more:
      "You know your normal health better than anyone. If you notice a significant or persistent change and are concerned about it, talking with a qualified healthcare professional can help you understand what to do next.",
    tips: [
      "Don't ignore persistent concerns.",
      "Write down your questions before an appointment.",
      "Tell your provider about relevant changes.",
      "Ask when you should follow up.",
    ],
  },
];

export default function BlogPage() {
  const [openCard, setOpenCard] = useState<number | null>(null);
  const [showArticle, setShowArticle] = useState(false);

  return (
    <main className="min-h-screen bg-white text-slate-900">

      {/* =====================================================
          HERO / INTRO
      ====================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-sky-50">

        {/* Decorative background */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-sky-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-24">

          <div className="mx-auto max-w-4xl text-center">

            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
              <HeartPulse className="h-4 w-4" />
              MEDBOOK HEALTH GUIDE
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              When Should You{" "}
              <span className="text-blue-600">See a Doctor?</span>
            </h1>

            {/* Intro */}
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              Taking care of your health is more than treating an illness when
              it becomes serious. Paying attention to changes in your body and
              seeking professional medical advice at the right time can help
              you make informed decisions about your health.
            </p>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-500">
              Learn about common signs that may be worth discussing with a
              healthcare professional and discover simple ways to prepare for
              your next appointment.
            </p>

            {/* =================================================
                READ ARTICLE BUTTON
            ================================================== */}
            <button
              onClick={() => setShowArticle(true)}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
            >
              <BookOpen className="h-5 w-5" />
              Read Full Article
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Mini info */}
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <span className="rounded-full bg-white px-4 py-2 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
                🩺 Health Education
              </span>

              <span className="rounded-full bg-white px-4 py-2 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
                📖 Patient Guide
              </span>

              <span className="rounded-full bg-white px-4 py-2 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
                ✓ Trusted Information
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          HEALTH SIGNS
      ====================================================== */}
      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">

        <div className="mb-10 text-center">

          <span className="text-sm font-bold uppercase tracking-widest text-blue-600">
            Know the signs
          </span>

          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Things You Shouldn&apos;t Ignore
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-slate-500">
            Understanding changes in your health can help you decide when it
            may be appropriate to talk with a healthcare professional.
          </p>

        </div>

        {/* Cards */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {healthPoints.map((point, index) => {
            const Icon = point.icon;
            const isOpen = openCard === index;

            return (
              <article
                key={point.title}
                className={`group rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 ${isOpen
                  ? "border-blue-300 shadow-md"
                  : "border-slate-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                  }`}
              >

                {/* Icon */}
                <div className="flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                    <Icon className="h-5 w-5" />
                  </div>

                  <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-400">
                    Health tip
                  </span>

                </div>

                {/* Title */}
                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {point.title}
                </h3>

                {/* Short text */}
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {point.short}
                </p>

                {/* Learn more */}
                <button
                  onClick={() =>
                    setOpenCard(isOpen ? null : index)
                  }
                  className="mt-5 flex w-full items-center justify-between border-t border-slate-100 pt-4 text-sm font-semibold text-blue-600"
                >
                  <span>{isOpen ? "Show less" : "Learn more"}</span>

                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {/* Expanded content */}
                {isOpen && (
                  <div className="mt-4 border-t border-blue-100 pt-4">

                    <p className="text-sm leading-6 text-slate-600">
                      {point.more}
                    </p>

                    <div className="mt-4 rounded-xl bg-blue-50 p-4">

                      <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                        Helpful things to do
                      </p>

                      <ul className="mt-2 space-y-2">
                        {point.tips.map((tip) => (
                          <li
                            key={tip}
                            className="flex gap-2 text-sm leading-5 text-slate-600"
                          >
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                            {tip}
                          </li>
                        ))}
                      </ul>

                    </div>

                  </div>
                )}

              </article>
            );
          })}

        </div>
      </section>

      {/* =====================================================
          IMPORTANT INFORMATION
      ====================================================== */}
      <section className="mx-auto max-w-6xl px-6 pb-12 lg:px-8">

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">

          <div className="flex gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <AlertCircle className="h-5 w-5" />
            </div>

            <div>

              <p className="text-sm font-bold text-amber-900">
                Important Health Information
              </p>

              <p className="mt-1 text-sm leading-6 text-amber-800/80">
                This content is for general educational purposes and does not
                replace professional medical diagnosis or treatment. If you
                experience severe or emergency symptoms, seek appropriate
                emergency medical care.
              </p>

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          APPOINTMENT CTA
      ====================================================== */}
      <section className="mx-auto max-w-6xl px-6 pb-20 lg:px-8">

        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-blue-700 px-7 py-10 shadow-xl shadow-blue-600/10 sm:px-10">

          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="flex items-center gap-2 text-blue-100">
                <Stethoscope className="h-5 w-5" />

                <span className="text-sm font-semibold uppercase tracking-wider">
                  Take care of your health
                </span>
              </div>

              <h2 className="mt-3 text-3xl font-bold text-white">
                Have a health concern?
              </h2>

              <p className="mt-3 max-w-xl text-blue-100">
                Connect with a qualified healthcare professional and discuss
                your concerns with confidence.
              </p>

            </div>

            <button
              type="button"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-blue-600 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-blue-50"
            >
              <CalendarCheck className="h-5 w-5" />
              Book an Appointment
              <ArrowRight className="h-4 w-4" />
            </button>

          </div>

        </div>
      </section>

      {/* =====================================================
          FULL ARTICLE MODAL / CARD
      ====================================================== */}
      {showArticle && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 px-4 py-8 backdrop-blur-sm">

          <div className="mx-auto max-w-3xl">

            <article className="relative overflow-hidden rounded-3xl bg-white shadow-2xl">

              {/* Article header */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-7 py-10 text-white sm:px-10">

                <button
                  onClick={() => setShowArticle(false)}
                  className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                  aria-label="Close article"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-2 text-blue-100">
                  <BookOpen className="h-5 w-5" />
                  <span className="text-sm font-semibold">
                    MEDBOOK HEALTH ARTICLE
                  </span>
                </div>

                <h2 className="mt-5 max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl">
                  Why Paying Attention to Your Health Matters
                </h2>

                <p className="mt-4 max-w-2xl text-blue-100">
                  Understanding preventive care, recognizing changes in your
                  health, and preparing for a productive doctor visit.
                </p>

                <div className="mt-6 flex flex-wrap gap-4 text-sm text-blue-100">

                  <div className="flex items-center gap-2">
                    <UserRound className="h-4 w-4" />
                    MedlinePlus / U.S. National Library of Medicine
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    5 min read
                  </div>

                </div>

              </div>

              {/* Article body */}
              <div className="px-7 py-8 sm:px-10 sm:py-10">

                <p className="text-lg leading-8 text-slate-600">
                  Good healthcare is not only about treating illness. Regular
                  healthcare visits can help identify health risks, provide
                  preventive services, and give you an opportunity to discuss
                  concerns with a healthcare professional.
                </p>

                <h3 className="mt-8 text-2xl font-bold text-slate-900">
                  Preventive care matters
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  According to MedlinePlus, preventive healthcare visits can
                  include screening for diseases, checking risk factors,
                  updating vaccinations, discussing lifestyle habits, and
                  maintaining a relationship with your healthcare provider.
                </p>

                <div className="my-7 rounded-2xl border border-blue-100 bg-blue-50 p-5">

                  <p className="font-semibold text-blue-900">
                    A useful reminder
                  </p>

                  <p className="mt-2 text-sm leading-6 text-blue-800/80">
                    Some health conditions may not produce obvious symptoms in
                    their early stages. Regular checkups can help healthcare
                    professionals identify certain risks earlier.
                  </p>

                </div>

                <h3 className="mt-8 text-2xl font-bold text-slate-900">
                  Pay attention to changes
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  New or persistent changes in your body are worth paying
                  attention to. MedlinePlus lists examples such as unexplained
                  weight loss, lasting fever, cough that does not go away,
                  persistent aches and pains, changes in bowel movements, and
                  skin changes that do not heal or become worse.
                </p>

                <h3 className="mt-8 text-2xl font-bold text-slate-900">
                  Make your appointment more useful
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  Preparing before your appointment can make it easier to
                  communicate with your provider. Write down your questions,
                  keep a list of medicines and supplements, and record useful
                  information about your symptoms such as when they started,
                  where they occur, and whether they have changed.
                </p>

                <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">

                  <h4 className="font-bold text-slate-900">
                    Before your next appointment
                  </h4>

                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    <li>✓ Write down your main health concerns.</li>
                    <li>✓ Prepare your questions.</li>
                    <li>✓ Keep a list of medicines and supplements.</li>
                    <li>✓ Record important changes in your symptoms.</li>
                    <li>✓ Ask your provider about appropriate follow-up.</li>
                  </ul>

                </div>

                <h3 className="mt-8 text-2xl font-bold text-slate-900">
                  Take the next step
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  You don&apos;t need to wait until a concern becomes severe before
                  discussing it with a healthcare professional. If something
                  about your health is concerning you or a symptom is new and
                  persistent, consider arranging an appointment.
                </p>

                {/* Source */}
                <div className="mt-10 border-t border-slate-200 pt-6">

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Article source
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Health information adapted and summarized from MedlinePlus,
                    a service of the U.S. National Library of Medicine.
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    Sources include MedlinePlus articles on preventive
                    healthcare and preparing for a doctor visit.
                  </p>

                </div>

                {/* Close */}
                <button
                  onClick={() => setShowArticle(false)}
                  className="mt-8 w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-700"
                >
                  Close Article
                </button>

              </div>

            </article>

          </div>
        </div>
      )}

    </main>
  );
}
