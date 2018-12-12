import { GanacheSubprovider, prependSubprovider, RPCSubprovider, Web3ProviderEngine } from '@0x/subproviders';
import { errorUtils, logUtils } from '@0x/utils';
import * as fs from 'fs';

import { config } from './config';
import { profiler } from './profiler';

enum ProviderType {
    Ganache = 'ganache',
    Geth = 'geth',
}

let testProvider: ProviderType;
switch (process.env.TEST_PROVIDER) {
    case undefined:
        testProvider = ProviderType.Ganache;
        break;
    case 'ganache':
        testProvider = ProviderType.Ganache;
        break;
    case 'geth':
        testProvider = ProviderType.Geth;
        break;
    default:
        throw errorUtils.spawnSwitchErr('TEST_PROVIDER', process.env.TEST_PROVIDER);
}

export const provider = new Web3ProviderEngine();
if (testProvider === ProviderType.Ganache) {
    provider.addProvider(
        new GanacheSubprovider({
            logger: {
                log: (arg: any) => {
                    fs.appendFileSync(config.ganacheLogFile, `${arg}\n`);
                },
            },
            verbose: true,
            networkId: config.networkId,
            mnemonic: config.mnemonic,
        }),
    );
} else {
    provider.addProvider(new RPCSubprovider('http://localhost:8501'));
}

// Start provider
provider.start();

if (testProvider === ProviderType.Ganache) {
    logUtils.warn(
        "Gas costs in Ganache traces are incorrect and we don't recommend using it for profiling. Please switch to Geth. Check README for more details",
    );
    // Can enforce Geth instead of Ganache
    //process.exit(1);
}

// Get profilerSubprovider
const profilerSubprovider = profiler.getProfilerSubproviderSingleton();

logUtils.log(
    "By default profilerSubprovider is stopped so that you don't get noise from setup code. Don't forget to start it before the code you want to profile and stop it afterwards",
);

// Stop to start only when necessary
profilerSubprovider.stop();

// Add profilerSubprovider to provider engine
prependSubprovider(provider, profilerSubprovider);
