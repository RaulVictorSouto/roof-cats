const API_BASE_URL = "http://localhost:5281/api/ranking";
const TOKEN_STORAGE_KEY = "roofcats_token";

async function getJson<T>(path: string, requireAuth = false): Promise<RankingResult<T>> {

    const headers: Record<string, string> = {};

    if (requireAuth) {

        const token = localStorage.getItem(TOKEN_STORAGE_KEY);

        if (!token) {
            return { success: false, message: "Você precisa estar logado." };
        }

        headers["Authorization"] = `Bearer ${token}`;
    }

    let response: Response;

    try {
        response = await fetch(`${API_BASE_URL}${path}`, { method: "GET", headers });
    } catch (error) {
        console.log(error);
        return { success: false, message: "Server Offline. Try again later." };
    }

    if (response.status === 404) {

        let body: { message?: string } | null = null;

        try {
            body = await response.json();
        } catch {
        }

        return { success: false, message: body?.message ?? "Não encontrado." };
    }

    if (!response.ok) {
        return { success: false, message: `Server Error (HTTP ${response.status}).` };
    }

    let data: T | null = null;

    try {
        data = await response.json();
    } catch {
    }

    if (data === null) {
        return { success: false, message: "Resposta inválida do servidor." };
    }

    return { success: true, data };
}

export const RankingService = {

    /**
     * Top 100 jogadores por BestScore, sem precisar estar logado.
     */
    getGlobalRanking(): Promise<RankingResult<RankingEntry[]>> {
        return getJson<RankingEntry[]>("");
    },

    /**
     * Posição do jogador logado no ranking. Requer token válido
     * (rota protegida com [Authorize] no backend).
     */
    getMyRanking(): Promise<RankingResult<RankingEntry>> {
        return getJson<RankingEntry>("/me", true);
    }

};


/**
 * Espelha o RankingResponse do backend (RoofCats.Api.DTOs.Ranking).
 * O ASP.NET Core serializa em camelCase por padrão, então
 * Position/Username/BestScore viram position/username/bestScore.
 */
export interface RankingEntry {
    position: number;
    username: string;
    bestScore: number;
}

/**
 * Diferente do AuthResponse/GameResponse, os endpoints de ranking
 * retornam o dado "cru" (array ou objeto), sem envelope {success,...}.
 * Esse wrapper padroniza o formato pro resto do app tratar sucesso/erro
 * do mesmo jeito que os outros services.
 */
export interface RankingResult<T> {
    success: boolean;
    message?: string;
    data?: T;
}
