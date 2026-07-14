const API_BASE_URL = "http://localhost:5281/api/game";
const TOKEN_STORAGE_KEY = "roofcats_token";

async function postJson(path: string, body: unknown): Promise<GameResponse> {

    let response: Response;

    try {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);

        response = await fetch(`${API_BASE_URL}${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: "Server Offline. Try again later."
        };
    }

    let data: GameResponse | null = null;
    try {
        data = await response.json();
    } catch {
    }
    if (!data) {
        return {
            success: false,
            message: `Server Error (HTTP ${response.status}).`
        };
    }
    return data;
}

export const GameService = {
    saveRun(
        score: number,
        finishedAt: Date = new Date()
    ): Promise<GameResponse> {

        return postJson(
            "/run",
            {
                core: Math.floor(score),
                finishedAt: finishedAt.toISOString()
            }
        );

    }
};



export interface GameResponse {
    success: boolean;
    message: string;
    score?: number;
    bestScore?: number;
}