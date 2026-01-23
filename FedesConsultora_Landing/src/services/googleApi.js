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

/**
 * Obtiene las publicaciones del blog desde la API de Google Apps Script.
 */
export const getBlogPosts = async () => {
    try {
        const response = await fetch(`${API_URL}?action=blog`, {
            mode: "cors",
        });
        const data = await response.json();
        // Mapeamos los datos de la hoja para que coincidan con el formato que usa el blog
        const mappedData = data.map((item) => ({
            ...item, // Include all original fields from the sheet
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
        return mappedData;
    } catch (error) {
        console.error("Error fetching blog posts:", error);
        return [];
    }
};