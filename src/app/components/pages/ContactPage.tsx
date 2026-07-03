"use client";

export function ContactPage() {
  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">Get in Touch</h1>
          <p className="text-muted-foreground">{"We're here to help. Reach out through any channel."}</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 bg-card border border-border rounded-3xl p-8 shadow-sm">
            <h2 className="font-bold text-foreground text-xl mb-7">Send a Message</h2>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {[["Name", "Your full name"], ["Email", "you@email.com"]].map(([label, ph]) => (
                  <div key={label}>
                    <label className="text-sm font-bold text-foreground block mb-1.5">{label}</label>
                    <input placeholder={ph} className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-sm font-bold text-foreground block mb-1.5">Subject</label>
                <select className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm text-foreground outline-none focus:border-blue-500 transition-all cursor-pointer">
                  <option>Order {"&"} Delivery</option>
                  <option>Return {"&"} Refund</option>
                  <option>Product Query</option>
                  <option>Technical Support</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-foreground block mb-1.5">Message</label>
                <textarea rows={4} placeholder="Describe your inquiry..." className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500 transition-all resize-none" />
              </div>
              <button className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-colors">
                Send Message
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="font-bold text-foreground text-sm mb-1">Office Address</p>
              <p className="text-xs text-muted-foreground">ElectroHub Tech Park, MG Road, Bengaluru, India</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="font-bold text-foreground text-sm mb-1">Email Support</p>
              <p className="text-xs text-muted-foreground">support@electrohub.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
