import { drizzle } from 'drizzle-orm/d1';
import { getCloudflareContext } from '@opennextjs/cloudflare';

// Función helper para obtener la DB en el entorno Edge
export async function getDb() {
  // Usamos async: true para asegurar que obtenemos el contexto correctamente en Workers
  const { env } = await getCloudflareContext({ async: true });
  
  if (!env.DB) {
    throw new Error('D1 binding (DB) not found. Check your wrangler.json and .dev.vars');
  }
  
  return drizzle(env.DB);
}