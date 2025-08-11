import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // En producción, deberíamos restringir esto a nuestro dominio del frontend
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  // El KDS de la cocina se unirá a esta sala
  @SubscribeMessage('join_cocina')
  handleJoinCocina(client: Socket) {
    client.join('sala_cocina');
    console.log(`Cliente ${client.id} se unió a la sala de cocina`);
  }

  // El KDS de la barra se unirá a esta sala
  @SubscribeMessage('join_barra')
  handleJoinBarra(client: Socket) {
    client.join('sala_barra');
    console.log(`Cliente ${client.id} se unió a la sala de barra`);
  }
}