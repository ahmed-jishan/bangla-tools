// // tools/presets-manager.js

// const STORAGE_KEY = 'bangla_tool_presets';
// const WORKFLOW_KEY = 'bangla_tool_workflows';

// // ─── Presets ─────────────────────────────────────────
// export function savePreset(toolId, presetName, settings) {
//   const presets = loadAllPresets();
//   if (!presets[toolId]) presets[toolId] = [];
//   // avoid duplicate names
//   const existing = presets[toolId].find(p => p.name === presetName);
//   if (existing) existing.settings = settings;
//   else presets[toolId].push({ id: Date.now().toString(), name: presetName, settings });
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
// }

// export function loadPreset(toolId, presetId) {
//   const presets = loadAllPresets();
//   return presets[toolId]?.find(p => p.id === presetId) || null;
// }

// export function getAllPresets(toolId) {
//   const presets = loadAllPresets();
//   return presets[toolId] || [];
// }

// export function deletePreset(toolId, presetId) {
//   const presets = loadAllPresets();
//   if (presets[toolId]) {
//     presets[toolId] = presets[toolId].filter(p => p.id !== presetId);
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
//   }
// }

// function loadAllPresets() {
//   const raw = localStorage.getItem(STORAGE_KEY);
//   return raw ? JSON.parse(raw) : {};
// }

// // ─── Workflows ────────────────────────────────────────
// export function saveWorkflow(workflow) {
//   const workflows = loadAllWorkflows();
//   if (workflow.id) {
//     const index = workflows.findIndex(w => w.id === workflow.id);
//     if (index !== -1) workflows[index] = workflow;
//     else workflows.push(workflow);
//   } else {
//     workflow.id = Date.now().toString();
//     workflows.push(workflow);
//   }
//   localStorage.setItem(WORKFLOW_KEY, JSON.stringify(workflows));
//   return workflow.id;
// }

// export function deleteWorkflow(id) {
//   let workflows = loadAllWorkflows();
//   workflows = workflows.filter(w => w.id !== id);
//   localStorage.setItem(WORKFLOW_KEY, JSON.stringify(workflows));
// }

// export function getAllWorkflows() {
//   return loadAllWorkflows();
// }

// function loadAllWorkflows() {
//   const raw = localStorage.getItem(WORKFLOW_KEY);
//   return raw ? JSON.parse(raw) : [];
// }

/**
 * presets-manager.js
 * Manages tool presets and multi-step workflows with full persistence,
 * import/export, validation, and event-driven change notification.
 */

const STORAGE_KEY = 'bangla_tool_presets_v2';
const WORKFLOW_KEY = 'bangla_tool_workflows_v2';
const MAX_PRESETS_PER_TOOL = 50;
const MAX_WORKFLOWS = 100;

// ─── Event Bus ─────────────────────────────────────────────────────────────────
const _listeners = {};

function emit(event, detail) {
  (_listeners[event] || []).forEach(fn => {
    try { fn(detail); } catch (e) { console.error(`[presets-manager] listener error on "${event}":`, e); }
  });
}

export function on(event, fn) {
  if (!_listeners[event]) _listeners[event] = [];
  _listeners[event].push(fn);
  return () => off(event, fn);
}

export function off(event, fn) {
  if (_listeners[event]) _listeners[event] = _listeners[event].filter(f => f !== fn);
}

// ─── Storage Helpers ────────────────────────────────────────────────────────────
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    console.warn(`[presets-manager] Corrupt data at "${key}", resetting.`);
    localStorage.removeItem(key);
    return fallback;
  }
}

function writeJSON(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      console.error('[presets-manager] localStorage quota exceeded.');
      emit('error', { type: 'quota_exceeded', key });
    }
    return false;
  }
}

// ─── Validation ─────────────────────────────────────────────────────────────────
function validatePreset(toolId, name, settings) {
  if (!toolId || typeof toolId !== 'string') throw new Error('toolId must be a non-empty string');
  if (!name || typeof name !== 'string' || !name.trim()) throw new Error('Preset name cannot be empty');
  if (name.length > 80) throw new Error('Preset name too long (max 80 chars)');
  if (settings == null || typeof settings !== 'object') throw new Error('settings must be an object');
}

function validateWorkflow(workflow) {
  if (!workflow || typeof workflow !== 'object') throw new Error('Invalid workflow object');
  if (!workflow.name || !workflow.name.trim()) throw new Error('Workflow name cannot be empty');
  if (workflow.name.length > 100) throw new Error('Workflow name too long (max 100 chars)');
  if (!Array.isArray(workflow.steps)) throw new Error('Workflow steps must be an array');
  for (const step of workflow.steps) {
    if (!step.toolId || typeof step.toolId !== 'string') throw new Error('Each step must have a valid toolId');
  }
}

// ─── Presets ────────────────────────────────────────────────────────────────────

/**
 * Save or update a preset for a given tool.
 * Returns the saved preset object (with id, name, settings, updatedAt).
 * Emits 'preset:saved' event.
 */
export function savePreset(toolId, presetName, settings) {
  validatePreset(toolId, presetName, settings);
  const name = presetName.trim();
  const all = readJSON(STORAGE_KEY, {});
  if (!all[toolId]) all[toolId] = [];

  const existing = all[toolId].find(p => p.name === name);
  const now = Date.now();

  if (existing) {
    existing.settings = settings;
    existing.updatedAt = now;
    writeJSON(STORAGE_KEY, all);
    emit('preset:saved', { toolId, preset: existing, action: 'updated' });
    return existing;
  }

  if (all[toolId].length >= MAX_PRESETS_PER_TOOL) {
    throw new Error(`Maximum ${MAX_PRESETS_PER_TOOL} presets reached for tool "${toolId}"`);
  }

  const preset = { id: `${toolId}_${now}`, name, settings, createdAt: now, updatedAt: now };
  all[toolId].push(preset);
  writeJSON(STORAGE_KEY, all);
  emit('preset:saved', { toolId, preset, action: 'created' });
  return preset;
}

/**
 * Load a preset by toolId + presetId.
 * Returns the preset object, or null if not found.
 */
export function loadPreset(toolId, presetId) {
  if (!toolId || !presetId) return null;
  const all = readJSON(STORAGE_KEY, {});
  return all[toolId]?.find(p => p.id === presetId) ?? null;
}

/**
 * Get all presets for a tool, sorted by updatedAt descending.
 */
export function getAllPresets(toolId) {
  if (!toolId) return [];
  const all = readJSON(STORAGE_KEY, {});
  return [...(all[toolId] ?? [])].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}

/**
 * Get all presets across all tools.
 */
export function getAllPresetsMap() {
  return readJSON(STORAGE_KEY, {});
}

/**
 * Delete a preset. Returns true if deleted, false if not found.
 * Emits 'preset:deleted' event.
 */
export function deletePreset(toolId, presetId) {
  const all = readJSON(STORAGE_KEY, {});
  if (!all[toolId]) return false;
  const before = all[toolId].length;
  all[toolId] = all[toolId].filter(p => p.id !== presetId);
  if (all[toolId].length === before) return false;
  writeJSON(STORAGE_KEY, all);
  emit('preset:deleted', { toolId, presetId });
  return true;
}

/**
 * Rename a preset.
 * Returns updated preset, or null if not found.
 */
export function renamePreset(toolId, presetId, newName) {
  if (!newName?.trim()) throw new Error('New name cannot be empty');
  if (newName.length > 80) throw new Error('Name too long (max 80 chars)');
  const all = readJSON(STORAGE_KEY, {});
  const preset = all[toolId]?.find(p => p.id === presetId);
  if (!preset) return null;
  const isDuplicate = all[toolId].some(p => p.name === newName.trim() && p.id !== presetId);
  if (isDuplicate) throw new Error(`A preset named "${newName.trim()}" already exists`);
  preset.name = newName.trim();
  preset.updatedAt = Date.now();
  writeJSON(STORAGE_KEY, all);
  emit('preset:renamed', { toolId, presetId, newName: preset.name });
  return preset;
}

// ─── Workflows ──────────────────────────────────────────────────────────────────

/**
 * Save or update a workflow.
 * Mutates the workflow object to set/update its id and timestamps.
 * Returns the saved workflow.
 * Emits 'workflow:saved' event.
 */
export function saveWorkflow(workflow) {
  validateWorkflow(workflow);
  const all = readJSON(WORKFLOW_KEY, []);
  const now = Date.now();

  if (workflow.id) {
    const idx = all.findIndex(w => w.id === workflow.id);
    if (idx !== -1) {
      all[idx] = { ...workflow, updatedAt: now };
      writeJSON(WORKFLOW_KEY, all);
      emit('workflow:saved', { workflow: all[idx], action: 'updated' });
      return all[idx];
    }
  }

  if (all.length >= MAX_WORKFLOWS) throw new Error(`Maximum ${MAX_WORKFLOWS} workflows reached`);

  workflow.id = `wf_${now}_${Math.random().toString(36).slice(2, 7)}`;
  workflow.createdAt = now;
  workflow.updatedAt = now;
  all.push(workflow);
  writeJSON(WORKFLOW_KEY, all);
  emit('workflow:saved', { workflow, action: 'created' });
  return workflow;
}

/**
 * Get a single workflow by id.
 */
export function getWorkflow(id) {
  const all = readJSON(WORKFLOW_KEY, []);
  return all.find(w => w.id === id) ?? null;
}

/**
 * Get all workflows, sorted by updatedAt descending.
 */
export function getAllWorkflows() {
  return [...readJSON(WORKFLOW_KEY, [])].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}

/**
 * Delete a workflow by id. Returns true if deleted, false if not found.
 * Emits 'workflow:deleted' event.
 */
export function deleteWorkflow(id) {
  const all = readJSON(WORKFLOW_KEY, []);
  const filtered = all.filter(w => w.id !== id);
  if (filtered.length === all.length) return false;
  writeJSON(WORKFLOW_KEY, filtered);
  emit('workflow:deleted', { id });
  return true;
}

/**
 * Duplicate a workflow with a new name.
 */
export function duplicateWorkflow(id, newName) {
  const wf = getWorkflow(id);
  if (!wf) return null;
  const copy = {
    ...wf,
    id: null,
    name: newName ?? `${wf.name} (কপি)`,
    steps: wf.steps.map(s => ({ ...s })),
  };
  return saveWorkflow(copy);
}

// ─── Import / Export ────────────────────────────────────────────────────────────

/**
 * Export all presets and workflows as a JSON string.
 * Use this to let users download/share their configuration.
 */
export function exportAll() {
  return JSON.stringify(
    {
      version: 2,
      exportedAt: new Date().toISOString(),
      presets: readJSON(STORAGE_KEY, {}),
      workflows: readJSON(WORKFLOW_KEY, []),
    },
    null,
    2
  );
}

/**
 * Import presets and workflows from a JSON string produced by exportAll().
 * @param {string} jsonStr - The exported JSON string
 * @param {'replace'|'merge'} mode - 'replace' clears existing data; 'merge' adds/updates
 * Emits 'import:done' event with counts.
 */
export function importAll(jsonStr, mode = 'merge') {
  let data;
  try {
    data = JSON.parse(jsonStr);
  } catch {
    throw new Error('Invalid JSON format');
  }
  if (!data.presets && !data.workflows) throw new Error('No recognizable data found in import');

  let presetsImported = 0;
  let workflowsImported = 0;

  // Presets
  if (data.presets && typeof data.presets === 'object') {
    const current = mode === 'replace' ? {} : readJSON(STORAGE_KEY, {});
    for (const [toolId, list] of Object.entries(data.presets)) {
      if (!Array.isArray(list)) continue;
      if (!current[toolId]) current[toolId] = [];
      for (const preset of list) {
        if (!preset.id || !preset.name) continue;
        const exists = current[toolId].findIndex(p => p.id === preset.id);
        if (exists !== -1) { current[toolId][exists] = preset; }
        else { current[toolId].push(preset); presetsImported++; }
      }
    }
    writeJSON(STORAGE_KEY, current);
  }

  // Workflows
  if (Array.isArray(data.workflows)) {
    const current = mode === 'replace' ? [] : readJSON(WORKFLOW_KEY, []);
    for (const wf of data.workflows) {
      if (!wf.id || !wf.name) continue;
      const exists = current.findIndex(w => w.id === wf.id);
      if (exists !== -1) { current[exists] = wf; }
      else { current.push(wf); workflowsImported++; }
    }
    writeJSON(WORKFLOW_KEY, current);
  }

  emit('import:done', { presetsImported, workflowsImported, mode });
  return { presetsImported, workflowsImported };
}

/**
 * Clear all stored presets and workflows. Irreversible unless a backup was exported.
 * Emits 'storage:cleared' event.
 */
export function clearAll() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(WORKFLOW_KEY);
  emit('storage:cleared', {});
}

/**
 * Return total storage usage estimate in bytes.
 */
export function getStorageSize() {
  const p = localStorage.getItem(STORAGE_KEY) ?? '';
  const w = localStorage.getItem(WORKFLOW_KEY) ?? '';
  return new TextEncoder().encode(p + w).length;
}