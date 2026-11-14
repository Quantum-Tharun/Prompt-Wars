import {
  LearningRoadmapSchema,
  type CareerGapMatrix,
  type LearnerBackground,
  type LearningRoadmap,
  type RoadmapModule,
  type RoadmapProvenance,
} from "../schemas/domain.schema";
import { type CareerGapAgentOutput } from "./career-gap-agent";
import { enforcePrerequisiteLocks } from "../engine/adaptation-engine";
import { getResourcesCatalogue } from "../data-loader";
import { executeAgentWithFallback, type AgentExecutionResult } from "../ai/gemini";

export async function runLearningPlanner(
  background: LearnerBackground,
  gapMatrix: CareerGapMatrix,
  gapAnalysis: CareerGapAgentOutput
): Promise<AgentExecutionResult<LearningRoadmap>> {
  const allResources = getResourcesCatalogue();
  const validResourceIds = new Set(allResources.map((r) => r.id));

  const systemPrompt = `You are the Learning Planner (Agent 3) in the SkillPath AI architecture.
Your mission is to synthesize a dependency-locked 5-phase learning roadmap DAG.
The 5 phases are:
1. Phase 1: Strengthen Existing Foundations & Patch Calibration Gaps
2. Phase 2: Core Language & Data Mechanics
3. Phase 3: Frontend / Domain Frameworks
4. Phase 4: Backend / Systems / Model Integration
5. Phase 5: Full-Stack / End-to-End Capstone Project

Prerequisite rules: Phase 1 modules must have empty prerequisiteModuleIds. Downstream modules must explicitly list predecessor moduleIds in prerequisiteModuleIds.
Include readinessImpactPercent, roiPerHour, and provenance for each module.
Output JSON conforming to LearningRoadmapSchema.`;

  const userPrompt = `Learner Profile:
ID: ${background.learnerId}
Name: ${background.name}
Target Career: ${background.targetCareerId}
Weekly Hours: ${background.weeklyLearningHours}

Career Gap Matrix:
${JSON.stringify(gapMatrix, null, 2)}

Strategic Career Gap Analysis:
${JSON.stringify(gapAnalysis, null, 2)}

Generate the 5-phase LearningRoadmap.`;

  const deterministicFallback = (): LearningRoadmap => {
    const timestamp = new Date().toISOString();
    const modules: RoadmapModule[] = [];

    if (gapMatrix.targetCareerId === "fullstack_dev") {
      // Phase 1: Foundations
      modules.push({
        moduleId: "mod_fs_html_css",
        phaseNumber: 1,
        phaseTitle: "Foundations & Semantic Markup",
        title: "Semantic HTML5, Accessibility & CSS Layout Architectures",
        skillId: "html",
        targetTopics: ["html_semantics", "html_forms", "css_box_model", "css_flexbox_grid"],
        learningObjectives: [
          "Master accessible semantic markup structures and native form constraint validations",
          "Implement responsive flexbox and grid layouts without framework crutches",
        ],
        priority: "critical_remediation",
        status: "unlocked",
        prerequisiteModuleIds: [],
        curatedResourceIds: ["res_html_1", "res_html_2", "res_css_1"],
        practicalExercisePrompt:
          "Construct a fully responsive, semantic dashboard layout with accessible forms and live client-side validation.",
        estimatedHours: 12,
        readinessImpactPercent: 8,
        roiPerHour: 0.67,
        isAdaptiveInsertion: false,
        provenance: {
          triggerType: "calibration_gap",
          sourceQuestionIds: ["html_q4"],
          failedTopicTags: ["html_forms"],
          calibrationDelta: 0,
          triangulatedArchetype: "calibrated_learner",
          careerWeight: 3,
          auditTrailText: "Calibrated baseline: reinforces foundational form constraints to unlock frontend component state.",
        },
      });

      modules.push({
        moduleId: "mod_fs_sql_patch",
        phaseNumber: 1,
        phaseTitle: "Foundations & Relational Data",
        title: "Relational SQL Algebra, Advanced Aggregations & Joins",
        skillId: "sql",
        targetTopics: ["sql_select_filter", "sql_aggregation", "sql_joins"],
        learningObjectives: [
          "Eliminate SQL illusion of competence by mastering multi-table INNER and LEFT JOIN predicates",
          "Formulate GROUP BY and HAVING aggregation pipelines to solve real-world data questions",
        ],
        priority: "critical_remediation",
        status: "unlocked",
        prerequisiteModuleIds: [],
        curatedResourceIds: ["res_sql_1", "res_sql_2"],
        practicalExercisePrompt:
          "Write complex queries against an e-commerce database calculating customer lifetime value and churn rates with zero Cartesian joins.",
        estimatedHours: 15,
        readinessImpactPercent: 12,
        roiPerHour: 0.8,
        isAdaptiveInsertion: false,
        provenance: {
          triggerType: "calibration_gap",
          sourceQuestionIds: ["sql_q2", "sql_q3"],
          failedTopicTags: ["sql_aggregation", "sql_joins"],
          calibrationDelta: -1,
          triangulatedArchetype: "certificate_collector",
          careerWeight: 4,
          auditTrailText: "Prescribed due to -1 Calibration Delta (Illusion of Competence). Passive certificates failed to translate into relational join fluency.",
        },
      });

      modules.push({
        moduleId: "mod_fs_python_scripting",
        phaseNumber: 1,
        phaseTitle: "Foundations & Backend Scripting",
        title: "Python Modular Scripting & Core Data Structures",
        skillId: "python",
        targetTopics: ["py_data_types", "py_control_flow", "py_functions"],
        learningObjectives: [
          "Reinforce clean procedural script structures and deterministic control flow",
          "Leverage lexical scoping and function closures for modular toolchains",
        ],
        priority: "core_curriculum",
        status: "unlocked",
        prerequisiteModuleIds: [],
        curatedResourceIds: ["res_py_1"],
        practicalExercisePrompt:
          "Develop a CLI data migration utility parsing dirty input files with resilient error boundaries.",
        estimatedHours: 10,
        readinessImpactPercent: 6,
        roiPerHour: 0.6,
        isAdaptiveInsertion: false,
        provenance: {
          triggerType: "archetype_prescription",
          sourceQuestionIds: ["py_q2", "py_q3"],
          failedTopicTags: [],
          calibrationDelta: 0,
          triangulatedArchetype: "verified_practitioner",
          careerWeight: 3,
          auditTrailText: "Leverages existing verified Python repository capital to bridge backend data scripting.",
        },
      });

      // Phase 2: Core Language & Asynchronous Mechanics
      modules.push({
        moduleId: "mod_fs_javascript_core",
        phaseNumber: 2,
        phaseTitle: "Core Language & Asynchronous Mechanics",
        title: "Modern JavaScript Deep Dive: Lexical Scope, Closures & Event Loop",
        skillId: "javascript",
        targetTopics: ["js_functions_scope", "js_arrays_objects", "js_async_promises"],
        learningObjectives: [
          "Master lexical scope, block closures, and Temporal Dead Zone semantics",
          "Deconstruct JavaScript microtask queues, macrotasks, and async/await error propagation",
        ],
        priority: "high_priority_gap",
        status: "locked",
        prerequisiteModuleIds: ["mod_fs_html_css"],
        curatedResourceIds: ["res_js_1", "res_js_2", "res_js_3"],
        practicalExercisePrompt:
          "Implement a custom Promise-based concurrency limiter and rate-limited HTTP fetch queue from scratch.",
        estimatedHours: 20,
        readinessImpactPercent: 18,
        roiPerHour: 0.9,
        isAdaptiveInsertion: false,
        provenance: {
          triggerType: "missing_career_requirement",
          sourceQuestionIds: [],
          failedTopicTags: ["js_functions_scope", "js_arrays_objects", "js_async_promises"],
          calibrationDelta: 0,
          triangulatedArchetype: "unverified_claim",
          careerWeight: 5,
          auditTrailText: "Critical career competency (Weight: 5). Required prerequisite before React declarative state can be unlocked.",
        },
      });

      // Phase 3: Frontend Component Frameworks
      modules.push({
        moduleId: "mod_fs_react_architecture",
        phaseNumber: 3,
        phaseTitle: "Frontend Frameworks & State Lifecycle",
        title: "React Component Patterns, Hooks & Declarative State Architecture",
        skillId: "react",
        targetTopics: ["react_components_props", "react_hooks_state", "react_effects_api"],
        learningObjectives: [
          "Architect reusable component hierarchies governed by unidirectional data flow",
          "Manage state side-effects cleanly with useEffect, AbortController, and custom hooks",
        ],
        priority: "high_priority_gap",
        status: "locked",
        prerequisiteModuleIds: ["mod_fs_javascript_core"],
        curatedResourceIds: ["res_react_1", "res_react_2"],
        practicalExercisePrompt:
          "Build an interactive task orchestration Kanban board with optimistic UI updates and live search filtering.",
        estimatedHours: 22,
        readinessImpactPercent: 16,
        roiPerHour: 0.73,
        isAdaptiveInsertion: false,
        provenance: {
          triggerType: "missing_career_requirement",
          sourceQuestionIds: [],
          failedTopicTags: [],
          calibrationDelta: 0,
          triangulatedArchetype: "unverified_claim",
          careerWeight: 4,
          auditTrailText: "Key market framework requirement. Dependency-locked until core JavaScript closures are mastered.",
        },
      });

      // Phase 4: Backend Systems & Distributed APIs
      modules.push({
        moduleId: "mod_fs_node_rest",
        phaseNumber: 4,
        phaseTitle: "Backend Systems & API Architecture",
        title: "Node.js Server Runtimes, Express Middleware & RESTful Protocols",
        skillId: "nodejs",
        targetTopics: ["node_runtime_modules", "node_express_middleware", "api_http_methods", "api_status_auth"],
        learningObjectives: [
          "Construct production-grade Express REST APIs with modular middleware pipelines",
          "Implement robust JWT bearer token authentication and deterministic error handling schemas",
        ],
        priority: "high_priority_gap",
        status: "locked",
        prerequisiteModuleIds: ["mod_fs_javascript_core", "mod_fs_sql_patch"],
        curatedResourceIds: ["res_node_1", "res_node_2", "res_api_1", "res_api_2"],
        practicalExercisePrompt:
          "Build a secure RESTful API microservice with role-based access control, input validation, and database pooling.",
        estimatedHours: 24,
        readinessImpactPercent: 18,
        roiPerHour: 0.75,
        isAdaptiveInsertion: false,
        provenance: {
          triggerType: "missing_career_requirement",
          sourceQuestionIds: [],
          failedTopicTags: [],
          calibrationDelta: 0,
          triangulatedArchetype: "unverified_claim",
          careerWeight: 4,
          auditTrailText: "Dual dependency locked behind JavaScript engine mechanics and SQL relational schema patching.",
        },
      });

      // Phase 5: Production Capstone Project
      modules.push({
        moduleId: "mod_fs_capstone_project",
        phaseNumber: 5,
        phaseTitle: "Full-Stack Production Capstone",
        title: "Production SaaS Platform: End-to-End Full-Stack Deployment",
        skillId: "react",
        targetTopics: ["react_effects_api", "node_express_middleware", "sql_joins", "api_status_auth"],
        learningObjectives: [
          "Integrate React client, Express API gateway, and relational PostgreSQL persistence into a unified CI/CD deployable repo",
          "Deliver end-to-end telemetry, automated testing suites, and production performance optimization",
        ],
        priority: "capstone",
        status: "locked",
        prerequisiteModuleIds: ["mod_fs_react_architecture", "mod_fs_node_rest"],
        curatedResourceIds: ["res_react_2", "res_node_1", "res_sql_2"],
        practicalExercisePrompt:
          "Ship a complete multi-tenant project management SaaS with real-time notifications, authenticated REST API, and relational database migrations.",
        estimatedHours: 35,
        readinessImpactPercent: 22,
        roiPerHour: 0.63,
        isAdaptiveInsertion: false,
        provenance: {
          triggerType: "archetype_prescription",
          sourceQuestionIds: [],
          failedTopicTags: [],
          calibrationDelta: 0,
          triangulatedArchetype: "verified_practitioner",
          careerWeight: 5,
          auditTrailText: "Transforms theoretical competence into verified portfolio capital with live deployment.",
        },
      });
    } else if (gapMatrix.targetCareerId === "data_analyst") {
      // Data Analyst modules
      modules.push({
        moduleId: "mod_da_sql_advanced",
        phaseNumber: 1,
        phaseTitle: "Relational Querying & Aggregations",
        title: "Advanced SQL: Window Functions, CTEs & Cohort Analysis",
        skillId: "sql",
        targetTopics: ["sql_aggregation", "sql_joins", "sql_subqueries"],
        learningObjectives: [
          "Master multi-table relational joins, analytical window functions, and CTEs",
          "Extract strategic business metrics and cohort retention tables directly in SQL",
        ],
        priority: "critical_remediation",
        status: "unlocked",
        prerequisiteModuleIds: [],
        curatedResourceIds: ["res_sql_2", "res_sql_3"],
        practicalExercisePrompt:
          "Author a suite of analytical SQL reports calculating month-over-month growth, rolling averages, and customer churn rates.",
        estimatedHours: 18,
        readinessImpactPercent: 25,
        roiPerHour: 1.39,
        isAdaptiveInsertion: false,
        provenance: {
          triggerType: "calibration_gap",
          sourceQuestionIds: ["sql_q2", "sql_q3"],
          failedTopicTags: ["sql_aggregation", "sql_joins"],
          calibrationDelta: -1,
          triangulatedArchetype: "certificate_collector",
          careerWeight: 5,
          auditTrailText: "Primary data analyst competency: solves SQL join gaps to unlock advanced cohort analytics.",
        },
      });

      modules.push({
        moduleId: "mod_da_python_analytics",
        phaseNumber: 2,
        phaseTitle: "Analytical Python Core",
        title: "Python Data Manipulation: Control Structures, Functions & Collections",
        skillId: "python",
        targetTopics: ["py_control_flow", "py_functions", "py_collections"],
        learningObjectives: [
          "Leverage Python data structures, list comprehensions, and generators for data pipelines",
          "Build reusable ETL transformation modules with robust error handling",
        ],
        priority: "core_curriculum",
        status: "locked",
        prerequisiteModuleIds: ["mod_da_sql_advanced"],
        curatedResourceIds: ["res_py_1", "res_py_2"],
        practicalExercisePrompt:
          "Build an automated data ingestion pipeline that parses JSON and CSV datasets into structured records.",
        estimatedHours: 15,
        readinessImpactPercent: 18,
        roiPerHour: 1.2,
        isAdaptiveInsertion: false,
        provenance: {
          triggerType: "archetype_prescription",
          sourceQuestionIds: ["py_q2", "py_q3"],
          failedTopicTags: [],
          calibrationDelta: 0,
          triangulatedArchetype: "verified_practitioner",
          careerWeight: 4,
          auditTrailText: "Transferred from verified full-stack Python foundation with zero knowledge loss.",
        },
      });

      modules.push({
        moduleId: "mod_da_applied_statistics",
        phaseNumber: 3,
        phaseTitle: "Applied Statistics & Inference",
        title: "Inferential Statistics, Probability & A/B Testing Significance",
        skillId: "statistics",
        targetTopics: ["stats_descriptive", "stats_probability", "stats_hypothesis_testing"],
        learningObjectives: [
          "Formulate rigorous hypothesis tests, interpret p-values, and compute confidence intervals",
          "Design valid A/B test experiments while preventing sample ratio mismatches and p-hacking",
        ],
        priority: "high_priority_gap",
        status: "locked",
        prerequisiteModuleIds: ["mod_da_python_analytics"],
        curatedResourceIds: ["res_stats_1", "res_stats_2"],
        practicalExercisePrompt:
          "Perform statistical significance testing and bootstrap confidence interval estimation on an e-commerce conversion dataset.",
        estimatedHours: 20,
        readinessImpactPercent: 22,
        roiPerHour: 1.1,
        isAdaptiveInsertion: false,
        provenance: {
          triggerType: "missing_career_requirement",
          sourceQuestionIds: [],
          failedTopicTags: [],
          calibrationDelta: 0,
          triangulatedArchetype: "unverified_claim",
          careerWeight: 5,
          auditTrailText: "Core analytical requirement: hypothesis testing and significance for data-driven decisions.",
        },
      });

      modules.push({
        moduleId: "mod_da_pandas_wrangling",
        phaseNumber: 4,
        phaseTitle: "Tabular Data Wrangling & Exploratory Analysis",
        title: "Pandas at Scale: DataFrames, Reshaping, Imputation & Relational Merges",
        skillId: "pandas",
        targetTopics: ["pd_dataframes", "pd_groupby_merge", "pd_cleaning"],
        learningObjectives: [
          "Clean unstructured data, resolve missing values, and perform complex groupby-transform aggregations",
          "Reshape and merge heterogeneous tabular data sources without memory degradation",
        ],
        priority: "high_priority_gap",
        status: "locked",
        prerequisiteModuleIds: ["mod_da_applied_statistics"],
        curatedResourceIds: ["res_pd_1", "res_pd_2"],
        practicalExercisePrompt:
          "Clean, wrangle, and merge a multi-table financial transactions dataset to surface unit economics and customer acquisition costs.",
        estimatedHours: 22,
        readinessImpactPercent: 22,
        roiPerHour: 1.0,
        isAdaptiveInsertion: false,
        provenance: {
          triggerType: "missing_career_requirement",
          sourceQuestionIds: [],
          failedTopicTags: [],
          calibrationDelta: 0,
          triangulatedArchetype: "unverified_claim",
          careerWeight: 5,
          auditTrailText: "High-priority data wrangling gap. Crucial for business intelligence synthesis.",
        },
      });

      modules.push({
        moduleId: "mod_da_capstone_bi",
        phaseNumber: 5,
        phaseTitle: "Strategic BI & Analytics Capstone",
        title: "Executive Business Intelligence Pipeline & Automated Analytics Suite",
        skillId: "pandas",
        targetTopics: ["pd_groupby_merge", "stats_hypothesis_testing", "sql_subqueries"],
        learningObjectives: [
          "Synthesize SQL data lake queries, Pandas transformations, and statistical inference into an executive analytics dashboard",
          "Present evidence-backed strategic recommendations and automated reporting scripts",
        ],
        priority: "capstone",
        status: "locked",
        prerequisiteModuleIds: ["mod_da_pandas_wrangling"],
        curatedResourceIds: ["res_pd_2", "res_stats_2", "res_sql_3"],
        practicalExercisePrompt:
          "Publish an end-to-end business intelligence study uncovering operational bottlenecks with statistical validation and automated executive summaries.",
        estimatedHours: 30,
        readinessImpactPercent: 20,
        roiPerHour: 0.67,
        isAdaptiveInsertion: false,
        provenance: {
          triggerType: "archetype_prescription",
          sourceQuestionIds: [],
          failedTopicTags: [],
          calibrationDelta: 0,
          triangulatedArchetype: "verified_practitioner",
          careerWeight: 5,
          auditTrailText: "Capstone project translating data querying into executive-level decision systems.",
        },
      });
    } else {
      // AI/ML Engineer
      modules.push({
        moduleId: "mod_ml_python_foundations",
        phaseNumber: 1,
        phaseTitle: "Engineering Python & Relational Extraction",
        title: "Advanced Python OOP, Collections & SQL Feature Queries",
        skillId: "python",
        targetTopics: ["py_functions", "py_collections", "py_oop", "sql_select_filter"],
        learningObjectives: [
          "Master object-oriented design patterns, abstract base classes, and performance profiling in Python",
          "Extract training datasets with parameterized SQL feature queries",
        ],
        priority: "core_curriculum",
        status: "unlocked",
        prerequisiteModuleIds: [],
        curatedResourceIds: ["res_py_2", "res_sql_1"],
        practicalExercisePrompt:
          "Build an object-oriented data streaming engine that queries relational records and emits preprocessed mini-batches.",
        estimatedHours: 16,
        readinessImpactPercent: 20,
        roiPerHour: 1.25,
        isAdaptiveInsertion: false,
        provenance: {
          triggerType: "archetype_prescription",
          sourceQuestionIds: ["py_q2", "py_q3"],
          failedTopicTags: [],
          calibrationDelta: 0,
          triangulatedArchetype: "verified_practitioner",
          careerWeight: 5,
          auditTrailText: "Leverages existing Python foundation into machine learning OOP pipelines.",
        },
      });

      modules.push({
        moduleId: "mod_ml_math_stats",
        phaseNumber: 2,
        phaseTitle: "Mathematical Foundations & Statistical Modeling",
        title: "Applied Probability Distributions & Statistical Inference for ML",
        skillId: "statistics",
        targetTopics: ["stats_probability", "stats_hypothesis_testing"],
        learningObjectives: [
          "Master Bayes theorem, maximum likelihood estimation, and multivariate probability distributions",
          "Apply statistical power analysis and significance testing to machine learning benchmark experiments",
        ],
        priority: "high_priority_gap",
        status: "locked",
        prerequisiteModuleIds: ["mod_ml_python_foundations"],
        curatedResourceIds: ["res_stats_1", "res_stats_2"],
        practicalExercisePrompt:
          "Implement maximum likelihood estimation and Bayesian parameter updates for predictive classification from scratch.",
        estimatedHours: 18,
        readinessImpactPercent: 20,
        roiPerHour: 1.11,
        isAdaptiveInsertion: false,
        provenance: {
          triggerType: "missing_career_requirement",
          sourceQuestionIds: [],
          failedTopicTags: [],
          calibrationDelta: 0,
          triangulatedArchetype: "unverified_claim",
          careerWeight: 4,
          auditTrailText: "Mathematical bedrock for loss functions, probability estimation, and evaluation metrics.",
        },
      });

      modules.push({
        moduleId: "mod_ml_pandas_pipeline",
        phaseNumber: 3,
        phaseTitle: "Data Pipeline & Feature Wrangling",
        title: "Tabular Feature Engineering & High-Throughput Pandas Pipelines",
        skillId: "pandas",
        targetTopics: ["pd_dataframes", "pd_groupby_merge"],
        learningObjectives: [
          "Design automated feature extraction, one-hot encoding, and numerical scaling transformers",
          "Prevent train-test data leakage during tabular preprocessing pipelines",
        ],
        priority: "high_priority_gap",
        status: "locked",
        prerequisiteModuleIds: ["mod_ml_math_stats"],
        curatedResourceIds: ["res_pd_1", "res_pd_2"],
        practicalExercisePrompt:
          "Build a scikit-learn compatible custom data preprocessing transformer with leakage-free cross-validation.",
        estimatedHours: 20,
        readinessImpactPercent: 18,
        roiPerHour: 0.9,
        isAdaptiveInsertion: false,
        provenance: {
          triggerType: "missing_career_requirement",
          sourceQuestionIds: [],
          failedTopicTags: [],
          calibrationDelta: 0,
          triangulatedArchetype: "unverified_claim",
          careerWeight: 4,
          auditTrailText: "Prevents data leakage in training pipelines before model training begins.",
        },
      });

      modules.push({
        moduleId: "mod_ml_supervised_models",
        phaseNumber: 4,
        phaseTitle: "Supervised Modeling & Metric Optimization",
        title: "Predictive Machine Learning Algorithms, Regularization & Evaluation",
        skillId: "machine_learning",
        targetTopics: ["ml_supervised", "ml_evaluation_metrics", "ml_feature_engineering"],
        learningObjectives: [
          "Train, tune, and regularize linear models, ensemble trees, and gradient boosted estimators",
          "Evaluate imbalanced models using PR-AUC, ROC-AUC, Precision, and Recall trade-offs",
        ],
        priority: "high_priority_gap",
        status: "locked",
        prerequisiteModuleIds: ["mod_ml_pandas_pipeline"],
        curatedResourceIds: ["res_ml_1", "res_ml_2"],
        practicalExercisePrompt:
          "Train and hyperparameter-tune a gradient-boosted classifier on an imbalanced fraud dataset, optimizing the precision-recall curve.",
        estimatedHours: 25,
        readinessImpactPercent: 25,
        roiPerHour: 1.0,
        isAdaptiveInsertion: false,
        provenance: {
          triggerType: "missing_career_requirement",
          sourceQuestionIds: [],
          failedTopicTags: [],
          calibrationDelta: 0,
          triangulatedArchetype: "unverified_claim",
          careerWeight: 5,
          auditTrailText: "Primary algorithmic competency: gradient boosting, hyperparameter optimization, and validation.",
        },
      });

      modules.push({
        moduleId: "mod_ml_capstone_serving",
        phaseNumber: 5,
        phaseTitle: "Production ML Systems Capstone",
        title: "End-to-End Machine Learning System: Training, Evaluation & API Serving",
        skillId: "machine_learning",
        targetTopics: ["ml_supervised", "ml_evaluation_metrics", "py_oop"],
        learningObjectives: [
          "Package a trained machine learning pipeline inside an optimized REST inference server",
          "Implement data drift monitoring, automated validation tests, and reproducible model versioning",
        ],
        priority: "capstone",
        status: "locked",
        prerequisiteModuleIds: ["mod_ml_supervised_models"],
        curatedResourceIds: ["res_ml_1", "res_py_2"],
        practicalExercisePrompt:
          "Deploy an automated ML pipeline with containerized model serving, live inference endpoints, and automated drift alerts.",
        estimatedHours: 35,
        readinessImpactPercent: 20,
        roiPerHour: 0.57,
        isAdaptiveInsertion: false,
        provenance: {
          triggerType: "archetype_prescription",
          sourceQuestionIds: [],
          failedTopicTags: [],
          calibrationDelta: 0,
          triangulatedArchetype: "verified_practitioner",
          careerWeight: 5,
          auditTrailText: "Demonstrates production readiness with live API serving and drift monitoring.",
        },
      });
    }

    const lockedModules = enforcePrerequisiteLocks(modules);
    const totalHours = lockedModules.reduce((acc, m) => acc + m.estimatedHours, 0);
    const weeklyHours = Math.max(1, background.weeklyLearningHours || 10);
    const completionWeeks = Math.ceil(totalHours / weeklyHours);

    return {
      roadmapId: `roadmap_${background.learnerId}_${Date.now()}`,
      learnerId: background.learnerId,
      targetCareerId: gapMatrix.targetCareerId,
      generatedAt: timestamp,
      revisionNumber: 1,
      totalEstimatedHours: totalHours,
      projectedCompletionWeeks: completionWeeks,
      modules: lockedModules,
      revisionHistory: [
        {
          revisionNumber: 1,
          timestamp,
          trigger: "initial_generation",
          summary: `Initial 5-phase DAG roadmap generated for ${gapMatrix.targetCareerTitle}. Total estimated hours: ${totalHours} (~${completionWeeks} weeks).`,
        },
      ],
    };
  };

  const agentResult = await executeAgentWithFallback<LearningRoadmap>({
    agentName: "LearningPlanner",
    systemPrompt,
    userPrompt,
    zodSchema: LearningRoadmapSchema,
    deterministicFallback,
    extractKeyFindings: (data) => [
      `Roadmap synthesized with ${data.modules.length} modules across 5 phases.`,
      `Total estimated hours: ${data.totalEstimatedHours} hours (~${data.projectedCompletionWeeks} weeks).`,
      `Phase 1 unlocked modules: ${data.modules.filter((m) => m.status === "unlocked").map((m) => m.title).join(", ")}.`,
    ],
    inputSummary: `Synthesized 5-phase roadmap for ${gapMatrix.targetCareerTitle} (${gapMatrix.overallReadinessScore}% initial readiness).`,
  });

  const sanitizedModules = agentResult.data.modules.map((m) => {
    const validIds = m.curatedResourceIds.filter((id) => validResourceIds.has(id));
    return {
      ...m,
      curatedResourceIds: validIds.length > 0 ? validIds : [allResources[0].id],
    };
  });

  const lockedModules = enforcePrerequisiteLocks(sanitizedModules);
  const totalHours = lockedModules.reduce((acc, m) => acc + m.estimatedHours, 0);
  const weeklyHours = Math.max(1, background.weeklyLearningHours || 10);
  const completionWeeks = Math.ceil(totalHours / weeklyHours);

  const cleanRoadmap: LearningRoadmap = {
    ...agentResult.data,
    totalEstimatedHours: totalHours,
    projectedCompletionWeeks: completionWeeks,
    modules: lockedModules,
  };

  return {
    data: cleanRoadmap,
    trace: agentResult.trace,
  };
}
