import axios from 'axios';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

const paystack = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

export const initializeTransaction = async (data: {
  email: string;
  amount: number; // in kobo (Paystack's "cents")
  callback_url: string;
  metadata?: any;
  plan?: string; // Optional plan code for subscriptions
}) => {
  const response = await paystack.post('/transaction/initialize', data);
  return response.data;
};

export const verifyTransaction = async (reference: string) => {
  const response = await paystack.get(`/transaction/verify/${reference}`);
  return response.data;
};

export const createPlan = async (data: {
  name: string;
  interval: 'monthly' | 'quarterly' | 'annually';
  amount: number; // in kobo
}) => {
  const response = await paystack.post('/plan', data);
  return response.data;
};

export const listPlans = async () => {
  const response = await paystack.get('/plan');
  return response.data;
};

export default paystack;
