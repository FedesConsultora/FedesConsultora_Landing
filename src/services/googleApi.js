const API_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

/**
 * Formatea una fecha a dd/mm/aaaa
 */
const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

let blogPostsCache = null;

/**
 * Obtiene las publicaciones del blog desde la API de Google Apps Script.
 */
export const getBlogPosts = async () => {
    if (blogPostsCache) return blogPostsCache;

    try {
        const response = await fetch(`${API_URL}?action=blog`, {
            mode: "cors",
        });
        const data = await response.json();
        // Mapeamos los datos de la hoja para que coincidan con el formato que usa el blog
        const mappedData = data.map((item) => ({
            ...item,
            id: item["ID"],
            date: formatDate(item["Fecha de Publicación"]),
            title: item["Título"],
            description: item["Descripción"] || item["description"] || "",
            content: item["Contenido"] || item["Cuerpo"] || item["Content"] || item["Descripción"],
            author: item["Autor"] || item["Author"] || "",
            image: item["Imagen URL"] || item["image"] || "",
            authorImg: item["Author Image"] || "",
            link: item["Enlace Interno/Externo"],
        }));
        const sortedData = mappedData.sort((a, b) => {
            const dateA = new Date(a["Fecha de Publicación"]).getTime();
            const dateB = new Date(b["Fecha de Publicación"]).getTime();

            const timeA = isNaN(dateA) ? 0 : dateA;
            const timeB = isNaN(dateB) ? 0 : dateB;

            return timeB - timeA;
        });

        blogPostsCache = sortedData;
        return sortedData;
    } catch (error) {
        console.error("Error fetching blog posts:", error);
        return [];
    }
};

/**
 * Obtiene las fotos de la galería.
 */
export const getGaleriaFotos = async () => {
    try {
        const response = await fetch(`${API_URL}?action=galeria`, {
            mode: "cors",
        });
        const data = await response.json();
        const mappedData = data.map((item) => ({
            id: item["ID"],
            link: item["Imagen URL"],
        }));
        return mappedData;
    } catch (error) {
        console.error("Error fetching galería fotos:", error);
        return [];
    }
};

/**
 * Envía datos del formulario de contacto a Google Sheets.
 */
export const enviarConsultaContacto = async (formData) => {
    try {
        await fetch(`${API_URL}?action=contact`, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });
        return { success: true };
    } catch (error) {
        console.error("Error enviando consulta:", error);
        return { success: false };
    }
};

/**
 * Funciones de Onboarding
 */
export const enviarOnboardingStep0 = async (formData) => {
    try {
        const payload = { ...formData, origen: "onboarding_step0_web" };
        await fetch(`${API_URL}?action=onboardingStep0`, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        return { success: true };
    } catch (error) {
        console.error("Error enviando Onboarding STEP 0:", error);
        return { success: false };
    }
};

export const enviarOnboardingStep1 = async (formData) => {
    try {
        const payload = { ...formData, origen: "onboarding_step1_web" };
        await fetch(`${API_URL}?action=onboardingStep1`, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        return { success: true };
    } catch (error) {
        console.error("Error enviando Onboarding STEP 1:", error);
        return { success: false };
    }
};

export const saveOnboardingProgress = async (cuit, formData, currentStep, isCompleted = false) => {
    try {
        const payload = {
            cuit,
            formData,
            currentStep,
            lastUpdated: new Date().toISOString(),
            isCompleted,
        };
        await fetch(`${API_URL}?action=saveProgress`, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        return { success: true };
    } catch (error) {
        console.error("Error guardando progreso:", error);
        return { success: false };
    }
};

export const getOnboardingProgress = async (cuit) => {
    if (!API_URL) return null;
    try {
        const response = await fetch(`${API_URL}?action=getProgress&cuit=${cuit}`, { mode: "cors" });
        if (!response.ok) return null;
        const data = await response.json();
        return data || null;
    } catch (error) {
        console.warn("Error recuperando progreso:", error.message);
        return null;
    }
};

/**
 * Registra un evento de analítica (clics, scroll, etc)
 */
export const trackEvent = async (category, label, value = "", extraData = {}) => {
    try {
        const payload = {
            category,
            label,
            value,
            url: window.location.pathname,
            timestamp: new Date().toISOString(),
            ...extraData
        };
        
        // Enviamos los datos como un string JSON simple dentro del cuerpo
        await fetch(`${API_URL}?action=track`, {
            method: "POST",
            mode: "no-cors",
            // No ponemos headers de JSON para evitar el preflight de CORS
            body: JSON.stringify(payload),
        });
        return { success: true };
    } catch (error) {
        console.warn("Error tracking event:", error);
        return { success: false };
    }
};

/**
 * Funciones de Administración
 */
export const getAllOnboardings = async () => {
    if (!API_URL) return [];
    try {
        const response = await fetch(`${API_URL}?action=getAllOnboardings`, { mode: "cors" });
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Error obteniendo lista de onboardings:", error);
        return [];
    }
};

export const addGaleriaFoto = async (imageUrl) => {
    try {
        await fetch(`${API_URL}?action=addGaleriaFoto`, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl, id: "foto_" + Date.now() }),
        });
        return { success: true };
    } catch (error) {
        console.error("Error agregando foto a la galería:", error);
        return { success: false, error: error.message };
    }
};

export const deleteGaleriaFoto = async (id) => {
    try {
        await fetch(`${API_URL}?action=deleteGaleriaFoto`, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        return { success: true };
    } catch (error) {
        console.error("Error eliminando foto de la galería:", error);
        return { success: false, error: error.message };
    }
};

