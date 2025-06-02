inpage.js:1 [ChromeTransport] connectChrome error: Error: MetaMask extension not found
    at inpage.js:1:16512
connect @ inpage.js:1
react-dom.development.js:29895 Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools
InputPage.js:63 [InputPage] Fetching analysis for 0x60e4d786628fea6478f785a763f5e7a6cfa4ec7a
InputPage.js:68 [InputPage] Making API request to /api/analyze
InputPage.js:77 [InputPage] API response status: 200
InputPage.js:80 [InputPage] Received data: Object
InputPage.js:95 [InputPage] Analysis fetched successfully, redirecting...
InputPage.js:98 [InputPage] Attempting to navigate to: /dashboard/0x60e4d786628fea6478f785a763f5e7a6cfa4ec7a
DashboardPage.js:26 [DashboardPage] Fetching data for contract: 0x60e4d786628fea6478f785a763f5e7a6cfa4ec7a
DashboardPage.js:30 [DashboardPage] Using cached data
DashboardPage.js:26 [DashboardPage] Fetching data for contract: 0x60e4d786628fea6478f785a763f5e7a6cfa4ec7a
DashboardPage.js:30 [DashboardPage] Using cached data
DashboardPage.js:26 [DashboardPage] Fetching data for contract: 0x60e4d786628fea6478f785a763f5e7a6cfa4ec7a
DashboardPage.js:37 [DashboardPage] Making API request to /api/analyze
DashboardPage.js:45 [DashboardPage] API response status: 200
DashboardPage.js:48 [DashboardPage] Received data: {success: true, data: {…}}
CollectionInsightsCard.js:49 Uncaught TypeError: value.toFixed is not a function
    at formatCurrency (CollectionInsightsCard.js:49:1)
    at CollectionInsightsCard (CollectionInsightsCard.js:68:1)
    at renderWithHooks (react-dom.development.js:15486:1)
    at updateFunctionComponent (react-dom.development.js:19617:1)
    at beginWork (react-dom.development.js:21640:1)
    at HTMLUnknownElement.callCallback (react-dom.development.js:4164:1)
    at Object.invokeGuardedCallbackDev (react-dom.development.js:4213:1)
    at invokeGuardedCallback (react-dom.development.js:4277:1)
    at beginWork$1 (react-dom.development.js:27490:1)
    at performUnitOfWork (react-dom.development.js:26596:1)
formatCurrency @ CollectionInsightsCard.js:49
CollectionInsightsCard @ CollectionInsightsCard.js:68
renderWithHooks @ react-dom.development.js:15486
updateFunctionComponent @ react-dom.development.js:19617
beginWork @ react-dom.development.js:21640
callCallback @ react-dom.development.js:4164
invokeGuardedCallbackDev @ react-dom.development.js:4213
invokeGuardedCallback @ react-dom.development.js:4277
beginWork$1 @ react-dom.development.js:27490
performUnitOfWork @ react-dom.development.js:26596
workLoopSync @ react-dom.development.js:26505
renderRootSync @ react-dom.development.js:26473
performConcurrentWorkOnRoot @ react-dom.development.js:25777
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
CollectionInsightsCard.js:49 Uncaught TypeError: value.toFixed is not a function
    at formatCurrency (CollectionInsightsCard.js:49:1)
    at CollectionInsightsCard (CollectionInsightsCard.js:68:1)
    at renderWithHooks (react-dom.development.js:15486:1)
    at updateFunctionComponent (react-dom.development.js:19617:1)
    at beginWork (react-dom.development.js:21640:1)
    at HTMLUnknownElement.callCallback (react-dom.development.js:4164:1)
    at Object.invokeGuardedCallbackDev (react-dom.development.js:4213:1)
    at invokeGuardedCallback (react-dom.development.js:4277:1)
    at beginWork$1 (react-dom.development.js:27490:1)
    at performUnitOfWork (react-dom.development.js:26596:1)
formatCurrency @ CollectionInsightsCard.js:49
CollectionInsightsCard @ CollectionInsightsCard.js:68
renderWithHooks @ react-dom.development.js:15486
updateFunctionComponent @ react-dom.development.js:19617
beginWork @ react-dom.development.js:21640
callCallback @ react-dom.development.js:4164
invokeGuardedCallbackDev @ react-dom.development.js:4213
invokeGuardedCallback @ react-dom.development.js:4277
beginWork$1 @ react-dom.development.js:27490
performUnitOfWork @ react-dom.development.js:26596
workLoopSync @ react-dom.development.js:26505
renderRootSync @ react-dom.development.js:26473
recoverFromConcurrentError @ react-dom.development.js:25889
performConcurrentWorkOnRoot @ react-dom.development.js:25789
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
react-dom.development.js:18704 The above error occurred in the <CollectionInsightsCard> component:

    at CollectionInsightsCard (http://localhost:3000/static/js/bundle.js:90469:3)
    at div
    at VisualElementHandler (http://localhost:3000/static/js/bundle.js:31753:38)
    at MotionComponent (http://localhost:3000/static/js/bundle.js:31668:20)
    at div
    at VisualElementHandler (http://localhost:3000/static/js/bundle.js:31753:38)
    at MotionComponent (http://localhost:3000/static/js/bundle.js:31668:20)
    at PresenceChild (http://localhost:3000/static/js/bundle.js:28900:21)
    at AnimatePresence (http://localhost:3000/static/js/bundle.js:29052:21)
    at DashboardPage (http://localhost:3000/static/js/bundle.js:93581:66)
    at RenderedRoute (http://localhost:3000/static/js/bundle.js:80321:5)
    at Routes (http://localhost:3000/static/js/bundle.js:81055:5)
    at PresenceChild (http://localhost:3000/static/js/bundle.js:28900:21)
    at AnimatePresence (http://localhost:3000/static/js/bundle.js:29052:21)
    at main
    at VisualElementHandler (http://localhost:3000/static/js/bundle.js:31753:38)
    at MotionComponent (http://localhost:3000/static/js/bundle.js:31668:20)
    at div
    at App (http://localhost:3000/static/js/bundle.js:90324:78)
    at Router (http://localhost:3000/static/js/bundle.js:80989:15)
    at BrowserRouter (http://localhost:3000/static/js/bundle.js:78890:5)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
logCapturedError @ react-dom.development.js:18704
update.callback @ react-dom.development.js:18737
callCallback @ react-dom.development.js:15036
commitUpdateQueue @ react-dom.development.js:15057
commitLayoutEffectOnFiber @ react-dom.development.js:23430
commitLayoutMountEffects_complete @ react-dom.development.js:24727
commitLayoutEffects_begin @ react-dom.development.js:24713
commitLayoutEffects @ react-dom.development.js:24651
commitRootImpl @ react-dom.development.js:26862
commitRoot @ react-dom.development.js:26721
finishConcurrentRender @ react-dom.development.js:25931
performConcurrentWorkOnRoot @ react-dom.development.js:25848
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
CollectionInsightsCard.js:49 Uncaught TypeError: value.toFixed is not a function
    at formatCurrency (CollectionInsightsCard.js:49:1)
    at CollectionInsightsCard (CollectionInsightsCard.js:68:1)
    at renderWithHooks (react-dom.development.js:15486:1)
    at updateFunctionComponent (react-dom.development.js:19617:1)
    at beginWork (react-dom.development.js:21640:1)
    at beginWork$1 (react-dom.development.js:27465:1)
    at performUnitOfWork (react-dom.development.js:26596:1)
    at workLoopSync (react-dom.development.js:26505:1)
    at renderRootSync (react-dom.development.js:26473:1)
    at recoverFromConcurrentError (react-dom.development.js:25889:1)
formatCurrency @ CollectionInsightsCard.js:49
CollectionInsightsCard @ CollectionInsightsCard.js:68
renderWithHooks @ react-dom.development.js:15486
updateFunctionComponent @ react-dom.development.js:19617
beginWork @ react-dom.development.js:21640
beginWork$1 @ react-dom.development.js:27465
performUnitOfWork @ react-dom.development.js:26596
workLoopSync @ react-dom.development.js:26505
renderRootSync @ react-dom.development.js:26473
recoverFromConcurrentError @ react-dom.development.js:25889
performConcurrentWorkOnRoot @ react-dom.development.js:25789
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
placeholder-nft.jpg:1 
            
            
           GET http://localhost:3000/placeholder-nft.jpg 404 (Not Found)
Image
setValueForProperty @ react-dom.development.js:855
setInitialDOMProperties @ react-dom.development.js:9720
setInitialProperties @ react-dom.development.js:9921
finalizeInitialChildren @ react-dom.development.js:10950
completeWork @ react-dom.development.js:22232
completeUnitOfWork @ react-dom.development.js:26635
performUnitOfWork @ react-dom.development.js:26607
workLoopSync @ react-dom.development.js:26505
renderRootSync @ react-dom.development.js:26473
performConcurrentWorkOnRoot @ react-dom.development.js:25777
workLoop @ scheduler.development.js:266
flushWork @ scheduler.development.js:239
performWorkUntilDeadline @ scheduler.development.js:533
