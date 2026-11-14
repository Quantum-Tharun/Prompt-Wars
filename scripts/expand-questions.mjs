import fs from "fs";
import path from "path";

const questionsPath = path.resolve("data/questions.json");
const existing = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));

const newQuestions = [
  {
    id: "py_q6",
    skillId: "python",
    topicTag: "py_collections",
    difficulty: "intermediate",
    cognitiveTier: "code_tracing",
    prompt: "What is the output of the following list comprehension with filtering in Python?",
    codeSnippet: "nums = [1, 2, 3, 4, 5, 6]\nres = [x**2 for x in nums if x % 2 != 0]\nprint(res)",
    options: ["[1, 9, 25]", "[4, 16, 36]", "[1, 4, 9, 16, 25, 36]", "[1, 3, 5]"],
    correctIndex: 0,
    explanation: "The condition 'x % 2 != 0' filters odd numbers: 1, 3, 5. Their squares are 1, 9, 25."
  },
  {
    id: "py_q7",
    skillId: "python",
    topicTag: "py_oop",
    difficulty: "advanced",
    cognitiveTier: "code_tracing",
    prompt: "What is the method resolution order (MRO) execution result of calling super().greet() in class D?",
    codeSnippet: "class A:\n    def greet(self): return 'A'\nclass B(A):\n    def greet(self): return 'B' + super().greet()\nclass C(A):\n    def greet(self): return 'C' + super().greet()\nclass D(B, C):\n    def greet(self): return 'D' + super().greet()\nprint(D().greet())",
    options: ["DBCA", "DBAC", "DCBA", "DAB"],
    correctIndex: 0,
    explanation: "Python uses C3 Linearization for MRO: D -> B -> C -> A. Calling super().greet() yields D followed by B, then C, then A."
  },
  {
    id: "js_q6",
    skillId: "javascript",
    topicTag: "js_dom",
    difficulty: "beginner",
    cognitiveTier: "syntax_recall",
    prompt: "Which DOM method correctly attaches an event listener without overwriting previously registered handlers?",
    codeSnippet: "const btn = document.querySelector('#action');\n// Attach click handler safely",
    options: ["btn.addEventListener('click', handler)", "btn.onclick = handler", "btn.attachEvent('onclick', handler)", "btn.registerEvent('click', handler)"],
    correctIndex: 0,
    explanation: "addEventListener registers multiple event listeners for the target event without clobbering existing handlers."
  },
  {
    id: "sql_q6",
    skillId: "sql",
    topicTag: "sql_subqueries",
    difficulty: "intermediate",
    cognitiveTier: "code_tracing",
    prompt: "Given employees table with salary values [3000, 4000, 5000, 6000], what does this query return?",
    codeSnippet: "SELECT COUNT(*)\nFROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees);",
    options: ["2", "1", "3", "4"],
    correctIndex: 0,
    explanation: "The average salary is (3000 + 4000 + 5000 + 6000)/4 = 4500. Employees with salary > 4500 are 5000 and 6000, which counts to 2."
  },
  {
    id: "html_q6",
    skillId: "html",
    topicTag: "html_dom_structure",
    difficulty: "beginner",
    cognitiveTier: "syntax_recall",
    prompt: "Which attribute should be placed on an external <script> tag to load and execute it asynchronously without blocking HTML parsing?",
    codeSnippet: '<script src="analytics.js" _____></script>',
    options: ["async", "defer", "lazy", "preload"],
    correctIndex: 0,
    explanation: "'async' downloads the script in parallel with HTML parsing and executes it immediately when available."
  },
  {
    id: "html_q7",
    skillId: "html",
    topicTag: "html_semantics",
    difficulty: "intermediate",
    cognitiveTier: "code_tracing",
    prompt: "In a document with <main>, <article>, and multiple nested <header> elements, what is the accessible heading outline interpretation?",
    codeSnippet: "<main>\n  <header><h1>Dashboard</h1></header>\n  <article>\n    <header><h2>Monthly Summary</h2></header>\n    <p>Data</p>\n  </article>\n</main>",
    options: ["The document has a main H1 followed by an article section with H2", "Only the first header element is valid HTML5", "Nested header elements are ignored by assistive tech", "Headers must only contain h1 through h6 tags"],
    correctIndex: 0,
    explanation: "HTML5 allows <header> tags within both document roots and sectioning content like <article>, properly nesting the heading levels."
  },
  {
    id: "css_q4",
    skillId: "css",
    topicTag: "css_box_model",
    difficulty: "beginner",
    cognitiveTier: "syntax_recall",
    prompt: "Which CSS box-sizing property value ensures that padding and border are included within the element's specified width and height?",
    codeSnippet: "* {\n  box-sizing: _______;\n}",
    options: ["border-box", "content-box", "padding-box", "margin-box"],
    correctIndex: 0,
    explanation: "'border-box' includes padding and border in the element's total width and height, preventing layout breakage."
  },
  {
    id: "css_q5",
    skillId: "css",
    topicTag: "css_flexbox_grid",
    difficulty: "intermediate",
    cognitiveTier: "code_tracing",
    prompt: "What is the computed width of each flex item inside a 600px container given this CSS rule?",
    codeSnippet: ".container { display: flex; width: 600px; }\n.item-a { flex: 1; }\n.item-b { flex: 2; }",
    options: ["item-a: 200px, item-b: 400px", "item-a: 300px, item-b: 300px", "item-a: 150px, item-b: 450px", "item-a: 100px, item-b: 500px"],
    correctIndex: 0,
    explanation: "Total flex grow factor is 1 + 2 = 3 parts. 600px / 3 = 200px per part. item-a gets 200px, item-b gets 400px."
  },
  {
    id: "css_q6",
    skillId: "css",
    topicTag: "css_responsive",
    difficulty: "advanced",
    cognitiveTier: "scenario_debugging",
    prompt: "A media query does not apply when viewed on mobile viewports despite screen width being 375px. What critical meta tag is missing?",
    codeSnippet: "<!-- index.html head -->\n<meta charset=\"UTF-8\">\n<title>App</title>",
    options: ["<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">", "<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">", "<meta name=\"screen-orientation\" content=\"portrait\">", "<meta name=\"device-width\" content=\"responsive\">"],
    correctIndex: 0,
    explanation: "Without the viewport meta tag specifying width=device-width, mobile browsers assume a desktop viewport (typically 980px) and scale down the canvas."
  },
  {
    id: "react_q4",
    skillId: "react",
    topicTag: "react_components_props",
    difficulty: "beginner",
    cognitiveTier: "syntax_recall",
    prompt: "What special prop must be provided when rendering a dynamic array of components in React to maintain reconciliation stability?",
    codeSnippet: "{items.map((item) => (\n  <ListItem _______={item.id} data={item} />\n))}",
    options: ["key", "id", "ref", "index"],
    correctIndex: 0,
    explanation: "React uses the 'key' prop to uniquely identify items in lists and track changes across renders."
  },
  {
    id: "react_q5",
    skillId: "react",
    topicTag: "react_hooks_state",
    difficulty: "intermediate",
    cognitiveTier: "code_tracing",
    prompt: "What is logged to the console when handleClick is called twice rapidly?",
    codeSnippet: "function Counter() {\n  const [count, setCount] = useState(0);\n  const handleClick = () => {\n    setCount(count + 1);\n    setCount(count + 1);\n  };\n  return <button onClick={handleClick}>{count}</button>;\n}",
    options: ["count increments to 1 after re-render", "count increments to 2 after re-render", "count throws a state collision error", "count remains 0 indefinitely"],
    correctIndex: 0,
    explanation: "State updates in the same render pass close over the same count value (0). Both setCount calls pass 0 + 1 = 1. Using updater function setCount(c => c + 1) would yield 2."
  },
  {
    id: "react_q6",
    skillId: "react",
    topicTag: "react_effects_api",
    difficulty: "advanced",
    cognitiveTier: "scenario_debugging",
    prompt: "A useEffect hook fetching data causes an infinite network request loop. What is the root cause?",
    codeSnippet: "useEffect(() => {\n  fetchData().then((res) => setData(res));\n});",
    options: ["Missing dependency array causes the effect to run after every single render", "fetchData() must return an Observable instead of a Promise", "setData cannot be called inside asynchronous callbacks", "useEffect requires an explicit abort controller callback"],
    correctIndex: 0,
    explanation: "Omitting the dependency array causes useEffect to fire after every render; calling setData then triggers a re-render, creating an infinite loop."
  },
  {
    id: "node_q4",
    skillId: "nodejs",
    topicTag: "node_runtime_modules",
    difficulty: "beginner",
    cognitiveTier: "syntax_recall",
    prompt: "Which global object in Node.js provides the directory path of the currently executing module in CommonJS?",
    codeSnippet: "const currentDirectory = _______;",
    options: ["__dirname", "__filename", "process.cwd()", "module.path"],
    correctIndex: 0,
    explanation: "__dirname holds the absolute directory path of the currently executing file in CommonJS modules."
  },
  {
    id: "node_q5",
    skillId: "nodejs",
    topicTag: "node_async_io",
    difficulty: "intermediate",
    cognitiveTier: "code_tracing",
    prompt: "What is the order of printed numbers in the Node.js event loop execution of this snippet?",
    codeSnippet: "console.log(1);\nsetTimeout(() => console.log(2), 0);\nprocess.nextTick(() => console.log(4));\nPromise.resolve().then(() => console.log(3));\nconsole.log(5);",
    options: ["1, 5, 4, 3, 2", "1, 5, 2, 3, 4", "1, 4, 3, 2, 5", "1, 3, 4, 5, 2"],
    correctIndex: 0,
    explanation: "Synchronous logs run first (1, 5). Next process.nextTick microtask queue empties (4), then Promise microtask queue (3), and finally macrotask timer callback (2)."
  },
  {
    id: "node_q6",
    skillId: "nodejs",
    topicTag: "node_express_middleware",
    difficulty: "advanced",
    cognitiveTier: "scenario_debugging",
    prompt: "In an Express app, requests hang indefinitely when hitting an authentication middleware. What statement is missing?",
    codeSnippet: "app.use((req, res, next) => {\n  if (req.headers.authorization) {\n    req.user = verifyToken(req.headers.authorization);\n    // Hand control to next middleware\n  }\n});",
    options: ["next()", "return res.end()", "process.nextTick()", "res.continue()"],
    correctIndex: 0,
    explanation: "Express middleware must call next() to pass execution to the subsequent route handler; omitting it leaves the request hanging."
  },
  {
    id: "api_q4",
    skillId: "rest_apis",
    topicTag: "api_status_auth",
    difficulty: "beginner",
    cognitiveTier: "syntax_recall",
    prompt: "Which HTTP status code indicates that the client request was successfully processed and a new resource was created?",
    codeSnippet: "// POST /api/learners returns created record",
    options: ["201 Created", "200 OK", "204 No Content", "202 Accepted"],
    correctIndex: 0,
    explanation: "HTTP 201 Created signifies that the request succeeded and resulted in the construction of a new resource."
  },
  {
    id: "api_q5",
    skillId: "rest_apis",
    topicTag: "api_http_methods",
    difficulty: "intermediate",
    cognitiveTier: "code_tracing",
    prompt: "According to RESTful idempotent HTTP semantics, which method must be safe to call repeatedly with the exact same side-effects?",
    codeSnippet: "// Client retries network request multiple times on timeout",
    options: ["PUT", "POST", "PATCH (without idempotency key)", "CONNECT"],
    correctIndex: 0,
    explanation: "PUT is idempotent: executing it multiple times with the same payload replaces the target resource without changing the end state beyond the initial call."
  },
  {
    id: "api_q6",
    skillId: "rest_apis",
    topicTag: "api_json_schemas",
    difficulty: "advanced",
    cognitiveTier: "scenario_debugging",
    prompt: "A client receives HTTP 400 with a schema validation error when sending numbers as JSON. What payload error occurred?",
    codeSnippet: '{"learnerId": "alex_101", "weeklyLearningHours": "8"}',
    options: ["weeklyLearningHours was sent as string '8' instead of integer 8", "learnerId cannot contain underscore characters", "Missing authorization bearer token header", "Content-Type must be application/x-www-form-urlencoded"],
    correctIndex: 0,
    explanation: "The schema strictly enforces weeklyLearningHours as a number (z.number()); sending a quoted string fails type validation."
  },
  {
    id: "stats_q4",
    skillId: "statistics",
    topicTag: "stats_descriptive",
    difficulty: "beginner",
    cognitiveTier: "syntax_recall",
    prompt: "Which metric of central tendency is least sensitive to extreme outliers in a heavily skewed distribution?",
    codeSnippet: "salaries = [30000, 32000, 35000, 38000, 1000000]",
    options: ["Median", "Mean", "Standard Deviation", "Variance"],
    correctIndex: 0,
    explanation: "The median identifies the middle value and is robust against extreme high or low outlier values."
  },
  {
    id: "stats_q5",
    skillId: "statistics",
    topicTag: "stats_probability",
    difficulty: "intermediate",
    cognitiveTier: "code_tracing",
    prompt: "If two events A and B are independent, with P(A) = 0.5 and P(B) = 0.4, what is P(A ∩ B)?",
    codeSnippet: "P(A) = 0.5\nP(B) = 0.4\nP(A and B) = ?",
    options: ["0.20", "0.90", "0.10", "0.00"],
    correctIndex: 0,
    explanation: "For independent events, joint probability P(A ∩ B) = P(A) * P(B) = 0.5 * 0.4 = 0.20."
  },
  {
    id: "stats_q6",
    skillId: "statistics",
    topicTag: "stats_hypothesis_testing",
    difficulty: "advanced",
    cognitiveTier: "scenario_debugging",
    prompt: "An A/B test reports a p-value of 0.03 at alpha level 0.05. What is the statistically sound decision?",
    codeSnippet: "alpha = 0.05\np_val = 0.03",
    options: ["Reject null hypothesis: statistically significant difference observed", "Fail to reject null hypothesis because p-value is positive", "Accept null hypothesis with 97% confidence", "Inconclusive because sample size was not pre-calculated"],
    correctIndex: 0,
    explanation: "When p-value (0.03) is less than significance threshold alpha (0.05), we reject the null hypothesis in favor of the alternative."
  },
  {
    id: "pd_q4",
    skillId: "pandas",
    topicTag: "pd_dataframes",
    difficulty: "beginner",
    cognitiveTier: "syntax_recall",
    prompt: "Which Pandas method returns concise summary statistics (count, mean, std, percentiles) for numerical columns?",
    codeSnippet: "import pandas as pd\ndf = pd.read_csv('learners.csv')\nsummary = df._______()",
    options: ["describe", "info", "summary", "aggregate"],
    correctIndex: 0,
    explanation: "df.describe() generates descriptive summary statistics including count, mean, std, min, 25%, 50%, 75%, and max."
  },
  {
    id: "pd_q5",
    skillId: "pandas",
    topicTag: "pd_groupby_merge",
    difficulty: "intermediate",
    cognitiveTier: "code_tracing",
    prompt: "What is the output shape of merging df1 (4 rows) and df2 (3 rows) on key 'id' with how='inner' when only 2 IDs match?",
    codeSnippet: "df1 = pd.DataFrame({'id': [1, 2, 3, 4], 'val': ['a', 'b', 'c', 'd']})\ndf2 = pd.DataFrame({'id': [2, 3, 5], 'score': [10, 20, 30]})\nmerged = pd.merge(df1, df2, on='id', how='inner')",
    options: ["2 rows, 3 columns", "3 rows, 3 columns", "4 rows, 2 columns", "5 rows, 3 columns"],
    correctIndex: 0,
    explanation: "Inner join retains only matching IDs (2 and 3), producing 2 rows. Columns are 'id', 'val', and 'score' (3 columns)."
  },
  {
    id: "pd_q6",
    skillId: "pandas",
    topicTag: "pd_cleaning",
    difficulty: "advanced",
    cognitiveTier: "scenario_debugging",
    prompt: "A Pandas chained assignment raises SettingWithCopyWarning when updating filtered rows. What is the canonical fix?",
    codeSnippet: "# Warning triggered:\ndf[df['score'] < 50]['remedial'] = True",
    options: ["df.loc[df['score'] < 50, 'remedial'] = True", "df['remedial'].apply(lambda x: True)", "df.filter(lambda x: x < 50)['remedial'] = True", "df.copy()['remedial'] = True"],
    correctIndex: 0,
    explanation: "Using df.loc[row_indexer, col_indexer] = value explicitly accesses and mutates the parent DataFrame in place without ambiguous slices."
  },
  {
    id: "ml_q4",
    skillId: "machine_learning",
    topicTag: "ml_supervised",
    difficulty: "beginner",
    cognitiveTier: "syntax_recall",
    prompt: "Which classification algorithm models the probability of a binary outcome using a logistic sigmoid function?",
    codeSnippet: "from sklearn.linear_model import _______",
    options: ["LogisticRegression", "LinearRegression", "RidgeClassifier", "SGDRegressor"],
    correctIndex: 0,
    explanation: "Logistic Regression applies the sigmoid function to map linear model outputs to bounded probabilities between 0 and 1."
  },
  {
    id: "ml_q5",
    skillId: "machine_learning",
    topicTag: "ml_feature_engineering",
    difficulty: "intermediate",
    cognitiveTier: "code_tracing",
    prompt: "What does StandardScaler transform a feature column with mean 50 and standard deviation 10 into for value 70?",
    codeSnippet: "from sklearn.preprocessing import StandardScaler\n# z = (x - mean) / std\n# x = 70, mean = 50, std = 10",
    options: ["2.0", "1.5", "20.0", "0.7"],
    correctIndex: 0,
    explanation: "Standard z-score formula: (70 - 50) / 10 = 20 / 10 = 2.0."
  },
  {
    id: "ml_q6",
    skillId: "machine_learning",
    topicTag: "ml_evaluation_metrics",
    difficulty: "advanced",
    cognitiveTier: "scenario_debugging",
    prompt: "On a highly imbalanced dataset (99% negative, 1% positive), a dummy classifier predicting all negative achieves 99% accuracy. Which metric exposes this failure?",
    codeSnippet: "# Imbalanced fraud detection model\ny_true = [0]*990 + [1]*10\ny_pred = [0]*1000",
    options: ["Precision, Recall, and PR-AUC", "Raw Accuracy Score", "Mean Squared Error", "Explained Variance"],
    correctIndex: 0,
    explanation: "Recall for the positive class is 0% (0 / 10). Precision-Recall analysis and F1-score immediately expose dummy majority predictors on skewed classes."
  }
];

const merged = [...existing, ...newQuestions];
fs.writeFileSync(questionsPath, JSON.stringify(merged, null, 2) + "\n", "utf-8");
console.log(`Successfully merged ${newQuestions.length} new questions. Total questions: ${merged.length}`);
