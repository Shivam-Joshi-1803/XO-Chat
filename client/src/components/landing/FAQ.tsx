'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'How do anonymous identities work?',
    answer: 'You choose a unique username which is stored in our database. Since we do not request emails, phone numbers, or passwords, this username is your only public identifier. All communications are verified using browser-session tokens.',
  },
  {
    question: 'What is the Argon2id Recovery Key?',
    answer: 'When you claim a username, we generate a cryptographically secure key (e.g. XO-XXXX-XXXX-XXXX-XXXX). The server hashes this key using Argon2id and stores ONLY the hash. We present the key to you exactly once. If you lose your session cookie, you can use this recovery key to rotate your session and restore access.',
  },
  {
    question: 'What is the Auto-Cleanup System?',
    answer: 'To prevent unused usernames from being permanently locked, a background job runs every 24 hours. Any account that is inactive for 7 consecutive days AND has no active chats, blocks, pending requests, or media files is permanently deleted, releasing squatting usernames automatically.',
  },
  {
    question: 'Are my messages encrypted or logged?',
    answer: 'All socket communications are sent over TLS (secure websocket). Once messages are marked as read, they are updated in our DB. Deleting your identity cascades and removes all matching rows, messages, blocks, and stored media files immediately.',
  },
  {
    question: 'How do Chat Requests keep me safe?',
    answer: 'No one can send you a message unless you accept their request first. Chat requests can be tracked inside the Connections tab, where you can accept, reject, cancel, or block users from sending further requests.',
  },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 bg-background text-foreground border-t-2 border-border relative">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="max-w-2xl mx-auto mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-foreground">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <p className="text-foreground/60 text-sm md:text-base font-medium">
            Everything you need to know about the privacy, recovery, and security model of XOChat.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-4 max-w-3xl mx-auto">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="border-2 border-border bg-surface rounded-none overflow-hidden transition-all duration-150"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm md:text-base font-bold uppercase tracking-wider text-foreground transition-colors cursor-pointer select-none"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-foreground transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#FF4F00]' : ''
                    }`}
                  />
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-foreground/60 font-medium leading-relaxed border-t border-border bg-subtle-gray">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
