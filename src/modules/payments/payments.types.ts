export interface QuoteRequest {
  fromWalletId: string;
  toAddress: string;
  amount: string;
  assetCode: string;
}

export interface Quote {
  quoteId: string;
  fee: string;
  amountOut: string;
  expiresAt: string;
}

export interface QuoteResponse {
  quote: Quote;
}
