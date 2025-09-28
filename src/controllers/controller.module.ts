import {Module} from '@nestjs/common';
import {UserModule} from "./user/user.module";
import {AuthGuard} from "../shared/guards/auth.guard";

@Module({
    imports: [UserModule],
    exports: [UserModule],
    providers:[]
})
export class ControllerModule {
}
