import { ProfilerSubprovider, TruffleArtifactAdapter } from '@0x/sol-cov';
import * as _ from 'lodash';

import { config } from './config';

let profilerSubprovider: ProfilerSubprovider;

export const profiler = {
    start(): void {
        profiler.getProfilerSubproviderSingleton().start();
    },
    stop(): void {
        profiler.getProfilerSubproviderSingleton().stop();
    },
    getProfilerSubproviderSingleton(): ProfilerSubprovider {
        if (_.isUndefined(profilerSubprovider)) {
            profilerSubprovider = profiler._getProfilerSubprovider();
        }
        return profilerSubprovider;
    },
    _getProfilerSubprovider(): ProfilerSubprovider {
        const defaultFromAddress = config.txDefaults.from;
        const projectRoot = './';
        const solcVersion = '0.4.24';
        const zeroExArtifactsAdapter = new TruffleArtifactAdapter(projectRoot, solcVersion);
        return new ProfilerSubprovider(zeroExArtifactsAdapter, defaultFromAddress);
    },
};
