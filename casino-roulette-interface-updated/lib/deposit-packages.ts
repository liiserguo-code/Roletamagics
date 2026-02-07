export interface DepositPackage {
  id: string
  name: string
  description: string
  amount: number // Amount in BRL
  bonus: number // Bonus percentage
  priceInCents: number // Price in cents for Stripe (BRL)
  popular?: boolean
}

// Source of truth for all deposit packages
export const DEPOSIT_PACKAGES: DepositPackage[] = [
  {
    id: 'deposit-20',
    name: 'Iniciante',
    description: 'Depósito inicial',
    amount: 20,
    bonus: 0,
    priceInCents: 2000, // R$ 20,00
  },
  {
    id: 'deposit-50',
    name: 'Básico',
    description: 'Bônus de 10%',
    amount: 50,
    bonus: 10,
    priceInCents: 5000, // R$ 50,00
  },
  {
    id: 'deposit-100',
    name: 'Popular',
    description: 'Bônus de 20%',
    amount: 100,
    bonus: 20,
    priceInCents: 10000, // R$ 100,00
    popular: true,
  },
  {
    id: 'deposit-200',
    name: 'Premium',
    description: 'Bônus de 30%',
    amount: 200,
    bonus: 30,
    priceInCents: 20000, // R$ 200,00
  },
  {
    id: 'deposit-500',
    name: 'VIP',
    description: 'Bônus de 50%',
    amount: 500,
    bonus: 50,
    priceInCents: 50000, // R$ 500,00
  },
  {
    id: 'deposit-1000',
    name: 'Elite',
    description: 'Bônus de 75%',
    amount: 1000,
    bonus: 75,
    priceInCents: 100000, // R$ 1.000,00
  },
]
