import app from '../../index.ts';
import { handle } from 'https://deno.land';

export default handle(app);
export const config = { path: "/*" };
