'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-algorithm-simulation.ts';
import '@/ai/flows/reason-about-helpful-information.ts';
import '@/ai/flows/generate-graph-simulation.ts';
import '@/ai/flows/generate-tree-simulation.ts';
