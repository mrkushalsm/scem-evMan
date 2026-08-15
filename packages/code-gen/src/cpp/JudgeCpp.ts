import { LanguageConfig } from '../types';
import { JudgeC } from '../c/JudgeC';
import * as configFile from './config.json';

// C++ wraps user code exactly as C does — declare the inputs, read them from stdin,
// call the user's function — so only the config differs.
export class JudgeCpp extends JudgeC {
    constructor() {
        super(configFile as LanguageConfig);
    }
}
