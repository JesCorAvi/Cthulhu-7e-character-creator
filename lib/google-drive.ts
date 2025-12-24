import type { Character } from "./character-types"

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
const SCOPES = "https://www.googleapis.com/auth/drive.file"
const STORAGE_KEY = "cthulhu_gdrive_token"
const BOUNDARY = "-------314159265358979323846"

// --- CAMBIO: Nombre de la carpeta ---
const FOLDER_NAME = "Cthulhu Builder"

let tokenClient: any
let isGapiInitializing = false
let isGapiInitialized = false
let pendingSignInReject: ((reason?: any) => void) | null = null

export const initGoogleDrive = (onInit: (success: boolean) => void) => {
  if (typeof window === "undefined") return

  if (!CLIENT_ID) {
    console.error("Falta NEXT_PUBLIC_GOOGLE_CLIENT_ID")
    return
  }

  const gapi = (window as any).gapi
  const google = (window as any).google

  if (!gapi || !google) {
    setTimeout(() => initGoogleDrive(onInit), 500)
    return
  }

  if (!isGapiInitializing && !isGapiInitialized) {
    isGapiInitializing = true
    
    gapi.load("client", async () => {
      try {
        await gapi.client.init({ discoveryDocs: DISCOVERY_DOCS })
        isGapiInitialized = true
        isGapiInitializing = false
        tryRestoreSession()
        onInit(true)
      } catch (error) {
        console.error("Error GAPI:", error)
        isGapiInitializing = false
      }
    })
  } else if (isGapiInitialized) {
    tryRestoreSession()
    onInit(true)
  }

  if (!tokenClient) {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (resp: any) => {
         if (resp.error) console.error(resp)
      },
      error_callback: (error: any) => {
        if (pendingSignInReject) {
          pendingSignInReject(error)
          pendingSignInReject = null
        }
      },
    })
  }
}

const tryRestoreSession = (): boolean => {
  try {
    const gapi = (window as any).gapi
    if (!gapi?.client) return false

    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const { access_token, expires_at } = JSON.parse(stored)
      if (Date.now() < expires_at - 60 * 1000) {
        gapi.client.setToken({ access_token })
        return true
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  } catch (e) {
    console.warn("Error restaurando sesión:", e)
  }
  return false
}

export const checkSessionActive = (): boolean => {
    const gapi = (window as any).gapi
    return !!(isGapiInitialized && gapi?.client?.getToken())
}

export const signInToGoogle = async (): Promise<void> => {
  if (!isGapiInitialized) {
    await new Promise<void>(resolve => setTimeout(resolve, 500))
  }

  return new Promise((resolve, reject) => {
    if (!tokenClient) return reject("Google Client not initialized")

    if (tryRestoreSession()) {
      resolve()
      return
    }

    pendingSignInReject = reject
    tokenClient.callback = (resp: any) => {
      pendingSignInReject = null
      if (resp.error) {
        reject(resp)
      } else {
        const expires_at = Date.now() + (resp.expires_in * 1000)
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          access_token: resp.access_token,
          expires_at
        }))
        const gapi = (window as any).gapi
        if (gapi?.client) gapi.client.setToken(resp)
        resolve()
      }
    }
    tokenClient.requestAccessToken({ prompt: "" })
  })
}

export const signOutFromGoogle = () => {
  localStorage.removeItem(STORAGE_KEY)
  const gapi = (window as any).gapi
  const google = (window as any).google
  const token = gapi?.client?.getToken()?.access_token
  if (google && token) {
    google.accounts.oauth2.revoke(token, () => {
      if (gapi?.client) gapi.client.setToken(null)
    })
  }
}

const ensureClientReady = () => {
  const gapi = (window as any).gapi
  if (!gapi?.client?.drive) throw new Error("API no lista")
  if (!gapi.client.getToken()) tryRestoreSession()
  if (!gapi.client.getToken()) throw new Error("No hay token")
}

// --- LÓGICA DE CARPETAS ---

const getOrCreateAppFolder = async (): Promise<string> => {
  ensureClientReady()
  const gapi = (window as any).gapi

  // 1. Buscar si la carpeta existe
  const q = `mimeType = 'application/vnd.google-apps.folder' and name = '${FOLDER_NAME}' and trashed = false`
  
  try {
    const response = await gapi.client.drive.files.list({
      q: q,
      fields: "files(id, name)",
    })

    if (response.result.files && response.result.files.length > 0) {
      return response.result.files[0].id
    }

    // 2. Si no existe, crearla
    const metadata = {
      name: FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
    }
    
    const createResponse = await gapi.client.drive.files.create({
      resource: metadata,
      fields: "id",
    })
    
    return createResponse.result.id

  } catch (e) {
    console.error("Error gestionando la carpeta de la app:", e)
    throw e
  }
}

// Modificado para recibir folderId
const findFileByCharId = async (charId: string, folderId: string) => {
  ensureClientReady()
  try {
    // Buscamos SOLO dentro de la carpeta (folderId in parents)
    const query = `appProperties has { key='charId' and value='${charId}' } and '${folderId}' in parents and trashed = false`
    
    const response = await (window as any).gapi.client.drive.files.list({
      q: query,
      fields: "files(id, name, appProperties)",
    })
    return response.result.files[0]
  } catch (e) {
    return null
  }
}

export const saveCharacterToDrive = async (character: Character): Promise<void> => {
  ensureClientReady()
  
  // 1. Asegurar carpeta
  const folderId = await getOrCreateAppFolder()

  const fileContent = JSON.stringify(character)
  
  // 2. Buscar archivo existente DENTRO de esa carpeta
  const existingFile = await findFileByCharId(character.id, folderId)
  
  const metadata: any = {
    name: `${character.name || "Sin Nombre"} - Cthulhu 7e.json`,
    mimeType: "application/json",
    appProperties: { charId: character.id, type: "cthulhu_character" },
  }

  const accessToken = (window as any).gapi.client.getToken().access_token
  const headers = new Headers({
    Authorization: "Bearer " + accessToken,
    "Content-Type": `multipart/related; boundary=${BOUNDARY}`,
  })

  if (existingFile) {
    // Actualizar archivo existente
    await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`, {
      method: "PATCH",
      headers: headers,
      body: createMultipartBody(metadata, fileContent),
    })
  } else {
    // Crear archivo NUEVO dentro de la carpeta
    metadata.parents = [folderId]

    await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: headers,
      body: createMultipartBody(metadata, fileContent),
    })
  }
}

export const getCharactersFromDrive = async (): Promise<Character[]> => {
  try {
    ensureClientReady()
    
    // 1. Obtener carpeta
    const folderId = await getOrCreateAppFolder()

    // 2. Listar SOLO archivos dentro de esa carpeta
    const query = `appProperties has { key='type' and value='cthulhu_character' } and '${folderId}' in parents and trashed = false`

    const response = await (window as any).gapi.client.drive.files.list({
      q: query,
      fields: "files(id, name)",
    })
    const files = response.result.files
    if (!files) return []

    const characters: Character[] = []
    await Promise.all(
      files.map(async (file: any) => {
        try {
          const contentResp = await (window as any).gapi.client.drive.files.get({
            fileId: file.id,
            alt: "media",
          })
          let rawContent = contentResp.result || contentResp.body
          let char: Character | null = null
          try {
             char = typeof rawContent === 'object' ? rawContent : JSON.parse(rawContent)
          } catch (e) {
             if (typeof rawContent === 'string' && rawContent.includes(BOUNDARY)) {
                const parts = rawContent.split(BOUNDARY)
                if (parts.length >= 3) {
                    char = JSON.parse(parts[2].substring(parts[2].indexOf('{')))
                }
             }
          }
          if (char && char.id) characters.push(char)
        } catch (e) { console.error(e) }
      }),
    )
    return characters
  } catch (error) {
    return []
  }
}

export const deleteCharacterFromDrive = async (charId: string): Promise<void> => {
  ensureClientReady()
  const folderId = await getOrCreateAppFolder()
  // Solo borramos si está dentro de nuestra carpeta
  const existingFile = await findFileByCharId(charId, folderId)
  if (existingFile) {
    await (window as any).gapi.client.drive.files.delete({ fileId: existingFile.id })
  }
}

const createMultipartBody = (metadata: any, content: string) => {
  const delimiter = "\r\n--" + BOUNDARY + "\r\n"
  const close_delim = "\r\n--" + BOUNDARY + "--"
  return (
    delimiter +
    "Content-Type: application/json\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    "Content-Type: application/json\r\n\r\n" +
    content +
    close_delim
  )
}