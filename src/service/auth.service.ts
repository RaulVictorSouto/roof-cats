const API_BASE_URL = "http://localhost:5281/api/auth";

const TOKEN_STORAGE_KEY = "roofcats_token";

async function postJson(path: string, body: unknown): Promise<AuthResponse> {
    let response: Response;

    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
    } catch (error) {
        console.log(error)
        // Erro de rede: API fora do ar, sem CORS liberado, sem internet, etc.
        return {
            success: false,
            message: "Server Offine. Try again later."
        };
    }

    let data: AuthResponse | null = null;

    try {
        data = await response.json();
    } catch {
        // Resposta sem corpo/JSON inválido
    }

    if (!data) {
        return {
            success: false,
            message: `Server Error (HTTP ${response.status}).`
        };
    }

    // O controller sempre retorna Ok(result), mesmo quando Success = false
    // (ex: credenciais inválidas), então o corpo já traz a mensagem certa.
    return data;
}

export const AuthService = {

    register(username: string, email: string, password: string): Promise<AuthResponse> {
        return postJson("/register", { username, email, password });
    },

    login(email: string, password: string): Promise<AuthResponse> {
        return postJson("/login", { email, password });
    },

    setToken(token: string) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
    },

    getToken(): string | null {
        return localStorage.getItem(TOKEN_STORAGE_KEY);
    },

    clearToken() {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
    }

};


/**
 * Espelha o AuthResponse do backend (RoofCats.Api.DTOs.Auth).
 * O ASP.NET Core serializa/deserializa em camelCase por padrão
 * (e é case-insensitive na leitura), então esses nomes batem
 * com o JSON real trocado com a API.
 */
export interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    playerId?: string; // Guid vira string no JSON
    username?: string;
}
