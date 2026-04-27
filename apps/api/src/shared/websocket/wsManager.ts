import { WebSocketServer, WebSocket } from "ws";
import type { Server, IncomingMessage } from "http";
import type { Socket } from "net";

interface WebSocketSession {
  ws: WebSocket;
  sessionId: string;
}

class WebSocketManager {
  private sessions: Map<string, WebSocketSession> = new Map();
  private wss: WebSocketServer | null = null;

  initialize(server: Server): void {
    this.wss = new WebSocketServer({ noServer: true });

    // Evento de conexão: recebe (ws, request) conforme documentação oficial do ws
    this.wss.on("connection", (ws: WebSocket, request: IncomingMessage) => {
      // Extrai sessionId da URL do request
      const url = new URL(request.url || "", `http://${request.headers.host}`);
      const sessionId = url.searchParams.get("sessionId");

      if (!sessionId) {
        ws.close();
        return;
      }

      console.log(`[WS] Nova conexão WebSocket para sessão: ${sessionId}`);
      
      const session: WebSocketSession = { ws, sessionId };
      this.sessions.set(sessionId, session);

      ws.on("close", () => {
        console.log(`[WS] Conexão fechada para sessão: ${sessionId}`);
        this.sessions.delete(sessionId);
      });

      ws.on("error", (error) => {
        console.error(`[WS] Erro na conexão ${sessionId}:`, error);
        this.sessions.delete(sessionId);
        ws.close();
      });

      // Envia confirmação de conexão
      ws.send(JSON.stringify({ type: "connected", sessionId }));
    });

    console.log("[WS] WebSocket Server inicializado");
  }

  handleUpgrade(request: IncomingMessage, socket: Socket, head: Buffer): void {
    if (!this.wss) return;

    // Extrai sessionId da URL para validação
    const url = new URL(request.url || "", `http://${request.headers.host}`);
    const sessionId = url.searchParams.get("sessionId");

    if (!sessionId) {
      socket.destroy();
      return;
    }

    // Faz upgrade e emite evento de connection com o request
    this.wss.handleUpgrade(request, socket, head, (ws) => {
      this.wss?.emit("connection", ws, request);
    });
  }

  sendProgress(sessionId: string, data: { processed: number; total: number; percentage: number }, retryCount: number = 0): void {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      // Retry logic para race condition (aguarda até 5 tentativas)
      if (retryCount < 5) {
        console.log(`[WS] Sessão não encontrada, tentando novamente (${retryCount + 1}/5): ${sessionId}`);
        setTimeout(() => this.sendProgress(sessionId, data, retryCount + 1), 50);
        return;
      }
      console.log(`[WS] Sessão não encontrada após retries: ${sessionId}`);
      return;
    }

    if (session.ws.readyState !== WebSocket.OPEN) {
      console.log(`[WS] WebSocket não está aberto para ${sessionId}`);
      return;
    }

    try {
      const message = JSON.stringify({ type: "progress", data });
      session.ws.send(message);
      console.log(`[WS] Progresso enviado para ${sessionId}:`, data);
    } catch (error) {
      console.error(`[WS] Erro ao enviar progresso:`, error);
      this.sessions.delete(sessionId);
      session.ws.close();
    }
  }

  sendDone(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.log(`[WS] Sessão não encontrada para done: ${sessionId}`);
      return;
    }

    try {
      session.ws.send(JSON.stringify({ type: "done" }));
      console.log(`[WS] Done enviado para ${sessionId}`);
      session.ws.close();
      this.sessions.delete(sessionId);
    } catch (error) {
      console.error(`[WS] Erro ao enviar done:`, error);
    }
  }
}

export const wsManager = new WebSocketManager();
