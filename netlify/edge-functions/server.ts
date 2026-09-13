import app from '../../index.ts';
const url = 'https://deno.land';
import { handle } from url;

export default handle(app);
export const config = { path: "/*" };
