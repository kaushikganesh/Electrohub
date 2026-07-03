"use client";

import { useState } from "react";
import { HelpCircle, MessageSquare, Phone, Mail, ChevronDown } from "lucide-react";

export function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = [
    { q: "How long does delivery take?", a: "Standard delivery takes 3-5 business days. Express 1-2 day delivery is available at checkout for an additional charge. You'll receive real-time tracking via SMS and email." },
    { q: "What is the return policy?", a: "We offer a 30-day hassle-free return policy. If you're not satisfied, initiate a return from your dashboard or contact our team. Full refund, no questions asked." },
    { q: "Are all products genuine?", a: "Absolutely. 100% of our products are sourced directly from authorized manufacturers and distributors. Every product includes a valid manufacturer warranty." },
    { q: "How do I track my order?", a: "Once shipped, you'll receive a tracking number via email and SMS. Track orders anytime from the Orders section in your account dashboard." },
    { q: "What payment methods are accepted?", a: "We support UPI (Google Pay, PhonePe, BHIM), all major credit/debit cards (Visa, Mastercard, RuPay, Amex), net banking, EMI, and cash on delivery." },
    { q: "How do I apply a coupon code?", a: "Enter your coupon code in the cart page before proceeding to checkout. The discount will automatically be applied to your order total." },
  ];

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-14">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <HelpCircle size={26} className="text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2 tracking-tight">Help Center</h1>
          <p className="text-muted-foreground">Answers to common questions about ElectroHub</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-14">
          {[
            { icon: MessageSquare, label: "Live Chat", sub: "Available 24/7", col: "blue" },
            { icon: Phone, label: "+91 1800-123-4567", sub: "Mon-Sat, 9 AM-8 PM", col: "emerald" },
            { icon: Mail, label: "support@electrohub.in", sub: "Reply within 4 hours", col: "violet" },
          ].map((c) => {
            const Icon = c.icon;
            const cc: Record<string, string> = {
              blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
              emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
              violet: "bg-violet-100 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400",
            };
            return (
              <div key={c.label} className="bg-card border border-border rounded-2xl p-5 text-center hover:shadow-lg transition-all hover:-translate-y-0.5 group">
                <div className={`w-11 h-11 rounded-2xl ${cc[c.col]} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}><Icon size={19} /></div>
                <p className="font-bold text-foreground text-sm">{c.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
              </div>
            );
          })}
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-5">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden transition-all">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/50 transition-colors"
              >
                <span className="font-semibold text-foreground text-sm pr-4">{faq.q}</span>
                <ChevronDown size={17} className={`text-muted-foreground flex-shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5 border-t border-border">
                  <p className="text-sm text-muted-foreground leading-relaxed pt-3">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
