import { User } from '@prisma/client';
import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      user: User | null; // Buraya kendi User tipini koy
      realIp: string;
      
      /**
       * @deprecated Use realIp instead.
       */
      ip: string;
    }
  }
}

// Bu dosyanın bir module olarak algılanması ve global scope'u kirletmemesi için:
export {};