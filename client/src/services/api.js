const API_BASE = '/api';

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchRecentCases() {
  const res = await fetch(`${API_BASE}/cases`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to fetch cases');
  return json.data || [];
}

export async function fetchCaseById(id) {
  const res = await fetch(`${API_BASE}/cases/${id}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to fetch case details');
  return json.data;
}

export async function createCase({ premise, difficulty = 'Medium', genre = 'Classic Noir' }) {
  const res = await fetch(`${API_BASE}/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ premise, difficulty, genre }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to generate new case');
  return json.data;
}

export async function discoverClue(caseId, clueId) {
  const res = await fetch(`${API_BASE}/cases/${caseId}/clues/${clueId}/discover`, {
    method: 'POST',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to uncover clue');
  return json;
}

export async function unlockHint(caseId) {
  const res = await fetch(`${API_BASE}/cases/${caseId}/hints`, {
    method: 'POST',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to unlock hint');
  return json;
}

export async function interrogateSuspect(caseId, suspectId, question) {
  const res = await fetch(`${API_BASE}/cases/${caseId}/interrogate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ suspectId, question }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to interrogate suspect');
  return json;
}

export async function submitAccusation(caseId, { suspectId, deductionNotes, detectiveName }) {
  const res = await fetch(`${API_BASE}/cases/${caseId}/accuse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ suspectId, deductionNotes, detectiveName }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to submit accusation');
  return json;
}

export async function fetchLeaderboard() {
  const res = await fetch(`${API_BASE}/leaderboard`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to load leaderboard');
  return json.data || [];
}
