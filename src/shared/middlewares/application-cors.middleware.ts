import {Injectable, NestMiddleware, Scope} from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class ApplicationCorsMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    );
    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    );


    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    next();
  }
}
