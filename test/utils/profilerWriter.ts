import { profiler } from './profiler';

after('profiler report', async () => {
  const profilerSubprovider = profiler.getProfilerSubproviderSingleton();
  await profilerSubprovider.writeProfilerOutputAsync();
});
