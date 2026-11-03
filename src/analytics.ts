import posthog from 'posthog-js/no-external';
import { supabase } from './supabaseClient';

const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const ALLOWED = {
  resume_uploaded: ['source', 'file_type'], portfolio_published: ['provider', 'theme_id'],
  mock_interview_started: ['round', 'mode'], mock_interview_completed: ['round', 'mode', 'question_count'],
  resume_exported: ['format', 'template'], signed_up: ['method'],
} as const;
let on = false, lastUserId: string | null = null, signupSent = false;

const scrubBag = (bag?: Record<string, any>) => {
  for (const k of Object.keys(bag ?? {})) {
    const v = bag![k];
    if (typeof v !== 'string') continue;
    if (/^https?:\/\//i.test(v)) { try { const u = new URL(v); bag![k] = u.origin + u.pathname; } catch { delete bag![k]; } }
    else if (/access_token|refresh_token|provider_token|token_hash/i.test(v)) delete bag![k];
  }
};
export function initAnalytics() {
  if (!KEY || on) return;
  on = true;
  const arrivedWithTokens = /access_token=/.test(location.hash); // sync, before Supabase clears it
  posthog.init(KEY, {
    api_host: 'https://eu.i.posthog.com', persistence: 'memory', person_profiles: 'identified_only',
    autocapture: { capture_copied_text: false }, mask_all_text: true, mask_all_element_attributes: true,
    capture_pageview: 'history_change', capture_pageleave: true, disable_capture_url_hashes: true,
    mask_personal_data_properties: true, respect_dnt: true, rageclick: false, capture_dead_clicks: false,
    capture_heatmaps: false, capture_performance: false, capture_exceptions: false,
    disable_session_recording: true, enable_recording_console_log: false, disable_surveys: true,
    disable_product_tours: true, disable_conversations: true, disable_web_experiments: true,
    disable_external_dependency_loading: true, advanced_disable_flags: true,
    before_send: (e) => {
      try {
        if (!e) return null;
        [e.properties, e.$set, e.$set_once].forEach(scrubBag);
        for (const k of ['$el_text', '$external_click_url', '$selected_content']) delete e.properties[k];
        e.properties.$geoip_disable = true;
        return e;
      } catch { return null; } // fail closed
    },
  });
  supabase.auth.onAuthStateChange((event, session) => { // stay sync: no Supabase calls in here
    if (event === 'SIGNED_OUT') { lastUserId = null; posthog.reset(); return; }
    const u = session?.user;
    if (!u) return;
    if (u.id !== lastUserId) { if (lastUserId) posthog.reset(); posthog.identify(u.id); lastUserId = u.id; }
    const firstLogin = Date.parse(u.last_sign_in_at ?? '') - Date.parse(u.created_at) < 60_000;
    if (event === 'SIGNED_IN' && arrivedWithTokens && !signupSent && firstLogin && u.app_metadata?.provider === 'google') {
      signupSent = true; track('signed_up', { method: 'google' });
    }
  });
}
export function track<E extends keyof typeof ALLOWED>(name: E, props: Record<string, string | number | undefined> = {}) {
  if (!on) return;
  const clean: Record<string, string | number> = {};
  for (const k of ALLOWED[name]) {
    const v = props[k];
    if (typeof v === 'number' || (typeof v === 'string' && /^[a-z0-9_-]{1,32}$/.test(v))) clean[k] = v;
  }
  posthog.capture(name, clean);
}
export const fileTypeOf = (n: string) => /\.(pdf|docx?|txt|json)$/i.exec(n)?.[1].toLowerCase() ?? 'other';
