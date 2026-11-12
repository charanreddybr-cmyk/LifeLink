import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      setIsSent(true);
    }
  };

  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            24/7 Operations Support
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-charcoal-900 tracking-tight">
            Contact the LifeLink Team
          </h1>
          <p className="text-sm text-charcoal-600 leading-relaxed">
            Have questions, need hospital verification assistance, or wish to report suspicious requisitions? Reach out directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Contact Details (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card bordered padded className="space-y-6">
              <h3 className="text-base font-bold text-charcoal-900">
                Direct Communication Channels
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-brand-700 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold text-charcoal-900">Emergency Govt Helpline</span>
                    <a href="tel:104" className="text-brand-700 font-bold hover:underline">104 (Karnataka State Health)</a>
                    <p className="text-charcoal-500 text-xs mt-0.5">Toll-free 24/7 medical advice & blood availability</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold text-charcoal-900">Emergency Desk Email</span>
                    <a href="mailto:emergency@lifelink.org.in" className="text-emerald-700 font-semibold hover:underline">emergency@lifelink.org.in</a>
                    <p className="text-charcoal-500 text-xs mt-0.5">Priority response for hospital blood coordinators</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold text-charcoal-900">Bengaluru Headquarters</span>
                    <p className="text-charcoal-700 font-medium">LifeLink Health Foundation</p>
                    <p className="text-charcoal-500 text-xs">Indiranagar 100ft Road, Bengaluru, Karnataka 560038</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <span>Life-Threatening Emergency?</span>
              </div>
              <p className="leading-relaxed">
                If the patient is in critical shock or acute hemorrhage, immediately notify the hospital's attending physician and blood bank directly while logging your LifeLink emergency alert.
              </p>
            </div>
          </div>

          {/* Form (7 cols) */}
          <div className="lg:col-span-7">
            <Card bordered padded>
              {isSent ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-charcoal-900">Message Received</h4>
                  <p className="text-xs sm:text-sm text-charcoal-600 max-w-sm mx-auto">
                    Thank you. Our Bengaluru operations coordinator will review your communication and follow up promptly.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setIsSent(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-base font-bold text-charcoal-900 pb-1 border-b border-slate-100">
                    Send Us an Inquiry or Report
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Your Name *"
                      placeholder="e.g. Dr. Rajesh Rao"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <Input
                      label="Email Address *"
                      type="email"
                      placeholder="e.g. rajesh@hospital.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                      Subject / Topic *
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                    >
                      <option value="General Inquiry">General Platform Inquiry</option>
                      <option value="Hospital Blood Bank Integration">Hospital Blood Bank Integration</option>
                      <option value="Report Suspicious Requisition">Report Suspicious or Fraudulent Requisition</option>
                      <option value="Technical Support">Technical & PWA Support</option>
                      <option value="Volunteer Coordination">Volunteer Coordinator Network</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                      Your Message *
                    </label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Provide details of your query, hospital affiliation, or incident..."
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-brand-600"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full sm:w-auto"
                    rightIcon={<Send className="w-4 h-4" />}
                  >
                    Submit Message
                  </Button>
                </form>
              )}
            </Card>
          </div>

        </div>

      </div>
    </div>
  );
};
