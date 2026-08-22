export * from './client';
export * from './auth';
export * from './accounts';
export * from './transactions';
export * from './payees';
export * from './translator';
export * from './voice';
export * from './fraud';

import { loginUser, registerUser, getMe } from './auth';
import { getAccounts, getAccountBalance } from './accounts';
import { getTransactions, getTransactionById, createTransaction } from './transactions';
import { getPayees } from './payees';
import { explainTransaction } from './translator';
import { transcribeAudio, synthesizeSpeech } from './voice';
import { checkFraudRisk } from './fraud';

export const api = {
  login: loginUser,
  register: registerUser,
  me: getMe,
  accounts: getAccounts,
  balance: getAccountBalance,
  payees: getPayees,
  transactions: getTransactions,
  transaction: getTransactionById,
  createTransaction: createTransaction,
  fraud: checkFraudRisk,
  translate: explainTransaction,
  transcribe: transcribeAudio,
  synthesize: synthesizeSpeech,
};
