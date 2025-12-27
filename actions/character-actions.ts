'use server'

import { auth } from "@/auth";
import { getDb } from "@/db/drizzle";
import { characters } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function saveCharacterToCloud(characterData: any) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "No autenticado" };

  try {
    const db = await getDb(); // <--- AWAIT AÑADIDO

    // Verificamos si ya existe
    const charId = characterData.id;
    const existing = await db.select().from(characters).where(eq(characters.id, charId)).get();

    if (existing) {
      // Actualizar
      await db.update(characters)
        .set({ 
          data: characterData, 
          name: characterData.name || "Sin nombre", 
          occupation: characterData.occupation || "Desconocido",
          updatedAt: new Date() 
        })
        .where(eq(characters.id, charId));
    } else {
      // Crear nuevo
      await db.insert(characters).values({
        id: charId,
        userId: session.user.id,
        name: characterData.name || "Sin nombre",
        occupation: characterData.occupation || "Desconocido",
        data: characterData,
      });
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error saving character:", error);
    return { success: false, error: "Error de base de datos" };
  }
}

export async function getMyCharacters() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    const db = await getDb(); // <--- AWAIT AÑADIDO
    
    const result = await db.select()
      .from(characters)
      .where(eq(characters.userId, session.user.id))
      .orderBy(desc(characters.updatedAt))
      .all();

    return result.map(c => c.data);
  } catch (e) {
    console.error("Error loading characters:", e);
    return [];
  }
}

export async function deleteCloudCharacter(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  try {
    const db = await getDb(); // <--- AWAIT AÑADIDO
    await db.delete(characters).where(eq(characters.id, id));
    
    revalidatePath('/');
    return { success: true };
  } catch (e) {
    return { success: false, error: "Error deleting" };
  }
}