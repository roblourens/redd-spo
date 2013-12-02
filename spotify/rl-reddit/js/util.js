// Progress bar
NProgress.configure({ showSpinner: false, trickleRate: 0.08, trickleSpeed: 200 });

// Really hacky methods to measure performance
var loadReferenceTime = 0;

function resetPerf()
{
	loadReferenceTime = timeMs();
}

function timeMs()
{
    return (new Date()).valueOf();
}

function log(msg)
{
    console.log((timeMs() - loadReferenceTime) + ": " + msg);
}