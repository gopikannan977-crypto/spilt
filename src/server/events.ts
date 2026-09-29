import { Response } from 'express';
import { EventEmitter } from 'events';

class RealtimeHub extends EventEmitter {
  private clients: Set<{ id: string; userId?: string; res: Response }> = new Set();

  registerClient(id: string, res: Response, userId?: string) {
    const client = { id, userId, res };
    this.clients.add(client);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    res.write(`data: ${JSON.stringify({ type: 'connected', clientId: id })}\n\n`);

    res.on('close', () => {
      this.clients.delete(client);
    });
  }

  broadcast(eventType: string, payload: any, sphereId?: string) {
    this.emit(eventType, payload);
    const data = JSON.stringify({ type: eventType, payload, sphereId, timestamp: new Date().toISOString() });
    for (const client of this.clients) {
      try {
        client.res.write(`data: ${data}\n\n`);
      } catch (err) {
        this.clients.delete(client);
      }
    }
  }

  notifyUser(userId: string, eventType: string, payload: any) {
    this.emit(eventType, payload);
    const data = JSON.stringify({ type: eventType, payload, timestamp: new Date().toISOString() });
    for (const client of this.clients) {
      if (client.userId === userId) {
        try {
          client.res.write(`data: ${data}\n\n`);
        } catch (err) {
          this.clients.delete(client);
        }
      }
    }
  }

  getClientCount() {
    return this.clients.size;
  }
}

export const realtimeHub = new RealtimeHub();
