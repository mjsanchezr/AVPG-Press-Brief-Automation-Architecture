export interface SmtpCredentials {
  senderEmail: string;
  appPassword: string;
}

export interface DistributionConfig {
  recipientEmail: string;
}

export interface ExecutionPayload {
  credentials: SmtpCredentials;
  config: DistributionConfig;
  rawSourceData?: string;
}

export interface HyperlinkItem {
  text: string;
  url: string;
  patternDetected?: string;
}

export interface BriefPayload {
  titleBlock: string; // Format: "🛢️ VENEZUELA BRIEF — [Date]"
  titularDelDia: string; // 2-3 lines max
  oilGas: HyperlinkItem[];
  economiaInversion: HyperlinkItem[];
  contextoInternacional: HyperlinkItem[];
  paraTenerEnCuenta: string[]; // Early warnings, risks, and trends without institutional attribution
}
