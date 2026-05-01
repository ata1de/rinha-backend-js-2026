import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const normalization = require('../resources/normalization.json');
const mccRisk = require('../resources/mcc_risk.json');

const {
  max_amount,
  max_installments,
  amount_vs_avg_ratio,
  max_minutes,
  max_km,
  max_tx_count_24h,
  max_merchant_avg_amount,
} = normalization;

function clamp(x) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

export function vectorize(payload) {
  const { transaction, customer, merchant, terminal, last_transaction } = payload;
  const vec = new Float32Array(14);

  const dt = new Date(transaction.requested_at);

  vec[0] = clamp(transaction.amount / max_amount);
  vec[1] = clamp(transaction.installments / max_installments);
  vec[2] = clamp((transaction.amount / customer.avg_amount) / amount_vs_avg_ratio);
  vec[3] = dt.getUTCHours() / 23;
  vec[4] = ((dt.getUTCDay() + 6) % 7) / 6;

  if (last_transaction === null || last_transaction === undefined) {
    vec[5] = -1;
    vec[6] = -1;
  } else {
    const lastDt = new Date(last_transaction.timestamp);
    const minutesSince = (dt.getTime() - lastDt.getTime()) / 60000;

    vec[5] = clamp(minutesSince / max_minutes);
    vec[6] = clamp(last_transaction.km_from_current / max_km);
  }

  vec[7] = clamp(terminal.km_from_home / max_km);
  vec[8] = clamp(customer.tx_count_24h / max_tx_count_24h);
  vec[9] = terminal.is_online ? 1 : 0;
  vec[10] = terminal.card_present ? 1 : 0;
  vec[11] = customer.known_merchants.includes(merchant.id) ? 0 : 1;
  vec[12] = mccRisk[merchant.mcc] ?? 0.5;
  vec[13] = clamp(merchant.avg_amount / max_merchant_avg_amount);

  return vec;
}
