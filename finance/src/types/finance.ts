export type AccountType = 'conta_corrente' | 'poupanca' | 'carteira' | 'investimento' | 'cartao_credito' | 'cartao_loja';

export type TransactionType = 'entrada' | 'saida';

export type TransactionStatus = 'previsto' | 'efetivado' | 'cancelado';

export type PaymentMethod = 'pix' | 'cartao_credito' | 'cartao_debito' | 'boleto' | 'transferencia' | 'dinheiro' | 'ted_doc';

export type StatementStatus = 'aberta' | 'fechada' | 'paga';

export type EstimateFrequency = 'once' | 'monthly' | 'weekly';

export interface Account {
  id: string;
  name: string;
  institution?: string;
  type: AccountType;
  opening_balance: number;
  color?: string;
  icon?: string;
  archived: boolean;
}

export interface Category {
  id: string;
  name: string;
  parent_id?: string;
  is_income: boolean;
}

export interface Card {
  id: string;
  account_id: string;
  nickname: string;
  brand?: string;
  issuer?: string;
  closing_day: number;
  due_day: number;
  credit_limit?: number;
  color?: string;
}

export interface Statement {
  id: string;
  card_id: string;
  year: number;
  month: number;
  status: StatementStatus;
  closed_amount: number;
  paid_amount: number;
  fee_amount: number;
}

export interface Transaction {
  id: string;
  account_id?: string;
  card_id?: string;
  statement_id?: string;
  category_id?: string;
  type: TransactionType;
  name: string;
  note?: string;
  amount: number;
  payment_method?: PaymentMethod;
  due_date?: string;
  effective_date?: string;
  competence: string;
  status: TransactionStatus;
  installment_total?: number;
  installment_number?: number;
}

export interface RecurringTemplate {
  id: string;
  account_id?: string;
  card_id?: string;
  category_id?: string;
  type: TransactionType;
  name: string;
  amount: number;
  payment_method?: PaymentMethod;
  rrule: string;
  note?: string;
  active: boolean;
}

export interface Estimate {
  id: string;
  name: string;
  amount: number;
  start_ym: string;
  months?: number;
  type: TransactionType;
  frequency: EstimateFrequency;
  category_id?: string;
  account_id?: string;
  card_id?: string;
  note?: string;
  enabled: boolean;
}
