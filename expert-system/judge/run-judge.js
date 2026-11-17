import { executarJulgamento } from './evaluator.js';
import * as dotenv from 'dotenv';
dotenv.config();

executarJulgamento().catch(err => {
  console.error('Erro na execução do julgador:', err);
  process.exit(1);
});
