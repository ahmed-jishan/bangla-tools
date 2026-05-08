// // tools/workflow-builder.js
// import { getAllWorkflows, saveWorkflow, deleteWorkflow } from './presets-manager.js';
// import { getAllPresets } from './presets-manager.js';

// // This will be populated by the main app during registration
// const toolRegistry = new Map(); // toolId -> { name, icon, getSettings, applySettings, run }

// export function registerTool(toolId, meta) {
//   toolRegistry.set(toolId, meta);
// }

// export function getToolMeta(toolId) {
//   return toolRegistry.get(toolId);
// }

// export function getAllToolIds() {
//   return Array.from(toolRegistry.keys());
// }

// // ─── Workflow Runner ─────────────────────────────────
// export async function runWorkflow(workflow, inputText) {
//   let currentText = inputText;
//   const stepOutputs = [];
//   for (const step of workflow.steps) {
//     const meta = toolRegistry.get(step.toolId);
//     if (!meta) {
//       stepOutputs.push({ step, error: `Tool "${step.toolId}" not found` });
//       break;
//     }
//     // Apply preset settings
//     if (step.presetId) {
//       const preset = loadPreset(step.toolId, step.presetId);
//       if (preset) meta.applySettings(preset.settings);
//     }
//     // Run the tool (needs to be implemented per tool)
//     const output = await meta.run(currentText);
//     stepOutputs.push({ step, output });
//     currentText = output;
//   }
//   return { finalOutput: currentText, stepOutputs };
// }

/**
 * workflow-builder.js
 * Tool registry + workflow execution engine.
 * Supports progress callbacks, abort signals, per-step retry, and dry-run mode.
 */

import {
  getAllWorkflows,
  getWorkflow,
  saveWorkflow,
  deleteWorkflow,
  duplicateWorkflow,
  loadPreset,
  getAllPresets,
  on as pmOn,
} from './presets-manager.js';

export {
  getAllWorkflows,
  getWorkflow,
  saveWorkflow,
  deleteWorkflow,
  duplicateWorkflow,
  getAllPresets,
};

// ─── Tool Registry ───────────────────────────────────────────────────────────────

/**
 * @typedef {Object} ToolMeta
 * @property {string}   name          - Display name (required)
 * @property {string}   icon          - Emoji or short icon string (required)
 * @property {string}   [description] - Short description for UI
 * @property {string[]} [tags]        - Searchable tags
 * @property {(text: string) => Promise<string>} run - Process function (required)
 * @property {() => Object}        [getSettings]   - Returns current settings snapshot
 * @property {(settings: Object) => void} [applySettings] - Apply a settings snapshot
 * @property {(text: string) => boolean} [canProcess]  - Returns false if tool cannot handle input
 */

/** @type {Map<string, ToolMeta>} */
const toolRegistry = new Map();

/**
 * Register a tool. Overwrites any existing registration with the same id.
 * @param {string}   toolId
 * @param {ToolMeta} meta
 */
export function registerTool(toolId, meta) {
  if (!toolId || typeof toolId !== 'string') throw new Error('toolId must be a non-empty string');
  if (!meta.name) throw new Error(`Tool "${toolId}" must have a name`);
  if (typeof meta.run !== 'function') throw new Error(`Tool "${toolId}" must have a run() function`);
  toolRegistry.set(toolId, { tags: [], description: '', ...meta });
}

/**
 * Unregister a tool.
 */
export function unregisterTool(toolId) {
  return toolRegistry.delete(toolId);
}

/**
 * Get tool metadata.
 * @returns {ToolMeta|undefined}
 */
export function getToolMeta(toolId) {
  return toolRegistry.get(toolId);
}

/**
 * Returns all registered tool ids.
 */
export function getAllToolIds() {
  return Array.from(toolRegistry.keys());
}

/**
 * Returns all tools as [{id, ...meta}] array, optionally filtered by tag.
 */
export function getAllTools(filterTag) {
  const entries = Array.from(toolRegistry.entries()).map(([id, meta]) => ({ id, ...meta }));
  if (filterTag) return entries.filter(t => t.tags?.includes(filterTag));
  return entries;
}

// ─── Step Status Types ───────────────────────────────────────────────────────────

/**
 * @typedef {'pending'|'running'|'done'|'error'|'skipped'} StepStatus
 */

/**
 * @typedef {Object} StepResult
 * @property {number}     index
 * @property {Object}     step
 * @property {StepStatus} status
 * @property {string}     [output]
 * @property {string}     [error]
 * @property {number}     [durationMs]
 */

// ─── Workflow Runner ─────────────────────────────────────────────────────────────

/**
 * Run a workflow against input text.
 *
 * @param {Object}   workflow              - The workflow to run
 * @param {string}   inputText             - Initial input
 * @param {Object}   [options]
 * @param {AbortSignal} [options.signal]   - AbortController signal to cancel mid-run
 * @param {function} [options.onProgress]  - (stepResult: StepResult) => void, called after each step
 * @param {boolean}  [options.dryRun]      - If true, validate only — don't call run()
 * @param {number}   [options.retries]     - Retry count per step on failure (default: 0)
 * @param {number}   [options.retryDelay]  - ms to wait between retries (default: 300)
 *
 * @returns {Promise<{
 *   finalOutput: string,
 *   stepResults: StepResult[],
 *   aborted: boolean,
 *   durationMs: number
 * }>}
 */
export async function runWorkflow(workflow, inputText, options = {}) {
  const {
    signal,
    onProgress,
    dryRun = false,
    retries = 0,
    retryDelay = 300,
  } = options;

  if (!workflow?.steps?.length) {
    return { finalOutput: inputText, stepResults: [], aborted: false, durationMs: 0 };
  }

  const totalStart = performance.now();
  let currentText = inputText;
  const stepResults = [];
  let aborted = false;

  for (let i = 0; i < workflow.steps.length; i++) {
    if (signal?.aborted) { aborted = true; break; }

    const step = workflow.steps[i];
    const meta = toolRegistry.get(step.toolId);

    if (!meta) {
      const result = {
        index: i, step, status: 'error',
        error: `Tool "${step.toolId}" is not registered`,
        durationMs: 0,
      };
      stepResults.push(result);
      onProgress?.(result);
      break; // unrecoverable
    }

    // Apply preset settings before running
    if (step.presetId && meta.applySettings) {
      const preset = loadPreset(step.toolId, step.presetId);
      if (preset) {
        try { meta.applySettings(preset.settings); }
        catch (e) { console.warn(`[workflow] Failed to apply preset "${preset.name}":`, e); }
      }
    }

    // canProcess guard
    if (meta.canProcess && !meta.canProcess(currentText)) {
      const result = {
        index: i, step, status: 'skipped',
        output: currentText,
        error: `Tool "${meta.name}" skipped: canProcess() returned false`,
        durationMs: 0,
      };
      stepResults.push(result);
      onProgress?.(result);
      continue;
    }

    const stepStart = performance.now();
    let lastError;
    let output;
    let succeeded = false;

    for (let attempt = 0; attempt <= retries; attempt++) {
      if (signal?.aborted) { aborted = true; break; }
      try {
        if (dryRun) {
          output = currentText; // passthrough in dry-run
        } else {
          output = await meta.run(currentText);
          if (typeof output !== 'string') {
            throw new TypeError(`Tool "${meta.name}" run() must return a string`);
          }
        }
        succeeded = true;
        break;
      } catch (e) {
        lastError = e;
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, retryDelay * Math.pow(2, attempt)));
        }
      }
    }

    const durationMs = Math.round(performance.now() - stepStart);

    if (aborted) break;

    if (succeeded) {
      currentText = output;
      const result = { index: i, step, status: 'done', output: currentText, durationMs };
      stepResults.push(result);
      onProgress?.(result);
    } else {
      const result = {
        index: i, step, status: 'error',
        error: lastError?.message ?? 'Unknown error',
        durationMs,
      };
      stepResults.push(result);
      onProgress?.(result);
      break; // stop pipeline on error
    }
  }

  return {
    finalOutput: currentText,
    stepResults,
    aborted,
    durationMs: Math.round(performance.now() - totalStart),
  };
}

/**
 * Validate a workflow without running it.
 * Returns an array of validation error messages (empty = valid).
 */
export function validateWorkflow(workflow) {
  const errors = [];
  if (!workflow?.name?.trim()) errors.push('Workflow must have a name');
  if (!Array.isArray(workflow?.steps) || workflow.steps.length === 0) {
    errors.push('Workflow must have at least one step');
    return errors;
  }
  workflow.steps.forEach((step, i) => {
    if (!step.toolId) {
      errors.push(`Step ${i + 1}: missing toolId`);
    } else if (!toolRegistry.has(step.toolId)) {
      errors.push(`Step ${i + 1}: tool "${step.toolId}" is not registered`);
    }
  });
  return errors;
}

// ─── Registry Reactivity (optional) ─────────────────────────────────────────────

/**
 * Subscribe to preset or workflow changes from presets-manager.
 * Useful for refreshing UI when storage changes externally (e.g. import).
 */
export function onStorageChange(fn) {
  const unsub = [
    pmOn('preset:saved', fn),
    pmOn('preset:deleted', fn),
    pmOn('workflow:saved', fn),
    pmOn('workflow:deleted', fn),
    pmOn('import:done', fn),
  ];
  return () => unsub.forEach(u => u());
}