Failed to compile.

SyntaxError: C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\src\components\dashboard\Dashboard.js: Identifier 'setIsLoading' has already been declared. (284:10)
  282 |   // Get store actions at top level
  283 |   const storeActions = useStoreActions();
> 284 |   const { setIsLoading, setError: setStoreError, updateData, validateTrustScore } = storeActions;
      |           ^
  285 |
  286 |   console.log('[Dashboard] Store Data:', { 
  287 |     nftData, 
WARNING in [eslint] 
src\index.js
  Line 3:25:  'createRoutesFromChildren' is defined but never used  no-unused-vars
  Line 3:51:  'matchRoutes' is defined but never used               no-unused-vars

src\pages\DashboardPage.js
  Line 3:10:   'motion' is defined but never used                                                                 
                                                                                                                  
                                                         no-unused-vars
  Line 3:18:   'AnimatePresence' is defined but never used                                                        
                                                                                                                  
                                                         no-unused-vars
  Line 33:9:   'connectionRef' is assigned a value but never used                                                 
                                                                                                                  
                                                         no-unused-vars
  Line 34:28:  'setPollingConnected' is assigned a value but never used                                           
                                                                                                                  
                                                         no-unused-vars
  Line 179:6:  React Hook useCallback has missing dependencies: 'setAnalyticsData', 'setContractActivity', 'setMarketInsights', 'setMarketTrends', 'setNFTData', 'setPriceData', 'setRiskData', 'setSocialMetrics', and 'setTrustScore'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
  Line 289:6:  React Hook useEffect has an unnecessary dependency: 'transformData'. Either exclude it or remove the dependency array. Outer scope values like 'transformData' aren't valid dependencies because mutating them doesn't re-render the component                                react-hooks/exhaustive-deps

src\pages\InputPage.js
  Line 4:20:  'FiCheckCircle' is defined but never used  no-unused-vars

ERROR in ./src/components/dashboard/Dashboard.js
Module build failed (from ./node_modules/babel-loader/lib/index.js):
SyntaxError: C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\src\components\dashboard\Dashboard.js: Identifier 'setIsLoading' has already been declared. (284:10)

  282 |   // Get store actions at top level
  283 |   const storeActions = useStoreActions();
> 284 |   const { setIsLoading, setError: setStoreError, updateData, validateTrustScore } = storeActions;
      |           ^
  285 |
  286 |   console.log('[Dashboard] Store Data:', {
  287 |     nftData,
    at constructor (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:360:19)
    at FlowParserMixin.raise (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:6613:19)
    at FlowScopeHandler.checkRedeclarationInScope (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:1620:19)
    at FlowScopeHandler.declareName (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:1586:12)
    at FlowScopeHandler.declareName (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:1687:11)
    at FlowParserMixin.declareNameFromIdentifier (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:7542:16)
    at FlowParserMixin.checkIdentifier (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:7538:12)
    at FlowParserMixin.checkLVal (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:7479:12)
    at FlowParserMixin.checkLVal (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:7519:12)
    at FlowParserMixin.checkLVal (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:7515:16)
    at FlowParserMixin.parseVarId (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:13284:10)
    at FlowParserMixin.parseVarId (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:3480:11)
    at FlowParserMixin.parseVar (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:13259:12)
    at FlowParserMixin.parseVarStatement (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:13106:10)
    at FlowParserMixin.parseStatementContent (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:12727:23)
    at FlowParserMixin.parseStatementLike (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:12644:17)
    at FlowParserMixin.parseStatementLike (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:2922:24)
    at FlowParserMixin.parseStatementListItem (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:12624:17)
    at FlowParserMixin.parseBlockOrModuleBlockBody (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:13192:61)
    at FlowParserMixin.parseBlockBody (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:13185:10)
    at FlowParserMixin.parseBlock (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:13173:10)
    at FlowParserMixin.parseFunctionBody (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:12018:24)
    at C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:2896:63
    at FlowParserMixin.forwardNoArrowParamsConversionAt (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:3072:16)
    at FlowParserMixin.parseFunctionBody (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:2896:12)
    at FlowParserMixin.parseArrowExpression (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:11993:10)
    at FlowParserMixin.parseParenAndDistinguishExpression (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:11603:12)
    at FlowParserMixin.parseParenAndDistinguishExpression (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:3597:18)
    at FlowParserMixin.parseExprAtom (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:11242:23)
    at FlowParserMixin.parseExprAtom (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:4770:20)
    at FlowParserMixin.parseExprSubscripts (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:10992:23)
    at FlowParserMixin.parseUpdate (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:10977:21)
    at FlowParserMixin.parseMaybeUnary (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:10957:23)
    at FlowParserMixin.parseMaybeUnaryOrPrivate (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:10810:61)
    at FlowParserMixin.parseExprOps (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:10815:23)
    at FlowParserMixin.parseMaybeConditional (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:10792:23)
    at FlowParserMixin.parseMaybeAssign (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:10745:21)
    at FlowParserMixin.parseMaybeAssign (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:3555:18)
    at C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:10714:39
    at FlowParserMixin.allowInAnd (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:12329:16)
    at FlowParserMixin.parseMaybeAssignAllowIn (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:10714:17)
    at FlowParserMixin.parseVar (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:13260:91)
    at FlowParserMixin.parseVarStatement (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:13106:10)
    at FlowParserMixin.parseStatementContent (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:12727:23)
    at FlowParserMixin.parseStatementLike (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:12644:17)
    at FlowParserMixin.parseStatementLike (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:2922:24)
    at FlowParserMixin.parseModuleItem (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:12621:17)
    at FlowParserMixin.parseBlockOrModuleBlockBody (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:13192:36)
    at FlowParserMixin.parseBlockBody (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:13185:10)
    at FlowParserMixin.parseProgram (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:12514:10)

ERROR in [eslint]
src\components\dashboard\Dashboard.js
Failed to compile.

SyntaxError: C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\src\components\dashboard\Dashboard.js: Identifier 'setIsLoading' has already been declared. (284:10)
  282 |   // Get store actions at top level
  283 |   const storeActions = useStoreActions();
> 284 |   const { setIsLoading, setError: setStoreError, updateData, validateTrustScore } = storeActions;
      |           ^
  285 |
  286 |   console.log('[Dashboard] Store Data:', { 
  287 |     nftData, 
WARNING in [eslint] 
src\index.js
  Line 3:25:  'createRoutesFromChildren' is defined but never used  no-unused-vars
  Line 3:51:  'matchRoutes' is defined but never used               no-unused-vars

src\pages\DashboardPage.js
  Line 3:10:   'motion' is defined but never used                                                                 
                                                                                                                  
                                                         no-unused-vars
  Line 3:18:   'AnimatePresence' is defined but never used                                                        
                                                                                                                  
                                                         no-unused-vars
  Line 33:9:   'connectionRef' is assigned a value but never used                                                 
                                                                                                                  
                                                         no-unused-vars
  Line 34:28:  'setPollingConnected' is assigned a value but never used                                           
                                                                                                                  
                                                         no-unused-vars
  Line 179:6:  React Hook useCallback has missing dependencies: 'setAnalyticsData', 'setContractActivity', 'setMarketInsights', 'setMarketTrends', 'setNFTData', 'setPriceData', 'setRiskData', 'setSocialMetrics', and 'setTrustScore'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
  Line 289:6:  React Hook useEffect has an unnecessary dependency: 'transformData'. Either exclude it or remove the dependency array. Outer scope values like 'transformData' aren't valid dependencies because mutating them doesn't re-render the component                                react-hooks/exhaustive-deps

src\pages\InputPage.js
  Line 4:20:  'FiCheckCircle' is defined but never used  no-unused-vars

ERROR in ./src/components/dashboard/Dashboard.js
Module build failed (from ./node_modules/babel-loader/lib/index.js):
SyntaxError: C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\src\components\dashboard\Dashboard.js: Identifier 'setIsLoading' has already been declared. (284:10)

  282 |   // Get store actions at top level
  283 |   const storeActions = useStoreActions();
> 284 |   const { setIsLoading, setError: setStoreError, updateData, validateTrustScore } = storeActions;
      |           ^
  285 |
  286 |   console.log('[Dashboard] Store Data:', {
  287 |     nftData,
    at constructor (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:360:19)
    at FlowParserMixin.raise (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:6613:19)
    at FlowScopeHandler.checkRedeclarationInScope (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:1620:19)
    at FlowScopeHandler.declareName (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:1586:12)
    at FlowScopeHandler.declareName (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:1687:11)
    at FlowParserMixin.declareNameFromIdentifier (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:7542:16)
    at FlowParserMixin.checkIdentifier (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:7538:12)
    at FlowParserMixin.checkLVal (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:7479:12)
    at FlowParserMixin.checkLVal (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:7519:12)
    at FlowParserMixin.checkLVal (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:7515:16)
    at FlowParserMixin.parseVarId (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:13284:10)
    at FlowParserMixin.parseVarId (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:3480:11)
    at FlowParserMixin.parseVar (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:13259:12)
    at FlowParserMixin.parseVarStatement (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:13106:10)
    at FlowParserMixin.parseStatementContent (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:12727:23)
    at FlowParserMixin.parseStatementLike (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:12644:17)
    at FlowParserMixin.parseStatementLike (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:2922:24)
    at FlowParserMixin.parseStatementListItem (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:12624:17)
    at FlowParserMixin.parseBlockOrModuleBlockBody (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:13192:61)
    at FlowParserMixin.parseBlockBody (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:13185:10)
    at FlowParserMixin.parseBlock (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:13173:10)
    at FlowParserMixin.parseFunctionBody (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:12018:24)
    at C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:2896:63
    at FlowParserMixin.forwardNoArrowParamsConversionAt (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:3072:16)
    at FlowParserMixin.parseFunctionBody (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:2896:12)
    at FlowParserMixin.parseArrowExpression (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:11993:10)
    at FlowParserMixin.parseParenAndDistinguishExpression (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:11603:12)
    at FlowParserMixin.parseParenAndDistinguishExpression (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:3597:18)
    at FlowParserMixin.parseExprAtom (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:11242:23)
    at FlowParserMixin.parseExprAtom (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:4770:20)
    at FlowParserMixin.parseExprSubscripts (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:10992:23)
    at FlowParserMixin.parseUpdate (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:10977:21)
    at FlowParserMixin.parseMaybeUnary (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:10957:23)
    at FlowParserMixin.parseMaybeUnaryOrPrivate (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:10810:61)
    at FlowParserMixin.parseExprOps (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:10815:23)
    at FlowParserMixin.parseMaybeConditional (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:10792:23)
    at FlowParserMixin.parseMaybeAssign (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:10745:21)
    at FlowParserMixin.parseMaybeAssign (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:3555:18)
    at C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:10714:39
    at FlowParserMixin.allowInAnd (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:12329:16)
    at FlowParserMixin.parseMaybeAssignAllowIn (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:10714:17)
    at FlowParserMixin.parseVar (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:13260:91)
    at FlowParserMixin.parseVarStatement (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:13106:10)
    at FlowParserMixin.parseStatementContent (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:12727:23)
    at FlowParserMixin.parseStatementLike (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:12644:17)
    at FlowParserMixin.parseStatementLike (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:2922:24)
    at FlowParserMixin.parseModuleItem (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:12621:17)
    at FlowParserMixin.parseBlockOrModuleBlockBody (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:13192:36)
    at FlowParserMixin.parseBlockBody (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:13185:10)
    at FlowParserMixin.parseProgram (C:\Users\mohan\OneDrive\Documents\DataExtraction2\DataExtraction\frontend\node_modules\@babel\parser\lib\index.js:12514:10)

ERROR in [eslint]
src\components\dashboard\Dashboard.js
  Line 284:10:  Parsing error: Identifier 'setIsLoading' has already been declared. (284:10)

src\pages\DashboardPage.js
  Line 258:37:  'transformData' is not defined  no-undef
  Line 259:13:  'setData' is not defined        no-undef
  Line 289:24:  'transformData' is not defined  no-undef
  Line 344:8:   'data' is not defined           no-undef
  Line 400:12:  'data' is not defined           no-undef

Search for the keywords to learn more about each error.

webpack compiled with 2 errors and 1 warning
