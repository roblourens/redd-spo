// The usual 
// var a = a || {}
// fails - because of strict mode?
RLViews = {};

// Progress bar
NProgress.configure({ showSpinner: false, trickleRate: 0.08, trickleSpeed: 200 });

function timeMs()
{
    return (new Date()).valueOf();
}