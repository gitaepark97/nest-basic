import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

@Catch(WsException, HttpException)
export class WsAndHttpExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: WsException | HttpException, host: ArgumentsHost) {
    const ctx = host.switchToWs();
    const client = ctx.getClient();

    if (exception instanceof HttpException) {
      const err = exception.getResponse() as
        | { message: any; statusCode: number }
        | { error: string; statusCode: 400; message: string[] };

      client.emit('Error', { message: err.message });
    } else if (exception instanceof WsException) {
      client.emit('Error', { message: exception.message });
    }
  }
}
