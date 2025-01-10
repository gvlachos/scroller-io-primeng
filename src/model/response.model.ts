import { Quote } from "./data.model";

export interface QuotesResponse {
  quotes: Quote[];
  limit: number;
  skip: number;
  total: number;
  hasMore?: boolean;
}