import {ConsoleLogger, Injectable, Scope} from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class AppplicationLoggerService extends ConsoleLogger{


}
