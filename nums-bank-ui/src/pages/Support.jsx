import React, { useState } from 'react';
import Card from '../components/UI/Card';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import Toast from '../components/UI/Toast';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  MapPin, 
  Send, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

export const Support = () => {
  // 1. FAQ Collapsible State
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // 2. Complaint Form State
  const [compSubject, setCompSubject] = useState('');
  const [compCategory, setCompCategory] = useState('');
  const [compMsg, setCompMsg] = useState('');
  const [compLoading, setCompLoading] = useState(false);

  // 3. Virtual Chatbot State
  const [chatHistory, setChatHistory] = useState([
    { sender: 'bot', text: 'Greetings from NUMS BANK Support. I am your Virtual Digital Agent. How can I help you today?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const faqs = [
    { q: 'How do I generate or reset my 6-Digit Transaction PIN?', a: 'By default, all registered users are issued a default Transaction PIN matching "123456". You can update this PIN under your settings or contact the NUMS branch manager.' },
    { q: 'What is the maximum amount I can transfer via IMPS?', a: 'IMPS transfers allow instant 24/7 routing up to ₹5,00,000.00 per transaction.' },
    { q: 'Is there a minimum amount required for RTGS transfers?', a: 'Yes, RTGS is meant for high-value transfers. It requires a minimum volume of ₹2,00,000.00.' },
    { q: 'How long does it take for savings interest to accrue?', a: 'Savings interest of 0.5% yearly rate is accrued daily via a background system chron job at midnight and credited directly.' },
    { q: 'Can I apply for multiple loans simultaneously?', a: 'Yes, users can hold multiple loan portfolios (Home, Car, Personal) simultaneously based on individual eligibility parameters.' },
    { q: 'How do I unblock a temporarily suspended debit card?', a: 'Navigate to the Dashboard page, locate the "Debit Card Controls" card in the right column, and toggle the Lock/Unlock button instantly.' },
    { q: 'Are there any charges for using the digital platform?', a: 'No, NUMS BANK Netbanking features are entirely free for all customers.' },
    { q: 'How do I change my registered netbanking email ID?', a: 'Email updates require physical KYC verification at your home branch for safety reasons.' },
    { q: 'What security protocols protect my transactions?', a: 'We employ AES 256-Bit SSL end-to-end encryption, multi-factor logins, rate limiters, and session tokens.' },
    { q: 'How can I register nominee details?', a: 'Under Settings & Profile, fill out the "Nominee Account Declarations" form to assign estate share percentages.' }
  ];

  const atms = [
    { location: 'Pune Main Branch ATM', address: 'FC Road, Shivaji Nagar, Pune', status: 'ACTIVE', map: 'https://maps.google.com' },
    { location: 'Mumbai Corporate Hub ATM', address: 'BKC, Bandra East, Mumbai', status: 'ACTIVE', map: 'https://maps.google.com' },
    { location: 'Delhi Connaught Place ATM', address: 'CP Outer Circle, New Delhi', status: 'ACTIVE', map: 'https://maps.google.com' },
    { location: 'Bangalore Tech Park ATM', address: 'Whitefield, Bangalore', status: 'MAINTENANCE', map: 'https://maps.google.com' },
    { location: 'Kolkata Salt Lake ATM', address: 'Sector V, Salt Lake, Kolkata', status: 'ACTIVE', map: 'https://maps.google.com' },
    { location: 'Chennai IT Corridor ATM', address: 'OMR Road, Chennai', status: 'ACTIVE', map: 'https://maps.google.com' }
  ];

  // 20 Bot Prompts and automated responses
  const chatbotPrompts = [
    { q: 'Savings Interest Rate', a: 'NUMS Savings accounts yield 4.5% interest accrued daily.' },
    { q: 'Default Transaction PIN', a: 'Your default security PIN is set to "123456".' },
    { q: 'Check IMPS Limit', a: 'IMPS limits are capped at ₹5,00,000.00 daily.' },
    { q: 'Is RTGS Free?', a: 'Yes, all RTGS and NEFT transactions are entirely free.' },
    { q: 'Home Loan Rates', a: 'Home loan interest rates start at 8.25% p.a.' },
    { q: 'Aadhaar Masking Rules', a: 'We mask Aadhaar numbers for secure identification storage.' },
    { q: 'What is NEFT?', a: 'NEFT handles national funds transfers in hourly batches.' },
    { q: 'Car Loan Tenure options', a: 'Car loan periods can be adjusted from 1 to 7 years.' },
    { q: 'Deactivate Debit Card', a: 'Toggle unblock/block cards inside your Dashboard.' },
    { q: 'Need 2FA Help', a: 'Enable 2FA under settings to secure log-in triggers.' },
    { q: 'What is PAN requirement?', a: 'A valid PAN is required for active ledger auditing.' },
    { q: 'How to register payees?', a: 'Use "Add New Payee" in the Send Money section.' },
    { q: 'Rate Limiter guidelines', a: 'Post send operations are limited to prevent spams.' },
    { q: 'Check ATM locations', a: 'Consult the ATM status grid on this Support desk.' },
    { q: 'Prepayment Benefits', a: 'Prepayment reduces outstanding loan EMI or tenure.' },
    { q: 'How to download statement?', a: 'Click the Download PDF button inside your Dashboard.' },
    { q: 'NetBanking Timing', a: 'NUMS Netbanking is fully operational 24/7/365.' },
    { q: 'Nominee Assignment', a: 'Nominee shares are declarable under profile setting.' },
    { q: 'Report fraudulent debit', a: 'Immediately block card and file a support complaint.' },
    { q: 'Talk to human agent', a: 'Call 1800-NUMS-BANK (Toll-Free) for immediate help.' }
  ];

  const handlePromptClick = (prompt) => {
    // Add user query
    const userMessage = { sender: 'user', text: prompt.q };
    const botMessage = { sender: 'bot', text: prompt.a };
    setChatHistory((prev) => [...prev, userMessage, botMessage]);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const query = chatInput.trim().toLowerCase();
    const userMessage = { sender: 'user', text: chatInput };
    
    // Find matching prompt replies
    let reply = "Thank you for query. Please contact 1800-NUMS-BANK (Toll-free) or choose one of the quick prompt categories below.";
    const match = chatbotPrompts.find(p => p.q.toLowerCase().includes(query) || query.includes(p.q.toLowerCase()));
    if (match) {
      reply = match.a;
    }

    const botMessage = { sender: 'bot', text: reply };
    setChatHistory((prev) => [...prev, userMessage, botMessage]);
    setChatInput('');
  };

  const handleComplaintSubmit = (e) => {
    e.preventDefault();
    if (!compSubject.trim() || !compCategory || !compMsg.trim()) {
      Toast.error('Please complete all complaint fields.');
      return;
    }

    setCompLoading(true);
    setTimeout(() => {
      setCompLoading(false);
      Toast.success('Complaint ticket raised successfully! Ticket ID: #NB-' + Math.floor(Math.random() * 900000 + 100000));
      setCompSubject('');
      setCompCategory('');
      setCompMsg('');
    }, 1000);
  };

  return (
    <div className="max-w-[1500px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 md:gap-8 font-sans pb-24 lg:pb-8">
      {/* Title */}
      <div className="flex flex-col gap-0.5 select-none">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <HelpCircle className="w-5.5 h-5.5 text-indigo-500" />
          <span>NUMS NetBanking Support Desk</span>
        </h2>
        <p className="text-xs text-slate-400 font-medium">
          Access immediate assistance, search FAQs, report issues, and locate status-monitored ATMs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: FAQs and ATM grids */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* FAQ collapsible cards */}
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 select-none">
              Frequently Asked Questions (FAQs)
            </h3>
            <div className="flex flex-col gap-2.5">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="border border-slate-100 dark:border-navy-800 rounded-xl overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full flex items-center justify-between p-4 bg-slate-50/50 dark:bg-navy-950/20 hover:bg-slate-50 dark:hover:bg-navy-950/50 text-left font-bold text-xs text-slate-700 dark:text-slate-200 transition-all select-none"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                    {isOpen && (
                      <div className="p-4 bg-white dark:bg-navy-900 border-t border-slate-100 dark:border-navy-800 text-xs text-slate-400 dark:text-slate-400 leading-relaxed font-medium animate-in slide-in-from-top-1 duration-150">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* ATM/Branch locations grid */}
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 select-none">
              NUMS Branch & ATM Status Grid
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {atms.map((atm, i) => (
                <div
                  key={i}
                  className="p-4 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-100 dark:border-navy-800 flex flex-col justify-between min-h-[110px]"
                >
                  <div className="flex flex-col gap-0.5 select-none">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs text-slate-700 dark:text-slate-200">{atm.location}</span>
                      {atm.status === 'ACTIVE' ? (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/10 uppercase">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded border border-amber-500/10 uppercase">
                          <AlertCircle className="w-3 h-3" />
                          <span>Maintenance</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium mt-1 leading-normal flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{atm.address}</span>
                    </span>
                  </div>
                  <a
                    href={atm.map}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-bold text-indigo-600 dark:text-[#FFD700] hover:underline mt-2 self-end"
                  >
                    Get Directions
                  </a>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 1 Column: Chatbot & Complaints */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Virtual Chatbot */}
          <Card className="p-5 flex flex-col h-[400px] border border-slate-100 dark:border-navy-800">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5 select-none mb-3">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              <span>Virtual Assistant Bot</span>
            </h3>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 p-1 bg-slate-50 dark:bg-navy-950 rounded-xl border border-slate-100 dark:border-navy-800 text-xs mb-3 scroll-smooth">
              {chatHistory.map((chat, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                    chat.sender === 'bot'
                      ? 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-350 border border-slate-100 dark:border-navy-800 self-start'
                      : 'bg-[#FFD700] text-slate-900 dark:text-[#0A1926] font-semibold self-end'
                  }`}
                >
                  {chat.text}
                </div>
              ))}
            </div>

            {/* Prompts chips selection (first 8 for quick space) */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 select-none">
              {chatbotPrompts.slice(0, 8).map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptClick(p)}
                  className="px-2.5 py-1 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-full text-[9px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:border-[#FFD700] transition-colors shrink-0 cursor-pointer"
                >
                  {p.q}
                </button>
              ))}
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleChatSubmit} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Ask virtual assistant..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-2 border bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-100 rounded-lg text-xs focus:outline-none"
              />
              <button
                type="submit"
                className="p-2 rounded-lg bg-[#FFD700] hover:bg-[#ca8a04] text-[#0A1926] transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </Card>

          {/* Raise a complaint card */}
          <Card className="p-6">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mb-4 select-none">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span>Raise support Service Ticket</span>
            </h3>

            <form onSubmit={handleComplaintSubmit} className="flex flex-col gap-4 font-sans text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Complaint Category</label>
                <select
                  value={compCategory}
                  onChange={(e) => setCompCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-sm"
                >
                  <option value="">-- Choose Category --</option>
                  <option value="TXN">Transaction Processing Failure</option>
                  <option value="CARD">Debit/Credit Card Blocked</option>
                  <option value="LOAN">Loans & EMI accrual mismatch</option>
                  <option value="AUTH">Login Credentials/PIN failure</option>
                </select>
              </div>

              <Input
                label="Complaint Subject"
                placeholder="Brief summary"
                value={compSubject}
                onChange={(e) => setCompSubject(e.target.value)}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Elaborate Message</label>
                <textarea
                  value={compMsg}
                  onChange={(e) => setCompMsg(e.target.value)}
                  placeholder="Provide transaction IDs or specifics..."
                  rows="3"
                  className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-100 focus:outline-none text-sm"
                />
              </div>

              <Button type="submit" loading={compLoading} className="w-full mt-2 bg-[#FFD700] hover:bg-[#ca8a04]">
                Submit Ticket
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default Support;
